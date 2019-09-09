const seven = require('node-7z');
const process = require('process');
const minimist = require('minimist');
const fs = require('fs');
const fse = require('fs-extra');
const rimraf = require("rimraf");
const exec = require('child_process').exec;

const args = minimist(process.argv.slice(2));
const FILES = ['check.js', 'LICENCE', 'package.json', 'README.md'];
const FOLDERS = ['babel', 'lib'];

const PACKAGE_NAME = args['name'] || 'package.tar';
const PACKAGE_DIR = args['dir-name'] || './package/';

const createTarball = (PACKAGE_DIR) => {
    const myStream = seven.add(PACKAGE_NAME, PACKAGE_DIR);

    myStream.on('error', (error) => {
        console.error('The following errors have occurred archiving files: ', error);
    });

    myStream.on('end', () => {
        install();
    });
};

const install = () => {
    exec(`npm install -g ${PACKAGE_NAME}`, {}, (error, stdout, stderr) => {
        if (error) return console.error(`The following errors have occurred installing ${PACKAGE_NAME}`, error);
        if (stderr) console.log(`The following errors have occurred installing ${PACKAGE_NAME}`, stderr);
        console.log(stdout);

        console.log('Installed!');

        removeDistFolder(PACKAGE_DIR);
    });
};

const removeDistFolder = (PACKAGE_DIR) => {
    if (fs.existsSync(PACKAGE_DIR)) {
        rimraf.sync(PACKAGE_DIR);
    }
}

const setup = () => {
    console.log('Begin setup.');

    removeDistFolder(PACKAGE_DIR);

    fs.mkdirSync(PACKAGE_DIR);

    FILES.forEach(fileName => {
        fs.copyFileSync(fileName, `${PACKAGE_DIR}${fileName}`);
    });

    const promises = [];

    FOLDERS.forEach(folderName => {
        promises.push(fse.copy(folderName, `${PACKAGE_DIR}${folderName}`));
    });

    console.log('Finished setup.');

    Promise.all(promises).then(() => {
        createTarball(PACKAGE_DIR);
    });
};

module.exports = (() => {
    exec('npm run prepublish', {}, (error, stdout, stderr) => {
        if (error) return console.error('The following errors have occurred building coherent-preact: ', error);
        if (stderr) console.log('The following errors have occurred building coherent-preact: ', stderr);
        console.log(stdout);

        setup();
    });
})();