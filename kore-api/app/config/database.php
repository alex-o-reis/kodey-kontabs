<?php

require_once __DIR__ . '/../../kore/Env.php';
require_once __DIR__ . '/../../kore/Model.php';

// Carrega arquivo .env na raiz da API
Env::load(__DIR__ . '/../../.env');

$driver = strtolower(Env::get('DB_DRIVER', 'sqlite'));
$tenantMode = strtolower(Env::get('TENANT_MODE', 'standalone'));

if ($driver === 'sqlite')
{
    $sqliteDir = __DIR__ . '/../database';
    if (!is_dir($sqliteDir)) {
        mkdir($sqliteDir, 0777, true);
    }

    $configuredPath = Env::get('DB_DATABASE', 'database/database.sqlite');
    if (str_starts_with($configuredPath, '/') || str_starts_with($configuredPath, '\\') || (strlen($configuredPath) > 2 && $configuredPath[1] === ':')) {
        $dbFile = $configuredPath;
    } else {
        $cleanPath = ltrim(preg_replace('#^app/#', '', $configuredPath), '/\\');
        $dbFile = dirname(__DIR__) . '/' . $cleanPath;
    }


    $dbDir = dirname($dbFile);
    if (!is_dir($dbDir)) {
        mkdir($dbDir, 0777, true);
    }

    if (!file_exists($dbFile) && !str_starts_with($dbFile, ':memory:')) {
        touch($dbFile);
    }

    $GLOBALS['active_tenant_db'] = $dbFile;

    try
    {
        Model::init_db($dbFile, '', '', '', 'utf8mb4', 'sqlite');
    }

    catch (Exception $e)
    {
        if (php_sapi_name() !== 'cli')
        {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => "Falha na conexão com SQLite ($dbFile): " . $e->getMessage()]);
            exit;
        }
    }
}
else
{
    // Driver MySQL
    $host = Env::get('DB_HOST', 'localhost');
    $port = (int) Env::get('DB_PORT', 3306);
    $user = Env::get('DB_USER', 'root');
    $pass = Env::get('DB_PASS', '');
    $dbName = Env::get('DB_NAME', 'kore_app');

    // Suporte a Multi-tenancy por subdomínio ou Standalone
    if ($tenantMode === 'subdomain')
    {
        $hostName = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $parts = explode('.', strtolower(explode(':', $hostName)[0]));
        
        // Se houver subdominio (ex: cliente1.meusistema.com ou cliente1-api.meusistema.com)
        if (count($parts) >= 3)
        {
            $sub = str_replace('-api', '', $parts[0]);
            if ($sub !== 'www')
            {
                $prefix = Env::get('DB_PREFIX', '');
                $suffix = Env::get('DB_SUFFIX', '_kore');
                $dbName = $prefix . $sub . $suffix;
            }
        }
    }

    $GLOBALS['active_tenant_db'] = $dbName;

    // Inicializa conexão PDO MySQL
    try
    {
        Model::init_db($host, $dbName, $user, $pass, 'utf8mb4', 'mysql');
    }
    catch (Exception $e)
    {
        if (php_sapi_name() !== 'cli')
        {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => "Falha na conexão com banco de dados MySQL ($dbName): " . $e->getMessage()]);
            exit;
        }
    }
}