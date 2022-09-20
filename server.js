const stripe = require('stripe')('sk_test_51LjZ3dEBctJ3Pe3kQJkBj4lLj6PlCqHudQRFbtCQP6JhqRSoY3pEo8dU4GzgpBhPWqbEDvrgR44CP0hHIx1zrec600Zbj9yzB1');
const express = require('express');
const app = express();
app.use(express.static('public'));

const YOUR_DOMAIN = 'https://jetapi-pro.herokuapp.com/';

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: '{{PRICE_ID}}',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success.html`,
    cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    automatic_tax: {enabled: true},
  });

  res.redirect(303, session.url);
});
