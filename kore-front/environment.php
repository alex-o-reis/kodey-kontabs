<?php
session_start();

// Carrega variáveis do .env do Frontend, se existir
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        if (str_contains($line, '=')) {
            [$k, $v] = explode('=', $line, 2);
            $k = trim($k);
            $v = trim($v, " \t\n\r\0\x0B\"'");
            if (!isset($_ENV[$k])) $_ENV[$k] = $v;
            putenv("$k=$v");
        }
    }
}

$httpHost = $_SERVER['HTTP_HOST'] ?? 'localhost';
$hostOnly = explode(':', $httpHost)[0];
$isLocalhost = (
    $hostOnly === 'localhost' || 
    str_starts_with($hostOnly, '127.') || 
    str_starts_with($hostOnly, '::1') || 
    str_ends_with($hostOnly, '.local') || 
    str_ends_with($hostOnly, '.test')
);

// Multi-tenant Subdomain Detection (se configurado como no LeanRail) ou Stand-alone
$tenant = "default";
if (!$isLocalhost) {
    $parts = explode('.', strtolower($hostOnly));
    if (count($parts) >= 3 && $parts[0] !== 'www') {
        $tenant = $parts[0];
    }
}

// Detecção Automática de Ambiente (Local vs Produção Online)
// Online: Front em kontabs.kodey.com.br e API em kontabsapi.kodey.com.br
if ($isLocalhost) {
    $defaultApi = getenv('API_URL') ?: ($_ENV['API_URL'] ?? 'http://localhost:8001/');
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $defaultFrontend = rtrim($scheme . '://' . $httpHost, '/');
} else {
    // Em produção, o backend oficial é SEMPRE https://kontabsapi.kodey.com.br/
    $envApi = getenv('API_URL') ?: ($_ENV['API_URL'] ?? '');
    if (!empty($envApi) && str_starts_with($envApi, 'https://') && str_contains($envApi, 'api') && !str_contains($envApi, 'localhost')) {
        $defaultApi = $envApi;
    } else {
        $defaultApi = 'https://kontabsapi.kodey.com.br/';
    }
    $defaultFrontend = 'https://kontabs.kodey.com.br';
}

$googleClientId = getenv('GOOGLE_CLIENT_ID') ?: ($_ENV['GOOGLE_CLIENT_ID'] ?? '');

$_SESSION['tenant'] = $tenant;
define('KORE_VERSION', '1.0.0');
define('IS_LOCAL', $isLocalhost);
define('TENANT_NAME', $tenant);
define('API_URL', rtrim($defaultApi, '/') . '/');
define('FRONTEND_URL', $defaultFrontend);
define('GOOGLE_CLIENT_ID', $googleClientId);