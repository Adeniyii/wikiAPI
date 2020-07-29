// jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require("lodash");


const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("Public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const articleSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Article = mongoose.model("Article", articleSchema);


// CHAINED request handlers for all articles

app.route("/articles")
  // GET request handler
  .get(function(req, res) {
    Article.find({}, function(err, result) {
      if (!err) {
        if (result.length > 0) {
          res.send(result);
        } else {
          res.send("<h1>There are no results at this endpoint</h1>");
        }
      } else {
        console.log(err);
      }});
  })
  // POST request handler
  .post(function(req, res) {
    let postTitle = req.body.title;
    let postContent = req.body.content;

    const item = new Article({
      title: postTitle,
      content: postContent
    });
    item.save(function(err) {
      if (err) {
        res.send(err);
      } else {
        res.send("Your post was saved!");
      }});
  })
  // DELETE request handler
  .delete(function(req, res) {
    Article.deleteMany({}, function(err) {
      if (err) {
        res.send(err);
      } else {
        res.send("Delete successful!");
      }});
  });


// CHAINED request handlers for a specific article

app.route("/articles/:title")
  // GET request handler
  .get(function(req, res) {
    let userPath = req.params.title;
    Article.findOne({
      title: userPath
    }, function(err, result) {
      if (!err) {
        if (result) {
          res.send(result);
        } else {
          res.send("Article does not exist.");
        }
      } else {
        res.send(err);
      }});
  })

  // PUT request handler
  .put(function(req, res) {
    let userPath = req.params.title;
    Article.update({
        title: userPath
      }, {
        title: req.body.title,
        content: req.body.content
      },
      // overwrite first deletes all attributes in a document then inserts the update content
      // if set to false, the former attributes are set to null unless an update value is passed for it.
      // the RESTful convention dictates overwrite set to true.
      {
        overwrite: true
      },
      function(err) {
        if (!err) {
          res.send("Put request was successful.");
        } else {
          res.send(err);
        }});
  })

  // PATCH request handler
  .patch(function(req, res) {
    let userPath = req.params.title;
    Article.update(
      {title: userPath},
      {$set: req.body},
      function(err) {
        if (!err) {
          res.send("PATCH request was successful.");
        } else {
          res.send(err);
        }});
  })


  .delete(function(req, res) {
    let userPath = req.params.title;
    Article.deleteOne(
      {title: userPath},
      function(err) {
        if (!err) {
          res.send("Document deleted successfully.");
        } else {
          res.send(err);
        }
      });
  });




app.listen(3000, function() {
  console.log("Server started on localhost 3000");
});
