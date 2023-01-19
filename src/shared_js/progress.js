const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const debug = require('debug')('thisco:progress.js');
import _ from 'lodash';

import { CircleSegments } from '../ext_custom/CircleSegments';

/**
 * 
 * Sets up progress bar and progress watching:
 * - checks `table.ProgressBarContainer` and `div#thiscoObs>div.thisco-obs-content` selectors work
 * - adds relevant elements into `div#thiscoObs>div.thisco-obs-content`
 * - update function checks Qualtrics progress
 * - makes guess at Qualtrics weighting of % (will need to have gone forward past first 'page' to do this)
 * - also checks for fieldsets with class `touched` (this will change to `is-dirty` when validation used)
 * and uses them to guess a 'fill-in' progress amount
 * - renders progress bars (mobile one and the circular bar for wider screens)
 * 
 * Module default function, when called returns an object with single function, update()
 *   
 * @module
 */
module.exports = function(){
    // sets up a progress bar and returns obj with one method- update
   
    // expects to see a few elements to work

    const selectors = ['table.ProgressBarContainer','div#thiscoObs>div.thisco-obs-content'];
    allSelectors = selectors.every(sel=>{return Bliss(sel) instanceof HTMLElement;});
    if (!allSelectors) {
        debug('unable to locate elements for progress watcher - if expecting check sequencing');
        return {
            update : _.noop
        };
    }

    // updates by:
    // taking Qualtrics value at minimum
    // Qualtrics weights pages by question number (incl. graphics)
    // so can guess interval after first page
    // and adds in all fieldsets with 'touched' class to the current score

    let progressWatcher = {
        lastQProgress : 0,
        lastQuestions : false,
        current : 0,
        // latestIncrementGuess : 0,
        lastInterval : 0,
        intervalGuess : false
    }, progressDial;

    const obs = Bliss(`div#thiscoObs>div.thisco-obs-content`);
    const progressBar = Bliss.create("div",{
        tagname:  'div',
        className : 'progress',
        style : { width : '50%'}
    });
    obs.prepend(Bliss.create("div",{
        className : "thisco-progress-bar",
        style : {
            'position' : 'fixed'
        },
        contents : [progressBar]
    }));
    obs.prepend(Bliss.create("div",{
        className : "thisco-progress-dial",
        style : {
            'aspect-ratio' : 1,
            'position' : 'relative'
        }
    }));
    const progressGrain = 50;
    progressDial = new CircleSegments({
        target : ".thisco-progress-dial",
        rotationStart : -90,
        activeColors : ["crimson"],
        canvasMBlur : false,
        rounded : false,
        segmentNo : progressGrain,
        startExplode: 0,
        startRadius : 800,
        startIntRadius : 0,
        recessColor: "rgb(243 165 185 / .5)"
    });
    progressDial.init();

    const update = (pageTurn=false)=>{

        debug({progressWatcher,pageTurn});

        const {lastQuestions,lastInterval,intervalGuess} = progressWatcher;

        // get current page stats
        const progressEl = Bliss(`table.ProgressBarContainer`);
        const prog = {};
        ['valuemin','valuemax','valuenow'].forEach(val=>{
            prog[val] = parseInt(progressEl.getAttribute(`aria-${val}`));
        });
        const qProgress = (prog.valuemax - prog.valuemin) > 0 ? prog.valuenow / (prog.valuemax - prog.valuemin) : 0;

        if (pageTurn) progressWatcher.lastInterval = qProgress - progressWatcher.lastQProgress;

        // if we can, guess interval
        if (pageTurn && !intervalGuess && isFinite(lastQuestions) && isFinite(lastInterval)) {
            progressWatcher.intervalGuess = lastInterval / lastQuestions;
        }

        // const latestIncrementGuess = _.clamp(progressWatcher.lastInterval / _.clamp(Bliss.$("fieldset").length,1,999), 0, 999)
        const validFsets = Bliss.$("fieldset.touched").filter(fset=>!fset.className.includes('contains-invalid')).length;
        progressWatcher.current = !intervalGuess ? qProgress : qProgress + (validFsets * intervalGuess);

        const currentVisual = progressWatcher.current * progressGrain;

        // set progress bar

        progressBar._.style({
            width : `${progressWatcher.current * 100}%`
        });

        // set progress dial

        if ((progressDial.options.startIntRadius == 0) && (progressWatcher.lastQProgress == 0) && (qProgress > 0)) {
            progressDial.options.startIntRadius = 450;
            progressDial.setProgress(_.floor(currentVisual),0);
        }
        else if (progressWatcher.current > .99) {
            progressDial.options.startIntRadius = 0;
            progressDial.setProgress(_.ceil(currentVisual),0);
        }
        else {
            progressDial.setProgress(_.floor(currentVisual),15);
        }

        if (pageTurn) {
            _.assign(progressWatcher,{
                lastQProgress : qProgress,
                lastQuestions : !lastQuestions ?_.clamp(Bliss.$("div[questionid]").length,1,999) : lastQuestions,
                // latestIncrementGuess : _.clamp((qProgress - progressWatcher.lastQProgress) / progressWatcher.lastQuestions, 0, 999),
                // lastInterval : qProgress - progressWatcher.lastQProgress
            });
        }

    };
    progressWatcher.update = update;

    return progressWatcher;
}