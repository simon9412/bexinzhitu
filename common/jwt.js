const { expressjwt } = require('express-jwt');
const code = require('./code');

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
function jwtErr(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            code: code.err,
            msg: '无效token,请重新登录！'
        });
    } else {
        next(err);
    }
};

module.exports = {
    jwtVerify,
    jwtErr
};

