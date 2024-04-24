const CartItem = require('../models/cart');
const Wxuser = require('../models/wxuser');
const { Sku } = require('../models/sku');
const statusCode = require('../common/statusCode');

/**
 * @description 添加购物车和继续新增或者减少
 * @method POST
 * @param {Number} goodId - 商品id
 * @param {Number} quantity - 商品数量，减少时传负数
 * @returns Promise
 */
async function addCart(req, res) {
    var { goodId, quantity, floor } = req.body;

    try {
        var data;
        // 找到当前用户及cartInfo
        const currentUser = await Wxuser.findOne({ openId: req.auth.openid })
            .populate({ path: 'cartInfo', select: { __v: 0 } })
            .select({ _id: 0, __v: 0 })
            .exec();

        // 找到商品信息
        const goodInfo = await Sku.findOne({ goodId })
            .populate({ path: 'goodInfo', select: { _id: 0, __v: 0 } })
            .select({ _id: 0, __v: 0 })
            .exec();

        // 如果存在cartInfo
        if (currentUser.cartInfo && currentUser.cartInfo.cartList) {
            const existingCartItem = currentUser.cartInfo.cartList.find(item => item.goodId === goodId && item.floor === floor);
            // 如果已添加过购物车
            if (existingCartItem) {
                // 如果购物车已存在相同商品，则更新数量
                existingCartItem.quantity += quantity;

                // 如果更新后的数量大于库存，就改成库存数，就改成999 ，不做库存了，后面要再把999改成goodInfo.goodInfo.inventory
                if (existingCartItem.quantity > 999) {
                    existingCartItem.quantity = 999;
                }
            } else {
                // 否则，将新商品添加到购物车
                // 如果更新后的数量大于库存，就改成999 ，不做库存了goodInfo.goodInfo.inventory
                if (quantity > 999) {
                    quantity = 999
                }
                if (quantity < 1) {
                    quantity = 1
                }
                currentUser.cartInfo.cartList.push({ goodId, quantity, floor, isChecked: true });
            }
            data = await CartItem.findOneAndUpdate(
                { _id: currentUser.cartInfo._id },
                { $set: { cartList: currentUser.cartInfo.cartList } },
                {
                    new: true,  // 返回更新后的文档，默认是返回更新前的文档
                    upsert: true // 如果不存在，则创建新的文档，默认是false
                }
            ).select({ _id: 0, __v: 0 });

        } else {
            // 库存判断
            // if (quantity > goodInfo.goodInfo.inventory) {
            //     quantity = goodInfo.goodInfo.inventory
            // }
            data = await CartItem.create({ cartList: [{ goodId, quantity, floor }] });

            await Wxuser.updateOne({ openId: req.auth.openid }, { $set: { cartInfo: data._id } });
        }
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '加入购物车成功',
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
 * @description 查询当前账号的购物车列表
 * @method GET
 * @param null - 无参数
 * @returns Promise
 */
async function getCartList(req, res) {
    try {
        const data = await Wxuser.findOne({ openId: req.auth.openid })
            .populate({ path: 'cartInfo', select: { _id: 0, __v: 0 } })
            .select({ _id: 0, __v: 0 })
            .exec();
        if (!data || !data.cartInfo) {
            return res.status(200).json({
                statusCode: statusCode.success,
                msg: '购物车为空',
                data: []
            });
        }

        const newData = await Promise.all(data.cartInfo.cartList.map(async (item) => {
            const goodInfo = await Sku.findOne({ goodId: item.goodId })
                .populate({ path: 'goodInfo', select: { _id: 0, __v: 0 } })
                .select({ _id: 0, __v: 0 });

            // 如果商品被删除，返回商品已下架
            if (!goodInfo) {
                return {
                    goodId: item.goodId,
                    quantity: item.quantity,
                    floor: item.floor,
                    isChecked: item.isChecked,
                    goodInfo: '商品已下架'
                }
            }

            return {
                goodId: item.goodId,
                quantity: item.quantity,
                floor: item.floor,
                isChecked: item.isChecked,
                goodInfo: {
                    goodName: goodInfo.goodInfo.goodName,
                    brandName: goodInfo.goodInfo.brandName,
                    specification: goodInfo.goodInfo.specification,
                    property: goodInfo.goodInfo.property,
                    unit: goodInfo.goodInfo.unit,
                    image: goodInfo.goodInfo.image,
                    description: goodInfo.goodInfo.description,
                    // inventory: goodInfo.goodInfo.inventory,
                    originalPriceList: goodInfo.goodInfo.originalPriceList.find(fitem => fitem.floor === item.floor)
                }
            };
        }));

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: newData
        });
    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }
}

/**
 * @description 移除购物车商品支持单个和多个
 * @method POST
 * @param {Number[]} goodIds - 商品id数组
 * @returns Promise
 */
async function removeCart(req, res) {
    const { goodIds } = req.body;

    try {
        const data = await Wxuser.findOne({ openId: req.auth.openid })
            .populate({ path: 'cartInfo', select: { __v: 0 } })
            .select({ _id: 0, __v: 0 })
            .exec();

        // 过滤掉传入的goodid，返回剩下的list，将剩下的list更新
        const filteredCartList = data.cartInfo.cartList.filter(item => !goodIds.includes(item.goodId));

        const newData = await CartItem.findOneAndUpdate(
            { _id: data.cartInfo._id },
            { $set: { cartList: filteredCartList } },
            {
                new: true,  // 返回更新后的文档，默认是返回更新前的文档
            }
        ).select({ _id: 0, __v: 0 });

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '删除商品成功',
            data: [newData]
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }

}

/**
 * @description 修改购物车内商品的选中状态
 * @method POST
 * @param {Number[]} goodIds - 商品id数组
 * @returns Promise
 */
async function updateChecked(req, res) {
    const { cartList } = req.body;

    try {
        const data = await Wxuser.findOne({ openId: req.auth.openid })
            .populate({ path: 'cartInfo', select: { __v: 0 } })
            .select({ _id: 0, __v: 0 })
            .exec();

        const updatedCartList = data.cartInfo.cartList.map(itemOld => {
            // 找到需要改的gooid
            const itemToUpdate = cartList.find(item => item.goodId === itemOld.goodId && item.floor === itemOld.floor);
            if (itemToUpdate) {
                itemOld.isChecked = itemToUpdate.isChecked;
            }
            return itemOld;
        });

        const newData = await CartItem.findOneAndUpdate(
            { _id: data.cartInfo._id },
            { $set: { cartList: updatedCartList } },
            {
                new: true,  // 返回更新后的文档，默认是返回更新前的文档
            }
        ).select({ _id: 0, __v: 0 });

        return res.status(200).json({
            statusCode: statusCode.success,
            msg: '修改状态成功',
            data: [newData]
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: statusCode.serverErr,
            msg: '服务器异常，请稍后重试'
        });
    }

}

module.exports = {
    addCart,
    getCartList,
    removeCart,
    updateChecked
};