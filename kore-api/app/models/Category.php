<?php

require_once __DIR__ . '/../../kore/Model.php';
require_once __DIR__ . '/../traits/CategoryTrait.php';

class Category extends Model
{
    use CategoryTrait;

    protected static $table = 'categories';
    protected static $primary_key = 'id';
}
