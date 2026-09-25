/**
 * UI — Relay Engine de Interface do Kore Framework.
 * A classe UI centraliza as chamadas de construcao de HTML e despacha para o Renderer ativo.
 */
class UI {
    static _renderer = null;

    /**
     * Define o Renderer ativo para geracao de componentes.
     * @param {BaseRenderer} rendererInst
     */
    static setRenderer(rendererInst) {
        UI._renderer = rendererInst;
    }

    /**
     * Retorna o Renderer ativo. Se nenhum tiver sido definido, inicializa o BootstrapRenderer por padrao.
     * @returns {BaseRenderer}
     */
    static getRenderer() {
        if (!UI._renderer) {
            if (typeof BootstrapRenderer !== 'undefined') {
                UI._renderer = new BootstrapRenderer();
            } else if (typeof BaseRenderer !== 'undefined') {
                UI._renderer = new BaseRenderer();
            }
        }
        return UI._renderer;
    }

    // --- Submódulo de Estilos e Classes CSS ---
    static get Style() { return typeof Style !== 'undefined' ? Style : null; }
    static get CSS() { return typeof Style !== 'undefined' ? Style : null; }

    /**
     * Mescla e sanitiza arrays ou múltiplos argumentos de classes CSS.
     * Exemplo: UI.classes(Style.btn('primary'), Style.shadowHover(), Style.roundedXl())
     * @param {...(string|Array<string>|StyleBuilder)} classList
     * @returns {string}
     */
    static classes(...classList) {
        if (typeof Style !== 'undefined' && typeof Style.classes === 'function') {
            return Style.classes(...classList);
        }
        return classList.flat(Infinity).filter(Boolean).join(' ');
    }



    // --- Relay para o Renderer Ativo (HTML Base & Typography) ---
    static element(name, attributes, content) {
        return UI.getRenderer().element(name, attributes, content);
    }

    static div(classes, content, attributes) {
        return UI.getRenderer().div(classes, content, attributes);
    }

    static span(classes, content, attributes) {
        return UI.getRenderer().span(classes, content, attributes);
    }

    static p(content, classes, attributes) {
        return UI.getRenderer().p(content, classes, attributes);
    }

    static hr(classes, content) {
        return UI.getRenderer().hr(classes, content);
    }

    static br() {
        return UI.getRenderer().br();
    }

    static href(text, url, target, classes, data, attributes) {
        return UI.getRenderer().href(text, url, target, classes, data, attributes);
    }

    static a(text, url, target, classes, attributes) {
        return UI.getRenderer().a(text, url, target, classes, attributes);
    }

    static img(src, alt, classes, attributes) {
        return UI.getRenderer().img(src, alt, classes, attributes);
    }

    // Títulos (Headings)
    static h(level, content, classes, attributes) { return UI.getRenderer().h(level, content, classes, attributes); }
    static h1(content, classes, attributes) { return UI.getRenderer().h1(content, classes, attributes); }
    static h2(content, classes, attributes) { return UI.getRenderer().h2(content, classes, attributes); }
    static h3(content, classes, attributes) { return UI.getRenderer().h3(content, classes, attributes); }
    static h4(content, classes, attributes) { return UI.getRenderer().h4(content, classes, attributes); }
    static h5(content, classes, attributes) { return UI.getRenderer().h5(content, classes, attributes); }
    static h6(content, classes, attributes) { return UI.getRenderer().h6(content, classes, attributes); }

    // Formatação Tipográfica (Inlines)
    static b(content, classes) { return UI.getRenderer().b(content, classes); }
    static strong(content, classes) { return UI.getRenderer().strong(content, classes); }
    static i(content, classes) { return UI.getRenderer().i(content, classes); }
    static em(content, classes) { return UI.getRenderer().em(content, classes); }
    static u(content, classes) { return UI.getRenderer().u(content, classes); }
    static s(content, classes) { return UI.getRenderer().s(content, classes); }
    static small(content, classes) { return UI.getRenderer().small(content, classes); }
    static code(content, classes) { return UI.getRenderer().code(content, classes); }
    static pre(content, classes) { return UI.getRenderer().pre(content, classes); }

    // Listas HTML
    static ul(content, classes, attributes) { return UI.getRenderer().ul(content, classes, attributes); }
    static ol(content, classes, attributes) { return UI.getRenderer().ol(content, classes, attributes); }
    static li(content, classes, attributes) { return UI.getRenderer().li(content, classes, attributes); }

    // Tabelas HTML
    static table(content, classes, attributes) { return UI.getRenderer().table(content, classes, attributes); }
    static thead(content, classes, attributes) { return UI.getRenderer().thead(content, classes, attributes); }
    static tbody(content, classes, attributes) { return UI.getRenderer().tbody(content, classes, attributes); }
    static tfoot(content, classes, attributes) { return UI.getRenderer().tfoot(content, classes, attributes); }
    static tr(content, classes, attributes) { return UI.getRenderer().tr(content, classes, attributes); }
    static th(content, classes, attributes) { return UI.getRenderer().th(content, classes, attributes); }
    static td(content, classes, attributes) { return UI.getRenderer().td(content, classes, attributes); }

    // --- Relay para Componentes de Layout & Forms ---
    static row(content, classes) {
        return UI.getRenderer().row(content, classes);
    }


    static col(size, content, classes) {
        return UI.getRenderer().col(size, content, classes);
    }

    static input(type, id, required, label, value, disabled, classes, maxLength, min, max, step) {
        return UI.getRenderer().input(type, id, required, label, value, disabled, classes, maxLength, min, max, step);
    }

    static switch(id, checked, label, disabled, classes) {
        return UI.getRenderer().switch(id, checked, label, disabled, classes);
    }

    static fileUpload(id, label, required, accept, disabled, classes) {
        return UI.getRenderer().fileUpload(id, label, required, accept, disabled, classes);
    }

    static hidden(id, value) {
        return UI.getRenderer().hidden(id, value);
    }

    static textarea(label, id, rows, content, disabled, classes) {
        return UI.getRenderer().textarea(label, id, rows, content, disabled, classes);
    }

    static select(id, required, label, options, minLength, disabled) {
        return UI.getRenderer().select(id, required, label, options, minLength, disabled);
    }

    static checkbox(id, checked, label, classes) {
        return UI.getRenderer().checkbox(id, checked, label, classes);
    }

    static radioButton(id, name, checked, label, classes) {
        return UI.getRenderer().radioButton(id, name, checked, label, classes);
    }

    static button(id, text, classes, attributes) {
        return UI.getRenderer().button(id, text, classes, attributes);
    }

    static card(title, body, footer, classes) {
        return UI.getRenderer().card(title, body, footer, classes);
    }

    static cardHeader(title, extra) {
        return UI.getRenderer().cardHeader(title, extra);
    }

    static cardBody(content, classes) {
        return UI.getRenderer().cardBody(content, classes);
    }

    static cardFooter(content, classes) {
        return UI.getRenderer().cardFooter(content, classes);
    }

    static modal(modalId, title, content, footer, size) {
        return UI.getRenderer().modal(modalId, title, content, footer, size);
    }

    static confirmDialog(id, title, text, btnConfirmTemAcao) {
        return UI.getRenderer().confirmDialog(id, title, text, btnConfirmTemAcao);
    }

    static badge(id, color, value) {
        return UI.getRenderer().badge(id, color, value);
    }

    static alert(type, content, icon) {
        return UI.getRenderer().alert(type, content, icon);
    }

    static toast(title, message, type) {
        return UI.getRenderer().toast(title, message, type);
    }

    static progressBar(id, value, color, height) {
        return UI.getRenderer().progressBar(id, value, color, height);
    }

    static tabs(id, tabsList, classes) {
        return UI.getRenderer().tabs(id, tabsList, classes);
    }

    static tabContent(id, panesList) {
        return UI.getRenderer().tabContent(id, panesList);
    }

    static accordion(id, items, classes) {
        return UI.getRenderer().accordion(id, items, classes);
    }

    static breadcrumb(items, classes) {
        return UI.getRenderer().breadcrumb(items, classes);
    }

    static pagination(id, currentPage, totalPages, maxVisible, classes) {
        return UI.getRenderer().pagination(id, currentPage, totalPages, maxVisible, classes);
    }

    static inputGroup(id, label, inputEl, prepend, append, classes) {
        return UI.getRenderer().inputGroup(id, label, inputEl, prepend, append, classes);
    }

    static buttonGroup(buttonsHtml, size, vertical, classes) {
        return UI.getRenderer().buttonGroup(buttonsHtml, size, vertical, classes);
    }

    static dropdown(id, text, items, color, classes) {
        return UI.getRenderer().dropdown(id, text, items, color, classes);
    }

    static listGroup(items, flush, classes) {
        return UI.getRenderer().listGroup(items, flush, classes);
    }

    static offcanvas(id, title, content, position, classes) {
        return UI.getRenderer().offcanvas(id, title, content, position, classes);
    }

    static skeleton(type, count, classes) {
        return UI.getRenderer().skeleton(type, count, classes);
    }

    static icon(iconName, classes) {
        return UI.getRenderer().icon(iconName, classes);
    }

    static loadingIcon(size) {
        return UI.getRenderer().loadingIcon(size);
    }

    // --- Componentes Ricos (SmartBox, Datatable & Charts) ---
    static smartbox(id, required, label, options, minLength, disabled, classes) {
        return UI.getRenderer().smartbox(id, required, label, options, minLength, disabled, classes);
    }

    static datatable(id, config, classes) {
        return UI.getRenderer().datatable(id, config, classes);
    }

    static chart(id, options, classes) {
        return UI.getRenderer().chart(id, options, classes);
    }

    static get KodeyCharts() {
        return typeof KodeyCharts !== 'undefined' ? KodeyCharts : null;
    }

    static get Datatable() {
        return typeof Datatable !== 'undefined' ? Datatable : null;
    }

    // --- Helpers de Manipulação de DOM / jQuery ---
    static setValue(selectorId, value, triggerChange = true) {
        let el = jQuery(selectorId);
        if (!el.length) return;

        if (el.is(':checkbox')) {
            el.prop('checked', Boolean(value));
        } else if (el.is(':radio')) {
            el.val([value]);
        } else if (el.is('select')) {
            el.val(value);
            if (el.hasClass('smartselect')) {
                let text = el.find('option:selected').text() || '';
                jQuery(selectorId + '-smartinput').val(text);
            }
        } else {
            el.val(value);
        }

        if (triggerChange) {
            el.trigger('change');
        }
    }

    static showModal(selectorId) {
        let rawId = selectorId.startsWith('#') ? selectorId.substring(1) : selectorId;
        let modalEl = document.getElementById(rawId);
        if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            let modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modalInstance.show();
        } else if (typeof jQuery !== 'undefined') {
            jQuery(selectorId).modal('show');
        }
    }

    static hideModal(selectorId) {
        let rawId = selectorId.startsWith('#') ? selectorId.substring(1) : selectorId;
        let modalEl = document.getElementById(rawId);
        if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            let modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
        } else if (typeof jQuery !== 'undefined') {
            jQuery(selectorId).modal('hide');
        }
    }

    static showOffcanvas(selectorId) {
        let rawId = selectorId.startsWith('#') ? selectorId.substring(1) : selectorId;
        let offcanvasEl = document.getElementById(rawId);
        if (offcanvasEl && typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
            let offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
            offcanvasInstance.show();
        }
    }

    static hideOffcanvas(selectorId) {
        let rawId = selectorId.startsWith('#') ? selectorId.substring(1) : selectorId;
        let offcanvasEl = document.getElementById(rawId);
        if (offcanvasEl && typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
            let offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl);
            if (offcanvasInstance) offcanvasInstance.hide();
        }
    }
}