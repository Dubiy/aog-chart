'use strict';

export default function chartTypeView(rootElement, chartData, actions) {
    let chartType = document.createElement('ul');
    chartType.classList.add('type-switcher');

    let template = document.createElement('li');
    template.innerHTML = `<button class="btn btn-primary md-button">
                              <span></span>
                          </button>`;

    let chartTypeProject = template.cloneNode(true);
    chartTypeProject.dataset.type = 'project';
    if (chartData.type === chartTypeProject.dataset.type) {
        chartTypeProject.classList.add('active');
    }
    chartTypeProject.querySelector('span').innerText = 'Processed requests by skills';
    chartTypeProject.addEventListener('click', onClick);
    chartType.appendChild(chartTypeProject);

    let chartTypeProfile = template.cloneNode(true);
    chartTypeProfile.dataset.type = 'profile';
    if (chartData.type === chartTypeProfile.dataset.type) {
        chartTypeProfile.classList.add('active');
    }
    chartTypeProfile.querySelector('span').innerText = 'New IT Talents by skills';
    chartTypeProfile.addEventListener('click', onClick);
    chartType.appendChild(chartTypeProfile);

    function onClick(event) {
        actions.setType(event.currentTarget.dataset.type);
    }

    chartData.on('changeType', type => {
        [].forEach.call(chartType.childNodes, function (typeElement) {
            if (typeElement.dataset.type === type) {
                typeElement.classList.add('active');
            } else {
                typeElement.classList.remove('active');
            }
        })
    });

    rootElement.appendChild(chartType);
}