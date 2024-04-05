const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 用户注册路由
router.post('/register', userController.register);

// 用户登录路由
router.post('/login', userController.login);

module.exports = router;
