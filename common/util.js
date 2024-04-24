const { Decimal } = require('decimal.js');

// 生成一个6位随机数
function getRandom() {
    return Math.floor(100000 + Math.random() * 999999);
}

// 获取时间戳
function getDate(n) {
    return Date.now() + (n ? n : 0);
}

// 比较年月日大小
function validDate(userDate) {
    // 获取当前日期
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    // 将用户传入的日期字符串转换为 Date 对象
    const userDateTime = new Date(userDate);
    const userYear = userDateTime.getFullYear();
    const userMonth = userDateTime.getMonth() + 1;
    const userDay = userDateTime.getDate();

    // 比较年、月、日
    if (userYear > currentYear) {
        return true;
    } else if (userYear === currentYear) {
        if (userMonth > currentMonth) {
            return true;
        } else if (userMonth === currentMonth) {
            if (userDay >= currentDay) {
                return true;
            }
        }
    }
    return false;
}

// 生成订单号
function getOrderId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}${random}`;
}


// 保证精度
// 加法，两个数
function add(num1, num2) {
    const decimalNum1 = new Decimal(num1);
    const decimalNum2 = new Decimal(num2);
    const result = decimalNum1.plus(decimalNum2);
    return Number(result.toFixed(2));
}

// 加法，多个数
function adds(...nums) {
    const sum = nums.reduce((acc, num) => {
        const decimalNum = new Decimal(num);
        return acc.plus(decimalNum);
    }, new Decimal(0));

    return Number(sum.toFixed(2));
}

// 减法
function subtract(num1, num2) {
    const decimalNum1 = new Decimal(num1);
    const decimalNum2 = new Decimal(num2);
    const result = decimalNum1.minus(decimalNum2);
    return Number(result.toFixed(2));
}

// 乘法，两个数
function multiply(num1, num2) {
    const decimalNum1 = new Decimal(num1);
    const decimalNum2 = new Decimal(num2);
    const result = decimalNum1.times(decimalNum2);
    return Number(result.toFixed(2));
}

// 乘法，多个数
function multiplys(...nums) {
    if (nums.length === 0) {
        return 0; // 如果没有参数传入，返回 0
    }
    // 将所有参数转换为 Decimal 对象
    const decimalNums = nums.map(num => new Decimal(num));

    // 使用 reduce 对所有参数进行累乘
    const result = decimalNums.reduce((acc, curr) => acc.times(curr));

    return Number(result.toFixed(2)); // 将结果保留两位小数并转为数字返回
}

// 除法
function divide(num1, num2) {
    const decimalNum1 = new Decimal(num1);
    const decimalNum2 = new Decimal(num2);
    const result = decimalNum1.dividedBy(decimalNum2);
    return result.toFixed(2);
}


module.exports = {
    getRandom,
    getDate,
    getOrderId,
    validDate,
    add,
    adds,
    subtract,
    multiply,
    multiplys,
    divide
};