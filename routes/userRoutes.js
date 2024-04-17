const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { checkAdminPermission, checkGroupPermission } = require('../common/jwt');

// 用户注册路由(需要管理员权限注册)
router.post('/register', checkAdminPermission, userController.register);

// 用户登录路由
router.post('/login', userController.login);

// 获取所有用户列表(需要管理员权限)
router.get('/getUserList', checkAdminPermission, userController.getUserList);

// 获取单个用户信息
router.get('/getUserInfo', userController.getUserInfo);

// 更新用户信息
router.post('/updateUserInfo', userController.updateUserInfo);

// 删除用户
router.post('/deleteUser', checkAdminPermission, userController.deleteUser);

// 查询下级用户
router.get('/getUnderlingUser', checkGroupPermission, userController.getUnderlingUser);

// 查询当前登录账号的信息
router.get('/getProfileInfo', userController.getProfileInfo);


module.exports = router;
