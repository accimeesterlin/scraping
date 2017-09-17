
module.exports = function (app) {

// Requiring our Note and Article models
const Note = require("../models/Note.js");
const Article = require("../models/Article.js");

// Our scraping tools
const request = require("request");
const cheerio = require("cheerio");

app.get('/', function(req, res) {
	res.render('index');
}); 



// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {

  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);

      res.render("404");
    }
    // Or send the doc to the browser as a json object
    else {
      res.render("articles", {data: doc});
    }
  });

});


// This will get the articles we scraped from the mongoDB
app.get("/api", function(req, res) {

  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);

      res.render("404");
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });

});



// A GET request to scrape the wsj website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.wsj.com", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(html);
    // Now, we grab every h3 within a lead-story class, and do the following:
    $(".wsj-card-body").each(function(i, elementA) {


      // Save an empty result object
      const result = {};
//.lead-story h3
      // Add the text and href of every link, and save them as properties of the result object
      var title = $(this).children(".wsj-headline").text();
      var link = $(this).find(".wsj-headline-link").attr("href");
      var description = $(this).children(".wsj-summary").text();

      if(title !== undefined && link !== undefined && description !== undefined){
          if(title !== '' && link !== '' && description !== ''){
            result.title = title;
            result.link = link;
            result.summary = description;
            console.log("--------------------------------------------------------");
            console.log("--------------------------------------------------------");
            console.log("--------------------------------------------------------");

            console.log(result);
          }

      }

      

      // $(".wsj-summary p").each(function(i, elementB) {

      //     result.summary = $(this).children("p").attr("span");

      // })
      // console.log(result.title);
      // console.log(result.link);
      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      const entry = new Article(result);

      // // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});






// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});





// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  const newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});
};