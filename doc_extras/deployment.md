### Build

Run `dev` and select build option.

The script will clarify which version you want built (although remember JS changes will already have been made in dev - roll back `/src` if necessary), or you can build all versions.

Build recipe is currently:

1. Compile SCSS into `skin.css`
2. Run `css_postprocess.js` on the version requested - this is currently autoprefixer and cssnano for all versions, and a strip-out of Qualtric styles for v3.0.0
3. Build and minify JS using esbuild (command is `build:js` defined in `package.json` if you need to edit options)
4. Make a copy of CS and JSS as `bundle.latest` based on the version set as `latest_alias` in package.json<sup>1</sup>

_<sup>1</sup>This is a build-step just for creating a 'latest' package designed for prefetch in the tasks page on the thiscovery site. It hasn't been implemented anyway so don't worry about it, just included in case._

### Deploy

Merging to the repo's `deploy` branch currently triggers an automatic action in AWS to copy dist to the serving S3 container.  If you run `npm run deploy` that will merge master and push to deploy, and trigger the AWS action.  There's a notifier on a slack channel to tell you it's done: #thisco-skin-deployment

The deployed files are then accessible currently via a URL like so:

`https://thiscovery-skin.s3.eu-west-1.amazonaws.com/dist/bundle.[X.X.X].[css|js]`

So in a Qualtrics survey, the JS needs to be included as a `<script>` tag in the survey header HTML, and the CSS can be linked under 'External CSS' (both found under the 'Look and Feel' options).  

As a production step, it needs to be checked that the survey is pointing to _these_ files, not the git repo.