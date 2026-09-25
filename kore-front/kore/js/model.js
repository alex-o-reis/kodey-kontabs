/**
 * REST Model & API Client para o Frontend do Kore Framework
 */
class Model {
    static getBaseUrl() {
        if (typeof KoreConfig !== 'undefined' && KoreConfig.API_URL) {
            return KoreConfig.API_URL.replace(/\/+$/, '') + '/';
        }
        return 'http://localhost:8000/';
    }

    static getToken() {
        return (typeof Cookies !== 'undefined' && Cookies.get('kore_token')) ||
               sessionStorage.getItem('kore_token') ||
               localStorage.getItem('kore_token');
    }

    static getUser() {
        let userJson = sessionStorage.getItem('kore_user') || localStorage.getItem('kore_user');
        try {
            return userJson ? JSON.parse(userJson) : null;
        } catch (e) {
            return null;
        }
    }

    static request(endpoint, method = 'GET', data = null, headers = {}) {
        let url = Model.getBaseUrl() + endpoint.replace(/^\/+/, '');
        let token = Model.getToken();

        let defaultHeaders = {
            'Accept': 'application/json'
        };

        if (token) {
            defaultHeaders['Authorization'] = 'Bearer ' + token;
        }

        let ajaxOptions = {
            url: url,
            method: method.toUpperCase(),
            headers: Object.assign(defaultHeaders, headers),
            dataType: 'json'
        };

        if (data) {
            if (ajaxOptions.method === 'GET') {
                ajaxOptions.data = data;
            } else {
                ajaxOptions.data = JSON.stringify(data);
                ajaxOptions.contentType = 'application/json; charset=utf-8';
            }
        }

        let requestPromise = jQuery.ajax(ajaxOptions);

        requestPromise.fail(function(xhr) {
            if (xhr.status === 401) {
                Model.logout();
            }
        });

        return requestPromise;
    }

    static get(endpoint, params = {}) {
        return Model.request(endpoint, 'GET', params);
    }

    static post(endpoint, body = {}) {
        return Model.request(endpoint, 'POST', body);
    }

    static put(endpoint, body = {}) {
        return Model.request(endpoint, 'PUT', body);
    }

    static patch(endpoint, body = {}) {
        return Model.request(endpoint, 'PATCH', body);
    }

    static delete(endpoint, params = {}) {
        return Model.request(endpoint, 'DELETE', params);
    }

    static authenticate(username, password) {
        return Model.post('auth/login', { username: username, password: password })
            .done(function(res) {
                if (res.token) {
                    if (typeof Cookies !== 'undefined') {
                        Cookies.set('kore_token', res.token, { expiry: 2592000 });
                    }
                    sessionStorage.setItem('kore_token', res.token);
                    localStorage.setItem('kore_token', res.token);
                    sessionStorage.setItem('kore_user', JSON.stringify(res.user || {}));
                    localStorage.setItem('kore_user', JSON.stringify(res.user || {}));
                }
            });
    }

    static logout() {
        if (typeof Cookies !== 'undefined') {
            Cookies.clear('kore_token');
        }
        sessionStorage.removeItem('kore_token');
        sessionStorage.removeItem('kore_user');
        localStorage.removeItem('kore_token');
        localStorage.removeItem('kore_user');
        window.location.hash = '#/login';
    }
}