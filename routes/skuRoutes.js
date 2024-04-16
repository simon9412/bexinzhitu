const express = require('express');
const router = express.Router();
const skuController = require('../controllers/skuController');
const { checkAdminPermission } = require('../common/jwt')



// 查询商品列表
router.get('/getList', skuController.getList);

// 增加商品
router.post('/addSku', checkAdminPermission, skuController.addSku);




module.exports = router;