const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
import { uniqueId, noop } from 'lodash';
const debug = require('debug')('thisco:custom_video.js');
const load = require('load-script');

// customvideo.js
//
// 1.0.0
//
// ** Outstanding **
// - full subtitle/multi-language support
// - subtitle button - needs to be a switch
// - integrated progress counter in Play/Pause button?

const videoCompVersion = "1.0.1";
debug(`Video comp version: ${videoCompVersion}`);

/**
 * Sets up any video elements with [video.js](https://videojs.com/) and parses class 
 * options - see details in the [survey documentation](https://survey-docs.thiscovery.org/#/media-and-video)
 * @module
 */

module.exports = function(){
    // set up markup first?
    const videoElements = Bliss.$(".thisco-video");
    debug({videoElements});
    if (videoElements.length < 1) return;

    videoElements.forEach(el=>{
        const src = el.dataset?.src;
        const track = el.dataset?.track || null;
        const hasSubs = track !== null; // this all presumes one subtitle track v. languages AND closed captions **LATER VERSION**
        const setup = el.dataset?.setup || "{}";
        const no_controls = el.classList.contains("play-only");
        const no_picture_in_picture = el.classList.contains("no-pic-in-pic");
        const force_fullscreen = el.classList.contains("force-fullscreen");
        if (!src) {
            console.warn("Thiscovery: attempted video element being instantiated without a source"); return;
        }
        if (el.closest('fieldset')) el.closest('fieldset').classList.add("thisco-video");
        let id = `thisco_video_${uniqueId()}`;
        el._.set({'data-container-id':id});

        // create thiscovery controls if we need them
        // a) if play-only, add a play/pause button
        // b) if we have a track add a subtitles button (even if in controls)
        // 
        // handlers are set below when videojs is loaded
        //

        let thiscoveryControls = null;
        if (no_controls || (hasSubs)) {
            thiscoveryControls = Bliss.create("div",{
                id : `controls_${id}`,
                className : 'thisco-video-controls controls-unready'
            });
            if (no_controls) {
                thiscoveryControls.appendChild(Bliss.create("button",{
                    id : `play_${id}`,
                    className : "btn thisco-btn no-invert thisco-play-button",
                    contents : [{tag:'thisco-icon',icon:"play"},` Play${force_fullscreen ? ' (Fullscreen)':''}`]
                }))
            }
            if (hasSubs) {
                thiscoveryControls.appendChild(Bliss.create("button",{
                    id : `cc_${id}`,
                    className : "btn thisco-btn no-invert inactive",
                    contents : ["Subtitles ",{tag:"thisco-icon",icon:"cross"}]
                }))
            }

        }

        el._.set({'data-vjs-player':true});
        el.innerHTML = ""; // all content in holding div is removed (proper fallback?)
        el._.contents([Bliss.create("figure",{
            className : "thisco-video-figure",
            contents : [{
                tag: "video",
                id,
                className : "video-js vjs-fluid",
                contents: [{
                    tag : "source",
                    src,
                    type: "video/mp4" //*** NEED TO PARSE VIDEO TYPE ***/
                },(track !== null ? {
                    tag : "track",
                    label : "captions on",
                    src : track,
                    crossorigin : "anonymous",
                    disablePictureInPicture: no_picture_in_picture, // may not be cross-browser consistent esp. Firefox
                } : null)],
                controls : !no_controls,
                crossorigin : "anonymous",
                'data-setup' : setup,
                preload : 'auto',
                poster : `https://thiscovery-public-assets.s3.eu-west-1.amazonaws.com/videos/thisco_poster.png`
            }]
        }),thiscoveryControls]);
    });

    // load dependency video.js
    load('https://vjs.zencdn.net/7.20.3/video.min.js',(err)=>{
       if (err) {
            debug("unable to load video.js");
        }
        else if (typeof videojs === "undefined") {
            debug("unable to find videojs library in window");
        }
        else {
            debug("video.js loaded");

            videoElements.forEach(el=>{

                const id = el.dataset.containerId;
                const track = el.dataset?.track || null;
                const hasSubs = track !== null; // this all presumes one subtitle track v. languages AND closed captions **LATER VERSION**        
                const play_once = el.classList.contains("play-once");
                const force_fullscreen = el.classList.contains("force-fullscreen");
                const player = videojs(id);
                const videoEl = Bliss("video",player.el());

                const handlePlayPauseButton = (evt)=>{
                    evt.stopPropagation();
                    evt.currentTarget.blur();
                    // check video state
                    const playing = !player.paused();
                    if (playing) {
                        // pause and switch button to play (resume)
                        evt.currentTarget.innerHTML = `<thisco-icon icon="play"></thisco-icon> Play${force_fullscreen ? ' (Fullscreen)':''}`;
                        evt.currentTarget.classList.remove("is-playing");
                        player.pause();
                        return;
                    }
                    else {
                        // play and switch button to pause
                        evt.currentTarget.innerHTML = `<thisco-icon icon="pause"></thisco-icon> Pause`;
                        evt.currentTarget.classList.add("is-playing");
                        if (force_fullscreen) {
                            videoEl.focus();
                            player.requestFullscreen();
                        }
                        player.play();
                        return;
                    }
                };
                const handleSubsButton = (evt)=>{
                    const subsButt = evt.currentTarget || Bliss(`button#cc_${id}`);
                    if (!subsButt) return;
                    evt.stopPropagation();
                    subsButt.blur();

                    const subtitles = player.textTracks()[0] || {}; // presumes only one captions track

                    if (subsButt.classList.contains("inactive")) {
                        subsButt.classList.remove("inactive");
                        subsButt.innerHTML = `Subtitles <thisco-icon icon="check"></thisco-icon>`;
                        subtitles.mode = "showing";
                    } else {
                        subsButt.classList.add("inactive");
                        subsButt.innerHTML = `Subtitles <thisco-icon icon="cross"></thisco-icon>`;
                        subtitles.mode = "hidden";
                    }
                };
                const handleVideoEnd = (evt)=>{
                    const playButt = Bliss(`button#play_${id}`);
                    playButt.classList.remove("is-playing");
                    if (player.isFullscreen()) player.exitFullscreen();
                    if (play_once) {
                        playButt.innerHTML = "End of video";
                        playButt._.set({disabled:true});
                        playButt._.unbind({"click":handlePlayPauseButton});
                        return;
                    }
                    else {
                        playButt.innerHTML = `<thisco-icon icon="play"></thisco-icon> Restart`;
                        return;
                    }
                };
                player.ready(()=>{
                    if (Bliss(`#controls_${id}`)) Bliss(`#controls_${id}`).classList.remove('controls-unready');
                    if (Bliss(`button#play_${id}`)) Bliss(`button#play_${id}`).addEventListener('click',handlePlayPauseButton);
                    if (Bliss(`button#cc_${id}`)) Bliss(`button#cc_${id}`).addEventListener('click',handleSubsButton);
                    Bliss(`#${id}>video`).addEventListener('ended',handleVideoEnd);
                    Bliss(`#${id}>video`).addEventListener('keypress',(evt)=>{
                        if (![evt.code,evt.key].includes("Space")) {
                            return;
                        }
                        evt.stopPropagation();
                        handlePlayPauseButton.call(this,{
                            stopPropagation : noop,
                            currentTarget : Bliss(`button#play_${id}`)
                        })
                        return;
                    });

                });
            });
        }
    });
}