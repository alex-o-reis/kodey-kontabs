#!/usr/bin/env php
<?php

if (php_sapi_name() !== 'cli') {
    die("A CLI do Kore Framework só pode ser executada via linha de comando.\n");
}

if (file_exists(__DIR__ . '/app/config/database.php')) {
    require_once __DIR__ . '/app/config/database.php';
}
require_once __DIR__ . '/kore/Kore.php';
require_once __DIR__ . '/kore/cli/Kernel.php';

$kernel = new Kernel();
$kernel->handle($_SERVER['argv']);