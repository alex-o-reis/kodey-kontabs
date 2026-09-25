<?php

require_once __DIR__ . '/Request.php';

interface Middleware
{
    /**
     * Manipula a requisição antes de passar para o controller.
     *
     * @param Request $request
     * @param callable $next
     * @return mixed
     */
    public function handle(Request $request, callable $next);
}

