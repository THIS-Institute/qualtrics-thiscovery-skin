const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const debug = require('debug')('thisco:progress.js');
import _ from 'lodash';

import { CircleSegments } from '../ext_custom/CircleSegments';

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
    // then adds a best guess at the % 'weight' of a question
    // and adds in all fieldsets with 'touched' class to the current score

    let progressWatcher = {
        lastQProgress : 0,
        lastFieldsets : 1,
        current : 0,
        latestIntervalGuess : 0
    }, progressDial;

    const obs = Bliss(`div#thiscoObs>div.thisco-obs-content`);
    obs.appendChild(Bliss.create("div",{
        className : "thisco-progress-dial",
        style : {
            'aspect-ratio' : 1,
            'position' : 'relative'
        }
    }));
    const progressGrain = 25;
    progressDial = new CircleSegments({
        target : ".thisco-progress-dial",
        rotationStart : -90,
        activeColors : ["crimson"],
        rounded : false,
        segmentNo : progressGrain,
        startExplode: 0,
        startRadius : 800,
        startIntRadius : 0,
        recessColor: "rgb(243 165 185 / .5)"
    });
    progressDial.init();

    const update = (pageTurn=false)=>{
        const progressEl = Bliss(`table.ProgressBarContainer`);
        const prog = {};
        ['valuemin','valuemax','valuenow'].forEach(val=>{
            prog[val] = parseInt(progressEl.getAttribute(`aria-${val}`));
        });
        const qProgress = (prog.valuemax - prog.valuemin) > 0 ? _.round(prog.valuenow / (prog.valuemax - prog.valuemin) * progressGrain) : 0;
        progressWatcher.current = qProgress + (Bliss.$("fieldset.touched").length * progressWatcher.latestIntervalGuess);
        if ((progressDial.options.startIntRadius == 0) && (progressWatcher.lastQProgress == 0) && (qProgress > 0)) {
            progressDial.options.startIntRadius = 450;
            progressDial.setProgress(_.ceil(progressWatcher.current),0);
        }
        else if (progressWatcher.current > progressGrain-1) {
            progressDial.options.startIntRadius = 0;
            progressDial.setProgress(_.ceil(progressWatcher.current),0);
        }
        else {
            // progressDial.options.startIntRadius = 0;
            progressDial.setProgress(_.ceil(progressWatcher.current),15);
        }

        if (pageTurn) {
            _.assign(progressWatcher,{
                lastQProgress : qProgress,
                lastFieldsets : _.clamp(Bliss.$("fieldset.touched").length,1,999),
                latestIntervalGuess : _.clamp((qProgress - progressWatcher.lastQProgress) / progressWatcher.lastFieldsets, 0, 999)
            })
        }

    };
    progressWatcher.update = update;

    return progressWatcher;
}