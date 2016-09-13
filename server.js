//setup Dependencies
var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    csrf = require('csurf'),
    session = require('express-session'),
    state = require('express-state'),
    flash = require('express-flash'),
    cluster = require('express-cluster'),
    compression = require('compression'),
    hbs = require('./lib/exphbs'),
    routes = require('./routes'),
    middleware = require('./middleware'),
    config = require('./config'),
    utils = require('./lib/utils'),
    port = (process.env.PORT || 8000);


//Comment out the line below if you want to enable cluster support.
setupServer();

//Uncomment the line below if you want to enable cluster support.
//cluster(setupServer);


function setupServer(worker) {
    var app = express(),
        server = app.listen(port, function () {
            console.log("Audiobook App is now listening on port " + server.address().port);
        }),
        router;

    //Setup Express App
    state.extend(app);
    app.engine(hbs.extname, hbs.engine);
    app.set('view engine', hbs.extname);
    app.enable('view cache');

    //Uncomment this if you want strict routing (ie: /foo will not resolve to /foo/)
    //app.enable('strict routing');

    //Change "App" to whatever your application's name is, or leave it like this.
    app.set('state namespace', 'App');

    //Create an empty Data object and expose it to the client. This
    //will be available on the client under App.Data.
    //This is just an example, so feel free to remove this.
    app.expose({}, 'Data');

    if (app.get('env') === 'development') {
        app.use(middleware.logger('tiny'));
    }

    // Set default views directory. 
    app.set('views', config.dirs.views);

    router = express.Router({
        caseSensitive: app.get('case sensitive routing'),
        strict: app.get('strict routing')
    });

    // Parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }))

    // Parse application/json
    app.use(bodyParser.json())

    // Parse cookies.
    app.use(cookieParser());

    // Session Handling
    app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));


    // Flash Message Support
    app.use(flash());

    //GZip Support
    app.use(compression());

    // Specify the public directory.
    app.use(express.static(config.dirs.pub));

    // Uncomment this line if you are using Bower, and have a bower_components directory.
    // Before uncommenting this line, go into config/index.js and add config.dirs.bower there.
    //app.use(express.static(config.dirs.bower));

    app.use(csrf());
    app.use(function (req, res, next) {
        var token = req.csrfToken();
        res.cookie('XSRF-TOKEN', token);
        res.locals._csrf = token;
        next();
    });

    // Use the router.
    app.use(router);


    ///////////////////////////////////////////
    //              Routes                   //
    ///////////////////////////////////////////

    var ia = require('internet-archive');
    var request = require('request-promise');
    var _ = require('lodash');
    var cheerio = require('cheerio');
    var parser = require('parse-rss');
    var path = require("path");
    var slugify = require('slugify')

    /////// ADD ALL YOUR ROUTES HERE  /////////
    router.get('/audiobooks', function (req, res, next) {
        var params = {
            q: 'collection:librivoxaudio',
            rows: '15',
            fl: []//['identifier,title,collection,downloads,description,date']
        };
        ia.advancedSearch(params, function (err, results) {
            if (err) console.error(err);
            res.locals.results = JSON.stringify(results.response, null, 2);

            res.render('audiobooks');
        });
    });

    /*
    List of fields to return:
        id
        title
        description
        url_text_source
        language
        copyright_year
        num_sections
        url_rss
        url_zip_file
        url_project
        url_librivox
        url_iarchive
        url_other
        totaltime
        totaltimesecs
        authors
        sections
        genres
        translators
    */

    // /api/home
    // /api/author/:author_name
    // /api/title/:book_title
    // /api/book/:book_id
    // /api/since/:unix_timestamp 

    var Librivox = {
        _apiBaseUrl: "https://librivox.org/api/feed/",
        getByGenre: function (genre, limit, callback) {
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
                                            url_thumdnail: $('img[alt="book-cover-large"]').attr('src')
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
                                        url_thumdnail: null
                                    });
                                }
                            } else {
                                thumbnailurls.push({
                                    url_librivox: url_librivox,
                                    url_thumdnail: null
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
                                    obj.url_thumbnail = thumb.url_thumdnail;
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
        },


        getBySearch: function (searchTerms, limit, callback) {
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
                                            url_thumdnail: $('img[alt="book-cover-large"]').attr('src')
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
                                        url_thumdnail: null
                                    });
                                }
                            } else {
                                thumbnailurls.push({
                                    url_librivox: url_librivox,
                                    url_thumdnail: null
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
                                    obj.url_thumbnail = thumb.url_thumdnail;
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
        },

        getByBookId: function (id, callback) {
            var tidy = require('htmltidy2').tidy;
            var apiurl = this._apiBaseUrl + 'audiobooks/format/json/id/' + parseInt(id)
            request(apiurl).then(function (data) {
                var model = JSON.parse(data).books[0];

                parser(model.url_rss, function (err, rss) {
                    if (err) {
                        console.log(err);
                        callback({ error: err });
                    }
                    model.tracks = [];
                    model.url_thumdnail = null;

                    for (var i = 0; i < rss.length; i++) {
                        model.tracks.push({
                            id: i + 1,
                            title: rss[i].title,
                            media: {
                                mp3: rss[i].link
                            }
                        })
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

                                        model.url_thumdnail = $('img[alt="book-cover-large"]').attr('src');
                                        
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


            })
                .catch(function (err) {
                    callback({ error: err });
                });
        },
        genres: {
            fiction: [
                "Children's Fiction",
                "Children's Non-fiction",
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
        }
    } //end of Librivox object

    router.get('/api/genre/:genre', function (req, res, next) {
        Librivox.getByGenre(req.params.genre, 5, function (data) {
            if (data.error) {
                console.log(data.error);
                res.status(500);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.send(data);
            }
        });
    });

    router.get('/', function (req, res, next) {

        var model = {};
        model.fiction = _.map(Librivox.genres.fiction, function (obj) {
            return { title: obj, titleEscaped: escape(obj) };
        });
        model.nonFiction = _.map(Librivox.genres.nonFiction, function (obj) {
            return { title: obj, titleEscaped: escape(obj) };
        });

        res.render('home', model);
    });


    router.get('/genre/:genre', function (req, res, next) {

        var model = {};

        Librivox.getByGenre(req.params.genre, 20, function (data) {
            if (data.error) {
                console.log(data.error);
                res.status(500);
            } else {
                model = { title: req.params.genre, books: data };
                res.render('genre', model);
            }
        });
    });

    router.get('/bookcover/:name', function (req, res, next) {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.sendFile(path.join(__dirname, 'public/images/audio-book.svg'));
    });

    router.get('/player/:slug/:id', function (req, res, next) {
        Librivox.getByBookId(req.params.id, function (data) {
            //res.send(data);
            res.render('player', data);
        });
    });

    // The exposeTemplates() method makes the Handlebars templates that are inside /shared/templates/
    // available to the client.
    router.get('/', [middleware.exposeTemplates(), routes.render('home')]);

    // Error handling middleware
    app.use(function (req, res, next) {
        res.render('404', { status: 404, url: req.url });
    });

    app.use(function (err, req, res, next) {
        res.render('500', {
            status: err.status || 500,
            error: err
        });
    });

    return server;
}

