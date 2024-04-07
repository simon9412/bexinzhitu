const UserInfo = require('../models/user');
const code = require('../common/code');
const bcrypt = require('bcryptjs');
const { jwtCreate } = require('../common/jwt');

// 验证密码是否匹配哈希值
async function comparePassword(plainPassword, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (err) {
        console.log(err);
    }
};

// 使用 bcrypt 对密码进行哈希处理
async function passwordHash(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                reject(err);
                // 处理错误
                // console.error('密码哈希时出错：', err);
                // 返回错误信息
                return res.status(500).json({
                    code: code.err,
                    msg: '内部服务器错误'
                });
            } else {
                resolve(hash);
            }
        });
    });
};

// 手机号格式校验函数
function isValidPhone(phoneNumber) {
    // 正则表达式，匹配以 1 开头的 11 位数字
    const phoneRegex = /^[1][0-9]{10}$/;
    return phoneRegex.test(phoneNumber);
};

// 密码规则校验函数（6到12位，至少包含字母和数字）
function validatePassword(password) {
    // 定义密码规则的正则表达式
    const passwordRegex = /^(?![^a-zA-Z]+$)(?!\D+$).{6,12}$/;
    // 使用正则表达式测试密码是否符合规则
    return passwordRegex.test(password);
};

// 用户注册逻辑
async function register(req, res) {
    const { phoneNumber, password } = req.body;
    try {
        // 校验手机号格式是否正确
        if (!isValidPhone(phoneNumber)) {
            return res.status(400).json({
                code: code.failed,
                msg: 'Invalid phone number format'
            });
        }

        // 检查手机号是否已经注册过
        const existingUser = await UserInfo.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(400).json({
                code: code.failed,
                msg: 'Phone number already registered'
            });
        }

        // 校验密码格式是否正确
        if (!validatePassword(password)) {
            return res.status(400).json({
                code: code.failed,
                msg: 'Invalid password format'
            });
        }

        // 密码hash值
        const hashPassword = await passwordHash(password);

        const user = new UserInfo({
            phoneNumber: phoneNumber,
            password: hashPassword,
            userName: `user_${phoneNumber}`,
        });
        await user.save();

        // 注册成功后返回数据
        res.status(200).json({
            code: code.success,
            msg: '注册成功',
            data: [{
                uid: user.uid,
                phoneNumber,
                userName: user.userName
            }]
        });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({
            code: code.failed,
            error: 'Internal Server Error'
        });
    }
};

// 用户登录逻辑--手机号
async function login(req, res) {
    const { phoneNumber, password } = req.body;
    // 检查是否提供了手机号和密码
    if (!phoneNumber || !password) {
        return res.status(400).json({
            code: code.failed,
            msg: '请输入手机号和密码'
        });
    }

    try {
        // 查找用户
        const user = await UserInfo.findOne({ phoneNumber });
        // console.log(user)

        // 检查用户是否存在
        if (!user) {
            return res.status(404).json({
                code: code.failed,
                msg: '用户不存在'
            });
        }

        // 验证密码是否匹配
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                code: code.failed,
                msg: '密码错误'
            });
        }

        // 生成jwt token
        const token = await jwtCreate(user.phoneNumber);

        // 创建一个普通的JavaScript对象，并从中删除字段
        const userObject = user.toObject();
        delete userObject._id;
        delete userObject.password;
        delete userObject.__v;
        userObject.token = token;


        // 登录成功
        res.status(200).json({
            code: code.success,
            msg: '登录成功',
            data: [userObject]
        });
    } catch (err) {
        console.error('登录时出错:', err);
        return res.status(500).json({
            code: code.err,
            msg: '服务器错误'
        });
    }
};

// 获取注册用户列表
async function getUserList(req, res) {
    const user = await UserInfo.find().select({ password: 0, _id: 0, __v: 0 });
    return res.status(200).json({
        code: code.success,
        msg: 'success',
        data: [user]

    });
}
// getUserList()

module.exports = {
    register,
    login,
    getUserList,
};
