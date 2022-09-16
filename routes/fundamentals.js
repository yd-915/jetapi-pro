var express = require('express');
var router = express.Router();
var fundamentals = require('../data/first');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json(fundamentals);
});

module.exports = router;
