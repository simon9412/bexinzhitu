const mongoose = require('mongoose');
const { CATEGORY } = require('../common/enum');

// 折扣数据模型
const DiscountSchema = new mongoose.Schema(
    {
        category: { type: String, required: true, enum: CATEGORY }, // 商品分类
        discountList: [{
            totalAmount: { type: Number, default: 0.01 }, // 满多少钱
            discount: { type: Number, min: 0.92, default: 1 } // 打几折，默认不打折，最低0.92
        }],
    },
    {
        timestamps: true
    }
);

// 创建模型
const Discount = mongoose.model('Discount', DiscountSchema);

module.exports = Discount;