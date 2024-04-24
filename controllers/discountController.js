const Discount = require('../models/discount');
const statusCode = require('../common/statusCode');

/**
 * @description 增加或修改大类满减打折
 * @method POST
 * @param {Object[]} discountList - 数组
 * @param {*} res 
 * @returns Promise
 */
async function addAndUpdateDiscount(req, res) {
    const { discountList } = req.body;

    try {
        await Promise.all(discountList.map(async (data) => {
            const { category, rule } = data;

            const findDiscount = await Discount.findOne({ category });
            if (findDiscount) {
                return Discount.updateOne(
                    { category }, // 查询条件
                    { $set: { discountList: rule } } // 更新操作
                );
            } else {
                const discounts = new Discount({ category, discountList: rule });
                return discounts.save();
            }
        }));


        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
        });
    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常'
        });
    }
}

/**
 * @description 查询各类折扣
 * @method GET
 * @param null - 无参数
 * @returns Promise
 */
async function getDiscountList(req, res) {
    try {
        const findDiscount = await Discount.find().select({ _id: 0, __v: 0 });

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: findDiscount
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常'
        });
    }
}


module.exports = {
    addAndUpdateDiscount,
    getDiscountList
};