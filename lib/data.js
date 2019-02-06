//Dependences
var fs = require('fs');
var path = require('path')
var helpers = require('./helpers');
//Container to the module
var lib = {}


lib.baseDir = path.join(__dirname+'/../.data/');
//functions of the modules

lib.create = function(dir,file,data,callback){
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err,fileDescriptor){
        var stringData = JSON.stringify(data)
        if(!err && fileDescriptor){
            //writing the data to the file
            fs.writeFile(fileDescriptor,stringData,function(err){
                if(!err){
                    //closing the file
                    fs.close(fileDescriptor,function(err){
                        if(!err){
                            callback(false)
                        }else{
                            callback('Error closing the file');
                        }
                    })
                }else{
                    callback('Error writing the new file');
                }
            })
        }else{
            callback('File already exist')
        }
    })    
}
//read from the file
lib.read = function(dir,file,callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err,data){
        if(!err){
            callback(err,helpers.parseJSONtoObject(data))
        }else{
            callback(err,data)
        }        
    })
}

//update data from inside a file
lib.update = function(dir,file,data,callback){
    //open the file for writing 
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            var stringData = JSON.stringify(data);
        }

        // truncate the file
        fs.truncate(fileDescriptor,function(err){
            if(!err){
                //Write to the file and close it
                fs.writeFile(fileDescriptor,stringData,function(err){
                    if(!err){
                        //closing the file
                        fs.close(fileDescriptor,function(err){
                            if(!err){
                                callback(false)
                            }else{
                                callback('Error closing the file')
                            }
                        });
                    }else{
                        callback('Error writing to an existing file ')
                    }
                })
            }else{
                callback('Error truncating file')
            }
        })
    })
}

//delete a file
lib.delete = function(dir,file,callback){
    //Unlink the file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
        if(!err){
            callback(false);
        }else{
            callback('Error deleting the file')
        }
    })
}
//modules to be exported
module.exports = lib;