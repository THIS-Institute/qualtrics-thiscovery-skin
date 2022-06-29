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

1. Run `npm run dev` 
2. It will give you some options:

   ![](./dev_script_options.png)

3. Select 1 to confirm which version you are working on.
4. Then select 3 to start the various development watches (CSS and JS in /src) 
5. It will ask if you want to run SkinJob as well for instant CSS changes (see more below)
6. Ctrl-C out of the script to kill watches when done.

## Setting 'Latest' (Option 2 in dev)

This is not something that regularly needs changing.  All it does is set which version of the skin package the build script makes a copy of as 'Latest'.  Currently this is only used (in theory) by the prefetch link in the platform to improve performance swinging between front matter and the Qualtrics survey engine.

## Build / Deploy

Make sure you are set to the right version you want to build by using `npm run dev` (see above).  Then build it using the same script, or run `npm run build`.

Build process is currently:

1. Compile SCSS of selected version
2. PostCSS the compiled CSS (minification)
3. Build and minify the JS of selected version
4. Make a 'Latest' copy of version currently flagged to be 'Latest' (see above)

Commit and merge the repo to deploy.  When the repo is pushed, AWS automatically copies to the S3 bucket, which is where the Qualtrics survey, the survey manual pages etc look for it.

<hr>

## Tools

### Setting up 'skinjob'

This is the node script to run fast reloading and development of the main skin stylesheet. It runs a websocket server watching the local css file for changes, then prompts the browser to replace the CSS (without reloading). The `dev` script will ask if you want to run it as well as the other watches when selecting the 'develop' option. To run it independently, run:

```npm run skinjob ```

The command currently watches `src/css/skin.css`. (So when dev rebuilds the SCSS to skin.css, this triggers skinjob)

1. Add a `thisco_dev=anything` key-value-pair to localStorage in the browser developer tools (usually under 'Application' or 'Storage') and reload survey. This activates the snippet in the js listening for the websocket.  
2. Browsers will probably need some flags set to allow the comms to happen.  eg. in Firefox (recommended), in `about:config` set both `layout.css.constructable-stylesheets.enabled` and `network.websocket.allowInsecureFromHTTPS` to true (though remembers the latter flag needs switching off again at some point for security!).