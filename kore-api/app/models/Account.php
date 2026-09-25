<?php

require_once __DIR__ . '/../../kore/Model.php';
require_once __DIR__ . '/../traits/AccountTrait.php';

class Account extends Model
{
    use AccountTrait;

    protected static $table = 'accounts';
    protected static $primary_key = 'id';
}
