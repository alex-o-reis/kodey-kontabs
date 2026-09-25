/**
 * Kore Framework (KKF) — Core Client Utilities & Namespace
 */
const Kore = {
    version: '1.0.0',
    
    pad(number, length = 2) {
        let str = "" + number;
        while (str.length < length) str = "0" + str;
        return str;
    },

    formatDate(date, ifNull = '-') {
        if (!date) return ifNull;
        let d = new Date(date);
        if (isNaN(d.getTime())) return date;
        return Kore.pad(d.getDate()) + '/' + Kore.pad(d.getMonth() + 1) + '/' + d.getFullYear();
    },

    formatDateTime(date, ifNull = '-') {
        if (!date) return ifNull;
        let d = new Date(date);
        if (isNaN(d.getTime())) return date;
        return Kore.formatDate(date) + ' ' + Kore.pad(d.getHours()) + ':' + Kore.pad(d.getMinutes());
    },

    formatMoney(val) {
        if (val === null || val === undefined || val === '') return 'R$ 0,00';
        let num = parseFloat(val);
        if (isNaN(num)) return 'R$ 0,00';
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },

    maskCPF(cpf) {
        let v = String(cpf).replace(/\D/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        v = v.replace(/^(\d{3})(\d)/, '$1.$2');
        v = v.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
        v = v.replace(/\.(\d{3})(\d)/, '.$1-$2');
        return v;
    },

    maskCNPJ(cnpj) {
        let v = String(cnpj).replace(/\D/g, '');
        if (v.length > 14) v = v.substring(0, 14);
        v = v.replace(/^(\d{2})(\d)/, '$1.$2');
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
        v = v.replace(/(\d{4})(\d)/, '$1-$2');
        return v;
    },

    maskPhone(phone) {
        let v = String(phone).replace(/\D/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        if (v.length <= 10) {
            return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        }
        return v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
};