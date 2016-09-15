var express = require('express'),
  router = express.Router(),
  HomeModel = require('../models/homeModel'),
  path = require('path');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  var model = new HomeModel('Public Domain Audio Books ');
  res.render('index', model);
});

router.get('/bookcover/:name', function (req, res, next) {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.sendFile(path.join(__dirname, '../../public/img/loading.svg'));
});

router.get('/main.js', function(req, res)
{
    res.setHeader('Content-Type', 'application/javascript');
    res.send('window.onBeforeUnload=function(e){return e=e||window.event,console.log("delaying page exit"),setTimeout(function(){console.log("do something within the delay")},5e3),!0},!function(e){var t=function(e,t){if(document.querySelectorAll)t=document.querySelectorAll(e);else{var n=document,o=n.styleSheets[0]||n.createStyleSheet();o.addRule(e,"f:b");for(var l=n.all,r=0,u=[],i=l.length;i>r;r++)l[r].currentStyle.f&&u.push(l[r]);o.removeRule(0),t=u}return t},n=new Array,o=t("img.lazy");setInterval(function(){o=t("img.lazy"),n=[];for(var e=0;e<o.length;e++)n.push(o[e])},1e3)}(this);');
});
