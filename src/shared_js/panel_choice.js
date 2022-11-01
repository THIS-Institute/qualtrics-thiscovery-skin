const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const debug = require('debug')('thisco:panel_choice.js');

module.exports = function(){
    Bliss.$(".panel-choice").forEach(el=>{
        el.closest('fieldset').classList.add("panel-choice")
    });
}