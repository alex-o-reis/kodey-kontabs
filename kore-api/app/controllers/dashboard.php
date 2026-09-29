<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../services/BalanceService.php';
require_once __DIR__ . '/../services/DestinyService.php';

class Dashboard extends Controller
{
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

        // Todas as reservas ativas da organização
        $stmtAllRes = Model::query(
            "SELECT id, name, type, target_amount, current_amount, color 
             FROM reserves 
             WHERE organization_id = ? AND is_active = 1 
             ORDER BY id ASC",
            [$orgId]
        );
        $reservesList = [];
        $reserveData = null;
        $allRes = $stmtAllRes->fetchAll(PDO::FETCH_ASSOC);
        foreach ($allRes as $r) {
            $target = (float) $r['target_amount'];
            $current = (float) $r['current_amount'];
            $item = [
                'id' => (int) $r['id'],
                'name' => $r['name'],
                'type' => $r['type'],
                'target' => $target,
                'current' => $current,
                'color' => $r['color'] ?: '#0F7A4A',
                'percentage' => $target > 0 ? min(100, round(($current / $target) * 100)) : 0,
                'formatted' => 'R$ ' . number_format($current, 2, ',', '.') . ' / R$ ' . number_format($target, 2, ',', '.')
            ];
            $reservesList[] = $item;
            if (!$reserveData && $r['type'] === 'emergency') {
                $reserveData = $item;
            }
        }
        if (!$reserveData && count($reservesList) > 0) {
            $reserveData = $reservesList[0];
        }

        // Fluxo semanal do mês
        $weeklyFlow = BalanceService::getWeeklyFlow($orgId, $month);

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
                    'to_receive' => $monthlySummary['to_receive'],
                    'spent_so_far' => $monthlySummary['spent_so_far'],
                    'to_pay' => $monthlySummary['to_pay'],
                    'reserved_so_far' => $monthlySummary['reserved_so_far']
                ],
                'alerts' => [
                    'unallocated' => $unallocatedInfo,
                    'missing_origin' => $missingOriginInfo
                ],
                'reserve' => $reserveData,
                'reserves' => $reservesList,
                'weekly_flow' => $weeklyFlow,
                'upcoming_bills' => $upcomingBills
            ]
        ]);
    }
}
