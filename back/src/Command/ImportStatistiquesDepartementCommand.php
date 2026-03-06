<?php


namespace App\Command;


use App\Entity\Departement;
use App\Entity\StatistiquesDepartement;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;


#[AsCommand(
   name: 'app:import:stats-departement',
   description: 'Import des statistiques département depuis un CSV'
)]
class ImportStatistiquesDepartementCommand extends Command
{
   public function __construct(private EntityManagerInterface $em)
   {
       parent::__construct();
   }


   protected function configure(): void
   {
       $this
           ->setDescription('Import des statistiques département depuis un CSV')
           ->addArgument('file', InputArgument::REQUIRED, 'Chemin du fichier CSV');
   }


   protected function execute(InputInterface $input, OutputInterface $output): int
   {
       $filePath = $input->getArgument('file');


       if (!file_exists($filePath)) {
           $output->writeln('<error>Fichier introuvable</error>');
           return Command::FAILURE;
       }


       $handle = fopen($filePath, 'r');
       $header = fgetcsv($handle, 0, ',');


       $batchSize = 50;
       $i = 0;


       while (($row = fgetcsv($handle, 0, ',')) !== false) {


           $data = array_combine($header, $row);


           $code = $this->formatCodeDepartement($data['code_departement']);


           $departement = $this->em
               ->getRepository(Departement::class)
               ->find($code);


           if (!$departement) {
               dump($data['code_departement']);exit;
               $output->writeln("Département absent : " . $data['code_departement']);
               continue;
           }


           // Vérifie si déjà existant (unique constraint)
           $existing = $this->em
               ->getRepository(StatistiquesDepartement::class)
               ->findOneBy([
                   'departement' => $departement,
                   'anneePublication' => (int)$data['année_publication']
               ]);


           if ($existing) {
               continue;
           }


           $stat = new StatistiquesDepartement();
           $stat->setDepartement($departement);
           $stat->setAnneePublication((int)$data['année_publication']);
           $stat->setNombreHabitants($this->int($data["Nombre  d'habitants"]));
           $stat->setDensitePopulation($this->decimal($data["Densité de population au km²"]));
           $stat->setVariationPopulation10Ans($this->decimal($data["Variation de la population sur 10 ans (en %)"]));
           $stat->setContributionSoldeNaturel($this->decimal($data["Dont contribution du solde naturel (en %)"]));
           $stat->setContributionSoldeMigratoire($this->decimal($data["Dont contribution du solde migratoire (en %)"]));
           $stat->setPourcentageMoins20Ans($this->decimal($data["% population de moins de 20 ans"]));
           $stat->setPourcentagePlus60Ans($this->decimal($data["% population de 60 ans et plus"]));
           $stat->setTauxChomageT4($this->decimal($data["Taux de chômage au T4 (en %)"]));
           $stat->setTauxPauvrete($this->decimal($data["Taux de pauvreté* (en %)"]));
           $stat->setNombreLogements($this->int($data["Nombre de logements"]));
           $stat->setNombreResidencesPrincipales($this->int($data["Nombre de résidences principales"]));
           $stat->setTauxLogementsSociaux($this->decimal($data["Taux de logements sociaux* (en %)"]));
           $stat->setTauxLogementsVacants($this->decimal($data["Taux de logements vacants* (en %)"]));
           $stat->setTauxLogementsIndividuels($this->decimal($data["Taux de logements individuels (en %)"]));
           $stat->setMoyenneAnnuelleConstructionNeuve10Ans($this->int($data["Moyenne annuelle de la construction neuve sur 10 ans"]));
           $stat->setConstruction($this->decimal($data["Construction"]));
           $stat->setParcSocialNombreLogements($this->int($data["Parc social - Nombre de logements"]));
           $stat->setParcSocialLogementsMisLocation($this->int($data["Parc social - Logements mis en location*"]));
           $stat->setParcSocialLogementsDemolis($this->int($data["Parc social - Logements démolis"]));
           $stat->setParcSocialVentesPersonnesPhysiques($this->int($data["Parc social - Ventes à des personnes physiques"]));
           $stat->setParcSocialTauxLogementsVacants($this->decimal($data["Parc social - Taux de logements vacants* (en %)"]));
           $stat->setParcSocialTauxLogementsIndividuels($this->decimal($data["Parc social - Taux de logements individuels (en %)"]));
           $stat->setParcSocialLoyerMoyen($this->decimal($data["Parc social - Loyer moyen (en €/m²/mois)*"]));
           $stat->setParcSocialAgeMoyen($this->decimal($data["Parc social - Âge moyen du parc  (en années)"]));
           $stat->setParcSocialTauxLogementsEnergivores($this->decimal($data["Parc social - Taux de logements énergivores (E,F,G)* (en %)"]));


           $this->em->persist($stat);


           if (($i % $batchSize) === 0) {
               $this->em->flush();
               $this->em->clear();
           }


           $i++;
       }


       $this->em->flush();
       fclose($handle);


       $output->writeln("<info>Import terminé : $i lignes</info>");


       return Command::SUCCESS;
   }


   private function decimal($value): ?string
   {
       if ($value === null || $value === '') {
           return null;
       }
       return number_format((float)$value, 2, '.', '');
   }


   private function int($value): ?int
   {
       if ($value === null || $value === '') {
           return null;
       }
       return (int)$value;
   }


   private function formatCodeDepartement(string $code): string
   {
       $code = trim($code);


       // Corse déjà OK (2A / 2B)
       if (in_array($code, ['2A', '2B'])) {
           return $code;
       }


       // DOM 3 chiffres (971, 972, etc.)
       if (strlen($code) === 3) {
           return $code;
       }


       // Départements métropole → padding à 2 chiffres
       return str_pad($code, 2, '0', STR_PAD_LEFT);
   }
}
