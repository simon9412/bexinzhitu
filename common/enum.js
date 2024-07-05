
//  账号权限字段
const ALLOWED_ROLES = ['admin', 'group', 'user'];
// 账号使用状态
const ALLOWED_USE = ['normal', 'banned'];
// 商品分类
const CATEGORY = ['Shui', 'Dian', 'Mu', 'Ni', 'You', 'Other'];
// 品牌列表
const BRAND_LIST = []; // 等待配置


const URL = {
    wxLogin: 'https://api.weixin.qq.com/sns/jscode2session',
    awsBanner: 'https://xinzhitu.s3.ap-east-1.amazonaws.com/config/banner.json'
};




module.exports = {
    ALLOWED_ROLES,
    ALLOWED_USE,
    CATEGORY,
    BRAND_LIST,
    URL
};