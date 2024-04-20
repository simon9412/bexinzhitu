const mongoose = require('mongoose');

// 定义用户信息表结构
const WxuserSchema = new mongoose.Schema(
    {
        openId: { type: String, unique: true }, // 微信唯一标识
        phoneNumber: { type: String, default: '未绑定' }, // 手机号
        // password: String, // 密码
        userName: { type: String, default: `微信用户` }, // 用户名
        avatar: { type: String, default: '' }, // 头像url
        level: { type: Number, default: 1 }, // 账号级别，后续可能会用到
        bind: { type: Number, default: 0 }, // 绑定后台用户userinfo表中的uid，新登录的用户无法绑定，需要后面手动绑定
        use: { type: String, default: 'normal' }, // 使用状态
        balance: { type: Number, min: 0, default: 0 }, // 账号余额
        cartInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'CartItem', }, // 购物车信息
        orderInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // 订单信息
        addressInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' }, // 收货地址信息
        couponInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'openId' }, // 优惠券信息
    },
    {
        timestamps: true
    }
);

// 创建用户数据模型
const Wxuser = mongoose.model('Wxuser', WxuserSchema);

module.exports = Wxuser;