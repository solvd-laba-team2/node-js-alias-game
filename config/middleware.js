const express = require('express');
const path = require('path');

module.exports = (app) => {
    // Middleware to serve static files
    app.use(express.static(path.join(__dirname, '../public')));

    // Middleware to handle POST data (forms)
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
};

