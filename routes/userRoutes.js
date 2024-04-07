const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { checkUserPermission } = require('../common/jwt')

// 用户注册路由
router.post('/register', userController.register);

// 用户登录路由
router.post('/login', userController.login);

// 获取注册用户列表(需要权限验证)
router.get('/getUserList', checkUserPermission, userController.getUserList);

module.exports = router;
