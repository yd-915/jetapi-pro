var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');

var stripe = require('stripe')('pk_live_51LjZ3dEBctJ3Pe3kLBlnc15bQaFt8JwTHFI8Y25au2gyBMJ2Exdtm2TsgjT3tPYJeVN4rSesrhbadgVahGduAd2J00SwxSekUC');

var customers = {
  // stripeCustomerId : data
  'stripeCustomerId': {
    apiKey: '123xyz',
    active: false,
    itemId: 'stripeSubscriptionItemId',
  },
};
 var apiKeys = {
  // apiKey : customerdata
  '123xyz': 'stripeCustomerId',
};

function generateAPIKey() {
  var { randomBytes } = require('crypto');
  var apiKey = randomBytes(16).toString('hex');
  var hashedAPIKey = hashAPIKey(apiKey);

  // Ensure API key is unique
  if (apiKeys[hashedAPIKey]) {
    generateAPIKey();
  } else {
    return { hashedAPIKey, apiKey };
  }
}

// Hash the API key
function hashAPIKey(apiKey) {
  var { createHash } = require('crypto');

  var hashedAPIKey = createHash('sha256').update(apiKey).digest('hex');

  return hashedAPIKey;
}

////// Express API ///////

// Create a Stripe Checkout Session to create a customer and subscribe them to a plan
app.post('/checkout', async (req, res) => {
  var session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: 'price_YOUR-PRODUCT',
      },
    ],
    // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
    // the actual Session ID is returned in the query parameter when your customer
    // is redirected to the success page.
    success_url:
      'http://YOUR-WEBSITE/dashboard?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://YOUR-WEBSITE/error',
  });

  res.send(session);
});

// Listen to webhooks from Stripe when important events happen
app.post('/webhook', async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  var webhookSecret = 'whsec_YOUR-KEY';

  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];

    try {
      event = stripe.webhooks.constructEvent(
        req['rawBody'],
        signature,
        webhookSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  switch (eventType) {
    case 'checkout.session.completed':
      console.log(data);
      // Data included in the event object:
      const customerId = data.object.customer;
      const subscriptionId = data.object.subscription;

      console.log(
        `💰 Customer ${customerId} subscribed to plan ${subscriptionId}`
      );

      // Get the subscription. The first item is the plan the user subscribed to.
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const itemId = subscription.items.data[0].id;

      // Generate API key
      const { apiKey, hashedAPIKey } = generateAPIKey();
      console.log(`User's API Key: ${apiKey}`);
      console.log(`Hashed API Key: ${hashedAPIKey}`);

      // Store the API key in your database.
      customers[customerId] = {
        apikey: hashedAPIKey,
        itemId,
        active: true,
      };
      apiKeys[hashedAPIKey] = customerId;

      break;
    case 'invoice.paid':
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.
      break;
    case 'invoice.payment_failed':
      // The payment failed or the customer does not have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      break;
    default:
    // Unhandled event type
  }

  res.sendStatus(200);
});

// Get information about the customer
app.get('/customers/:id', (req, res) => {
  var customerId = req.params.id;
  var account = customers[customerId];
  if (account) {
    res.send(account);
  } else {
    res.sendStatus(404);
  }
});

// Make a call to the API
app.get('/api', async (req, res) => {
  var { apiKey } = req.query;
  // const apiKey = req.headers['X-API-KEY'] // better option for storing API keys

  if (!apiKey) {
    res.sendStatus(400); // bad request
  }

  var hashedAPIKey = hashAPIKey(apiKey);

  var customerId = apiKeys[hashedAPIKey];
  var customer = customers[customerId];

  if (!customer || !customer.active) {
    res.sendStatus(403); // not authorized
  } else {

    // Record usage with Stripe Billing
    var record = await stripe.subscriptionItems.createUsageRecord(
      customer.itemId,
      {
        quantity: 1,
        timestamp: 'now',
        action: 'increment',
      }
    );
    res.send({ data: '🔥🔥🔥🔥🔥🔥🔥🔥', usage: record });
  }
});

app.get('/usage/:customer', async (req, res) => {
  var customerId = req.params.customer;
  var invoice = await stripe.invoices.retrieveUpcoming({
    customer: customerId,
  });

  res.send(invoice);
});

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

module.exports = app;
