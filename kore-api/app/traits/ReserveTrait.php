<?php

/**
 * Auto-generated Trait for table `reserves` by Kore ModelGenerator.
 * DO NOT EDIT MANUALLY.
 */
trait ReserveTrait
{
    public $ID;
    public $ORGANIZATION_ID;
    public $ACCOUNT_ID;
    public $NAME;
    public $TYPE = 'emergency';
    public $TARGET_AMOUNT = 0.00;
    public $CURRENT_AMOUNT = 0.00;
    public $MONTHLY_CONTRIBUTION_TARGET = 0.00;
    public $DEADLINE_DATE;
    public $PRIORITY = 'high';
    public $ICON = 'app/assets/illustrations/coin-happy.png';
    public $COLOR = '#22C55E';
    public $IS_ACTIVE = 1;
    public $CREATED_AT;
    public $UPDATED_AT;
}
