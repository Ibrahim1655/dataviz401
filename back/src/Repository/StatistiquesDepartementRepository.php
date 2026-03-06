<?php


namespace App\Repository;


use App\Entity\StatistiquesDepartement;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;


class StatistiquesDepartementRepository extends ServiceEntityRepository
{
   public function __construct(ManagerRegistry $registry)
   {
       parent::__construct($registry, StatistiquesDepartement::class);
   }
}


