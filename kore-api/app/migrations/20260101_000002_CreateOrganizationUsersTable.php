<?php

require_once __DIR__ . '/../../kore/Migration.php';
require_once __DIR__ . '/../../kore/Model.php';

class CreateOrganizationUsersTable extends Migration
{
    public function up()
    {
        Model::query("CREATE TABLE IF NOT EXISTS `organization_users` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `organization_id` INT NOT NULL,
            `user_id` INT NOT NULL,
            `role` VARCHAR(30) DEFAULT 'owner',
            `is_default` TINYINT(1) DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            KEY `idx_org_user` (`organization_id`, `user_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    public function down()
    {
        Model::query("DROP TABLE IF EXISTS `organization_users`;");
    }
}
