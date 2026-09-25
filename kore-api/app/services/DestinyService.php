<?php

require_once __DIR__ . '/../../kore/Model.php';
require_once __DIR__ . '/BalanceService.php';

class DestinyService
{
    /**
     * Calcula o "Dinheiro Sem Destino" para o mês atual.
     * Saldo que foi recebido, não foi consumido por despesas e nem direcionado para metas/reservas.
     */
    public static function getUnallocatedBalance(int $organizationId, string $month): array
    {
        $summary = BalanceService::getMonthlySummary($organizationId, $month);

        // Saldo livre no mês = Receitas Efetivadas - Despesas Efetivadas - Reservas Aportadas
        $unallocated = $summary['received_so_far'] - $summary['spent_so_far'] - $summary['reserved_so_far'];
        if ($unallocated < 0) {
            $unallocated = 0.0;
        }

        return [
            'has_unallocated' => $unallocated > 0,
            'unallocated_amount' => round($unallocated, 2),
            'formatted_amount' => 'R$ ' . number_format($unallocated, 2, ',', '.'),
            'message' => $unallocated > 0 
                ? "Você possui R$ " . number_format($unallocated, 2, ',', '.') . " ainda sem destino este mês." 
                : "Todo o seu dinheiro recebido este mês já possui um destino planejado."
        ];
    }

    /**
     * Busca transações cujo gasto não tem origem declarada ("Dinheiro Sem Origem").
     */
    public static function getMissingOriginInfo(int $organizationId, string $month): array
    {
        $startDate = $month . '-01';
        $endDate = date('Y-m-t', strtotime($startDate));

        $stmt = Model::query(
            "SELECT id, description, COALESCE(amount_effective, amount_expected) as amount, due_date, payment_date
             FROM transactions 
             WHERE organization_id = ? AND has_origin = 0 
             AND competence_date BETWEEN ? AND ?",
            [$organizationId, $startDate, $endDate]
        );
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $totalMissing = 0.0;
        foreach ($transactions as $t) {
            $totalMissing += (float) $t['amount'];
        }

        return [
            'has_missing_origin' => count($transactions) > 0,
            'count' => count($transactions),
            'total_amount' => round($totalMissing, 2),
            'formatted_amount' => 'R$ ' . number_format($totalMissing, 2, ',', '.'),
            'transactions' => $transactions,
            'message' => count($transactions) > 0
                ? "Existem R$ " . number_format($totalMissing, 2, ',', '.') . " utilizados cuja origem ainda não foi informada."
                : "Todas as suas movimentações possuem origem identificada."
        ];
    }
}
