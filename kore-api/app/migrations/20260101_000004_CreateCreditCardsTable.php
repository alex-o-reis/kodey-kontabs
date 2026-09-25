<?php

require_once __DIR__ . '/../../kore/Migration.php';
require_once __DIR__ . '/../../kore/Model.php';

class CreateCreditCardsTable extends Migration
{
    public function up()
    {
        Model::query("CREATE TABLE IF NOT EXISTS `credit_cards` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `organization_id` INT NOT NULL,
            `account_id` INT DEFAULT NULL,
            `name` VARCHAR(100) NOT NULL,
            `brand` VARCHAR(50) DEFAULT 'Mastercard',
            `credit_limit` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            `closing_day` INT NOT NULL DEFAULT 20,
            `due_day` INT NOT NULL DEFAULT 28,
            `color` VARCHAR(20) DEFAULT '#103C35',
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY `idx_cards_org` (`organization_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    public function down()
    {
        Model::query("DROP TABLE IF EXISTS `credit_cards`;");
    }
}
