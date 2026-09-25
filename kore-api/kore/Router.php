<?php

class Router
{
    public function run()
    {
        // translate the entire URL separating the method and the parameters
        $method = strtolower($_SERVER['REQUEST_METHOD']);

        // base_url check => use $_GET['url'] from .htaccess (if Apache)
        // or parse REQUEST_URI (if PHP built-in server)
        $url = isset($_GET['url']) ? $_GET['url'] : '';
        if (empty($url) && isset($_SERVER['REQUEST_URI']))
        {
            $url = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        }
        $url = trim($url, '/');
        $segments = explode('/', $url);

        // remove any empty segments
        $segments = array_values(array_filter($segments, function ($value)
        {
            return $value !== '';
        }));

        // pick a controller in the controller folder with the same name of the first route parameter
        if (empty($segments))
        {
            $controller_name = 'index';
        }
        else
        {
            $controller_name = array_shift($segments);
        }

        // The class name to instantiate
        $controller_class = ucfirst($controller_name); // Assuming 'users' -> 'Users'

        // Ensure controller file exists in the controllers folder
        $controller_file = __DIR__ . '/../app/controllers/' . strtolower($controller_name) . '.php';
        if (!file_exists($controller_file))
        {
            $controller_file = __DIR__ . '/../app/controllers/' . $controller_class . '.php';
        }

        // Let autoload try to load it if file_exists is bypassed, but we check if it's there
        if (!file_exists($controller_file) && !class_exists($controller_class, true))
        {
            $this->send_response(404, "Controller '$controller_name' not found.");
            return;
        }

        if (file_exists($controller_file))
        {
            require_once $controller_file;
        }

        if (!class_exists($controller_class))
        {
            $this->send_response(404, "Class '$controller_class' not found.");
            return;
        }

        $controller = new $controller_class();

        // Must inherit the base Controller
        if (!($controller instanceof Controller))
        {
            $this->send_response(500, "Class '$controller_class' must inherit the base Controller class.");
            return;
        }

        // optional_id can be a int, UUID/GUID, ULID ou hash (MD5,SHA-1,SHA-256)
        $id = null;
        if (!empty($segments) && $this->is_optional_id($segments[0]))
        {
            $id = array_shift($segments);
        }

        // if the only parameter is the controller it will call $controller->$method()
        // if there is only one id parameter it will call $controller->$method($id)

        // $segments now contains the rest of parameters
        $call_method = $method;

        if (!empty($segments))
        {
            $parameter = $segments[0];
            $potential_method = $method . '_' . $parameter;

            if (method_exists($controller, $potential_method))
            {
                $call_method = $potential_method;
                array_shift($segments); // consume this parameter as part of method name
            }

            // echo "[DEBUG] $potential_method does not exist. Call method is $call_method.\n";
        }

        // echo "[DEBUG] Final call_method is $call_method\n";

        // Final method validation
        if (!method_exists($controller, $call_method))
        {
            // Is it a default method intercepted by __call? (not in this logic)
            // if we reach here and it doesn't exist, we might want to check
            // if we should just call the default $method and pass $parameter as arg.
            if ($call_method !== $method && method_exists($controller, $method))
            {
                $call_method = $method;
                // put the parameter back
                array_unshift($segments, $parameter);
            }
            else
            {
                $this->send_response(404, "Method '$call_method' not found in '$controller_class'.");
                return;
            }
        }

        // Prepare arguments: id first (if exists), then remaining parameters
        // add it all in a parameter array and call $controller->$method($id,$parameters) or $controller->$method($parameters)
        $args = [];
        if ($id !== null)
        {
            $args[] = $id;
        }
        $args = array_merge($args, $segments);

        // call controller method with resolved arguments
        // call_user_func_array([$controller, $call_method], $args);

        // Build Middleware Pipeline
        $middlewares = $controller->getMiddleware();

        $request = $controller->getRequest();

        $next = function ($req) use ($controller, $call_method, $args)
        {
            return call_user_func_array([$controller, $call_method], $args);
        };

        foreach (array_reverse($middlewares) as $middlewareClass)
        {
            $middlewareFile = __DIR__ . '/../app/middlewares/' . $middlewareClass . '.php';
            if (!file_exists($middlewareFile))
            {
                $middlewareFile = __DIR__ . '/../app/middlewares/' . strtolower($middlewareClass) . '.php';
            }
            if (file_exists($middlewareFile))
            {
                require_once $middlewareFile;
            }
            if (class_exists($middlewareClass))
            {
                $middlewareObj = new $middlewareClass();
                $next = function ($req) use ($middlewareObj, $next)
                {
                    return $middlewareObj->handle($req, $next);
                };
            }
        }

        // Start pipeline execution
        $next($request);
    }

    private function is_optional_id($string)
    {
        // Integer Check
        if (ctype_digit($string))
        {
            return true;
        }

        // UUID/GUID Check (very permissive for v1 to v5)
        if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $string))
        {
            return true;
        }

        // ULID Check (26 chars, base32)
        if (preg_match('/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i', $string))
        {
            return true;
        }

        // MD5 Check (32 hex)
        if (preg_match('/^[a-f0-9]{32}$/i', $string))
        {
            return true;
        }

        // SHA-1 Check (40 hex)
        if (preg_match('/^[a-f0-9]{40}$/i', $string))
        {
            return true;
        }

        // SHA-256 Check (64 hex)
        if (preg_match('/^[a-f0-9]{64}$/i', $string))
        {
            return true;
        }

        return false;
    }

    private function send_response($code, $message)
    {
        http_response_code($code);
        echo $message;
    }
}
