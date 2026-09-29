<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../models/Organization.php';

class Organizations extends Controller
{
    public function get($id = null)
    {
        $user = $this->getAuthenticatedUser();

        if ($id) {
            // Se autenticado, valida se a organização pertence ao usuário
            if ($user) {
                $stmt = Model::query(
                    "SELECT o.* 
                     FROM organizations o
                     INNER JOIN organization_users ou ON ou.organization_id = o.id
                     WHERE o.id = ? AND ou.user_id = ? LIMIT 1",
                    [$id, $user['id']]
                );
            } else {
                $stmt = Model::query("SELECT * FROM organizations WHERE id = ? LIMIT 1", [$id]);
            }

            $org = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$org) {
                return $this->error("Organização não encontrada ou sem permissão de acesso.", 404);
            }
            return $this->json(['data' => $org]);
        }

        // Se autenticado, lista ESTRITAMENTE as organizações do usuário logado
        if ($user) {
            $stmt = Model::query(
                "SELECT o.*, ou.role, ou.is_default
                 FROM organizations o
                 INNER JOIN organization_users ou ON ou.organization_id = o.id
                 WHERE ou.user_id = ? AND o.is_active = 1
                 ORDER BY ou.is_default DESC, o.name ASC",
                [$user['id']]
            );
            $orgs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Se o usuário ainda não tiver nenhuma organização, cria uma pessoal exclusiva
            if (empty($orgs)) {
                $defaultId = $this->getActiveOrgId();
                $stmtNew = Model::query("SELECT *, 'owner' as role, 1 as is_default FROM organizations WHERE id = ?", [$defaultId]);
                $orgs = $stmtNew->fetchAll(PDO::FETCH_ASSOC);
            }

            return $this->json(['data' => $orgs]);
        }

        // Apenas para testes anônimos em dev local sem cabeçalho Authorization
        $stmt = Model::query("SELECT *, 'owner' as role, 1 as is_default FROM organizations WHERE is_active = 1 ORDER BY id ASC LIMIT 1");
        $orgs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $this->json(['data' => $orgs]);
    }

    public function post()
    {
        $user = $this->getAuthenticatedUser();
        $body = $this->request->getJson();
        $name = trim($body['name'] ?? '');
        $type = in_array(strtoupper($body['type'] ?? ''), ['PJ', 'PF']) ? strtoupper($body['type']) : 'PF';
        $doc = $body['document'] ?? null;
        $color = $body['color'] ?? ($type === 'PJ' ? '#0F7A4A' : '#103C35');
        $icon = $body['icon'] ?? ($type === 'PJ' ? 'bi-buildings' : 'bi-person-circle');

        if (empty($name)) {
            return $this->error("O nome da organização é obrigatório.", 422);
        }

        Model::query(
            "INSERT INTO organizations (name, type, document, color, icon, is_active) VALUES (?, ?, ?, ?, ?, 1)",
            [$name, $type, $doc, $color, $icon]
        );
        $id = (int) Model::getPdo()->lastInsertId();

        // Se houver usuário logado, vincula a organização a ele
        if ($user) {
            Model::query(
                "INSERT INTO organization_users (organization_id, user_id, role, is_default) VALUES (?, ?, 'owner', 0)",
                [$id, $user['id']]
            );
        }

        // Popula contas e categorias padrão para a nova organização
        $this->seedOrgDefaults($id);

        return $this->json([
            'message' => 'Organização criada com sucesso.',
            'id' => $id,
            'name' => $name,
            'type' => $type
        ], 201);
    }
}
