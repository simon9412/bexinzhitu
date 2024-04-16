const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { CATEGORY } = require('../common/enum');

// 子表 DianSchema
const DianSchema = new mongoose.Schema({
    goodName: { type: String, required: true }, // 商品名称
    brandName: { type: String, required: true }, // 品牌名称
    property: { type: String, required: true }, // 商品属性、规格
    unit: { type: String, required: true }, // 商品单位
    originalPrice: { type: mongoose.Schema.Types.Decimal128, min: 0.01, default: 999.99 } // 商品原价
});

// 子表 MuSchema
const MuSchema = new mongoose.Schema({
    goodName: { type: String, required: true }, // 商品名称
    brandName: { type: String, required: true }, // 品牌名称
    property: { type: String, required: true }, // 商品属性、规格
    unit: { type: String, required: true }, // 商品单位
    originalPrice: { type: mongoose.Schema.Types.Decimal128, min: 0.01, default: 999.99 } // 商品原价
});

// 总表 SkuSchema
const SkuSchema = new mongoose.Schema({
    goodId: { type: Number, unique: true, default: 10000 },
    category: { type: String, required: true, enum: CATEGORY },
    goodInfo: { type: mongoose.Schema.Types.ObjectId, refPath: 'category' }
});

SkuSchema.plugin(AutoIncrement, { inc_field: 'goodId', start_seq: 10000 });

// 在保存 Sku 文档之后，更新对应的子表数据
SkuSchema.post('save', async function (doc) {
    console.log(doc.data, "1dataaaa")

    const Model = mongoose.model(doc.category);
    if (doc.data && !await Model.findOne({ _id: doc.data })) {
        // 如果子表中不存在对应的文档，则创建新文档
        const data = new Model({ _id: doc.data });
        console.log(data, "dataaaa")
        await data.save();
    }
});

const Dian = mongoose.model('Dian', DianSchema);
const Mu = mongoose.model('Mu', MuSchema);
const Sku = mongoose.model('Sku', SkuSchema);

module.exports = { Dian, Mu, Sku };
