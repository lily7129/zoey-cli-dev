'use strict';

module.exports = core;

// require: .js/.json/.node
// .js -> module.exports/exports
// .json -> Json.parse
// .node -> process.dlopen c++文件
//any -> .js引擎解析
const pkg = require('../package.json')
const log = require('@zoey-cli-dev/log')

function core() {
    checkPkgVersion()
}

function checkPkgVersion() {
    // log.success('test', 'success')
    // log.verbose('debug', 'verbose')
    log.notice(pkg.version)
}