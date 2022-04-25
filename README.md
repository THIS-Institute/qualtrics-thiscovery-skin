# qualtrics-thiscovery-skin
Javascript and CSS to customise Qualtrics surveys

Outputs:

- /dist/bundle.{version}.min.js
- /dist/bundle.{version}.min.css

## Versions

- 2.0.0 - simple header and footer over existing CSS shims (so requires both sets of CSS and js in header snippet)
- 2.1.0 - new ground-up rewrite of the skin CSS (ie. not using existing CSS and JS, so will be backwardly _incompatible_ with older surveys)
- 3.0.0 - same CSS/styling as 2.1+ but rewritten in anticipation of non-Qualtrics usage (ie. not .Skin etc)

## Installation

Requires node.js 16+ and npm 6+ (bundled in node) - in the cloned repo run:

```npm install ```

## Development

_Easiest_ : Run `npm run dev` to get various options, set version to work on, build, set 'Latest' etc.

You can run tasks separately using package.json scripts:

`npm run watch:scss` - watches all .scss in `/src/css` and creates .css files (skinjob script is set to watch /src)

`npm run skinjob` - run the 'skinjob' server to do live updating of a published survey (if it has this script in its header)

## Build / Deploy

Build in dev.js or run `npm run build` to do scss and postcss (autoprefixer and cssnano), and then use `esbuild` to bundle and minify the js.  When the repo is pushed, AWS copies to S3, which is where survey looks for it.

<hr>

## Tools

### skinjob

This is the node script to run fast reloading and development of the main skin stylesheet. It runs a websocket server watching the local css file for changes, then prompts the browser to replace the CSS (without reloading). To run it, run:

```npm run skinjob ```

The command currently watches `src/css/skin.css`.

Then add a `thisco_dev=anything` key-value-pair to localStorage in the browser developer tools (usually under 'Application' or 'Storage') and reload survey. This activates the snippet in the js listening for the websocket.  Browsers will probably need some flags set to allow the comms to happen.  eg. in Firefox, in `about:config` set both `layout.css.constructable-stylesheets.enabled` and `network.websocket.allowInsecureFromHTTPS` to true (though remembers the latter flag needs switching off again at some point for security!).

**NB** The script won't start watching CSS until a websocket connects.
