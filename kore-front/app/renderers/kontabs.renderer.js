/**
 * KontabsRenderer — Camada de Renderização do Kodey Kontabs baseada no Brand Kit Oficial.
 * Estende o BootstrapRenderer do Kore Framework sem criar um framework paralelo.
 * Powered by Kore Framework (KKF).
 */
class KontabsRenderer extends BootstrapRenderer {
    constructor() {
        super();
        this.name = 'Kontabs Brand Kit';
        this.assetsPath = 'app/assets/';
    }

    // ==========================================================
    // 1. BOTÕES (KontabsButton)
    // ==========================================================
    kontabsButton(id, text, variant = 'primary', icon = '', attributes = {}) {
        let variantClass = 'btn-kontabs-' + variant;
        let iconHtml = icon ? `<i class="bi ${icon} me-1"></i>` : '';
        let attrs = Object.assign({ id: id, type: 'button' }, attributes);
        attrs.class = 'btn ' + variantClass + (attrs.class ? ' ' + attrs.class : '');
        return this.element('button', attrs, iconHtml + text);
    }

    button(id, text, classes = 'btn-kontabs-primary', attributes = {}) {
        return this.kontabsButton(id, text, classes.replace('btn-kontabs-', '').replace('btn-', ''), '', attributes);
    }

    // ==========================================================
    // 2. CARTÕES (KontabsCard)
    // ==========================================================
    kontabsCard(title = '', body = '', footer = '', classes = '', badge = '') {
        let headerHtml = '';
        if (title) {
            let badgeHtml = badge ? `<span class="pill pill-success">${badge}</span>` : '';
            headerHtml = `<div class="kontabs-card-header d-flex justify-content-between align-items-center"><span>${title}</span>${badgeHtml}</div>`;
        }
        let bodyHtml = `<div class="kontabs-card-body">${body}</div>`;
        let footerHtml = footer ? `<div class="kontabs-card-footer">${footer}</div>` : '';
        let cardClasses = 'kontabs-card' + (classes ? ' ' + classes : '');
        return this.div(cardClasses, headerHtml + bodyHtml + footerHtml);
    }

    card(title, body, footer = '', classes = '') {
        return this.kontabsCard(title, body, footer, classes);
    }

    // ==========================================================
    // 3. CAMPOS DE FORMULÁRIO (KontabsInput, Select, Money, Date)
    // ==========================================================
    kontabsInput(type = 'text', id = '', label = '', value = '', required = false, placeholder = '', classes = '') {
        let labelEl = label ? `<label class="form-label" for="${id}">${label}${required ? ' <span class="text-danger">*</span>' : ''}</label>` : '';
        let attrs = {
            type: type,
            class: 'form-control' + (classes ? ' ' + classes : ''),
            id: id,
            name: id,
            value: value,
            placeholder: placeholder
        };
        if (required) attrs.required = true;
        let inputEl = this.element('input', attrs);
        return this.div('mb-3', labelEl + inputEl);
    }

    kontabsMoneyInput(id, label = 'Valor', value = '', required = false, placeholder = '0,00') {
        let labelEl = label ? `<label class="form-label" for="${id}">${label}${required ? ' <span class="text-danger">*</span>' : ''}</label>` : '';
        let inputGroup = `
            <div class="input-group kontabs-money-group">
                <span class="input-group-text">R$</span>
                <input type="text" class="form-control kontabs-currency-mask" id="${id}" name="${id}" value="${value}" placeholder="${placeholder}" ${required ? 'required' : ''}>
            </div>
        `;
        return this.div('mb-3', labelEl + inputGroup);
    }

    kontabsDateInput(id, label = 'Data de Vencimento', value = '', required = false) {
        return this.kontabsInput('date', id, label, value, required);
    }

    kontabsSelect(id, label, options = [], selected = '', required = false) {
        let labelEl = label ? `<label class="form-label" for="${id}">${label}${required ? ' <span class="text-danger">*</span>' : ''}</label>` : '';
        let optionsHtml = '';
        for (let opt of options) {
            let isSel = (opt.value === selected) ? ' selected' : '';
            optionsHtml += `<option value="${opt.value}"${isSel}>${opt.text || opt.label}</option>`;
        }
        let selectEl = `<select class="form-select" id="${id}" name="${id}" ${required ? 'required' : ''}>${optionsHtml}</select>`;
        return this.div('mb-3', labelEl + selectEl);
    }

    // ==========================================================
    // 4. KPIS FINANCEIROS (KontabsKPI)
    // ==========================================================
    kontabsKPI(title, value, pillText = '', pillType = 'success', subtitle = '', iconOrImg = '') {
        let pillHtml = pillText ? `<span class="pill pill-${pillType}">${pillText}</span>` : '';
        let iconHtml = '';
        if (iconOrImg) {
            if (iconOrImg.includes('/') || iconOrImg.endsWith('.png')) {
                iconHtml = `<img src="${iconOrImg}" style="width: 42px; height: 42px; object-fit: contain;">`;
            } else {
                iconHtml = `<i class="bi ${iconOrImg} fs-4 text-muted"></i>`;
            }
        }
        let footerHtml = subtitle ? `<div class="kontabs-kpi-footer pt-2 border-top">${subtitle}</div>` : '';

        return `
            <div class="kontabs-card shadow-hover h-100">
                <div class="kontabs-card-body kontabs-kpi">
                    <div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="kontabs-kpi-title">${title}</span>
                            ${pillHtml}
                        </div>
                        <div class="d-flex justify-content-between align-items-baseline mb-2">
                            <div class="kontabs-kpi-value mb-0">${value}</div>
                            ${iconHtml}
                        </div>
                    </div>
                    ${footerHtml}
                </div>
            </div>
        `;
    }

    // ==========================================================
    // 5. ALERTAS E CONCEITOS CENTRAIS (Dinheiro sem destino / sem origem)
    // ==========================================================
    kontabsAlert(type, title, message, actionText = '', actionCallback = '', customIcon = '') {
        let defaultIcons = {
            success: this.assetsPath + 'illustrations/coin-happy.png',
            warning: this.assetsPath + 'alerts/alert-budget-piggy.png',
            danger: this.assetsPath + 'alerts/alert-wallet-empty.png',
            info: this.assetsPath + 'alerts/alert-calendar-reminder.png'
        };
        let iconSrc = customIcon || defaultIcons[type] || defaultIcons.info;
        let actionBtn = actionText ? `<button class="btn btn-sm ${type === 'warning' ? 'btn-kontabs-dark' : 'btn-kontabs-primary'} text-nowrap ms-auto" onclick="${actionCallback}">${actionText}</button>` : '';

        return `
            <div class="kontabs-alert ${type}">
                <img src="${iconSrc}" alt="${title}" class="alert-icon">
                <div class="alert-content">
                    <div class="alert-title">${title}</div>
                    <p class="alert-desc">${message}</p>
                </div>
                ${actionBtn}
            </div>
        `;
    }

    // ==========================================================
    // 6. BARRA DE PROGRESSO & METAS (KontabsProgress)
    // ==========================================================
    kontabsProgress(id, value = 0, max = 100, label = '', variant = 'success') {
        let pct = Math.min(100, Math.round((value / max) * 100));
        let labelHtml = label ? `<div class="d-flex justify-content-between align-items-center mb-1"><span class="small fw-bold text-muted">${label}</span><span class="small fw-bold">${pct}%</span></div>` : '';
        return `
            <div class="kontabs-progress-container mb-3" id="${id}">
                ${labelHtml}
                <div class="kontabs-progress">
                    <div class="kontabs-progress-bar ${variant}" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }

    // ==========================================================
    // 7. VALORES FINANCEIROS ACESSÍVEIS (KontabsFinancialValue)
    // ==========================================================
    kontabsFinancialValue(amount, showSign = true, label = '') {
        let num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/\./g, '').replace(',', '.'));
        let isPos = num > 0;
        let isNeg = num < 0;
        let formatted = Math.abs(num).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let sign = showSign ? (isPos ? '+ ' : (isNeg ? '- ' : '')) : '';
        let colorClass = isPos ? 'text-success' : (isNeg ? 'text-danger' : 'text-muted');
        let ariaText = (isPos ? 'Crédito ' : (isNeg ? 'Débito ' : '')) + formatted;

        return `<span class="fw-bold ${colorClass}" aria-label="${ariaText}">${sign}${formatted}</span>`;
    }

    // ==========================================================
    // 8. STATUS BADGES (Previsto x Efetivado)
    // ==========================================================
    kontabsStatus(status, label = '') {
        let s = String(status).toLowerCase();
        let display = label || status;
        if (s === 'efetivado' || s === 'pago' || s === 'recebido') {
            return `<span class="pill pill-efetivado"><i class="bi bi-check-circle-fill me-1"></i>${display}</span>`;
        } else if (s === 'previsto' || s === 'pendente') {
            return `<span class="pill badge-previsto"><i class="bi bi-clock-history me-1"></i>${display}</span>`;
        } else if (s === 'atrasado' || s === 'vencido') {
            return `<span class="pill pill-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i>${display}</span>`;
        }
        return `<span class="pill pill-info">${display}</span>`;
    }

    // ==========================================================
    // 9. ILUSTRAÇÕES 3D OFICIAIS (KontabsIllustration)
    // ==========================================================
    kontabsIllustration(name, alt = '', maxHeight = '160px', classes = '') {
        let src = this.assetsPath + (name.includes('/') ? name : 'illustrations/' + name + '.png');
        return `<img src="${src}" alt="${alt || name}" class="kontabs-illustration ${classes}" style="max-height: ${maxHeight}; max-width: 100%; object-fit: contain;">`;
    }

    // ==========================================================
    // 10. ESTADO VAZIO / ONBOARDING (KontabsEmptyState)
    // ==========================================================
    kontabsEmptyState(illustrationName = 'mascot-workspace', title = 'Tudo limpo por aqui!', description = '', actionBtnHtml = '') {
        let illHtml = this.kontabsIllustration(illustrationName, title, '180px');
        return `
            <div class="kontabs-empty-state">
                ${illHtml}
                <h3 class="mt-3">${title}</h3>
                ${description ? `<p>${description}</p>` : ''}
                ${actionBtnHtml ? `<div class="mt-3">${actionBtnHtml}</div>` : ''}
            </div>
        `;
    }

    // ==========================================================
    // 11. TABELAS FORMATADAS (KontabsTable)
    // ==========================================================
    kontabsTable(headers = [], rows = [], classes = '') {
        let thHtml = headers.map(h => `<th>${h}</th>`).join('');
        let trHtml = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
        return `
            <div class="kontabs-table-container table-responsive ${classes}">
                <table class="kontabs-table">
                    <thead><tr>${thHtml}</tr></thead>
                    <tbody>${trHtml}</tbody>
                </table>
            </div>
        `;
    }

    // ==========================================================
    // 12. MODAL PADRÃO (KontabsModal)
    // ==========================================================
    kontabsModal(id, title, content, footerButtons = '', size = '') {
        let sizeClass = size ? 'modal-' + size : '';
        return `
            <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}-label" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered ${sizeClass}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${id}-label">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        ${footerButtons ? `<div class="modal-footer">${footerButtons}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // ==========================================================
    // 13. SEÇÕES E PÁGINAS (KontabsPage & KontabsSection)
    // ==========================================================
    kontabsSection(title, subtitle = '', content = '', actions = '') {
        let actionsHtml = actions ? `<div>${actions}</div>` : '';
        return `
            <div class="kontabs-section mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h4 class="mb-0 fw-bold">${title}</h4>
                        ${subtitle ? `<p class="text-muted small mb-0">${subtitle}</p>` : ''}
                    </div>
                    ${actionsHtml}
                </div>
                ${content}
            </div>
        `;
    }

    kontabsTabs(id, tabs = []) {
        let navHtml = '';
        let contentHtml = '';
        tabs.forEach((tab, index) => {
            let active = index === 0 ? ' active' : '';
            let show = index === 0 ? ' show active' : '';
            navHtml += `
                <li class="nav-item" role="presentation">
                    <button class="nav-link${active} fw-bold" id="${id}-${tab.id}-tab" data-bs-toggle="tab" data-bs-target="#${id}-${tab.id}" type="button" role="tab">${tab.title}</button>
                </li>
            `;
            contentHtml += `
                <div class="tab-pane fade${show} pt-3" id="${id}-${tab.id}" role="tabpanel">
                    ${tab.content}
                </div>
            `;
        });

        return `
            <div class="kontabs-tabs" id="${id}">
                <ul class="nav nav-tabs border-bottom" role="tablist">
                    ${navHtml}
                </ul>
                <div class="tab-content">
                    ${contentHtml}
                </div>
            </div>
        `;
    }

    kontabsChartContainer(id, title, chartContent, actions = '') {
        return this.kontabsCard(
            title,
            `<div class="kontabs-chart-wrapper" style="min-height: 280px;">${chartContent}</div>`,
            actions
        );
    }
}

// ==========================================================
// REGISTRO NO CORE DO KORE FRAMEWORK
// ==========================================================
const kontabsRendererInstance = new KontabsRenderer();
UI.setRenderer(kontabsRendererInstance);

/**
 * KontabsUI — Helper estático de alto nível para chamadas expressivas
 */
class KontabsUI {
    static get r() { return UI.getRenderer(); }

    static kpi(title, value, pillText, pillType, subtitle, icon) {
        return KontabsUI.r.kontabsKPI(title, value, pillText, pillType, subtitle, icon);
    }

    static card(title, body, footer, classes, badge) {
        return KontabsUI.r.kontabsCard(title, body, footer, classes, badge);
    }

    static button(id, text, variant, icon, attrs) {
        return KontabsUI.r.kontabsButton(id, text, variant, icon, attrs);
    }

    static input(type, id, label, value, required, placeholder, classes) {
        return KontabsUI.r.kontabsInput(type, id, label, value, required, placeholder, classes);
    }

    static moneyInput(id, label, value, required, placeholder) {
        return KontabsUI.r.kontabsMoneyInput(id, label, value, required, placeholder);
    }

    static dateInput(id, label, value, required) {
        return KontabsUI.r.kontabsDateInput(id, label, value, required);
    }

    static select(id, label, options, selected, required) {
        return KontabsUI.r.kontabsSelect(id, label, options, selected, required);
    }

    static alert(type, title, message, actionText, actionCallback, customIcon) {
        return KontabsUI.r.kontabsAlert(type, title, message, actionText, actionCallback, customIcon);
    }

    static progress(id, value, max, label, variant) {
        return KontabsUI.r.kontabsProgress(id, value, max, label, variant);
    }

    static emptyState(ill, title, desc, action) {
        return KontabsUI.r.kontabsEmptyState(ill, title, desc, action);
    }

    static illustration(name, alt, height, classes) {
        return KontabsUI.r.kontabsIllustration(name, alt, height, classes);
    }

    static financialValue(amount, showSign, label) {
        return KontabsUI.r.kontabsFinancialValue(amount, showSign, label);
    }

    static status(status, label) {
        return KontabsUI.r.kontabsStatus(status, label);
    }

    static table(headers, rows, classes) {
        return KontabsUI.r.kontabsTable(headers, rows, classes);
    }

    static modal(id, title, content, footer, size) {
        return KontabsUI.r.kontabsModal(id, title, content, footer, size);
    }

    static section(title, subtitle, content, actions) {
        return KontabsUI.r.kontabsSection(title, subtitle, content, actions);
    }

    static tabs(id, tabs) {
        return KontabsUI.r.kontabsTabs(id, tabs);
    }

    static chartContainer(id, title, chart, actions) {
        return KontabsUI.r.kontabsChartContainer(id, title, chart, actions);
    }

    // Utilitários de Organização Multi-Organização (PF e PJ)
    static async initOrganizations() {
        try {
            const res = await ApiService.get('organizations');
            const orgs = res.data || [];
            if (!orgs.length) return;

            let activeId = ApiService.getActiveOrgId();
            let activeOrg = orgs.find(o => parseInt(o.id) === activeId) || orgs[0];
            ApiService.setActiveOrgId(activeOrg.id, activeOrg.name);

            jQuery('#active-org-name').text(activeOrg.name);
            jQuery('.kore-sidebar-user .text-truncate:last-child').text(activeOrg.name);

            let menuHtml = '<li><h6 class="dropdown-header text-uppercase fs-xs fw-bold">Suas Organizações</h6></li>';
            orgs.forEach(org => {
                const isActive = (parseInt(org.id) === parseInt(activeOrg.id)) ? 'active' : '';
                const icon = org.type === 'PJ' ? 'bi-briefcase' : 'bi-person';
                const badge = org.type === 'PJ' ? 'PJ' : 'PF';
                menuHtml += `
                    <li>
                        <a class="dropdown-item ${isActive} d-flex align-items-center justify-content-between py-2" href="javascript:;" onclick="KontabsUI.switchOrg(${org.id}, '${org.name}')">
                            <span><i class="bi ${icon} me-2 text-primary"></i>${org.name}</span>
                            <span class="badge bg-light text-dark">${badge}</span>
                        </a>
                    </li>
                `;
            });
            menuHtml += '<li><hr class="dropdown-divider"></li>';
            menuHtml += '<li><a class="dropdown-item text-primary py-2" href="javascript:;" onclick="KontabsUI.openNewOrgModal()"><i class="bi bi-plus-circle me-2"></i>Nova Organização...</a></li>';

            jQuery('#org-selector-menu').html(menuHtml);
        } catch (e) {
            console.warn('[KontabsUI] Falha ao carregar organizações:', e);
        }
    }

    static async switchOrg(orgId, orgName) {
        ApiService.setActiveOrgId(orgId, orgName);
        jQuery('#active-org-name').text(orgName);
        jQuery('.kore-sidebar-user .text-truncate:last-child').text(orgName);
        await KontabsUI.initOrganizations();
        if (typeof router !== 'undefined') {
            router.executeRoute();
        }
    }

    static openNewOrgModal() {
        const name = prompt('Informe o nome da nova organização (PF ou PJ):');
        if (!name) return;
        const isPj = confirm('Esta nova organização é Pessoa Jurídica (PJ)? Clique OK para PJ ou Cancelar para PF (Pessoa Física).');
        const type = isPj ? 'PJ' : 'PF';

        ApiService.post('organizations', { name, type })
            .then(res => {
                alert('Organização cadastrada com sucesso!');
                KontabsUI.switchOrg(res.id, name);
            })
            .catch(err => alert(err.message || 'Erro ao cadastrar organização.'));
    }

    static openNovaMovimentacaoModal() {
        let modal = document.getElementById('modal-nova-movimentacao');
        if (modal) {
            UI.showModal('#modal-nova-movimentacao');
        } else {
            window.location.hash = '#/movimentacoes';
        }
    }
}
