const Wxuser = require('../models/wxuser');
const UserInfo = require('../models/user');
const axios = require('axios');
const statusCode = require('../common/statusCode');
const { jwtCreate } = require('../common/jwt');
const { URL } = require('../common/enum');

/**
 * @description 微信登录，并存储用户信息
 * @method POST
 * @param {String} code - 透传小程序wx.login()的返回值
 * @param {String} expiresTime - token有效期，暂时默认7天
 * @returns Promise
 */
async function wxLogin(req, res) {
    const { code, expiresTime } = req.body;
    try {
        // 向微信服务器发送请求，获取用户 OpenID 和 SessionKey
        const response = await axios.get(URL.wxLogin, {
            params: {
                appid: process.env.APPID,
                secret: process.env.SECRET,
                js_code: code,
                grant_type: 'authorization_code'
            }
        });

        if (response.data.errcode) {
            return res.status(400).json({
                statusCode: statusCode.paramErr,
                msg: 'code无效，请重新登录！'
            });
        }
        // 处理响应，返回给调用方
        const { openid, session_key } = response.data;

        // 生成token
        const token = await jwtCreate({ openid, session_key }, expiresTime);

        // console.log(token);
        const existingUser = await Wxuser.findOne({ openId: openid }).select({ _id: 0, __v: 0 });

        // 如果存在，直接返回查到的信息
        if (existingUser) {
            return res.status(200).json({
                code: statusCode.success,
                msg: '登录成功',
                data: { token }
            });
        }
        const wxUser = new Wxuser({
            openId: openid,
        });
        await wxUser.save();

        return res.status(200).json({
            code: statusCode.success,
            msg: '登录成功',
            data: [{
                openId: wxUser.openid,
                userName: wxUser.userName,
                avatar: wxUser.avatar,
                level: wxUser.level,
                bind: wxUser.bind,
                use: wxUser.use,
                balance: wxUser.balance,
                cartInfo: wxUser.cartInfo,
                orderInfo: wxUser.orderInfo,
                addressInfo: wxUser.addressInfo,
                couponInfo: wxUser.couponInfo,
                token,
            }]
        });
    } catch (error) {
        console.error('登录出错:', error);
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器错误'
        });
    }
}

/**
 * @description 获取当前登录用户的信息
 * @method GET
 * @param null - 无需传参
 * @returns Promise
 */
async function getUserInfo(req, res) {
    try {
        const user = await Wxuser.findOne({ openId: req.auth.openid }).select({ _id: 0, __v: 0 });
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: [user]
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }

}

/**
 * @description 当前登录用户修改自己的信息
 * @method POST
 * @param {Object} userInfo - 对象
 * @param {String} userInfo.phoneNumber - 手机号
 * @param {String} userInfo.userName - 手机号
 * @param {String} userInfo.avatar - 手机号
 * @returns Promise
 */
async function updateUserInfo(req, res) {
    const { userInfo } = req.body;
    try {
        if (Object.keys(userInfo).length === 0) {
            return res.status(400).json({
                statusCode: statusCode.paramErr,
                msg: '参数错误',
            });
        }

        // 更新操作
        const newInfo = {
            $set: {
                phoneNumber: userInfo.phoneNumber,
                userName: userInfo.userName,
                avatar: userInfo.avatar,
            },
        };

        const result = await Wxuser.updateOne({ openId: req.auth.openid }, newInfo);
        if (result.modifiedCount !== 1) {
            return res.status(400).json({
                statusCode: statusCode.paramErr,
                msg: '参数错误，修改失败',
            });
        }
        const user = await Wxuser.findOne({ openId: req.auth.openid }).select({ _id: 0, __v: 0 });
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: [user]
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 管理员查询所有微信用户列表
 * @method GET
 * @param null
 * @returns Promise
 */
async function getWxUserList(req, res) {
    try {
        const wxUserList = await Wxuser.find()
            .populate({ path: 'cartInfo', select: { __v: 0 } })
            .populate({ path: 'orderInfo', select: { __v: 0 } })
            .populate({ path: 'addressInfo', select: { __v: 0 } })
            .populate({ path: 'couponInfo', select: { __v: 0 } })
            .select({ _id: 0, __v: 0 });
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: wxUserList
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 每个后台user查询所有已绑定的用户列表
 * @method GET
 * @param null 
 * @returns Promise
 */
async function getBindWxUserList(req, res) {
    try {
        const groupUser = await UserInfo.findOne({ phoneNumber: req.auth.phoneNumber });
        const wxUserList = await Wxuser.find({ openId: { $in: groupUser.bindInfo } }).select({ _id: 0, __v: 0 });
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: wxUserList
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 管理员修改用户信息
 * @method POST
 * @param {*} req 
 * @param {*} res 
 */
async function updateUserInfoByAdmin(req, res) {
    const { userInfo } = req.body;

    try {
        if (Object.keys(userInfo).length === 0) {
            return res.status(400).json({
                statusCode: statusCode.paramErr,
                msg: '参数错误',
            });
        }

        // 更新操作
        const newInfo = {
            $set: {
                phoneNumber: userInfo.phoneNumber,
                userName: userInfo.userName,
                avatar: userInfo.avatar,
                level: userInfo.level,
                bind: userInfo.bind,
                use: userInfo.use,
                balance: userInfo.balance,
                // cartInfo: userInfo.cartInfo,
                // orderInfo: userInfo.orderInfo,
                // addressInfo: userInfo.addressInfo,
                // couponInfo: userInfo.couponInfo
            },
        };

        // 如果传了bind，就修改
        if (userInfo.bind) {
            // 先查询一下当前有没有绑定过user，bind默认是0，如果不是0则证明绑定了user
            const oldBindUser = await Wxuser.findOne({ openId: userInfo.openId });
            // 如果有且不是当前的想变更的，则需要先删除当前绑定
            if (oldBindUser.bind !== 0 && oldBindUser.bind !== userInfo.bind) {
                const oldBindInfo = await UserInfo.findOne({ uid: oldBindUser.bind });
                // 使用 filter 方法移除当前bindinfo里绑定的openid
                oldBindInfo.bindInfo = oldBindInfo.bindInfo.filter(item => item !== userInfo.openId);
                await oldBindInfo.save();
            }
            // 删除后绑定新的
            const newUserInfo = await UserInfo.findOne({ uid: userInfo.bind });
            var newBindInfo = newUserInfo.bindInfo;

            // 如果openid不在原先的数组中，则添加，这样可以避免重复绑定同一个openid
            if (!newBindInfo.includes(userInfo.openId)) {
                newBindInfo.push(userInfo.openId);
            }

            // 执行绑定操作
            await UserInfo.updateOne({ uid: userInfo.bind }, { $set: { bindInfo: newBindInfo } });
        }

        const result = await Wxuser.updateOne({ openId: userInfo.openId }, newInfo);

        if (result.modifiedCount !== 1) {
            return res.status(400).json({
                statusCode: statusCode.paramErr,
                msg: '参数错误，修改失败',
            });
        }

        const user = await Wxuser.findOne({ openId: userInfo.openId }).select({ _id: 0, __v: 0 });
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: [user]
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}


module.exports = {
    wxLogin,
    getUserInfo,
    updateUserInfo,
    getWxUserList,
    getBindWxUserList,
    updateUserInfoByAdmin
};