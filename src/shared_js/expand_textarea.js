const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
import { debounce } from 'lodash';
const debug = require('debug')('thisco:expand_textarea.js');

/**
 * Adds an expand function to all `textarea` tags so that they expand to scrollHeight
 * on any `keyup` event
 * @module
 */

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