<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../services/ReportService.php';

class Reports extends Controller
{
    public function get()
    {
        $orgId = $this->getActiveOrgId();
        $month = $_GET['month'] ?? date('Y-m');

        $dre = ReportService::getDre($orgId, $month);
        $cashflow = ReportService::getCashFlow($orgId, $month);

        return $this->json([
            'data' => [
                'dre' => $dre,
                'cashflow' => $cashflow
            ]
        ]);
    }

    /**
     * GET /reports/dre
     */
    public function get_dre()
    {
        $orgId = $this->getActiveOrgId();
        $month = $_GET['month'] ?? date('Y-m');
        $dre = ReportService::getDre($orgId, $month);
        return $this->json(['data' => $dre]);
    }

    /**
     * GET /reports/cashflow
     */
    public function get_cashflow()
    {
        $orgId = $this->getActiveOrgId();
        $month = $_GET['month'] ?? date('Y-m');
        $cashflow = ReportService::getCashFlow($orgId, $month);
        return $this->json(['data' => $cashflow]);
    }
}
