<?php

/**
 * Auto-generated Trait for table `transactions` by Kore ModelGenerator.
 * DO NOT EDIT MANUALLY.
 */
trait TransactionTrait
{
    public $ID;
    public $ORGANIZATION_ID;
    public $USER_ID;
    public $ACCOUNT_ID;
    public $DESTINATION_ACCOUNT_ID;
    public $CREDIT_CARD_ID;
    public $CATEGORY_ID;
    public $RESERVE_ID;
    public $TYPE;
    public $DESCRIPTION;
    public $AMOUNT_EXPECTED;
    public $AMOUNT_EFFECTIVE;
    public $COMPETENCE_DATE;
    public $DUE_DATE;
    public $PAYMENT_DATE;
    public $STATUS = 'expected';
    public $HAS_ORIGIN = 1;
    public $HAS_DESTINATION = 1;
    public $IS_RECURRING = 0;
    public $RECURRENCE_PERIOD;
    public $INSTALLMENT_CURRENT;
    public $INSTALLMENT_TOTAL;
    public $NOTES;
    public $CREATED_AT;
    public $UPDATED_AT;
}
