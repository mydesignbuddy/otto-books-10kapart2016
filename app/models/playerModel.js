var Librivox = require('./librivox');
function PlayerModel(bookId) {
  this.bookId = bookId;
  var librivox = new Librivox;

  this.load = function (callback) {
    librivox.getByBookId(this.bookId, function (data) {
      var results;
      if (data.error) {
        results.error = data.error;
      } else {
        results = data;
      }
      callback(results);
    });
  }
}
module.exports = PlayerModel;
