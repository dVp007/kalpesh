/*
*` Server-related tasks
*
*/

//Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var fs = require('fs');
var stringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');

//Container
var server = {}


server.httpServer = http.createServer(function(req,res){
    server.unitedFunction(req,res)
})



server.httpsOptions = {
    'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
}

server.httpsServer = https.createServer(server.httpsOptions,function(req,res){
    server.unitedFunction(req,res)
})


server.unitedFunction = function(req,res){
    //get the url and parse it
    var parseUrl = url.parse(req.url,true);

    //get the path
    var path = parseUrl.pathname;
    var trimmedPath = path.replace(/\/+|\/+$/g,'');
    // get the http method
    var usrMethod = req.method.toLowerCase();
    // get the QueryString
    var usrQueryString = parseUrl.query;
    //get the headers
    var userHeaders = req.headers;
    //send the response
    //decoder
    var decoder = new stringDecoder('utf-8');
    var buffer = '';
    req.on('data',function(data){
        buffer += decoder.write(data);
    });


    req.on('end',function(){

        buffer += decoder.end()

        //choose the handler
        var choosenHandler = typeof(server.router[trimmedPath]) !== 'undefined'?server.router[trimmedPath]:handlers.notfound;

        //construct the data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : usrQueryString,
            'method' : usrMethod,
            'headers' : userHeaders,
            'payload' : helpers.parseJSONtoObject(buffer)
        }

        //route the header
        choosenHandler(data,function(statusCode,payload){
            // Use the Status Code called back by the handler
            statusCode = typeof(statusCode == 'number')?statusCode:200;

            // Use the payload called back by the handler
            payload = typeof(payload == 'object')?payload:{};
            
            // Convert the payload to a string
            var payloadStrng = JSON.stringify(payload)
            
            // Return the response
            res.setHeader('Content-Type','application/json')
            res.writeHead(statusCode)
            res.end(payloadStrng);

            // Log the request path
            console.log('Returning the response : ');
            console.log('Status Code : '+statusCode);
            console.log('payLoad : '+payloadStrng);
        });
    });
}
// server.router 
server.router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens':handlers.tokens,
    'checks': handlers.checks
};


// Init Script

server.init = function(){
    //Start the httpServer and have it listen to port 3000
    server.httpServer.listen(config.httpPort,function(){
        console.log("Environment : "+config.envName+" \nPort : "+config.httpPort);
    })

    //Start the httpsServer
    server.httpsServer.listen(config.httpsPort,function(){
        console.log("Environment : "+config.envName+" \nPort : "+config.httpsPort);
    })
}


//Export THe Server Module
module.exports = server;