const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const { uniqueId } = require('lodash');
const debug = require('debug')('thisco:custom_video.js');
const load = require('load-script');

module.exports = function(){
    // set up markup first?
    const videoElements = Bliss.$(".thisco-video");
    debug({videoElements});
    if (videoElements.length < 1) return;

    videoElements.forEach(el=>{
        const src = el.dataset?.src;
        const setup = el.dataset?.setup || "{}";
        if (!src) {
            console.warn("Thiscovery: attempted video element being instantiated without a source"); return;
        }
        if (el.closest('fieldset')) el.closest('fieldset').classList.add("thisco-video");
        const id = `thisco_video_${uniqueId()}`;
        el._.set({'data-vjs-player':true});
        el._.contents(Bliss.create("video",{
            id,
            className : "video-js",
            contents: [{
                tag : "source",
                src
            }]
        }));
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
            // load vimeo plugin
            load('https://player.vimeo.com/video/90283590?h=ee7845b7cb',(err)=>{
                if (err) {
                    debug("unable to load video.js");
                }
            })
        }
    });
}