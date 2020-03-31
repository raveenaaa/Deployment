const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');

exports.command = 'shutdown';
exports.desc = 'Shutdown the servers';
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

}