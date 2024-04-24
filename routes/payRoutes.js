const express = require('express');
const router = express.Router();
const payController = require('../controllers/payController');




// 获取微信端的支付通知，并将通知结果保存
router.get('/getNotify', payController.getNotify);


module.exports = router;
