<?php

require_once __DIR__ . '/../../kore/Model.php';

/**
 * ForecastService — Motor de Projeção Financeira e Fluxo de Caixa Futuro
 * Powered by Kore Framework (KKF)
 * 
 * Princípio: Todo dinheiro deve ter uma origem e um destino.
 * O sistema prevê o saldo futuro dia a dia para antecipar quedas de caixa e proteger o usuário.
 */
class ForecastService
{
    /**
     * Calcula a projeção do fluxo de caixa para a organização ativa
     * 
     * @param int $orgId
     * @param string $period '7d' | '15d' | '30d' | '90d' | '12m'
     * @return array
     */
    public function calculateForecast(int $orgId, string $period = '30d'): array
    {
        $days = match ($period) {
            '7d' => 7,
            '15d' => 15,
            '60d' => 60,
            '90d' => 90,
            '12m' => 365,
            default => 30
        };

        $startDate = date('Y-m-d');
        $endDate = date('Y-m-d', strtotime("+$days days"));

        // 1. Saldo Inicial Líquido Consolidado (Contas Correntes e Caixa)
        $stmtBalance = Model::query(
            "SELECT COALESCE(SUM(current_balance), 0) AS total 
             FROM accounts 
             WHERE organization_id = ? AND is_active = 1 AND type IN ('checking', 'cash')",
            [$orgId]
        );
        $currentLiquidBalance = (float) $stmtBalance->fetch(PDO::FETCH_ASSOC)['total'];

        // Saldo disponível em Reservas (para sugestão de cobertura de déficits)
        $stmtReserves = Model::query(
            "SELECT COALESCE(SUM(current_amount), 0) AS total 
             FROM reserves 
             WHERE organization_id = ? AND is_active = 1",
            [$orgId]
        );
        $availableReserveBalance = (float) $stmtReserves->fetch(PDO::FETCH_ASSOC)['total'];

        // 2. Buscar movimentações previstas dentro do intervalo
        $stmtTx = Model::query(
            "SELECT t.*, c.name AS category_name, a.name AS account_name
             FROM transactions t
             LEFT JOIN categories c ON t.category_id = c.id
             LEFT JOIN accounts a ON t.account_id = a.id
             WHERE t.organization_id = ? 
               AND t.due_date >= ? 
               AND t.due_date <= ?
               AND (t.status = 'expected' OR (t.status = 'effective' AND t.due_date = ?))
             ORDER BY t.due_date ASC, t.id ASC",
            [$orgId, $startDate, $endDate, $startDate]
        );
        $transactions = $stmtTx->fetchAll(PDO::FETCH_ASSOC);

        // Agrupar movimentações por data de vencimento
        $txByDate = [];
        $totalProjectedIncome = 0.0;
        $totalProjectedExpense = 0.0;
        $keyEvents = [];

        foreach ($transactions as $tx) {
            $date = $tx['due_date'];
            if (!isset($txByDate[$date])) {
                $txByDate[$date] = [
                    'income' => 0.0,
                    'expense' => 0.0,
                    'items' => []
                ];
            }

            $amount = (float) ($tx['status'] === 'effective' && $tx['amount_effective'] !== null 
                ? $tx['amount_effective'] 
                : $tx['amount_expected']);

            if ($tx['type'] === 'income') {
                $txByDate[$date]['income'] += $amount;
                $totalProjectedIncome += $amount;
            } elseif ($tx['type'] === 'expense' || $tx['type'] === 'reserve_deposit') {
                $txByDate[$date]['expense'] += $amount;
                $totalProjectedExpense += $amount;
            }

            $txByDate[$date]['items'][] = [
                'id' => (int) $tx['id'],
                'type' => $tx['type'],
                'description' => $tx['description'],
                'amount' => $amount,
                'category' => $tx['category_name'] ?? 'Geral'
            ];

            // Rastrear eventos relevantes (>= R$ 200)
            if ($amount >= 200.0) {
                $keyEvents[] = [
                    'date' => $date,
                    'type' => $tx['type'],
                    'description' => $tx['description'],
                    'amount' => $amount,
                    'category' => $tx['category_name'] ?? 'Geral'
                ];
            }
        }

        // 3. Projeção Dia a Dia (Construção da Série Temporal)
        $runningBalance = $currentLiquidBalance;
        $dailySeries = [];
        $minProjectedBalance = $runningBalance;
        $minProjectedDate = $startDate;

        $hasRisk = false;
        $riskEvent = null;

        // Intervalo de amostragem no gráfico: para 12m, amostra a cada 7 ou 15 dias; para <=90d, amostra diária
        $stepDays = ($days > 90) ? 7 : 1;

        $curTime = strtotime($startDate);
        $endTime = strtotime($endDate);

        while ($curTime <= $endTime) {
            $dateStr = date('Y-m-d', $curTime);
            $dayIncome = 0.0;
            $dayExpense = 0.0;
            $dayItems = [];

            // Acumular movimentações do período amostrado
            for ($s = 0; $s < $stepDays; $s++) {
                $checkDate = date('Y-m-d', strtotime("+$s days", $curTime));
                if (isset($txByDate[$checkDate])) {
                    $dayIncome += $txByDate[$checkDate]['income'];
                    $dayExpense += $txByDate[$checkDate]['expense'];
                    $dayItems = array_merge($dayItems, $txByDate[$checkDate]['items']);
                }
            }

            $runningBalance += ($dayIncome - $dayExpense);

            // Rastrear menor saldo
            if ($runningBalance < $minProjectedBalance) {
                $minProjectedBalance = $runningBalance;
                $minProjectedDate = $dateStr;
            }

            // Rastrear risco de saldo negativo
            if ($runningBalance < 0 && !$hasRisk) {
                $hasRisk = true;
                $daysUntil = max(0, (int) round(($curTime - strtotime($startDate)) / 86400));
                $riskEvent = [
                    'date' => $dateStr,
                    'formatted_date' => date('d/m/Y', $curTime),
                    'deficit_amount' => abs($runningBalance),
                    'days_until' => $daysUntil,
                    'reserve_available' => $availableReserveBalance,
                    'can_cover_with_reserve' => ($availableReserveBalance >= abs($runningBalance)),
                    'message' => "Atenção: previsão de saldo negativo em " . date('d/m/Y', $curTime) . " no valor de R$ " . number_format(abs($runningBalance), 2, ',', '.') . "."
                ];
            }

            $dailySeries[] = [
                'date' => $dateStr,
                'label' => date('d/m', $curTime),
                'balance' => round($runningBalance, 2),
                'income' => round($dayIncome, 2),
                'expense' => round($dayExpense, 2),
                'items_count' => count($dayItems)
            ];

            $curTime = strtotime("+$stepDays days", $curTime);
        }

        // Ordenar keyEvents por data
        usort($keyEvents, fn($a, $b) => strcmp($a['date'], $b['date']));

        return [
            'period' => $period,
            'days' => $days,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'current_liquid_balance' => round($currentLiquidBalance, 2),
            'projected_final_balance' => round($runningBalance, 2),
            'min_projected_balance' => round($minProjectedBalance, 2),
            'min_projected_date' => $minProjectedDate,
            'min_projected_date_formatted' => date('d/m/Y', strtotime($minProjectedDate)),
            'total_projected_income' => round($totalProjectedIncome, 2),
            'total_projected_expense' => round($totalProjectedExpense, 2),
            'net_change' => round($runningBalance - $currentLiquidBalance, 2),
            'available_reserve_balance' => round($availableReserveBalance, 2),
            'has_risk' => $hasRisk,
            'risk_event' => $riskEvent,
            'key_events' => array_slice($keyEvents, 0, 8),
            'daily_series' => $dailySeries
        ];
    }
}
