const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const wxuserController = require('../controllers/wxuserController');
const skuController = require('../controllers/skuController');
const couponController = require('../controllers/couponController');
const { checkAdminPermission } = require('../common/jwt');

/**
 * 后台员工管理
 */
// 员工注册
router.post('/register', checkAdminPermission, userController.register);

// 获取所有用户列表
router.get('/getUserList', checkAdminPermission, userController.getUserList);

// 删除用户
router.post('/deleteUser', checkAdminPermission, userController.deleteUser);

/**
 * wx用户管理
 */
// admin查询wx用户列表
router.get('/getWxUserList', checkAdminPermission, wxuserController.getWxUserList);

// admin修改用户信息
router.post('/updateUserInfoByAdmin', checkAdminPermission, wxuserController.updateUserInfoByAdmin);

/**
 * 商品管理
 */
// 增加商品
router.post('/addSku', checkAdminPermission, skuController.addSku);

// 修改商品信息
router.post('/updateSku', checkAdminPermission, skuController.updateSku);

// 删除商品
router.post('/deleteSku', checkAdminPermission, skuController.deleteSku);

// 管理员查询的商品列表包含成本价
router.get('/getSkuListByAdmin', checkAdminPermission, skuController.getSkuListByAdmin);

/**
 * 优惠券管理
 */
// 发放优惠券
router.post('/addCoupon', checkAdminPermission, couponController.addCoupon);

// 删除优惠券
router.post('/deleteCoupon', checkAdminPermission, couponController.deleteCoupon);



module.exports = router;
