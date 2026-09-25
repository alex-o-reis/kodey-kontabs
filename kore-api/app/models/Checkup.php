<?php

require_once __DIR__ . '/../../kore/Model.php';
require_once __DIR__ . '/../traits/CheckupTrait.php';

class Checkup extends Model
{
    use CheckupTrait;

    protected static $table = 'checkups';
    protected static $primary_key = 'id';
}
