const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 提交订单
router.post('/submitOrder', orderController.submitOrder);

// 取消订单
router.post('/cancelOrder', orderController.cancelOrder);

// // 删除订单
// router.post('/deleteOrder', orderController.deleteOrder);

// 订单列表
router.get('/getOrderList', orderController.getOrderList);

// 通过订单id查询订单详情
router.get('/getOrderDetail', orderController.getOrderDetail);

module.exports = router;