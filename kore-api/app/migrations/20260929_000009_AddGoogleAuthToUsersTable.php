<?php

require_once __DIR__ . '/../../kore/Migration.php';
require_once __DIR__ . '/../../kore/Model.php';

class AddGoogleAuthToUsersTable extends Migration
{
    public function up()
    {
        try {
            Model::query("ALTER TABLE `users` ADD COLUMN `google_id` VARCHAR(100) NULL AFTER `token`");
        } catch (Exception $e) {
            // Coluna já pode existir
        }

        try {
            Model::query("ALTER TABLE `users` ADD COLUMN `auth_provider` VARCHAR(30) DEFAULT 'local' AFTER `google_id`");
        } catch (Exception $e) {
            // Coluna já pode existir
        }

        try {
            Model::query("ALTER TABLE `users` MODIFY COLUMN `password` VARCHAR(255) NULL");
        } catch (Exception $e) {
            // Ignora se não puder alterar
        }
    }

    public function down()
    {
        try {
            Model::query("ALTER TABLE `users` DROP COLUMN `google_id`");
            Model::query("ALTER TABLE `users` DROP COLUMN `auth_provider`");
        } catch (Exception $e) {}
    }
}
