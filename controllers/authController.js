// authController.js

exports.getLogin = (req, res) => {
    res.render('login', { title: 'Login', page:'login' });
};

exports.getRegister = (req, res) => {
    res.render('register', { title: 'Register', page:'register' });
};
