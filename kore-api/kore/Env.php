<?php

class Env
{
    /**
     * Loads a .env file into $_ENV and getenv()
     *
     * @param string $path Path to the .env file
     */
    public static function load($path)
    {
        if (!file_exists($path))
        {
            // Silently ignore if no .env file exists to allow system environment variables to take precedence
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line)
        {
            // Skip comments
            if (strpos(trim($line), '#') === 0)
            {
                continue;
            }

            // Parse key=value
            if (strpos($line, '=') !== false)
            {
                list($name, $value) = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value);

                // Strip quotes if present
                if (preg_match('/^"(.*)"$/', $value, $matches) || preg_match("/^'(.*)'$/", $value, $matches))
                {
                    $value = $matches[1];
                }

                if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV))
                {
                    putenv(sprintf('%s=%s', $name, $value));
                    $_ENV[$name] = $value;
                    $_SERVER[$name] = $value;
                }
            }
        }
    }

    /**
     * Helper to get an environment variable with a fallback default value
     */
    public static function get($key, $default = null)
    {
        $value = getenv($key);
        if ($value === false)
        {
            return $default;
        }
        return $value;
    }
}
