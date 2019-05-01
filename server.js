// CODE GOES HERE

var express = require("express");
var path = require("path");
var connection = require("./db/connection");

// tells node to use express
var app = express();
// sets up 1st port
var PORT = process.env.PORT || 3000;
// sets up data parsing
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

// get all tables that aren't waiting
app.get("/api/tables", function(req, res) {
  connection.query("SELECT * FROM tables WHERE isWaiting = FALSE", function(err, dbTables) {
    res.json(dbTables);
  })
})

//get all tables that are not waiting 
app.get("/api/tables", function(req,res){
  connection.query("SELECT * FROM tables WHERE isWaiting = FALSE", function(err, dbTables) {
    res.json(dbTables);
  })
})

//save a new tables
app.post("/api/tables", function(req, res){
  connection.query("SELECT COUNT(IF(isWaiting = FALSE,1,NULL))'count' FROM tables", function(err, dbSeated) {
    if (err) throw err;
    if(dbSeated[0].count > 4) {
      req.body.isWaiting = true;
    }
    connection.query("INSERT INTO tables SET ?",req.body, function(err, result){
      if (err) throw err;

      connection.query("SELECT * FROM tables WHERE id =?", [result.insertId], function(err, dbTables){
        res.json(dbTables[0]);
      })
    })
  })
})
// Get all tables where isWaiting is true (waiting list)
app.get("/api/waitlist",function(req, res){
  connection.query("SELECT * FROM tables WHERE isWaiting = TRUE", function(err, dbTables) {
    res.json(dbTables);
  })
})

//clear all tables 
app.delete("/api/tables", function(req,res){
  connection.query("DELETE FROM tables", function(err, result) {
    if (err) throw err;
    res.json(result);
  })
})
// Render tables.html at the "/tables" path
app.get("/tables", function(req, res) {
  res.sendFile(path.join(__dirname, "./tables.html"));
});

//render reserve.html at the reserve path
app.get("/reserve", function(req,res){
  res.sendFile(path.join(__dirname, "./reserve.html"))
})

// All other paths serve the home.html page
app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "./home.html"));
});

app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});
