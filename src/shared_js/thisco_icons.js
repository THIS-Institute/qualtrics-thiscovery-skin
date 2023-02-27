const load = require('load-script');
const debug = require('debug')('thisco:icons.js');

module.exports = function(){

    load("https://thiscovery-public-assets.s3.eu-west-1.amazonaws.com/shared_modules/thisco-icons.js",{"type":"module"},(err)=>{
        if (err) {
            throw("Error fetching thisco-icons component",err);
        }
    });

};