var express = require('express');
var router = express.Router();
var checkout = require('../views/checkout');

/* GET users listing. */
router.get('/checkout', function(req, res, next) {
  res.json(checkout);
});

module.exports = router
