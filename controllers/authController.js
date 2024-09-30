const userController = require("./userController");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// GET Login Page
exports.getLogin = (req, res) => {
    res.render('login', { title: 'Login', page: 'login', errorMessage: null });
};

// GET Register Page
exports.getRegister = (req, res) => {
    res.render('register', { title: 'Register', page: 'register', errorMessage: null });
};

// POST Login
exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await userController.getUser(req, res);
        if (!user) {
            console.error(`The user ${username} was not found`);
            return res.render('login', {
                title: 'Login',
                page: 'login',
                errorMessage: 'Username or password is incorrect'
            });
        }

        // Await bcrypt.compare as it is asynchronous
        const passed = await bcrypt.compare(password, user.password);
        if (!passed) {
            console.error('Invalid password');
            return res.render('login', {
                title: 'Login',
                page: 'login',
                errorMessage: 'Username or password is incorrect'
            });
        }

        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });
        res.cookie("token", token);

        return res.status(200).redirect("/");
    } catch (error) {
        console.error(error.message);
        return res.status(500).render('login', {
            title: 'Login',
            page: 'login',
            errorMessage: 'Internal server error'
        });
    }
};

// POST Register
exports.postRegister = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if the user already exists
        const user = await userController.getUser(req, res);
        if (user) {
            console.error(`User ${username} already exists`);
            return res.render('register', {
                title: 'Register',
                page: 'register',
                errorMessage: 'Username already exists'
            });
        }

        // Await bcrypt.hash to ensure password is hashed
        const hashedPassword = await bcrypt.hash(password, 13);
        req.body.password = hashedPassword;

        // Create the user
        await userController.createUser(req, res);

        // Generate JWT token after user registration
        const token = jwt.sign({ username: username }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });
        res.cookie("token", token);

        return res.redirect("/");
    } catch (error) {
        console.error(error.message);
        return res.status(500).render('register', {
            title: 'Register',
            page: 'register',
            errorMessage: 'Internal server error'
        });
    }
};

// Logout
exports.getLogout = (req, res) => {
    res.clearCookie("token");
    return res.redirect('/login');
};
