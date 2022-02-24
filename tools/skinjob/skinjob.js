const _ = require("lodash");
const commandLineUsage = require('command-line-usage');
const commandLineArgs = require('command-line-args');
const chalk = require("chalk");

const log = console.log.bind(console);

// command line

const mainDefinitions = [
    { name: 'cssfile', defaultOption: true }
  ]
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true });
const argv = mainOptions._unknown || [];

// parse first param

const { cssfile } = mainOptions;

const optionList = [{
    name: "port",
    alias: "p",
    type: Number,
    description: "local port to run websocket on"
},{
    name: "help",
    alias: "h",
    type: Boolean,
    description : "display this"
},{
    name: "debounce",
    alias: "d",
    type: Number,
    description : "debounce watcher",
    typeLabel : "ms"
}];

const dieHelp = ()=>{
    const sections = [
        {
            header: "SkinJob",
            content: "Very simple server just watching a CSS file and pinging it to a local websocket for live sheet reloading"
        },{
            header: "Synopsis",
            content:[ "$ node skinjob.js [path to CSS sheet] [options]","$ node skinjob.js help"]
        },{
            header: "Options",
            optionList
        }
    ];
    const usage = commandLineUsage(sections);
    log(usage);
    process.exit();
}

if (_.isEmpty(cssfile) || (cssfile === "help")) {
    // die with help def
    dieHelp();
}

// parse options
let { port, help, debounce } = _.assign({
    port : 34567,
    help : null,
    debounce : 500
}, commandLineArgs(optionList,{ partial: true })); // defaults

if (!!help) {
    // die with help def
    dieHelp();
}

log(chalk.blueBright("SkinJob.js ===========\n"));
log(chalk.magenta("NB:\tthis will serve over an insecure websocket (ws) which will likely need to be enabled in browser preferences\n"));
log(chalk.magenta("\tFirefox also needs enabling of stylesheet contruction"));

// socket setup

const express = require('express');
const app = express();const http = require('http');
const { Server } = require("socket.io");
const server = http.createServer(app);
const chokidar = require('chokidar');
const { readFileSync } = require("fs");
const validateCss = require("css-validator");

app.get('/', (req, res) => {  res.send('This achieves nothing');});
server.listen(port, () => {  
    log(chalk.green(`listening on port ${port}`));
});

const io = new Server(server);
log(chalk.green(`websocket open`));

// DEV - assume client connected
io.on("connection", (socket)=>{
    console.log(chalk.green(`Client connected...`));

    const watcher = chokidar.watch(cssfile,{
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
    });

    const handleChange = _.debounce((path) => {
        log(chalk.yellowBright(`changes made to ${path}`));
        let contents = readFileSync(cssfile,{encoding:"utf-8"});
        validateCss(contents,(err,{validity=false,errors=[],warnings=[]}={})=>{
            const valid = validity && !errors.length;
            if (!valid) {
                // warn errors and stop
                log(chalk.redBright("CSS Errors:"));
                errors.forEach(err=>log(chalk.red(`Line ${err.line || "??"}: ${err.message}`)));
                return;
            }
            else {
                // broadcast on socket changes
                log((warnings.length ? chalk.yellow : chalk.green)(`CSS valid with ${warnings.length} warnings`));
                if (warnings.length) warnings.forEach(warn=>log(chalk.yellow(`Line ${warn.line || "??"}: ${warn.message}`)));
                socket.emit('skinjob_update',contents);
            }
        });
    },debounce);
    
    watcher.on('ready',()=>log(chalk.green(`watching ${cssfile}`)));
    watcher.on('change',handleChange);

    handleChange(cssfile); // fire once for page reloads

}); 