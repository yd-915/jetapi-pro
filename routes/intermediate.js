var express = require('express');
var router = express.Router();
var intermediate = require('../data/second');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json(intermediate);
});

module.exports = router;
