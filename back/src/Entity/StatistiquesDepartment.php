<?php

namespace App\Entity;

use App\Repository\StatistiquesDepartementRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: StatistiquesDepartementRepository::class)]
#[ORM\Table(
    name: "statistiques_departement",
    uniqueConstraints: [
        new ORM\UniqueConstraint(
            name: "unique_departement_annee",
            columns: ["code_departement", "annee_publication"]
        )
    ]
)]
class StatistiquesDepartement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: "smallint")]
    private ?int $anneePublication = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(
        name: "code_departement",
        referencedColumnName: "code",
        nullable: false,
        onDelete: "CASCADE"
    )]
    private ?Departement $departement = null;

    #[ORM\Column(nullable: true)]
    private ?int $nombreHabitants = null;

    #[ORM\Column(type: "decimal", precision: 10, scale: 2, nullable: true)]
    private ?string $densitePopulation = null;

    #[ORM\Column(name: "variation_population_10_ans", type: "decimal", precision: 6, scale: 2, nullable: true)]
    private ?string $variationPopulation10Ans = null;

    #[ORM\Column(type: "decimal", precision: 6, scale: 2, nullable: true)]
    private ?string $contributionSoldeNaturel = null;

    #[ORM\Column(type: "decimal", precision: 6, scale: 2, nullable: true)]
    private ?string $contributionSoldeMigratoire = null;

    #[ORM\Column(name: "pourcentage_moins_20_ans", type: "decimal", precision: 5, scale: 2, nullable: true)]
    private ?string $pourcentageMoins20Ans = null;

    #[ORM\Column(name: "pourcentage_plus_60_ans", type: "decimal", precision: 5, scale: 2, nullable: true)]
    private ?string $pourcentagePlus60Ans = null;

    #[ORM\Column(type: "decimal", precision: 5, scale: 2, nullable: true)]
    private ?string $tauxChomageT4 = null;

    #[ORM\Column(type: "decimal", precision: 5, scale: 2, nullable: true)]
    private ?string $tauxPauvrete = null;

    #[ORM\Column(nullable: true)]
    private ?int $nombreLogements = null;

    #[ORM\Column(nullable: true)]
    private ?int $nombreResidencesPrincipales = null;

    #[ORM\Column(type: "decimal", precision: 5, scale: 2, nullable: true)]
    private ?string $tauxLogementsSociaux = null;

    #[ORM\Column(type: "decimal", precision: 5, scale: 2, nullable: true)]
    private ?string $tauxLogementsVacants = null;

    // === GETTERS / SETTERS (uniquement pour les 15 propriétés ci-dessus) ===

    public function getId(): ?int { return $this->id; }

    public function getAnneePublication(): ?int { return $this->anneePublication; }
    public function setAnneePublication(int $anneePublication): static { $this->anneePublication = $anneePublication; return $this; }

    public function getDepartement(): ?Departement { return $this->departement; }
    public function setDepartement(?Departement $departement): static { $this->departement = $departement; return $this; }

    public function getNombreHabitants(): ?int { return $this->nombreHabitants; }
    public function setNombreHabitants(?int $nombreHabitants): static { $this->nombreHabitants = $nombreHabitants; return $this; }

    public function getDensitePopulation(): ?string { return $this->densitePopulation; }
    public function setDensitePopulation(?string $densitePopulation): static { $this->densitePopulation = $densitePopulation; return $this; }

    public function getVariationPopulation10Ans(): ?string { return $this->variationPopulation10Ans; }
    public function setVariationPopulation10Ans(?string $v): static { $this->variationPopulation10Ans = $v; return $this; }

    public function getContributionSoldeNaturel(): ?string { return $this->contributionSoldeNaturel; }
    public function setContributionSoldeNaturel(?string $v): static { $this->contributionSoldeNaturel = $v; return $this; }

    public function getContributionSoldeMigratoire(): ?string { return $this->contributionSoldeMigratoire; }
    public function setContributionSoldeMigratoire(?string $v): static { $this->contributionSoldeMigratoire = $v; return $this; }

    public function getPourcentageMoins20Ans(): ?string { return $this->pourcentageMoins20Ans; }
    public function setPourcentageMoins20Ans(?string $v): static { $this->pourcentageMoins20Ans = $v; return $this; }

    public function getPourcentagePlus60Ans(): ?string { return $this->pourcentagePlus60Ans; }
    public function setPourcentagePlus60Ans(?string $v): static { $this->pourcentagePlus60Ans = $v; return $this; }

    public function getTauxChomageT4(): ?string { return $this->tauxChomageT4; }
    public function setTauxChomageT4(?string $v): static { $this->tauxChomageT4 = $v; return $this; }

    public function getTauxPauvrete(): ?string { return $this->tauxPauvrete; }
    public function setTauxPauvrete(?string $v): static { $this->tauxPauvrete = $v; return $this; }

    public function getNombreLogements(): ?int { return $this->nombreLogements; }
    public function setNombreLogements(?int $v): static { $this->nombreLogements = $v; return $this; }

    public function getNombreResidencesPrincipales(): ?int { return $this->nombreResidencesPrincipales; }
    public function setNombreResidencesPrincipales(?int $v): static { $this->nombreResidencesPrincipales = $v; return $this; }

    public function getTauxLogementsSociaux(): ?string { return $this->tauxLogementsSociaux; }
    public function setTauxLogementsSociaux(?string $v): static { $this->tauxLogementsSociaux = $v; return $this; }

    public function getTauxLogementsVacants(): ?string { return $this->tauxLogementsVacants; }
    public function setTauxLogementsVacants(?string $v): static { $this->tauxLogementsVacants = $v; return $this; }
}