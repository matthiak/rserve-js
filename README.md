# rserve-js-v1

RServe client in JavaScript

This node module will communicate with R/Rserve over TCP/IP socket, allowing user to evaluate R statements from JavaScript and get the result as JavaScript object.

It is based on this project: https://github.com/matthiak/rserve-js

But changes were made to properly support large dataarrays (larger 16 megabytes).

## Installation
    $ npm install rserve-js-v1
  
# Usage
    let Rserve = require("rserve-js-v1");
    
    let client = Rserve.connect("localhost", 6311, function() {
        console.log("Connected to Rserve.");
        
        client.eval("data(iris)", function(err, response) {
            if (err) {
                throw err;
            }
            console.log("'iris' table is loaded.");
            
            client.eval("dim(iris)", function(err, response) {
                if (err) {
                    throw err;
                }
                
                console.log(response.value); // shows dimension of iris table
            });
        });
    });

## Test
Tested on R version 3.2.3 and Rserve version 1.8.5.

## License
MIT
