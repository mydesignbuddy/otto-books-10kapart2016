var _ = require('lodash');
var Librivox = require('./librivox');
function HomeModel(title) {
  this.title = title;
  var librivox = new Librivox;
// 6987 cause weird layout issues because thumbmail was not prefer square
  this.topBooks = [];
  this.topBooksIds = _.shuffle([133, 253, 661, 911, 381, 6697, 6866, 2356, 664, 5267, 10750, 365, 9592, 9481, 753, 59, 5307, 7043, 7581, 4590, 5235, 8493, 137, 10747, 4358, 6082, 4612, 5008, 9749, 10326, 6584, 6061, 7904, 894, 2614, 3158, 3608, 3762, 6376, 6987, 6891, 597, 5885, 801, 6936, 7304, 6010, 4676, 10091, 9909, 7500]).slice(0, 6);

  this.fiction = _.map(librivox.genres.fiction, function (obj) {
    return { title: obj, titleEscaped: escape(obj) };
  });
  this.nonFiction = _.map(librivox.genres.nonFiction, function (obj) {
    return { title: obj, titleEscaped: escape(obj) };
  });

  this.load = function (callback) {
    var self = this;
    librivox.getByBookIds(this.topBooksIds, function (data) {
      self.topBooks = data;
      callback(self);
    });
  }
}
module.exports = HomeModel;
