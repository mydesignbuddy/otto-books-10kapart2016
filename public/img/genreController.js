var express = require('express'),
  router = express.Router(),
  GenresModel = require('../models/genresModel');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/genre/:genre', function (req, res, next) {
  var genre = req.params.genre;
  var model = new GenresModel('Public Domain Audio Books ', genre);
  model.load(function (data) {
    res.render('genre', data);
  });
});
