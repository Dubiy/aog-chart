'use strict';

export default function chartView(rootElement, chartData) {
    let chartElement = document.createElement('div');
    chartElement.classList.add('chart-wrapper', 'loading');
    rootElement.appendChild(chartElement);

    let chart = new google.visualization.ColumnChart(chartElement);

    let options = {
        title: chartData.type === 'project' ? 'Processed requests' : 'New IT Talents',
        height: 500,
        bar: {
            groupWidth: '65%'
        },
        hAxis: {
            title: '',
            titleTextStyle: {
                color: '#212121'
            }
        },
        vAxis: {
            minValue: 0
        },
        animation: {
            startup: true,
            duration: 500,
            easing: 'out'
        },
        isStacked: true
    };

    if (chartData.data) {
        chart.draw(chartData.data, options);
    }

    chartData.on('loading', function (chartData) {
        chartElement.classList.add('loading');
    });


    chartData.on('refresh', function (chartData) {
        options.title = chartData.type === 'project' ? 'Processed requests' : 'New IT Talents';
        chart.draw(chartData.data, options);
        chartElement.classList.remove('loading');
    });
}