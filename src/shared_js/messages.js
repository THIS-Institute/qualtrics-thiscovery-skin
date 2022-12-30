const BlissfulJs = require('blissfuljs'); // module adds Bliss to window object for us, use Bliss. and Bliss.$. for $ and $$
const debug = require('debug')('thisco:messages.js');
import _ from 'lodash';
const emitter = require("tiny-emitter/instance");
const shortHash = require('short-hash');

/**
 * Sets up the message listener for [addMessage]{@link event:addMessage} and [killMessage]{@link event:killMessage} - require as object and run init()
 * @module messages 
 */

module.exports = function(){

    // expects to see a few elements to work

    const selectors = ['div#thiscoObs>div.thisco-obs-content'];
    allSelectors = selectors.every(sel=>{return Bliss(sel) instanceof HTMLElement;});
    if (!allSelectors) {
        debug('unable to locate elements for progress watcher - if expecting check sequencing');
        return {
            init : _.noop
        };
    }

    const addMessage = (message, messageId=null)=>{

        // if message has no id, id is message hash
        // and is checked for dupes

        messageId = messageId == null ? shortHash(message) : messageId;

        const msgContent = Bliss.create("div",{
            className : "thisco-message-content",
            contents : message
        })
        const el = Bliss.create("div",{
            className : "thisco-message",
            'data-thisco-msg-id' : messageId,
            contents : msgContent
        });
        if (Bliss(`div.thisco-message[data-thisco-msg-id="${messageId}"]`)) {
            return Bliss(`div.thisco-message[data-thisco-msg-id="${messageId}"]`);
        }
        if (Bliss(`div#thiscoObs div.thisco-messages`)) {
            Bliss(`div#thiscoObs div.thisco-messages`).appendChild(el);
        }
        return {el,messageId};
    };

    const killMessage = (messageId)=>{
        const victim = Bliss(`div.thisco-message[data-thisco-msg-id="${messageId}"]`);
        if (!victim) return null;
        victim.classList.add('message-dead');
        const disposeOfBody = ()=>{
            const bathtub = ()=>{
                try { 
                    victim.remove();
                } catch (error) {
                    // insert shrug emoji
                }
            }
            victim.addEventListener('animationend',bathtub);
            setTimeout(bathtub,1000);
        };
        requestAnimationFrame(disposeOfBody);
    };

    /**
     * Adds containing element if necessary, sets up listener
     * @listens addMessage
     * @listens killMessage
     */
    const init = ()=>{
        if (!Bliss(`div#thiscoObs div.thisco-messages`)) {
            Bliss(`div#thiscoObs>div.thisco-obs-content`).appendChild(Bliss.create('div',{className:'thisco-messages'}));
        }

        // set emiiter listener to add message
        // if a messageId is provided, use that to set a kill listener
        // otherwise message is killed on next click of window

        /**
         * @event addMessage
         * @description Pass this event the message body, and a messageId if you want message to persist and be killable -
         * otherwise, is killed on next click of window
         * 
         * @param {String} [msg] Message body to pass to addMessage
         * @param {String} [messageId] Message id to persist message (and flag for killMessage)
         */
        emitter.on("addMessage",(msg,messageId=false)=>{
            if (!_.isString(messageId)) {
                messageId = addMessage(msg).messageId;
                window.document.addEventListener("click",()=>{
                    killMessage(messageId);
                },{capture:true});
            }
            else {
                /**
                 * @event killMessage
                 * @description Call the event as `killMessage:${messageId}` - messages are 
                 * flagged with `message-dead` class, and then are removed on `animationend` or by 1000ms timeout, whichever is sooner
                 * to allow an exit animation to be applied
                 */
                const killEvent = `killMessage:${messageId}`;
                addMessage(msg,messageId);
                emitter.once(killEvent,()=>{
                    killMessage(messageId);
                });
            }
            return;
        });

    }

    return {
        init
    };

};