var path = require('path');
var fs = require('fs');
var _data = require('./data');
//joining path of directory 
var directoryPath = path.join(__dirname+'/../.data/products');
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    var data = [];
    //listing all files using forEach
    files.forEach(function (file) {
        var s;
        // Do whatever you want to do with the file
        s = file.split('.')[0];
        data += _data.read('products',s)+".";
    });
    return_data = data.split(".");
    console.log(return_data);
});