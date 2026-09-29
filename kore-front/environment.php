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

$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$host = explode(':', $host)[0];
$isLocalhost = ($host === 'localhost' || str_starts_with($host, '127.') || str_starts_with($host, '::1'));

// Multi-tenant Subdomain Detection (se configurado como no LeanRail) ou Stand-alone
$tenant = "default";
if (!$isLocalhost) {
    $parts = explode('.', strtolower($host));
    if (count($parts) >= 3 && $parts[0] !== 'www') {
        $tenant = $parts[0];
    }
}

$_SESSION['tenant'] = $tenant;
define('KORE_VERSION', '1.0.0');
define('IS_LOCAL', $isLocalhost);
define('TENANT_NAME', $tenant);
define('API_URL', getenv('API_URL') ?: ($_ENV['API_URL'] ?? ''));