<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../models/Organization.php';

class Organizations extends Controller
{
    public function get($id = null)
    {
        if ($id) {
            $stmt = Model::query("SELECT * FROM organizations WHERE id = ?", [$id]);
            $org = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$org) {
                return $this->error("Organização não encontrada.", 404);
            }
            return $this->json(['data' => $org]);
        }

        $stmt = Model::query("SELECT * FROM organizations WHERE is_active = 1 ORDER BY id ASC");
        $orgs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $this->json(['data' => $orgs]);
    }

    public function post()
    {
        $body = $this->request->getJson();
        $name = trim($body['name'] ?? '');
        $type = $body['type'] ?? 'PF';
        $doc = $body['document'] ?? null;
        $color = $body['color'] ?? '#0F7A4A';
        $icon = $body['icon'] ?? 'bi-buildings';

        if (empty($name)) {
            return $this->error("O nome da organização é obrigatório.", 422);
        }

        Model::query(
            "INSERT INTO organizations (name, type, document, color, icon) VALUES (?, ?, ?, ?, ?)",
            [$name, $type, $doc, $color, $icon]
        );
        $id = (int) Model::getPdo()->lastInsertId();

        return $this->json(['message' => 'Organização criada com sucesso.', 'id' => $id], 201);
    }
}
