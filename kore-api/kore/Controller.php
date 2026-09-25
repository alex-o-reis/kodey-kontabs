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
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
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

