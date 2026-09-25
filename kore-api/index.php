<?php
ob_start();

// CORS Universal Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Tenant-Id, Accept");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/app/config/database.php';
require_once __DIR__ . '/kore/Router.php';

// Autoload automático de Models da aplicação
spl_autoload_register(function ($className) {
    $modelFile = __DIR__ . '/app/models/' . $className . '.php';
    if (file_exists($modelFile)) {
        require_once $modelFile;
    }
});

$router = new Router();
$router->run();