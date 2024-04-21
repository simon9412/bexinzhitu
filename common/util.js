function dPrice(priceDecimal) {
    const priceString = priceDecimal.toString();
    return Number(priceString);
}

// 生成一个6位随机数
function getRandom() {
    return Math.floor(100000 + Math.random() * 999999);
}

// 获取时间
function getDate(n) {
    return Date.now() + (n ? n : 0);
}

// 生成订单号
function getOrderId() {
    let date = new Date();
    let arr = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDay(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
        getRandom()
    ];
    return arr.join('');
}

module.exports = {
    dPrice,
    getRandom,
    getDate,
    getOrderId
};