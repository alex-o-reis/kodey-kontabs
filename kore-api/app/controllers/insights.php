<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../services/InsightService.php';

/**
 * Insights Controller — Inteligência Financeira e Detecção Proativa de Padrões
 * Powered by Kore Framework (KKF)
 */
class Insights extends Controller
{
    protected function getActiveOrgId(): int
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        if (!empty($headers['X-Organization-Id'])) {
            return (int) $headers['X-Organization-Id'];
        }
        if (!empty($_GET['org_id'])) {
            return (int) $_GET['org_id'];
        }
        return 1;
    }

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
