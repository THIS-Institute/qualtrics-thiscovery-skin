// qualtrics-thiscovery-skin
//
// skin.js
// =======
//
// JS bundle for various DOM fixes, dev  etc.

// import { io } from "socket.io-client";
const io = require('socket.io-client');
const Bliss = require('blissfuljs');
import { forIn, startCase } from 'lodash';
self.B$ = Bliss;
self.B$$ = Bliss.$; // bliss jQuery conflict

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

// markup additions

// footer

const footer = B$("#Footer");
if (footer) {
    const logos = {
        "this_institute" : {
            "logo" : "https://www.thiscovery.org/wp-content/themes/thiscovery/img/this-logo.svg",
            "url" : "https://www.thisinstitute.cam.ac.uk/"
        },
        "university_of_cambridge" : {
            "logo" : "https://www.thiscovery.org/wp-content/themes/thiscovery/img/uni-cambridge.svg",
            "url" : "https://www.cam.ac.uk/"
        },
        "the_health_foundation" : {
            "logo" : "https://www.thiscovery.org/wp-content/themes/thiscovery/img/thf-black.svg",
            "url" : "https://www.health.org.uk"
        }
    };
    forIn(logos,(value,key)=>{
        footer.appendChild(B$.create('div',{
            className : 'logo-container',
            id : `logo_${key}`,
            contents: [{
                tag : "a",
                href : value.url,
                target : "_blank",
                contents: [{
                    tag : "img",
                    src : value.logo,
                    alt : startCase(key+"_logo")
                }]
            }]
        }))
    });

    // boilerplate
    footer.appendChild(B$.create("div",{
        className : "colophon",
        contents : [{
            tag :"ul",
            contents : [{
                tag : "li",
                className : "copyright",
                contents : `Thiscovery &copy; THIS Institute ${new Date().getFullYear()}`
            }]
        }]
    }))
}



// shopping list