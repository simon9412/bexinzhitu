const mongoose = require('mongoose');
const { Sku } = require('../models/sku');
const statusCode = require('../common/statusCode');
const { CATEGORY, BRAND_LIST } = require('../common/enum');

/**
 * @description 获取品牌列表
 * @method GET
 * @param null
 * @returns Promise
 */
async function getBrandList(req, res) {
    return res.status(200).json({
        statusCode: statusCode.success,
        msg: 'success',
        data: [{ brandList: BRAND_LIST }]
    });
}

/**
 * @description 获取分类列表
 * @method GET
 * @param null
 * @returns Promise
 */
async function getCategoryList(req, res) {
    return res.status(200).json({
        statusCode: statusCode.success,
        msg: 'success',
        data: [{ category: CATEGORY }]
    });
}

/**
 * @description 获取商品列表，支持全部查询，分页查询，goodId查询
 * @method GET
 * @param {String} category - *分类名
 * @param {Number} page - 页码，必须大于0的正整数
 * @param {Number} pageSize - 每页数据数量，必须大于0的正整数
 * @return Promise
 */
async function getSkuListByCategory(req, res) {
    const { category } = req.params;
    const { page, pageSize } = req.query;
    // 验证page是否为大于0的数字
    if (page && (isNaN(page) || parseInt(page) <= 0)) {
        return res.status(400).json({
            statusCode: statusCode.paramErr,
            msg: '参数错误'
        });
    }
    // 验证pageSize是否为大于0的数字
    if (pageSize && (isNaN(pageSize) || parseInt(pageSize) <= 0)) {
        return res.status(400).json({
            statusCode: statusCode.paramErr,
            msg: '参数错误'
        });
    }

    try {
        // 判断是否category是否符合标准
        if (!CATEGORY.includes(category)) {
            return res.status(400).json({
                statusCode: statusCode.paramErr,
                msg: '参数错误'
            });
        }
        const skipCount = page ? (page - 1) * pageSize : 0; // 计算需要跳过的文档数量
        const results = await Sku.find({ category })
            .populate({ path: 'goodInfo', select: { _id: 0, __v: 0 } })
            .sort({ goodId: 1 })
            .skip(skipCount)
            .limit(pageSize)
            .select({ _id: 0, __v: 0 })
            .exec();

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '查询成功',
            data: [{ skuInfo: results }]
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常'
        });
    }
}

/**
 * @description 获取商品列表，支持全部查询，分页查询，goodId查询
 * @method GET
 * @param {Number} goodId - 商品ID，可选
 * @param {Number} page - 页码，必须大于0的正整数
 * @param {Number} pageSize - 每页数据数量，必须大于0的正整数
 * @return Promise
 */
async function getSkuList(req, res) {
    const { goodId, page, pageSize } = req.query;
    // 验证page是否为大于0的数字
    if (page && (isNaN(page) || parseInt(page) <= 0)) {
        return res.status(400).json({
            statusCode: statusCode.paramErr,
            msg: '参数错误'
        });
    }
    // 验证pageSize是否为大于0的数字
    if (pageSize && (isNaN(pageSize) || parseInt(pageSize) <= 0)) {
        return res.status(400).json({
            statusCode: statusCode.paramErr,
            msg: '参数错误'
        });
    }

    try {
        const skipCount = page ? (page - 1) * pageSize : 0; // 计算需要跳过的文档数量
        const skuInfos = await Sku.find(goodId ? { goodId: goodId } : {})
            .populate({ path: 'goodInfo', select: { _id: 0, __v: 0 } })
            .sort({ goodId: 1 })
            .skip(skipCount)
            .limit(pageSize)
            .select({ _id: 0, __v: 0 })
            .exec();

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: [{ skuInfo: skuInfos }]
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常'
        });
    }
};

/**
 * @description 新增商品
 * @method POST
 * @param {Object[]} skuInfo - *商品信息数组
 * @param {string} skuInfo[].category - *商品分类，搜索CATEGORY可查
 * @param {string} skuInfo[].goodName - *商品名称
 * @param {string} skuInfo[].property - *商品属性
 * @param {string} skuInfo[].unit - *商品单位
 * @param {string} skuInfo[].brandName - *商品品牌名称
 * @param {Decimal128} skuInfo[].originalPrice - 商品原价
 * @param {number} skuInfo[].inventory - 商品库存量
 * @return Promise
 */
async function addSku(req, res) {
    const { skuInfo } = req.body;

    try {
        const skuInfos = [];
        await Promise.all(skuInfo.map(async ({
            category,
            goodName,
            specification,
            property,
            unit,
            brandName,
            originalPrice,
            inventory,
            description,
            image
        }) => {
            // 判断是否category是否符合标准
            if (!CATEGORY.includes(category)) {
                return { goodName, status: 'error', message: '无效的商品类别' };
            }
            const Model = mongoose.model(category);

            // 创建商品对象并保存到对应的子表中
            const goodInfo = new Model({
                goodName,
                specification,
                property,
                unit,
                brandName,
                originalPrice,
                inventory,
                description,
                image
            });
            await goodInfo.save();
            // 创建相对应的 Sku 记录并保存到数据库
            const sku = new Sku({ category, goodInfo: goodInfo._id });
            await sku.save();

            skuInfos.push({
                goodId: sku.goodId,
                category: sku.category,
                goodName: goodInfo.goodName,
                specification: goodInfo.specification,
                property: goodInfo.property,
                unit: goodInfo.unit,
                brandName: goodInfo.brandName,
                originalPrice: goodInfo.originalPrice,
                inventory: goodInfo.inventory,
                description: goodInfo.description,
                image: goodInfo.image
            });
        }));

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '新增商品成功',
            data: [{ skuInfo: skuInfos }]
        });
    } catch (error) {
        // console.error('Error adding product:', error);
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，新增商品失败'
        });
    }
}

/**
 * @description 修改商品信息，支持单个和多个
 * @method POST
 * @param {Object[]} skuInfo - *商品信息数组
 * @param {string} skuInfo[].goodId - *商品id
 * @param {string} skuInfo[].category - *商品分类，搜索CATEGORY可查
 * @param {string} skuInfo[].goodName - *商品名称
 * @param {string} skuInfo[].specification - *商品属性
 * @param {string} skuInfo[].property - *商品属性
 * @param {string} skuInfo[].unit - *商品单位
 * @param {string} skuInfo[].brandName - *商品品牌名称
 * @param {Decimal128} skuInfo[].originalPrice - *商品原价
 * @param {number} skuInfo[].inventory - *商品库存量
 * @return Promise
 */
async function updateSku(req, res) {
    const { skuInfo } = req.body;

    try {
        const results = await Promise.all(skuInfo.map(async (sku) => {
            // 检查传入的 category 是否合法
            if (!CATEGORY.includes(sku.category)) {
                return { goodId: sku.goodId, status: 'error', message: '无效的category' };
            }

            // 根据商品的 goodId 查找总表 Sku 中的记录
            const existingSku = await Sku.findOne({ goodId: sku.goodId });

            if (!existingSku) {
                return { goodId: sku.goodId, status: 'error', message: '商品不存在' };
            }

            // 获取商品原始的 category
            const oldCategory = existingSku.category;

            // 根据原始 category 查找对应的子表模型
            const OldModel = mongoose.model(oldCategory);
            const NewModel = mongoose.model(sku.category);

            // 在旧子表中查找商品信息
            const existingProduct = await OldModel.findOne({ _id: existingSku.goodInfo });
            // console.log(existingProduct)

            if (!existingProduct) {
                return { goodId: sku.goodId, status: 'error', message: '商品不存在' };
            }

            const newInfo = {
                goodName: sku.goodName ? sku.goodName : existingProduct.goodName,
                brandName: sku.brandName ? sku.brandName : existingProduct.brandName,
                specification: sku.specification ? sku.specification : existingProduct.specification,
                property: sku.property ? sku.property : existingProduct.property,
                unit: sku.unit ? sku.unit : existingProduct.unit,
                inventory: sku.inventory ? sku.inventory : existingProduct.inventory,
                originalPrice: sku.originalPrice ? sku.originalPrice : existingProduct.originalPrice,
                description: sku.description ? sku.description : existingProduct.description,
                image: sku.image ? sku.image : existingProduct.image
            }
            // 创建新子表中的商品信息
            const newProduct = new NewModel(newInfo);

            // 保存新商品信息到新子表
            await newProduct.save();

            // 从旧子表中删除商品信息
            await OldModel.deleteOne({ _id: existingSku.goodInfo });

            // 更新总表中的 category 和关联的 goodInfo
            await Sku.updateOne(
                { goodId: sku.goodId },
                { category: sku.category, goodInfo: newProduct._id }
            );

            return {
                goodId: sku.goodId,
                status: 'success',
                message: '商品信息已更新',
                newData: {
                    category: sku.category,
                    goodInfo: newInfo
                }
            };

        }));

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '商品信息已更新',
            data: results
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，更新商品信息失败'
        });
    }
}

/**
 * @description 删除商品，支持单个和多个
 * @method POST
 * @param {Number|Number[]} goodIds - *number数组
 * @return Promise
 */
async function deleteSku(req, res) {
    const { goodIds } = req.body;

    try {
        // 查找商品记录
        const skus = await Sku.find({ goodId: { $in: goodIds } });

        if (skus.length === 0) {
            return res.status(400).json({
                statusCode: statusCode.paramErr,
                msg: '商品不存在'
            });
        }

        // 删除所有子表数据
        const deleteSubPromises = skus.map(async (item) => {
            const Model = mongoose.model(item.category);
            return Model.deleteMany({ _id: item.goodInfo });
        });
        await Promise.all(deleteSubPromises);

        // 删除主表数据
        const deleteSkuResult = await Sku.deleteMany({ goodId: { $in: goodIds } });

        if (deleteSkuResult.deletedCount > 0) {
            const deletedGoodIds = skus.map(sku => sku.goodId);
            return res.status(200).json({
                statusCode: statusCode.success,
                msg: '删除成功',
                data: [{ goodIds: deletedGoodIds }]
            });
        } else {
            return res.status(500).json({
                statusCode: statusCode.serverErr,
                msg: '删除商品失败'
            });
        }
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常'
        });
    }
}

/**
 * @description 按商品名，品牌名模糊搜索商品
 * @param {String} keyword - 字符串
 * @returns Promise
 */
async function searchSku(req, res) {
    const { keyword, page, pageSize } = req.query;

    // 没传参数直接返回空数据
    if (!keyword) {
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '查询成功',
            data: []
        });
    }

    // 验证page是否为大于0的数字
    if (page && (isNaN(page) || parseInt(page) <= 0)) {
        return res.status(400).json({
            statusCode: statusCode.paramErr,
            msg: '参数错误'
        });
    }

    // 验证pageSize是否为大于0的数字
    if (pageSize && (isNaN(pageSize) || parseInt(pageSize) <= 0)) {
        return res.status(400).json({
            statusCode: statusCode.paramErr,
            msg: '参数错误'
        });
    }

    try {
        const skipCount = page ? (page - 1) * pageSize : 0;
        // 如果有关键字，则进行商品名称和品牌名的模糊查询
        const keywordRegex = new RegExp(keyword, 'i'); // 不区分大小写的正则表达式

        let pipeline = [];
        let CATEGORY_PREFIX = [];
        CATEGORY.map(category => {
            pipeline.push({
                $lookup: {
                    from: `${category.toLowerCase()}s`, // 子表集合的名称（假设子表集合名称与模型名称相同）
                    localField: 'goodInfo',
                    foreignField: '_id',
                    as: category.toLowerCase() // 查询结果存放在 Sku 文档的字段中，字段名与子表名称相同
                }
            }),
                CATEGORY_PREFIX.push(`$${category.toLowerCase()}`)
        });
        pipeline.push(
            {
                $project: {
                    skuInfo: { $concatArrays: CATEGORY_PREFIX }, // 将所有查询结果合并
                    goodId: 1, // 0不展示，1展示
                    category: 1, // 0不展示，1展示
                    _id: 0 // 0不展示，1展示
                }
            },
            {
                $unwind: '$skuInfo' // 过滤出匹配关键字的记录
            },
            {
                $match: { // 模糊匹配
                    $or: [
                        { 'skuInfo.goodName': { $regex: keywordRegex } },
                        { 'skuInfo.brandName': { $regex: keywordRegex } }
                    ]
                }
            },
            { $skip: skipCount },
            { $limit: pageSize ? parseInt(pageSize) : 100 },
            {
                $project: { // 选择要返回的字段
                    category: 1,
                    goodId: 1,
                    goodInfo: {
                        goodName: '$skuInfo.goodName',
                        brandName: '$skuInfo.brandName',
                        specification: '$skuInfo.specification',
                        property: '$skuInfo.property',
                        unit: '$skuInfo.unit',
                        originalPrice: '$skuInfo.originalPrice',
                        inventory: '$skuInfo.inventory',
                        description: '$skuInfo.description',
                        image: '$skuInfo.image',
                    }
                }
            }
        );

        const results = await Sku.aggregate(pipeline);

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '查询成功',
            data: [{ skuInfo: results }]
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，查询商品信息失败'
        });
    }

}



module.exports = {
    getBrandList,
    getCategoryList,
    getSkuListByCategory,
    getSkuList,
    addSku,
    updateSku,
    deleteSku,
    searchSku
}