// qualtrics-thiscovery-skin
//
// skin.js
// =======
// 2.2.0

/* REVISIONS 

2 - adding message watcher
3 - progess dial fixes

*/

const {Qid} = require("qid");
const instance = Qid();

let debug = require("debug")("thisco:skin.js");
debug = debug.extend(instance);

const version = "2.2.0";
debug(`Thiscovery survey skin version ${version}`);

const revision = 3;
debug(`Revision: ${revision}`);

/*! modernizr 3.12.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-touchevents !*/
 !function(e,n,t,o){function r(e,n){return typeof e===n}function i(){return"function"!=typeof t.createElement?t.createElement(arguments[0]):h?t.createElementNS.call(t,"http://www.w3.org/2000/svg",arguments[0]):t.createElement.apply(t,arguments)}function a(){var e=t.body;return e||(e=i(h?"svg":"body"),e.fake=!0),e}function s(e,n,o,r){var s,l,u,d,f="modernizr",c=i("div"),h=a();if(parseInt(o,10))for(;o--;)u=i("div"),u.id=r?r[o]:f+(o+1),c.appendChild(u);return s=i("style"),s.type="text/css",s.id="s"+f,(h.fake?h:c).appendChild(s),h.appendChild(c),s.styleSheet?s.styleSheet.cssText=e:s.appendChild(t.createTextNode(e)),c.id=f,h.fake&&(h.style.background="",h.style.overflow="hidden",d=p.style.overflow,p.style.overflow="hidden",p.appendChild(h)),l=n(c,e),h.fake&&h.parentNode?(h.parentNode.removeChild(h),p.style.overflow=d,p.offsetHeight):c.parentNode.removeChild(c),!!l}function l(e,t,o){var r;if("getComputedStyle"in n){r=getComputedStyle.call(n,e,t);var i=n.console;if(null!==r)o&&(r=r.getPropertyValue(o));else if(i){var a=i.error?"error":"log";i[a].call(i,"getComputedStyle returning null, its possible modernizr test results are inaccurate")}}else r=!t&&e.currentStyle&&e.currentStyle[o];return r}var u=[],d={_version:"3.12.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var t=this;setTimeout(function(){n(t[e])},0)},addTest:function(e,n,t){u.push({name:e,fn:n,options:t})},addAsyncTest:function(e){u.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=d,Modernizr=new Modernizr;var f=[],c=d._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):["",""];d._prefixes=c;var p=t.documentElement,h="svg"===p.nodeName.toLowerCase(),m=function(){var e=n.matchMedia||n.msMatchMedia;return e?function(n){var t=e(n);return t&&t.matches||!1}:function(e){var n=!1;return s("@media "+e+" { #modernizr { position: absolute; } }",function(e){n="absolute"===l(e,null,"position")}),n}}();d.mq=m,Modernizr.addTest("touchevents",function(){if("ontouchstart"in n||n.TouchEvent||n.DocumentTouch&&t instanceof DocumentTouch)return!0;var e=["(",c.join("touch-enabled),("),"heartz",")"].join("");return m(e)}),function(){var e,n,t,o,i,a,s;for(var l in u)if(u.hasOwnProperty(l)){if(e=[],n=u[l],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(t=0;t<n.options.aliases.length;t++)e.push(n.options.aliases[t].toLowerCase());for(o=r(n.fn,"function")?n.fn():n.fn,i=0;i<e.length;i++)a=e[i],s=a.split("."),1===s.length?Modernizr[s[0]]=o:(Modernizr[s[0]]&&(!Modernizr[s[0]]||Modernizr[s[0]]instanceof Boolean)||(Modernizr[s[0]]=new Boolean(Modernizr[s[0]])),Modernizr[s[0]][s[1]]=o),f.push((o?"":"no-")+s.join("-"))}}(),delete d.addTest,delete d.addAsyncTest;for(var v=0;v<Modernizr._q.length;v++)Modernizr._q[v]();e.Modernizr=Modernizr}(window,window,document);

window.document.body.classList.add(Modernizr.touchevents ? 'touchevents' : 'no-touchevents');

window.THISCO_DEV = localStorage.getItem("thisco_dev") !== null;
window.QUALTRICS_PREVIEW = window.location.href.includes("preview");
window.TEST_VALIDATION = (localStorage.getItem("thisco_dev") || "").includes("TEST_VAL");

const BlissfulJs = require('blissfuljs');
const { debounce, trim, forIn, fromPairs, startCase, isFunction, uniqueId } = require("lodash");
const markdown = require('markdown').markdown;
const sanitizeHtml = require('sanitize-html');
const shortHash = require('short-hash');

const emitter = require("tiny-emitter/instance");

const modalHtml = {
    "cookies" : markdown.toHTML( require("../../md/personal_information.md") ),
    "personal_information" : markdown.toHTML( require("../../md/personal_information.md") ),
    "terms_of_use" : markdown.toHTML( require("../../md/terms_of_use.md") ),
    "terms_of_participation" : markdown.toHTML( require("../../md/terms_of_participation.md") )
};

const BACK_LINK = window.location.search.includes("staging") ? "https://staging.thiscovery.org/my-tasks/" : "https://www.thiscovery.org/my-tasks/";


// skinjob client
require("../../shared_js/skinjob_client.js")();

// shared_between update and setup:
let followObs, progressWatcher = null, messages;

/**
 * This is fired by the MutationObserver that is watching JFEContent. It contains 
 * all the scripts that need to be run on each survey page.
 * 
 * Check code for inline comments, timings etc.
 * 
 * The script:
 * 
 * - looks for `.JFEContent`
 * - checks y offset placement of `#thiscoObs`
 * - sets up progress bar if not already done once
 * - sets up messages ( `messages.init()` )
 * - fires all the modules (see below)
 * - adds snippet to process consent statements for Qualtrics webhook
 * - pulls in any graphs into divs marked `.thisco-graph`
 * 
 * @requires module:shared_js/messages
 * @requires module:shared_js/thisco_modals
 * @requires module:shared_js/link_buttons
 * @requires module:shared_js/ranking_question
 * @requires module:shared_js/expand_textarea
 * @requires module:shared_js/multiline_text
 * @requires module:shared_js/validation
 * @requires module:shared_js/slideshow
 * @requires module:shared_js/panel_choice
 * @requires module:shared_js/custom_video
 * @requires module:shared_js/misc_fixes
 * @requires module:shared_js/thisco_icons
 */
const update = ()=>{

    const jfeContent = document.getElementsByClassName('JFEContent')[0];

    // functions to be run after Qualtrics' page updates
    // closer alliance to Qualtrics requires using Qualtrics particular hooks

    debug('JFEContent updated');
    emitter.emit('bodyUpdate');

    // shared_functions

    requestAnimationFrame(followObs);

    // progress bar

    // set up progress bar

    if (progressWatcher == null) {
        const setupProg = ()=>{
            progressWatcher = require("../../shared_js/progress.js")();
            progressWatcher.update(true);
        };
        requestAnimationFrame(setupProg);
    }
    else {
        progressWatcher.update(true);
    }

    // set up messages

    const messages = require("../../shared_js/messages.js")();
    messages.init();

    // markup additions

    // horizontal radio group into notched scale (NOT a range input)

    const ratings = ()=>{    
        const tableChoiceStructures = Bliss.$("table.ChoiceStructure");

        tableChoiceStructures.forEach(tableChoiceStructure=>{
            debug({tableChoiceStructure});
            const testRadio = Bliss("td input[type='radio']");
            const isMatrix = !!tableChoiceStructure && tableChoiceStructure.closest("div").classList.contains('q-matrix');
            const isMultiRow = Bliss.$("tr",tableChoiceStructure).length > 1;
            if (tableChoiceStructure && testRadio && !isMatrix &&!isMultiRow) {
                tableChoiceStructure.classList.add("likert-scale");
                let parseable = true;
                Bliss.$("td",tableChoiceStructure).forEach(el=>{
                    const labelActual = Bliss("span.LabelWrapper > label",el);
                    const inputActual = Bliss("input[type='radio']",el);
                    const [notch,notchText] = labelActual.innerText.includes(":") ? labelActual.innerText.split(":") : [trim(labelActual.innerText),null];
                    labelActual.innerText = notchText;
                    if (isFinite(parseInt(notch))) inputActual.dataset.notchNumber = parseInt(notch); 
                    else {
                        inputActual.dataset.notchNumber = "?";
                        parseable = false;
                    }
                });
                if (!parseable) {
                    const parseError = "<div class='alert-error'>Thiscovery script was unable to fully parse this ratings question - make sure all your labels are in the format 'n:Label' or 'n:'</div>";
                    tableChoiceStructure.insertAdjacentHTML("afterend",parseError);
                    tableChoiceStructure.remove();
                }
            }
        });
    }
    requestAnimationFrame(ratings); // not sure why but needs to repaint once to find labels....

    // modals

    require("../../shared_js/thisco_modals.js")();

    // link buttons

    require("../../shared_js/link_buttons.js")();

    // textareas

    require("../../shared_js/expand_textarea.js")();

    // ranking Qs

    require("../../shared_js/ranking_question.js")();

    // multiline text Qs

    require("../../shared_js/multiline_text.js")();

    // custom validation interception

    require("../../shared_js/validation.js")();

    // slideshows

    require("../../shared_js/slideshow.js")();

    // panel choice

    require("../../shared_js/panel_choice.js")();

    // meta panel

    Bliss.$('.Skin .meta-panel, .thisco-survey .meta-panel').forEach(el=>{
        el.closest('fieldset').classList.add("meta-panel");
    });

    // custom videos

    require("../../shared_js/custom_video.js")();

    // thisco icon web component

    require("../../shared_js/thisco_icons.js")();

    // misc fixes

    require("../../shared_js/misc_fixes.js")();
    
    // consent form Qualtrics addition

    const processHtml = (dirty)=>sanitizeHtml(dirty, {
        allowedTags : ["a","ul","li","strong","b","i","em"],
        allowedAttributes : {
            "a": ["href","alt"]
        }
    })

    // .consent-checklist must be only used once per consent block
    const isConsentForm = Bliss.$(".consent-checklist").length > 0;
    if (isConsentForm) {
        Bliss.$(".consent-checklist").forEach(checklist=>{
            let fset = checklist.closest("fieldset");
            checklist.className.split(" ").forEach(cl=>{
                fset.classList.add(cl);
            });
            if (fset.classList.contains('consent-switches')) {
                Bliss.$(".ChoiceStructure label",fset).forEach(label=>{
                    label.appendChild(Bliss.create("button",{
                        className : "consent-switch",
                        contents : [
                            {tag:"span",contents:"Yes"},
                            {tag:"span",contents:"No"}
                        ]
                    }))
                });
            }
            checklist.className = "";
        });

        if (!window.Qualtrics) throw ("Unable to set up consent webhook - no Qualtrics on global object");
        Qualtrics.SurveyEngine.addOnPageSubmit(function(){
            let statements = [];
            // Pull any instance of a consent checklist
            Bliss.$(".consent-checklist").forEach(checklist=>{
                let fset = checklist.closest("fieldset");
                // cycle through checkbox inputs
                Bliss.$("input[type='checkbox']",checklist).forEach(stControl=>{
                    // pull statement HTML from the input's parent list item, tidy up and trim
                    const text = trim(processHtml(stControl.closest("li").innerHTML).replace(/YesNo/g,""));
                    // add to statements array 
                    const agreement = stControl.checked ? "Yes" : "No";
                    statements.push(fromPairs([[text,agreement]]));
                });
            });
            if (THISCO_DEV) {
                debug(`I would have attached : ${JSON.stringify(statements)}`);
            }
            else {
                Qualtrics.SurveyEngine.setEmbeddedData('consent_statements', JSON.stringify(statements));
            }
        });
    ;

    }

    // thisco-graph script pull

    const graphs = Bliss.$('.thisco-graph');
    if (graphs.length) graphs.forEach(el=>{
        const targetScript = (el.dataset || {}).graphlink;
        if (!targetScript) return;
        else {
            const scriptIn = document.createElement("script");
            scriptIn.setAttribute("src",targetScript);
            scriptIn.setAttribute('defer',true);
            scriptIn.setAttribute('async',true);
            document.head.appendChild(scriptIn);
        }
    });

    // fieldsets add a 'touched' class if clicked on at all
    // intermediate fix for better in-page validation
    const fsets = Bliss.$("fieldset");
    if (fsets.length) {
        fsets.forEach(fset=>{
            fset.addEventListener('click',(evt)=>{
                evt.stopPropagation();
                if(["input","textarea","select","label"].includes(evt.target.tagName.toLowerCase())) fset.classList.add('touched');
                requestAnimationFrame(()=>progressWatcher.update());
                // debug({progressWatcher});
            })
        })
    }

    // --> end updates
    // 2.2 stuff -->

    if (!Bliss(".thisco-obs-follow")) {
        jfeContent.insertAdjacentHTML("beforeend",`<div class="thisco-obs-follow" style="position:relative"><a style="position:absolute;"></a></div>`);
    }
    jfeContent.classList.remove('curtain');

}

/**
 * This is fired by the script if it finds no previous instance of 
 * ThiscoScript on the window object. It sets up anything that is 
 * outside the Qualtrics updated content (e.g. header, footer) and 
 * the MutationObserver that fires {@link update} when the childlist or subtree
 * of `.JFEContent` changes.
 *
 * Check code for inline comments and timings.
 * 
 * The script:
 * 
 * - Checks for `.JFEContent` - stands down if can't find it
 * - ejects any stylesheet not including 'thiscovery' or 'localhost' in its href
 * - rewrites favicon
 * - adds header, footer and thiscoObs containers
 * - adds a followObs function for obs panel to track position
 * - fires {@link module:shared_js/header_footer}
 * - sets up MutationObserver
 * 
 * @requires module:shared_js/header_footer
 */
const setup = ()=>{

    debug ('Running setup()');

    const jfeContent = document.getElementsByClassName('JFEContent')[0];
    if (!jfeContent) {
        debug("unable to find jfeContent to set up updates? Standing down instance");
        delete window.ThiscoScript;
        return;
    }

    // functions to be run on first execution

    // eject Qualtrics stylesheet

    Bliss.$("link[rel='stylesheet']").forEach(el=>{
        const href = el.getAttribute('href') || "";
        if (!(href.includes('thiscovery') || href.includes("localhost"))) {
            debug(`ejected : ${href}`);
            el.remove(); // bye!
        }
    });

    // switch favicon and title

    let iconLink = Bliss(`link[rel="icon]`);
    if (!iconLink) {
        iconLink = Bliss.create("link",{rel:"icon"});
        Bliss('head').appendChild(iconLink);
    }
    iconLink.href = "https://www.thiscovery.org/favicon-32x32.png"; 

    document.title = "Thiscovery";

    // set up external header, footer and obs areas from Qualtrics refresh zone

    const thContainers = `
        <div class="thisco-header-container thisco-base-styles" id="thiscoHeaderContainer"><div id="thiscoHeader"></div></div>
        <div class="thisco-footer-container thisco-base-styles" id="thiscoFooter"></div>
        <div class="thisco-obs thisco-base-styles" id="thiscoObs"><div class="thisco-obs-content"></div></div>
    `;
    jfeContent.insertAdjacentHTML("afterend",thContainers);

    // set up #thiscoObs
    // follow left position of .thisco-obs-follow

    followObs = ()=>{
        const thiscoObsFollow = Bliss(".thisco-obs-follow > a");
        const obs = Bliss("#thiscoObs");
        if (!thiscoObsFollow || !obs) return;
        const r = thiscoObsFollow.getBoundingClientRect();
        obs._.style({left:`${r.left}px`});
        return;
    };
    window.addEventListener("resize",followObs);

    // header and footer

    require("../../shared_js/header_footer.js")();

    // set up mutation observer for Qualtrics updates

    const doUpdate = debounce(update,500);
    const mutConfig = { childList: true, subtree: true };
    const mutCallback = (mutationList,observer) => {
        const targets = mutationList.map(m=>m.target);
        const form = document.getElementById("Page"); // watches specifically for form#Page childList to change
        if (targets.includes(form)) {
            jfeContent.classList.add('curtain');
            doUpdate();
        }
    }
    const observer = new MutationObserver(mutCallback);
    observer.observe(jfeContent,mutConfig);
    // if needs disconnecting at any point: observer.disconnect()

    return;
    

};

if (typeof window.ThiscoScript === "undefined") {
    window.ThiscoScript = {
        setup,
        update
    };
    ThiscoScript.setup();
}
else {
    debug("new script instance standing down");
    // an instance of this script is already in play
    return;
}