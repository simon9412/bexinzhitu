require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
const { jwtVerify, jwtError } = require('./common/jwt');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const { connectMongoDB } = require('./models/mongo');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/userRoutes');
var skuRouter = require('./routes/skuRoutes');


// 连接mongodb
connectMongoDB();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json()); // 解析req
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 解析jwt
app.use(jwtVerify());

// 使用路由中间件
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/sku', skuRouter);


app.use(jwtError());

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
