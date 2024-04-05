const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('欢迎访问后端 API！');
});

module.exports = router;
