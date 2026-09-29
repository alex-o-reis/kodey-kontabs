/**
 * ApiService — Cliente HTTP Centralizado para a API do Kore Framework
 * Conecta o Frontend SPA ao Backend RESTful (Local ou Produção Online)
 * Local: http://localhost:8000/ | Online: https://kontabsapi.kodey.com.br/
 */
class ApiService {
    /**
     * Identifica se está rodando em ambiente local
     */
    static isLocal() {
        if (typeof window === 'undefined' || !window.location) return true;
        const hostname = window.location.hostname;
        return (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '::1' ||
            hostname.endsWith('.local') ||
            hostname.endsWith('.test')
        );
    }

    /**
     * Retorna a Base URL da API com detecção automática do ambiente
     */
    static getBaseUrl() {
        // 1. Em produção online (kontabs.kodey.com.br), o backend é SEMPRE https://kontabsapi.kodey.com.br/
        if (!this.isLocal()) {
            return 'https://kontabsapi.kodey.com.br/';
        }

        // 2. Suporte a parâmetros na URL (?api_port=8080 ou ?api_url=https://...)
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

        // 3. Injetado via window.KONTABS_API_URL (.env do frontend ou servidor)
        if (typeof window !== 'undefined' && window.KONTABS_API_URL && window.KONTABS_IS_LOCAL) {
            return window.KONTABS_API_URL.endsWith('/') ? window.KONTABS_API_URL : window.KONTABS_API_URL + '/';
        }

        // 4. LocalStorage override configurável em tempo de execução para testes locais
        try {
            const savedUrl = localStorage.getItem('kontabs_api_url');
            if (savedUrl) {
                return savedUrl.endsWith('/') ? savedUrl : savedUrl + '/';
            }
        } catch (e) {}

        // 5. KoreConfig.API_URL fallback
        if (typeof KoreConfig !== 'undefined' && KoreConfig.API_URL) {
            return KoreConfig.API_URL.endsWith('/') ? KoreConfig.API_URL : KoreConfig.API_URL + '/';
        }

        return 'http://localhost:8001/';
    }

    /**
     * Define dinamicamente a porta da API no LocalStorage
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
     */
    static setBaseUrl(url) {
        if (!url) {
            localStorage.removeItem('kontabs_api_url');
        } else {
            localStorage.setItem('kontabs_api_url', url.endsWith('/') ? url : url + '/');
        }
    }

    static getToken() {
        return localStorage.getItem('kontabs_token') || '';
    }

    static getUser() {
        try {
            return JSON.parse(localStorage.getItem('kontabs_user') || 'null');
        } catch (e) {
            return null;
        }
    }

    static setSession(authData) {
        if (authData.token) {
            localStorage.setItem('kontabs_token', authData.token);
        }
        if (authData.user) {
            localStorage.setItem('kontabs_user', JSON.stringify(authData.user));
        }
        if (authData.active_organization) {
            this.setActiveOrgId(authData.active_organization.id, authData.active_organization.name);
        }
        if (authData.organizations) {
            localStorage.setItem('kontabs_user_orgs', JSON.stringify(authData.organizations));
        }
    }

    static logout() {
        localStorage.removeItem('kontabs_token');
        localStorage.removeItem('kontabs_user');
        localStorage.removeItem('kontabs_user_orgs');
        localStorage.removeItem('kontabs_active_org_id');
        localStorage.removeItem('kontabs_active_org_name');
        window.location.hash = '#/login';
        window.location.reload();
    }

    static getActiveOrgId() {
        let saved = localStorage.getItem('kontabs_active_org_id');
        return saved ? parseInt(saved, 10) : 0;
    }

    static setActiveOrgId(orgId, orgName = '') {
        localStorage.setItem('kontabs_active_org_id', orgId);
        if (orgName) {
            localStorage.setItem('kontabs_active_org_name', orgName);
            jQuery('#active-org-name').text(orgName);
        }
    }

    static getActiveOrgName() {
        return localStorage.getItem('kontabs_active_org_name') || 'Minhas Finanças';
    }

    static async request(endpoint, options = {}) {
        const url = new URL(endpoint.replace(/^\//, ''), this.getBaseUrl());
        const token = this.getToken();

        // Adiciona headers padronizados do Kore Framework
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Organization-Id': this.getActiveOrgId().toString(),
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
                // Se receber 401 não autenticado (fora das rotas de login/registro), limpa sessão e redireciona
                if (response.status === 401 && !url.pathname.includes('/auth/login') && !url.pathname.includes('/auth/register') && !url.pathname.includes('/auth/google')) {
                    localStorage.removeItem('kontabs_token');
                    window.location.hash = '#/login';
                }

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

    // Atalhos de Autenticação
    static login(username, password) {
        return this.post('auth/login', { username, password });
    }

    static register(payload) {
        return this.post('auth/register', payload);
    }

    static googleAuth(credential, userData = {}) {
        return this.post('auth/google', { credential, user_data: userData });
    }
}
