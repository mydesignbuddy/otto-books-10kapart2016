var express = require('express'),
  router = express.Router(),
  HomeModel = require('../models/homeModel'),
  path = require('path');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {

  var model = new HomeModel('Public Domain Audio Books ');
  model.load(function (m) {
    res.render('index', m);
  });
});

router.get('/bookcover/:name', function (req, res, next) {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.sendFile(path.join(__dirname, '../../public/img/blank.svg'));
});
