<?php

require_once __DIR__ . '/../../kore/Model.php';
require_once __DIR__ . '/../traits/OrganizationTrait.php';

class Organization extends Model
{
    use OrganizationTrait;

    protected static $table = 'organizations';
    protected static $primary_key = 'id';
}
