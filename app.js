const express = require('express');
const app = express();
const port = 3000; // 或者您可以选择其他端口号

// 导入路由
const indexRoutes = require('./src/routes/index');
const userRoutes = require('./src/routes/userRoutes');

// 设置基本路由
app.get('/', (req, res) => {
    res.send('欢迎访问后端 API！');
});

// 使用路由中间件
app.use('/api', indexRoutes);
app.use('/api/users', userRoutes);

// 启动服务器
app.listen(port, () => {
    console.log(`后端服务器正在监听端口 ${port}...`);
});
