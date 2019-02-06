/*
* Helpers for various tasks
*
*/
// Dependencies
var crypto  = require('crypto');
var config = require('./config');


// Containers for all the helpers
var helpers = {}

// Hashing with sha256
helpers.hash = function(str){
    if(typeof(str)=='string' && str.length > 0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    } else{
        return false;
    }
}

//to convert Json to Object
helpers.parseJSONtoObject = function(str){
    try{
        var obj = JSON.parse(str)
        return obj; 
    }catch(e){
        return {};
    }
}
//to create RandomString
helpers.createRandomString = function(strNum){
    var strNum = typeof(strNum)=="number"&&strNum<=20?strNum:false;
    if(strNum){
    //possible character string
    var possibleCharacters = "abcdefghijklmnopqrstuvwxyz1234567890";
        //Main String
        var str = ""
        //pick a random
        for(var i = 1;i<=strNum;i++){
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
            str+=randomCharacter;
        }
    }
    return str;
}


module.exports = helpers;
