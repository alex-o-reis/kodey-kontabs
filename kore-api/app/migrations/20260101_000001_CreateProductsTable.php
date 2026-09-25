<?php

require_once __DIR__ . '/../../kore/Migration.php';
require_once __DIR__ . '/../../kore/Model.php';

class CreateProductsTable extends Migration
{
    public function up()
    {
        Model::query("CREATE TABLE IF NOT EXISTS `products` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(150) NOT NULL,
            `description` TEXT NULL,
            `price` DECIMAL(10,2) DEFAULT 0.00,
            `status` VARCHAR(30) DEFAULT 'ativo',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            `deleted_at` TIMESTAMP NULL DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    public function down()
    {
        Model::query("DROP TABLE IF EXISTS `products`;");
    }
}
