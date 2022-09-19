var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');

var Publishable_Key = pk_live_51LjZ3dEBctJ3Pe3kLBlnc15bQaFt8JwTHFI8Y25au2gyBMJ2Exdtm2TsgjT3tPYJeVN4rSesrhbadgVahGduAd2J00SwxSekUC;
var Secret_Key = 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;

var stripe = require('stripe')(Secret_Key)

var indexRouter = require('./routes/index');
var fundamentalRouter = require('./routes/fundamentals');
var intermediateRouter = require('./routes/intermediate');
var advancedRouter = require('./routes/advanced');
var eliteRouter = require('./routes/elite');
var ultimateRouter = require('./routes/ultimate');

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

app.get('/', function(req, res){
    res.render('Home', {
    key: Publishable_Key
    })
})
 
app.post('/payment', function(req, res){
 
    // Moreover you can take more details from user
    // like Address, Name, etc from form
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: '',
        address: {
            line1: '',
            postal_code: '',
            city: '',
            state: '',
            country: '',
        }
    })
    .then((customer) => {
 
        return stripe.charges.create({
            amount: 70,    // Charing Rs 25
            description: 'REST API',
            currency: 'CAD',
            customer: customer.id
        });
    })
    .then((charge) => {
        res.send("Success") // If no error occurs
    })
    .catch((err) => {
        res.send(err)    // If some error occurs
    });
})

module.exports = app;
