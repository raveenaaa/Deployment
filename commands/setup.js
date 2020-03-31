const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');

// const scpSync = require('../lib/scp');
// const sshSync = require('../lib/ssh');

exports.command = 'setup';
exports.desc = 'Provision and configure the blue-green servers';
exports.builder = yargs => {
    yargs.options({
        privateKey: {
            describe: 'Install the provided private key on the configuration server',
            type: 'string'
        }
    });
};


exports.handler = async argv => {
    const { privateKey } = argv;

    (async () => {

        await run( privateKey );

    })();

};

async function run(privateKey) {

    console.log(chalk.greenBright('Setting up production environment!'));

    console.log(chalk.blueBright('Provisioning blue server...'));
    let result = child.spawnSync(`bakerx`, `run blue queues --ip 192.168.44.25`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Provisioning green server...'));
    result = child.spawnSync(`bakerx`, `run green queues --ip 192.168.44.30`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

}