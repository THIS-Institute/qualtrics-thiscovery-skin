const browserSync = require("browser-sync").create();
const { argv } = require('process');
const hasScheme = require('has-scheme');
const { existsSync, readFileSync } = require('fs');
const debug = require('debug')('thisco-dev:bsync'); 
const version_log = require(__dirname+"/versions.json");
const parse = (i)=>{
    try {
        let o = new URL(i);
        return o;
    } catch (e) {
        return {
            pathname : i
        }
    } 
};

const got = require('got');

const { Input } = require('enquirer');
const { lowerCase } = require("lodash");

let [nX,sPath,target,browser,altport] = [...argv,null,null,null];

altport = altport || 3000;
target = target == null ? "." : target;

let replacement_domain = "";

const middleware = async (req,res,next) => {
    debug('requested : ',req.url);
    const pathname = parse(req.url).pathname;
    // if path is /dist/bundle.x.x.x.{js,css,js.map,css.map}
    if ((pathname.match(/dist\/bundle\.\d\.\d\.\d\.((js\.map)|(css\.map)|(js)|(css))/)) && existsSync(__dirname+(pathname))) {
        debug(`Matched : ${pathname}`);
        // serve from local
        let localFile = readFileSync(__dirname+pathname,{
            encoding : 'utf-8'
        });
        const ext = pathname.split(".").slice(-1);
        debug({ext});
        switch (ext[0]) {
            case "css":
                debug(`Serving local css`);
                res.setHeader('Content-Type','text/css');
                break;
            
            case "js":
                debug(`Serving local js`);
                res.setHeader('Content-Type','text/javascript');
                localFile = `localStorage.setItem('thisco_dev','any_value'); localStorage.setItem('debug','thisco:*');;;` + localFile;
                break;
        
            default:
                res.setHeader('Content-Type','application/json');
                break;
        }
        res.end(localFile);
    }
    else {
        // intercept data
        // is this going to be HTML?

        const ext = pathname.split(".").slice(-1);
        const likelyRoot = pathname == parse(target).pathname;
        debug(`likelyRoot: ${pathname} is ${likelyRoot}`);
        if (likelyRoot && hasScheme(target)) {
            debug(`Pulling: ${target}`);
            let {body} = await got({
                url:target
            });
            body = body.replaceAll(replacement_domain,"https://localhost:3000");
            res.end(body);
        }
        else if (likelyRoot) {
            let localBody = readFileSync(__dirname+target,{
                encoding : "utf-8"
            });
            localBody = localBody.replaceAll(replacement_domain,"https://localhost:3000");
            res.end(localBody);
        }
    }
    next();
}

const go = async()=>{

    replacement_domain = "https://this-institute.github.io/qualtrics-thiscovery-skin";

    if (hasScheme(target)) {
        browserSync.init({
            files: "dist/**.*",
            proxy: target,
            browser : lowerCase(browser) || "firefox",
            port:altport,
            ui : {
                port : altport+1
            },
            middleware
        });
    }
    else {
        debug('starting local directory server');
        browserSync.init({
            files: "dist/**.*",
            server : {
                baseDir : __dirname,
            },
            browser : browser || "firefox",
            startPath: `${target}`,
            port: altport,
            ui : {
                port : altport+1
            },
            middleware
        })

    }
}

go();