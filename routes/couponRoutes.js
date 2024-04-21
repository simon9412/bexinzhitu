const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

// 查询优惠券列表
router.get('/getCouponList', couponController.getCouponList);

// 查询当前最优惠的优惠券
router.get('/getMostFavorableCoupon', couponController.getMostFavorableCoupon);


module.exports = router;