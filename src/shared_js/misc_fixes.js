const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const debug = require('debug')('thisco:misc_fixes.js');

// misc hacks and fixes on question update

module.exports = function(){

    Bliss.$("span.LabelWrapper").forEach(el=>{
        el.addEventListener("click",(evt)=>{
            evt.stopPropagation();
            const label = Bliss("label",evt.target);
            debug({label});
            if (label) label.click();
        });
    });

};