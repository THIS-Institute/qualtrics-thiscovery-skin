const package = require(__dirname+'/package.json');
let current_version = package.version;
let latest_alias = package.latest_alias;
const version_log = require(__dirname+"/versions.json");
const chalk = require('chalk');
const { Select, Confirm } = require('enquirer');
const fs = require("fs");
const { execSync } = require('child_process');

const log = console.log;


log(chalk.green("\n** THISCOVERY QUALTRICS SKIN **"));
log(chalk.green("==============================="));

// options:

const top_choices = [
    "1. set dev/build version",
    "2. set 'latest'",
    "3. develop",
    "4. build",
    '5. exit'
];

async function go (){

    log(chalk.grey("\nCurrent developing and building to: \t\t"+chalk.yellowBright(current_version)));
    log(chalk.grey("'Latest' is set to: \t\t\t\t")+chalk.cyanBright(latest_alias)+"\n");

    let prompt = new Select({
        name: 'option',
        message: 'What do you want to do?',
        choices : top_choices
    });
    const choice = await prompt.run();

    switch (choice.charAt(0)) {
        case "1":
            // write version 
            choices = Object.keys(version_log).map(k=>({message:`${k} : ${version_log[k]}`,value:k}));
            prompt = new Select({
                name : 'choose_version',
                message : 'Choose version:',
                choices
            })
            const version_choice = await prompt.run();
            if (version_choice !== current_version) {
                // update
                current_version = version_choice;
                package.version = current_version;
                try {
                    fs.writeFileSync(__dirname+"/package.json",JSON.stringify(package,null,"\t"),{encoding:'utf8'}); 
                    log(chalk.greenBright("Updated!"));                   
                } catch (error) {
                    throw(error);
                    process.exit(1);
                }
            }
            return go();

        case "2":
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

        case "3":
            prompt = new Confirm({
                name : "add_skinjob",
                message : "Include skinjob.js?"
            });
            const conf_skinjob = await prompt.run();
            log (chalk.magentaBright(conf_skinjob ? "\nStarting watches and skinjob.js...\n" : "\nStarting watches...\n"));
            try {
                execSync(
                    conf_skinjob ? 'run-p dev_tasks skinjob' : 'npm run dev_tasks',
                    { stdio : "inherit" }
                );                
            } catch (error) {
                if (error.signal == "SIGINT") {
                    log(chalk.greenBright("\nExiting!"));
                    process.exit(0);
                }
            }
            break;

        case "4":
            log (chalk.magentaBright(`\nBuilding CSS and JS for version ${current_version}...\n`));
            try {
                execSync(
                    'npm run build',
                    { stdio : "inherit" }
                );
                log(chalk.greenBright("\nBuild complete - push to repo to deploy....\n"));    
                process.exit(0);          
            } catch (error) {
                if (error.signal == "SIGINT") {
                    log(chalk.redBright("\nBuild interrupted"));
                    process.exit(0);
                }
            }

        default:
            process.exit(0);
    
    }

}

go();