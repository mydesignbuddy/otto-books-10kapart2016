var Librivox = require('./librivox');
function GenresModel(title, genre) {
  this.title = title;
  this.genre = genre;
  var librivox = new Librivox;

  this.load = function(callback){
    librivox.getByGenre(this.genre, 20, function (data) {
      if (data.error) {
        this.error = data.error;
      } else {
        this.books = data;
      }
      callback(this);
    });
  }
}
module.exports = GenresModel;
