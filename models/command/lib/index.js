'use strict';

const semver = require('semver')
const colors = require('colors')
const LOWEST_NODE_VERSION = '13.0.0'

class Command {
  constructor(argv) {
    // console.log(argv)
    this._argv = argv
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve()
      chain = chain.then(() => {
        // 检查node版本
        this.checkNodeVersion()
      })
    })
  }

  init () {
    // 强制让子类去实现init方法
    throw new Error('init必须实现')
  }

  exec () {
    throw new Error('exec必须实现')
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