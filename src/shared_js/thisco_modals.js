const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$

import A11yDialog from 'a11y-dialog';
import { uniqueId } from 'lodash';

const debug = require('debug')('thisco:thisco_modal.js');

/**
 * 
 * Uses [a11y-dialog](https://a11y-dialog.netlify.app/) to create modals
 * leveraging the `<dialog>` element
 * 
 * Set up as per [survey documentation](https://survey-docs.thiscovery.org/#/modals)
 * 
 * Adds a global method, {@link disposableModal} to the window object
 * 
 * @module
 */

module.exports = function(){

    /**
     * @global
     * @method disposableModal
     * 
     * @description Programmatic modals - creates a one-off blocking modal for messages - removes itself from DOM once closed
     * 
     * @param {Object} options
     * @param {string} options.bodyHtml body content of modal
     * @param {Object} options.modalParent optional parent element for the modal (defaults to body)
     * @param {string} options.modalClass optional class added to dialog-container
     */
    window.disposableModal = ({bodyHtml,modalParent=null,modalClass=""})=>{
        if (typeof bodyHtml !== "string") {
            throw "disposableModal called without content";
        }
        // create modal
        const newModalId = 'disposable_'+uniqueId();
        const modal = Bliss.create("div",{
            id : newModalId,
            className : "dialog-container "+modalClass,
            "aria-labelled-by" : newModalId+"_title",
            "aria-hidden" : "true",
            contents : [{
                tag: "div",
                className : "dialog-overlay",
                "data-a11y-dialog-hide":true
            },{
                tag: "div",
                role: "document",
                className: "dialog-content",
                contents : [{
                    tag: "div",
                    className: "dialog-header",
                    contents : [{
                        tag: "button",
                        className: "close-dialog-button",
                        type: "button",
                        "aria-label":"Close dialog",
                        "data-a11y-dialog-hide":true,
                        innerHTML: "&times;&nbsp;Close"
                    }]
                },{
                    tag: "div",
                    className : "dialog-body",
                    innerHTML : bodyHtml
                }]
            }]   
        });
        if (modalParent!==null) modalParent.appendChild(modal); else document.body.appendChild(modal);
        const dialog = new A11yDialog(modal);
        dialog.show();
        dialog.on('hide',()=>{
            dialog.destroy();
        }); // one-off modal
    };

    const dialogs = Bliss.$("dialog").forEach(el=>{
        if (el.close) el.close(); // close all dialogs on setup
        const open_link = Bliss.$(`a[href="modal?${el.id}"]`)[0];
        if (!open_link) {
            console.warn("Dialog element included but has no anchor connected to open it");
            return;
        }

        // replace dialog with a11y-dialog markup 
        const modal = Bliss.create("div",{
            id : el.id,
            className : "dialog-container",
            "aria-labelled-by" : el.id+"_title",
            "aria-hidden" : "true",
            contents : [{
                tag: "div",
                className : "dialog-overlay",
                "data-a11y-dialog-hide":true
            },{
                tag: "div",
                role: "document",
                className: "dialog-content",
                contents : [{
                    tag: "div",
                    className: "dialog-header",
                    contents : [{
                        tag: "button",
                        className: "close-dialog-button",
                        type: "button",
                        "aria-label":"Close dialog",
                        "data-a11y-dialog-hide":true,
                        innerHTML: "&times;&nbsp;Close"
                    }]
                },{
                    tag: "div",
                    className : "dialog-body",
                    innerHTML : el.innerHTML
                }]
            }]   
        });

        // set link
        open_link._.set({
            "data-a11y-dialog-show" : el.id,
            "name":`modalOpener-${el.id}`
        });
        open_link.removeAttribute('href');

        el.parentNode.appendChild(modal);
        el.remove();

        const dialog = new A11yDialog(modal);
    
    });
}