<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../services/InsightService.php';

/**
 * Insights Controller — Inteligência Financeira e Detecção Proativa de Padrões
 * Powered by Kore Framework (KKF)
 */
class Insights extends Controller
{
    /**
     * GET /insights
     * Retorna diagnósticos de duplicidades, assinaturas, anomalias e vitórias da semana.
     */
    public function get()
    {
        $orgId = $this->getActiveOrgId();

        $service = new InsightService();
        $data = $service->getInsights($orgId);

        return $this->json([
            'status' => 'success',
            'data' => $data
        ]);
    }
}
