/*
 *
 *   These are the dependecy handlers
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers')
var config = require('./config')

var handlers = {};

//Users
handlers.users = function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handlers._users[data.method](data,callback)
    }else{
        callback(405);
    }
}

//container for the users submethods
handlers._users = {};


//Users - post
//Required data : firstname, lastname, phone, password, tosAgreement
//Optional data : none
handlers._users.post = function(data,callback){
    console.log(data);
    // Check that all required fields are filled out
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length>0?data.payload.firstName:false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length>0?data.payload.lastName:false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length>10?data.payload.phone:false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length>0?data.payload.password:false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement?data.payload.tosAgreement:false;
    if(firstName && lastName && phone && password && tosAgreement){
        // Make sure user doesn't exist
        _data.read('user',phone,function(err,data){
            if(err){
                //Hash the password
                var hashedPassword = helpers.hash(password);
                if(hashedPassword){
                    //Create the userobject
                    var user = {
                        "firstName" : firstName,
                        "lastName" : lastName,
                        "phone" : phone,
                        "password" : hashedPassword,
                        "tosAgreement" : true
                    }
                    console.log(_data);
                // put it in the users directory
                _data.create('user',phone,user,function(err){
                    if(!err){
                        callback(200,{})
                    }else{
                        console.log(err)
                        callback(500,{'Error' : 'Could not create the new user'})
                    }
                })
                }else{
                callback(500,{'Error' : 'Could not hash the user\'s Password'});           
                }
            }else{
                callback(500,"user already exist")
            }
        });
    }else{
        callback(400,'Required fields are missing')
    } 
}
 
// Users - get
// Required Data - phone
handlers._users.get = function(data,callback){
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length>10?data.queryStringObject.phone.trim():false;
    if(phone){
        var tokenId = typeof(data.headers.token == 'string')?data.headers.token:false;
            //make sure the token id valid
            handlers._tokens.verfyToken(tokenId,phone,function(isValidToken){
            if(isValidToken){
                _data.read('user',phone,function(err,data){
                    if(!err && data){
                        delete data.password;
                        callback(200,data);
                    }else{
                        callback(404,{"Error":"phone number not found"})
                    }
                }) 
            }else{
                callback(403,{"Error":"Invalid Token"})
            }
        })    
    }else{
        callback(400,{"Error":"Required field not found"})
    }
}

// Users - put
// Requested Data - phone
// Optional fields - firstName , lastName , password
handlers._users.put = function(data,callback){
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length>0?data.payload.firstName:false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length>0?data.payload.lastName:false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length>10?data.payload.phone:false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length>0?data.payload.password:false;
    if(phone && (firstName || lastName || passwords)){
        //Authenticate Users
        var tokenId = typeof(data.headers.token == 'string')?data.headers.token:false;
        //make sure the token id valid
        handlers._tokens.verfyToken(tokenId,phone,function(isValidToken){
            if(isValidToken){
                _data.read('user',phone,function(err,userData){
                    if(!err){
                        if(firstName){
                            userData.firstName = firstName
                        }
                        if(lastName){
                            userData.lastName = lastName
                        }
                        if(password){
                            userData.password = helpers.hash(password);
                        }
                        _data.update('user',phone,userData,function(err){
                            if(!err){
                                callback(200,{});
                            }else{
                                callback(500,{"Error":"Error Updating file"})
                            }
                        })
                    }else{
                        callback(500,{"Error":"Phone not found"});
                    }
                })
            }else{
                callback(403,{"Error":"Invalid Token"})
            }
        })
    }else{
        callback(400,{"Error":'Required field not found'});
    }
}
// Users - delete
// Required field - phone 
//@toDo remove all files associated with the user
handlers._users.delete = function(data,callback){
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length>10?data.payload.phone.trim():false;
    if(phone){
        //Authenticate Users
        var tokenId = typeof(data.headers.token == 'string')?data.headers.token:false;
        //make sure the token id valid
        handlers._tokens.verfyToken(tokenId,phone,function(isValidToken){
            if(isValidToken){
                _data.delete('user',phone,function(err){
                    if(!err){
                        callback(200,{});
                    }else{
                        callback(500,{'Error':'Phone not found'})
                    }
                })
            }else{
                callback(403,{"Error":"Token Invalid"})
            }
        })
    }else{
        callback(400,{'Error':'Required field not found'})
    }
}


//Tokens
handlers.tokens= function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handlers._tokens[data.method](data,callback)
    }else{
        callback(405);
    }
}

//Container for tokens
handlers._tokens = {}

//Tokens - Post
//Required fields - phone,password
handlers._tokens.post = function(data,callback){
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length>10?data.payload.phone:false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length>0?data.payload.password:false;
    if(password && phone){
        _data.read('user',phone,function(err,userData){
            //make sure that tokens are not created
            if(!err && userData){  
                //hash the sent password and compare it to the userData password
                var compare = helpers.hash(password)==userData.password?true:false
                if(compare){
                    //if valid then create a Token with random name and set an expiration date of 1 hour
                    var tokenId = helpers.createRandomString(20)
                    var expires = Date.now()+1000*60*60
                    var tokenObject = {
                        'phone':phone,
                        'id':tokenId,
                        'expiry':expires
                    }
                    _data.create('tokens',tokenId,tokenObject,function(err){
                        if(!err){   
                            callback(200,tokenObject);
                        }else{
                            callback(500,{"Error":"tokens not created"})
                        }
                    })
                }else{
                    callback(400,{"Error":"Password is not valid"})
                } 
            }else{
                callback(400,{"Error":"User is invalid"})
            }
        })   
    }else{
        callback(400,{"Error": "Required fields are missing"})
    }   
}


//Tokens - Get
//Required fields - tokenId
handlers._tokens.get = function(data,callback){
    var id = typeof(data.queryStringObject.id) == 'string'?data.queryStringObject.id.trim():false;
    if(id){
        _data.read('tokens',id,function(err,data){
            if(!err && data){
                callback(200,data);
            }else{
                callback(404,{"Error":"Token Id  not found"})
            }
        })
    }else{
        callback(400,{"Error":"Required field not found"})
    }
}


//Tokens - Put
//Required fields - id,extend
handlers._tokens.put = function(data,callback){
    var id = typeof(data.payload.id) == 'string'?data.payload.id.trim():false;
    var extend = typeof(data.payload.extend) == 'boolean'?true:false;
    if(id && extend){
        _data.read('tokens',id,function(err,data){
            if(!err && data){
                console.log(data.expiry)
                data.expiry += 1000*60*60;
                console.log(data.expiry)
                _data.update('tokens',data.id,data,function(err){
                    if(!err){
                        callback(200,{})
                    }else{
                        callback(500,{"Error":"Token not updated"})
                    }
                })
            }else{
                callback(400,{"Error":"Token not found"})
            }
        })
    }else{
        callback(400,{'Error':'Required fields not there'})
    }

}


//Tokens - Delete
//Required fields - id
handlers._tokens.delete = function(data,callback){
    var id = typeof(data.payload.id) == 'string'?data.payload.id.trim():false;
    if(id){
        _data.delete('tokens',id,function(err){
            if(!err){
                callback(200,{});
            }else{

                callback(500,{'Error':'Id not found'})
            }
        })
    }else{
        callback(400,{'Error':'Required field not found'})
    }
}

//Verify if the token is valid for a given user
handlers._tokens.verfyToken = function(id,phone,callback){
    _data.read('tokens',id,function(err,data){
        if(!err && data){
            //Compare phone with data recieved
            var compare = data.phone==phone && Date.now() < data.expiry?true:false
            callback(compare);
        }else{
            callback(false)
        }
    })
}
// ************************************ Checks *****************************************************************
handlers.checks= function(data,callback){
    console.log('Checkpoint 1')
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handlers._checks[data.method](data,callback)
    }else{
        callback(405);
    }
}

//Container for check
handlers._checks = {};

//Checks - post
//Required fields - protocol,methods,successCodes,timeoutSeconds,url
//Optional fields - none
handlers._checks.post = function(data,callback){
    var protocol = typeof(data.payload.protocol) == 'string' && ['http','https'].indexOf(data.payload.protocol) != -1?data.payload.protocol:false;
    var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof(data.payload.method) == 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds){
        //check the tokens from the heading
        var tokenId = typeof(data.headers.token == 'string')?data.headers.token:false;
        
        _data.read('tokens',tokenId,function(err,tokenData){
            if(!err && tokenData){
                var userPhone = tokenData.phone;
                _data.read('user',userPhone,function(err,userData){
                    if(!err && userData){
                        var userChecks = userData.checks = typeof(userData.checks)=='object' && userData.checks instanceof Array?userData.checks:[];
                        //check if the user has max checks
                        if(userChecks.length < config.max_checks){
                            //Create check id
                            var checkId = helpers.createRandomString(20)
                            //create check Object
                            var checkObj = {
                                'id':checkId,
                                'protocol':protocol,
                                'url':url,
                                'method':method,
                                'sucessCodes':successCodes,
                                'timeoutSeconds':timeoutSeconds,
                                'userPhone':userPhone
                            }
                            _data.create('checks',checkId,checkObj,function(err){
                                if(!err){
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);
                                    _data.update('user',userPhone,userData,function(err){
                                        if(!err){
                                            callback(200,checkObj);
                                        } else {
                                             callback(500,{"Error":"Could not update the users data"})
                                        }
                                    })
                                } else {
                                    callback(500,{"Error":"Cannot create checks"})
                                }
                            })
                        } else{
                            callback(400,{"Error":"User exceded max-checks ("+config.max_checks+")"})
                        }
                    } else {
                        callback(403)
                    }
                }) 
            } else{
                callback(403)
            }
        })
    } else {
        callback(400,{"Error":"Required fields are missing"})
    }
}
//Checks - get
//Required fields - id 
//Optional fields - none
handlers._checks.get = function(data,callback){
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.length>0?data.queryStringObject.id.trim():false;
    if(id){
    }
}
//Checks - put
//Required fields - 
//Optional fields - none
handlers._checks.put = function(data,callback){

}
//checks - delete
//required fields - id
//Optional fields - none
handlers._checks.delete = function(data,callback){
    var id = typeof(data.payload.id) == 'string'?data.payload.id.trim():false;
    if(id){
        //Authenticate Users
        var tokenId = typeof(data.headers.token == 'string')?data.headers.token:false;
        //make sure the token id valid
        handlers._tokens.verfyToken(tokenId,phone,function(isValidToken){
            if(isValidToken){
                _data.read('checks',id,function(err,checkData){
                    if(!err && checkData){
                        _data.delete('checks',id,function(err){
                            if(!err){
                                callback(200,{})
                            } else {
                                callback(400,{"Errror":"check Not Deleted"})
                            }
                        })
                    } else {
                        callback(400,{"Error":"checks Not found"})
                    }
                })
            } else {
                callback(400,{"Error":"Token Invalid"})
            }
        })
    } else {
        callback(400,{"Error":"Required Fields not specified"})
    }
}
// ************************************Product handler*****************************************************************
//Prodduct
handlers.product = function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handlers._product[data.method](data,callback)
    }else{
        callback(405);
    }
}

//container for the users submethods
handlers._product = {};


//Products - post
//Required data : name, beaconId, description, price, quantity, phone 
//Optional data : none
//@toDo Check if BeaconId is existing, remove Phone,
handlers._product.post = function(data,callback){
    console.log(data);
    // Check that all required fields are filled out
    var name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length>0?data.payload.name:false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length>10?data.payload.phone:false;
    var beaconId = typeof(data.payload.beaconId) == 'string' && data.payload.beaconId.trim().length>0?data.payload.beaconId:false;
    var description = typeof(data.payload.description) == 'string'?data.payload.description:false;
    var price = typeof(data.payload.price) == 'string' && data.payload.price.trim().length>0?data.payload.price:false;
    var quantity = typeof(data.payload.quantity) == 'string' && data.payload.quantity?data.payload.quantity:false;
    if(name && beaconId && description && price && quantity){
        if(!phone){
            //Authenticate Users
            var tokenId = typeof(data.headers.token == 'string')?data.headers.token:false;
            //Make sure the token id valid
            handlers._tokens.verfyToken(tokenId,phone,function(isValidToken){
            if(!isValidToken){
                var productId = helpers.createRandomString(10)
                //Create the productobject
                var product = {
                    "productId" : productId,
                    "name" : name,
                    "beaconId" : beaconId,
                    "description" : description,
                    "price" : price,
                    "quantity" : quantity
                }
                console.log(data);
                // put it in the users directory
                _data.create('products',productId,product,function(err){
                    if(!err){
                        callback(200,{})
                    }else{
                        console.log(err)
                        callback(500,{'Error' : 'Could not create the new user'})
                    }
            })
            }else{
                    callback(403,"Invalid Token")
            }
            })
        }else{
            callback(400,"Phone number not valid")
        }
    }else{
        callback(404,"Required Columns not FOund")
    } 
}
 
// Product - get
// Required Data - productId
handlers._product.get = function(data,callback){
        var productId = typeof(data.queryStringObject.productId == 'string')?data.queryStringObject.productId:false;
        console.log(productId)
        var tokenId = typeof(data.headers.token == 'string')?data.headers.token:false;
            //make sure the token id valid
            _data.read("tokens",tokenId,function(err,tokenData){
            if(!err){
                _data.read('products',productId,function(err,data){
                    if(!err){
                        callback(200,data);
                    }else{
                        callback(404,{"Error":"Product not found"})
                    }
                }) 
            }else{
                callback(403,{"Error":"Invalid Token"})
            }
        })    
}
//@todo product put 
// Product - put
// Requested Data - phone
// Optional fields - firstName , lastName , password


// Product - delete
// Required field - productId 
//@toDo remove all files associated with the product
handlers._product.delete = function(data,callback){
    var productId = typeof(data.payload.productId == 'string')?data.payload.productId:false;
    console.log(productId)
    if(productId){
        //Authenticate Users
        var tokenId = typeof(data.headers.token == 'string')?data.headers.token:false;
        //make sure the token id valid
        _data.read('tokens',tokenId,function(err,tokenId){
            if(!err){
                _data.delete('products',productId,function(err){
                    if(!err){
                        callback(200,{"Message":"Product deleted"});
                    }else{
                        callback(500,{'Error':'Product not found'})
                    }
                })
            }else{
                callback(403,{"Error":"Token Invalid"})
            }
        })
    }else{
        callback(400,{'Error':'Required field not found'})
    }
}
// ************************************Beacon Handler*****************************************************************
handlers.beacon = function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handlers._beacon[data.method](data,callback)
    }else{
        callback(405);
    }
}

//Container for the beacon submethods
handlers._beacon = {};

//Beacon - post
//Required data : productId,beaconId 
handlers._beacon.post = function(data,callback){
    console.log("inside Post : ",data.payload);
    // Check that all required fields are filled out
    
    
    var productId = data.payload.productId;
    console.log(typeof(data.payload))
    var beaconId = data.payload.beaconId;
    console.log("Beacon ID:",data.payload.beaconId);
    if( productId && beaconId){
        //Authenticate Users
        var tokenId = typeof(data.headers.token == 'string')?data.headers.token:false;
        var phone = data.headers.phone;
        //Make sure the token id valid
        handlers._tokens.verfyToken(tokenId,phone,function(isValidToken){
            if(isValidToken){
                var beaconObj = {
                    "beaconId":beaconId,
                    "productIds":productId
                }
                _data.read('beacons',beaconId,function(data,err){
                    if(!err){
                        _data.create('beacons',beaconId,beaconObj,function(err){
                            if(!err){
                                callback(200,{});
                            }else{
                                callback(500,{"Error":"Could not create beacon"})
                            }
                        })
                    }else{
                        callback(400,{"Error":"Beacon Already exist"})
                    }
                })
            }else{
                callback(403,{"Error":"Token invalid"});        
            }
        })
    }else{
        callback(403,{"Error":"Required columns not found"})
    }
}           
    // Beacon - Get
    // Beacon - beaconId
    handlers._beacon.get = function(data,callback){
        var beaconId = data.queryStringObject.beaconId;
        console.log(beaconId);
        if(beaconId){  
            //Authenticate Users
            var tokenId = typeof(data.headers.token == 'string')?data.headers.token:false;
            var phone = data.headers.phone;
            //Make sure the token id valid
                var beaconData = JSON.parse(_data.read('beacons',beaconId));
                var return_data = [];
                for(value of beaconData.productIds){
                    return_data += _data.read('products',value)
                }
                callback(200,{return_data}); 
        }else{
            callback(404,{"Error":"Required id not found"})
        }
    }















// ************************************Ping handler*****************************************************************
handlers.ping = function(data,callback){
    //callback a http status code
    callback(200,{"Sucess":"Welcome"});
};

//Not found handler
handlers.notfound = function(data,callback){
    callback(404);
};

module.exports = handlers;