const Address = require('../models/address');
const Wxuser = require('../models/wxuser');
const statusCode = require('../common/statusCode');


// var addressIndo = {
//     recipientName: { type: String, required: true }, // 收货人姓名
//     phone: { type: String, required: true }, // 收货人电话号码
//     province: { type: String, required: true }, // 省
//     provinceCode: { type: String, required: true }, // 省编码
//     city: { type: String, required: true }, // 市
//     cityCode: { type: String, required: true }, // 市编码
//     district: { type: String, required: true }, // 区
//     districtCode: { type: String, required: true }, // 区编码
//     detail: { type: String, required: true }, // 详细地址
//     isDefault: { type: Boolean, default: false }, // 是否默认
// };


/**
 * @description 新增收货地址
 * @method POST
 * @param {Object} addressInfo - 对象，具体参数见数据表address.js
 * @returns Promise
 */
async function addAddress(req, res) {
    const { addressInfo } = req.body;

    try {
        var data;
        // 找到当前用户
        const currentUser = await Wxuser.findOne({ openId: req.auth.openid })
            .populate({ path: 'addressInfo', select: { __v: 0 } })
            .select({ _id: 0, __v: 0 })
            .exec();

        // 如果已经有过地址，直接添加
        if (currentUser.addressInfo) {
            currentUser.addressInfo.addressList.push(addressInfo);

            data = await Address.findOneAndUpdate(
                { _id: currentUser.addressInfo._id },
                { $set: { addressList: currentUser.addressInfo.addressList } },
                {
                    new: true,  // 返回更新后的文档，默认是返回更新前的文档
                    upsert: true // 如果不存在，则创建新的文档，默认是false
                }
            ).select({ _id: 0, __v: 0 });
        } else { // 如果新用户没地址，则创建新的
            data = await Address.create({ addressList: [addressInfo] });
            await Wxuser.updateOne({ openId: req.auth.openid }, { $set: { addressInfo: data._id } });
        }

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: [data]
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 修改收货地址
 * @method POST
 * @param {Number} addressId - 需要更新的那条地址的id
 * @param {Object} addressInfo - - 对象，具体参数见数据表address.js
 * @returns Promise
 */
async function updateAddress(req, res) {
    const { addressId, addressInfo } = req.body;

    try {
        var currentUser = await Wxuser.findOne({ openId: req.auth.openid })
            .populate({ path: 'addressInfo', select: { __v: 0 } })
            .select({ _id: 0, __v: 0 })
            .exec();

        if (addressInfo.isDefault === true) {
            // 将其他地址的isDefault字段设为false
            currentUser.addressInfo.addressList.forEach((address) => {
                if (addressId !== String(address._id)) {
                    address.isDefault = false;
                }
            });
        }
        currentUser.addressInfo.addressList.forEach(item => {
            if (String(item._id) === addressId) {
                item.recipientName = addressInfo.recipientName ? addressInfo.recipientName : item.recipientName;
                item.phone = addressInfo.phone ? addressInfo.phone : item.phone;
                item.province = addressInfo.province ? addressInfo.province : item.province;
                item.provinceCode = addressInfo.provinceCode ? addressInfo.provinceCode : item.provinceCode;
                item.city = addressInfo.city ? addressInfo.city : item.city;
                item.cityCode = addressInfo.cityCode ? addressInfo.cityCode : item.cityCode;
                item.district = addressInfo.district ? addressInfo.district : item.district;
                item.districtCode = addressInfo.districtCode ? addressInfo.districtCode : item.districtCode;
                item.detail = addressInfo.detail ? addressInfo.detail : item.detail;
                item.isDefault = addressInfo.isDefault !== undefined ? addressInfo.isDefault : item.isDefault;
            }
        })

        const data = await Address.findOneAndUpdate(
            { _id: currentUser.addressInfo._id },
            { $set: { addressList: currentUser.addressInfo.addressList } },
            {
                new: true,  // 返回更新后的文档，默认是返回更新前的文档
                upsert: true // 如果不存在，则创建新的文档，默认是false
            }
        ).select({ _id: 0, __v: 0 });

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: [data]
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }

}

/**
 * @description 删除收货地址
 * @method POST
 * @param 
 * @returns Promise
 */
async function deleteAddress(req, res) {
    const { addressId } = req.body;

    try {
        const currentUser = await Wxuser.findOne({ openId: req.auth.openid })
            .populate({ path: 'addressInfo', select: { __v: 0 } })
            .select({ _id: 0, __v: 0 })
            .exec();

        // 找到需要删除的地址
        const needDelete = currentUser.addressInfo.addressList.filter(item => String(item._id) === addressId);
        // 如果地址不存在，证明参数错误
        if (needDelete.length === 0) {
            return res.status(400).json({
                statusCode: statusCode.paramErr,
                msg: '地址不存在',
            });
        }

        // 过滤掉要删除的地址项
        const filteredAddressList = currentUser.addressInfo.addressList.filter(item => String(item._id) !== addressId);

        await Address.findOneAndUpdate(
            { _id: currentUser.addressInfo._id },
            { $set: { addressList: filteredAddressList } },
            {
                new: true,  // 返回更新后的文档，默认是返回更新前的文档
                upsert: true // 如果不存在，则创建新的文档，默认是false
            }
        ).select({ _id: 0, __v: 0 });

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: [addressId]
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 收货地址列表
 * @method GET
 * @param null - 无参数
 * @returns Promise
 */
async function getAddressList(req, res) {
    try {
        const currentUser = await Wxuser.findOne({ openId: req.auth.openid })
            .populate({ path: 'addressInfo', select: { __v: 0 } })
            .select({ _id: 0, __v: 0 })
            .exec();

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: currentUser.addressInfo.addressList
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 获取当前默认的收货地址
 * @method GET
 * @param 
 * @returns Promise
 */
async function getDefaultAddress(req, res) {
    try {
        const currentUser = await Wxuser.findOne({ openId: req.auth.openid })
            .populate({ path: 'addressInfo', select: { __v: 0 } })
            .select({ _id: 0, __v: 0 })
            .exec();

        // 找到默认的地址
        const data = currentUser.addressInfo.addressList.filter(item => item.isDefault === true);

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

module.exports = {
    addAddress,
    updateAddress,
    deleteAddress,
    getAddressList,
    getDefaultAddress
};