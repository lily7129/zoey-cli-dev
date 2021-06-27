'use strict';
const ora = require('ora')
function isObject (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function spinnerStart (msg = 'loading', spinnerString = '|\-\\') {
  const Spinner = require('cli-spinner').Spinner
  const spinner = new Spinner(`${msg} %s`)
  spinner.setSpinnerString(spinnerString)
  spinner.start()
  return spinner
}

function newSpinnerStart (msg = 'Loading', spinnerString = ['|', '/', '-', '\\']) {
  const spinner = ora({
    text: msg + '...',
    // spinner: 'dots10', // 70+ 内置样式 
    spinner: { // 自定义样式
      interval: 80, // 时间间隔，毫秒
      frames: spinnerString
    },
    color: 'yellow' // loading的颜色
  });
  spinner.start();
  return spinner
}

function sleep (timeout = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}
module.exports = {
  isObject,
  spinnerStart,
  newSpinnerStart,
  sleep
}