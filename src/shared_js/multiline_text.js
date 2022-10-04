const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const { isNull, isArray, last, debounce, uniqueId, isUndefined, findIndex, concat, unset, startsWith, isString } = require('lodash');
const debug = require('debug')('thisco:multiline_text.js');

const MULTILINE_VERSION = "1.0.0";

// this control condenses multi-line inputs into a single JSON array value
// eg. ["This","That","The other"]
// the inputs also prevent " to save hassle down the line

const DEBOUNCE_AMOUNT = 750;

const safeJSONparse = (input)=>{
    try {
        return JSON.parse(input);
    } catch (error) {
        return input;
    }
}

class Multiline {
    constructor (targetInput,options={}){
        if (!(targetInput instanceof HTMLInputElement)) {
            throw ('Cannot instantiate multiline without input element');
        }
        this.targetInput = targetInput;
        this.container = targetInput.parentNode;
        this.inputs = [];
        this.maxInputs = options.maxInputs || null;
        this.name = targetInput.name || `multiline_${uniqueId()}`;
        this.initialValue = targetInput.value || "";
        Bliss(targetInput)._.style({
            "opacity" : 0,
            "height": "0px",
            "font-size":"0px"
        });
        const { addInput, maxInputs } = this, self = this;
        if (this.initialValue == "") addInput.call(self);
        else if (!isArray(safeJSONparse(this.initialValue))) {
            addInput.call(self,this.initialValue);
        }
        else {
            const inputs = safeJSONparse(this.initialValue);
            debug ({inputs,maxInputs});
            (!isNull(maxInputs) ? inputs.slice(0,maxInputs) : inputs).forEach(input =>{
                addInput.call(self,input);
            });
            addInput.call(self);
        }
    }

    get values() {
        return Bliss.$(`.multiline-input`,this.container).map(inp=>inp.value).filter(v=>isString(v)&&v!=="");
    }

    addInput(valueIn = ""){
        const inputEls = Bliss.$(`.multiline-input`,this.container);
        if (inputEls.length == this.maxInputs) return false;
        const handler = debounce((evt)=>{
            this.handleChange.call(this,evt);
        },DEBOUNCE_AMOUNT);
        const specialKeys = (evt)=>{
            if ((evt.code,evt.key).includes("ArrowUp")) {
                this.focusOnPrevious();
                return;
            }
            if ((evt.code,evt.key).includes("ArrowDown")) {
                this.focusOnNext(evt);
                return;
            }
            if ((evt.code,evt.key).includes("Enter")) {
                this.focusOnNext(evt);
                setTimeout(()=>this.handleChange(evt),DEBOUNCE_AMOUNT,{
                    maxWait : DEBOUNCE_AMOUNT+10
                });
                return;
            }
            // suppress quotes to mimimise JSON escapage
            if ((evt.code,evt.key).includes(`"`) || (evt.code,evt.key).includes(`Quote`)) {
                evt.preventDefault();
                return;
            }
        }
        const newInput = Bliss.create("input",{
            type : "text",
            tabindex : "0",
            name  : this.name+'_multiline',
            id : `multiline_${this.name}_${uniqueId()}`,
            className : 'multiline-input',
            events : {
                input : handler,
                keydown : specialKeys
            },
            value : valueIn
        });
        const i = this.inputs.push(newInput);
        newInput._.set({"data-position":i});
        // look for last input again
        const lastInput = last(Bliss.$(".multiline-input",this.container));
        debug({lastInput});
        (!isUndefined(lastInput) ? lastInput : this.targetInput).insertAdjacentElement("afterend",newInput);
        // use a css animation for entry?
        return true;
    }

    handleChange(evt){
        // I don't handle change very well
        const lastInView = last(Bliss.$(`.multiline-input`,this.container));
        if (lastInView.value !== "") this.addInput();
        // remove any empty inputs that are left
        this.removeEmptyInputs();
        this.targetInput.value = JSON.stringify(this.values);
    }

    focusOnNext({code="",key=""}){
        const position = findIndex(this.inputs,{id:document.activeElement.id});
        const lastInView = last(Bliss.$(`.multiline-input`,this.container));
        debug(Bliss.$(`.multiline-input`,this.container));
        if (lastInView == document.activeElement) {
            if ((code,key).includes("ArrowDown")) return;
            // last input
            const addOne = this.addInput();
            if (!!addOne) this.focusOnNext({});
            return;
        }
        else {
            const nextId = this.inputs[position+1].id;
            const nextInp = Bliss(`.multiline-input#${nextId}`,this.container) || {};
            if (nextInp.focus) nextInp.focus();
        }
        return;
    }

    focusOnPrevious(){
        if (document.activeElement == Bliss.$(".multiline-input",this.container)[0]) {
            return;
        }
        else {
            const inputEls = Bliss.$(`.multiline-input`,this.container);
            const previous = inputEls.indexOf(document.activeElement)-1;
            if (previous >= 0) inputEls[previous].focus();
        }
        return;
    }

    removeEmptyInputs(){
        const inFocus = document.activeElement;
        const lastInView = last(Bliss.$(`.multiline-input`,this.container))
        // remove any empty except last
        let toRemove = Bliss.$(`.multiline-input`,this.container).slice(0,-1).filter(inp=>inp.value == "");
        debug({toRemove});
        toRemove = concat(toRemove,this.inputs.filter(inp=>inp.offsetParent==null));
        toRemove.forEach(inp=>{
            if (!inp) return;
            const removee = Bliss(`.multiline-input[id='${inp.id}']`); // something in Qualtrics sulky about selector
            if (removee) removee.remove();
            if (findIndex(this.inputs,{id:inp.id}) == -1) this.inputs.splice(findIndex(this.inputs,{id:inp.id}),1);
        });
        inFocus.focus();
    }

}

module.exports = function(){

    // find in survey

    if (Bliss.$(".multiline-text").length) {
        debug(`multiline_text.js v${MULTILINE_VERSION}`);

        Bliss.$(".multiline-text").forEach(el=>{
            const closest = el.closest("div.form-group") || el.closest("fieldset");
            const options = {}, targetInput = closest.querySelector("input[type='text']") || closest.querySelector("input[type='TEXT']"); // stoopid Qualtrics
            const itemsMaxClasses = el.className.split(" ").filter(v=>startsWith(v,'multiline-limit-'));
            if (!!itemsMaxClasses[0]) options.maxInputs = parseInt(itemsMaxClasses[0].replace("multiline-limit-",""));
            if (!isFinite(options.maxInputs)) unset(options.maxInputs);
            const ml = new Multiline(targetInput,options);
        });
    }


}