const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route to the home page
router.get('/', (req, res) => {
    res.render('home', { title: 'Alias Game - Home' });
});

// Route to login page
router.get('/login', authController.getLogin);

// Route to register page
router.get('/register', authController.getRegister);

module.exports = router;
