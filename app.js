var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');

var indexRouter = require('./routes/index');
var fundamentalRouter = require('./routes/fundamentals');
var intermediateRouter = require('./routes/intermediate');
var advancedRouter = require('./routes/advanced');
var eliteRouter = require('./routes/elite');
var ultimateRouter = require('./routes/ultimate');
var checkoutRouter = require('./views/checkout');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/public", express.static('public'));


app.use('/', indexRouter);
app.use('/fundamentals', fundamentalRouter);
app.use('/intermediate', intermediateRouter);
app.use('/advanced', advancedRouter);
app.use('/elite', eliteRouter);
app.use('/ultimate', ultimateRouter);
app.use('/checkout', checkoutRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
