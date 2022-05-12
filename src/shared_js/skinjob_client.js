const io = require('socket.io-client');

module.exports = function(){
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
}