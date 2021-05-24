#! /usr/bin/env node

// const utils = require('@zoey-cli-dev/utils')
// utils()
// console.log('Hello zoey-cli-dev !')

const importLoacl = require('import-local')

if (importLoacl(__filename)) {
  // 使用加载本地的脚手架文件
  require('npmlog').info('cli', '正在使用 imooc-cli 本地版本')
} else {
  require('../lib')(process.argv.slice(2))
}