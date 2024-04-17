const express = require('express');
const router = express.Router();
const skuController = require('../controllers/skuController');
const { checkAdminPermission } = require('../common/jwt')

// 查询品牌列表
router.get('/getBrandList', skuController.getBrandList);

// 查询分类列表
router.get('/getCategoryList', skuController.getCategoryList);

// 按分类查询
router.get('/getSkuList/:category', skuController.getSkuListByCategory);

// 查询商品列表
router.get('/getSkuList', skuController.getSkuList);

// 增加商品
router.post('/addSku', checkAdminPermission, skuController.addSku);

// 修改商品信息
router.post('/updateSku', checkAdminPermission, skuController.updateSku);

// 删除商品
router.post('/deleteSku', checkAdminPermission, skuController.deleteSku);

// 按商品名或品牌名查询
router.get('/searchSku', skuController.searchSku);


module.exports = router;