'use strict';

module.exports = core;

// require: .js/.json/.node
// .js -> module.exports/exports
// .json -> Json.parse
// .node -> process.dlopen c++文件
//any -> .js引擎解析
const path = require('path')
const semver = require('semver')
const colors = require('colors/safe')
const log = require('@zoey-cli-dev/log')
const pathExists = require('path-exists').sync
const userHome = require('user-home')

const pkg = require('../package.json')
const constant = require('./const')

let args
let config

function core() {
    try { 
        checkPkgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
        checkInputArgs()
        // log.verbose('debug', 'test debug log')
        checkEnv()
    } catch (e) {
        log.error(e.message)
    }
}

function checkEnv() {
    const dotenv = require('dotenv')
    const dotenvPath = path.resolve(userHome, '.env')

    if (pathExists(dotenvPath)) {
        dotenv.config({
            path: dotenvPath
        })
    }
    createDefaultConfig()

    log.verbose('环境变量', process.env.CLI_HOME_PATH)
}

function createDefaultConfig() {
    const cliConfig = {
        home: userHome
    }
    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
    } else {
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
    }

    process.env.CLI_HOME_PATH = cliConfig.cliHome // 真正的去修改写入环境变量cli_home

    return cliConfig
}

function checkInputArgs() {
    const minimist = require('minimist')
    args = minimist(process.argv.slice(2))
    // console.log(args)
    checkArgs()
}

function checkArgs() {
    if (args.debug) {
        process.env.LOG_LEVEL = 'verbose'
    } else {
        process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
}

function checkUserHome() {
    if(!userHome || !pathExists(userHome)) {
        throw new Error(colors.red('当前登录用户主目录不存在！'))
    }
}

function checkRoot() {
    // console.log(process.geteuid()) // 获取当前登入用户的id
    const rootCheck = require('root-check')
    rootCheck()
    // 调用 process.setuid()降级
}

function checkNodeVersion(param) {  
    // 第一步，获取当前node当前版本号
    const currentVerion = process.version
    // console.log(currentVerion)
    // 比对最低版本号
    const lowestVersion = constant.LOWEST_NODE_VERSION
    if(!semver.gte(currentVerion, lowestVersion)){
        throw new Error(colors.red(`zoey-cli 需要安装 v${lowestVersion}以上版本的 Node.js`))
    }

}

function checkPkgVersion() {
    // log.success('test', 'success')
    // log.verbose('debug', 'verbose')
    log.notice(pkg.version)
}