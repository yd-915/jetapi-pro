var express = require('express');
var router = express.Router();
var elite = require('../data/third');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json(elite);
});

module.exports = router;
