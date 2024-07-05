const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

// 收货地址列表
router.get('/getBannerList', configController.getBannerList);

// 当前默认的收货地址详情
router.get('/getDefaultAddress', configController.getBannerList);

module.exports = router;