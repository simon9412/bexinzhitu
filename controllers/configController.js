const statusCode = require('../common/statusCode');
const { URL } = require('../common/enum');
const util = require('../common/util');
const axios = require('axios');


/**
 * @description 获取banner数据
 * @method GET
 * @param null 
 * @returns Promise
 */
async function getBannerList(req, res) {
    try {
        const bannerList = await axios.get(URL.awsBanner);

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: bannerList.data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}


module.exports = {
    getBannerList
};