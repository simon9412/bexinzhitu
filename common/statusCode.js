// 定义code状态码
const statusCode = {
    success: 0, // 通用成功
    failed: 10000,
    serverErr: 500,
    paramErr: 400,
    permissionFailed: 403
}

module.exports = statusCode;