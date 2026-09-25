/**
 * KodeyCharts
 * Uma biblioteca JavaScript (wrapper do Chart.js) para criar gráficos lindos e fáceis de usar.
 * Requer jQuery e Chart.js inclusos na página.
 */
class KodeyCharts
{
    /**
     * Construtor da classe KodeyCharts
     * Configura a paleta de cores global padrão se nenhuma for fornecida.
     * 
     * @param {Object} globalConfig - Configurações globais opcionais.
     */
    constructor(globalConfig = {})
    {
        // Paleta de cores vibrantes e modernas padrão
        this.defaultPalette = globalConfig.colors || [
            '#3b82f6', // Azul
            '#ef4444', // Vermelho
            '#10b981', // Verde Esmeralda
            '#f59e0b', // Laranja Escuro/Amarelo
            '#8b5cf6', // Roxo
            '#ec4899', // Rosa
            '#06b6d4'  // Ciano
        ];
        
        // Mantém a referência das instâncias criadas do Chart.js para caso precisemos destruí-las
        this.chartInstances = {};
    }

    /**
     * Método principal para gerar um gráfico baseado nas configurações fornecidas.
     * 
     * @param {Object} config - O objeto JSON de configuração simplificado para o desenvolvedor.
     * @returns {Object} - A instância do Chart.js criada (ou null se renderizado como imagem).
     */
    plot(config)
    {
        // Validação básica do container
        if (!config.container)
        {
            console.error("KodeyCharts: A propriedade 'container' é obrigatória.");
            return null;
        }

        const $containerElement = $(config.container);
        
        if ($containerElement.length === 0)
        {
            console.error(`KodeyCharts: Container não encontrado para o seletor '${config.container}'.`);
            return null;
        }
        
        // Aplica largura e altura se informados pelo usuário
        if (config.width)
        {
            $containerElement.css('width', config.width);
        }
        
        if (config.height)
        {
            $containerElement.css('height', config.height);
            
            // Se a altura for relativa (como 100%), o Chart.js pode "achatar"
            // o grid dependendo do flexbox do pai. Garantimos um mínimo saudável.
            if (config.height.toString().includes('%'))
            {
                 $containerElement.css('min-height', '350px');
            }
        }
        else 
        {
            // Fallback base para quem não informa nada
            $containerElement.css('min-height', '300px');
        }

        // Tipo padrão do gráfico (se não for informado, usa 'line')
        let mainType = config.type || 'line';
        
        // Verifica se é um gráfico de área (o Chart.js usa 'line' com fill=true para área)
        let isAreaChart = false;
        if (mainType === 'area')
        {
            mainType = 'line';
            isAreaChart = true;
        }
        
        let isHorizontalBar = false;
        let isStacked = false;

        // Filtro para colunas (verticais) e suas ramificações
        if (mainType === 'column' || mainType === 'stacked-column')
        {
            if (mainType === 'stacked-column') isStacked = true;
            mainType = 'bar';
        }
        // Filtro para barras (horizontais) e suas ramificações
        else if (mainType === 'bar' || mainType === 'stacked-bar')
        {
            if (mainType === 'stacked-bar') isStacked = true;
            isHorizontalBar = true;
            mainType = 'bar';
        }

        // Configuração da paleta que será usada neste gráfico
        const palette = config.colors || this.defaultPalette;

        // Construindo a lista de labels (Eixo X)
        const labels = config.labels || [];

        // Mapeando a matriz de "series" simplificada para o formato de "datasets" do Chart.js
        const datasets = [];
        
        if (config.series && Array.isArray(config.series))
        {
            for (let i = 0; i < config.series.length; i++)
            {
                const s = config.series[i];
                
                // Pega a cor definida na série ou usa a cor sequencial da paleta
                const seriesColor = s.color || palette[i % palette.length];
                
                // Descobrindo o tipo individual da série (suporte para gráficos mistos)
                let seriesType = s.type;
                let seriesIsArea = isAreaChart;
                
                if (seriesType === 'area')
                {
                    seriesType = 'line';
                    seriesIsArea = true;
                }
                else if (seriesType === 'column')
                {
                    seriesType = 'bar';
                }

                // Se a série forçar empilhamento individualmente, mas não queremos complicar as opções
                // pois empilhamento é global nos scales do Chart.js.
                if (seriesType === 'stacked-column' || seriesType === 'stacked-bar')
                {
                    seriesType = 'bar';
                }

                // Cria o formato de dataset esperado pelo Chart.js
                const datasetConfig = {
                    label: s.name || `Série ${i + 1}`,
                    data: s.data || [],
                    type: seriesType // Será undefined se não for definido, o chart passa a usar o mainType
                };

                const resolvedType = datasetConfig.type || mainType;
                
                // Configuração de estilos baseada no tipo de gráfico
                this.applyStylingToDataset(datasetConfig, resolvedType, seriesColor, palette, seriesIsArea, s.data, config.roundedCorners, config);
                
                datasets.push(datasetConfig);
            }
        }

        // Montando o bloco final do Chart.js
        const chartJsConfig = {
            type: mainType,
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: isHorizontalBar ? 'y' : 'x',
                plugins: {
                    title: {
                        display: !!config.title,
                        text: config.title || '',
                        font: { size: 18, family: "'Inter', sans-serif" },
                        color: '#333'
                    },
                    legend: {
                        display: config.showLegend !== undefined ? !!config.showLegend : false,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            font: { family: "'Inter', sans-serif" }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { family: "'Inter', sans-serif" },
                        bodyFont: { family: "'Inter', sans-serif", size: 13 },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true
                    },
                    datalabels: {
                        display: !!config.showValues,
                        color: mainType === 'pie' || mainType === 'doughnut' ? '#ffffff' : '#475569',
                        font: { family: "'Inter', sans-serif", weight: 'bold', size: 12 },
                        align: mainType === 'pie' || mainType === 'doughnut' ? 'center' : (isHorizontalBar ? 'right' : 'top'),
                        anchor: mainType === 'pie' || mainType === 'doughnut' ? 'center' : (isHorizontalBar ? 'end' : 'end'),
                        formatter: function(value) {
                            return value + '%';
                        }
                    }
                },
                animation: {
                    duration: config.renderAsImage ? 0 : 1000,
                    easing: 'easeOutQuart'
                }
            }
        };

        // Personalização dos eixos X e Y se não for pizza/doughnut
        if (mainType !== 'pie' && mainType !== 'doughnut')
        {
            const xScaleOptions = {
                grid: isHorizontalBar ? { color: 'rgba(0, 0, 0, 0.05)', borderDash: [5, 5], drawBorder: false } : { display: false, drawBorder: false },
                ticks: { font: { family: "'Inter', sans-serif" }, color: '#666', autoSkip: isHorizontalBar ? true : false }
            };
            
            const yScaleOptions = {
                grid: isHorizontalBar ? { display: false, drawBorder: false } : { color: 'rgba(0, 0, 0, 0.05)', borderDash: [5, 5], drawBorder: false },
                ticks: { font: { family: "'Inter', sans-serif" }, color: '#666', autoSkip: isHorizontalBar ? false : true }
            };
            
            if (config.min !== undefined || config.max !== undefined || isStacked)
            {
                const targetScale = isHorizontalBar ? xScaleOptions : yScaleOptions;
                
                if (config.min !== undefined) targetScale.min = config.min;
                if (config.max !== undefined) targetScale.max = config.max;
            }

            if (isStacked)
            {
                xScaleOptions.stacked = true;
                yScaleOptions.stacked = true;
            }

            chartJsConfig.options.scales = {
                x: xScaleOptions,
                y: yScaleOptions
            };
        }

        return this.renderChart(config.container, chartJsConfig, config.renderAsImage, $containerElement);
    }

    /**
     * Aplica o visual em cada série dependendo do tipo dela.
     */
    applyStylingToDataset(dataset, type, baseColor, palette, isArea, dataArray, roundedCorners, config = {})
    {
        const hexToRgba = (hex, alpha) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if(result)
            {
                const r = parseInt(result[1], 16);
                const g = parseInt(result[2], 16);
                const b = parseInt(result[3], 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
            return hex;
        };

        if (type === 'line')
        {
            dataset.borderColor = baseColor;
            dataset.backgroundColor = isArea ? hexToRgba(baseColor, 0.2) : baseColor;
            dataset.borderWidth = 3;
            dataset.fill = isArea;
            dataset.tension = 0.4;
            dataset.pointBackgroundColor = '#fff';
            dataset.pointBorderColor = baseColor;
            dataset.pointBorderWidth = 2;
            dataset.pointRadius = 4;
            dataset.pointHoverRadius = 6;
        }
        else if (type === 'bar')
        {
            dataset.backgroundColor = hexToRgba(baseColor, 0.85);
            dataset.borderColor = baseColor;
            dataset.borderWidth = 1;
            dataset.borderRadius = roundedCorners !== false ? 6 : 0;
            dataset.borderSkipped = false;
            if (config.barPercentage !== undefined) dataset.barPercentage = config.barPercentage;
            if (config.categoryPercentage !== undefined) dataset.categoryPercentage = config.categoryPercentage;
        }
        else if (type === 'pie' || type === 'doughnut')
        {
            const sliceColors = [];
            const sliceBorders = [];
            
            for (let i = 0; i < dataArray.length; i++)
            {
                const color = palette[i % palette.length];
                sliceColors.push(hexToRgba(color, 0.85));
                sliceBorders.push('#ffffff');
            }
            
            dataset.backgroundColor = sliceColors;
            dataset.borderColor = sliceBorders;
            dataset.borderWidth = 2;
        }
        else if (type === 'scatter' || type === 'bubble')
        {
            dataset.backgroundColor = hexToRgba(baseColor, 0.6);
            dataset.borderColor = baseColor;
            dataset.borderWidth = 2;
        }
    }

    /**
     * Lida com a montagem do elemento final (canvas) ou geraçao da tag <img>.
     */
    renderChart(containerSelector, chartJsConfig, renderAsImage, $container)
    {
        if (this.chartInstances[containerSelector])
        {
            this.chartInstances[containerSelector].destroy();
        }

        $container.empty();
        
        if ($container.css('position') === 'static')
        {
            $container.css('position', 'relative');
        }

        const $canvas = $('<canvas></canvas>');
        $container.append($canvas);

        const ctx = $canvas[0].getContext('2d');
        
        if (renderAsImage)
        {
            if (!chartJsConfig.options.animation) chartJsConfig.options.animation = {};
            
            chartJsConfig.options.animation.onComplete = () => {
                if ($canvas.closest('body').length === 0) return;

                const base64Image = $canvas[0].toDataURL('image/png', 1.0);
                
                const $img = $('<img>', {
                    src: base64Image,
                    alt: chartJsConfig.options.plugins?.title?.text || 'Gráfico Gerado',
                    class: 'img-fluid',
                    css: {
                        maxWidth: '100%',
                        height: 'auto',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        borderRadius: '8px'
                    }
                });

                $canvas.remove();
                $container.append($img);
                
                if (this.chartInstances[containerSelector]) {
                    this.chartInstances[containerSelector].destroy();
                    delete this.chartInstances[containerSelector];
                }
            };
        }

        const chartInstance = new Chart(ctx, chartJsConfig);
        
        this.chartInstances[containerSelector] = chartInstance;
        return chartInstance;
    }
}

if (typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}
