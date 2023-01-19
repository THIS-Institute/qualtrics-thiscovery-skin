const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
import { some, every, isFunction, uniqueId, flatten, values, trim, inRange } from 'lodash';
import numToWords from 'num-to-words';
const debug = require('debug')('thisco:validation.js');

const emitter = require('tiny-emitter/instance');

// in Qualtrics we can intercept the Next button
// by adding an event in the 'capture' phase on its parent
// and checking manually if it was the target

// validations
// take an (el) that is the parent of form inputs
// and evtType is why the validator is bvbeing checked (next|fieldsetBlur|valueChange)
// and return a message on failure or true if el passes

/**
 * Validation js sets up any custom validation by looking for relevant classes (see
 * survey-docs) and also a MutationObserver to keep an eye on Qualtrics validation messages.
 * 
 * If it receives any error message from the validation functions or Qualtrics watch, fires [addMessage]{@link event:addMessage} 
 * 
 * Bit more complicated than other modules, so see {@tutorial validation} for detailed explanation
 * 
 *
 * @module
 */

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
const FLOAT_REGEX = /(([-+])?[.,]\b(\d+)(?:[Ee]([+-])?(\d+)?)?\b)|(?:([+-])?\b(\d+)(?:[.,]?(\d+))?(?:[Ee]([+-])?(\d+)?)?\b)/;
const PATTERNS = {
    "email" : EMAIL_REGEX,
    "URL" : URL_REGEX,
    "number" : FLOAT_REGEX,
    "whole number" : /^[0-9,]+$/
};

/**
 * 
 * @param {Object} el - element
 * @returns {boolean} Does element have the class 'is-dirty'?
 */
const isDirty = (el)=>el.classList.contains('is-dirty');

/**
 * Checks the value of a containing element's `input[type='text']` against one of the hard-coded regexes
 * @param {*} el 
 * @param {string} pattern - email|URL|number|whole number - pattern to check against
 * @returns {boolean|string} - true if passes, message for display if not
 */
const checkPattern = (el,pattern = "email")=>{
    const value = trim(Bliss("input[type='text']",el).value);
    debug(pattern,PATTERNS[pattern],value,PATTERNS[pattern].test(value));
    return ["",null].includes(value) || PATTERNS[pattern].test(value) ? true : `This answer must be a valid ${pattern}`;
}

/**
 * For form fields - checks `label` element contents for pattern string, 
 * if it gets a match, checks the `input` value matching that label's `for` attribute
 * @param {*} el - element containing the inputs
 * @param {*} pattern - email|URL|number|whole number - pattern to check against
 * @returns {boolean|string} - true if passes, message for display if not
 */
const labelMatchCheckPattern = (el,pattern)=>{
    // for form fields:
    // look for labels matching pattern name
    // they must [for] a matching input id
    // then batch check them
    const labels = Bliss.$("label[for]",el).filter(lab=>{
        return !!lab.htmlFor && lab.innerText.toLowerCase().includes(pattern.toLowerCase()) && !!Bliss(`input[id='${lab.htmlFor}']`,el);
    }).map(({htmlFor})=>htmlFor);
    debug(`I see ${labels.length} fields to check`);
    if (!labels.length) return true;
    let allValid = true;
    labels.forEach(id=>{
        const value = trim(Bliss(`input[id='${id}']`,el).value);
        allValid = ["",null].includes(value) || PATTERNS[pattern].test(value) ? true : `These fields must contain a valid ${pattern}`;
    });
    return allValid;
}

/**
 * Looks on el for a classname matching `prefix-X' and returns X
 * @param {*} el 
 * @param {string} prefix - first part of classname to look for, e.g. `is-maximum`
 * @returns {string|boolean} returns the numeral after the given prefix it finds matching className or `false`
 */
const getClassedValue = (el,prefix)=>{
    const matcher = new RegExp(`${prefix}-[0-9]+`,'g');
    const firstMatch = el.className.match(matcher);
    return typeof (firstMatch || [])[0] !== 'string' ? false : firstMatch[0].replace(prefix+"-","");
}


// validations in object should be in order of priority
// first one to return a string rather than true or null wins
// validation functions take el - element and evtType 
const validations = {
    "is-required" : (el,evtType)=>{
        if (!isDirty(el) && (evtType !== "next")) return null;
        const noCheckedInputs = Bliss.$("input:checked",el).length < 1;
        const noInputValues = every(Bliss.$('input:not([type="checkbox"],[type="radio"]),textarea,select',el),(inp)=>{
            // special case for Q selects
            if ((inp.tagName == "SELECT") && inp.value.includes("~null")) {
                return false;
            }
            else {
                return ["",null].includes(inp.value);
            }
        });
        return !noCheckedInputs || !noInputValues ? true : "This question requires a response";
    },
    "all-consent-statements" : (el,evtType)=>{
        if (evtType !== "next") return null;
        return Bliss.$("input[type='checkbox']",el).length == Bliss.$("input[type='checkbox']:checked",el).length || "All mandatory consent statements must be checked";
    },
    "is-email" : (el,evtType)=>{
        if (!["next","fieldsetBlur"].includes(evtType)) return null;
        if (!isDirty(el)) return true;
        // is basic input
        if (Bliss.$("input[type='text']",el).length == 1) {
            return checkPattern(el,"email");
        }
        else {
            return labelMatchCheckPattern(el,"email");
        }
    },
    "is-url" : (el,evtType)=>{
        if (!["next","fieldsetBlur"].includes(evtType)) return null;
        if (!isDirty(el)) return true;
        // is basic input
        if (Bliss.$("input[type='text']",el).length == 1) {
            return checkPattern(el,"URL");
        }
        else {
            return labelMatchCheckPattern(el,"URL");
        }
    },
    "min-checked" : (el,evtType)=>{
        if (!["next","fieldsetBlur"].includes(evtType)) return null;
        if (!isDirty(el) && (evtType !== "next")) return null;
        // get minumum
        let min = getClassedValue(el,'min-checked');
        if (!isFinite(parseInt(min))) {
            console.error(`"min-checked" validator could not parse a minimum`);
            return null;
        } else { min = parseInt(min); }        

        let max = getClassedValue(el,'max-checked');
        const hasRange = isFinite(parseInt(max));
        const selected = Bliss.$("input:checked",el).length;
        max = hasRange ? parseInt(max) : max;

        debug({hasRange,min,max,selected});

        if (!hasRange && (selected >= min)) {
            return true;
        }
        else if (!hasRange) {
            return min == 1 ? 
            `Select at least ONE response for this question` : 
            `Select no fewer than ${numToWords(min).toUpperCase()} responses for this question.`;
        }
        else if (hasRange && inRange(selected,min,max+1)) {
            // is in range
            return true;
        }
        else {
            // is out of range
            return min == max ?
                `Select exactly ${numToWords(min).toUpperCase()} responses for this question.` : 
                `Select between ${numToWords(min).toUpperCase()} and ${numToWords(max).toUpperCase()} responses for this question.`;
        }
    },
    "max-checked" : (el,evtType)=>{
        if (!isDirty(el) && (evtType !== "next")) return null;
        // get minumum
        let max = getClassedValue(el,'max-checked');
        if (!isFinite(parseInt(max))) {
            console.error(`"max-checked" validator could not parse a maximum`);
            return null;
        } else { max = parseInt(max); }
        const selected = Bliss.$("input:checked",el).length;
        return selected > max ? `Select no more than ${numToWords(max).toUpperCase()} responses for this question.` : true;
    },
    "is-number" : (el,evtType)=>{
        if (!["next","fieldsetBlur"].includes(evtType)) return null;
        if (!isDirty(el)) return true;
        return checkPattern(el,"number");
    },
    "is-integer" : (el,evtType)=>{
        if (!["next","fieldsetBlur"].includes(evtType)) return null;
        if (!isDirty(el)) return true;
        return checkPattern(el,"whole number");
    },
    "is-minimum": (el,evtType,max)=>{
        if (!["next","fieldsetBlur"].includes(evtType)) return null;
        if (!isDirty(el)) return true;
        if (validations['is-integer'](el,evtType) !== true ) { return validations['is-integer'](el,evtType)}
        // get minumum
        let min = getClassedValue(el,'is-minimum');
        if (!max) max = getClassedValue(el,'is-maximum');
        min = parseInt(min);
        max = parseInt(max);
        const hasMax = isFinite(max);
        const hasMin = isFinite(min);
        const hasRange = hasMax && hasMin;
        const value = parseInt(Bliss("input",el).value);
        if (!hasMin && !hasRange && !hasMax) {
            console.error(`"is-minimum" validator could not parse a minimum`);
            return null;
        } else if (!hasRange && hasMin) { 
            debug({value,min,max,hasMin,hasMax});
            return value >= min ? true : `The response to this question should be greater than ${min}.`;
        } else if (!hasRange && hasMax) { 
            return value <= max ? true : `The response to this question should be ${max} or lower.`;
        } else {
            return inRange(value,min,max+1) ? true : `The response to this question should be within the range ${min}-${max}.`;
        }
    },
    "is-maximum": (el,evtType)=>{
        // passes most of business back to 'is-minimum' to avoid repetition
        let max = getClassedValue(el,'is-maximum');
        if (!isFinite(parseInt(max))) {
            console.error(`"is-maximum" validator could not parse a minimum`);
            return null;
        } 
        return validations['is-minimum'](el,evtType,max);
    }
}

/**
 * @function
 */
module.exports = function(){

    if (!QUALTRICS_PREVIEW || TEST_VALIDATION) {

        debug("Validation interception");

        // id all fieldsets to preserve order

        // registered validators
        let validators = {};

        Bliss.$('fieldset').forEach(fset=>{
            const validationId = `thisco-validators-${uniqueId()}`;
            fset.dataset.validationId = validationId;
            validators[validationId] = [];
        });

        // register validators
        // look for all validation classes and add as necessary

        Object.keys(validations).forEach(validationClass=>{

            const search = Bliss.$(`*[class*='validation-${validationClass}'], *[class*='thv-${validationClass}']`);
            if (search.length) {
                debug(`Attaching validation to ${validationClass}`);
                search.forEach(el=>{
                    let fset = el.tagName.toLowerCase() == "fieldset" ? el : el.closest('fieldset');
                    if (!fset) fset = el.parentNode;
                    let validationId = fset.dataset.validationId;
                    if (!validationId) {
                        validationId = `thisco-validators-${uniqueId()}`;
                        fset.dataset.validationId = validationId;
                    }
                    const checkIsDirty = ()=>{
                        // default added to any validated fieldset
                        // always returns true
                        const noCheckedInputs = Bliss.$("input:checked",fset).length < 1;
                        const noInputValues = every(Bliss.$('input:not([type="checkbox"],[type="radio"]),textarea',fset),(inp)=>{
                            return ["",null].includes(inp.value);
                        });
                        if (!(noCheckedInputs && noInputValues)) fset.classList.add("is-dirty");
                        return true;
                    };
                    const validator = (evtType)=>{
                        const result = validations[validationClass](fset,evtType);
                        const errorId = `errMsg${uniqueId()}`;
                        if (result == null) {
                            return true; // null results mean validation has been skipped
                        }
                        else if ((result !== true) && (!fset.classList.contains("contains-invalid"))) {
                            const errorMsg = el.dataset?.customInvalidMessage || result;
                            emitter.emit("addMessage",errorMsg,errorId);
                            fset.classList.add("contains-invalid");
                            fset.classList.remove("contains-valid");
                            fset.dataset.errorMessageId = errorId;
                            return errorMsg;
                        }
                        else if ((result === true) && (fset.classList.contains("contains-invalid"))) {
                            fset.classList.remove("contains-invalid");
                            fset.classList.add("contains-valid");
                            if (!!fset.dataset?.errorMessageId) {
                                emitter.emit(`killMessage:${fset.dataset.errorMessageId}`);
                                // fset.removeAttribute("data-error-message-id");
                            }
                        }
                        return true;
                    };
                    if (!validators[validationId].length) {
                        validators[validationId] = [checkIsDirty,validator];
                    }
                    else {
                        validators[validationId].push(validator);
                    }
                    fset.classList.add(`validation-watching-${validationClass}`);
                    // parse classes to add min/max etc
                    const matcher = new RegExp(`${validationClass}-[0-9]+`);
                    el.className.split(" ").forEach(cl=>{
                        if (matcher.test(cl)) {
                            fset.classList.add(cl.replace(/validation-|thv-/,""));
                            el.classList.remove(cl);
                        }
                        else if (cl == validationClass) {
                            el.classList.remove(cl);
                        }
                    });
                    return;
                });
            }
        });

        const runValidation = (evtType='next',validationId=null)=>{
            debug({validationId,validators});
            // get validators
            const running_validators = validationId == null ? flatten(values(validators)) : (validators[validationId] || []); 
            // validators run in order they have been added
            // first to fail wins and stops subsequent validators
            if (!running_validators.length) return true;
            let failMessage = true;
            const failure = some(running_validators,(validation)=>{
                if (!isFunction(validation)) {
                    throw("Validator is not a function");
                }
                failMessage = validation.call(null,evtType);
                return failMessage !== true;
            });
            return failure ? failMessage : true;
        };

        // add event listeners to fieldsets for 

        const fsets = Bliss.$('fieldset').filter(fset=>fset.className.includes("validation") || fset.className.includes("thv"));
        fsets.forEach(fset=>{
            fset.addEventListener('change',(evt)=>{
                const validationId = fset.dataset.validationId || null;
                runValidation('valueChange',validationId);
                evt.stopImmediatePropagation();
            });
            fset.addEventListener('focusout',(evt)=>{
                debug (!evt.relatedTarget,fset.contains(evt.relatedTarget));
                if (!evt.relatedTarget || (fset.contains(evt.relatedTarget))) return;
                debug('fieldset blurred');
                const validationId = fset.dataset.validationId || null;
                runValidation('fieldsetBlur',validationId);
                evt.stopImmediatePropagation();
            });
            const f = ()=>{if(fset.classList.contains("touched")) {runValidation('entry');} }
            fset.addEventListener('click',f);
            fset.addEventListener('keyup',f);
        });
        // add a validation intercept on click of Next Button
        // runs **all** validations

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