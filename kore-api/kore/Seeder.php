<?php

require_once __DIR__ . '/Model.php';

abstract class Seeder
{
    /**
     * Executa a populacao de dados no banco
     */
    abstract public function run(): void;

    /**
     * Executa outro Seeder
     */
    public function call(string $seederClass): void
    {
        $file = __DIR__ . '/../app/seeders/' . $seederClass . '.php';
        if (file_exists($file)) {
            require_once $file;
        }

        if (class_exists($seederClass)) {
            echo "Executando Seeder: " . $seederClass . "\n";
            $seeder = new $seederClass();
            $seeder->run();
        } else {
            echo "Aviso: Seeder " . $seederClass . " nao encontrado.\n";
        }
    }
}