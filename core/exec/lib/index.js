'use strict';
const path = require('path')
const log = require('@zoey-cli-dev/log')
const Package = require('@zoey-cli-dev/package')

const CACHE_DIR = 'dependencies'

const SETTINGS = {
    init: '@cloudscope-cli/init'
 }
function exec() {
    // 1. targetPath -> modulePath
    // 2. modulePath -> Package(npm模块)
    // 3. Package.getRootFile(获取入口文件)
    // 4. Package.update / Package.install'
    let storeDir = ''
    let targetPath = process.env.CLI_TARGET_PATH
    
    const homePath = process.env.CLI_HOME_PATH
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name(); 
    const packageName = SETTINGS[cmdName];
    const packageVersion = 'latest';

    if(!targetPath) {
        targetPath = path.resolve(homePath, CACHE_DIR)
        storeDir = path.resolve(targetPath, 'node_modules')
        log.verbose('targetPath', targetPath)
        log.verbose('storeDir', storeDir)
     }
    let pkg;

     pkg = new Package({
        targetPath,
        packageName,
        packageVersion
     })

    //  console.log(pkg)
}

module.exports = exec;