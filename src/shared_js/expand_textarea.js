const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const { debounce } = require('lodash');
const debug = require('debug')('thisco:expand_textarea.js');

module.exports = function(){
    const expand = debounce((evt)=>{
        debug({evt});
        const ta = evt.target;
        ta._.style({
            "height" : `${ta.scrollHeight}px`
        });
    },500);
    Bliss.$('.Skin textarea, .thisco-survey textarea').forEach(el=>{
        debug(`Auto-expand on textarea :`,el);
        el.addEventListener('keyup',expand);
    });
}