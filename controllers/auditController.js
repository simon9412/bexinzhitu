const Audit = require('../models/audit');
const Order = require('../models/order');
const statusCode = require('../common/statusCode');
const util = require('../common/util');

/**
 * @description 发起审核
 * @method POST
 * @param {String} orderId 
 * @param {Object} orderInfo 
 */
async function createAudit(req, res) {
    const { orderId, orderInfo } = req.body;
    // 判断是否后台用户登录
    if (!req.auth.role) {
        return res.status(403).json({
            statusCode: statusCode.permissionFailed,
            msg: '无权限操作'
        });
    }

    try {
        const oldOrderInfo = await Order.findOne(
            { "orderList": { $elemMatch: { "orderId": orderId } } },
            { "orderList.$": 1 }
        );

        if (!oldOrderInfo) {
            return res.status(400).json({
                statusCode: statusCode.paramErr,
                msg: 'orderId不存在',
                data: []
            });
        }

        if (oldOrderInfo.orderList[0].status === 'shipped') {
            return res.status(200).json({
                statusCode: statusCode.failed,
                msg: '订单已发货，无法修改信息',
                data: []
            });
        }

        if (oldOrderInfo.orderList[0].status === 'completed') {
            return res.status(200).json({
                statusCode: statusCode.failed,
                msg: '订单已完成，无法修改信息',
                data: []
            });
        }

        if (oldOrderInfo.orderList[0].status === 'cancelled') {
            return res.status(200).json({
                statusCode: statusCode.failed,
                msg: '订单已取消，无法修改信息',
                data: []
            });
        }

        let newOrderInfo = {
            orderItems: orderInfo.orderItems ? orderInfo.orderItems : oldOrderInfo.orderList[0].orderItems, // 订单商品信息
            cateSubtotal: orderInfo.cateSubtotal ? orderInfo.cateSubtotal : oldOrderInfo.orderList[0].cateSubtotal, // 订单大类小计
            distributionMode: orderInfo.distributionMode ? orderInfo.distributionMode : oldOrderInfo.orderList[0].distributionMode, // 配送方式
            deliveryDate: orderInfo.deliveryDate ? orderInfo.deliveryDate : oldOrderInfo.orderList[0].deliveryDate, // 期望送达日期
            couponId: orderInfo.couponId ? orderInfo.couponId : oldOrderInfo.orderList[0].couponId,// 是否使用了优惠券，用了则保存的是id
            elevator: orderInfo.elevator ? orderInfo.elevator : oldOrderInfo.orderList[0].elevator, // 是否电梯，默认楼梯
            freight: orderInfo.freight !== undefined ? orderInfo.freight : oldOrderInfo.orderList[0].freight, // 货运费
            porterage: orderInfo.porterage !== undefined ? orderInfo.porterage : oldOrderInfo.orderList[0].porterage, // 人工搬运费
            totalDiscount: orderInfo.totalDiscount !== undefined ? orderInfo.totalDiscount : oldOrderInfo.orderList[0].totalDiscount, // 总优惠，含折扣和券
            totalPrice: orderInfo.totalPrice !== undefined ? orderInfo.totalPrice : oldOrderInfo.orderList[0].totalPrice, // 订单总原价
            totalPayment: orderInfo.totalPayment !== undefined ? orderInfo.totalPayment : oldOrderInfo.orderList[0].totalPayment, // 订单总折扣价
            useBalance: orderInfo.useBalance !== undefined ? orderInfo.useBalance : oldOrderInfo.orderList[0].useBalance,// 使用了多少余额，默认0，支付后更新
            address: orderInfo.address ? orderInfo.address : oldOrderInfo.orderList[0].address, // 收货地址
            description: orderInfo.description ? orderInfo.description : oldOrderInfo.orderList[0].description, // 订单备注
            shippedAt: orderInfo.shippedAt ? orderInfo.shippedAt : oldOrderInfo.orderList[0].shippedAt // 订单发货时间
        };

        if (orderInfo.freight !== undefined || orderInfo.porterage !== undefined || orderInfo.totalDiscount !== undefined) {
            newOrderInfo.totalPrice = util.adds(
                oldOrderInfo.orderList[0].totalPrice,
                -oldOrderInfo.orderList[0].freight,
                -oldOrderInfo.orderList[0].porterage,
                newOrderInfo.freight,
                newOrderInfo.porterage
            );
            newOrderInfo.totalPayment = util.adds(newOrderInfo.totalPrice, -newOrderInfo.totalDiscount);
        }

        const auditId = util.getOrderId();


        const data = await Audit.findOneAndUpdate(
            { auditId: auditId },
            {
                $set: {
                    auditId: auditId,
                    orderId: orderId,
                    auditStatus: '待group审核',
                    orderItems: newOrderInfo.orderItems,
                    cateSubtotal: newOrderInfo.cateSubtotal, // 订单大类小计
                    distributionMode: newOrderInfo.distributionMode, // 配送方式
                    deliveryDate: newOrderInfo.deliveryDate, // 期望送达日期
                    elevator: newOrderInfo.elevator, // 是否电梯，默认楼梯
                    couponId: newOrderInfo.couponId, // 是否使用了优惠券，用了则保存的是id
                    freight: newOrderInfo.freight, // 货运费
                    porterage: newOrderInfo.porterage, // 人工搬运费
                    totalDiscount: newOrderInfo.totalDiscount, // 总优惠，含折扣和券
                    totalPrice: newOrderInfo.totalPrice, // 订单总原价
                    totalPayment: newOrderInfo.totalPayment, // 订单总折扣价
                    useBalance: newOrderInfo.useBalance,// 使用了多少余额，默认0，支付后更新
                    address: newOrderInfo.address, // 收货地址 
                    description: newOrderInfo.description, // 订单备注
                    shippedAt: newOrderInfo.shippedAt // 订单发货时间
                }
            },
            {
                new: true,  // 返回更新后的文档，默认是返回更新前的文档
                upsert: true // 如果不存在，则创建新的文档，默认是false
            }
        );

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '提交审核成功',
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

module.exports = {
    createAudit
};