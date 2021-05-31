'use strict';


const log = require('npmlog')

// log.level = 'verbose'
log.level = process.env.CLI_LOG_LEVEL ? process.env.CLI_LOG_LEVEL : 'info' // 判断debug模式

log.heading = 'Zoey' // 修改前缀
log.headingStyle = { fg: 'red', bg: 'white' }

log.addLevel('success', 2000, { fg: 'green', bold: true}) // 添加自定义命令

module.exports = log