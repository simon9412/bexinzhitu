const CartItem = require('../models/cart');
const statusCode = require('../common/statusCode');
const { ALLOWED_ROLES, ALLOWED_USE } = require('../common/enum');


async function addCart(req, res) {

    const { goodId, quantity } = req.body;

    return res.status(200).json({
        statusCode: statusCode.success,
        msg: '加入购物车成功',
        data: []
    });
}


module.exports = {
    addCart,
};