const mongoose = require('mongoose');


// 订单数据表模型
const CouponSchema = new mongoose.Schema(
    {
        couponList: [{
            couponId: { type: String, unique: true }, // 优惠券id，发放时间毫秒+6位随机数
            couponFee: { type: Number, min: 0, max: 500 }, // 减的金额
            targetAmount: { type: Number }, // 需要满足的金额
            useTime: { type: Number, default: Date.now() }, // 可用时间
            expiredTime: { type: Number, default: Date.now() + 24 * 60 * 60 * 1000 }, // 过期时间，默认1天
            status: { type: String, enum: ['unUsed', 'used', 'expired', 'cantUse'], default: 'unUsed' } // 状态：不可使用、未使用、已使用、已过期
        }]
    },
    {
        timestamps: true
    }
);

// 创建模型
const Coupon = mongoose.model('Coupon', CouponSchema);

module.exports = Coupon;