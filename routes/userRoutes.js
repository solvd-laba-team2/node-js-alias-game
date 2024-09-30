const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/user/:id', userController.getUserById);

router.post('/user', userController.createUser);

module.exports = router;
