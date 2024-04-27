const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const wxuserController = require('../controllers/wxuserController');
const skuController = require('../controllers/skuController');
const couponController = require('../controllers/couponController');
const orderController = require('../controllers/orderController');
const discountController = require('../controllers/discountController');
const auditController = require('../controllers/auditController');


const { checkAdminPermission, checkGroupPermission } = require('../common/jwt');

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

// 增加满减打折
router.post('/addAndUpdateDiscount', checkAdminPermission, discountController.addAndUpdateDiscount);


/**
 * 优惠券管理
 */
// 发放优惠券
router.post('/addCoupon', checkAdminPermission, couponController.addCoupon);

// 删除优惠券
router.post('/deleteCoupon', checkAdminPermission, couponController.deleteCoupon);

// 修改优惠券信息
router.post('/updateCoupon', checkAdminPermission, couponController.updateCoupon);


/**
 * 订单管理
 */
// 发货
router.post('/shipOrder', orderController.shipOrder);

// 删除订单
router.post('/deleteOrder', checkAdminPermission, orderController.deleteOrder);

// 修改订单信息
router.post('/updateOrder', checkAdminPermission, orderController.updateOrder);

// 后台用户查看自己绑定客户的订单
router.get('/getOrderListBindUser', orderController.getOrderListBindUser);

/**
 * 审核订单
 */
// 审核列表
router.get('/auditList', checkGroupPermission, auditController.auditList);

// group通过审核，正常应该通过完了再提交给admin审核，暂时先做group审核即可
router.post('/acceptAudit', checkGroupPermission, auditController.acceptAudit);

// 拒绝审核
router.post('/rejectAudit', checkGroupPermission, auditController.rejectAudit);


module.exports = router;
