// survey js
// =========
//
// 3.0.0 is a forward-looking version for non-qualtrics surveys
// and standardised markup

const io = require('socket.io-client');
const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us
const version = require('../../../package.json').version;
console.debug(`skin.js version ${version}`);
import { forIn, startCase } from 'lodash';

const BACK_LINK = window.location.search.includes("staging") ? "https://staging.thiscovery.org/my-tasks/" : "https://www.thiscovery.org/my-tasks/";

// can support skinJob?

let supportSJ = false, skinsheet;

try {
    skinsheet = new CSSStyleSheet();
    supportSJ = true;
} catch (error) {
    if (error instanceof TypeError) {
        console.warn("CSSStyleSheet not supported in this browser");
    }
    else {
        console.error(error);
    }
}

// skinjob snippet - only if localStorage contains thisco_dev

if (supportSJ && (localStorage.getItem("thisco_dev") !== null)) {
    document.adoptedStyleSheets = [ skinsheet ];
    if (typeof io !== "undefined") {
        const socket = io("ws://localhost:34567",{transports : ["websocket"]});
        socket.on("skinjob_update",(cssstring)=>{
            skinsheet.replaceSync(cssstring);
        });
    }
}

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