<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../services/BalanceService.php';
require_once __DIR__ . '/../services/DestinyService.php';

class Dashboard extends Controller
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

    public function get()
    {
        $orgId = $this->getActiveOrgId();
        $month = $_GET['month'] ?? date('Y-m');

        // Saldo disponível em contas
        $availableBalance = BalanceService::getAvailableBalance($orgId);

        // Resumo do mês
        $monthlySummary = BalanceService::getMonthlySummary($orgId, $month);

        // Dinheiro sem destino
        $unallocatedInfo = DestinyService::getUnallocatedBalance($orgId, $month);

        // Dinheiro sem origem
        $missingOriginInfo = DestinyService::getMissingOriginInfo($orgId, $month);

        // Reserva de emergência principal
        $stmt = Model::query(
            "SELECT id, name, target_amount, current_amount 
             FROM reserves 
             WHERE organization_id = ? AND type = 'emergency' LIMIT 1",
            [$orgId]
        );
        $reserve = $stmt->fetch(PDO::FETCH_ASSOC);
        $reserveData = null;
        if ($reserve) {
            $target = (float) $reserve['target_amount'];
            $current = (float) $reserve['current_amount'];
            $reserveData = [
                'name' => $reserve['name'],
                'target' => $target,
                'current' => $current,
                'percentage' => $target > 0 ? round(($current / $target) * 100) : 0,
                'formatted' => 'R$ ' . number_format($current, 2, ',', '.') . ' / R$ ' . number_format($target, 2, ',', '.')
            ];
        }

        // Próximos 5 vencimentos
        $stmt = Model::query(
            "SELECT t.id, t.description, t.amount_expected, t.due_date, c.name as category_name
             FROM transactions t
             LEFT JOIN categories c ON c.id = t.category_id
             WHERE t.organization_id = ? AND t.type = 'expense' AND t.status = 'expected'
             ORDER BY t.due_date ASC LIMIT 5",
            [$orgId]
        );
        $upcomingBills = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $this->json([
            'data' => [
                'organization_id' => $orgId,
                'month' => $month,
                'kpis' => [
                    'available_balance' => $availableBalance,
                    'committed_balance' => $monthlySummary['spent_so_far'] + $monthlySummary['to_pay'],
                    'unallocated_balance' => $unallocatedInfo['unallocated_amount'],
                    'projected_closing' => $monthlySummary['projected_closing'],
                    'received_so_far' => $monthlySummary['received_so_far'],
                    'spent_so_far' => $monthlySummary['spent_so_far'],
                    'reserved_so_far' => $monthlySummary['reserved_so_far']
                ],
                'alerts' => [
                    'unallocated' => $unallocatedInfo,
                    'missing_origin' => $missingOriginInfo
                ],
                'reserve' => $reserveData,
                'upcoming_bills' => $upcomingBills
            ]
        ]);
    }
}
