// qualtrics-thiscovery-skin
//
// skin.js
// =======
//
// JS bundle for various DOM fixes, dev  etc

const version = "2.1.0";
console.log(`Thiscovery survey skin version ${version}`);

const revision = 2;
console.log(`Revision: ${revision}`);

const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us
import { forIn, fromPairs, startCase, trim } from 'lodash';
const markdown = require('markdown').markdown;
const sanitizeHtml = require('sanitize-html');

const THISCO_DEV = localStorage.getItem("thisco_dev") !== null;

const modalHtml = {
    "cookies" : markdown.toHTML( require("../../md/personal_information.md") ),
    "personal_information" : markdown.toHTML( require("../../md/personal_information.md") ),
    "terms_of_use" : markdown.toHTML( require("../../md/terms_of_use.md") ),
    "terms_of_participation" : markdown.toHTML( require("../../md/terms_of_participation.md") )
};

const BACK_LINK = window.location.search.includes("staging") ? "https://staging.thiscovery.org/my-tasks/" : "https://www.thiscovery.org/my-tasks/";

// skinjob client
require("../../shared_js/skinjob_client.js")();

// eject Qualtrics stylesheet

Bliss.$("link[rel='stylesheet']").forEach(el=>{
    const href = el.getAttribute('href') || "";
    if (!(href.includes('thiscovery') || href.includes("localhost"))) {
        console.debug(`ejected : ${href}`);
        el.remove(); // bye!
    }
});

// markup additions

// horizontal radio group into notched scale (NOT a range input)

const tableChoiceStructure = Bliss("table.ChoiceStructure");
const testRadio = Bliss("td input[type='radio']");
const isMatrix = !!tableChoiceStructure && tableChoiceStructure.closest("div").classList.contains('q-matrix');
const isMultiRow = Bliss.$("tr",tableChoiceStructure).length > 1;
if (tableChoiceStructure && testRadio && !isMatrix &&!isMultiRow) {
    tableChoiceStructure.classList.add("likert-scale");
    Bliss.$("td",tableChoiceStructure).forEach(el=>{
        const labelActual = Bliss("span.LabelWrapper > label",el);
        const inputActual = Bliss("input[type='radio']",el);
        const [notch,notchText] = labelActual.innerText.split(":");
        labelActual.innerText = notchText;
        inputActual.dataset.notchNumber = notch;
    });
}

// modals

require("../../shared_js/thisco_modals.js")();

// link buttons

require("../../shared_js/link_buttons.js")();

// textareas

require("../../shared_js/expand_textarea.js")();

// ranking Qs

require("../../shared_js/ranking_question.js")();

// custom validation interception

require("../../shared_js/validation.js")();

// header

const header = document.getElementById("Header");
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

const footer = document.getElementById("Footer");
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
                contents : `Thiscovery ?? THIS Institute ${new Date().getFullYear()}`
            }]
        }]
    }))
}

// hubspot script addition

const addHSpot = function(){
    const hb = document.createElement('script');
    hb.setAttribute('src','https://js.hs-scripts.com/4783957.js');
    hb.setAttribute('defer',true);
    hb.setAttribute('async',true);
    hb.setAttribute('id','hs-script-loader');
    document.head.appendChild(hb);
}
addHSpot();

// consent form Qualtrics addition

const processHtml = (dirty)=>sanitizeHtml(dirty, {
    allowedTags : ["a","ul","li","strong","b","i","em"],
    allowedAttributes : {
        "a": ["href","alt"]
    }
})

const isConsentForm = Bliss.$(".consent-checklist").length > 0;
if (isConsentForm) {

    Bliss.$(".consent-checklist").forEach(checklist=>{
        let fset = checklist.closest("fieldset");
        checklist.className.split(" ").forEach(cl=>{
            fset.classList.add(cl);
        });
        if (fset.classList.contains('consent-switches')) {
            Bliss.$("label",fset).forEach(label=>{
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
            Bliss.$("input[type='checkbox']").forEach(stControl=>{
                // pull statement HTML from the input's parent list item, tidy up and trim
                const text = trim(processHtml(stControl.closest("li").innerHTML).replace(/YesNo/g,""));
                // add to statements array 
                const agreement = stControl.checked ? "Yes" : "No";
                statements.push(fromPairs([[text,agreement]]));
            });
        });
        if (THISCO_DEV) {
            console.warn(`I would have attached : ${JSON.stringify(statements)}`);
        }
        else {
            Qualtrics.SurveyEngine.setEmbeddedData('consent_statements', JSON.stringify(statements));
        }
    });
;

}

// shopping list