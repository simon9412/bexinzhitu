const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 提交订单
router.post('/submitOrder', orderController.submitOrder);

// 取消订单
router.post('/updateAddress', orderController.cancelOrder);

// 更新订单状态
router.post('/deleteAddress', orderController.updateOrderStatus);

// 删除订单
router.post('/deleteAddress', orderController.deleteOrder);

// 订单列表
router.get('/getAddressList', orderController.getOrderList);

// 通过订单id查询订单详情
router.get('/getDefaultAddress', orderController.getOrderDetail);

module.exports = router;