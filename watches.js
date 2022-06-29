const sass = require('sass');
const chokidar = require('chokidar');
const esbuild = require('esbuild');
const { argv } = require('process');
const debug = require('debug')('thisco-dev-watches'); 
const package = require(__dirname+'/package.json');
let current_version = package.version;

let [nX,sPath,version_choice] = [...argv,null];

if (version_choice == null) {
    version_choice = current_version;
    debug(`No dev version specified - assuming package.json version of ${current_version}`);
}


