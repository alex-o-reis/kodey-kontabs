<?php

require_once __DIR__ . '/../../kore/Migration.php';
require_once __DIR__ . '/../../kore/Model.php';

class CreateCategoriesTable extends Migration
{
    public function up()
    {
        Model::query("CREATE TABLE IF NOT EXISTS `categories` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `organization_id` INT NOT NULL,
            `parent_id` INT DEFAULT NULL,
            `name` VARCHAR(100) NOT NULL,
            `type` VARCHAR(20) NOT NULL DEFAULT 'expense',
            `monthly_budget` DECIMAL(12,2) DEFAULT 0.00,
            `icon` VARCHAR(50) DEFAULT 'bi-tag',
            `color` VARCHAR(20) DEFAULT '#0F7A4A',
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY `idx_categories_org` (`organization_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    public function down()
    {
        Model::query("DROP TABLE IF EXISTS `categories`;");
    }
}
