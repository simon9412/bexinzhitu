const mongoose = require('mongoose');


// 定义收货地址数据结构
const AddressSchema = new mongoose.Schema(
    {
        addressList: [
            {
                recipientName: { type: String, required: true }, // 收货人姓名
                phone: { type: String, required: true }, // 收货人电话号码
                province: { type: String, required: true }, // 省
                provinceCode: { type: String, required: true }, // 省编码
                city: { type: String, required: true }, // 市
                cityCode: { type: String, required: true }, // 市编码
                district: { type: String, required: true }, // 区
                districtCode: { type: String, required: true }, // 区编码
                detail: { type: String, required: true }, // 详细地址
                isDefault: { type: Boolean, default: false }, // 是否默认
            }
        ]
    },
    {
        timestamps: true
    }
);

// 创建购物车模型
const Address = mongoose.model('Address', AddressSchema);

module.exports = Address;