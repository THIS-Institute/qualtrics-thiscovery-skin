const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
// uses disposableModal method from thisco_modals.js

/**
 * 
 * For any element with `[data-explainer]` adds a '?' button which
 * fires disposableModal with attribute's value as the body HTML
 * 
 * @module
 */

module.exports = function(){
    Bliss.$("[data-explainer]").forEach(el=>{
        const explain = el.dataset.explainer || "";
        el.appendChild(Bliss.create("span",{
            className : "number-bubble",
            style : {
                'margin-left' : '1ch',
                'cursor' : 'pointer',
                'font-weight' : 'bold'
            },
            contents : "?",
            events : {
                click : (evt)=>{
                    disposableModal({
                        bodyHtml : `<p>${explain}</p>`
                    })
                }
            },
            "aria-hidden" : "true"
        }));
        el.appendChild(Bliss.create("span",{
            className : 'sr-only',
            contents : explain
        }));
    });
}