const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const jwt = require('jsonwebtoken');

module.exports = (app) => {
    app.use('/', authRoutes);  // Auth and home routes
    app.use('/', userRoutes);

};