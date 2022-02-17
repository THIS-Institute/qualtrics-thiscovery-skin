# qualtrics-thiscovery-skin
Javascript and CSS to customise Qualtrics surveys

Outputs:

- /dist/bundle.{version}.min.js
- /dist/bundle.{version}.min.css

## Installation

Requires node.js 16+ and npm 6+ (bundled in node) - in the cloned repo run:

```npm install ```

## Development

`npm run watch:scss` - watches all .scss in `/src/css` and creates .css files (skinjob script is set to watch /src)

`npm run skinjob` - run the 'skinjob' server to do live updating of a published survey (if it has this script in its header)

`npm run dev_build:js` - currently a script using parcel to bundle `/src/skin.js` into `/intermed` (don't really need it, as there's no way to test locally yet anyway)

## Build / Deploy

Run `npm run build` to do scss and postcss (autoprefixer and cssnano), and then uses `esbuild` to bundle and minify the js.  When the repo is pushed, AWS copies to S3, which is where survey looks for it.

<hr>

## Tools

### skinjob

This is the node script to run fast reloading and development of the main skin stylesheet. It runs a websocket server watching the local css file for changes, then prompts the browser to replace the CSS (without reloading). To run it, run:

```npm run skinjob ```

The command currently watches `src/css/skin.css`.

Then add a `thisco_dev=anything` key-value-pair to localStorage in the browser developer tools (usually under 'Application' or 'Storage') and reload survey. This activates the snippet in the js listening for the websocket.  Browsers will probably need some flags set to allow the comms to happen.  eg. in Firefox, in `about:config` set both `layout.css.constructable-stylesheets.enabled` and `network.websocket.allowInsecureFromHTTPS` to true (though remembers the latter flag needs switching off again at some point for security!).

**NB** The script won't start watching CSS until a websocket connects.