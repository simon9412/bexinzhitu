const mongoose = require('mongoose');
const { Sku, Dian, Mu } = require('../models/sku');
const statusCode = require('../common/statusCode');
const { CATEGORY } = require('../common/enum');


async function getList(req, res) {
    const { } = req.query;

    const aa = await Sku.find()
        .populate({ path: 'goodInfo', select: { _id: 0, __v: 0 } })
        .select({ _id: 0, __v: 0 })
        .exec();
    // const aa = await Sku.find();


    return res.status(200).json({
        statusCode: statusCode.success,
        msg: 'success',
        data: [aa]
    });
};

// 增加商品
async function addSku(req, res) {
    const { skuInfo } = req.body;

    try {
        const skuInfos = [];
        await Promise.all(skuInfo.map(async ({ category, goodName, property, unit, brandName, originalPrice }) => {
            // 判断是否category是否符合标准
            if (!CATEGORY.includes(category)) {
                return res.status(400).json({
                    statusCode: statusCode.err,
                    msg: 'category参数异常'
                });
            }
            const Model = mongoose.model(category);

            // 创建商品对象并保存到对应的子表中
            const goodInfo = new Model({ goodName, property, unit, brandName, originalPrice });
            await goodInfo.save();
            // 创建相对应的 Sku 记录并保存到数据库
            const sku = new Sku({ category, goodInfo: goodInfo._id });
            await sku.save();

            skuInfos.push({ goodId: sku.goodId, category, goodName, property, unit, brandName, originalPrice });
        }));

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '新增商品成功',
            data: [{ skuInfo: skuInfos }]
        });
    } catch (error) {
        // console.error('Error adding product:', error);
        return res.status(500).json({
            statusCode: statusCode.err,
            msg: '服务器异常，新增商品失败'
        });
    }
}





module.exports = {
    getList,
    addSku
}