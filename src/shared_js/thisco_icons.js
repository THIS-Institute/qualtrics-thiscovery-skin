const debug = require('debug')('thisco:thisco_icons.js');
import { html, LitElement } from 'lit';

const iconLib = {
    'cross' : {
        'svg' : `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" viewBox="0 0 100 100">  <path d="M32.9 50 9.7 25.7a3 3 0 0 1 .1-4.3L23.3 9a3 3 0 0 1 4.2.1L50 32.5h.2L72.5 9a3 3 0 0 1 4.2-.1l13.5 12.5a3 3 0 0 1 .1 4.2L67.1 50l23.2 24.3c.6.5.9 1.3.8 2.1a3 3 0 0 1-1 2.1L76.8 91a3 3 0 0 1-4.2-.1L50 67.5h-.2L27.5 91a3 3 0 0 1-4.2.1L9.8 78.5a3 3 0 0 1-.1-4.2L32.9 50Z" style="fill:currentColor;fill-rule:nonzero"/></svg>`,
        'fallback' : '\u2716'
    },
    'check' : {
        'svg' : `<svg width="100%" height="100%" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M97.369,21.803l-12.56,-12.23c-1.393,-1.255 -2.854,-1.072 -4.5,0.5l-42.93,43.92l-16.49,-17.1c-0.56,-0.59 -1.34,-0.92 -2.16,-0.92c-0.81,-0 -1.59,0.33 -2.16,0.92l-14.01,14.49c-1.13,1.16 -1.12,3.01 0,4.17l33.77,34.79c0.57,0.58 1.34,0.91 2.15,0.91l0.07,-0c0.84,-0.02 1.62,-0.39 2.18,-1.01l56.8,-64.29c1.07,-1.2 0.99,-3.03 -0.16,-4.15Z" style="fill:currentColor;fill-rule:nonzero;"/></svg>`,
        'fallback' : '\u2713;'
    },
    'pause' : {
        'svg' : `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" viewBox="0 0 100 100"><path d="M43.75 19.42c0-3.45-2.8-6.25-6.25-6.25H25a6.25 6.25 0 0 0-6.25 6.25v61.33c0 3.45 2.8 6.25 6.25 6.25h12.5c3.45 0 6.25-2.8 6.25-6.25V19.42Zm37.5 0c0-3.45-2.8-6.25-6.25-6.25H62.5a6.25 6.25 0 0 0-6.25 6.25v61.33c0 3.45 2.8 6.25 6.25 6.25H75c3.45 0 6.25-2.8 6.25-6.25V19.42Z" style="fill:currentColor;fill-rule:nonzero;"/></svg>`,
        'fallback' : '\u23f8'
    },
    'play' : {
        'svg' : `<svg width="100%" height="100%" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><path d="M85 47c3 2 3 4 0 6L27 87c-4 1-5-1-6-4V17c1-3 3-5 6-3l58 33Z" style="fill:currentColor;fill-rule:nonzero;"/></svg>`,
        'fallback' : '\u25ba'
    },
    'unknown' : {
        'fallback' : "?"
    }
};

// create a web component thisco-icon which takes icon="" as sole attribute

module.exports = function(){

    class ThiscoIcon extends LitElement {

        static properties = {
            icon: {type:String}
        }

        constructor() {
            super();
            // get icon definition
            this.icon = "unknown";
        }

        render(){
            let iconTemplate = iconLib[this.icon];
            if (!iconTemplate) return html`<span>?</span>`;
            else if (!iconTemplate.svg) return html`<span>${iconTemplate.fallback || '?'}</span>`;
            else {
                const cont = document.createElement("span");
                cont.innerHTML = iconTemplate.svg;
                return cont;
            }
        }

    }

    if (customElements.get('thisco-icon') === undefined) {
        debug('defining thisco-icon');
        customElements.define('thisco-icon',ThiscoIcon);
    }
}