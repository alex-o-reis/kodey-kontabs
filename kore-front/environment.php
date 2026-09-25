<?php
session_start();

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