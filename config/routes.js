const authRoutes = require('../routes/authRoutes');


module.exports = (app) => {
    app.use('/', authRoutes);  // Auth and home routes
 
};