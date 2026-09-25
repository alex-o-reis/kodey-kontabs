<?php

#[AllowDynamicProperties]
class Model
{
    protected static $pdo = null;

    // These should be defined in child classes
    protected static $table = null;

    protected static $primary_key = 'id';

    protected static $driver = 'mysql';

    /**
     * Initializes the PDO database connection (MySQL or SQLite).
     */
    public static function init_db($host_or_path, $db = '', $user = '', $pass = '', $charset = 'utf8mb4', $driver = 'mysql')
    {
        self::$driver = strtolower($driver);

        if (self::$driver === 'sqlite') {
            $dsn = "sqlite:" . $host_or_path;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ];
            self::$pdo = new PDO($dsn, null, null, $options);
            return;
        }

        $dsn = "mysql:host=$host_or_path;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => true,
        ];
        try
        {
            self::$pdo = new PDO($dsn, $user, $pass, $options);
        }
        catch (\PDOException $e)
        {
            throw new \PDOException($e->getMessage(), (int) $e->getCode());
        }
    }

    public static function getDriver(): string
    {
        return self::$driver ?? 'mysql';
    }

    public static function getPdo(): ?PDO
    {
        return self::$pdo;
    }


    /**
     * Executes a custom SQL query with optional bound parameters.
     */
    public static function query($sql, $params = [])
    {
        if (!self::$pdo)
        {
            throw new Exception('Database connection not initialized. Call Model::init_db() first.');
        }

        // Se for SQLite, ajusta sintaxes comuns de MySQL para SQLite
        if (self::$driver === 'sqlite') {
            $sql = str_ireplace('ENGINE=InnoDB', '', $sql);
            $sql = str_ireplace('DEFAULT CHARSET=utf8mb4', '', $sql);
            $sql = str_ireplace('INT AUTO_INCREMENT PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT', $sql);
            $sql = str_ireplace('ON UPDATE CURRENT_TIMESTAMP', '', $sql);
            $sql = str_ireplace('NOW()', "datetime('now')", $sql);
        }


        $stmt = self::$pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Loads a record by its ID and maps it to properties matching uppercased column names.
     */
    public function load($id)
    {
        if (empty(static::$table))
        {
            throw new Exception('Model table not defined in ' . get_class($this));
        }

        $pk = static::$primary_key;
        $sql = 'SELECT * FROM ' . static::$table . " WHERE {$pk} = ?";
        $stmt = self::query($sql, [$id]);
        $row = $stmt->fetch();

        if ($row)
        {
            foreach ($row as $column => $value)
            {
                $prop_name = strtoupper($column);
                $this->$prop_name = $value;
            }
            return true;
        }
        return false;
    }

    /**
     * Saves the current object's mapped propertes to the database.
     * Inserts if the primary key property is empty/null, updates otherwise.
     */
    public function save($delete = false)
    {
        if (empty(static::$table))
        {
            throw new Exception('Model table not defined in ' . get_class($this));
        }

        // Get all database columns to match against object properties
        $columns = [];
        if (self::$driver === 'sqlite') {
            $stmt_cols = self::query("PRAGMA table_info(`" . static::$table . "`)");
            while ($col = $stmt_cols->fetch()) {
                $columns[] = $col['name'];
            }
        } else {
            $sql_columns = 'DESCRIBE ' . static::$table;
            $stmt_cols = self::query($sql_columns);
            while ($col = $stmt_cols->fetch()) {
                $columns[] = $col['Field'];
            }
        }


        $data = [];
        $pk = static::$primary_key;
        $pk_prop = strtoupper($pk);

        // Match table columns to object properties (uppercased)
        foreach ($columns as $column)
        {
            $prop_name = strtoupper($column);
            if (property_exists($this, $prop_name) || isset($this->$prop_name))
            {
                $data[$column] = $this->$prop_name;
            }
        }

        if (empty($data))
        {
            return false; // Nothing to save
        }

        $ignore = ['created_at', 'updated_at', 'deleted_at'];
        if (empty($this->$pk_prop))
        {
            // INSERT
            $data = array_diff_key($data, array_flip($ignore));

            $fields = implode(', ', array_keys($data));
            $placeholders = implode(', ', array_fill(0, count($data), '?'));

            $sql = 'INSERT INTO ' . static::$table . " ($fields) VALUES ($placeholders)";

            self::query($sql, array_values($data));

            // Assign new ID to property
            $new_id = self::$pdo->lastInsertId();
            $this->$pk_prop = $new_id;
        }
        elseif (!$delete)
        {
            // UPDATE
            $set_clause = [];
            $update_values = [];
            foreach ($data as $column => $value)
            {
                if ($column !== $pk && !in_array($column, $ignore))
                {
                    $set_clause[] = "$column = ?";
                    $update_values[] = $value;
                }
            }

            $update_values[] = $this->$pk_prop; // for the WHERE clause
            $sql = 'UPDATE ' . static::$table . ' SET ' . implode(', ', $set_clause) . " WHERE {$pk} = ?";
            self::query($sql, $update_values);
        }
        else
        {
            // DELETE
            $sql = 'UPDATE ' . static::$table . " SET deleted_at = NOW() WHERE {$pk} = ?";
            self::query($sql, [$this->$pk_prop]);
        }

        return true;
    }

    /**
     * Loads all records matching an optional filter array.
     * Example filter: ['status' => 'active', 'type' => 1]
     */
    public static function loadAll($filter = [])
    {
        if (empty(static::$table))
        {
            throw new Exception('Model table not defined in ' . get_called_class());
        }

        $sql = 'SELECT * FROM ' . static::$table;
        $params = [];

        if (!empty($filter))
        {
            $conditions = [];
            foreach ($filter as $column => $value)
            {
                if ($value === null)
                {
                    $conditions[] = "$column IS NULL";
                }
                else
                {
                    $conditions[] = "$column = ?";
                    $params[] = $value;
                }
            }
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $stmt = self::query($sql, $params);
        $results = [];

        $class = get_called_class();
        while ($row = $stmt->fetch())
        {
            $obj = new $class();
            foreach ($row as $column => $value)
            {
                $prop_name = strtoupper($column);
                $obj->$prop_name = $value;
            }
            $results[] = $obj;
        }

        return $results;
    }
    /**
     * Hydrates the object from an associative array (database row).
     */
    public function loadFromRow($row)
    {
        foreach ($row as $column => $value)
        {
            $prop_name = strtoupper($column);
            $this->$prop_name = $value;
        }
        return $this;
    }
}
