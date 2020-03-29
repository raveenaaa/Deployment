const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');

exports.command = 'shutdown';
exports.desc = 'Provision and configure the configuration server';
exports.builder = yargs => {
};


exports.handler = async argv => {
    const { } = argv;

    (async () => {

        await run( );

    })();

};

async function run() {

    console.log(chalk.redBright('Shutting down production environment!'));

    let result = child.spawnSync(`bakerx`, `delete vm blue`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Provisioning green server...'));
    result = child.spawnSync(`bakerx`, `delete vm green`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    // console.log(chalk.blueBright('Installing privateKey on blue server'));
    // let identifyFile = privateKey || path.join(os.homedir(), '.bakerx', 'insecure_private_key');
    // result = scpSync (identifyFile, 'vagrant@192.168.33.10:/home/vagrant/.ssh/mm_rsa');
    // if( result.error ) { console.log(result.error); process.exit( result.status ); }

    // console.log(chalk.blueBright('Running init script...'));
    // result = sshSync('/bakerx/cm/server-init.sh', 'vagrant@192.168.33.10');
    // if( result.error ) { console.log(result.error); process.exit( result.status ); }



}