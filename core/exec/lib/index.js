'use strict';
const path = require('path')
const log = require('@zoey-cli-dev/log')
const Package = require('@zoey-cli-dev/package')
const cp = require('child_process')
// cp.fork()  //这里因为fork没有回调，需要通过通信的方式来获取结果，所以这里不推荐

const CACHE_DIR = 'dependencies'

const SETTINGS = {
  init: '@imooc-cli/init'
}
async function exec () {
  // 1. targetPath -> modulePath
  // 2. modulePath -> Package(npm模块)
  // 3. Package.getRootFile(获取入口文件)
  // 4. Package.update / Package.install'

  let pkg = ''
  let storeDir = ''

  let targetPath = process.env.CLI_TARGET_PATH

  const homePath = process.env.CLI_HOME_PATH
  // log.verbose('targetPath', targetPath);
  // log.verbose('homePath', homePath);

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'lastest';

  if (!targetPath) {
    //生成缓存路径
    targetPath = path.resolve(homePath, CACHE_DIR)
    storeDir = path.resolve(targetPath, 'node_modules')
    log.verbose('targetPath', targetPath)
    log.verbose('storeDir', storeDir)


    pkg = new Package({  
      targetPath,
      storeDir,
      packageName,
      packageVersion
    })
    if (await pkg.exists()) {
      // 更新package
      log.verbose('更新package')
      await pkg.update();
    } else {
      // 安装package
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion
    })
  }
  const rootFile = pkg.getRootFilePath()
  // console.log(rootFile)
  if (rootFile) {    //新添加
    try {
      // 这里的argv参数传递是从 exec/lib/index.js中的require传递过来的，因此参数传递修改
      // require(rootFile).apply(null,arguments)

      // 在当前进程中调用
      // require(rootFile).call(null, Array.from(arguments))

      // todo
      // 修改为在node进程中动态调用

      // 拼出code命令
      const args = Array.from(arguments)
      const cmd = args[args.length - 1]   // 拿到command，且进行瘦身，对不需要的参数进行过滤
      const o = Object.create(null) // 创建一个没有原型链的对象，体积小一点
      Object.keys(cmd).forEach(key => {
        if (cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
          o[key] = cmd[key]
        }
      })
      args[args.length - 1] = o
      const code = `require('${rootFile}').call(null,${JSON.stringify(args)})`

      // 由于cli->init下使用的commander是7.0.0的，低于此版本传入的参数为两个，但7.0.0版本传入参数为3个，因此上面的代码，我这里直接写成(不知道后续是否还会有错误)：

      // let args = Array.from(arguments).splice(0, 2)
      // const code = `require('${rootFile}').call(null,${JSON.stringify(args)})`
      // console.log(code)

      //之所以不用spawnSync是因为，我们在执行这里的时候是需要不断的用户交互的，需要不断的收到数据打印结果，不要一次性
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit'   // 加入这行代码，下面的就可以注释掉了
      })
      // child.stdout.on('data',(chunk =>{
      // }))
      // child.stderr.on('data',(chunk =>{
      // }))

      // 当然存在错误的情况，我们还是需要添加两个监听事件
      child.on('error', e => {
        log.error(e.message);
        process.exit(1);
      })
      child.on('exit', e => {
        log.verbose('命令执行成功' + e);
        process.exit(e);
      })
    } catch (e) {
      log.error(e.message)
    }
  }
}

function spawn (command, args, options) {
  const win32 = process.platform === 'win32';
  const cmd = win32 ? 'cmd' : command
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
  return cp.spawn(cmd, cmdArgs, options || {})
}

module.exports = exec;