/**
 * ApiService — Cliente HTTP Centralizado para a API do Kore Framework
 * Conecta o Frontend SPA ao Backend RESTful em http://127.0.0.1:8000/
 */
class ApiService {
    static getBaseUrl() {
        // 1. Suporte a parâmetros na URL (?api_port=8080 ou ?api_url=http://localhost:8080/)
        try {
            if (typeof window !== 'undefined' && window.location) {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('api_port')) {
                    const port = urlParams.get('api_port');
                    const protocol = window.location.protocol;
                    const hostname = window.location.hostname || 'localhost';
                    return `${protocol}//${hostname}:${port}/`;
                }
                if (urlParams.has('api_url')) {
                    let url = urlParams.get('api_url');
                    return url.endsWith('/') ? url : url + '/';
                }
            }
        } catch (e) {}

        // 2. LocalStorage override configurável em tempo de execução
        try {
            const savedUrl = localStorage.getItem('kontabs_api_url');
            if (savedUrl) {
                return savedUrl.endsWith('/') ? savedUrl : savedUrl + '/';
            }
        } catch (e) {}

        // 3. Injetado via window.KONTABS_API_URL (.env do frontend ou servidor)
        if (typeof window !== 'undefined' && window.KONTABS_API_URL) {
            return window.KONTABS_API_URL.endsWith('/') ? window.KONTABS_API_URL : window.KONTABS_API_URL + '/';
        }

        // 4. KoreConfig.API_URL
        if (typeof KoreConfig !== 'undefined' && KoreConfig.API_URL) {
            return KoreConfig.API_URL.endsWith('/') ? KoreConfig.API_URL : KoreConfig.API_URL + '/';
        }

        return 'http://127.0.0.1:8000/';
    }

    /**
     * Define dinamicamente a porta da API no LocalStorage
     * Exemplo: ApiService.setApiPort(8080)
     */
    static setApiPort(port) {
        if (!port) {
            localStorage.removeItem('kontabs_api_url');
        } else {
            const protocol = window.location.protocol;
            const hostname = window.location.hostname || 'localhost';
            this.setBaseUrl(`${protocol}//${hostname}:${port}/`);
        }
    }

    /**
     * Define dinamicamente a URL completa da API no LocalStorage
     * Exemplo: ApiService.setBaseUrl('http://192.168.1.100:8000/')
     */
    static setBaseUrl(url) {
        if (!url) {
            localStorage.removeItem('kontabs_api_url');
        } else {
            localStorage.setItem('kontabs_api_url', url.endsWith('/') ? url : url + '/');
        }
    }

    static getActiveOrgId() {
        let saved = localStorage.getItem('kontabs_active_org_id');
        return saved ? parseInt(saved, 10) : 1;
    }

    static setActiveOrgId(orgId, orgName = '') {
        localStorage.setItem('kontabs_active_org_id', orgId);
        if (orgName) {
            localStorage.setItem('kontabs_active_org_name', orgName);
            jQuery('#active-org-name').text(orgName);
        }
    }

    static getActiveOrgName() {
        return localStorage.getItem('kontabs_active_org_name') || 'Kodey Sistemas';
    }

    static async request(endpoint, options = {}) {
        const url = new URL(endpoint.replace(/^\//, ''), this.getBaseUrl());
        
        // Adiciona headers padronizados do Kore Framework
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Organization-Id': this.getActiveOrgId().toString(),
            ...(options.headers || {})
        };

        if (options.params) {
            Object.keys(options.params).forEach(key => {
                if (options.params[key] !== undefined && options.params[key] !== null) {
                    url.searchParams.append(key, options.params[key]);
                }
            });
        }

        try {
            const response = await fetch(url.toString(), {
                ...options,
                headers
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMsg = data && data.error ? data.error : `Erro HTTP ${response.status}`;
                throw new Error(errorMsg);
            }

            return data;
        } catch (error) {
            console.warn(`[ApiService] Falha na requisição para ${endpoint}:`, error.message);
            throw error;
        }
    }

    static get(endpoint, params = {}) {
        return this.request(endpoint, { method: 'GET', params });
    }

    static post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}
