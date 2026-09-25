/**
 * Datatable — Wrapper Moderno para DataTables.net integrado ao Bootstrap 5
 */
class Datatable {
    constructor() {
        this.tableId = null;
        this.config = {};
        this.options = {};
        this.dt = null;
        this.data = [];
    }

    configurarDatatable(params = {}) {
        this.config = params;
        let columns = [];
        if (params.colunas) {
            params.colunas.forEach(function(col) {
                columns.push({
                    data: col.data,
                    title: col.title || col.data,
                    width: col.width,
                    visible: col.visible !== false,
                    render: col.render,
                    className: col.class || ''
                });
            });
        }

        this.options = {
            columns: columns,
            paging: params.paginacao !== false,
            searching: params.busca !== false,
            ordering: params.ordenacao !== false,
            info: params.info !== false,
            pageLength: params.pageLength || 25,
            order: params.order || [[0, 'asc']],
            language: {
                emptyTable: 'Nenhum registro encontrado.',
                info: 'Mostrando _START_ até _END_ de _TOTAL_ registros',
                infoEmpty: 'Mostrando 0 até 0 de 0 registros',
                infoFiltered: '(filtrado de _MAX_ registros no total)',
                lengthMenu: 'Exibir _MENU_ registros por página',
                loadingRecords: 'Carregando...',
                processing: 'Processando...',
                search: '',
                searchPlaceholder: 'Pesquisar...',
                zeroRecords: 'Nenhum registro correspondente encontrado',
                paginate: {
                    first: '<i class="bi bi-chevron-double-left"></i>',
                    last: '<i class="bi bi-chevron-double-right"></i>',
                    next: '<i class="bi bi-chevron-right"></i>',
                    previous: '<i class="bi bi-chevron-left"></i>'
                }
            }
        };

        if (params.url) {
            this.options.ajax = {
                url: params.url,
                type: params.urlMethod || 'GET',
                dataSrc: params.dataSrc !== undefined ? params.dataSrc : ''
            };
        }
    }

    criarTabela(tableId) {
        this.tableId = tableId;
        let ths = '';
        if (this.config.colunas) {
            this.config.colunas.forEach(function(col) {
                ths += '<th>' + (col.title || col.data) + '</th>';
            });
        }
        let thead = '<thead><tr>' + ths + '</tr></thead>';
        let tbody = '<tbody></tbody>';
        let table = '<table id="' + tableId + '" class="table table-striped table-hover table-bordered w-100">' + thead + tbody + '</table>';
        return '<div class="table-responsive">' + table + '</div>';
    }

    inicializarDatatable() {
        if (!this.tableId) return;
        let self = this;
        this.dt = jQuery('#' + this.tableId).DataTable(this.options);
        
        jQuery('#' + this.tableId).on('click', 'tbody tr', function() {
            let rowData = self.dt.row(this).data();
            self.trOnClick(rowData, jQuery(this));
        });
    }

    trOnClick(rowData, tr) {}

    reload() {
        if (this.dt) this.dt.ajax.reload(null, false);
    }
}