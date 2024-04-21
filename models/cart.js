const mongoose = require('mongoose');

// 定义购物车条目的数据结构
const cartItemSchema = new mongoose.Schema(
    {
        cartList: [
            {
                goodId: { type: Number, required: true }, // 商品id
                quantity: { type: Number, default: 1 }, // 商品数量
                floor: { type: String, default: '1' }, // 楼层选择
                isChecked: { type: Boolean, required: true, default: true }, // 选中状态
            }
        ]
    },
    {
        timestamps: true
    }
);

// 创建购物车模型
const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
