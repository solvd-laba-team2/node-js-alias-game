const authRoutes = require('../routes/authRoutes');
const jwt = require('jsonwebtoken');

module.exports = (app) => {
    app.use('/', authRoutes);  // Auth and home routes

};