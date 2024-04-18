const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// const UserInfo = require('./user');
// const Sku = require('./sku');


// 定义购物车条目的数据结构
// const cartItemSchema = new mongoose.Schema(
//     {
//         uid: { type: mongoose.Schema.Types.ObjectId, ref: 'userinfos', required: true },
//         goodId: { type: mongoose.Schema.Types.ObjectId, ref: 'skus', required: true },
//         cartId: { type: Number, required: true, unique: true },
//         quantity: { type: Number, default: 1 } // 商品数量
//     },
//     {
//         timestamps: true
//     }
// );

const cartItemSchema = new mongoose.Schema(
    {
        uid: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
        cartList: [{
            goodId: { type: Number, required: true },
            quantity: { type: Number, default: 1 }, // 商品数量
            isChecked: { type: Boolean, required: true, default: true } // 选中状态
        }]
    },
    {
        timestamps: true
    }
);

// cartItemSchema.plugin(AutoIncrement, { inc_field: 'cartId', start_seq: 0 });

// 创建购物车模型
const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
