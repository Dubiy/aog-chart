import chartTypeView from './chartTypeView';
import chartView from './chartView';
import chartPeriodView from './chartPeriodView';

function drawChartController(rootElement, chartData) {

    chartTypeView(rootElement, chartData, {
        setType
    });
    chartView(rootElement, chartData);
    chartPeriodView(rootElement, chartData, {
        setPeriod
    });

    function setType(type) {
        chartData.setType(type);
    }

    function setPeriod(period) {
        chartData.setPeriod(period);
    }
}

export default drawChartController;