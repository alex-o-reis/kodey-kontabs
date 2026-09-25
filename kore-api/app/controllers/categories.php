<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../models/Category.php';

class Categories extends Controller
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

    public function get($id = null)
    {
        $orgId = $this->getActiveOrgId();

        if ($id) {
            $stmt = Model::query("SELECT * FROM categories WHERE id = ? AND organization_id = ?", [$id, $orgId]);
            $category = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$category) {
                return $this->error("Categoria não encontrada.", 404);
            }
            return $this->json(['data' => $category]);
        }

        $type = $_GET['type'] ?? null;
        $sql = "SELECT * FROM categories WHERE organization_id = ? AND is_active = 1";
        $params = [$orgId];

        if ($type) {
            $sql .= " AND type = ?";
            $params[] = $type;
        }

        $sql .= " ORDER BY type ASC, name ASC";
        $stmt = Model::query($sql, $params);
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $this->json(['data' => $categories]);
    }

    public function post()
    {
        $orgId = $this->getActiveOrgId();
        $body = $this->request->getJson();

        $name = trim($body['name'] ?? '');
        $type = $body['type'] ?? 'expense';
        $budget = (float) ($body['monthly_budget'] ?? 0.0);
        $parentId = !empty($body['parent_id']) ? (int) $body['parent_id'] : null;
        $icon = $body['icon'] ?? 'bi-tag';
        $color = $body['color'] ?? '#0F7A4A';

        if (empty($name)) {
            return $this->error("O nome da categoria é obrigatório.", 422);
        }

        Model::query(
            "INSERT INTO categories (organization_id, parent_id, name, type, monthly_budget, icon, color) 
             VALUES (?, ?, ?, ?, ?, ?, ?)",
            [$orgId, $parentId, $name, $type, $budget, $icon, $color]
        );
        $id = (int) Model::getPdo()->lastInsertId();

        return $this->json(['message' => 'Categoria criada com sucesso.', 'id' => $id], 201);
    }
}
