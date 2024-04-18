const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { checkAdminPermission } = require('../common/jwt');

// 添加购物车
router.post('/addCart', cartController.addCart);




module.exports = router;