const Wxuser = require('../models/wxuser');
const Coupon = require('../models/coupon');
const statusCode = require('../common/statusCode');
const { getRandom, getDate } = require('../common/util');

// 找到当前用户
async function findUser(openId) {
    return await Wxuser.findOne({ openId: openId })
        .populate({ path: 'couponInfo', select: { __v: 0 } })
        .select({ _id: 0, __v: 0 })
        .exec();
}

/**
 * @description 发放优惠券,限管理员操作
 * @method POST
 * @param {*}  
 * @returns Promise
 */
async function addCoupon(req, res) {
    const { openId, couponList } = req.body;

    try {
        var data;
        // 找到需要添加优惠券的用户
        const currentUser = await findUser(openId);

        // 生成优惠券id及修改使用状态
        const couponListWithId = couponList.map(coupon => {
            let randomNumber = getRandom();
            let couponId = `${getDate()}${randomNumber}`;
            if (coupon.useTime > getDate()) {
                return { ...coupon, couponId, status: 'cantUse' };
            }
            return { ...coupon, couponId };
        });

        // 如果已有过优惠券
        if (currentUser.couponInfo) {
            const newList = [...currentUser.couponInfo.couponList, ...couponListWithId];

            data = await Coupon.findOneAndUpdate(
                { _id: currentUser.couponInfo._id },
                { $set: { couponList: newList } },
                {
                    new: true,  // 返回更新后的文档，默认是返回更新前的文档
                    upsert: true // 如果不存在，则创建新的文档，默认是false
                }
            ).select({ _id: 0, __v: 0 });

        } else {
            // 如果新用户没有发过优惠券
            data = await Coupon.create({ couponList: couponListWithId });
            await Wxuser.updateOne({ openId: openId }, { $set: { couponInfo: data._id } });
        }

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: [data]
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试',
        });
    }
}

/**
 * @description 删除优惠券，仅限管理员操作
 * @method POST
 * @param {String[]} couponIds - 优惠券id数组
 * @returns Promise
 */
async function deleteCoupon(req, res) {
    const { couponIds } = req.body;

    try {
        const results = await Promise.all(couponIds.map(async (couponId) => {
            const coupon = await Coupon.findOneAndUpdate(
                { "couponList.couponId": couponId },
                { $pull: { couponList: { couponId: couponId } } },
                { new: true }
            );
            if (coupon) {
                return { couponId: couponId, msg: '删除成功' };
            } else {
                return { couponId: couponId, msg: '未找到对应的优惠券' };
            }
        }));

        const data = results.filter(item => item.msg !== '删除成功');
        if (data) {
            return res.status(400).json({
                statusCode: statusCode.failed,
                msg: 'failed',
                data: data
            });
        }

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: results
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 修改优惠券信息，仅限管理员操作
 * @method POST
 * @param {String} couponId 
 * @param {*} res 
 * @returns Promise
 */
async function updateCoupon(req, res) {
    const { couponId, couponInfo } = req.body;

    try {
        const coupon = await Coupon.findOne(
            { "couponList": { $elemMatch: { "couponId": couponId } } },
            { "couponList.$": 1 }
        );

        if (!coupon) {
            return res.status(400).json({
                statusCode: statusCode.failed,
                msg: '优惠券不存在'
            });
        }

        const newCouponInfo = {
            couponFee: couponInfo.couponFee ? couponInfo.couponFee : coupon.couponList[0].couponFee,
            targetAmount: couponInfo.targetAmount ? couponInfo.targetAmount : coupon.couponList[0].targetAmount,
            useTime: couponInfo.useTime ? couponInfo.useTime : coupon.couponList[0].useTime,
            expiredTime: couponInfo.expiredTime ? couponInfo.expiredTime : coupon.couponList[0].expiredTime,
            status: couponInfo.status ? couponInfo.status : coupon.couponList[0].status
        };

        await Coupon.findOneAndUpdate(
            { "couponList.couponId": couponId },
            {
                $set: {
                    "couponList.$.couponFee": newCouponInfo.couponFee,
                    "couponList.$.targetAmount": newCouponInfo.targetAmount,
                    "couponList.$.useTime": newCouponInfo.useTime,
                    "couponList.$.expiredTime": newCouponInfo.expiredTime,
                    "couponList.$.status": newCouponInfo.status,
                }
            }
        );

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '修改成功',
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
 * @description 获取优惠券列表
 * @method GET
 * @param {String} openId - 用户唯一标识,不传则默认查询当前登录用户
 * @returns Promise
 */
async function getCouponList(req, res) {
    const { openId } = req.query;

    try {
        // 找到当前用户的优惠券信息
        const currentUser = await findUser(openId ? openId : req.auth.openid);

        //如果用户不存在或者用户没有优惠券信息
        if (!currentUser || !currentUser.couponInfo) {
            return res.status(200).json({
                statusCode: statusCode.success,
                msg: '当前用户无优惠券或用户不存在',
                data: []
            });
        }

        const currentTime = Date.now();
        // 遍历每个优惠券列表中的每个项目
        const newCouponList = await Promise.all(currentUser.couponInfo.couponList.map(async (couponItem) => {
            // 如果优惠券useTime小于当前时间，则更新状态为unUsed，代表可以使用了
            if (couponItem.useTime < currentTime && couponItem.status === 'cantUse') {
                couponItem.status = 'unUsed';
            }

            // 如果优惠券过期时间小于当前时间，则更新状态为expired，代表已过期
            if (couponItem.expiredTime < currentTime && couponItem.status !== 'used') {
                couponItem.status = 'expired';
            }
            return couponItem;
        }));

        const data = await Coupon.findOneAndUpdate(
            { _id: currentUser.couponInfo._id },
            { $set: { couponList: newCouponList } },
            {
                new: true,  // 返回更新后的文档，默认是返回更新前的文档
                upsert: true // 如果不存在，则创建新的文档，默认是false
            }
        ).select({ _id: 0, __v: 0 });

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: [data]
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 获取最优惠的优惠券
 * @method GET
 * @param {String} openId - 用户唯一标识,不传则默认查询当前登录用户
 * @param {Number} totalPrice - 前端算的商品总价
 * @returns Promise
 */
async function getMostFavorableCoupon(req, res) {
    const { openId, totalPrice } = req.query;
    try {
        // 找到当前用户
        const currentUser = await findUser(openId ? openId : req.auth.openid);

        if (!currentUser || !currentUser.couponInfo) {
            return res.status(200).json({
                statusCode: statusCode.failed,
                msg: '当前用户无优惠券或用户不存在'
            })
        }

        const currentTime = Date.now();
        // 遍历每个优惠券列表中的每个项目
        const newCouponList = await Promise.all(currentUser.couponInfo.couponList.map(async (couponItem) => {
            // 如果优惠券useTime小于当前时间，则更新状态为unUsed，代表可以使用了
            if (couponItem.useTime < currentTime && couponItem.status === 'cantUse') {
                couponItem.status = 'unUsed';
            }

            // 如果优惠券过期时间小于当前时间，则更新状态为expired，代表已过期
            if (couponItem.expiredTime < currentTime && couponItem.status !== 'used') {
                couponItem.status = 'expired';
            }
            return couponItem;
        }));

        const data = await Coupon.findOneAndUpdate(
            { _id: currentUser.couponInfo._id },
            { $set: { couponList: newCouponList } },
            {
                new: true,  // 返回更新后的文档，默认是返回更新前的文档
                upsert: true // 如果不存在，则创建新的文档，默认是false
            }
        ).select({ _id: 0, __v: 0 });

        // 过滤出 status 为 unUsed 并且 totalPrice 大于等于 targetAmount 的优惠券
        const mostFavorableCoupon = data.couponList.filter(coupon => {
            return coupon.status === "unUsed" && totalPrice >= coupon.targetAmount;
        });

        // 如果没有符合条件的优惠券，则返回空数组
        if (mostFavorableCoupon.length === 0) {
            return res.status(200).json({
                statusCode: statusCode.success,
                msg: '无可用优惠券',
                data: []
            });
        }

        // 按照 couponFee 降序排列
        mostFavorableCoupon.sort((a, b) => {
            // 先比较 couponFee
            if (b.couponFee !== a.couponFee) {
                return b.couponFee - a.couponFee;
            }
            // 如果 couponFee 相同，则比较 targetAmount
            if (b.targetAmount !== a.targetAmount) {
                return b.targetAmount - a.targetAmount;
            }
            // 如果 couponFee 和 targetAmount 都相同，再比较 expiredTime
            return a.expiredTime - b.expiredTime;
        });

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: [mostFavorableCoupon[0]]
        });
    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

module.exports = {
    addCoupon,
    deleteCoupon,
    updateCoupon,
    getCouponList,
    getMostFavorableCoupon
};
