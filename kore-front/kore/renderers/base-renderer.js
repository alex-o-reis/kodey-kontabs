/**
 * BaseRenderer — Contrato Abstrato de Renderização de Interface para o Kore Framework.
 * Qualquer designer ou desenvolvedor pode criar seu próprio Renderer estendendo esta classe.
 */
class BaseRenderer {
    constructor(name = 'Base') {
        this.name = name;
    }

    // Utilitários de atributos e elementos genéricos
    getAttributes(attributes) {
        let html = '';
        if (attributes) {
            let entries = Object.entries(attributes);
            for (let i = 0; i < entries.length; i++) {
                let [key, val] = entries[i];
                if (val === '' || val === true) html += ' ' + key;
                else if (val !== false && val !== null && val !== undefined) html += ' ' + key + '="' + String(val).replace(/"/g, '&quot;') + '"';
            }
        }
        return html;
    }

    element(name, attributes = {}, content = '') {
        let attrHtml = this.getAttributes(attributes);
        let voidElements = ['hr', 'br', 'input', 'img', 'meta', 'link'];
        if (voidElements.includes(name.toLowerCase())) {
            return '<' + name + attrHtml + ' />';
        }
        return '<' + name + attrHtml + '>' + (content !== null && content !== undefined ? content : '') + '</' + name + '>';
    }

    div(classes = '', content = '', attributes = {}) {
        return this.element('div', Object.assign({ class: classes }, attributes), content);
    }

    span(classes = '', content = '', attributes = {}) {
        return this.element('span', Object.assign({ class: classes }, attributes), content);
    }

    p(content = '', classes = '', attributes = {}) {
        return this.element('p', Object.assign({ class: classes }, attributes), content);
    }

    hr(classes = '', content = '') {
        return this.element('hr', { class: classes }, content);
    }

    br() {
        return this.element('br');
    }

    href(text, url = '#', target = '_self', classes = '', data = {}, attributes = {}) {
        let attrs = Object.assign({ href: url, target: target, class: classes }, attributes);
        if (typeof data === 'object') {
            for (let [k, v] of Object.entries(data)) {
                attrs['data-' + k] = v;
            }
        } else if (data) {
            attrs['data-id'] = data;
        }
        return this.element('a', attrs, text);
    }

    a(text, url = '#', target = '_self', classes = '', attributes = {}) {
        return this.href(text, url, target, classes, {}, attributes);
    }

    img(src, alt = '', classes = '', attributes = {}) {
        return this.element('img', Object.assign({ src: src, alt: alt, class: classes }, attributes));
    }

    // Títulos (Headings)
    h(level = 1, content = '', classes = '', attributes = {}) {
        return this.element('h' + Math.min(Math.max(level, 1), 6), Object.assign({ class: classes }, attributes), content);
    }
    h1(content = '', classes = '', attributes = {}) { return this.h(1, content, classes, attributes); }
    h2(content = '', classes = '', attributes = {}) { return this.h(2, content, classes, attributes); }
    h3(content = '', classes = '', attributes = {}) { return this.h(3, content, classes, attributes); }
    h4(content = '', classes = '', attributes = {}) { return this.h(4, content, classes, attributes); }
    h5(content = '', classes = '', attributes = {}) { return this.h(5, content, classes, attributes); }
    h6(content = '', classes = '', attributes = {}) { return this.h(6, content, classes, attributes); }

    // Formatação Tipográfica (Inlines)
    b(content = '', classes = '') { return this.element('b', { class: classes }, content); }
    strong(content = '', classes = '') { return this.element('strong', { class: classes }, content); }
    i(content = '', classes = '') { return this.element('i', { class: classes }, content); }
    em(content = '', classes = '') { return this.element('em', { class: classes }, content); }
    u(content = '', classes = '') { return this.element('u', { class: classes }, content); }
    s(content = '', classes = '') { return this.element('s', { class: classes }, content); }
    small(content = '', classes = '') { return this.element('small', { class: classes }, content); }
    code(content = '', classes = '') { return this.element('code', { class: classes }, content); }
    pre(content = '', classes = '') { return this.element('pre', { class: classes }, content); }

    // Listas HTML
    ul(content = '', classes = '', attributes = {}) { return this.element('ul', Object.assign({ class: classes }, attributes), content); }
    ol(content = '', classes = '', attributes = {}) { return this.element('ol', Object.assign({ class: classes }, attributes), content); }
    li(content = '', classes = '', attributes = {}) { return this.element('li', Object.assign({ class: classes }, attributes), content); }

    // Tabelas HTML
    table(content = '', classes = 'table', attributes = {}) { return this.element('table', Object.assign({ class: classes }, attributes), content); }
    thead(content = '', classes = '', attributes = {}) { return this.element('thead', Object.assign({ class: classes }, attributes), content); }
    tbody(content = '', classes = '', attributes = {}) { return this.element('tbody', Object.assign({ class: classes }, attributes), content); }
    tfoot(content = '', classes = '', attributes = {}) { return this.element('tfoot', Object.assign({ class: classes }, attributes), content); }
    tr(content = '', classes = '', attributes = {}) { return this.element('tr', Object.assign({ class: classes }, attributes), content); }
    th(content = '', classes = '', attributes = {}) { return this.element('th', Object.assign({ class: classes }, attributes), content); }
    td(content = '', classes = '', attributes = {}) { return this.element('td', Object.assign({ class: classes }, attributes), content); }


    // Grid System
    row(content = '', classes = '') {
        return this.div('row ' + classes, content);
    }

    col(size = 12, content = '', classes = '') {
        let colClass = size ? 'col-12 col-md-' + size : 'col';
        return this.div(colClass + (classes ? ' ' + classes : ''), content);
    }

    // Formulários
    input(type, id, required = false, label = '', value = '', disabled = false, classes = '', maxLength = null, min = null, max = null, step = null) {
        throw new Error('Method input() must be implemented by Renderer');
    }

    switch(id, checked = false, label = '', disabled = false, classes = '') {
        throw new Error('Method switch() must be implemented by Renderer');
    }

    fileUpload(id, label = '', required = false, accept = '', disabled = false, classes = '') {
        throw new Error('Method fileUpload() must be implemented by Renderer');
    }

    hidden(id, value = '') {
        return this.element('input', { type: 'hidden', id: id, value: value });
    }

    textarea(label, id, rows = 3, content = '', disabled = false, classes = '') {
        throw new Error('Method textarea() must be implemented by Renderer');
    }

    select(id, required = false, label = '', options = [], minLength = 0, disabled = false) {
        throw new Error('Method select() must be implemented by Renderer');
    }

    checkbox(id, checked = false, label = '', classes = '') {
        throw new Error('Method checkbox() must be implemented by Renderer');
    }

    radioButton(id, name, checked = false, label = '', classes = '') {
        throw new Error('Method radioButton() must be implemented by Renderer');
    }

    // Botões
    button(id, text, classes = 'btn-primary', attributes = {}) {
        throw new Error('Method button() must be implemented by Renderer');
    }

    // Cards / Painéis
    card(title, body, footer = '', classes = '') {
        throw new Error('Method card() must be implemented by Renderer');
    }

    cardHeader(title, extra = '') {
        throw new Error('Method cardHeader() must be implemented by Renderer');
    }

    cardBody(content, classes = '') {
        throw new Error('Method cardBody() must be implemented by Renderer');
    }

    cardFooter(content, classes = '') {
        throw new Error('Method cardFooter() must be implemented by Renderer');
    }

    // Modais & Diálogos
    modal(modalId, title, content, footer = '', size = '') {
        throw new Error('Method modal() must be implemented by Renderer');
    }

    confirmDialog(id, title, text, btnConfirmTemAcao = false) {
        throw new Error('Method confirmDialog() must be implemented by Renderer');
    }

    // Badges, Alerts & Toasts
    badge(id, color = 'primary', value = '') {
        throw new Error('Method badge() must be implemented by Renderer');
    }

    alert(type = 'info', content = '', icon = '') {
        throw new Error('Method alert() must be implemented by Renderer');
    }

    toast(title, message, type = 'info') {
        throw new Error('Method toast() must be implemented by Renderer');
    }

    progressBar(id, value = 0, color = 'primary', height = '20px') {
        throw new Error('Method progressBar() must be implemented by Renderer');
    }

    // Tabs
    tabs(id, tabsList = [], classes = '') {
        throw new Error('Method tabs() must be implemented by Renderer');
    }

    tabContent(id, panesList = []) {
        throw new Error('Method tabContent() must be implemented by Renderer');
    }

    // Accordion
    accordion(id, items = [], classes = '') {
        throw new Error('Method accordion() must be implemented by Renderer');
    }

    // Breadcrumb
    breadcrumb(items = [], classes = '') {
        throw new Error('Method breadcrumb() must be implemented by Renderer');
    }

    // Pagination
    pagination(id, currentPage = 1, totalPages = 1, maxVisible = 5, classes = '') {
        throw new Error('Method pagination() must be implemented by Renderer');
    }

    // Input Group & Button Group
    inputGroup(id, label = '', inputEl = '', prepend = '', append = '', classes = '') {
        throw new Error('Method inputGroup() must be implemented by Renderer');
    }

    buttonGroup(buttonsHtml = '', size = '', vertical = false, classes = '') {
        throw new Error('Method buttonGroup() must be implemented by Renderer');
    }

    dropdown(id, text = '', items = [], color = 'primary', classes = '') {
        throw new Error('Method dropdown() must be implemented by Renderer');
    }

    // List Group
    listGroup(items = [], flush = false, classes = '') {
        throw new Error('Method listGroup() must be implemented by Renderer');
    }

    // Offcanvas (Drawer lateral)
    offcanvas(id, title = '', content = '', position = 'end', classes = '') {
        throw new Error('Method offcanvas() must be implemented by Renderer');
    }

    // Skeleton / Placeholders
    skeleton(type = 'text', count = 1, classes = '') {
        throw new Error('Method skeleton() must be implemented by Renderer');
    }

    // Ícones
    icon(iconName, classes = '') {
        throw new Error('Method icon() must be implemented by Renderer');
    }

    loadingIcon(size = '') {
        throw new Error('Method loadingIcon() must be implemented by Renderer');
    }

    // Componentes Ricos (SmartBox, Datatable & Charts)
    smartbox(id, required = false, label = '', options = [], minLength = 0, disabled = false, classes = '') {
        throw new Error('Method smartbox() must be implemented by Renderer');
    }

    datatable(id, config = {}, classes = '') {
        throw new Error('Method datatable() must be implemented by Renderer');
    }

    chart(id, options = {}, classes = '') {
        throw new Error('Method chart() must be implemented by Renderer');
    }
}