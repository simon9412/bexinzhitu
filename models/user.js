const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// 定义用户信息表结构
const UserSchema = new mongoose.Schema(
    {
        uid: { type: Number, unique: true }, // uid
        phoneNumber: { type: String, unique: true }, // 手机号
        password: { type: String, required: true }, // 密码
        userName: { type: String, required: true }, // 用户名
        avatar: { type: String, default: '' }, // 头像url
        role: { type: String, default: 'user' }, // 权限
        gid: { type: Number, default: 0 }, // 组id
        use: { type: String, default: 'normal' }, // 使用状态
        bindInfo: { type: [String], default: [] }// 绑定的微信客户，存openid
    },
    {
        timestamps: true
    }
);

UserSchema.plugin(AutoIncrement, { inc_field: 'uid', start_seq: 1001 });

// 修改用户权限时的中间件函数
UserSchema.pre('save', async function (next) {
    // 只有在用户权限为group且gid为0时 才分配gid
    if (this.role === 'group' && this.gid === 0) {
        // 查询数据库中是否已存在权限为group的用户
        const existingGroupUser = await UserInfo.findOne({ role: 'group' }).exec();

        // 如果不存在权限为group的用户，则分配gid为100
        if (!existingGroupUser) {
            this.gid = 100;
        } else {
            // 查询数据库中最后一个gid的group用户
            const lastGroupUser = await UserInfo.findOne({ role: 'group' }).sort({ 'gid': -1 }).exec();
            this.gid = lastGroupUser.gid + 1;
        }
    }
    // 执行下一个中间件函数
    next();
});

// 创建用户数据模型
const UserInfo = mongoose.model('UserInfo', UserSchema);

module.exports = UserInfo;