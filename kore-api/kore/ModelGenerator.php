<?php

require_once __DIR__ . '/Model.php';

class ModelGenerator
{
    protected string $modelsDir;
    protected string $traitsDir;

    public function __construct(string $modelsDir, string $traitsDir)
    {
        $this->modelsDir = $modelsDir;
        $this->traitsDir = $traitsDir;
    }

    public static function studlyCase(string $str): string
    {
        return str_replace(' ', '', ucwords(str_replace('_', ' ', $str)));
    }

    public static function singularize(string $str): string
    {
        if (substr($str, -3) === 'ies') return substr($str, 0, -3) . 'y';
        if (substr($str, -1) === 's' && substr($str, -2) !== 'ss') return rtrim($str, 's');
        return $str;
    }

    public function generate(): void
    {
        if (!is_dir($this->modelsDir)) mkdir($this->modelsDir, 0777, true);
        if (!is_dir($this->traitsDir)) mkdir($this->traitsDir, 0777, true);

        echo "Iniciando leitura do banco de dados...\n";

        $driver = Model::getDriver();
        $tables = [];

        if ($driver === 'sqlite') {
            $stmt = Model::query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'migrations'");
            while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
                $tables[] = $row[0];
            }
        } else {
            $stmt = Model::query('SHOW TABLES');
            while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
                if ($row[0] !== 'migrations') {
                    $tables[] = $row[0];
                }
            }
        }

        if (empty($tables))
        {
            echo "Nenhuma tabela encontrada no banco de dados.\n";
            return;
        }

        foreach ($tables as $table)
        {
            echo "Processando tabela: " . $table . "\n";

            $singularName = self::singularize($table);
            $className = self::studlyCase($singularName);
            $traitName = $className . 'Trait';

            $columns = [];
            $primaryKey = 'id';

            if ($driver === 'sqlite') {
                $stmtCols = Model::query("PRAGMA table_info(`" . $table . "`)");
                while ($col = $stmtCols->fetch(PDO::FETCH_ASSOC)) {
                    $columns[] = [
                        'Field' => $col['name'],
                        'Default' => $col['dflt_value'],
                        'Key' => $col['pk'] ? 'PRI' : ''
                    ];
                    if ($col['pk']) {
                        $primaryKey = $col['name'];
                    }
                }
            } else {
                $stmtCols = Model::query("DESCRIBE `" . $table . "`");
                while ($col = $stmtCols->fetch(PDO::FETCH_ASSOC)) {
                    $columns[] = $col;
                    if ($col['Key'] === 'PRI') {
                        $primaryKey = $col['Field'];
                    }
                }
            }


            // 1. Gerar Trait
            $traitFile = $this->traitsDir . '/' . $traitName . '.php';
            $traitContent = "<?php\n\n";
            $traitContent .= "/**\n * Auto-generated Trait for table `" . $table . "` by Kore ModelGenerator.\n * DO NOT EDIT MANUALLY.\n */\n";
            $traitContent .= "trait " . $traitName . "\n{\n";
            foreach ($columns as $colInfo)
            {
                $column = $colInfo['Field'];
                $default = $colInfo['Default'];
                $propName = strtoupper($column);

                if ($default !== null && $default !== 'CURRENT_TIMESTAMP' && strtoupper($default) !== 'NULL')
                {
                    $cleanDefault = trim($default, "'\"");
                    if (is_numeric($cleanDefault))
                    {
                        $traitContent .= "    public \$" . $propName . " = " . $cleanDefault . ";\n";
                    }
                    else
                    {
                        $traitContent .= "    public \$" . $propName . " = '" . addslashes($cleanDefault) . "';\n";
                    }
                }
                else
                {
                    $traitContent .= "    public \$" . $propName . ";\n";
                }

            }
            $traitContent .= "}\n";

            file_put_contents($traitFile, $traitContent);
            echo "  -> Trait atualizado: " . $traitName . "\n";

            // 2. Gerar Model
            $modelFile = $this->modelsDir . '/' . $className . '.php';
            if (!file_exists($modelFile))
            {
                $modelContent = "<?php\n\n";
                $modelContent .= "require_once __DIR__ . '/../../kore/Model.php';\n";
                $modelContent .= "require_once __DIR__ . '/../traits/" . $traitName . ".php';\n\n";
                $modelContent .= "class " . $className . " extends Model\n{\n";
                $modelContent .= "    use " . $traitName . ";\n\n";
                $modelContent .= "    protected static \$table = '" . $table . "';\n";
                $modelContent .= "    protected static \$primary_key = '" . $primaryKey . "';\n";
                $modelContent .= "}\n";

                file_put_contents($modelFile, $modelContent);
                echo "  -> Model criado: " . $className . "\n";
            }
            else
            {
                echo "  -> Model ja existe mantido: " . $className . "\n";
            }
        }

        echo "\nGeracao de Models e Traits concluida com sucesso!\n";
    }
}

