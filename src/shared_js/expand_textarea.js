const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const { debounce } = require('lodash');

module.exports = function(){
    const expand = debounce((evt)=>{
        console.debug({evt});
        const ta = evt.target;
        ta._.style({
            "height" : `${ta.scrollHeight}px`
        });
    },500);
    Bliss.$('.thisco-survey textarea').forEach(el=>{
        el.addEventListener('keyup',expand);
    });
}