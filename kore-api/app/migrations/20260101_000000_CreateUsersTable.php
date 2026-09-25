<?php

require_once __DIR__ . '/../../kore/Migration.php';
require_once __DIR__ . '/../../kore/Model.php';

class CreateUsersTable extends Migration
{
    public function up()
    {
        Model::query("CREATE TABLE IF NOT EXISTS `users` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL,
            `email` VARCHAR(150) NOT NULL UNIQUE,
            `username` VARCHAR(50) NOT NULL UNIQUE,
            `password` VARCHAR(255) NOT NULL,
            `role` VARCHAR(30) DEFAULT 'user',
            `avatar` VARCHAR(255) DEFAULT NULL,
            `token` VARCHAR(100) DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            `deleted_at` TIMESTAMP NULL DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    public function down()
    {
        Model::query("DROP TABLE IF EXISTS `users`;");
    }
}