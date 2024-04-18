const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

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
        balance: { type: mongoose.Schema.Types.Decimal128, min: 0, default: 0 }, // 账号余额
        cartInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }, // 购物车信息
        orderInfo: { type: mongoose.Schema.Types.ObjectId, refPath: 'openId' }, // 订单信息
        addressInfo: { type: mongoose.Schema.Types.ObjectId, refPath: 'openId' }, // 收货地址信息
        couponInfo: { type: mongoose.Schema.Types.ObjectId, refPath: 'openId' }, // 优惠券信息
    },
    {
        timestamps: true
    }
);

// WxuserSchema.plugin(AutoIncrement, { inc_field: 'uid', start_seq: 0 });

// // 创建用户中间件函数
// WxuserSchema.pre('save', async function (next) {
//     // 只有在用户权限为group且gid为0时 才分配gid
//     if (this.role === 'group' && this.gid === 0) {
//         // 查询数据库中是否已存在权限为group的用户
//         const existingGroupUser = await Wxuser.findOne({ role: 'group' }).exec();

//         // 如果不存在权限为group的用户，则分配gid为100
//         if (!existingGroupUser) {
//             this.gid = 100;
//         } else {
//             // 查询数据库中最后一个gid的group用户
//             const lastGroupUser = await Wxuser.findOne({ role: 'group' }).sort({ 'gid': -1 }).exec();
//             this.gid = lastGroupUser.gid + 1;
//         }
//     }
//     // 执行下一个中间件函数
//     next();
// });

// 创建用户数据模型
const Wxuser = mongoose.model('Wxuser', WxuserSchema);

module.exports = Wxuser;