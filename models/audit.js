const mongoose = require('mongoose');

// 订单商品信息子文档模型
const OrderItemSchema = new mongoose.Schema({
    goodId: { type: Number }, // 商品ID
    quantity: { type: Number }, // 商品数量
    floor: { type: String }, // 楼层
    price: { type: Number }, // 商品单价
    subtotal: { type: Number } // 商品小计
});

const CateSubtotalSchem = new mongoose.Schema({
    category: { type: String, }, // 分类
    cateSubtotal: { type: Number } // 大类小计
});

// 定义审核的数据结构
// 常用修改的字段应该是deliveryDate、distributionMode、freight、porterage、totalDiscount、address
const AuditSchema = new mongoose.Schema(
    {
        auditId: { type: String, unique: true }, // 审核单id
        orderId: { type: String }, // 订单id，最终存的是年月日时分秒毫秒+6个随机数字
        orderItems: [OrderItemSchema], // 订单商品信息
        cateSubtotal: [CateSubtotalSchem], // 订单大类小计
        distributionMode: { type: String, enum: ['普通配送', '上门自提', '货到付款'] }, // 配送方式
        deliveryDate: { type: String }, // 期望送达日期
        elevator: { type: String, enum: ['楼梯', '电梯'] }, // 是否电梯，默认楼梯
        couponId: { type: String }, // 是否使用了优惠券，用了则保存的是id
        freight: { type: Number, min: 0 }, // 货运费
        porterage: { type: Number, min: 0 }, // 人工搬运费
        totalDiscount: { type: Number, min: 0 }, // 总优惠，含折扣和券
        totalPrice: { type: Number }, // 订单总原价
        totalPayment: { type: Number }, // 订单总折扣价
        useBalance: { type: Number },// 使用了多少余额，默认0，支付后更新
        address: { type: String }, // 收货地址 
        description: { type: String }, // 订单备注
        shippedAt: { type: Date }, // 订单发货时间
        auditStatus: { type: String, enum: ['待group审核', '待admin审核', '审核通过', '审核不通过'] } // 审核状态
    },
    {
        timestamps: true
    }
);

// 创建审核功能模型
const Audit = mongoose.model('Audit', AuditSchema);

module.exports = Audit;