/*
*   Primary file for the API
*
*/

var server  = require('./lib/server');
//var workers = require('./lib/workers');

//Declare the app
var app = {};

//Initialize function

app.init = function(){
    // Start the server
    server.init();

    // Start the workers
    //workers.init();

};

//Execute
app.init();

//Execute the app
module.exports = app