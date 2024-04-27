const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auditController = require('../controllers/auditController');
const { checkGroupPermission } = require('../common/jwt');

// 用户登录路由
router.post('/login', userController.login);

// 获取单个用户信息
router.get('/getUserInfo', userController.getUserInfo);

// 更新用户信息
router.post('/updateUserInfo', userController.updateUserInfo);

// 查询下级用户
router.get('/getUnderlingUser', checkGroupPermission, userController.getUnderlingUser);

// 查询当前登录账号的信息
router.get('/getProfileInfo', userController.getProfileInfo);

// user发起审核
router.post('/createAudit', auditController.createAudit);

// user看自己的审核列表
router.get('/userAuditList', auditController.userAuditList);


module.exports = router;
