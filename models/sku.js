const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// 定义用户信息表结构
const SkuSchema = new mongoose.Schema(
    {
        uid: { type: Number, default: 0 },
        phoneNumber: { type: String, unique: true },
        password: String,
        userName: String,
        avatar: String,
        role: String,
        gid: Number,
        use: String
    },
    {
        timestamps: true
    }
);

SkuSchema.plugin(AutoIncrement, { inc_field: 'uid', start_seq: 0 });

// 创建用户数据模型
const Sku = mongoose.model('Sku', UserSchema);

module.exports = Sku;