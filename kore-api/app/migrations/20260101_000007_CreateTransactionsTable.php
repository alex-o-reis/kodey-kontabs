<?php

require_once __DIR__ . '/../../kore/Migration.php';
require_once __DIR__ . '/../../kore/Model.php';

class CreateTransactionsTable extends Migration
{
    public function up()
    {
        Model::query("CREATE TABLE IF NOT EXISTS `transactions` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `organization_id` INT NOT NULL,
            `user_id` INT NOT NULL,
            `account_id` INT DEFAULT NULL,
            `destination_account_id` INT DEFAULT NULL,
            `credit_card_id` INT DEFAULT NULL,
            `category_id` INT DEFAULT NULL,
            `reserve_id` INT DEFAULT NULL,
            `type` VARCHAR(30) NOT NULL,
            `description` VARCHAR(255) NOT NULL,
            `amount_expected` DECIMAL(12,2) NOT NULL,
            `amount_effective` DECIMAL(12,2) DEFAULT NULL,
            `competence_date` DATE NOT NULL,
            `due_date` DATE NOT NULL,
            `payment_date` DATE DEFAULT NULL,
            `status` VARCHAR(20) DEFAULT 'expected',
            `has_origin` TINYINT(1) DEFAULT 1,
            `has_destination` TINYINT(1) DEFAULT 1,
            `is_recurring` TINYINT(1) DEFAULT 0,
            `recurrence_period` VARCHAR(20) DEFAULT NULL,
            `installment_current` INT DEFAULT NULL,
            `installment_total` INT DEFAULT NULL,
            `notes` TEXT DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY `idx_transactions_org` (`organization_id`),
            KEY `idx_transactions_competence` (`competence_date`),
            KEY `idx_transactions_status` (`status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    public function down()
    {
        Model::query("DROP TABLE IF EXISTS `transactions`;");
    }
}
