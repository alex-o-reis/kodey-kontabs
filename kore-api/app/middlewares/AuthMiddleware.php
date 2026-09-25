<?php

require_once __DIR__ . '/../../kore/Middleware.php';
require_once __DIR__ . '/../../kore/Model.php';

class AuthMiddleware implements Middleware
{
    public function handle(Request $request, callable $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            http_response_code(401);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'error' => 'Acesso nao autorizado.',
                'message' => 'Token Bearer ausente no cabecalho Authorization.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        try {
            $stmt = Model::query("SELECT * FROM users WHERE token = ? AND deleted_at IS NULL LIMIT 1", [$token]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                http_response_code(401);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'error' => 'Token invalido ou expirado.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            unset($user['password']);
            $request->user = $user;
        } catch (Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => 'Falha ao verificar autenticacao: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }

        return $next($request);
    }
}