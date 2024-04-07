const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
// 这里是模型定义和数据库交互的代码，需要根据您使用的数据库和 ORM 来实现

// Connect to MongoDB
mongoose
    .connect('mongodb://admin:w123456@54.222.184.73:27017/xinzhitu') // mongodb://用户名:密码@host:端口号/当前使用的数据库名
    .then(() => console.log('MongoDB connect success!'))
    .catch(err => console.log(`MongoDB connected failed!${err}`));

// 定义用户信息表结构
const UserSchema = new mongoose.Schema(
    {
        uid: { type: Number, default: 0 },
        phoneNumber: { type: String, unique: true },
        password: String,
        userName: String,
        avatar: String
    },
    {
        timestamps: true
    }
);

UserSchema.plugin(AutoIncrement, { inc_field: 'uid', start_seq: 0 });

// 创建用户数据模型
const UserInfo = mongoose.model('UserInfo', UserSchema);

module.exports = UserInfo;
