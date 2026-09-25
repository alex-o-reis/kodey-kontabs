<?php

require_once __DIR__ . '/../../kore/Model.php';
require_once __DIR__ . '/../traits/UserTrait.php';

class User extends Model
{
    use UserTrait;

    protected static $table = 'users';
    protected static $primary_key = 'id';
}
