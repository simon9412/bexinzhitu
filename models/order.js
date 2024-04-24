const mongoose = require('mongoose');

// 订单商品信息子文档模型
const OrderItemSchema = new mongoose.Schema({
    goodId: { type: Number, required: true }, // 商品ID
    quantity: { type: Number, required: true }, // 商品数量
    floor: { type: String, required: true }, // 楼层
    price: { type: Number, required: true }, // 商品单价
    subtotal: { type: Number, required: true } // 商品小计
});

const CateSubtotalSchem = new mongoose.Schema({
    category: { type: String, required: true }, // 分类
    cateSubtotal: { type: Number, required: true } // 大类小计
});

// 订单数据表模型
const OrderSchema = new mongoose.Schema(
    {
        orderList: [{
            orderId: { type: String, unique: true }, // 订单id，最终存的是年月日时分秒毫秒+6个随机数字
            orderItems: [OrderItemSchema], // 订单商品信息
            cateSubtotal: [CateSubtotalSchem], // 订单大类小计
            distributionMode: { type: String, enum: ['普通配送', '上门自提', '货到付款'], default: '普通配送' }, // 配送方式
            deliveryDate: { type: String, required: true }, // 期望送达日期
            elevator: { type: String, enum: ['楼梯', '电梯'], default: '楼梯' }, // 是否电梯，默认楼梯
            couponId: { type: String, default: '未使用' }, // 是否使用了优惠券，用了则保存的是id
            freight: { type: Number, min: 0, default: 0 }, // 货运费
            porterage: { type: Number, min: 0, default: 0 }, // 人工搬运费
            totalDiscount: { type: Number, min: 0, default: 0 }, // 总优惠，含折扣和券
            totalPrice: { type: Number, required: true }, // 订单总原价
            totalPayment: { type: Number, required: true }, // 订单总折扣价
            useBalance: { type: Number, default: 0 },// 使用了多少余额，默认0，支付后更新
            status: { type: String, enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'], default: 'pending' }, // 订单状态 pending待支付、paid已支付、shipped已发货、completed已完成、cancelled已取消
            address: { type: String, required: true }, // 收货地址
            description: { type: String, default: '' }, // 订单备注
            paymentStatus: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' }, // 支付状态
            createdAt: { type: Date, default: Date.now }, // 订单创建时间
            paidAt: { type: Date }, // 订单付款时间
            shippedAt: { type: Date } // 订单发货时间
        }]
    },
    {
        timestamps: true
    }
);

// 创建订单模型
const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;