<?php

class Kore
{
    public const VERSION = '1.0.0';
    public const NAME = 'Kore Framework (Kodey Kore Framework - KKF)';
    public const AUTHOR = 'Alex Reis & Kodey Sistemas';
    public const HOMEPAGE = 'https://kodey.com.br';

    public static function version(): string
    {
        return self::VERSION;
    }

    public static function info(): array
    {
        return [
            'name' => self::NAME,
            'version' => self::VERSION,
            'author' => self::AUTHOR,
            'homepage' => self::HOMEPAGE
        ];
    }
}