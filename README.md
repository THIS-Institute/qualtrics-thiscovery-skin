# qualtrics-thiscovery-skin
Javascript and CSS to customise Qualtrics surveys

## Outputs

- /dist/bundle.{version}.min.js
- /dist/bundle.{version}.min.css

## Versions

- 2.0.0 - simple header and footer over existing CSS shims (so requires both sets of CSS and js in header snippet)
- 2.1.0 - new ground-up rewrite of the skin CSS (ie. not using existing CSS and JS, so will be backwardly _incompatible_ with older surveys)
- 2.2.0 - same CSS as 2.1.x but re-organising script into setup() and update() to better leverage Qualtrics cycle
- 3.0.0 - thiscovery-only version of 2.x for use in survey documentation - not in any production use yet elsewhere or for forseeable

## Installation

Requires node.js 16+ and npm 6+ (bundled in node) - in the cloned repo run:

```npm install ```

## Development and Building

Run the `dev` script to get started (either with `npm run dev` or in your VDE of choice). You should see the following:

   ![](./dev_script_options.png)

## Documentation

New JsDoc documentation following shortly...
