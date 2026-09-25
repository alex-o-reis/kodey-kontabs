/**
 * ApiService — Cliente HTTP Centralizado para a API do Kore Framework
 * Conecta o Frontend SPA ao Backend RESTful em http://127.0.0.1:8000/
 */
class ApiService {
    static getBaseUrl() {
        return KoreConfig.API_URL || 'http://127.0.0.1:8000/';
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
