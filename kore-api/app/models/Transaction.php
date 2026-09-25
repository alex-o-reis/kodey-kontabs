<?php

require_once __DIR__ . '/../../kore/Model.php';
require_once __DIR__ . '/../traits/TransactionTrait.php';

class Transaction extends Model
{
    use TransactionTrait;

    protected static $table = 'transactions';
    protected static $primary_key = 'id';
}
