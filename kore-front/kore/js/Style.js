/**
 * Style — Catálogo e Construtor de Classes CSS para o Kore Framework.
 * Encapsula utilitários CSS nativos do Kore e classes padrão do Bootstrap 5.
 */
class Style {
    /**
     * Concatena e sanitiza múltiplas classes ou instâncias de Style/StyleBuilder.
     * Exemplo: Style.classes(Style.btn('primary'), Style.shadowHover(), Style.roundedXl())
     * @param {...(string|Array<string>|StyleBuilder)} classList
     * @returns {string}
     */
    static classes(...classList) {
        let result = [];
        let flat = classList.flat(Infinity);
        for (let item of flat) {
            if (typeof item === 'string' && item.trim()) {
                result.push(item.trim());
            } else if (item && typeof item.toString === 'function') {
                let str = item.toString().trim();
                if (str) result.push(str);
            }
        }
        return result.join(' ');
    }

    /**
     * Cria uma instância de StyleBuilder fluente para encadeamento.
     * Exemplo: Style.make().btn('primary').shadowHover().roundedXl().get()
     * @returns {StyleBuilder}
     */
    static make(...initialClasses) {
        return new StyleBuilder(...initialClasses);
    }

    // ==========================================================
    // 🌟 Utilitários Nativos do Kore Framework
    // ==========================================================
    static shadowXs() { return 'shadow-xs'; }
    static shadowCard() { return 'shadow-card'; }
    static shadowHover() { return 'shadow-hover'; }
    static roundedXl() { return 'rounded-xl'; }
    static rounded2Xl() { return 'rounded-2xl'; }
    static borderDashed() { return 'border-dashed'; }
    static borderLightSubtle() { return 'border-light-subtle'; }
    static cursorPointer() { return 'cursor-pointer'; }
    static transitionAll() { return 'transition-all'; }
    static opacityHover() { return 'opacity-hover'; }
    static textTruncate2() { return 'text-truncate-2'; }
    static customScrollbar() { return 'custom-scrollbar'; }
    static pulseDot() { return 'pulse-dot'; }

    // ==========================================================
    // 📐 Bootstrap: Layout & Flexbox
    // ==========================================================
    static dFlex() { return 'd-flex'; }
    static dInlineFlex() { return 'd-inline-flex'; }
    static dBlock() { return 'd-block'; }
    static dInlineBlock() { return 'd-inline-block'; }
    static dNone() { return 'd-none'; }
    static flexColumn() { return 'flex-column'; }
    static flexRow() { return 'flex-row'; }
    static flexWrap() { return 'flex-wrap'; }
    static justifyBetween() { return 'justify-content-between'; }
    static justifyCenter() { return 'justify-content-center'; }
    static justifyStart() { return 'justify-content-start'; }
    static justifyEnd() { return 'justify-content-end'; }
    static alignCenter() { return 'align-items-center'; }
    static alignStart() { return 'align-items-start'; }
    static alignEnd() { return 'align-items-end'; }
    static gap(level = 2) { return 'gap-' + level; }

    // ==========================================================
    // 🎨 Bootstrap: Cores de Texto e Fundos
    // ==========================================================
    static textPrimary() { return 'text-primary'; }
    static textSecondary() { return 'text-secondary'; }
    static textSuccess() { return 'text-success'; }
    static textDanger() { return 'text-danger'; }
    static textWarning() { return 'text-warning'; }
    static textInfo() { return 'text-info'; }
    static textMuted() { return 'text-muted'; }
    static textWhite() { return 'text-white'; }

    static bgPrimary() { return 'bg-primary'; }
    static bgSecondary() { return 'bg-secondary'; }
    static bgSuccess() { return 'bg-success'; }
    static bgDanger() { return 'bg-danger'; }
    static bgWarning() { return 'bg-warning'; }
    static bgInfo() { return 'bg-info'; }
    static bgLight() { return 'bg-light'; }
    static bgDark() { return 'bg-dark'; }
    static bgWhite() { return 'bg-white'; }
    static bgTransparent() { return 'bg-transparent'; }

    // ==========================================================
    // 🔤 Bootstrap: Tipografia & Alinhamentos
    // ==========================================================
    static fwBold() { return 'fw-bold'; }
    static fwSemibold() { return 'fw-semibold'; }
    static fwMedium() { return 'fw-medium'; }
    static fwNormal() { return 'fw-normal'; }
    static fwLight() { return 'fw-light'; }
    static fstItalic() { return 'fst-italic'; }
    static textCenter() { return 'text-center'; }
    static textStart() { return 'text-start'; }
    static textEnd() { return 'text-end'; }
    static textUppercase() { return 'text-uppercase'; }
    static textCapitalize() { return 'text-capitalize'; }
    static textDecorationNone() { return 'text-decoration-none'; }

    // ==========================================================
    // 📦 Bootstrap: Bordas & Sombras
    // ==========================================================
    static shadowSm() { return 'shadow-sm'; }
    static shadow() { return 'shadow'; }
    static shadowLg() { return 'shadow-lg'; }
    static shadowNone() { return 'shadow-none'; }
    static rounded() { return 'rounded'; }
    static roundedPill() { return 'rounded-pill'; }
    static roundedCircle() { return 'rounded-circle'; }
    static border(side = '') { return side ? 'border-' + side : 'border'; }
    static border0() { return 'border-0'; }

    // ==========================================================
    // 📏 Bootstrap: Margens & Paddings
    // ==========================================================
    static m(val) { return 'm-' + val; }
    static mb(val = 3) { return 'mb-' + val; }
    static mt(val = 3) { return 'mt-' + val; }
    static ms(val = 2) { return 'ms-' + val; }
    static me(val = 2) { return 'me-' + val; }
    static my(val = 3) { return 'my-' + val; }
    static mx(val = 3) { return 'mx-' + val; }

    static p(val) { return 'p-' + val; }
    static pb(val = 3) { return 'pb-' + val; }
    static pt(val = 3) { return 'pt-' + val; }
    static ps(val = 2) { return 'ps-' + val; }
    static pe(val = 2) { return 'pe-' + val; }
    static py(val = 3) { return 'py-' + val; }
    static px(val = 3) { return 'px-' + val; }

    // ==========================================================
    // 🔘 Bootstrap: Botões & Dimensões
    // ==========================================================
    static btn(color = 'primary') { return 'btn-' + color; }
    static btnOutline(color = 'primary') { return 'btn-outline-' + color; }
    static btnSm() { return 'btn-sm'; }
    static btnLg() { return 'btn-lg'; }
    static w100() { return 'w-100'; }
    static w75() { return 'w-75'; }
    static w50() { return 'w-50'; }
    static w25() { return 'w-25'; }
    static h100() { return 'h-100'; }
}

/**
 * StyleBuilder — Construtor fluente encadeável de classes CSS.
 */
class StyleBuilder {
    constructor(...initialClasses) {
        this._classes = [];
        if (initialClasses.length) {
            this.add(...initialClasses);
        }
    }

    add(...classes) {
        let flat = classes.flat(Infinity);
        for (let c of flat) {
            if (typeof c === 'string' && c.trim()) {
                this._classes.push(c.trim());
            }
        }
        return this;
    }

    // Atalhos Fluentes Nativos
    shadowXs() { return this.add('shadow-xs'); }
    shadowCard() { return this.add('shadow-card'); }
    shadowHover() { return this.add('shadow-hover'); }
    roundedXl() { return this.add('rounded-xl'); }
    rounded2Xl() { return this.add('rounded-2xl'); }
    borderDashed() { return this.add('border-dashed'); }
    cursorPointer() { return this.add('cursor-pointer'); }
    transitionAll() { return this.add('transition-all'); }
    opacityHover() { return this.add('opacity-hover'); }
    customScrollbar() { return this.add('custom-scrollbar'); }
    pulseDot() { return this.add('pulse-dot'); }

    // Atalhos Fluentes Bootstrap
    btn(color = 'primary') { return this.add('btn-' + color); }
    btnOutline(color = 'primary') { return this.add('btn-outline-' + color); }
    btnSm() { return this.add('btn-sm'); }
    btnLg() { return this.add('btn-lg'); }
    shadowSm() { return this.add('shadow-sm'); }
    shadow() { return this.add('shadow'); }
    shadowLg() { return this.add('shadow-lg'); }
    rounded() { return this.add('rounded'); }
    roundedPill() { return this.add('rounded-pill'); }
    border(side = '') { return this.add(side ? 'border-' + side : 'border'); }
    border0() { return this.add('border-0'); }
    dFlex() { return this.add('d-flex'); }
    flexColumn() { return this.add('flex-column'); }
    justifyBetween() { return this.add('justify-content-between'); }
    justifyCenter() { return this.add('justify-content-center'); }
    alignCenter() { return this.add('align-items-center'); }
    gap(l = 2) { return this.add('gap-' + l); }
    textPrimary() { return this.add('text-primary'); }
    textSuccess() { return this.add('text-success'); }
    textDanger() { return this.add('text-danger'); }
    textMuted() { return this.add('text-muted'); }
    textWhite() { return this.add('text-white'); }
    bgPrimary() { return this.add('bg-primary'); }
    bgSuccess() { return this.add('bg-success'); }
    bgLight() { return this.add('bg-light'); }
    bgDark() { return this.add('bg-dark'); }
    fwBold() { return this.add('fw-bold'); }
    fwSemibold() { return this.add('fw-semibold'); }
    textCenter() { return this.add('text-center'); }
    mb(val = 3) { return this.add('mb-' + val); }
    mt(val = 3) { return this.add('mt-' + val); }
    ms(val = 2) { return this.add('ms-' + val); }
    me(val = 2) { return this.add('me-' + val); }
    my(val = 3) { return this.add('my-' + val); }
    mx(val = 3) { return this.add('mx-' + val); }
    p(val) { return this.add('p-' + val); }
    pb(val = 3) { return this.add('pb-' + val); }
    pt(val = 3) { return this.add('pt-' + val); }
    py(val = 3) { return this.add('py-' + val); }
    px(val = 3) { return this.add('px-' + val); }
    w100() { return this.add('w-100'); }
    h100() { return this.add('h-100'); }

    get() {
        return this._classes.join(' ');
    }

    toString() {
        return this.get();
    }
}