<?php

class Request
{
    private $get;

    private $post;

    private $server;

    private $files;

    private $attributes = [];

    public function __set($name, $value)
    {
        $this->attributes[$name] = $value;
    }

    public function __get($name)
    {
        return $this->attributes[$name] ?? null;
    }

    public function __isset($name)
    {
        return isset($this->attributes[$name]);
    }

    public function __construct()
    {
        $this->get = $_GET;
        $this->post = $_POST;
        $this->server = $_SERVER;
        $this->files = $_FILES;

        // Handle JSON payloads
        $contentType = isset($_SERVER['CONTENT_TYPE']) ? trim($_SERVER['CONTENT_TYPE']) : '';
        if (strpos($contentType, 'application/json') !== false)
        {
            $content = trim(file_get_contents('php://input'));
            $decoded = json_decode($content, true);
            if (is_array($decoded))
            {
                $this->post = array_merge($this->post, $decoded);
            }
        }
    }

    /**
     * Get a header value from request
     */
    public function header(string $key, $default = null)
    {
        $headerKey = 'HTTP_' . strtoupper(str_replace('-', '_', $key));
        if (isset($this->server[$headerKey])) {
            return $this->server[$headerKey];
        }
        if (isset($this->server[$key])) {
            return $this->server[$key];
        }
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            foreach ($headers as $k => $v) {
                if (strcasecmp($k, $key) === 0) {
                    return $v;
                }
            }
        }
        return $default;
    }

    /**
     * Extract Bearer Token from Authorization Header
     */
    public function bearerToken(): ?string
    {
        $auth = $this->header('Authorization') ?? $this->server['HTTP_AUTHORIZATION'] ?? $this->server['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
        if ($auth && preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
            return trim($matches[1]);
        }
        return null;
    }

    /**
     * Get a value from the query string ($_GET)
     */
    public function get($key = null, $default = null)
    {
        if ($key === null)
        {
            return $this->get;
        }
        return isset($this->get[$key]) ? $this->get[$key] : $default;
    }


    /**
     * Get a value from the request body ($_POST or JSON payload)
     */
    public function post($key = null, $default = null)
    {
        if ($key === null)
        {
            return $this->post;
        }
        return isset($this->post[$key]) ? $this->post[$key] : $default;
    }

    /**
     * Helper to get from POST first, then fallback to GET.
     * If no key is provided, returns all merged input.
     */
    public function input($key = null, $default = null)
    {
        if ($key === null)
        {
            return array_merge($this->get, $this->post);
        }
        if (isset($this->post[$key]))
        {
            return $this->post[$key];
        }
        if (isset($this->get[$key]))
        {
            return $this->get[$key];
        }
        return $default;
    }

    /**
     * Get all input data (query and body)
     */
    public function all(): array
    {
        return $this->input();
    }

    /**
     * Get uploaded file info
     */
    public function file($key = null)
    {
        if ($key === null)
        {
            return $this->files;
        }
        return isset($this->files[$key]) ? $this->files[$key] : null;
    }

    /**
     * Get HTTP method
     */
    public function method()
    {
        return isset($this->server['REQUEST_METHOD']) ? strtoupper($this->server['REQUEST_METHOD']) : 'GET';
    }

    /**
     * Very basic validation mimicking Laravel style rules
     * e.g., ['email' => 'required|email', 'age' => 'required']
     */
    public function validate(array $rules)
    {
        $errors = [];
        $validatedData = [];

        foreach ($rules as $field => $ruleString)
        {
            $fieldRules = explode('|', $ruleString);
            $value = $this->input($field);

            foreach ($fieldRules as $rule)
            {
                if ($rule === 'required')
                {
                    if ($value === null || $value === '')
                    {
                        $errors[$field][] = "The $field field is required.";
                    }
                }
                elseif ($rule === 'email')
                {
                    if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL))
                    {
                        $errors[$field][] = "The $field must be a valid email address.";
                    }
                }
                elseif ($rule === 'numeric')
                {
                    if ($value !== null && $value !== '' && !is_numeric($value))
                    {
                        $errors[$field][] = "The $field must be a number.";
                    }
                }
            }

            // Only add to validated data if no errors for this field
            if (!isset($errors[$field]) && $value !== null)
            {
                $validatedData[$field] = $value;
            }
        }

        if (!empty($errors))
        {
            // In a real framework we might throw a ValidationException
            // Here we just halt and output JSON
            http_response_code(422);
            header('Content-Type: application/json');
            echo json_encode(['errors' => $errors]);
            exit;
        }

        return $validatedData;
    }
}
