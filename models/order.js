const mongoose = require('mongoose');

// 订单商品信息子文档模型
const OrderItemSchema = new mongoose.Schema({
    goodId: { type: Number, required: true }, // 商品ID
    quantity: { type: Number, required: true }, // 商品数量
    price: { type: Number, required: true }, // 商品单价
    total: { type: Number, required: true } // 商品小计
});

// 订单数据表模型
const OrderSchema = new mongoose.Schema(
    {
        orderList: [{
            orderId: { type: String, unique: true }, // 订单id，最终存的是年月日时分秒+6个随机数字
            orderItems: [OrderItemSchema], // 订单商品信息
            distributionMode: { type: String, enum: ['普通配送', '上门自提'], default: '普通配送' }, // 配送方式
            deliveryDate: { type: String, required: true }, // 期望送达日期
            elevator: { type: String, enum: ['楼梯', '电梯'], default: '楼梯' }, // 是否电梯，默认楼梯
            floor: { type: Number, min: 1, default: 1 }, // 楼层，最小默认1
            freight: { type: Number, min: 0, default: 69 }, // 货运费
            porterage: { type: Number, min: 0, default: 0 }, // 人工搬运费
            totalPrice: { type: Number, required: true }, // 订单总价
            status: { type: String, enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'], default: 'pending' }, // 订单状态 pending待支付、paid已支付、shipped已发货、completed已完成、cancelled已取消
            address: { type: String, required: true }, // 收货地址
            description: { type: String, default: '' }, // 订单备注
            paymentStatus: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' }, // 支付状态
        }]
    },
    {
        timestamps: true
    }
);

// 创建订单模型
const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;