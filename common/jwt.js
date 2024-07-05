const { expressjwt } = require('express-jwt');
const statusCode = require('./statusCode');
const jwt = require('jsonwebtoken');

// 生成jwt token
async function jwtCreate(payload, expiresTime) {
    return jwt.sign(
        payload,
        process.env._JWT,
        {
            expiresIn: expiresTime ? expiresTime : '7d',
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
            '/api/users/login',
            '/api/users/getUserInfo',
            {
                url: /^\/api\/sku\/\w+/,
                methods: ['GET']
            },
            '/api/wxusers/wxLogin',
            'api/pay/getNotify',
            /^\/api\/config\/\w+/
        ]
    })
};

// jwt报错处理
function jwtError() {
    return (err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            res.status(401).json({
                statusCode: statusCode.paramErr,
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
            statusCode: statusCode.paramErr,
            msg: 'Forbidden: Insufficient permissions'
        });
    }
};

// 验证管理员或主管权限的中间件
const checkGroupPermission = (req, res, next) => {
    // 检查用户是否已通过身份验证并且 role 为 admin 或 group
    if (req.auth && req.auth.role !== 'user') {
        // 用户具有权限，继续处理请求
        next();
    } else {
        // 用户没有权限，返回错误响应
        return res.status(403).json({
            statusCode: statusCode.paramErr,
            msg: 'Forbidden: Insufficient permissions'
        });
    }
};

module.exports = {
    jwtCreate,
    jwtVerify,
    jwtError,
    checkAdminPermission,
    checkGroupPermission
};

