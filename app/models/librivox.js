var request = require('request-promise');
var _ = require('lodash');
var cheerio = require('cheerio');
var parser = require('parse-rss');
var slugify = require('slugify');

function Librivox() {
  this._apiBaseUrl = "https://librivox.org/api/feed/";
  this.getByGenre = function (genre, limit, callback) {
    var withThumbnails = true;
    limit = (limit != null || limit > 0) ? limit : 10;
    var apiurl = this._apiBaseUrl + 'audiobooks/limit/' + limit + '/format/json/extended/1/genre/' + escape(genre)
    request(apiurl).then(function (data) {
      var model = JSON.parse(data).books;
      var thumbnailurls = [];
      var promises = [];

      var urls = _.map(model, function (book) { return book.url_librivox; });
      model = _.map(model, function (obj) {
        return obj;
      });

      if (withThumbnails) {
        promises = urls.map(function (url_librivox) {
          console.log(url_librivox);
          return new Promise(function (resolve, reject) {
            console.log("url:" + url_librivox);

            if (url_librivox !== undefined) {
              try {
                request(url_librivox).then(function (html) {
                  $ = cheerio.load(html);

                  thumbnailurls.push({
                    url_librivox: url_librivox,
                    url_thumbnail: $('img[alt="book-cover-large"]').attr('src')
                  });
                  resolve();
                }).catch(function (err) {
                  // do noting for now
                  console.log("error getting thumbnail");
                  console.log(err);

                  resolve();
                });
              } catch (e) {
                thumbnailurls.push({
                  url_librivox: url_librivox,
                  url_thumbnail: null
                });
              }
            } else {
              thumbnailurls.push({
                url_librivox: url_librivox,
                url_thumbnail: null
              });
            }
          });
        });
      }

      Promise.all(promises)
        .then(function (results) {
          model = _.map(model, function (obj) {
            console.log(obj.title);
            if (withThumbnails) {
              var thumb = _.find(thumbnailurls, function (urls) {
                return (urls.url_librivox === obj.url_librivox);
              });
              if (thumb != undefined) {
                obj.url_thumbnail = thumb.url_thumbnail;
                obj.slug = slugify(obj.title);
              }
            }
            return obj;
          });
          callback(model);
        })
        .catch(function (err) {
          console.log("error getting during promiseall");
          console.log(err);
          callback({ error: err });
        });
    })
      .catch(function (err) {
        callback({ error: err });
      });
  };


  this.getBySearch = function (searchTerms, limit, callback) {
    var withThumbnails = true;
    limit = (limit != null || limit > 0) ? limit : 10;
    var apiurl = this._apiBaseUrl + 'audiobooks/limit/' + limit + '/format/json/extended/1/genre/' + escape(genre)
    request(apiurl).then(function (data) {
      var model = JSON.parse(data).books;
      var thumbnailurls = [];
      var promises = [];

      var urls = _.map(model, function (book) { return book.url_librivox; });
      model = _.map(model, function (obj) {
        return obj;
      });

      if (withThumbnails) {
        promises = urls.map(function (url_librivox) {
          console.log(url_librivox);
          return new Promise(function (resolve, reject) {
            console.log("url:" + url_librivox);

            if (url_librivox !== undefined) {
              try {
                request(url_librivox).then(function (html) {
                  $ = cheerio.load(html);

                  thumbnailurls.push({
                    url_librivox: url_librivox,
                    url_thumbnail: $('img[alt="book-cover-large"]').attr('src')
                  });
                  resolve();
                }).catch(function (err) {
                  // do noting for now
                  console.log("error getting thumbnail");
                  console.log(err);

                  resolve();
                });
              } catch (e) {
                thumbnailurls.push({
                  url_librivox: url_librivox,
                  url_thumbnail: null
                });
              }
            } else {
              thumbnailurls.push({
                url_librivox: url_librivox,
                url_thumbnail: null
              });
            }
          });
        });
      }

      Promise.all(promises)
        .then(function (results) {
          model = _.map(model, function (obj) {
            console.log(obj.title);
            if (withThumbnails) {
              var thumb = _.find(thumbnailurls, function (urls) {
                return (urls.url_librivox === obj.url_librivox);
              });
              if (thumb != undefined) {
                obj.url_thumbnail = thumb.url_thumbnail;
                obj.slug = slugify(obj.title);
              }
            }
            return obj;
          });
          callback(model);
        })
        .catch(function (err) {
          console.log("error getting during promiseall");
          console.log(err);
          callback({ error: err });
        });
    })
      .catch(function (err) {
        callback({ error: err });
      });
  };

  this.getByBookId = function (id, callback) {
    var tidy = require('htmltidy2').tidy;
    var apiurl = this._apiBaseUrl + 'audiobooks/format/json/id/' + parseInt(id)
    request(apiurl).then(function (data) {
      var model = JSON.parse(data).books[0];


      if (model.url_rss != null || model.url_rss != '') {
        parser(model.url_rss, function (err, rss) {
          if (err) {
            console.log(err);
            callback({ error: err });
            return;
          }
          model.tracks = [];
          model.url_thumbnail = null;

          if (rss != null) {
            if (rss.length != null || rss.length != 0) {
              for (var i = 0; i < rss.length; i++) {
                model.tracks.push({
                  id: i + 1,
                  title: rss[i].title,
                  media: {
                    mp3: rss[i].link
                  }
                })
              }
            }
          }

          tidy(model.description, {
            showBodyOnly: true,
            hideComments: false,
            indent: true,
            outputXhtml: true
          }, function (err, html) {
            model.description = html;
            if (model.url_librivox !== undefined) {
              try {
                request(model.url_librivox).then(function (html) {
                  $ = cheerio.load(html);

                  model.url_thumbnail = $('img[alt="book-cover-large"]').attr('src');

                  callback(model);
                }).catch(function (err) {
                  // do nothing for now
                  console.log("error getting thumbnail");
                  console.log(err);

                  callback(model);
                });
              } catch (e) {
                console.log("error getting thumbnail");
                console.log(e);
                callback(model);
              }
            } else {
              callback(model);
            }
          });
        });
      } else {
        callback({ error: "no audio" });
      }

    })
      .catch(function (err) {
        callback({ error: err });
      });
  };

  this.getByBookIds = function (booksIds, callback) {
    var books = [];
    var self = this;
    var promises = booksIds.map(function (booksId) {
      console.log(booksId);
      return new Promise(function (resolve, reject) {
        self.getByBookId(booksId, function (book) {
          if (books.error == undefined) {
            books.push(book);
          }
          resolve();
        });
      });
    });
    Promise.all(promises)
      .then(function (results) {
        model = _.map(books, function (obj) {
          obj.slug = slugify(obj.title);
          return obj;
        });
        console.log(JSON.stringify(model[0]))
        callback(model);
      })
      .catch(function (err) {
        console.log("error getting during promiseall");
        console.log(err);
        callback({ error: err });
      });
  };

  this.genres = {
    fiction: [
      "Children's Fiction",
      "Action & Adventure Fiction",
      "Crime & Mystery Fiction",
      "Culture & Heritage",
      "Dramatic Readings",
      "Epistolary Fiction",
      "Erotica",
      "Travel Fiction",
      "Family Life",
      "Fantastic Fiction",
      "Fictional Biographies & Memoirs",
      "General Fiction",
      "Historical Fiction",
      "Humorous Fiction",
      "Literary Fiction",
      "Nature & Animal Fiction",
      "Nautical & Marine Fiction",
      "Plays",
      "Poetry",
      "Religious Fiction",
      "Romance",
      "Sagas",
      "Satire",
      "Short Stories",
      "Sports Fiction",
      "Suspense, Espionage, Political & Thrillers",
      "War & Military Fiction",
      "Westerns"
    ],
    nonFiction: [
      "Children's Non-fiction",
      "War & Military",
      "Animals",
      "Art, Design & Architecture",
      "Bibles",
      "Biography & Autobiography",
      "Business & Economics",
      "Crafts & Hobbies",
      "Education",
      "Essays & Short Works",
      "Family & Relationships",
      "Health & Fitness",
      "History",
      "House & Home",
      "Humor",
      "Law",
      "Literary Collections",
      "Mathematics",
      "Medical",
      "Music",
      "Nature",
      "Performing Arts",
      "Philosophy",
      "Political Science",
      "Psychology",
      "Reference",
      "Religion",
      "Science",
      "Self-Help",
      "Social Science",
      "Sports & Recreation",
      "Technology & Engineering",
      "Travel & Geography",
      "True Crime",
      "Writing & Linguistics"
    ]
  };
}

module.exports = Librivox;
