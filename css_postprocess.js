let postcss = require('postcss');
const fs = require("fs");
const { argv } = require('process');
let [node_exec,this_exec,version] = argv;
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const discard = require('postcss-discard');
const {join} = require('path');
const npm_package_version = require('./package.json').version;

if (!version) version = npm_package_version;

const path_in = join(`./src/v${version}/css/skin.css`);
const path_out = join(`./dist/bundle.${version}.css`);

console.log(`\nPostCSSing version ${version} : ${path_in} to ${path_out}...\n`);

const plugin_options = {
    "3.0.0" : [autoprefixer,cssnano,discard({rule:/\.Skin/})]
}
const plugins = plugin_options[version] || [autoprefixer,cssnano];

fs.readFile(path_in, (err, css) => {
    postcss(plugins)
      .process(css, { from: path_in, to: path_out })
      .then(result => {
        fs.writeFile(path_out, result.css, () => true)
        if ( result.map ) {
          fs.writeFile(`${path_out}.map`, result.map.toString(), () => true)
        }
      })
  });