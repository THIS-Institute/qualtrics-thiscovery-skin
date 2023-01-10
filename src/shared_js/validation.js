const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
import { some, every, isFunction, uniqueId, uniq } from 'lodash';
const debug = require('debug')('thisco:validation.js');

const emitter = require('tiny-emitter/instance');

// in Qualtrics we can intercept the Next button
// by adding an event in the 'capture' phase on its parent
// and checking manually if it was the target

// validations
// take an (el) that is the parent of form inputs
// and evtType is why the validator is bvbeing checked (next|fieldsetBlur)
// and return a message on failure or true if el passes

/**
 * Validation js sets up any custom validation by looking for relevant classes (see
 * survey-docs) and also a MutationObserver to keep an eye on Qualtrics validation messages.
 * 
 * If it receives any error message from the validation functions or Qualtrics watch, fires [addMessage]{@link event:addMessage} 
 * 
 *
 * @module
 */

// validations in object should be in order of priority
const validations = {
    "is-required" : (el,evtType)=>{
        const noCheckedInputs = Bliss.$("input:checked",el).length < 1;
        const noInputValues = every(Bliss.$('input',el),(inp)=>{["",null].includes(inp.value)});
        debug({noCheckedInputs,noInputValues});
        return !noCheckedInputs && !noInputValues ? true : "This question requires a response";
    },
    "all-consent-statements" : (el,evtType)=>{
        return Bliss.$("input[type='checkbox']",el).length == Bliss.$("input[type='checkbox']:checked",el).length || "All mandatory consent statements must be checked";
    }
}

module.exports = function(){

    // registered validators
    let validators = [];

    if (!QUALTRICS_PREVIEW || TEST_VALIDATION) {

        debug("Validation interception");

        // register validators
        // look for all validation classes and add as necessary

        Object.keys(validations).forEach(validationClass=>{

            const search = Bliss.$(`.validation-${validationClass}, .thv-${validationClass}`);
            if (search.length) {
                debug(`Attaching validation to ${validationClass}`);
                search.forEach(el=>{
                    let fset = el.tagName.toLowerCase() == "fieldset" ? el : el.closest('fieldset');
                    if (!fset) fset = el.parentNode;
                    const validator = ()=>{
                        const result = validations[validationClass](fset);
                        const errorId = `errMsg${uniqueId()}`;
                        if ((result !== true) && (!fset.classList.contains("contains-invalid"))) {
                            const errorMsg = el.dataset?.customValidMessage || result;
                            emitter.emit("addMessage",errorMsg,errorId);
                            fset.classList.add("contains-invalid");
                            fset.dataset.errorMessageId = errorId;
                            return errorMsg;
                        }
                        else if ((result === true) && (fset.classList.contains("contains-invalid"))) {
                            fset.classList.remove("contains-invalid");
                            if (!!fset.dataset?.errorMessageId) {
                                emitter.emit(`killMessage:${fset.dataset.errorMessageId}`);
                                // fset.removeAttribute("data-error-message-id");
                            }
                        }
                        return true;
                    };
                    validators.push(validator);
                    debug({validators});
                    fset.classList.add(`validation-watching-${validationClass}`);
                    el.classList.remove(`validation-${validationClass}`);
                    return;
                });
            }

        });

        const runValidation = (evtType='next')=>{
            // validators run in order they have been added
            // first to fail wins and stops subsequent validators
            if (!validators.length) return true;
            let failMessage = true;
            const failure = some(validators,(validation)=>{
                if (!isFunction(validation)) {
                    throw("Validator is not a function");
                }
                failMessage = validation.call(null,evtType);
                return failMessage !== true;
            });
            return failure ? failMessage : true;
        };

        // add a validation intercept on click of Next Button

        const nextButton = Bliss("#NextButton");
        if (nextButton) {
            nextButton.parentNode.addEventListener('click',(evt)=>{
                if (evt.target.id == "NextButton") {
                    const validOrMessage = runValidation('next');
                    debug({validOrMessage});
                    const invFset = some(Bliss.$('fieldset'),(fset)=>fset.classList.contains('contains-invalid'));
                    // stop if ANY fieldsets on page are invalid
                    if ((validOrMessage !== true) || (invFset)) {
                        evt.stopImmediatePropagation();
                        return false;
                    }
                }
                return;            
            },{capture:true});
        }

        // add a validation on blurred fieldsets

        const fsets = Bliss.$('fieldset');
        fsets.forEach(fset=>{
            fset.addEventListener('focusout',(evt)=>{
                debug (!evt.relatedTarget,fset.contains(evt.relatedTarget));
                if (!evt.relatedTarget || (fset.contains(evt.relatedTarget))) return;
                debug('fieldset blurred');
                runValidation('fieldsetBlur');
            });
            const f = ()=>{if(fset.classList.contains("touched")) {runValidation('entry');} }
            fset.addEventListener('click',f);
            fset.addEventListener('keyup',f);
        });

        // add a MutationObserver to modalise any error message Qualtrics adds
        // NOT a great method but Qualtrics timing hard to divine here

        if (window.MutationObserver) {
            Bliss.$(".ValidationError").forEach(el=>{

                debug("Attaching an observer:",el);

                const callback = function(mutations,observer){
                    const currentText = el.innerText;
                    const isVisible = el.offsetParent !== null;
                    if ((currentText !== "") && isVisible) {
                        // disposableModal({bodyHtml:currentText,modalParent:el.parentNode});
                        emitter.emit("addMessage",currentText);
                        return;
                    }
                    return;
                };
        
                const observer = new MutationObserver(callback);
                observer.observe(el,{attributes:true});

                el._.style({
                    "opacity" : "0",
                    "height" : "0px",
                    "font-size" : "0px"
                })
        
            });
        }
    }

};