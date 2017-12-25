'use strict';

export default function ajax(method, url, data, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open(method.toUpperCase(), url);
    if (data) {
        xhr.setRequestHeader('Content-Type', 'application/json');
    }
    xhr.onload = function() {
        if (xhr.status === 200) {
            callback(xhr.responseText, xhr);
        } else {
            console.log('bad request', xhr);
        }
    };

    if (data) {
        xhr.send(JSON.stringify(data));
    } else {
        xhr.send();
    }
};