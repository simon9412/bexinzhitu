const mongoose = require('mongoose');

// 折扣数据模型
const NotifySchema = new mongoose.Schema(
    {
        
    },
    {
        timestamps: true
    }
);

// 创建模型
const Notify = mongoose.model('Notify', NotifySchema);

module.exports = Notify;