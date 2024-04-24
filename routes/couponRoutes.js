const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const discountController = require('../controllers/discountController');


// 查询优惠券列表
router.get('/getCouponList', couponController.getCouponList);

// 查询当前最优惠的优惠券
router.get('/getMostFavorableCoupon', couponController.getMostFavorableCoupon);

// 查询品类折扣列表
router.get('/getDiscountList', discountController.getDiscountList);


module.exports = router;