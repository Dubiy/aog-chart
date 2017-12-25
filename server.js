'use strict';

let express = require('express'),
    app = express(),
    http = require('http').Server(app),
    port = process.env.PORT || 4000;

app.use(express.static(__dirname + '/'));

http.listen(port, function () {
    console.log(`Server running at localhost:${port}`);
});