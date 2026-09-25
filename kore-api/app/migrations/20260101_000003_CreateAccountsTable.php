<?php

require_once __DIR__ . '/../../kore/Migration.php';
require_once __DIR__ . '/../../kore/Model.php';

class CreateAccountsTable extends Migration
{
    public function up()
    {
        Model::query("CREATE TABLE IF NOT EXISTS `accounts` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `organization_id` INT NOT NULL,
            `name` VARCHAR(100) NOT NULL,
            `type` VARCHAR(30) DEFAULT 'checking',
            `bank_name` VARCHAR(100) DEFAULT NULL,
            `initial_balance` DECIMAL(12,2) DEFAULT 0.00,
            `current_balance` DECIMAL(12,2) DEFAULT 0.00,
            `color` VARCHAR(20) DEFAULT '#0F7A4A',
            `icon` VARCHAR(50) DEFAULT 'bi-bank',
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY `idx_accounts_org` (`organization_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    public function down()
    {
        Model::query("DROP TABLE IF EXISTS `accounts`;");
    }
}
