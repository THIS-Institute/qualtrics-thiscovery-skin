const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
import { uniqueId, noop } from 'lodash';
const debug = require('debug')('thisco:accordion.js');

/**
 * Basic accordion component
 */

const wrapElement = (el, wrapper) => {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    return wrapper;
}

module.exports = function(){
    Bliss.$(".thisco-accordion").forEach(el=>{
        // we're expecting a div containing two divs per drawer, label and content
        // get odd divs and make them labels
        const drawer = uniqueId("thisco-accordion-");
        const labels = Bliss.$("*:nth-child(odd)", el);
        debug(labels);
        labels.forEach(label=>{
            const button = document.createElement("button");
            wrapElement(label, button);
            button.classList.add("thisco-accordion-label");
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-controls", drawer);
            button.setAttribute("role", "button");
            button.addEventListener("click", function(e){
                e.preventDefault();
                const content = button.nextElementSibling;
                if (content.style.maxHeight !== "0px"){
                    content.style.maxHeight = "0px";
                    button.setAttribute("aria-expanded", "false");
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                    button.setAttribute("aria-expanded", "true");
                }
            });
            button.appendChild(Bliss.create("thisco-icon",{
                "icon": "cross"
            }))
            const content = wrapElement(button.nextElementSibling,document.createElement("div"));
            content.classList.add("thisco-accordion-content");
            content.setAttribute("aria-hidden", "true");
            content.setAttribute("aria-labelledby", drawer);
            content.style.maxHeight = "0px";
        });
    });
};