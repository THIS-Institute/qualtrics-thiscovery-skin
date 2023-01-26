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

To update the documentation, make sure you have [jsoc installed globally](https://github.com/jsdoc/jsdoc#installation-and-usage),
and then run `npm run watch:docs`. This will watch all js for changes, as well as the markdown files in `./doc_extras`,
which is were the 'Tutorial' pages live.  Add any images, assets to `./doc_static`.

## Workflow

Follow these steps for CSS updates to qualtrics surveys

1. Find a qualtrics survey that has the behaviour you want to change.
  The qualtrics survey in the THIS account named "E2E Test Survey [skin v2.1.0]"
  usually has all the functionality that you will need.

       https://thisinstitute.fra1.qualtrics.com/jfe/form/SV_0kAu2Hthu9RWxpQ
2. Copy the distribution URL for the survey.
3. Run the `npm run dev` script. These scrips are defined in package.json and 
  can be run in PyCharm directly. For more details of running the dev server,
  see [Development]{@tutorial development}.  
   1. Choose `Develop`
   2. Paste the anonymous link
   3. Choose the version, usually 2.1.0
   4. Choose your browser. Firefox tends to be slightly better than the others.
   5. Skinjob false is fine
   6. Wait for it to do its npm stuff
   7. It should print out a URL and open a browser window with the survey
   8. The survey should contain the CSS
4. Once you've got the survey, you can make the change you want to the CSS files
5. When you are happy with the new CSS, commit the changes to a branch.
6. Run the `npm run dev` script again, but this time choose `Build`. For more 
  details see [Build and deployment]{@tutorial deployment}
7. The `Build` command will update a load of compiled files. Commit these. 
8. Open a PR with the source code changes and the compiled files.
9. When approved, merge to master. This will kick off the 'pages build and 
  deployment' action on GitHub, which will make the CSS and JS available
  publicly.
10. Check the survey can load the built CSS. For more details see 
[Survey Setup]{@tutorial survey_setup}

    This is the link to the built CSS:

        https://this-institute.github.io/qualtrics-thiscovery-skin/dist/bundle.2.1.0.css
    1. Open the survey
    2. Go to the paintbrush roller (Look and feel)
    3. Go to Style
    4. Scroll down and paste the GitHub link into the External CSS box
11. Deploy to AWS by either
    1. Run `npm run deploy`
    2. If that doesn't work, check out the deploy branch, merge master, push,
      checkout master.