'use strict';

export default function chartPeriodView(rootElement, chartData, actions) {
    let chartPeriod = document.createElement('ul');
    chartPeriod.classList.add('period-switcher');

    let template = document.createElement('li');
    template.innerHTML = `<button class="btn btn-primary md-button">
                              <span></span>
                          </button>`;

    let chartPeriod6month = template.cloneNode(true);
    chartPeriod6month.dataset.period = '6 months';
    if (chartData.period === chartPeriod6month.dataset.period) {
        chartPeriod6month.classList.add('active');
    }
    chartPeriod6month.querySelector('span').innerText = '6 months';
    chartPeriod6month.addEventListener('click', onClick);
    chartPeriod.appendChild(chartPeriod6month);

    let chartPeriod1month = template.cloneNode(true);
    chartPeriod1month.dataset.period = '1 month';
    if (chartData.period === chartPeriod1month.dataset.period) {
        chartPeriod1month.classList.add('active');
    }
    chartPeriod1month.querySelector('span').innerText = 'Last 30 days';
    chartPeriod1month.addEventListener('click', onClick);
    chartPeriod.appendChild(chartPeriod1month);

    let chartPeriod7days = template.cloneNode(true);
    chartPeriod7days.dataset.period = '7 days';
    if (chartData.period === chartPeriod7days.dataset.period) {
        chartPeriod7days.classList.add('active');
    }
    chartPeriod7days.querySelector('span').innerText = 'Last 7 days';
    chartPeriod7days.addEventListener('click', onClick);
    chartPeriod.appendChild(chartPeriod7days);


    function onClick(event) {
        actions.setPeriod(event.currentTarget.dataset.period);
    }

    chartData.on('changePeriod', period => {
        [].forEach.call(chartPeriod.childNodes, function (periodElement) {
            if (periodElement.dataset.period === period) {
                periodElement.classList.add('active');
            } else {
                periodElement.classList.remove('active');
            }
        })
    });

    rootElement.appendChild(chartPeriod);
}