<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../services/CheckupService.php';

class Checkup extends Controller
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
        $data = CheckupService::getCheckupData($orgId);
        return $this->json(['data' => $data]);
    }

    public function post_complete()
    {
        $orgId = $this->getActiveOrgId();
        $body = $this->request->getJson();

        $unallocated = (float) ($body['unallocated_balance'] ?? 0.0);
        $billsDueCount = (int) ($body['bills_due_count'] ?? 0);
        $overBudgetCount = (int) ($body['over_budget_categories_count'] ?? 0);
        $reservesOnTrack = (int) ($body['reserves_on_track_count'] ?? 1);
        $notes = $body['notes'] ?? 'Check-up semanal concluído com sucesso.';

        Model::query(
            "INSERT INTO checkups (organization_id, user_id, unallocated_balance, bills_due_count, over_budget_categories_count, reserves_on_track_count, notes)
             VALUES (?, 1, ?, ?, ?, ?, ?)",
            [$orgId, $unallocated, $billsDueCount, $overBudgetCount, $reservesOnTrack, $notes]
        );
        $id = (int) Model::getPdo()->lastInsertId();

        return $this->json([
            'message' => 'Parabéns! Check-up semanal concluído com sucesso.',
            'checkup_id' => $id,
            'completed_at' => date('Y-m-d H:i:s')
        ]);
    }
}
