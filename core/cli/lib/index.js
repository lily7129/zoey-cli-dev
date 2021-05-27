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
const init = require('@zoey-cli-dev/init')
const commander = require('commander')
const userHome = require('user-home')
const pathExists = require('path-exists').sync

const pkg = require('../package.json')
const constant = require('./const')

let args
const program = new commander.Command()

async function core() { 
    try { 
        checkPkgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
        // checkInputArgs()
        checkEnv()
        await checkGlobalUpdate()
        registerCommand()
    } catch (e) {
        log.error(e.message)
    }
}

function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<command> [options]')
        .version(pkg.version)
        .option('-d, --debug', '是否开启调试模式', false)
        .option('-tp, --targetPath <targetPath>', '是否指定本地调试路径', false)

    // 使用commnad注册命令
    program
        .command('init [projectName]') 
        .option('-f, --force', '是否强制启动项目')
        .action(init)

    // 开始调试模式
    program
        .on('option:debug', function() {
            const options = program.opts()
            // 修改环境变量的log_level
            process.env.LOG_LEVEL = options.debug ? 'verbose' : 'info' // 早于命令执行之前做

            // 修改当前实例log的level
            log.level = process.env.LOG_LEVEL

            // log.verbose('debug', 'verbose')
        }) // 监听debug命令

    program
        .on('option:targetPath', function() {
            const options = program.opts()
            // 修改环境变量的log_level
            process.env.LOG_LEVEL = options.debug ? 'verbose' : 'info' // 早于命令执行之前做

            // 修改当前实例log的level
            log.level = process.env.LOG_LEVEL

            // log.verbose('debug', 'verbose')
        }) // 监听debug命令

    // 对未知命令监听
    program
        .on('command:*', function(obj) {
            // 说明没有命中之前所有的已注册的命令
            console.log(colors.red(`未知命令： ${obj[0]}`))
            if(!program.commands) return
            const availableCommanders = program.commands.map(cmd => cmd.name())
            if (availableCommanders.length > 0) {
                console.log(colors.green(`可用命令： ${availableCommanders.join(',')}`))
            }
        }) // 监听debug命令
        

    program.parse(process.argv)
    
    if (program.args && program.args.length < 1) {
        program.outputHelp()
        console.log() // 打印空行
    }
}

async function checkGlobalUpdate() {
    // 获取当前版本号和模块名
    const currentVersion = pkg.version
    const npmName = pkg.name
    // 调用npmAPI，获取所有版本号
    // 提取所有版本号，比对那个版本号是大于当前版本号
    const { getNpmSemverVersion } = require('@zoey-cli-dev/get-npm-info')
    // 获取最新的版本号，提示用户更新到最新的版本号
    const lastversions = await getNpmSemverVersion(npmName, currentVersion)

    if(lastversions && semver.gt(lastversions, currentVersion)) {
        log.warn(colors.yellow(`请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastversions}
          更新命令：npm install -g ${npmName}`)) 
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
    // console.log(currentVerion)
    if(!semver.gte(currentVerion, lowestVersion)){
        throw new Error(colors.red(`zoey-cli 需要安装 v${lowestVersion}以上版本的 Node.js`))
    }

}

function checkPkgVersion() {
    // log.success('test', 'success')
    // log.verbose('debug', 'verbose')
    log.info('cli', pkg.version)
}