'use strict';

import ajax from './api'

function ChartModel() {
    this.listeners = [];

    this.type = 'project';
    this.period = '6 months';
    this.skills = {};
    this.aggregatedData = {};

    this.data = new google.visualization.arrayToDataTable([
        ['', ''],
        ['', 0]
    ]);

    this.init();
}

ChartModel.prototype.setType = function (type) {
    if (this.type !== type) {
        this.type = type;

        this.trigger('changeType', [type]);
        this.trigger('loading', [this]);
        this.refresh();
    }
};

ChartModel.prototype.setPeriod = function (period) {
    if (this.period !== period) {
        this.period = period;

        this.trigger('changePeriod', [period]);

        //DO LOAD DATA
        this.trigger('loading', [this]);
        this.refresh();
    }
};

ChartModel.prototype.getRequestData = function () {
    let result = {
        url: '',
        data: {
            "from":0,
            "size":0,
            "query":{
                "bool":{
                    "must":{
                        "nested":{
                            "path":"assignedId",
                            "query":{
                                "exists":{
                                    "field":"assignedId"
                                }
                            }
                        }
                    },
                    "filter":{
                        "range":{
                            "createdAt":{
                                //put some data
                            }
                        }
                    }
                }
            },
            "aggs":{
                "chart":{
                    "date_histogram":{
                        "field":"createdAt",
                        //"interval":"month"
                    },
                    "aggs":{
                        "skills":{
                            "nested":{
                                "path":"main_skill"
                            },
                            "aggs":{
                                "list":{
                                    "terms":{
                                        "field":"main_skill.id"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    let now = new Date();
    if (this.type === 'project') {
        result.url = 'https://es.aog.jobs/elastic/project/project/_search?from=0&size=0';
    } else if (this.type === 'profile') {
        result.url = 'https://es.aog.jobs/elastic/profile/_search?from=0&size=0';

        result.data.aggs.chart.aggs.buck = result.data.aggs.chart.aggs.skills;
        result.data.aggs.chart.aggs.buck.aggs.skills = result.data.aggs.chart.aggs.buck.aggs.list;
        delete result.data.query.bool.must;
        delete result.data.aggs.chart.aggs.skills;
        delete result.data.aggs.chart.aggs.buck.aggs.list;
    }

    switch (this.period) {
        case '6 months': {
            result.data.query.bool.filter.range.createdAt.gte = 'now-6M/M';
            result.data.query.bool.filter.range.createdAt.lt = (new Date(now.getFullYear(), now.getMonth(), 1)).toISOString();
            result.data.aggs.chart.date_histogram.interval = 'month';
        } break;
        case '1 month': {
            result.data.query.bool.filter.range.createdAt.gte = 'now-30d/d';
            result.data.query.bool.filter.range.createdAt.lt = now.toISOString();
            result.data.aggs.chart.date_histogram.interval = 'day';
        } break;
        case '7 days': {
            result.data.query.bool.filter.range.createdAt.gte = 'now-6d/d';
            result.data.query.bool.filter.range.createdAt.lt = now.toISOString();
            result.data.aggs.chart.date_histogram.interval = 'day';
        } break;
    }

    return result;
};

ChartModel.prototype.init = function () {
    if (!this.skills.length) {
        ajax('POST', 'https://es.aog.jobs/elastic/directory/skill/_search?from=0&size=10000', {
            "from": 0,
            "size": 10000,
            "query": {"match_all": {}}
        }, response => {
            response = JSON.parse(response);
            response.hits.hits.forEach(skill => {
                this.skills[skill._source.id] = skill._source.skill;
            });
            this.refresh();
        });
    } else {
        this.refresh();
    }
};

ChartModel.prototype.refresh = function () {
    if (this.aggregatedData[this.type + this.period]) {
        this.data = new google.visualization.arrayToDataTable(this.aggregatedData[this.type + this.period]);
        this.trigger('refresh', [this]);
        return;
    }

    let requestData = this.getRequestData();
    ajax('POST', requestData.url, requestData.data, response => {
        response = JSON.parse(response);

        let skillsRating = {};
        response.aggregations.chart.buckets.forEach(bucket => {
            let skillsSource;
            if (this.type === 'project') {
                skillsSource = bucket.skills.list.buckets;
            } else if (this.type === 'profile') {
                skillsSource = bucket.buck.skills.buckets;
            }

            skillsSource.forEach(skill => {
                if (!skillsRating[skill.key]) {
                    skillsRating[skill.key] = 0;
                }
                skillsRating[skill.key] += skill.doc_count;
            })
        });

        let skills = [];
        Object.keys(skillsRating).forEach(skillId => {
            skills.push({
                skillId,
                rating: skillsRating[skillId]
            });
        });

        skills.sort((a, b) => {
            return b.rating - a.rating;
        });

        let data = [
            ['', 'Other'].concat(skills.slice(0,9).reverse().map(skill => this.skills[skill.skillId])),
        ];

        response.aggregations.chart.buckets.forEach(bucket => {
            let rating = [];
            for (let i = 0; i < data[0].length; i++) {
                rating.push(0);
            }

            let skillsSource;
            if (this.type === 'project') {
                skillsSource = bucket.skills.list.buckets;
            } else if (this.type === 'profile') {
                skillsSource = bucket.buck.skills.buckets;
            }

            skillsSource.forEach(skill => {
                let idx = data[0].indexOf(this.skills[skill.key]);
                if (idx >= 0) {
                    rating[idx] += skill.doc_count;
                } else {
                    //other
                    rating[1] += skill.doc_count;
                }
            });

            rating[0] = getTitle(this.period, bucket.key);
            data.push(rating);
        });

        function getTitle(period, timestamp) {
            let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

            if (period === '6 months') {
                return monthNames[(new Date(timestamp)).getMonth()];
            }

            if (period === '7 days') {
                return dayNames[(new Date(timestamp)).getDay()];
            }

            //'1 month'
            return (new Date(timestamp)).getDate() + '';
        }

        this.data = new google.visualization.arrayToDataTable(data);
        this.aggregatedData[this.type + this.period] = data;
        this.trigger('refresh', [this]);
    });
};

ChartModel.prototype.on = function (event, callback) {
    this.listeners.push({
        event: event,
        callback: callback
    });
};

ChartModel.prototype.trigger = function (event, args) {
    this.listeners.forEach(listener => {
        if (listener.event === event) {
            listener.callback.apply(this, args);
        }
    });
};

export default ChartModel;