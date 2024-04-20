const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

// 新增收货地址
router.post('/addAddress', addressController.addAddress);

// 修改收货地址
router.post('/updateAddress', addressController.updateAddress);

// 删除收货地址
router.post('/deleteAddress', addressController.deleteAddress);

// 收货地址列表
router.get('/getAddressList', addressController.getAddressList);

// 当前默认的收货地址详情
router.get('/getDefaultAddress', addressController.getDefaultAddress);

module.exports = router;