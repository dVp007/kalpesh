/*
* Create and export configuration variables
* 
*/

// Container for all the environments

var environments = {};
// Staging {default} environment
environments.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging',
    'hashingSecret' : 'thisIsSecret',
    'max_checks' : '5'
};

// production environment
environments.production = {
    'httpPort' : process.env.PORT,
    'httpsPort' : process.env.PORT,
    'envName' : 'production',
    'hashingSecret' : 'thisIsSecret',
    'max_checks' : '5'
};

var currentEnvironment = typeof(process.env.NODE) == 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';
var environmentToExport = typeof(environments[currentEnvironment]) == 'object'?environments[currentEnvironment]:environments.staging;
//Export the module
module.exports = environmentToExport;