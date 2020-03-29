const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');

// const scpSync = require('../lib/scp');
// const sshSync = require('../lib/ssh');

exports.command = 'setup';
exports.desc = 'Provision and configure the configuration server';
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

    // console.log(chalk.blueBright('Installing privateKey on blue server'));
    // let identifyFile = privateKey || path.join(os.homedir(), '.bakerx', 'insecure_private_key');
    // result = scpSync (identifyFile, 'vagrant@192.168.33.10:/home/vagrant/.ssh/mm_rsa');
    // if( result.error ) { console.log(result.error); process.exit( result.status ); }

    // console.log(chalk.blueBright('Running init script...'));
    // result = sshSync('/bakerx/cm/server-init.sh', 'vagrant@192.168.33.10');
    // if( result.error ) { console.log(result.error); process.exit( result.status ); }



}