const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { CATEGORY } = require('../common/enum');

// 子表 ShuiSchema
const ShuiSchema = new mongoose.Schema({
    secCategory: { type: String, required: true }, // 子类
    goodName: { type: String, required: true }, // 商品名称
    brandName: { type: String, required: true }, // 品牌名称
    specification: { type: String, default: '' }, // 商品规格
    property: { type: String, default: '' }, // 商品属性
    unit: { type: String, default: '' }, // 商品单位
    description: { type: String, default: '' }, // 商品描述
    image: { type: String, default: '' }, // 商品图片 url
    originalPriceList: {
        type: [{
            floor: { type: String, default: '1' },
            price: {
                type: Number, min: 0.01, default: 999.99
            }
        }],
        required: true
    }, // 商品原价
    costPriceList: {
        type: [{
            floor: { type: String, default: '1' },
            costPrice: { type: Number, min: 0.01, default: 999.99 }
        }],
        required: true
    }, // 成本价
    inventory: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        },
        min: 0,
        default: 0
    } // 库存
});

// 子表 DianSchema
const DianSchema = new mongoose.Schema({
    secCategory: { type: String, required: true }, // 子类
    goodName: { type: String, required: true }, // 商品名称
    brandName: { type: String, required: true }, // 品牌名称
    specification: { type: String, default: '' }, // 商品规格
    property: { type: String, default: '' }, // 商品属性
    unit: { type: String, default: '' }, // 商品单位
    description: { type: String, default: '' }, // 商品描述
    image: { type: String, default: '' }, // 商品图片 url
    originalPriceList: {
        type: [{
            floor: { type: String, default: '1' },
            price: {
                type: Number, min: 0.01, default: 999.99
            }
        }],
        required: true
    }, // 商品原价
    costPriceList: {
        type: [{
            floor: { type: String, default: '1' },
            costPrice: { type: Number, min: 0.01, default: 999.99 }
        }],
        required: true
    }, // 成本价
    inventory: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        },
        min: 0,
        default: 0
    } // 库存
});

// 子表 MuSchema
const MuSchema = new mongoose.Schema({
    secCategory: { type: String, required: true }, // 子类
    goodName: { type: String, required: true }, // 商品名称
    brandName: { type: String, required: true }, // 品牌名称
    specification: { type: String, default: '' }, // 商品规格
    property: { type: String, default: '' }, // 商品属性
    unit: { type: String, default: '' }, // 商品单位
    description: { type: String, default: '' }, // 商品描述
    image: { type: String, default: '' }, // 商品图片 url
    originalPriceList: {
        type: [{
            floor: { type: String, default: '1' },
            price: {
                type: Number, min: 0.01, default: 999.99
            }
        }],
        required: true
    }, // 商品原价
    costPriceList: {
        type: [{
            floor: { type: String, default: '1' },
            costPrice: { type: Number, min: 0.01, default: 999.99 }
        }],
        required: true
    }, // 成本价
    inventory: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        },
        min: 0,
        default: 0
    } // 库存
});

// 子表 NiSchema
const NiSchema = new mongoose.Schema({
    secCategory: { type: String, required: true }, // 子类
    goodName: { type: String, required: true }, // 商品名称
    brandName: { type: String, required: true }, // 品牌名称
    specification: { type: String, default: '' }, // 商品规格
    property: { type: String, default: '' }, // 商品属性
    unit: { type: String, default: '' }, // 商品单位
    description: { type: String, default: '' }, // 商品描述
    image: { type: String, default: '' }, // 商品图片 url
    originalPriceList: {
        type: [{
            floor: { type: String, default: '1' },
            price: {
                type: Number, min: 0.01, default: 999.99
            }
        }],
        required: true
    }, // 商品原价
    costPriceList: {
        type: [{
            floor: { type: String, default: '1' },
            costPrice: { type: Number, min: 0.01, default: 999.99 }
        }],
        required: true
    }, // 成本价
    inventory: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        },
        min: 0,
        default: 0
    } // 库存
});

// 子表 YouSchema
const YouSchema = new mongoose.Schema({
    secCategory: { type: String, required: true }, // 子类
    goodName: { type: String, required: true }, // 商品名称
    brandName: { type: String, required: true }, // 品牌名称
    specification: { type: String, default: '' }, // 商品规格
    property: { type: String, default: '' }, // 商品属性
    unit: { type: String, default: '' }, // 商品单位
    description: { type: String, default: '' }, // 商品描述
    image: { type: String, default: '' }, // 商品图片 url
    originalPriceList: {
        type: [{
            floor: { type: String, default: '1' },
            price: {
                type: Number, min: 0.01, default: 999.99
            }
        }],
        required: true
    }, // 商品原价
    costPriceList: {
        type: [{
            floor: { type: String, default: '1' },
            costPrice: { type: Number, min: 0.01, default: 999.99 }
        }],
        required: true
    }, // 成本价
    inventory: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        },
        min: 0,
        default: 0
    } // 库存
});

// 子表 OtherSchema
const OtherSchema = new mongoose.Schema({
    secCategory: { type: String, required: true }, // 子类
    goodName: { type: String, required: true }, // 商品名称
    brandName: { type: String, required: true }, // 品牌名称
    specification: { type: String, default: '' }, // 商品规格
    property: { type: String, default: '' }, // 商品属性
    unit: { type: String, default: '' }, // 商品单位
    description: { type: String, default: '' }, // 商品描述
    image: { type: String, default: '' }, // 商品图片 url
    originalPriceList: {
        type: [{
            floor: { type: String, default: '1' },
            price: {
                type: Number, min: 0.01, default: 999.99
            }
        }],
        required: true
    }, // 商品原价
    costPriceList: {
        type: [{
            floor: { type: String, default: '1' },
            costPrice: { type: Number, min: 0.01, default: 999.99 }
        }],
        required: true
    }, // 成本价
    inventory: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        },
        min: 0,
        default: 0
    } // 库存
});

// 总表 SkuSchema
const SkuSchema = new mongoose.Schema(
    {
        goodId: { type: Number, unique: true }, // 商品id
        category: { type: String, required: true, enum: CATEGORY }, // 商品分类
        goodInfo: { type: mongoose.Schema.Types.ObjectId, refPath: 'category' } // 商品详情
    },
    {
        timestamps: true
    }
);

SkuSchema.plugin(AutoIncrement, { inc_field: 'goodId', start_seq: 10000 });

const Shui = mongoose.model('Shui', ShuiSchema);
const Dian = mongoose.model('Dian', DianSchema);
const Mu = mongoose.model('Mu', MuSchema);
const Ni = mongoose.model('Ni', NiSchema);
const You = mongoose.model('You', YouSchema);
const Other = mongoose.model('Other', OtherSchema);
const Sku = mongoose.model('Sku', SkuSchema);

module.exports = {
    Shui,
    Dian,
    Mu,
    Ni,
    You,
    Other,
    Sku
};
