const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const debug = require('debug')('thisco:link_buttons.js');

/**
 * 
 * Module looks for any `p` element containing an anchor element and nothing else
 * and adds `has-sole-link` and `link-button` classes respectively
 * 
 * @module
 */

module.exports = function(){
    Bliss.$(".Skin p, .thisco-survey p").forEach(el=>{
        let anchors = Bliss.$("a",el);
        if (anchors.length && (anchors.length == el.childNodes.length)) {
            // has just one link
            el.classList.add('has-sole-link');
            anchors[0].classList.add('link-button');
            anchors[0]._.set({
                role : "button"
            });
        }
    });
}