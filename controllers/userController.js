const UserInfo = require('../models/user');
const statusCode = require('../common/statusCode');
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
                    statusCode: statusCode.err,
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
    // 正则表达式，匹配中国大陆手机号
    // const phoneRegex = /^[1][0-9]{10}$/;
    // const phoneRegex = /^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$/;
    // const phoneRegex = /^1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/;
    const phoneRegex = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;

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
                statusCode: statusCode.failed,
                msg: 'Invalid phone number format'
            });
        }

        // 检查手机号是否已经注册过
        const existingUser = await UserInfo.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(400).json({
                statusCode: statusCode.failed,
                msg: 'Phone number already registered'
            });
        }

        // 校验密码格式是否正确
        if (!validatePassword(password)) {
            return res.status(400).json({
                statusCode: statusCode.failed,
                msg: 'Invalid password format'
            });
        }

        // 密码hash值
        const hashPassword = await passwordHash(password);

        const user = new UserInfo({
            phoneNumber: phoneNumber,
            password: hashPassword,
            userName: `user_${phoneNumber}`,
            role: 'user', // 默认值 user
            gid: 0, // 默认值0
            use: 'normal'
        });
        await user.save();

        // 注册成功后返回数据
        res.status(200).json({
            statusCode: statusCode.success,
            msg: '注册成功',
            data: [{
                uid: user.uid,
                phoneNumber,
                userName: user.userName,
                role: user.role,
                gid: user.gid,
                use: user.use
            }]
        });
    } catch (err) {
        console.error('注册出错:', err);
        res.status(500).json({
            statusCode: statusCode.failed,
            msg: 'Internal Server Error'
        });
    }
};

// 用户登录逻辑--手机号
async function login(req, res) {
    const { phoneNumber, password } = req.body;
    // 检查是否提供了手机号和密码
    if (!phoneNumber || !password) {
        return res.status(400).json({
            statusCode: statusCode.failed,
            msg: '请输入手机号和密码'
        });
    }

    try {
        // 查找用户
        const user = await UserInfo.findOne({ phoneNumber });

        // 检查用户是否存在 以及查询账号使用状态
        if (!user) {
            return res.status(404).json({
                statusCode: statusCode.failed,
                msg: '用户不存在'
            });
        }
        if (user.use === 'banned') {
            return res.status(404).json({
                statusCode: statusCode.failed,
                msg: '您的账号已被限制登录，请联系管理员'
            });
        }

        // 验证密码是否匹配
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                statusCode: statusCode.failed,
                msg: '密码错误'
            });
        }

        // 生成jwt token
        const token = await jwtCreate(user.phoneNumber, user.role);

        // 创建一个普通的JavaScript对象，并从中删除字段
        const userObject = user.toObject();
        delete userObject._id;
        delete userObject.password;
        delete userObject.__v;
        userObject.token = token;


        // 登录成功
        res.status(200).json({
            statusCode: statusCode.success,
            msg: '登录成功',
            data: [userObject]
        });
    } catch (err) {
        console.error('登录出错:', err);
        return res.status(500).json({
            statusCode: statusCode.err,
            msg: '服务器错误'
        });
    }
};

// 获取注册用户列表
async function getUserList(req, res) {
    const user = await UserInfo.find().select({ password: 0, _id: 0, __v: 0 });
    return res.status(200).json({
        statusCode: statusCode.success,
        msg: 'success',
        data: [user]

    });
}

// 获取单个用户信息
async function getUserInfo(req, res) {
    const { uid, phoneNumber } = req.query;
    var user = null;

    if (uid !== undefined) {
        user = await UserInfo.findOne({ uid }).select({ password: 0, _id: 0, __v: 0 });
    }

    if (!user && phoneNumber) {
        user = await UserInfo.findOne({ phoneNumber }).select({ password: 0, _id: 0, __v: 0 });
    }

    if (user) {
        return res.status(200).json({
            statusCode: statusCode.success,
            msg: 'success',
            data: [user]
        });
    } else {
        return res.status(400).json({
            statusCode: statusCode.failed,
            msg: '用户不存在',
            data: []
        });
    }
}

// 更新单个用户信息
async function updateUserInfo(req, res) {
    const {
        uid, // 二选一
        phoneNumber, // 二选一
        userName, // 非必传
        avatar, // 非必传
        password, // 非必传
        role, // 非必传
        gid, // 非必传
        use // 非必传
    } = req.body;

    // 权限必须三选一
    const allowedRoles = ['admin', 'group', 'user'];
    const allowedUse = ['normal', 'banned'];
    // 更新条件，筛选出哪一条数据
    var filter = {};

    if (uid !== undefined) {
        // 如果传入的是uid，则使用 uid 进行处理
        filter = { uid: uid };
    } else if (phoneNumber) {
        // 如果传入的是phoneNumber，则使用 phoneNumber 进行处理
        filter = { phoneNumber: phoneNumber };
    } else {
        // 如果都不存在，则返回错误消息
        return res.status(400).json({
            statusCode: statusCode.err,
            msg: '请传入参数',
        });
    }

    var newRole;
    var newGid;
    var newUse;

    if (req.auth && req.auth.role === 'admin') {
        if (role) {
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({
                    statusCode: statusCode.err,
                    msg: '参数异常'
                });
            }
            newRole = role;
        }

        if (use) {
            if (!allowedUse.includes(use)) {
                return res.status(400).json({
                    statusCode: statusCode.err,
                    msg: '参数异常2'
                });
            }
            newUse = use;
        }

        if (gid) {
            newGid = gid;
        }
    }

    if (password) {
        // 校验密码格式是否正确
        if (!validatePassword(password)) {
            return res.status(400).json({
                statusCode: statusCode.failed,
                msg: 'Invalid password format'
            });
        }

        // 密码hash值
        var hashPassword = await passwordHash(password);
    }

    // 更新操作
    const update = {
        $set: {
            userName: userName,
            avatar: avatar,
            password: hashPassword,
            role: newRole,
            gid: newGid,
            use: newUse
        },
    };

    await UserInfo.updateOne(filter, update);
    const user = await UserInfo.findOne(filter).select({ password: 0, __v: 0 });
    await user.save();
    const userObject = user.toObject();
    delete userObject._id;

    return res.status(200).json({
        statusCode: statusCode.success,
        msg: 'success',
        data: [userObject]
    });
}

// 删除用户
async function deleteUser(req, res) {
    const { uid, phoneNumber } = req.body;

    if (uid !== undefined) {
        const uidDel = await UserInfo.deleteOne({ uid: uid });
        if (uidDel.deletedCount === 0) {
            return res.status(400).json({
                statusCode: statusCode.err,
                msg: 'uid不存在',
            });
        }
    } else if (phoneNumber) {
        const phoneNumberDel = await UserInfo.deleteOne({ phoneNumber: phoneNumber });
        if (phoneNumberDel.deletedCount === 0) {
            return res.status(400).json({
                statusCode: statusCode.err,
                msg: 'uid不存在',
            });
        }
    } else {
        return res.status(400).json({
            statusCode: statusCode.err,
            msg: '请传入参数',
        });
    }

    return res.status(200).json({
        statusCode: statusCode.success,
        msg: 'success',
        data: []
    });
}

module.exports = {
    register,
    login,
    getUserList,
    getUserInfo,
    updateUserInfo,
    deleteUser
}