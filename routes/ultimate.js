var express = require('express');
var router = express.Router();
var ultimate = require('../data/fifth');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json(ultimate);
});

module.exports = router;