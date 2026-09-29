<?php

require_once __DIR__ . '/Request.php';
require_once __DIR__ . '/Model.php';

class Controller
{
    protected ?Request $request;

    protected array $middleware = [];

    public function __construct()
    {
        // CORS Headers nativos para permitir comunicação segura entre domínios/portas diferentes
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Organization-Id, Accept, Origin, *");
        header("Access-Control-Allow-Credentials: true");
        header('Content-Type: application/json; charset=utf-8');

        // Tratamento nativo para Preflight Request (OPTIONS)
        if (isset($_SERVER['REQUEST_METHOD']) && strtoupper($_SERVER['REQUEST_METHOD']) === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        $this->request = new Request();
    }

    public function getMiddleware(): array
    {
        return $this->middleware;
    }

    public function getRequest(): Request
    {
        return $this->request;
    }

    /**
     * Retorna os dados do usuário autenticado via Bearer Token
     */
    protected function getAuthenticatedUser(): ?array
    {
        $token = $this->request->bearerToken();
        if (!$token) {
            $headers = function_exists('getallheaders') ? getallheaders() : [];
            $authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = trim($matches[1]);
            }
        }

        if (!$token) {
            return null;
        }

        try {
            $stmt = Model::query("SELECT id, name, username, email, role, avatar FROM users WHERE token = ? AND deleted_at IS NULL LIMIT 1", [$token]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            return $user ?: null;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Retorna a organização ativa com isolamento rígido por usuário:
     * NUNCA vaza dados de outro usuário. Se a org solicitada não pertencer
     * ao usuário autenticado, usa a organização padrão dele.
     */
    protected function getActiveOrgId(): int
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $requestedOrgId = 0;
        if (!empty($headers['X-Organization-Id'])) {
            $requestedOrgId = (int) $headers['X-Organization-Id'];
        } elseif (!empty($_GET['org_id'])) {
            $requestedOrgId = (int) $_GET['org_id'];
        }

        $user = $this->getAuthenticatedUser();

        if ($user) {
            $userId = (int) $user['id'];

            // Se o usuário solicitou uma organização, verifica se ela REALMENTE pertence a ele
            if ($requestedOrgId > 0) {
                $stmtCheck = Model::query(
                    "SELECT organization_id FROM organization_users WHERE user_id = ? AND organization_id = ? LIMIT 1",
                    [$userId, $requestedOrgId]
                );
                if ($stmtCheck->fetch()) {
                    return $requestedOrgId;
                }
            }

            // Se a org solicitada não pertence ao usuário, seleciona a padrão deste usuário
            $stmtDef = Model::query(
                "SELECT organization_id FROM organization_users WHERE user_id = ? ORDER BY is_default DESC, id ASC LIMIT 1",
                [$userId]
            );
            $defRow = $stmtDef->fetch(PDO::FETCH_ASSOC);
            if ($defRow) {
                return (int) $defRow['organization_id'];
            }

            // Se o usuário não possui vínculo com nenhuma organização, provisiona uma organização pessoal exclusiva para ele
            $nameParts = preg_split('/\s+/', $user['name'] ?: 'Minhas Finanças');
            $orgName = 'Finanças de ' . $nameParts[0];
            Model::query("INSERT INTO organizations (name, type, color, icon, is_active) VALUES (?, 'PF', '#103C35', 'bi-person-circle', 1)", [$orgName]);
            $newOrgId = (int) Model::getPdo()->lastInsertId();
            Model::query("INSERT INTO organization_users (organization_id, user_id, role, is_default) VALUES (?, ?, 'owner', 1)", [$newOrgId, $userId]);
            
            // Popula contas e categorias padrão se for uma organização nova
            $this->seedOrgDefaults($newOrgId);
            return $newOrgId;
        }

        // Se não houver autenticação (modo anônimo de dev local)
        if ($requestedOrgId > 0) {
            return $requestedOrgId;
        }

        return 1;
    }

    /**
     * Helper para popular contas e categorias padrão quando uma organização for criada
     */
    protected function seedOrgDefaults(int $orgId): void
    {
        try {
            Model::query("INSERT INTO accounts (organization_id, name, type, bank_name, initial_balance, current_balance, color, icon) VALUES (?, 'Conta Corrente', 'checking', 'Banco Principal', 0.00, 0.00, '#0F7A4A', 'bi-bank')", [$orgId]);
            Model::query("INSERT INTO reserves (organization_id, name, type, target_amount, current_amount, monthly_contribution_target, priority, color, icon) VALUES (?, 'Reserva de Emergência', 'emergency', 10000.00, 0.00, 500.00, 'high', '#22C55E', 'app/assets/illustrations/coin-happy.png')", [$orgId]);

            $cats = [
                ['name' => 'Salário & Renda', 'type' => 'income', 'budget' => 0.00, 'icon' => 'bi-cash-coin', 'color' => '#22C55E'],
                ['name' => 'Moradia & Contas', 'type' => 'expense', 'budget' => 0.00, 'icon' => 'bi-house-door', 'color' => '#0E5A4F'],
                ['name' => 'Alimentação', 'type' => 'expense', 'budget' => 0.00, 'icon' => 'bi-cart', 'color' => '#FF7A6B'],
                ['name' => 'Transporte', 'type' => 'expense', 'budget' => 0.00, 'icon' => 'bi-car-front', 'color' => '#68A9FF'],
                ['name' => 'Saúde', 'type' => 'expense', 'budget' => 0.00, 'icon' => 'bi-heart-pulse', 'color' => '#FF7A6B'],
                ['name' => 'Lazer', 'type' => 'expense', 'budget' => 0.00, 'icon' => 'bi-controller', 'color' => '#FACC15'],
                ['name' => 'Outros', 'type' => 'expense', 'budget' => 0.00, 'icon' => 'bi-tag', 'color' => '#667A74']
            ];
            foreach ($cats as $c) {
                Model::query("INSERT INTO categories (organization_id, name, type, monthly_budget, icon, color) VALUES (?, ?, ?, ?, ?, ?)", [$orgId, $c['name'], $c['type'], $c['budget'], $c['icon'], $c['color']]);
            }
        } catch (Exception $e) {}
    }

    public function __call($name, $arguments)
    {
        $this->not_implemented(strtoupper($name));
    }

    protected function json($data, int $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        return;
    }

    protected function error(string $message, int $statusCode = 400)
    {
        return $this->json(['error' => $message], $statusCode);
    }

    protected function not_implemented($method)
    {
        http_response_code(501);
        echo json_encode(['error' => "Method $method not implemented in this controller."], JSON_UNESCAPED_UNICODE);
    }
}
