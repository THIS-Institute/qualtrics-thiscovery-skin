const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const { debounce } = require('lodash');
const debug = require('debug')('thisco:slideshow.js');

module.exports = function(){
    Bliss.$('.Skin .thisco-slideshow, .thisco-survey .thisco-slideshow').forEach(el=>{
        // wrap elements
        // add left/right buttons
        // add following scroll bar
    });
}