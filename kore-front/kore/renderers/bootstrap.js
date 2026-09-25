/**
 * BootstrapRenderer — Implementação nativa do Renderer para Bootstrap 5.3+ e Bootstrap Icons.
 */
class BootstrapRenderer extends BaseRenderer {
    constructor() {
        super('Bootstrap 5');
    }

    // Formulários
    input(type = 'text', id = '', required = false, label = '', value = '', disabled = false, classes = '', maxLength = null, min = null, max = null, step = null) {
        let attrs = {
            type: type,
            class: 'form-control' + (classes ? ' ' + classes : ''),
            id: id,
            name: id,
            value: value
        };
        if (required) attrs.required = required;
        if (disabled) attrs.disabled = disabled;
        if (maxLength) attrs.maxlength = maxLength;
        if (min !== null) attrs.min = min;
        if (max !== null) attrs.max = max;
        if (step !== null) attrs.step = step;

        let inputEl = this.element('input', attrs);
        if (!label) return inputEl;

        let labelEl = this.element('label', { for: id, class: 'form-label fw-medium' }, label + (required ? ' *' : ''));
        return this.div('mb-3', labelEl + inputEl);
    }

    switch(id, checked = false, label = '', disabled = false, classes = '') {
        let attrs = {
            class: 'form-check-input' + (classes ? ' ' + classes : ''),
            type: 'checkbox',
            role: 'switch',
            id: id,
            name: id
        };
        if (checked) attrs.checked = checked;
        if (disabled) attrs.disabled = disabled;

        let inputEl = this.element('input', attrs);
        let labelEl = label ? this.element('label', { class: 'form-check-label', for: id }, label) : '';
        return this.div('form-check form-switch mb-3', inputEl + labelEl);
    }

    fileUpload(id, label = '', required = false, accept = '', disabled = false, classes = '') {
        let attrs = {
            class: 'form-control' + (classes ? ' ' + classes : ''),
            type: 'file',
            id: id,
            name: id
        };
        if (required) attrs.required = required;
        if (disabled) attrs.disabled = disabled;
        if (accept) attrs.accept = accept;

        let inputEl = this.element('input', attrs);
        let labelEl = label ? this.element('label', { class: 'form-label fw-medium', for: id }, label + (required ? ' *' : '')) : '';
        return this.div('mb-3', labelEl + inputEl);
    }

    textarea(label = '', id = '', rows = 3, content = '', disabled = false, classes = '') {
        let attrs = {
            id: id,
            name: id,
            class: 'form-control' + (classes ? ' ' + classes : ''),
            rows: rows
        };
        if (disabled) attrs.disabled = disabled;

        let textareaEl = this.element('textarea', attrs, content);
        if (!label) return textareaEl;

        let labelEl = this.element('label', { for: id, class: 'form-label fw-medium' }, label);
        return this.div('mb-3', labelEl + textareaEl);
    }

    select(id, required = false, label = '', options = [], minLength = 0, disabled = false) {
        let optionsHtml = '';
        if (Array.isArray(options)) {
            for (let opt of options) {
                let optAttrs = { value: opt.value };
                if (opt.selected) optAttrs.selected = 'selected';
                if (opt.disabled) optAttrs.disabled = 'disabled';
                optionsHtml += this.element('option', optAttrs, opt.text || opt.label || opt.value);
            }
        }

        let selectAttrs = {
            class: 'form-select smartselect',
            id: id,
            name: id,
            'data-min': minLength
        };
        if (required) selectAttrs.required = required;
        if (disabled) selectAttrs.disabled = disabled;

        let selectEl = this.element('select', selectAttrs, optionsHtml);

        let smartInputAttrs = {
            type: 'text',
            class: 'form-control smartinput',
            id: id + '-smartinput',
            'data-for': id,
            autocomplete: 'off',
            placeholder: '-- Selecione --'
        };
        if (disabled) smartInputAttrs.disabled = disabled;

        let labelText = label + (required ? ' *' : '');
        let labelEl = label ? this.element('label', { for: id + '-smartinput', class: 'form-label fw-medium' }, labelText + this.element('span', { class: 'smartbox-loading ms-2 d-none', 'data-for': id }, this.loadingIcon())) : '';

        let smartInputEl = this.element('input', smartInputAttrs);
        let dropdownWrap = this.div('smartbox-dropdown', smartInputEl);

        return this.div('mb-3', labelEl + selectEl + dropdownWrap);
    }

    checkbox(id, checked = false, label = '', classes = '') {
        let attrs = {
            class: 'form-check-input' + (classes ? ' ' + classes : ''),
            type: 'checkbox',
            id: id,
            name: id
        };
        if (checked) attrs.checked = checked;

        let inputEl = this.element('input', attrs);
        let labelEl = label ? this.element('label', { class: 'form-check-label', for: id }, label) : '';
        return this.div('form-check mb-2', inputEl + labelEl);
    }

    radioButton(id, name, checked = false, label = '', classes = '') {
        let attrs = {
            class: 'form-check-input' + (classes ? ' ' + classes : ''),
            type: 'radio',
            id: id,
            name: name
        };
        if (checked) attrs.checked = checked;

        let inputEl = this.element('input', attrs);
        let labelEl = label ? this.element('label', { class: 'form-check-label', for: id }, label) : '';
        return this.div('form-check mb-2', inputEl + labelEl);
    }

    // Botões
    button(id, text, classes = 'btn-primary', attributes = {}) {
        let attrs = Object.assign({
            type: 'button',
            class: 'btn ' + (classes.startsWith('btn-') ? classes : 'btn-' + classes)
        }, attributes || {});

        if (id) attrs.id = id;
        return this.element('button', attrs, text);
    }

    // Cards / Painéis
    card(title = '', body = '', footer = '', classes = '') {
        let headerHtml = title ? this.cardHeader(title) : '';
        let bodyHtml = this.cardBody(body);
        let footerHtml = footer ? this.cardFooter(footer) : '';

        return this.div('card shadow-sm mb-4 ' + classes, headerHtml + bodyHtml + footerHtml);
    }

    cardHeader(title, extra = '') {
        let titleHtml = typeof title === 'string' && !title.startsWith('<') ? this.element('h5', { class: 'card-title mb-0' }, title) : title;
        return this.div('card-header d-flex justify-content-between align-items-center', titleHtml + extra);
    }

    cardBody(content, classes = '') {
        return this.div('card-body ' + classes, content);
    }

    cardFooter(content, classes = '') {
        return this.div('card-footer text-muted ' + classes, content);
    }

    // Modais & Diálogos
    modal(modalId, title, content, footer = '', size = '') {
        let closeBtn = this.element('button', { type: 'button', class: 'btn-close', 'data-bs-dismiss': 'modal', 'aria-label': 'Close' });
        let modalTitle = this.element('h5', { class: 'modal-title', id: modalId + 'Label' }, title);
        let modalHeader = this.div('modal-header', modalTitle + closeBtn);
        let modalBody = this.div('modal-body', content);
        let modalFooter = footer ? this.div('modal-footer', footer) : '';

        let modalContent = this.div('modal-content shadow', modalHeader + modalBody + modalFooter);
        let modalDialog = this.div('modal-dialog modal-dialog-centered ' + size, modalContent);

        return this.element('div', {
            class: 'modal fade',
            id: modalId,
            tabindex: -1,
            'aria-labelledby': modalId + 'Label',
            'aria-hidden': 'true'
        }, modalDialog);
    }

    confirmDialog(id, title, text, btnConfirmTemAcao = false) {
        let btnConfirmId = btnConfirmTemAcao ? 'btn-confirm-' + id : 'btn-confirm-' + id;
        let btnConfirm = this.button(btnConfirmId, 'Confirmar', 'btn-primary');
        let btnCancel = this.button('btn-cancel-' + id, 'Cancelar', 'btn-secondary', { 'data-bs-dismiss': 'modal' });
        let botoes = btnCancel + ' ' + btnConfirm;
        return this.modal(id, title, text, botoes);
    }

    // Badges & Alerts
    badge(id, color = 'primary', value = '') {
        let attrs = { class: 'badge text-bg-' + color };
        if (id) attrs.id = id;
        return this.element('span', attrs, value);
    }

    alert(type = 'info', content = '', icon = '') {
        let iconHtml = icon ? this.icon(icon) + ' ' : '';
        let closeBtn = this.element('button', { type: 'button', class: 'btn-close', 'data-bs-dismiss': 'alert', 'aria-label': 'Close' });
        return this.div('alert alert-' + type + ' alert-dismissible fade show shadow-sm', iconHtml + content + closeBtn);
    }

    toast(title, message, type = 'info') {
        let bgClass = type === 'error' || type === 'danger' ? 'text-bg-danger' : (type === 'success' ? 'text-bg-success' : (type === 'warning' ? 'text-bg-warning' : 'text-bg-primary'));
        let toastHtml = `
        <div class="toast align-items-center ${bgClass} border-0 show shadow" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${title ? '<strong>' + title + '</strong><br>' : ''}${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>`;

        let container = jQuery('#kore-toast-container');
        if (!container.length) {
            jQuery('body').append('<div id="kore-toast-container" class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1090;"></div>');
            container = jQuery('#kore-toast-container');
        }

        let toastEl = jQuery(toastHtml);
        container.append(toastEl);
        setTimeout(() => toastEl.fadeOut(300, function() { jQuery(this).remove(); }), 4000);
        return toastHtml;
    }

    progressBar(id, value = 0, color = 'primary', height = '20px') {
        let barAttrs = {
            id: id,
            class: 'progress-bar bg-' + color + ' progress-bar-striped progress-bar-animated',
            role: 'progressbar',
            style: 'width: ' + value + '%;',
            'aria-valuenow': value,
            'aria-valuemin': 0,
            'aria-valuemax': 100
        };
        let bar = this.element('div', barAttrs, value + '%');
        return this.div('progress mb-3', bar);
    }

    // Tabs
    tabs(id, tabsList = [], classes = '') {
        let itemsHtml = '';
        for (let i = 0; i < tabsList.length; i++) {
            let tab = tabsList[i];
            let active = i === 0 || tab.active ? ' active' : '';
            let linkAttrs = {
                class: 'nav-link' + active,
                id: tab.id + '-tab',
                'data-bs-toggle': 'tab',
                'data-bs-target': '#' + tab.id,
                type: 'button',
                role: 'tab',
                'aria-controls': tab.id,
                'aria-selected': active ? 'true' : 'false'
            };
            let link = this.element('button', linkAttrs, tab.text || tab.title);
            itemsHtml += this.element('li', { class: 'nav-item', role: 'presentation' }, link);
        }
        return this.element('ul', { class: 'nav nav-tabs ' + classes, id: id, role: 'tablist' }, itemsHtml);
    }

    tabContent(id, panesList = []) {
        let panesHtml = '';
        for (let i = 0; i < panesList.length; i++) {
            let pane = panesList[i];
            let active = i === 0 || pane.active ? ' show active' : '';
            panesHtml += this.div('tab-pane fade' + active + (pane.classes ? ' ' + pane.classes : ''), pane.content);
        }
        return this.div('tab-content p-3 border border-top-0 rounded-bottom bg-white', panesHtml);
    }

    // Accordion
    accordion(id, items = [], classes = '') {
        let itemsHtml = '';
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let itemId = id + '-collapse-' + i;
            let headerId = id + '-heading-' + i;
            let show = item.active ? ' show' : '';
            let collapsed = item.active ? '' : ' collapsed';

            let btnAttrs = {
                class: 'accordion-button' + collapsed,
                type: 'button',
                'data-bs-toggle': 'collapse',
                'data-bs-target': '#' + itemId,
                'aria-expanded': item.active ? 'true' : 'false',
                'aria-controls': itemId
            };
            let btn = this.element('button', btnAttrs, item.title || item.header);
            let header = this.element('h2', { class: 'accordion-header', id: headerId }, btn);
            let body = this.div('accordion-body', item.content || item.body);
            let collapse = this.element('div', {
                id: itemId,
                class: 'accordion-collapse collapse' + show,
                'aria-labelledby': headerId,
                'data-bs-parent': '#' + id
            }, body);

            itemsHtml += this.div('accordion-item', header + collapse);
        }
        return this.div('accordion ' + classes, itemsHtml, { id: id });
    }

    // Breadcrumb
    breadcrumb(items = [], classes = '') {
        let itemsHtml = '';
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let isLast = i === items.length - 1;
            if (isLast || !item.url) {
                itemsHtml += this.element('li', { class: 'breadcrumb-item active', 'aria-current': 'page' }, item.text || item.title);
            } else {
                let link = this.href(item.text || item.title, item.url);
                itemsHtml += this.element('li', { class: 'breadcrumb-item' }, link);
            }
        }
        let ol = this.element('ol', { class: 'breadcrumb mb-0 ' + classes }, itemsHtml);
        return this.element('nav', { 'aria-label': 'breadcrumb' }, ol);
    }

    // Pagination
    pagination(id, currentPage = 1, totalPages = 1, maxVisible = 5, classes = '') {
        if (totalPages <= 1) return '';
        let itemsHtml = '';

        // Previous button
        let prevDisabled = currentPage <= 1 ? ' disabled' : '';
        let prevLink = this.element('a', { class: 'page-link', href: '#', 'data-page': currentPage - 1, 'aria-label': 'Anterior' }, '&laquo;');
        itemsHtml += this.element('li', { class: 'page-item' + prevDisabled }, prevLink);

        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let p = startPage; p <= endPage; p++) {
            let active = p === currentPage ? ' active' : '';
            let pageLink = this.element('a', { class: 'page-link', href: '#', 'data-page': p }, p);
            itemsHtml += this.element('li', { class: 'page-item' + active }, pageLink);
        }

        // Next button
        let nextDisabled = currentPage >= totalPages ? ' disabled' : '';
        let nextLink = this.element('a', { class: 'page-link', href: '#', 'data-page': currentPage + 1, 'aria-label': 'Próximo' }, '&raquo;');
        itemsHtml += this.element('li', { class: 'page-item' + nextDisabled }, nextLink);

        let ul = this.element('ul', { class: 'pagination mb-0 ' + classes, id: id }, itemsHtml);
        return this.element('nav', { 'aria-label': 'Navegação de página' }, ul);
    }

    // Input Group
    inputGroup(id, label = '', inputEl = '', prepend = '', append = '', classes = '') {
        let prependHtml = prepend ? (prepend.startsWith('<') ? prepend : this.span('input-group-text', prepend)) : '';
        let appendHtml = append ? (append.startsWith('<') ? append : this.span('input-group-text', append)) : '';
        let group = this.div('input-group ' + classes, prependHtml + inputEl + appendHtml);

        if (!label) return group;
        let labelEl = this.element('label', { for: id, class: 'form-label fw-medium' }, label);
        return this.div('mb-3', labelEl + group);
    }

    buttonGroup(buttonsHtml = '', size = '', vertical = false, classes = '') {
        let sizeClass = size ? ' btn-group-' + size : '';
        let typeClass = vertical ? 'btn-group-vertical' : 'btn-group';
        return this.div(typeClass + sizeClass + (classes ? ' ' + classes : ''), buttonsHtml, { role: 'group' });
    }

    dropdown(id, text = '', items = [], color = 'primary', classes = '') {
        let btnAttrs = {
            class: 'btn btn-' + color + ' dropdown-toggle ' + classes,
            type: 'button',
            id: id,
            'data-bs-toggle': 'dropdown',
            'aria-expanded': 'false'
        };
        let btn = this.element('button', btnAttrs, text);

        let menuHtml = '';
        for (let item of items) {
            if (item.divider) {
                menuHtml += this.element('li', {}, this.hr('dropdown-divider'));
            } else if (item.header) {
                menuHtml += this.element('li', {}, this.element('h6', { class: 'dropdown-header' }, item.header));
            } else {
                let linkAttrs = {
                    class: 'dropdown-item' + (item.active ? ' active' : '') + (item.disabled ? ' disabled' : ''),
                    href: item.url || '#'
                };
                if (item.id) linkAttrs.id = item.id;
                if (item.data) {
                    for (let [k, v] of Object.entries(item.data)) linkAttrs['data-' + k] = v;
                }
                let iconHtml = item.icon ? this.icon(item.icon) + ' ' : '';
                menuHtml += this.element('li', {}, this.element('a', linkAttrs, iconHtml + (item.text || item.title)));
            }
        }

        let menu = this.element('ul', { class: 'dropdown-menu shadow-sm', 'aria-labelledby': id }, menuHtml);
        return this.div('dropdown d-inline-block', btn + menu);
    }

    // List Group
    listGroup(items = [], flush = false, classes = '') {
        let flushClass = flush ? ' list-group-flush' : '';
        let itemsHtml = '';
        for (let item of items) {
            let active = item.active ? ' active' : '';
            let disabled = item.disabled ? ' disabled' : '';
            let isAction = item.action || item.url;
            let tag = isAction ? 'a' : 'li';
            let itemAttrs = {
                class: 'list-group-item d-flex justify-content-between align-items-center' + (isAction ? ' list-group-item-action' : '') + active + disabled + (item.classes ? ' ' + item.classes : '')
            };
            if (item.url) itemAttrs.href = item.url;
            if (item.id) itemAttrs.id = item.id;

            let badgeHtml = item.badge ? this.badge(null, item.badgeColor || 'primary', item.badge) : '';
            let contentHtml = (item.icon ? this.icon(item.icon) + ' ' : '') + (item.text || item.content || '');
            itemsHtml += this.element(tag, itemAttrs, contentHtml + badgeHtml);
        }
        return this.element('ul', { class: 'list-group' + flushClass + (classes ? ' ' + classes : '') }, itemsHtml);
    }

    // Offcanvas (Drawer lateral)
    offcanvas(id, title = '', content = '', position = 'end', classes = '') {
        let closeBtn = this.element('button', { type: 'button', class: 'btn-close text-reset', 'data-bs-dismiss': 'offcanvas', 'aria-label': 'Close' });
        let offcanvasTitle = this.element('h5', { class: 'offcanvas-title', id: id + 'Label' }, title);
        let header = this.div('offcanvas-header', offcanvasTitle + closeBtn);
        let body = this.div('offcanvas-body', content);

        return this.element('div', {
            class: 'offcanvas offcanvas-' + position + ' ' + classes,
            tabindex: '-1',
            id: id,
            'aria-labelledby': id + 'Label'
        }, header + body);
    }

    // Skeleton / Placeholders
    skeleton(type = 'text', count = 1, classes = '') {
        let html = '';
        for (let i = 0; i < count; i++) {
            if (type === 'card') {
                let imgPlaceholder = this.div('card-img-top placeholder-glow', this.span('placeholder col-12 bg-secondary', '', { style: 'height: 140px; display: block;' }));
                let titlePl = this.element('p', { class: 'card-text placeholder-glow' }, this.span('placeholder col-6'));
                let textPl = this.element('p', { class: 'card-text placeholder-glow' }, this.span('placeholder col-7 me-1') + this.span('placeholder col-4') + this.span('placeholder col-4 me-1') + this.span('placeholder col-6'));
                let btnPl = this.element('a', { class: 'btn btn-primary disabled placeholder col-6' }, '');
                html += this.div('card shadow-sm mb-3 ' + classes, imgPlaceholder + this.div('card-body', titlePl + textPl + btnPl));
            } else {
                html += this.element('p', { class: 'placeholder-glow mb-2 ' + classes }, this.span('placeholder col-12 bg-secondary-subtle'));
            }
        }
        return html;
    }

    // Ícones (Bootstrap Icons nativo)
    icon(iconName, classes = '') {
        let name = iconName.startsWith('bi-') ? iconName : 'bi-' + iconName;
        return this.element('i', { class: 'bi ' + name + (classes ? ' ' + classes : '') });
    }

    loadingIcon(size = '') {
        return this.element('div', { class: 'spinner-border text-primary ' + (size ? 'spinner-border-' + size : 'spinner-border-sm'), role: 'status' }, this.element('span', { class: 'visually-hidden' }, 'Carregando...'));
    }

    // Componentes Ricos (SmartBox, Datatable & Charts)
    smartbox(id, required = false, label = '', options = [], minLength = 0, disabled = false, classes = '') {
        return this.select(id, required, label, options, minLength, disabled);
    }

    datatable(id, config = {}, classes = '') {
        let dt = new Datatable();
        dt.configurarDatatable(config);
        let tableHtml = dt.criarTabela(id);
        
        // Auto-inicializa o DataTable após renderizar no DOM se jQuery estiver pronto
        setTimeout(function() {
            if (jQuery('#' + id).length && !jQuery.fn.DataTable.isDataTable('#' + id)) {
                dt.inicializarDatatable();
            }
        }, 50);

        return this.div('kore-datatable-wrapper ' + classes, tableHtml);
    }

    chart(id, options = {}, classes = '') {
        let chartContainer = this.element('div', {
            id: id,
            class: 'kore-chart-container position-relative ' + classes,
            style: 'min-height: ' + (options.height || '320px') + '; width: ' + (options.width || '100%') + ';'
        }, '');

        // Auto-plota o KodeyChart se a configuração tiver dados
        if (options && (options.series || options.labels || options.type)) {
            setTimeout(function() {
                if (jQuery('#' + id).length && typeof KodeyCharts !== 'undefined') {
                    let kc = new KodeyCharts(options.globalConfig || {});
                    let chartConfig = Object.assign({}, options, { container: '#' + id });
                    kc.plot(chartConfig);
                }
            }, 50);
        }

        return chartContainer;
    }
}