<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../models/Product.php';

class Products extends Controller
{
    public function get($id = null)
    {
        if ($id) {
            $item = new Product();
            if (!$item->load($id)) {
                return $this->error('Registro não encontrado', 404);
            }
            return $this->json($item);
        }

        $items = Product::loadAll();
        return $this->json($items);
    }

    public function post()
    {
        $data = $this->request->input();
        $item = new Product();
        $item->loadFromRow($data);
        $item->save();

        return $this->json([
            'message' => 'Product salvo com sucesso!',
            'data' => $item
        ], 201);
    }

    public function delete($id = null)
    {
        if (!$id) {
            return $this->error('ID não fornecido', 400);
        }

        $item = new Product();
        if (!$item->load($id)) {
            return $this->error('Registro não encontrado', 404);
        }

        $item->save(true);
        return $this->json(['message' => 'Product removido com sucesso']);
    }
}
