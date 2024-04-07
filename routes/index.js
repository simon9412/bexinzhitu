var express = require('express');
var router = express.Router();
const code = require('../common/code');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({
    code: code.success,
    msg: 'success',
    data: []
  });
  res.render('index', { title: 'Express' });
});

module.exports = router;
