// qualtrics-thiscovery-skin
//
// skin.js
// =======
//
// JS bundle for various DOM fixes, dev  etc.

// import { io } from "socket.io-client";
const io = require('socket.io-client');

// skinjob snippet - only if localStorage contains thisco_dev

if (localStorage.getItem("thisco_dev") !== null) {
    let skinsheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [ skinsheet ];
    if (typeof io !== "undefined") {
        const socket = io("ws://localhost:34567",{transports : ["websocket"]});
        socket.on("skinjob_update",(cssstring)=>{
            skinsheet.replaceSync(cssstring);
        });
    }
}

// shopping list

// update button text to Next Page, Previous Page  (*** EXCEPT THESE ARE DEFINABLE IN QUALTRICS ***])
