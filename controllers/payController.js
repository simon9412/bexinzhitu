const { Sku } = require('../models/sku');
const Wxuser = require('../models/wxuser');
const Order = require('../models/order');
const CartItem = require('../models/cart');
const Coupon = require('../models/coupon');
const Discount = require('../models/discount');
const UserInfo = require('../models/user');
const Notify = require('../models/notify');
const statusCode = require('../common/statusCode');
const util = require('../common/util');

/**
 * 生成预支付订单通常需要以下步骤：

创建统一下单接口请求参数。
将请求参数转换成 XML 格式。
发送请求到微信支付接口，并接收返回的预支付订单信息。
解析返回的结果，提取预支付订单信息。

const request = require('request');
const xml2js = require('xml2js');

// 微信支付相关配置
const wxPayConfig = {
    appId: 'your_app_id',
    mchId: 'your_mch_id',
    apiKey: 'your_api_key',
    notifyUrl: 'your_notify_url',
};

// 生成随机字符串
function generateNonceStr(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charLength = chars.length;
    let nonceStr = '';
    for (let i = 0; i < length; i++) {
        nonceStr += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return nonceStr;
}

// 生成签名
function generateSign(params) {
    const stringA = Object.keys(params).filter(key => params[key] !== undefined && params[key] !== '').sort().map(key => `${key}=${params[key]}`).join('&');
    const stringSignTemp = `${stringA}&key=${wxPayConfig.apiKey}`;
    const sign = require('crypto').createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase();
    return sign;
}

// 生成预支付订单请求参数
function generateUnifiedOrderParams(body, outTradeNo, totalFee, spbillCreateIp) {
    const params = {
        appid: wxPayConfig.appId,
        mch_id: wxPayConfig.mchId,
        nonce_str: generateNonceStr(32),
        body: body,
        out_trade_no: outTradeNo,
        total_fee: totalFee,
        spbill_create_ip: spbillCreateIp,
        notify_url: wxPayConfig.notifyUrl,
        trade_type: 'JSAPI', // 小程序支付
        openid: 'user_openid', // 用户在小程序登录后获取的openid
    };
    params.sign = generateSign(params);
    return params;
}

// 发起统一下单请求
function sendUnifiedOrderRequest(params) {
    const builder = new xml2js.Builder({ rootName: 'xml', headless: true });
    const xmlParams = builder.buildObject(params);
    return new Promise((resolve, reject) => {
        request.post({
            url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
            body: xmlParams,
        }, (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
}

// 解析预支付订单结果
function parseUnifiedOrderResult(xmlResult) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xmlResult, { explicitArray: false }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

// 生成预支付订单
async function generatePrepayOrder(body, outTradeNo, totalFee, spbillCreateIp) {
    try {
        const unifiedOrderParams = generateUnifiedOrderParams(body, outTradeNo, totalFee, spbillCreateIp);
        const xmlResult = await sendUnifiedOrderRequest(unifiedOrderParams);
        const parsedResult = await parseUnifiedOrderResult(xmlResult);
        const prepayId = parsedResult.xml.prepay_id;
        return prepayId;
    } catch (error) {
        console.error('Error generating prepay order:', error);
        throw error;
    }
}

// 调用示例
const body = '商品描述';
const outTradeNo = '订单号';
const totalFee = 100; // 金额（单位：分）
const spbillCreateIp = '用户IP';
generatePrepayOrder(body, outTradeNo, totalFee, spbillCreateIp)
    .then(prepayId => {
        console.log('Prepay ID:', prepayId);
    })
    .catch(error => {
        console.error('Error:', error);
    });

 */






/**
 * @description 创建预付单
 * @method GET
 * @param {*} req 
 * @param {*} res 
 * @returns Promise
 */
async function createPrePay(req, res) {
    try {
        return
    } catch (error) {
        return
    }
}



/**
 * @description 获取支付结果
 * @method GET
 * @param {*} req 
 * @param {*} res 
 * @returns Promise
 */
async function getNotify(req, res) {
    try {
        return
    } catch (error) {
        return
    }
}


module.exports = {
    getNotify
};
