<?php

require_once __DIR__ . '/../../kore/Model.php';
require_once __DIR__ . '/../traits/CreditCardTrait.php';

class CreditCard extends Model
{
    use CreditCardTrait;

    protected static $table = 'credit_cards';
    protected static $primary_key = 'id';
}
