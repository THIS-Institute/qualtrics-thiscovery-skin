// skin dev script v.2

const debug = require('debug')('thisco-dev'); 

const package = require(__dirname+'/package.json');
let current_version = package.version;
let latest_alias = package.latest_alias;
const version_log = require(__dirname+"/versions.json");
const chalk = require('chalk');
const { Select, Confirm, Input } = require('enquirer');
const fs = require("fs");
const { execSync } = require('child_process');
const { forIn, keys } = require('lodash');
const hasScheme = require('has-scheme');

const { argv } = require('process');
let [nX,sPath,altport] = [...argv,null];

altport = altport || 3000;

const log = console.log;

log(chalk.green("\nTHISCOVERY QUALTRICS SKIN DEVELOPMENT v2"));
log(chalk.green("========================================"));

const top_choices = [
    "Exit",
    "Develop",
    "Build"
];

async function go (){

    log(chalk.grey("Available versions are:\n"));
    forIn(version_log,(value,key)=>{
        log(chalk.cyanBright(`${key}\t\t`)+chalk.yellow(`${value}`));
    });
    log(chalk.grey("\n'Latest' is set to: \t\t")+chalk.cyanBright(latest_alias)+"\n");

    let prompt = new Select({
        name: 'option',
        message: 'What do you want to do?',
        choices : top_choices
    });
    const choice = await prompt.run();

    switch (choice.charAt(0)) {
        case "S":
            // write latest
            choices = Object.keys(version_log).map(k=>({message:`${k} : ${version_log[k]}`,value:k}));
            prompt = new Select({
                name : 'choose_version',
                message : 'Set "Latest" alias to which version:',
                choices
            });
            const latest_choice = await prompt.run();
            const can_do = fs.existsSync(__dirname+"/dist/bundle.${latest_choice}.js");
            if (!can_do) {
                log(chalk.red(`\n** Version ${latest_choice} build does not exist - build it first? **\n`));
                return go();
            }
            if (latest_choice !== latest_alias) {
                // update
                latest_alias = latest_choice;
                package.latest_alias = latest_alias;
                try {
                    fs.writeFileSync(__dirname+"/package.json",JSON.stringify(package,null,"\t"),{encoding:'utf8'});
                    execSync(
                        `cp ./dist/bundle.${latest_alias}.css ./dist/bundle.latest.css & cp ./dist/bundle.${latest_alias}.js ./dist/bundle.latest.js`,
                        { stdio : "inherit" }
                    );
                    log(chalk.greenBright("\nUpdated!"));                   
                } catch (error) {
                    throw(error);
                    process.exit(1);
                }
            }
            return go();

        case "B":
            prompt = new Select({
                name : 'version_choice',
                message : 'Choose a version to build, or Build All',
                choices : keys(version_log).concat(["Build All","Cancel"])
            });
            const v_choice = await prompt.run();
            if (v_choice == "Cancel") {return go();}
            const do_build = (version)=>{
                const tasks = {
                    'compiled SCSS':`npx sass ./src/v${version}/css/skin.scss ./src/v${version}/css/skin.css --embed-sources`,
                    'ran PostCSS':'node ./css_postprocess.js',
                    'built and minified JS':`npx esbuild ./src/v${version}/js/skin.js --bundle --minify --sourcemap --loader:.md=text --outfile=./dist/bundle.${version}.js --target=es2016,chrome94,firefox94,safari13,edge96,node12`,
                    'created "Latest" copy':`cp ./dist/bundle.${latest_alias}.css ./dist/bundle.latest.css & cp ./dist/bundle.${latest_alias}.js ./dist/bundle.latest.js`
                };
                forIn(tasks,(task,taskname)=>{
                    try {
                        execSync(task,{
                            stdio : "inherit"
                        });   
                    } catch (error) {
                        throw(error);
                        process.exit(1);
                    }
                    log(chalk.greenBright(`[${version}] ${taskname}`));
                });
                return go();
           };
            if (v_choice == "Build All") {
                keys(version_log).forEach(do_build);
            }
            else {
                do_build(v_choice);
            }

            process.exit(0);

        case "D":
            prompt = new Input({
                message : 'Enter a URL or local file to work from:',
                initial : '/test_pages/index.html'
            });
            const target = await prompt.run();

            const isURL = hasScheme(target);
            if (!isURL && !fs.existsSync(__dirname+target)) {
                log(chalk.redBright("Cannot find this filename"));
                return go();
            }

            choices = Object.keys(version_log).map(k=>({message:`${k} : ${version_log[k]}`,value:k}));
            prompt = new Select({
                name : 'choose_version',
                message : 'Choose version to work on:',
                choices
            })
            const version_choice = await prompt.run();

            prompt = new Select({
                name : 'browser_choice',
                message : 'Open a browser? (make sure is an installed browser)',
                choices : [`"firefox"`,`"google chrome"`,`"safari"`,`"edge"`,`I'll do it`]
            });
            const browser = await prompt.run();
            prompt = new Confirm({
                name : "add_skinjob",
                message : "Include skinjob.js?"
            });
            const conf_skinjob = await prompt.run();

            // runs npm processes in package json
            let tasks = `TG_VERSION=${version_choice} run-p watch:js watch:scss`;
            tasks += browser == "I'll do it" ? ` bsync ${target}` : ` "bsync ${target} ${browser} ${altport}"`;
            tasks += conf_skinjob ? ' dev:skinjob' : '';
            try {
                debug(`Starting watches on CSS and JS for version ${version_choice}${!conf_skinjob ? '' : ` and running SkinJob on same version`}`);                
                execSync(
                    tasks,
                    { stdio : "inherit" }
                );
            } catch (error) {
                if (error.signal == "SIGINT") {
                    log(chalk.greenBright("\nExiting!"));
                    process.exit(1);
                }
                else {
                    throw error;
                }
            }         
            
        default:
            process.exit(0);
    }
}

go();