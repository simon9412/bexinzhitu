const { Sku } = require('../models/sku');
const Wxuser = require('../models/wxuser');
const Order = require('../models/order');
const CartItem = require('../models/cart');
const Coupon = require('../models/coupon');
const Discount = require('../models/discount');
const UserInfo = require('../models/user');
const statusCode = require('../common/statusCode');
const util = require('../common/util');



/**
 * @description 获取支付结果
 * @method GET
 * @param {*} req 
 * @param {*} res 
 */
async function getNotify(req, res) {

    return 
}


module.exports = {
    getNotify
};
