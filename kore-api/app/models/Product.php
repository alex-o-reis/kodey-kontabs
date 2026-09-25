<?php

require_once __DIR__ . '/../../kore/Model.php';
require_once __DIR__ . '/../traits/ProductTrait.php';

class Product extends Model
{
    use ProductTrait;

    protected static $table = 'products';
    protected static $primary_key = 'id';
}
