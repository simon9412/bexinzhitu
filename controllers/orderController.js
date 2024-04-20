const { Sku } = require('../models/sku');
const Wxuser = require('../models/wxuser');
const Order = require('../models/order');
const statusCode = require('../common/statusCode');

/**
 * @description
 * @method POST
 * @param {*}  
 * @returns Promise
 */
async function submitOrder(req, res) {
    const { orderDetail } = req.body;

    // console.log(orderDetail.orderItems);
    // 找到当前用户及cartInfo
    const currentUser = await Wxuser.findOne({ openId: req.auth.openid })
        .populate({ path: 'cartInfo', select: { __v: 0 } })
        .select({ _id: 0, __v: 0 })
        .exec();

    orderDetail.orderItems.map(async (item) => {
        // 找到商品信息
        const goodInfo = await Sku.findOne({ goodId: item.goodId })
            .populate({ path: 'goodInfo', select: { _id: 0, __v: 0 } })
            .select({ _id: 0, __v: 0 })
            .exec();
        console.log(goodInfo);
    })


    // 通过goodid找到对应商品的价格，乘以传过来的数量，得到每个商品的小计价格, 

    // 计算运费

    // TODO:计算搬运费

    // 总价与前端传的总价一致，则保存到数据库，成功返回，否则，返回给前端价格已更新


    try {
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: []
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description
 * @method POST
 * @param {*} params 
 * @returns Promise
 */
async function cancelOrder(req, res) {
    const { } = req.body;

    try {
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: []
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description
 * @method POST
 * @param {*} params 
 * @returns Promise
 */
async function updateOrderStatus(req, res) {
    const { } = req.body;

    try {
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: []
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description
 * @method POST
 * @param {*} params 
 * @returns Promise
 */
async function deleteOrder(req, res) {
    const { } = req.body;

    try {
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: []
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description
 * @method POST
 * @param {*} params 
 * @returns Promise
 */
async function getOrderList(req, res) {
    const { } = req.body;

    try {
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: []
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description
 * @method POST
 * @param {*} params 
 * @returns Promise
 */
async function getOrderDetail(req, res) {
    const { } = req.body;

    try {
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: []
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

module.exports = {
    submitOrder,
    cancelOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderList,
    getOrderDetail
};
