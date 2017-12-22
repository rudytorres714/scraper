//import { Promise } from "mongoose";
//import { error } from "util";

var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require('cheerio');
var path = require('path');

var note = require('./models/note.js');
var article = require('./models/article.js');
var saved = require('./models/saved.js');
var PORT = 3000;
 mongoose.Promise = Promise;

 var app = express();
 app.use(logger("dev"));
 app.use(bodyParser.urlencoded({ extended: false }));
 app.use(express.static("public"));

 var db = mongoose.connection;
 var dataBaseUri = 'mongodb://localhost/scraper';

 if(process.env.MONGODB_URI)  {
   mongoose.connect(process.env.MONGODB_URI);
 }  else  {
   mongoose.connect(dataBaseUri)
 }

db.on('error', function(error)  {
  console.log('mongoose error: ', error);
});

db.once('open', function()  {
  console.log('mongoose connection is a go');
});

app.post('/saved:id', function(req, res)  {
  var newSaved = new Saved(req.body);
  newSaved.save(function(error, document) {
    if(error) {
      console.log(error);
    } else  {
      Article.findOneAndUpdate({
        "_id": req.params.id
      }, {
        "saved": true
      })
      .each(function(err, document) {
        if(err) {
          console.log(err);
        } else  {
          res.send(document);
        }
      })
    }
  })
});

app.get("/scrape", function(req, res) {
  request("http://www.ocregister.com/",function(error, response, html) {
    var $ = cheerio.load(html);

    $("header h5").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.saved = false;

      var entry = new Article(result);

      entry.save(function(err, document)  {
        if(err) {
          Console.log(err);
        } else  {
          console.log(document);
        }
      });
    });
    res.send('testing');
  });
});

app.get("/articles", function(req, res) {
  Article.find({}, function(req,res)  {
    if(error) {
      console.log(error);
    } else  {
      res.json(document);
    }
  });
});

app.get("/saved", function (req, res) {

  Article.find({
    "saved": true
  }, function (error, document) {
    if (error) {
      console.log(error);
    } else {
      res.json(document);
    }
  });
});

app.get("/savedArticles/:id", function (req, res) {
  console.log("Req.params.id: " + req.params.id);

  Article.findOne({
      "_id": req.params.id
    })
    .populate("note")
    .exec(function (error, document) {
      if (error) {
        console.log(error);
      } else {
        res.json(document);
      }
    });
});


app.post("/savedArticles/:id", function (req, res) {

  var newNote = new Note(req.body);
  newNote.save(function (error, document) {
    if (error) {
      console.log(error);
    } else {

      Article.findOneAndUpdate({
          "_id": req.params.id
        }, {
          "note": doc._id
        })
        .exec(function (err, document) {
          if (err) {
            console.log(err);
          } else {
            res.send(document);
          }
        });
    }
  });
});

app.get("/savedArticles", function (req, res) {
  res.sendFile(path.join(__dirname, "./public/savedArticles.html"));
});

app.listen(PORT, function () {
  console.log("App running on port " + PORT + ".");
});

