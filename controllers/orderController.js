const { Sku } = require('../models/sku');
const Wxuser = require('../models/wxuser');
const Order = require('../models/order');
const CartItem = require('../models/cart');
const Coupon = require('../models/coupon');
const Discount = require('../models/discount');
const UserInfo = require('../models/user');
const statusCode = require('../common/statusCode');
const util = require('../common/util');

// 找到当前用户
async function findUser(openId) {
    return await Wxuser.findOne({ openId: openId })
        .populate({ path: 'cartInfo', select: { __v: 0 } })
        .populate({ path: 'orderInfo', select: { __v: 0 } })
        .populate({ path: 'addressInfo', select: { __v: 0 } })
        .populate({ path: 'couponInfo', select: { __v: 0 } })
        .select({ _id: 0, __v: 0 })
        .exec();
}

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
        let niFreight = 0;
        let porterage = 0;
        let totalPayment = 0;
        let couponFee = 0;

        // 找到当前用户
        const currentUser = await findUser(req.auth.openid);

        // 验证前端传过来的goodId，在购物车中isChecked为true，floor和数量也相同
        const isValid = orderDetail.orderItems.every(item => {
            const matchItem = currentUser.cartInfo.cartList.find(fItem => fItem.goodId === item.goodId && fItem.floor === item.floor);
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

        // 通过goodid找到对应商品的价格，乘以传过来的数量，再乘以折扣，得到每一个商品的小计价格
        const newData = await Promise.all(orderDetail.orderItems.map(async (item) => {
            const goodInfo = await Sku.findOne({ goodId: item.goodId })
                .populate({ path: 'goodInfo', select: { _id: 0, __v: 0 } })
                .select({ _id: 0, __v: 0 })
                .exec();
            if (!goodInfo) {
                throw new Error(`商品ID ${item.goodId} 不存在`);
            }
            if (goodInfo.goodInfo) {
                const floorPrice = goodInfo.goodInfo.originalPriceList.find(flItem => flItem.floor === item.floor);

                const price = util.multiplys(item.quantity, floorPrice.price);
                return {
                    goodId: item.goodId,
                    quantity: item.quantity,
                    floor: item.floor,
                    originalPrice: floorPrice.price,
                    goodSubtotal: price,
                    category: goodInfo.category,
                    goodInfo: goodInfo.goodInfo
                }
            }
        }));

        // 计算每个大分类的商品总价（打折前）
        const totalPriceByCategory = Object.entries(newData.reduce((acc, curr) => {
            if (!acc[curr.category]) {
                acc[curr.category] = 0;
            }
            acc[curr.category] = util.add(acc[curr.category], curr.goodSubtotal);
            return acc;
        }, {})).map(([category, cateSubtotal]) => ({ category, cateSubtotal }));

        // 计算所有商品总价(打折前)
        const totalGoodPrice = totalPriceByCategory.reduce((total, item) => {
            return util.add(total, item.cateSubtotal);
        }, 0);

        // 获取各品类折扣列表
        const discountList = await Discount.find().select({ _id: 0, __v: 0 });

        // 计算各品类打折后价格
        const totalPriceByCategoryWithDiscount = totalPriceByCategory.map(pbcItem => {
            const { category, cateSubtotal } = pbcItem;
            const matchingItem = discountList.find(disItem => disItem.category === category && disItem.discountList.some(({ totalAmount }) => cateSubtotal >= totalAmount));
            if (matchingItem) {
                const { totalAmount, discount } = matchingItem.discountList.reduce(
                    (prev, curr) => (curr.totalAmount > prev.totalAmount && cateSubtotal >= curr.totalAmount) ? curr : prev, { totalAmount: 0 }
                );
                return { category, cateSubtotal: util.multiply(cateSubtotal, discount) };
            } else {
                return pbcItem;
            }
        });

        // 计算所有商品总价(打折后)
        const totalGoodPriceWithDiscount = totalPriceByCategoryWithDiscount.reduce((total, item) => {
            return util.add(total, item.cateSubtotal);
        }, 0);

        // 筛选出Ni类商品
        const filterNi = totalPriceByCategoryWithDiscount.filter(cateItem => cateItem.category === 'Ni');
        // 判断订单中是否包含ni类商品,且本次下单金额小于600
        if (filterNi.length === 1 && filterNi[0].cateSubtotal < 600) {
            // 判断当前地址是否为第二次下单
            const orderHistoryList = currentUser.orderInfo.orderList;
            // 筛选第二次下单记录
            const secondOrder = orderHistoryList.filter(orderItem => orderItem.address === orderDetail.address);
            // 如果是第二次下单，且本次满了300
            if (secondOrder.length === 1 && filterNi[0].cateSubtotal >= 300) {
                // 判断上一次下单金额大于1000
                const lastNiSubtoal = secondOrder[0].cateSubtotal.filter(lastItem => lastItem.category === 'Ni');
                if (lastNiSubtoal[0].cateSubtotal >= 1000) {
                    niFreight = 0;
                } else {
                    niFreight = 99;
                }
            } else { // 如果不是第二次下单或者本次不满300
                niFreight = 99;
            }
        }

        // 计算运费 除了Ni类的，不满500运费69，不满800运费49
        const totalExceptNi = totalPriceByCategoryWithDiscount.reduce((acc, item) => {
            if (item.category !== 'Ni') {
                acc = util.add(acc, item.cateSubtotal);
            }
            return acc;
        }, 0);
        if (totalExceptNi < 500) {
            freight = 69;
        } else if (totalExceptNi < 800) {
            freight = 49;
        }

        // 计算折扣优惠了多少钱
        const discountFee = util.subtract(totalGoodPrice, totalGoodPriceWithDiscount);

        // 如果使用了优惠券,去查优惠券的信息，判断使用状态是unUsed，还要判断折后价是否大于优惠券
        if (orderDetail.couponId) {
            const notUsed = currentUser.couponInfo.couponList.find(item => item.couponId === orderDetail.couponId && item.status === 'unUsed');
            if (notUsed && totalGoodPriceWithDiscount >= notUsed.targetAmount) {
                couponFee = notUsed.couponFee;
            } else {
                return res.status(200).json({
                    statusCode: statusCode.failed,
                    msg: '优惠券信息错误',
                    data: []
                });
            }
        }

        // 用户实际需要支付的金额
        totalPayment = util.adds(totalGoodPriceWithDiscount, niFreight, freight, porterage, -couponFee);

        // 总价与前端传的总价一致，则生成订单号保存到数据库，成功返回，否则，返回给前端 价格已更新
        if (totalPayment !== orderDetail.totalPrice) {
            return res.status(200).json({
                statusCode: statusCode.failed,
                msg: '商品价格已更新',
                data: []
            });
        } else {
            // 生成订单号
            const orderId = util.getOrderId();
            const orderItems = newData.map(dItem => {
                return {
                    goodId: dItem.goodId,
                    quantity: dItem.quantity,
                    floor: dItem.floor,
                    price: dItem.originalPrice,
                    subtotal: dItem.goodSubtotal
                }
            })
            // 判断期望送达日期不小于今天
            if (!util.validDate(orderDetail.deliveryDate)) {
                return res.status(400).json({
                    statusCode: statusCode.paramErr,
                    msg: '期望送达日期错误'
                });
            }

            const saveData = {
                orderId: orderId, // 订单id
                orderItems: orderItems, // 订单商品信息，展示原价
                cateSubtotal: totalPriceByCategoryWithDiscount, // 订单大类小计，展示折扣价
                distributionMode: orderDetail.distributionMode, // 配送方式
                deliveryDate: orderDetail.deliveryDate, // 期望送达日期
                elevator: orderDetail.elevator, // 是否电梯，默认楼梯
                freight: util.add(niFreight, freight), // 货运费
                porterage: porterage, // 人工搬运费
                couponId: orderDetail.couponId, // 优惠券id
                totalDiscount: util.add(discountFee, couponFee), // 总优惠，含折扣和券
                totalPrice: totalGoodPrice, // 订单总原价
                totalPayment: totalPayment, // 订单总折扣价
                status: 'pending', // 订单状态
                address: orderDetail.address, // 收货地址
                description: orderDetail.description, // 订单备注
                paymentStatus: 'pending' // 支付状态
            };

            // 用户的首个订单
            if (!currentUser.orderInfo || !currentUser.orderInfo.orderList) {
                const firstData = await Order.create({ orderList: [saveData] });
                await Wxuser.findOneAndUpdate({ openId: req.auth.openid }, { $set: { orderInfo: firstData._id } })
            } else {
                await Order.findOneAndUpdate(
                    { _id: currentUser.orderInfo._id },
                    { $push: { orderList: saveData } }
                );
            }

            // 减掉库存 暂时不做库存，后面要再补

            // 移除购物车里的checked商品
            await CartItem.updateOne(
                { _id: currentUser.cartInfo._id }, // 匹配该用户的购物车
                { $pull: { cartList: { isChecked: true } } } // 删除符合条件的元素
            );

            // 如果使用了优惠券，将优惠券状态改为used
            if (couponFee > 0) {
                await Coupon.updateOne(
                    { "couponList.couponId": orderDetail.couponId }, // 匹配条件
                    { $set: { "couponList.$.status": "used" } } // 更新操作
                );
            }

            return res.status(200).json({
                statusCode: statusCode.success,
                msg: 'success',
                data: orderId
            });
        }
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
    const { orderId } = req.body;

    try {
        const currentUser = await findUser(req.auth.openid);

        const { orderList } = await Order.findOne(
            { "orderList": { $elemMatch: { "orderId": orderId } } },
            { "orderList.$": 1 }
        );

        if (!currentUser || !currentUser.orderInfo) {
            return res.status(400).json({
                statusCode: statusCode.paramErr,
                msg: '用户不存在或无订单'
            });
        }

        if (orderList[0].status !== 'pending' || orderList[0].paymentStatus !== 'pending') {
            return res.status(400).json({
                statusCode: statusCode.paramErr,
                msg: '订单状态异常，无法取消'
            });
        }

        await Order.findOneAndUpdate(
            {
                $and: [
                    { "orderList.orderId": orderId },
                    { "_id": currentUser.orderInfo._id },
                ]
            },
            { $set: { "orderList.$.status": "cancelled" } }
        );

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '取消成功',
            data: []
        });
    } catch (error) {
        // console.log(error);
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
async function shipOrder(req, res) {
    const { orderId } = req.body;
    if (!req.auth.role) {
        return res.status(403).json({
            statusCode: statusCode.permissionFailed,
            msg: '无权限操作'
        });
    }

    try {
        const { orderList } = await Order.findOne(
            { "orderList": { $elemMatch: { "orderId": orderId } } },
            { "orderList.$": 1 }
        );

        if (orderList[0].status !== 'paid' || orderList[0].paymentStatus !== 'paid') {
            return res.status(400).json({
                statusCode: statusCode.paramErr,
                msg: '订单状态异常'
            });
        }

        await Order.findOneAndUpdate(
            { "orderList.orderId": orderId },
            {
                $set: {
                    "orderList.$.status": "shipped",
                    "orderList.$.shippedAt": Date.now()
                }
            }
        );

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '发货成功',
            data: []
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 删除订单-管理员权限
 * @method POST
 * @param {String} orderId 
 * @returns Promise
 */
async function deleteOrder(req, res) {
    const { orderId } = req.body;

    try {
        await Order.updateOne(
            { "orderList": { $elemMatch: { "orderId": orderId } } },
            { $pull: { "orderList": { "orderId": orderId } } }
        );

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '删除成功'
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 订单列表
 * @method GET
 * @param {String} status - 订单状态筛选，不传展示全部
 * @returns Promise
 */
async function getOrderList(req, res) {
    const { openId, status } = req.query;
    try {
        const currentUser = await findUser(openId ? openId : req.auth.openid);
        let data = currentUser.orderInfo.orderList;
        if (status) {
            data = currentUser.orderInfo.orderList.filter(item => item.status === status);
        }

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
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
 * @description 获取单个订单详情
 * @method GET
 * @param {String} orderId 
 * @returns Promise
 */
async function getOrderDetail(req, res) {
    const { orderId } = req.query;
    try {
        const { orderList } = await Order.findOne(
            { "orderList": { $elemMatch: { "orderId": orderId } } },
            { "orderList.$": 1 }
        );

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: orderList
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 后台的订单列表
 * @method GET
 * @param {*} req 
 * @param {*} res 
 */
async function getOrderListBindUser(req, res) {
    // 判断是否后台用户登录
    if (!req.auth.role) {
        return res.status(403).json({
            statusCode: statusCode.permissionFailed,
            msg: '无权限操作'
        });
    }
    // 找到当前后台用户绑定的wx用户
    const user = await UserInfo.find({ phoneNumber: req.auth.phoneNumber });
    const bindUserList = user[0].bindInfo;
    console.log(bindUserList);

    // 获取每个用户的信息
    const bindUserInfo = await Promise.all(bindUserList.map(async (item) => {
        const bindUser = await findUser(item);
        // console.log(bindUser);
        return bindUser;
    }));
    console.log(bindUserInfo);


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
    shipOrder,
    deleteOrder,
    getOrderList,
    getOrderDetail,
    getOrderListBindUser
};
