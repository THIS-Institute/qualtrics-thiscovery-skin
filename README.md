# qualtrics-thiscovery-skin
Javascript and CSS to customise Qualtrics surveys

Outputs:

- /dist/bundle.{version}.min.js
- /dist/bundle.{version}.v2.min.css

## Installation

Requires node.js 16+ and npm 6+ (bundled in node) - in the cloned repo run:

```npm install ```

## Development

_ TO FOLLOW deets of scripts_

## tools/skinjob

This is the node script to run fast reloading and development of the main skin stylesheet. It runs a websocket server watching the local css file for changes, then prompts the browser to replace the CSS (without reloading). To run it, run:

```npm run skinjob ```

The command currently watches `src/css/skin.css`.

Then add `&thisco_dev=true` to parameters in the qualtrics survey URL and reload. This activates the snippet in the js listening for the websocket.  Browsers will probably need some flags set to allow the comms to happen.  eg. in Firefox, in `about:config` set both `layout.css.constructable-stylesheets.enabled` and `network.websocket.allowInsecureFromHTTPS` to true (though remembers the latter flag needs switching off again at some point for security!).

**NB** The script won't start watching CSS until a websocket connects.

## Deployment