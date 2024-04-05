const User = require('../models/user');

exports.register = (req, res) => {
    // 在这里处理用户注册逻辑
    // 接收来自前端的请求数据，并保存到数据库中
    res.send('用户注册成功！');
};

exports.login = (req, res) => {
    // 在这里处理用户登录逻辑
    // 验证用户提供的凭据，并生成认证令牌
    res.send('用户登录成功！');
};
