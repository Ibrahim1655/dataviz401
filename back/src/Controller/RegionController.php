<?php

namespace App\Controller;

use App\Repository\RegionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;

class RegionController extends AbstractController
{
    public function index(RegionRepository $regionRepository): JsonResponse
    {
        $regions = $regionRepository->findAll();
        $data = [];

        foreach ($regions as $region) {
            $data[] = [
                'code' => $region->getCode(),
                'nom' => $region->getNom(),
            ];
        }

        return $this->json($data);
    }

    public function show(string $code, RegionRepository $regionRepository): JsonResponse
    {
        $region = $regionRepository->find($code);

        if (!$region) {
            return $this->json(['error' => 'Région non trouvée'], 404);
        }

        $departements = [];
        foreach ($region->getDepartements() as $dept) {
            $departements[] = [
                'code' => $dept->getCode(),
                'nom' => $dept->getNom(),
            ];
        }

        return $this->json([
            'code' => $region->getCode(),
            'nom' => $region->getNom(),
            'departements' => $departements,
        ]);
    }
}