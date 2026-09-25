<?php

require_once __DIR__ . '/../../kore/Migration.php';
require_once __DIR__ . '/../../kore/Model.php';

class CreateOrganizationsTable extends Migration
{
    public function up()
    {
        Model::query("CREATE TABLE IF NOT EXISTS `organizations` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL,
            `type` VARCHAR(10) DEFAULT 'PF',
            `document` VARCHAR(30) DEFAULT NULL,
            `color` VARCHAR(20) DEFAULT '#0F7A4A',
            `icon` VARCHAR(50) DEFAULT 'bi-buildings',
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    public function down()
    {
        Model::query("DROP TABLE IF EXISTS `organizations`;");
    }
}
