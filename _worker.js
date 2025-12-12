// Cloudflare Workers 用于处理静态资源和API请求
// 直接嵌入HTML内容以避免静态资源获取问题

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matplotlib 数据可视化展示</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        header {
            text-align: center;
            margin-bottom: 40px;
            animation: fadeInDown 0.8s ease;
        }

        h1 {
            color: white;
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .subtitle {
            color: rgba(255,255,255,0.9);
            font-size: 1.1rem;
        }

        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }

        .chart-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            animation: fadeInUp 0.8s ease backwards;
        }

        .chart-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .chart-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 20px;
            color: #2c3e50;
        }

        .chart-container {
            position: relative;
            height: 400px;
            margin-bottom: 15px;
        }

        .controls {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 20px;
        }

        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .filter-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }

        .filter-btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .filter-btn:hover {
            background: rgba(255,255,255,0.3);
            border-color: rgba(255,255,255,0.5);
        }

        .filter-btn.active {
            background: white;
            color: #667eea;
            border-color: white;
        }

        .stats {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            text-align: center;
            font-size: 14px;
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (max-width: 768px) {
            .charts-grid {
                grid-template-columns: 1fr;
            }
            h1 {
                font-size: 2rem;
            }
            .chart-container {
                height: 300px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 Matplotlib 数据可视化展示</h1>
            <p class="subtitle">深圳市24小时风速与数学函数图表展示</p>
        </header>

        <div class="filter-buttons">
            <button class="filter-btn active" onclick="filterCharts('all')">全部图表</button>
            <button class="filter-btn" onclick="filterCharts('wind')">风速数据</button>
            <button class="filter-btn" onclick="filterCharts('math')">数学函数</button>
            <button class="filter-btn" onclick="filterCharts('axis')">坐标轴</button>
        </div>

        <div class="charts-grid">
            <!-- 深圳市24小时平均风速 -->
            <div class="chart-card" data-category="wind" style="animation-delay: 0.1s;">
                <h2 class="chart-title">🌪️ 深圳市24小时平均风速</h2>
                <div class="stats">平均风速: 11.8 km/h | 最高风速: 22 km/h | 最低风速: 7 km/h</div>
                <div class="chart-container">
                    <canvas id="windSpeedChart"></canvas>
                </div>
                <div class="controls">
                    <button class="btn" onclick="toggleChartType('windSpeedChart')">切换图表类型</button>
                    <button class="btn" onclick="animateChart('windSpeedChart')">播放动画</button>
                    <button class="btn" onclick="resetChart('windSpeedChart')">重置</button>
                </div>
            </div>

            <!-- 正弦余弦函数曲线 -->
            <div class="chart-card" data-category="math" style="animation-delay: 0.2s;">
                <h2 class="chart-title">📈 正弦与余弦函数曲线</h2>
                <div class="stats">周期: 2π | 振幅: 1 | 相位差: π/2</div>
                <div class="chart-container">
                    <canvas id="trigChart"></canvas>
                </div>
                <div class="controls">
                    <button class="btn" onclick="toggleDataset('trigChart', 0)">切换正弦</button>
                    <button class="btn" onclick="toggleDataset('trigChart', 1)">切换余弦</button>
                    <button class="btn" onclick="animateChart('trigChart')">播放动画</button>
                </div>
            </div>

            <!-- 多坐标轴示例 -->
            <div class="chart-card" data-category="axis" style="animation-delay: 0.3s;">
                <h2 class="chart-title">📊 多坐标轴数据对比</h2>
                <div class="stats">双Y轴设计 | 左轴: 温度 | 右轴: 湿度</div>
                <div class="chart-container">
                    <canvas id="multiAxisChart"></canvas>
                </div>
                <div class="controls">
                    <button class="btn" onclick="toggleChartType('multiAxisChart')">切换类型</button>
                    <button class="btn" onclick="randomizeData()">随机数据</button>
                </div>
            </div>

            <!-- 自定义刻度样式 -->
            <div class="chart-card" data-category="axis" style="animation-delay: 0.4s;">
                <h2 class="chart-title">⚙️ 自定义刻度样式</h2>
                <div class="stats">刻度间隔自定义 | 标签旋转45° | 自定义刻度长度</div>
                <div class="chart-container">
                    <canvas id="customTicksChart"></canvas>
                </div>
                <div class="controls">
                    <button class="btn" onclick="changeTickStyle()">切换刻度样式</button>
                    <button class="btn" onclick="resetChart('customTicksChart')">重置</button>
                </div>
            </div>

            <!-- 轴脊隐藏效果 -->
            <div class="chart-card" data-category="axis" style="animation-delay: 0.5s;">
                <h2 class="chart-title">🎨 轴脊隐藏效果</h2>
                <div class="stats">隐藏上轴脊和右轴脊 | 简洁设计风格 | 突出数据内容</div>
                <div class="chart-container">
                    <canvas id="spineChart"></canvas>
                </div>
                <div class="controls">
                    <button class="btn" onclick="toggleSpines()">切换轴脊显示</button>
                    <button class="btn" onclick="resetChart('spineChart')">重置</button>
                </div>
            </div>

            <!-- 移动轴脊位置 -->
            <div class="chart-card" data-category="axis" style="animation-delay: 0.6s;">
                <h2 class="chart-title">🎯 移动轴脊位置</h2>
                <div class="stats">轴脊居中显示 | 中心坐标系 | 数学坐标系风格</div>
                <div class="chart-container">
                    <canvas id="centerAxisChart"></canvas>
                </div>
                <div class="controls">
                    <button class="btn" onclick="toggleAxisPosition()">切换轴脊位置</button>
                    <button class="btn" onclick="animateChart('centerAxisChart')">播放动画</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // 全局图表配置
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;

        // 颜色主题
        const colors = {
            primary: 'rgba(102, 126, 234, 0.8)',
            secondary: 'rgba(118, 75, 162, 0.8)',
            accent: 'rgba(255, 153, 0, 0.8)',
            success: 'rgba(52, 211, 153, 0.8)',
            danger: 'rgba(239, 68, 68, 0.8)',
            warning: 'rgba(245, 158, 11, 0.8)'
        };

        // 深圳市24小时风速数据
        const windSpeedData = {
            labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
            datasets: [{
                label: '平均风速 (km/h)',
                data: [7, 9, 11, 14, 8, 15, 22, 11, 10, 11, 11, 13],
                borderColor: colors.primary,
                backgroundColor: colors.primary.replace('0.8', '0.2'),
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: '#FF9900',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        };

        // 初始化风速图表
        const windSpeedCtx = document.getElementById('windSpeedChart').getContext('2d');
        window.windSpeedChart = new Chart(windSpeedCtx, {
            type: 'line',
            data: windSpeedData,
            options: {
                plugins: {
                    legend: { display: false },
                    title: { display: false }
                },
                scales: {
                    x: {
                        title: { display: true, text: '时间' },
                        ticks: { rotation: 45 }
                    },
                    y: {
                        title: { display: true, text: '风速 (km/h)' },
                        beginAtZero: true
                    }
                },
                animation: { duration: 2000, easing: 'easeInOutQuart' }
            }
        });

        // 正弦余弦数据
        const xData = [];
        const sinData = [];
        const cosData = [];
        for (let x = -2 * Math.PI; x <= 2 * Math.PI; x += 0.1) {
            xData.push(x);
            sinData.push(Math.sin(x));
            cosData.push(Math.cos(x));
        }

        // 初始化正弦余弦图表
        const trigCtx = document.getElementById('trigChart').getContext('2d');
        window.trigChart = new Chart(trigCtx, {
            type: 'line',
            data: {
                labels: xData.map(x => x.toFixed(2)),
                datasets: [
                    {
                        label: '正弦曲线',
                        data: sinData,
                        borderColor: colors.primary,
                        backgroundColor: colors.primary.replace('0.8', '0.2'),
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: '余弦曲线',
                        data: cosData,
                        borderColor: colors.secondary,
                        backgroundColor: colors.secondary.replace('0.8', '0.2'),
                        borderWidth: 2,
                        tension: 0.4
                    }
                ]
            },
            options: {
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'x' },
                        ticks: {
                            callback: function(value, index) {
                                const val = parseFloat(this.getLabelForValue(value));
                                const piVals = [-2*Math.PI, -1.5*Math.PI, -Math.PI, -0.5*Math.PI, 0, 0.5*Math.PI, Math.PI, 1.5*Math.PI, 2*Math.PI];
                                const piLabels = ['-2π', '-3π/2', '-π', '-π/2', '0', 'π/2', 'π', '3π/2', '2π'];
                                for (let i = 0; i < piVals.length; i++) {
                                    if (Math.abs(val - piVals[i]) < 0.1) return piLabels[i];
                                }
                                return '';
                            }
                        }
                    },
                    y: {
                        title: { display: true, text: 'y' },
                        min: -1.5,
                        max: 1.5
                    }
                }
            }
        });

        // 多坐标轴示例
        const multiAxisCtx = document.getElementById('multiAxisChart').getContext('2d');
        window.multiAxisChart = new Chart(multiAxisCtx, {
            type: 'bar',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                datasets: [
                    {
                        label: '温度 (°C)',
                        data: [5, 8, 15, 20, 25, 30],
                        backgroundColor: colors.danger,
                        yAxisID: 'y'
                    },
                    {
                        label: '湿度 (%)',
                        data: [60, 55, 50, 45, 50, 55],
                        type: 'line',
                        borderColor: colors.success,
                        backgroundColor: colors.success.replace('0.8', '0.2'),
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                plugins: { legend: { position: 'top' } },
                scales: {
                    x: { title: { display: true, text: '月份' } },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: '温度 (°C)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: '湿度 (%)' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });

        // 自定义刻度样式
        const customTicksCtx = document.getElementById('customTicksChart').getContext('2d');
        window.customTicksChart = new Chart(customTicksCtx, {
            type: 'line',
            data: {
                labels: ['0', '2π/4', 'π/2', '3π/4', 'π', '5π/4', '3π/2', '7π/4', '2π'],
                datasets: [{
                    label: '自定义刻度',
                    data: [0, 1.4, 2, 1.4, 0, -1.4, -2, -1.4, 0],
                    borderColor: colors.accent,
                    backgroundColor: colors.accent.replace('0.8', '0.2'),
                    borderWidth: 3,
                    tension: 0.4
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        title: { display: true, text: '角度' },
                        ticks: { rotation: 45 }
                    },
                    y: {
                        title: { display: true, text: '幅值' },
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return value + 'm';
                            }
                        }
                    }
                }
            }
        });

        // 轴脊隐藏效果
        const spineCtx = document.getElementById('spineChart').getContext('2d');
        window.spineChart = new Chart(spineCtx, {
            type: 'line',
            data: {
                labels: ['1', '2', '3', '4', '5', '6'],
                datasets: [{
                    label: '简洁显示',
                    data: [10, 20, 15, 25, 18, 30],
                    borderColor: colors.warning,
                    backgroundColor: colors.warning.replace('0.8', '0.2'),
                    borderWidth: 2,
                    tension: 0.4
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { display: false },
                        title: { display: true, text: '时间' }
                    },
                    y: {
                        grid: { display: false },
                        title: { display: true, text: '数值' }
                    }
                }
            }
        });

        // 中心轴脊
        const centerAxisCtx = document.getElementById('centerAxisChart').getContext('2d');
        window.centerAxisChart = new Chart(centerAxisCtx, {
            type: 'line',
            data: {
                labels: ['-3', '-2', '-1', '0', '1', '2', '3'],
                datasets: [{
                    label: '中心坐标系',
                    data: [-2, -1, 0.5, 1, 0.5, -1, -2],
                    borderColor: colors.primary,
                    backgroundColor: colors.primary.replace('0.8', '0.2'),
                    borderWidth: 2,
                    tension: 0.4
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        title: { display: true, text: 'x' }
                    },
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        title: { display: true, text: 'y' }
                    }
                }
            }
        });

        // 交互函数
        function toggleChartType(chartId) {
            const chart = window[chartId];
            chart.config.type = chart.config.type === 'line' ? 'bar' : 'line';
            chart.update('active');
        }

        function toggleDataset(chartId, datasetIndex) {
            const chart = window[chartId];
            const dataset = chart.data.datasets[datasetIndex];
            dataset.hidden = !dataset.hidden;
            chart.update();
        }

        function animateChart(chartId) {
            const chart = window[chartId];
            chart.reset();
            chart.update('active');
        }

        function resetChart(chartId) {
            const chart = window[chartId];
            chart.reset();
            chart.update();
        }

        function randomizeData() {
            const chart = window.multiAxisChart;
            chart.data.datasets.forEach(dataset => {
                dataset.data = dataset.data.map(() => Math.floor(Math.random() * 40));
            });
            chart.update();
        }

        function changeTickStyle() {
            const chart = window.customTicksChart;
            chart.options.scales.x.ticks.rotation = chart.options.scales.x.ticks.rotation === 45 ? 0 : 45;
            chart.update();
        }

        function toggleSpines() {
            const chart = window.spineChart;
            const currentDisplay = chart.options.scales.x.grid.display;
            chart.options.scales.x.grid.display = !currentDisplay;
            chart.options.scales.y.grid.display = !currentDisplay;
            chart.update();
        }

        function toggleAxisPosition() {
            const chart = window.centerAxisChart;
            chart.options.scales.x.grid.color = chart.options.scales.x.grid.color === 'rgba(0, 0, 0, 0.1)' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(0, 0, 0, 0.1)';
            chart.update();
        }

        // 筛选图表
        function filterCharts(category) {
            const cards = document.querySelectorAll('.chart-card');
            const buttons = document.querySelectorAll('.filter-btn');
            
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            cards.forEach((card, index) => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    card.style.animationDelay = (index * 0.1) + 's';
                    card.style.animation = 'fadeInUp 0.8s ease backwards';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                Object.keys(window).forEach(key => {
                    if (key.includes('Chart') && window[key].reset) {
                        window[key].reset();
                        window[key].update();
                    }
                });
            }
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                Object.keys(window).forEach(key => {
                    if (key.includes('Chart') && window[key].update) {
                        window[key].reset();
                        window[key].update('active');
                    }
                });
            }
        });

        // 页面加载完成后的初始化
        window.addEventListener('load', () => {
            console.log('📊 数据可视化页面加载完成！');
        });
    </script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 处理API请求
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({
        message: 'API endpoint',
        path: url.pathname,
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 返回HTML内容
    return new Response(HTML_CONTENT, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
};