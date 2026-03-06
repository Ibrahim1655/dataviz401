<?php

namespace App\Controller;

use App\Repository\StatistiquesDepartementRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class StatistiquesController extends AbstractController
{
    private function formatStatistique($stat): array
    {
        return [
            'id' => $stat->getId(),
            'anneePublication' => $stat->getAnneePublication(),
            'departement' => [
                'code' => $stat->getDepartement()->getCode(),
                'nom' => $stat->getDepartement()->getNom(),
                'region' => [
                    'code' => $stat->getDepartement()->getCodeRegion()->getCode(),
                    'nom' => $stat->getDepartement()->getCodeRegion()->getNom(),
                ],
            ],
            'nombreHabitants' => $stat->getNombreHabitants(),
            'densitePopulation' => $stat->getDensitePopulation() ? (float) $stat->getDensitePopulation() : null,
            'variationPopulation10Ans' => $stat->getVariationPopulation10Ans() ? (float) $stat->getVariationPopulation10Ans() : null,
            'contributionSoldeNaturel' => $stat->getContributionSoldeNaturel() ? (float) $stat->getContributionSoldeNaturel() : null,
            'contributionSoldeMigratoire' => $stat->getContributionSoldeMigratoire() ? (float) $stat->getContributionSoldeMigratoire() : null,
            'pourcentageMoins20Ans' => $stat->getPourcentageMoins20Ans() ? (float) $stat->getPourcentageMoins20Ans() : null,
            'pourcentagePlus60Ans' => $stat->getPourcentagePlus60Ans() ? (float) $stat->getPourcentagePlus60Ans() : null,
            'tauxChomageT4' => $stat->getTauxChomageT4() ? (float) $stat->getTauxChomageT4() : null,
            'tauxPauvrete' => $stat->getTauxPauvrete() ? (float) $stat->getTauxPauvrete() : null,
            'nombreLogements' => $stat->getNombreLogements(),
            'nombreResidencesPrincipales' => $stat->getNombreResidencesPrincipales(),
            'tauxLogementsSociaux' => $stat->getTauxLogementsSociaux() ? (float) $stat->getTauxLogementsSociaux() : null,
            'tauxLogementsVacants' => $stat->getTauxLogementsVacants() ? (float) $stat->getTauxLogementsVacants() : null,
        ];
    }

    // GET /api/statistiques — toutes les stats (filtrable par ?annee=, ?region=, ?departement=)
    #[Route('/statistiques', methods: ['GET'])]
    public function index(Request $request, StatistiquesDepartementRepository $repo): JsonResponse
    {
        $qb = $repo->createQueryBuilder('s')
            ->join('s.departement', 'd')
            ->join('d.codeRegion', 'r');

        if ($annee = $request->query->get('annee')) {
            $qb->andWhere('s.anneePublication = :annee')->setParameter('annee', $annee);
        }

        if ($region = $request->query->get('region')) {
            $qb->andWhere('r.code = :region')->setParameter('region', $region);
        }

        if ($departement = $request->query->get('departement')) {
            $qb->andWhere('d.code = :departement')->setParameter('departement', $departement);
        }

        $stats = $qb->orderBy('s.anneePublication', 'DESC')
            ->addOrderBy('d.nom', 'ASC')
            ->getQuery()
            ->getResult();

        $data = array_map(fn($s) => $this->formatStatistique($s), $stats);

        return $this->json($data);
    }

    // GET /api/statistiques/{id} — une stat précise
    #[Route('/statistiques/{id}', methods: ['GET'])]
    public function show(int $id, StatistiquesDepartementRepository $repo): JsonResponse
    {
        $stat = $repo->find($id);

        if (!$stat) {
            return $this->json(['error' => 'Statistique non trouvée'], 404);
        }

        return $this->json($this->formatStatistique($stat));
    }

    // GET /api/statistiques/annees — liste des années disponibles
    #[Route('/statistiques/annees', methods: ['GET'], priority: 1)]
    public function annees(StatistiquesDepartementRepository $repo): JsonResponse
    {
        $annees = $repo->createQueryBuilder('s')
            ->select('DISTINCT s.anneePublication')
            ->orderBy('s.anneePublication', 'DESC')
            ->getQuery()
            ->getSingleColumnResult();

        return $this->json($annees);
    }

    // GET /api/statistiques/region/{codeRegion} — stats agrégées par région
    #[Route('/statistiques/region/{codeRegion}', methods: ['GET'])]
    public function byRegion(string $codeRegion, Request $request, StatistiquesDepartementRepository $repo): JsonResponse
    {
        $qb = $repo->createQueryBuilder('s')
            ->join('s.departement', 'd')
            ->join('d.codeRegion', 'r')
            ->where('r.code = :region')
            ->setParameter('region', $codeRegion);

        if ($annee = $request->query->get('annee')) {
            $qb->andWhere('s.anneePublication = :annee')->setParameter('annee', $annee);
        }

        $stats = $qb->orderBy('d.nom', 'ASC')->getQuery()->getResult();

        $data = array_map(fn($s) => $this->formatStatistique($s), $stats);

        return $this->json($data);
    }
}