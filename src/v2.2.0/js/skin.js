// qualtrics-thiscovery-skin
//
// skin.js
// =======
// 2.2.0

/* REVISIONS 

2 - adding message watcher

*/

const {Qid} = require("qid");
const instance = Qid();

let debug = require("debug")("thisco:skin.js");
debug = debug.extend(instance);

const version = "2.2.0";
debug(`Thiscovery survey skin version ${version}`);

const revision = 2;
debug(`Revision: ${revision}`);

/*! modernizr 3.6.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-touchevents-setclasses !*/
 !function(e,n,t){function o(e,n){return typeof e===n}function s(){var e,n,t,s,a,i,r;for(var l in c)if(c.hasOwnProperty(l)){if(e=[],n=c[l],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(t=0;t<n.options.aliases.length;t++)e.push(n.options.aliases[t].toLowerCase());for(s=o(n.fn,"function")?n.fn():n.fn,a=0;a<e.length;a++)i=e[a],r=i.split("."),1===r.length?Modernizr[r[0]]=s:(!Modernizr[r[0]]||Modernizr[r[0]]instanceof Boolean||(Modernizr[r[0]]=new Boolean(Modernizr[r[0]])),Modernizr[r[0]][r[1]]=s),f.push((s?"":"no-")+r.join("-"))}}function a(e){var n=u.className,t=Modernizr._config.classPrefix||"";if(p&&(n=n.baseVal),Modernizr._config.enableJSClass){var o=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");n=n.replace(o,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(n+=" "+t+e.join(" "+t),p?u.className.baseVal=n:u.className=n)}function i(){return"function"!=typeof n.createElement?n.createElement(arguments[0]):p?n.createElementNS.call(n,"http://www.w3.org/2000/svg",arguments[0]):n.createElement.apply(n,arguments)}function r(){var e=n.body;return e||(e=i(p?"svg":"body"),e.fake=!0),e}function l(e,t,o,s){var a,l,f,c,d="modernizr",p=i("div"),h=r();if(parseInt(o,10))for(;o--;)f=i("div"),f.id=s?s[o]:d+(o+1),p.appendChild(f);return a=i("style"),a.type="text/css",a.id="s"+d,(h.fake?h:p).appendChild(a),h.appendChild(p),a.styleSheet?a.styleSheet.cssText=e:a.appendChild(n.createTextNode(e)),p.id=d,h.fake&&(h.style.background="",h.style.overflow="hidden",c=u.style.overflow,u.style.overflow="hidden",u.appendChild(h)),l=t(p,e),h.fake?(h.parentNode.removeChild(h),u.style.overflow=c,u.offsetHeight):p.parentNode.removeChild(p),!!l}var f=[],c=[],d={_version:"3.6.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var t=this;setTimeout(function(){n(t[e])},0)},addTest:function(e,n,t){c.push({name:e,fn:n,options:t})},addAsyncTest:function(e){c.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=d,Modernizr=new Modernizr;var u=n.documentElement,p="svg"===u.nodeName.toLowerCase(),h=d._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):["",""];d._prefixes=h;var m=d.testStyles=l;Modernizr.addTest("touchevents",function(){var t;if("ontouchstart"in e||e.DocumentTouch&&n instanceof DocumentTouch)t=!0;else{var o=["@media (",h.join("touch-enabled),("),"heartz",")","{#modernizr{top:9px;position:absolute}}"].join("");m(o,function(e){t=9===e.offsetTop})}return t}),s(),a(f),delete d.addTest,delete d.addAsyncTest;for(var v=0;v<Modernizr._q.length;v++)Modernizr._q[v]();e.Modernizr=Modernizr}(window,document);

window.THISCO_DEV = localStorage.getItem("thisco_dev") !== null;
window.QUALTRICS_PREVIEW = window.location.href.includes("preview");
window.TEST_VALIDATION = (localStorage.getItem("thisco_dev") || "").includes("TEST_VAL");

const BlissfulJs = require('blissfuljs');
const { debounce, trim, forIn, fromPairs, startCase } = require("lodash");
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

// shared between update and setup:
let followObs;

const update = ()=>{

    const jfeContent = document.getElementsByClassName('JFEContent')[0];

    // functions to be run after Qualtrics' page updates
    // closer alliance to Qualtrics requires using Qualtrics particular hooks

    debug('JFEContent updated');

    // shared functions

    requestAnimationFrame(followObs);

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

    // handle modal alert messages HERE FOR NOW

    window.thiscoMessages = [];
    emitter.on("addMessage",(message)=>{
        debug({thiscoMessages});
        const messageId = shortHash(message);
        if (thiscoMessages.filter(m=>m.active).map(m=>m.message).includes(message)) {
            debug("already got this message");
            return;
        }
        else {
            debug({thiscoMessages});
            const msgObj = {
                messageId,
                message,
                active : true
            };
            thiscoMessages.push(msgObj);
            setTimeout(()=>{
                msgObj.active = false;
            },1500);
            disposableModal({bodyHtml:message});
        }
    });

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

    // --> end updates
    // 2.2 stuff -->

    if (!Bliss(".thisco-obs-follow")) {
        jfeContent.insertAdjacentHTML("beforeend",`<div class="thisco-obs-follow" style="position:relative"><a style="position:absolute;"></a></div>`);
    }
    jfeContent.classList.remove('curtain');

}

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
        <div class="thisco-obs thisco-base-styles" id="thiscoObs"><div class="thisco-obs-content">Hello</div></div>
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

    // colophon modal builders

    const activeSibling = (target)=>{
        
        if (target instanceof Event) {
            target.stopPropagation();
            target.preventDefault();
            target = target.currentTarget;
        }
        else {
            target = Bliss(target);
        }

        if (!target) return;

        if (!target.classList.contains("active")) {
            Bliss.$(target.parentNode.children).forEach(el=>el.classList.remove("active"));
            target.classList.add("active");
            if (target.dataset.addActive && (target.dataset.addActive !== "")) activeSibling(target.dataset.addActive);
            return;
        }
        return;
    };
    

    const buildColophonModal = ()=>{
        const modal_kill = (evt)=>{
            evt.stopPropagation();
            evt.preventDefault();
            if (["modal-curtain","modal-close-button"].includes(evt.target.className)) {
                modal.remove();
                return;
            }
            return;
        }
        const modal =  Bliss.create("div",{
            id : "thisco-privacy-modal",
            className : "modal-curtain",
            contents : [{
                tag : "div",
                className : "modal-contents",
                contents : [{
                    tag : "button",
                    className : "modal-close-button",
                    events : {
                        click : modal_kill
                    }
                },{
                    tag: "div",
                    className : "modal-buttons",
                    contents : [{
                        tag : "button",
                        className : "tab privacy-policy",
                        contents : "Privacy Policy",
                        events : { click : activeSibling },
                        "data-add-active" : "#panel-privacy-policy"
                    },{
                        tag : "button",
                        className : "tab terms-and-conditions",
                        contents : "Terms & Conditions",
                        events : { click : activeSibling },
                        "data-add-active" : "#panel-terms-and-conditions"
                    }]
                },{
                    tag : "div",
                    className : "policy-panel privacy-policy",
                    id: "panel-privacy-policy",
                    contents : [{
                        tag: "div",
                        className : "sub-nav",
                        contents : [{
                            tag : "ul",
                            contents : [{
                                tag :"li",
                                contents:"Personal Information",
                                className : "active",
                                events : { click : activeSibling },
                                "data-add-active" : "#panel-personal-information"
                            },{
                                tag :"li",
                                contents:"Cookie Policy",
                                events : { click : activeSibling },
                                "data-add-active" : "#panel-cookies"
                            }]
                        }]
                    },{
                        tag : "div",
                        className : "panel-content active",
                        innerHTML : modalHtml.personal_information,
                        id : "panel-personal-information"
                    },{
                        tag : "div",
                        className : "panel-content",
                        innerHTML : modalHtml.cookies,
                        id : "panel-cookies"
                    }]
                },{
                    tag : "div",
                    className : "policy-panel terms-and-conditions",
                    id : "panel-terms-and-conditions",
                    contents : [{
                        tag: "div",
                        className : "sub-nav",
                        contents : [{
                            tag : "ul",
                            contents : [{
                                tag :"li",
                                contents:"Terms of Use",
                                className : "active",
                                events : { click : activeSibling },
                                "data-add-active": "#panel-terms-of-use"
                            },{
                                tag :"li",
                                contents:"Terms of Participation",
                                events : { click : activeSibling },
                                "data-add-active" : "#panel-terms-of-participation"
                            }]
                        }]
                    },{
                        tag : "div",
                        className : "panel-content active",
                        innerHTML : modalHtml.terms_of_use,
                        id: "panel-terms-of-use"
                    },{
                        tag : "div",
                        className : "panel-content",
                        innerHTML : modalHtml.terms_of_participation,
                        id : "panel-terms-of-participation"
                    }]
                }]
            }],
            events : {
                click : modal_kill
            }
        });
        return modal;
    }

    // header

    const header = document.getElementById("thiscoHeader");
    if (header) {
        header.appendChild(Bliss.create("div",{
            className : "header-content",
            contents : [{
                tag : "a",
                href : BACK_LINK,
                className : "btn thisco-btn thisco-btn-inverse-red back-button",
                contents : [{
                    tag : "span",
                    className : "back-arrow"
                },"Back to My Tasks"]
            }]
        }));
    }

    // footer (incl. colophon modals events)

    const colophonModal = (evt)=>{
        if (!evt.currentTarget.parentNode.classList.contains("policy-link")) return false;
        evt.preventDefault();
        evt.stopPropagation();
        const dest = evt.currentTarget.href.includes("privacy") ? "privacy-policy" : "terms-and-conditions";
        document.body.appendChild(buildColophonModal());
        Bliss(".modal-contents").scrollTop = 0;
        activeSibling(`button.${dest}`);
        return;
    };

    const footer = document.getElementById("thiscoFooter");
    if (footer) {
        const footerContent = Bliss.create("div",{
            className : "footer-content"
        });
        footer.appendChild(footerContent);
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
        const logoHolder = Bliss.create("div",{
            className : "logo-holder"
        });
        footerContent.appendChild(logoHolder);
        forIn(logos,(value,key)=>{
            logoHolder.appendChild(Bliss.create('div',{
                className : 'logo-container',
                id : `logo_${key}`,
                contents: [{
                    tag : "span",
                    // href : value.url,
                    // target : "_blank",
                    contents: [{
                        tag : "img",
                        src : value.logo,
                        alt : startCase(key+"_logo")
                    }]
                }]
            }))
        });

        // boilerplate
        footerContent.appendChild(Bliss.create("div",{
            className : "colophon",
            contents : [{
                tag :"ul",
                contents : [{
                    tag : "li",
                    className : "policy-link",
                    contents : [{
                        tag : "a",
                        target : "_blank",
                        href : "https://www.thiscovery.org/privacy-policy",
                        contents : "Privacy Policy",
                        events : {
                            click : colophonModal
                        }
                    }]
                },{
                    tag : "li",
                    className : "policy-link",
                    contents : [{
                        tag : "a",
                        target : "_blank",
                        href : "https://www.thiscovery.org/terms-of-use",
                        contents : "Terms of Use",
                        events : {
                            click : colophonModal
                        }
                    }]
                },{
                    tag : "li",
                    className : "copyright",
                    contents : `Thiscovery © THIS Institute ${new Date().getFullYear()}`
                }]
            }]
        }))
    }

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