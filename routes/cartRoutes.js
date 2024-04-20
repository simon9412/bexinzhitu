const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// 添加购物车
router.post('/addCart', cartController.addCart);

// 查询购物车列表
router.get('/getCartList', cartController.getCartList);

// 删除购物车商品
router.post('/removeCart', cartController.removeCart);

// 修改checked状态
router.post('/updateChecked', cartController.updateChecked);



module.exports = router;