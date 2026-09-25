<?php

require_once __DIR__ . '/../../kore/Model.php';
require_once __DIR__ . '/../traits/OrganizationUserTrait.php';

class OrganizationUser extends Model
{
    use OrganizationUserTrait;

    protected static $table = 'organization_users';
    protected static $primary_key = 'id';
}
