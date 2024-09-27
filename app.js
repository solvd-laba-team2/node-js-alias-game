const express = require('express');
const app = express();


require('./config/handlebars')(app);
require('./config/middleware')(app);
require('./config/routes')(app);

module.exports = app;
