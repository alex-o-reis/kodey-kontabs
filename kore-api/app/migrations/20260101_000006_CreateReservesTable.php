<?php

require_once __DIR__ . '/../../kore/Migration.php';
require_once __DIR__ . '/../../kore/Model.php';

class CreateReservesTable extends Migration
{
    public function up()
    {
        Model::query("CREATE TABLE IF NOT EXISTS `reserves` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `organization_id` INT NOT NULL,
            `account_id` INT DEFAULT NULL,
            `name` VARCHAR(100) NOT NULL,
            `type` VARCHAR(30) DEFAULT 'emergency',
            `target_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            `current_amount` DECIMAL(12,2) DEFAULT 0.00,
            `monthly_contribution_target` DECIMAL(12,2) DEFAULT 0.00,
            `deadline_date` DATE DEFAULT NULL,
            `priority` VARCHAR(20) DEFAULT 'high',
            `icon` VARCHAR(255) DEFAULT 'app/assets/illustrations/coin-happy.png',
            `color` VARCHAR(20) DEFAULT '#22C55E',
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY `idx_reserves_org` (`organization_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    public function down()
    {
        Model::query("DROP TABLE IF EXISTS `reserves`;");
    }
}
