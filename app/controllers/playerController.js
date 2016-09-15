var express = require('express'),
  router = express.Router(),
  PlayerModel = require('../models/playerModel');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/player/:slug/:id', function (req, res, next) {
  var bookId = req.params.id;
  var model = new PlayerModel(bookId);
  model.load(function (data) {
    res.render('player', data);
  });
});
