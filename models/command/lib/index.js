'use strict';

const semver = require('semver')
const colors = require('colors')
const log = require('@zoey-cli-dev/log')
const LOWEST_NODE_VERSION = '12.0.0'

class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error('参数不能为空')
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组')
    }
    if (argv.length < 1) {
      throw new Error('参数列表不能为空')
    }
    this._argv = argv
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve()
      chain = chain.then(() => {
        // 检查node版本
        this.checkNodeVersion()
      })
      chain = chain.then(() => {
        // 参数处理
        this.initArgs()
      })
      chain = chain.then(() => this.init())
      chain = chain.then(() => this.exec())
      chain.catch(err => {
        log.error(err.message)
      })
    })
  }

  init () {
    // 强制让子类去实现init方法
    throw new Error('init必须实现!')
  }

  exec () {
    throw new Error('exec必须实现!')
  }

  initArgs () {
    // console.log(this._argv)
    const len = this._argv.length - 1
    this._cmd = this._argv[len] //commander版本号为7.0.0需要加opts()
    this._argv = this._argv.slice(0, len)
    // console.log(this._cmd)
    // console.log(this._argv)
  }

  checkNodeVersion (param) {
    // 第一步，获取当前node当前版本号
    const currentVerion = process.version
    // console.log(currentVerion)
    // 比对最低版本号
    const lowestVersion = LOWEST_NODE_VERSION
    // console.log(currentVerion)
    if (!semver.gte(currentVerion, lowestVersion)) {
      throw new Error(colors.red(`zoey-cli 需要安装 v${lowestVersion}以上版本的 Node.js`))
    }
  }

}

module.exports = Command;