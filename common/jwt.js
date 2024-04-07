const { expressjwt } = require('express-jwt');
const code = require('./code');
const jwt = require('jsonwebtoken');

// 生成jwt token
async function jwtCreate(n) {
    return jwt.sign(
        {
            phoneNumber: n
        },
        process.env._JWT,
        {
            expiresIn: '30d',
            algorithm: 'HS256'
        }
    );

};

// 验证jwt
function jwtVerify() {
    return expressjwt({
        secret: process.env._JWT,
        algorithms: ['HS256']
    }).unless({
        path: [
            '/api',
            '/api/users/register',
            '/api/users/login'
        ]
    })
};

// jwt报错处理
function jwtError() {
    return (err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            res.status(401).json({
                code: code.err,
                msg: '无效token,请重新登录！'
            });
        } else {
            next(err);
        }
    }
};

// 验证用户权限的中间件
const checkUserPermission = (req, res, next) => {
    // 检查用户是否已通过身份验证并且 phoneNumber 为 1778739606
    if (req.auth && req.auth.phoneNumber === '17778739606') {
        // 用户具有权限，继续处理请求
        next();
    } else {
        // 用户没有权限，返回错误响应
        return res.status(403).json({
            code: code.err,
            msg: 'Forbidden: Insufficient permissions'
        });
    }
};

module.exports = {
    jwtCreate,
    jwtVerify,
    jwtError,
    checkUserPermission
};

