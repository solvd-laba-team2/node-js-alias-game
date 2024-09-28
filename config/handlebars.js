const { engine } = require('express-handlebars');
const path = require('path');

module.exports = (app) => {
    app.engine('hbs', engine({
        extname: '.hbs',
        defaultLayout: 'main',
        helpers: {
            eq: function (a, b) {
                return a === b;
            },
            or: (v1, v2) => v1 || v2,
        }
    }));
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, '../views'));
};
