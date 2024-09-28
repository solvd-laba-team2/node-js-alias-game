// authController.js
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

exports.getLogin = (req, res) => {
    res.render('login', { title: 'Login', page: 'login' });
};

exports.getRegister = (req, res) => {
    res.render('register', { title: 'Register', page: 'register' });
};

//temp function till we don't have db done
const getUser = function () {
    return {
        username: 'Mikita',
        password: 'password'
    }
}

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await getUser(username);
        if (!user) {
            console.error(`The user ${username} was not found`)
            return res.status(403).redirect("/");
        }

        const passed = bcrypt.compare(password, user.password);
        if (!passed) {
            console.error('Invalid password');
            return req.status(401).redirect("/");
        }

        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });
        res.cookie("token", token);

        return res.status(200).redirect("/");
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: "Server error" });
    }
}

exports.postRegister = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await getUser(username);
        if (user) {
            console.error(`User ${username} already exists`);
            return res.status(403).redirect("/");
        }

        //await createUser({ username, password });
        const token = jwt.sign({ username: username }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });
        res.cookie("token", token);

        return res.redirect("/");
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: "Server error" });
    }
}

exports.getLogout = (req, res) => {
    res.clearCookie("token");
    return res.redirect('/login');
}
