<?php

require_once __DIR__ . '/../../kore/Controller.php';

class Index extends Controller
{
    public function get(...$args)
    {
        return $this->json([
            'framework' => 'Kore Framework (KKF)',
            'version' => '1.0.0',
            'status' => 'online',
            'timestamp' => date('Y-m-d H:i:s'),
            'docs' => 'Consulte /skills/kore-framework ou README.md'
        ]);
    }
}