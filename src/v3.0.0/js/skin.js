// survey js
// =========
//
// 3.0.0 is a forward-looking version for non-qualtrics surveys
// and standardised markup

const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us
const version = require('../../../package.json').version;
console.debug(`skin.js version ${version}`);
import { forIn, startCase } from 'lodash';

const BACK_LINK = window.location.search.includes("staging") ? "https://staging.thiscovery.org/my-tasks/" : "https://www.thiscovery.org/my-tasks/";

// skinjob_snippet

require('../../shared_js/skinjob_client.js')();

// form events

// text entry boxes within option inputs

$$(`input[type="radio"] + label > input, input[type="checkbox"] + label > input`).forEach(el=>{
    el.addEventListener('input',(evt)=>{
        const checkee = evt.currentTarget.parentNode.previousSibling;
        if (!checkee) return;
        if (evt.currentTarget.value == "") checkee.checked = false;
        else checkee.checked = true;
        return;
    });
})

// modals

console.debug('thisco modals');
require("../../shared_js/thisco_modals.js")();

// link buttons

console.debug('link buttons');
require("../../shared_js/link_buttons.js")();

// textareas

console.debug('expanding textareas');
require("../../shared_js/expand_textarea.js")();