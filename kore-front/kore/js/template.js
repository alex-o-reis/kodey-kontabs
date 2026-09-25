/**
 * Template Loader para o Kore Framework
 */
class Template {
    constructor() {
        this.cache = {};
    }

    getTemplate(name, href, callback) {
        if (this.cache[name]) {
            callback(this.cache[name]);
            return;
        }

        let self = this;
        $.ajax({
            url: href,
            type: 'GET',
            dataType: 'html',
            cache: false,
            success: function(data) {
                self.cache[name] = data;
                callback(data);
            },
            error: function(xhr) {
                console.error('Falha ao carregar template ' + name + ' em ' + href, xhr);
                callback('<div class="alert alert-danger">Erro ao carregar template ' + name + '</div>');
            }
        });
    }
}