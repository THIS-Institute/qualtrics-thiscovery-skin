// survey js
// =========
//
// 3.0.0 is a forward-looking version for non-qualtrics surveys
// and standardised markup

const BACK_LINK = window.location.search.includes("staging") ? "https://staging.thiscovery.org/my-tasks/" : "https://www.thiscovery.org/my-tasks/";

// skinjob snippet - only if localStorage contains thisco_dev

if (localStorage.getItem("thisco_dev") !== null) {
    console.debug("Looking for skinjob server...");
    let skinsheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [ skinsheet ];
    if (typeof io !== "undefined") {
        const socket = io("ws://localhost:34567",{transports : ["websocket"]});
        socket.on("skinjob_update",(cssstring)=>{
            skinsheet.replaceSync(cssstring);
        });
    }
}