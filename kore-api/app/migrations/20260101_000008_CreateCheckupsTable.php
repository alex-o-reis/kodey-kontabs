<?php

require_once __DIR__ . '/../../kore/Migration.php';
require_once __DIR__ . '/../../kore/Model.php';

class CreateCheckupsTable extends Migration
{
    public function up()
    {
        Model::query("CREATE TABLE IF NOT EXISTS `checkups` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `organization_id` INT NOT NULL,
            `user_id` INT NOT NULL,
            `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `unallocated_balance` DECIMAL(12,2) DEFAULT 0.00,
            `bills_due_count` INT DEFAULT 0,
            `over_budget_categories_count` INT DEFAULT 0,
            `reserves_on_track_count` INT DEFAULT 0,
            `notes` TEXT DEFAULT NULL,
            KEY `idx_checkups_org` (`organization_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    public function down()
    {
        Model::query("DROP TABLE IF EXISTS `checkups`;");
    }
}
