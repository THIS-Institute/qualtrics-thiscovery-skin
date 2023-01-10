const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const debug = require('debug')('thisco:misc_fixes.js');

/**
 * 
 * Current fixes:
 * - passes clicks on `span.LabelWrapper` to the `label` element within
 * 
 * @module 
 */

// misc hacks and fixes on question update

module.exports = function(){

    Bliss.$("span.LabelWrapper").forEach(el=>{
        el.addEventListener("click",(evt)=>{
            evt.stopPropagation();
            const label = Bliss("label",evt.target);
            if (label) label.click();
        });
    });

};