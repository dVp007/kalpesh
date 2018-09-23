const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const datadase       = require('./app/config/db');
const app            = express()
const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(datadase.url, (err, database) => {
  if (err) return console.log(err)
                      
  // Make sure you add the database name and not the collection name
  var data = database.db("kalpesh")
  require('./app/routes')(app, data);

  app.listen(port, () => {
    console.log('We are live on ' + port);
  });               
})