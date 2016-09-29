var _ = require('lodash');
var Librivox = require('./librivox');
function GenreListModel(title) {
  this.title = title;
  var librivox = new Librivox;

  this.fiction = _.map(librivox.genres.fiction, function (obj) {
    return { title: obj, titleEscaped: escape(obj) };
  });
  this.nonFiction = _.map(librivox.genres.nonFiction, function (obj) {
    return { title: obj, titleEscaped: escape(obj) };
  });
}
module.exports = GenreListModel;
