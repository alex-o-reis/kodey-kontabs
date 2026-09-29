<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../services/ForecastService.php';

/**
 * Forecast Controller — Endpoint de Projeção Financeira e Fluxo de Caixa Futuro
 * Powered by Kore Framework (KKF)
 */
class Forecast extends Controller
{
    /**
     * GET /forecast
     * Parâmetros: ?period=7d|15d|30d|60d|90d|12m
     */
    public function get()
    {
        $orgId = $this->getActiveOrgId();
        $period = $_GET['period'] ?? '30d';

        $service = new ForecastService();
        $data = $service->calculateForecast($orgId, $period);

        return $this->json([
            'status' => 'success',
            'data' => $data
        ]);
    }
}
