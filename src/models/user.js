// 这里是模型定义和数据库交互的代码，需要根据您使用的数据库和 ORM 来实现
// 在这个示例中，我们只是简单地定义了一个用户对象
class User {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}

module.exports = User;
