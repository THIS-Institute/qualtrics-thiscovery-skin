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

Requires at least node.js 16+ and npm 6+ (bundled in node) - in the cloned repo run:

```npm install ```

## Documentation

Instructions on development scripts have been moved to the documentation, under the 'Tutorials' section.

The documentation has been set up to build using [jsdoc](https://jsdoc.app) and a few automated scripts.  To read the docs, run `npm run read_docs`.

To update the documentation, make sure you have [jsoc installed globally](https://github.com/jsdoc/jsdoc#installation-and-usage), and then run `npm run watch:docs`. This will watch all js for changes, as well as the markdown files in `./doc_extras`, which is were the 'Tutorial' pages live.  Add any images, assets to `./doc_static`.