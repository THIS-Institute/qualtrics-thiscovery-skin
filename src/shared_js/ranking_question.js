const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const { debounce, startsWith, isString, clamp, inRange, isFunction, sortBy } = require('lodash');
import { wrapGrid } from 'animate-css-grid'

const RANKING_VERSION = "1.1.1";

// ranking question
// to create 1-x ranked list out of x+ items

const DEBOUNCE_RANKING = 750;

const fire = (evtName="click",el)=>{
    const fireEv = new Event(evtName);  
    el.dispatchEvent(fireEv);
};

module.exports = function(){

    // find in survey

    if (Bliss.$(".ranking-question").length) {
        // game on
        console.debug(`ranking_question.js v${RANKING_VERSION}`);
        Bliss.$(".ranking-question").forEach(tagged=>{

            const fset = tagged.closest('fieldset');
            const legend = Bliss("legend",fset);
            fset.classList.add("ranking-question");

            // Qualtrics pre-mod
            // change type on inputs to number

            const QItems = Bliss.$(".Skin .ChoiceStructure li>input");
            const isQualtrics = QItems.length > 0;
            if (isQualtrics) {
                QItems.forEach(item=>{
                    item.type = "number";
                });
                Bliss(".ChoiceStructure")._.style({
                    "opacity" : 0,
                    "height": "0px",
                    "font-size":"0px"
                });
            }

            // normalise and wrap ranking items

            const rankContainer = Bliss.create("div",{
                className : "ranking-container"
            });
            if (!legend) {
                fset.prepend(rankContainer);
            }
            else {
                legend.insertAdjacentElement('afterend',rankContainer);
            }

            // cycle input[number]
            Bliss.$("input[type='number']").forEach(input=>{
                const label = Bliss.$(`label[for='${input.id}'], label[for='${input.name}']`)[0];
                if (!label) return; // skip inputs w/out matching label
                const wrap = Bliss.create("div",{
                    className : "ranking-item",
                    contents : {
                        tag : 'div',
                        contents : [label,input]
                    }
                });
                rankContainer.appendChild(wrap);
            });

            // get ranking items number and ranking max

            let rankMaxClasses = tagged.className.split(" ").filter(v=>startsWith(v,'ranking-q-max'));
            let rankMax = isString(rankMaxClasses[0]) ? parseInt(rankMaxClasses[0].slice(-1)) : rankContainer.children.length;
            rankMax = clamp(rankMax,1,rankContainer.children.length); // in case class labelled incorrectly
            tagged.classList.remove("ranking-question");
            tagged.classList.remove((rankMaxClasses[0] || "nope").toString());

            rankContainer._.set({
                "data-rank-max" : rankMax
            })

            // conform and format inputs

            const wrapInputControls = (input)=>{

                const wrapper = Bliss.create("div",{
                    className:"input-number-wrapper"
                });
                input.insertAdjacentElement("afterend",wrapper);
                Bliss.contents(wrapper,[{
                    tag : "button",
                    className : "button-decrement",
                    contents : " ",
                    events : {
                        click : debounce((evt)=>{
                            evt.stopPropagation();
                            evt.preventDefault();
                            if (!isFinite(parseInt(input.value))) return; // no affect on empty rank
                            input.stepDown();
                            fire("input",input);
                        },50)
                    },
                    tabindex : "-1"
                },input,{
                    tag : "button",
                    className : "button-increment",
                    contents : " ",
                    events : {
                        click : debounce((evt)=>{
                            evt.stopPropagation();
                            evt.preventDefault();
                            if (!isFinite(parseInt(input.value))) { 
                                input.value = 1; 
                            } // fix for iOS
                            else { input.stepUp(); }
                            fire("input",input);
                        },50)
                    },
                    tabindex : "-1"
                }])
            };

            let existValues = new Set();
            Bliss.$('.ranking-item',rankContainer).forEach(item=>{
                const input = Bliss("input",item);
                let normedValue = isFinite(clamp(parseInt(input.value),1,rankMax)) ? clamp(parseInt(input.value),1,rankMax) : null;
                if (existValues.has(normedValue)) { normedValue = null; } else { existValues.add(normedValue); }
                input._.set({
                    value : normedValue,
                    min : 1,
                    max : rankMax,
                    tabindex : "0"
                });
                wrapInputControls(input);
                item._.set({
                    "data-rank-value" : normedValue,
                    "data-rank-id" : input.id
                });
            });

            // add handlers 

            const handleRankChange = (evt)=>{
                // handle settled rank change of item (debounce this function)
                // watch on all rank number inputs
                const ranker = evt.target.closest(".ranking-item");
                const rankerInput = evt.target;
                const targetValue = inRange(parseInt(rankerInput.value),1,rankMax+1) ? parseInt(rankerInput.value) : null;
                ranker.classList.add("rank-change");
                const demotion = (isFinite(parseInt(ranker.dataset.rankValue))) && (parseInt(rankerInput.value) > parseInt(ranker.dataset.rankValue));
                console.debug(`${rankerInput.id} is being ${demotion ? "demoted :(": "promoted :)"}`);
                console.debug(`its targetValue is ${rankerInput.value} normed to ${targetValue}`);
                // demote/promote function
                const moveItem = (item,promote=true)=>{
                    const currRank = parseInt(item.dataset.rankValue);
                    if (!isFinite(currRank)) return;
                    const nextItem = Bliss(`div.ranking-item[data-rank-value='${currRank + (promote ? -1 : 1)}']`);
                    if (!!nextItem && !nextItem.classList.contains("rank-change")) {
                        moveItem(nextItem,promote); // do all the promotions/demotions in rev order
                    }
                    let newRank = currRank + (promote ? -1 : 1);
                    if ((newRank > rankMax) || (newRank == 0)) newRank = null;
                    item._.set({
                        'data-rank-value':newRank
                    });
                    const input = Bliss("input[type='number']",item);
                    console.debug(`${input.id} is being forcibly ${!promote ? "demoted :(": "promoted :)"}`);
                    input.value = newRank;
                    // const changa = new Event('change');  
                    // input.dispatchEvent(changa);
                    fire("change",input);
                };
                // recursive demotion/promotion as necessary of shoved items
                const shoveSearch = `div.ranking-item[data-rank-value='${targetValue}']`;
                console.debug(`it is looking for ${shoveSearch}`);
                const shovee = Bliss(shoveSearch);
                console.debug(`it is looking to shove ${shoveSearch} which is ${((shovee || {}).dataset || {}).rankId || "unknown"}`);
                if (!!shovee) moveItem(shovee,demotion); // if item is being promoted, demote shovee and vice versa?
                // set update w/out change
                ranker._.set({
                    'data-rank-value':targetValue
                });
                rankerInput.value = targetValue;
                ranker.classList.remove("rank-change");
            };

            const updateRowClasses = ()=>{
                let rows = sortBy(Bliss.$(".ranking-item"),item=>parseInt(item.dataset.rankValue));
                rows.forEach((item,i)=>{
                    item.className = item.className.replace(/ranking-row-./,"");
                    item.classList.add(`ranking-row-${i+1}`);
                });
            };

            const debounced = debounce((evt)=>{
                handleRankChange(evt);
                updateRowClasses();
            },DEBOUNCE_RANKING);

            Bliss.$('.ranking-item',rankContainer).forEach(item=>{
                const input = Bliss("input",item);
                input.addEventListener('input',debounced);
            });

            // animate
            updateRowClasses();
            wrapGrid(rankContainer);
            window.requestAnimationFrame(updateRowClasses)
            // updateRowClasses();

        });

    }
}