// qualtrics-thiscovery-skin
//
// skin.js
// =======
//
// JS bundle for various DOM fixes, dev  etc.

// import { io } from "socket.io-client";
const io = require('socket.io-client');

// skinjob snippet - only if URL params contains &thisco_dev

let params = new URLSearchParams(window.location.search);
if (params.has("thisco_dev")) {
    let skinsheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [ skinsheet ];
    if (typeof io !== "undefined") {
        const socket = io("ws://localhost:34567",{transports : ["websocket"]});
        socket.on("skinjob_update",(cssstring)=>{skinsheet.replaceSync(cssstring);});
    }
}

