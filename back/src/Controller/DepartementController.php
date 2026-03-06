<?php

namespace App\Controller;

use App\Repository\DepartementRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class DepartementController extends AbstractController
{
    #[Route('/departements', methods: ['GET'])]
    public function index(Request $request, DepartementRepository $departementRepository): JsonResponse
    {
        $regionCode = $request->query->get('region');

        if ($regionCode) {
            $departements = $departementRepository->findBy(['codeRegion' => $regionCode]);
        } else {
            $departements = $departementRepository->findAll();
        }

        $data = [];
        foreach ($departements as $dept) {
            $data[] = [
                'code' => $dept->getCode(),
                'nom' => $dept->getNom(),
                'region' => [
                    'code' => $dept->getCodeRegion()->getCode(),
                    'nom' => $dept->getCodeRegion()->getNom(),
                ],
            ];
        }

        return $this->json($data);
    }

    #[Route('/departements/{code}', methods: ['GET'])]
    public function show(string $code, DepartementRepository $departementRepository): JsonResponse
    {
        $dept = $departementRepository->find($code);

        if (!$dept) {
            return $this->json(['error' => 'Département non trouvé'], 404);
        }

        return $this->json([
            'code' => $dept->getCode(),
            'nom' => $dept->getNom(),
            'region' => [
                'code' => $dept->getCodeRegion()->getCode(),
                'nom' => $dept->getCodeRegion()->getNom(),
            ],
        ]);
    }
}