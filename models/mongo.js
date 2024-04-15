const mongoose = require('mongoose');

// MongoDB 连接 URL
const url = 'mongodb://admin:w123456@54.222.184.73:27017/xinzhitu'; // mongodb://用户名:密码@host:端口号/当前使用的数据库名

// Mongoose 连接选项
// const options = {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// };

// 导出连接函数
async function connectMongoDB() {
    await mongoose
        .connect(url)
        .then(() => console.log('MongoDB connect success!'))
        .catch(err => console.log(`MongoDB connected failed!${err}`));;
}

module.exports = { connectMongoDB };