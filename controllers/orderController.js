const { Sku } = require('../models/sku');
const Wxuser = require('../models/wxuser');
const Order = require('../models/order');
const CartItem = require('../models/cart');
const statusCode = require('../common/statusCode');
const { getOrderId } = require('../common/util');

/**
 * @description 提交订单
 * @method POST
 * @param {*}  
 * @returns Promise
 */
async function submitOrder(req, res) {
    const { orderDetail } = req.body;

    try {
        let freight = 0;
        let porterage = 0;
        let totalAmout = 0;
        let couponFee = 0;

        // 找到当前用户
        const currentUser = await Wxuser.findOne({ openId: req.auth.openid })
            .populate({ path: 'cartInfo', select: { __v: 0 } })
            .populate({ path: 'orderInfo', select: { __v: 0 } })
            .populate({ path: 'addressInfo', select: { __v: 0 } })
            .populate({ path: 'couponInfo', select: { __v: 0 } })
            .select({ _id: 0, __v: 0 })
            .exec();
        // console.log(currentUser.cartInfo.cartList);

        // 验证前端传过来的goodId，在购物车中isChecked为true，并且数量也相同
        const isValid = orderDetail.orderItems.every(item => {
            const matchItem = currentUser.cartInfo.cartList.find(fItem => fItem.goodId === item.goodId);
            if (!matchItem || matchItem.quantity !== item.quantity || !matchItem.isChecked) {
                return false;
            }
            return true;
        });
        if (!isValid) {
            return res.status(400).json({
                statusCode: statusCode.paramErr,
                msg: '商品状态或数量异常',
            });
        }

        // 通过goodid找到对应商品的价格，乘以传过来的数量，得到每个商品的小计价格, 
        const newData = await Promise.all(orderDetail.orderItems.map(async (item) => {
            const goodInfo = await Sku.findOne({ goodId: item.goodId })
                .populate({ path: 'goodInfo', select: { _id: 0, __v: 0 } })
                .select({ _id: 0, __v: 0 })
                .exec();
            if (!goodInfo) {
                throw new Error(`商品ID ${item.goodId} 不存在`);
            }
            if (goodInfo.goodInfo) {
                // TODO  这里要改，肯定有问题
                const price = item.quantity * goodInfo.goodInfo.originalPriceList;
                return {
                    goodId: item.goodId,
                    quantity: item.quantity,
                    price: price,
                    goodInfo: goodInfo.goodInfo
                }
            }
        }));
        console.log(newData);
        // 计算商品总价
        const totalGoodPrice = newData.reduce((total, item) => total + item.price, 0);

        // 计算商品总数
        const totalGoodQuantity = newData.reduce((total, item) => total + item.quantity, 0);

        // 计算运费 除了瓦类的，
        if (totalGoodPrice < 500) {
            freight = 69;
        } else if (totalGoodPrice >= 500 && totalGoodPrice < 800) {
            freight = 49;
        }


        // 一个地址第二次下单，需要第一次瓦类满一千   第二次补货满300即可免运费 同一个地址
        // 每次不满600  运费99元 瓦类

        newData.map(item => {
            if (item.goodInfo.secCategory === 'Mu') {
                // 子类名字带板的，带木方
            }

            if (item.goodInfo.secCategory === 'You') {
                // 2层开始1层加5毛钱 腻子类
            }
        })

        // TODO:计算搬运费 搬运费加到每个商品里去了，商品多加个楼层选择



        // 如果使用了优惠券,去查优惠券的信息
        // if (orderDetail.couponId) {
        //     const notUsed = currentUser.couponInfo.couponList.find(item => item.couponId === orderDetail.couponId);
        //     if(notUsed){
        //         if(){

        //         }
        //     }
        // }

        totalAmout = totalGoodPrice + freight + porterage - couponFee;
        console.log(totalAmout);

        // 总价与前端传的总价一致，则保存到数据库，成功返回，否则，返回给前端 价格已更新

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: []
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试',
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
