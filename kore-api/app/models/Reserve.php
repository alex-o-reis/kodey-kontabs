<?php

require_once __DIR__ . '/../../kore/Model.php';
require_once __DIR__ . '/../traits/ReserveTrait.php';

class Reserve extends Model
{
    use ReserveTrait;

    protected static $table = 'reserves';
    protected static $primary_key = 'id';
}
