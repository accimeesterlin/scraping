// Dependencies
const express = require("express");
const exphbs = require('express-handlebars');
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");



// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = require('bluebird');


// setting port as a variable
const port = process.env.PORT || 3000;

// Initialize Express
const app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));


// Make public a static dir
app.use(express.static("public"));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


// Database configuration with mongoose
mongoose.connect("mongodb://localhost/news_scraper_db");

const db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


var routes = require("./routes/frontend");
routes(app);


app.listen(port, function() {
  console.log("App running on port " + port);
});
