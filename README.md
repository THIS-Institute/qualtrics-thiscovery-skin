# qualtrics-thiscovery-skin
Javascript and CSS to customise Qualtrics surveys

Outputs:

- /dist/bundle.{version}.min.js
- /dist/bundle.{version}.min.css

## Versions

- 2.0.0 - simple header and footer over existing CSS shims (so requires both sets of CSS and js in header snippet)
- 2.1.0 - new ground-up rewrite of the skin CSS (ie. not using existing CSS and JS, so will be backwardly _incompatible_ with older surveys)
- 3.0.0 - takes all CSS from 2.1.x but strips it of Qualitrics styles (anything '.Skin *' as selector)

## Installation

Requires node.js 16+ and npm 6+ (bundled in node) - in the cloned repo run:

```npm install ```

## Development

_Easiest_ : Run `npm run dev` to get various options, set version to work on, build, set 'Latest' etc.

You can run tasks separately using package.json scripts:

`npm run watch:scss` - watches all .scss in `/src/css` and creates .css files (skinjob script is set to watch /src)

`npm run skinjob` - run the 'skinjob' server to do live updating of a published survey (if it has this script in its header) __see notes below for setting this up__

## Build / Deploy

Make sure you are set to the right version you want to build by using `npm run dev`.  Then build in using the same script, or if you want to do it 'manually' run `npm run build` to do scss and postcss (autoprefixer and cssnano), and then use `esbuild` to bundle and minify the js.  

When the repo is pushed, AWS automatically copies to the S3 bucket, which is where the Qualtrics survey, the survey manual pages etc look for it.

<hr>

## Tools

### skinjob

This is the node script to run fast reloading and development of the main skin stylesheet. It runs a websocket server watching the local css file for changes, then prompts the browser to replace the CSS (without reloading). To run it, run:

```npm run skinjob ```

The command currently watches `src/css/skin.css`. (So when dev rebuilds the SCSS to skin.css, this triggers skinjob)

1. Add a `thisco_dev=anything` key-value-pair to localStorage in the browser developer tools (usually under 'Application' or 'Storage') and reload survey. This activates the snippet in the js listening for the websocket.  
2. Browsers will probably need some flags set to allow the comms to happen.  eg. in Firefox (recommended), in `about:config` set both `layout.css.constructable-stylesheets.enabled` and `network.websocket.allowInsecureFromHTTPS` to true (though remembers the latter flag needs switching off again at some point for security!).