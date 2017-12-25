'use strict';

import charts from 'charts';
import ChartModel from './chart/chartModel'
import drawChartController from './chart/controller'
import './style.scss'

window.addEventListener('load', function () {
    charts.load('current', {packages: ['corechart', 'bar']});
    charts.setOnLoadCallback(drawChart);

    function drawChart() {
        let chartData = new ChartModel();
        drawChartController(document.getElementById('myChart'), chartData);
    }
});
