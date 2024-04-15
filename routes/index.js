var express = require('express');
var router = express.Router();
const statusCode = require('../common/statusCode');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({
    statusCode: statusCode.success,
    msg: 'success',
    data: []
  });
  res.render('index', { title: 'Express' });
});

module.exports = router;
