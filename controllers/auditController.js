const Audit = require('../models/audit');
const Order = require('../models/order');
const statusCode = require('../common/statusCode');
const util = require('../common/util');

/**
 * @description 发起审核
 * @method POST
 * @param {String} orderId 
 * @param {Object} orderInfo
 * @returns Promise
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

        const existingAudit = await Audit.find({ orderId: orderId, auditStatus: 'pending_group' });

        // 将已提交过的audit状态改为cancelled
        if (existingAudit.length !== 0) {
            await Audit.findOneAndUpdate(
                { auditId: existingAudit[0].auditId },
                {
                    $set: {
                        auditStatus: 'cancelled'
                    }
                }
            );
        }


        const data = await Audit.findOneAndUpdate(
            { auditId: auditId },
            {
                $set: {
                    auditId: auditId,
                    auditUser: req.auth.phoneNumber,
                    orderId: orderId,
                    auditStatus: 'pending_group',
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

/**
 * @description group或admin查看的审核列表
 * @method GET
 * @param null 
 * @returns Promise
 */
async function auditList(req, res) {
    const auditList = await Audit.find().select({ _id: 0, __v: 0 });

    try {
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: auditList
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 通过审核
 * @method POST
 * @param {String} orderId 
 * @param {Object} orderInfo 
 * @returns Promise
 */
async function acceptAudit(req, res) {
    const { auditIds } = req.body;

    try {
        const accept = await Promise.all(auditIds.map(async (auditId) => {
            const auditInfo = await Audit.findOne({ auditId });

            if (!auditInfo) {
                return {
                    statusCode: statusCode.failed,
                    msg: 'auditId不存在'
                };
            }

            if (auditInfo.auditStatus === 'accepted' || auditInfo.auditStatus === 'rejected' || auditInfo.auditStatus === 'cancelled') {
                return {
                    statusCode: statusCode.failed,
                    msg: 'audit状态异常'
                };
            }

            const orderId = auditInfo.orderId;

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
                orderItems: auditInfo.orderItems ? auditInfo.orderItems : oldOrderInfo.orderList[0].orderItems, // 订单商品信息
                cateSubtotal: auditInfo.cateSubtotal ? auditInfo.cateSubtotal : oldOrderInfo.orderList[0].cateSubtotal, // 订单大类小计
                distributionMode: auditInfo.distributionMode ? auditInfo.distributionMode : oldOrderInfo.orderList[0].distributionMode, // 配送方式
                deliveryDate: auditInfo.deliveryDate ? auditInfo.deliveryDate : oldOrderInfo.orderList[0].deliveryDate, // 期望送达日期
                couponId: auditInfo.couponId ? auditInfo.couponId : oldOrderInfo.orderList[0].couponId,// 是否使用了优惠券，用了则保存的是id
                elevator: auditInfo.elevator ? auditInfo.elevator : oldOrderInfo.orderList[0].elevator, // 是否电梯，默认楼梯
                freight: auditInfo.freight !== undefined ? auditInfo.freight : oldOrderInfo.orderList[0].freight, // 货运费
                porterage: auditInfo.porterage !== undefined ? auditInfo.porterage : oldOrderInfo.orderList[0].porterage, // 人工搬运费
                totalDiscount: auditInfo.totalDiscount !== undefined ? auditInfo.totalDiscount : oldOrderInfo.orderList[0].totalDiscount, // 总优惠，含折扣和券
                totalPrice: auditInfo.totalPrice !== undefined ? auditInfo.totalPrice : oldOrderInfo.orderList[0].totalPrice, // 订单总原价
                totalPayment: auditInfo.totalPayment !== undefined ? auditInfo.totalPayment : oldOrderInfo.orderList[0].totalPayment, // 订单总折扣价
                useBalance: auditInfo.useBalance !== undefined ? auditInfo.useBalance : oldOrderInfo.orderList[0].useBalance,// 使用了多少余额，默认0，支付后更新
                status: auditInfo.status ? auditInfo.status : oldOrderInfo.orderList[0].status, // 订单状态 pending待支付、paid已支付、shipped已发货、completed已完成、cancelled已取消
                address: auditInfo.address ? auditInfo.address : oldOrderInfo.orderList[0].address, // 收货地址
                description: auditInfo.description ? auditInfo.description : oldOrderInfo.orderList[0].description, // 订单备注
                shippedAt: auditInfo.shippedAt ? auditInfo.shippedAt : oldOrderInfo.orderList[0].shippedAt // 订单发货时间
            };
            newOrderInfo.totalPrice = util.adds(
                oldOrderInfo.orderList[0].totalPrice,
                -oldOrderInfo.orderList[0].freight,
                -oldOrderInfo.orderList[0].porterage,
                newOrderInfo.freight,
                newOrderInfo.porterage
            );
            newOrderInfo.totalPayment = util.adds(newOrderInfo.totalPrice, -newOrderInfo.totalDiscount);

            const updateOrder = await Order.findOneAndUpdate(
                { "orderList.orderId": orderId },
                {
                    $set: {
                        "orderList.$.orderItems": newOrderInfo.orderItems,
                        "orderList.$.cateSubtotal": newOrderInfo.cateSubtotal,
                        "orderList.$.distributionMode": newOrderInfo.distributionMode,
                        "orderList.$.deliveryDate": newOrderInfo.deliveryDate,
                        "orderList.$.couponId": newOrderInfo.couponId,
                        "orderList.$.elevator": newOrderInfo.elevator,
                        "orderList.$.freight": newOrderInfo.freight,
                        "orderList.$.porterage": newOrderInfo.porterage,
                        "orderList.$.totalDiscount": newOrderInfo.totalDiscount,
                        "orderList.$.totalPrice": newOrderInfo.totalPrice,
                        "orderList.$.totalPayment": newOrderInfo.totalPayment,
                        "orderList.$.useBalance": newOrderInfo.useBalance,
                        "orderList.$.status": newOrderInfo.status,
                        "orderList.$.address": newOrderInfo.address,
                        "orderList.$.description": newOrderInfo.description,
                        "orderList.$.shippedAt": newOrderInfo.shippedAt
                    }
                },
                { new: true }
            );
            if (!updateOrder) {
                return {
                    statusCode: statusCode.failed,
                    msg: '更新失败'
                };
            }
            return await Audit.findOneAndUpdate(
                { auditId },
                {
                    $set: {
                        auditStatus: 'accepted'
                    }
                }
            );
        }));

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: accept
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 拒绝审核
 * @method POST
 * @param {String} orderId 
 * @param {Object} orderInfo 
 * @returns Promise
 */
async function rejectAudit(req, res) {
    const { auditIds } = req.body;

    const reject = await Promise.all(auditIds.map(async (auditId) => {
        const auditInfo = await Audit.findOne({ auditId });

        if (!auditInfo) {
            return {
                statusCode: statusCode.failed,
                msg: 'auditId不存在'
            };
        }

        if (auditInfo.auditStatus === 'accepted' || auditInfo.auditStatus === 'rejected' || auditInfo.auditStatus === 'cancelled') {
            return {
                statusCode: statusCode.failed,
                msg: 'audit状态异常'
            };
        }

        return await Audit.findOneAndUpdate(
            { auditId },
            {
                $set: {
                    auditStatus: 'rejected'
                }
            }
        );
    }));

    try {
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: reject
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description user查看自己提交的审核列表
 * @method GET
 * @param null 
 * @returns Promise
 */
async function userAuditList(req, res) {
    const auditList = await Audit.find({ auditUser: req.auth.phoneNumber }).select({ _id: 0, __v: 0 });

    try {
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: auditList
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

module.exports = {
    createAudit,
    auditList,
    userAuditList,
    acceptAudit,
    rejectAudit
};