const { expressjwt } = require('express-jwt');
const statusCode = require('./statusCode');
const jwt = require('jsonwebtoken');

// 生成jwt token
async function jwtCreate(n, r) {
    return jwt.sign(
        {
            phoneNumber: n,
            role: r
        },
        process.env._JWT,
        {
            expiresIn: '30d',
            algorithm: 'HS256'
        }
    );

};

// 验证jwt，配置不需要验证的api
function jwtVerify() {
    return expressjwt({
        secret: process.env._JWT,
        algorithms: ['HS256']
    }).unless({
        path: [
            '/api',
            // '/api/users/register',
            '/api/users/login',
            '/api/users/getUserInfo'
        ]
    })
};

// jwt报错处理
function jwtError() {
    return (err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            res.status(401).json({
                statusCode: statusCode.err,
                msg: '无效token,请重新登录！'
            });
        } else {
            next(err);
        }
    }
};

// 验证管理员权限的中间件
const checkAdminPermission = (req, res, next) => {
    // 检查用户是否已通过身份验证并且 role 为 admin
    if (req.auth && req.auth.role === 'admin') {
        // 用户具有权限，继续处理请求
        next();
    } else {
        // 用户没有权限，返回错误响应
        return res.status(403).json({
            statusCode: statusCode.err,
            msg: 'Forbidden: Insufficient permissions'
        });
    }
};

module.exports = {
    jwtCreate,
    jwtVerify,
    jwtError,
    checkAdminPermission
};

