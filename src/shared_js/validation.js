const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const { some, isFunction } = require('lodash');

// makes use of disposableModal(html,destParent)

// in Qualtrics we can intercept the Next button
// by adding an event in the 'capture' phase on its parent
// and checking manually if it was the target

// registered validators
const validators = [];

// validations
// take an (el) that is the parent of form inputs
// and return a message on failure or true if el passes

const validations = {
    "all-consent-statements" : (el)=>{
        return Bliss.$("input[type='checkbox']",el).length == Bliss.$("input[type='checkbox']:checked",el).length || "All mandatory consent statements must be checked";
    }
}

module.exports = function(){

    console.debug("Validation interception");

    // register validators
    // look for all validation classes and add as necessary

    Object.keys(validations).forEach(validationClass=>{

        console.debug(`Attaching validation to ${validationClass}`);

        const search = Bliss.$(`.validation-${validationClass}`);
        console.debug({search});
        if (search.length) {
            search.forEach(el=>{
                let fset = el.tagName.toLowerCase() == "fieldset" ? el : el.closest('fieldset');
                if (!fset) fset = el.parentNode;
                const validator = ()=>{
                    const result = validations[validationClass](fset)
                    if (result !== true) {
                        const errorMsg = el.dataset?.customValidMessage || result;
                        disposableModal(errorMsg,fset);
                        return false;
                    }
                    return true;
                };
                validators.push(validator);
                el.classList.remove(`validation-${validationClass}`);
                return;
            });
        }

    });


    const runValidation = ()=>{
        // validators run in order they have been added
        // first to fail wins and stops subsequent validators
        if (!validators.length) return true;
        const failure = some(validators,(validation)=>{
            if (!isFunction(validation)) {
                throw("Validator is not a function");
            }
            return validation.call() === false;
        });
        return failure !== true;
    };


    const nextButton = Bliss("#NextButton");
    if (!nextButton) return;

    nextButton.parentNode.addEventListener('click',(evt)=>{
        if (evt.target.id == "NextButton") {
            const isValid = runValidation();
            console.debug({isValid});
            if (!isValid) {
                evt.stopImmediatePropagation();
                return false;
            }
        }
        return;
        
    },{capture:true})

};