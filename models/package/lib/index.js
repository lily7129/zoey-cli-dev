'use strict';

const path = require('path')
// 咳哟做很多文件相关的操作
const fse = require('fs-extra')
const pkgDir = require('pkg-dir').sync
const pathExists = require('path-exists').sync
const npminstall = require('npminstall')
const { getDefaultRegistry, getNpmLatestVersion } = require('@zoey-cli-dev/get-npm-info')
const formatPath = require('@zoey-cli-dev/format-path')
const { isObject } = require('@zoey-cli-dev/utils')

class Package {
  constructor(options) {
    // 用户初始化输入的参数
    if (!options) {
      throw new Error('Package类的options参数不能为空！')
    }
    if (!isObject(options)) {
      throw new Error('Package类的options参数必须为对象！')
    }
    // package目标路径
    this.targetPath = options.targetPath
    // // package的存储路径
    this.storeDir = options.storeDir
    // package的name
    this.packageName = options.packageName
    // package的version
    this.packageVersion = options.packageVersion
    // package的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')
  }

  // 获取最新的版本号
  async prepare () {
    if (this.storeDir && !pathExists(this.storeDir)) {
      // mkdirpSync把当前路径上没有创建的路径全部创建好
      fse.mkdirpSync(this.storeDir)
    }

    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
  }

  get cacheFilePath () {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }

  getSpecificCacheFilePath (packageVersion) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
  }

  // 判断当前Package是否存在
  async exists () {
    // 判断当前文件是属于缓存文件模式还是targetPath模式
    if (this.storeDir) {
      // 缓存模式
      await this.prepare()
      return pathExists(this.cacheFilePath)
    } else {
      return pathExists(this.targetPath)
    }
  }

  // 安装Package
  async install () {
    await this.prepare()
    npminstall({
      root: this.targetPath, // 模块路径
      storeDir: this.storeDir, // 实际存储位置，root + node_modules
      registry: getDefaultRegistry(),
      pkgs: [{
        name: this.packageName,
        version: this.packageVersion
      }] // 指定安装的包名和版本
    })
  }

  //更新Package
  async update () {
    // 获取最新的npm模块版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    // 查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion)
    // 如果不存在，则直接安装最新版本
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [{
          name: this.packageName,
          version: latestPackageVersion
        }
        ]
      })
      this.packageVersion = latestPackageVersion
    } else {
      this.packageVersion = latestPackageVersion
    }
    return latestFilePath;
  }

  //获取入口文件路径
  getRootFilePath () {
    function _getRootFile(targetPath) {
      // 获取package.json文件所在目录  --- pkg-dir
      const dir = pkgDir(targetPath)
      if (!dir) return null
      // 读取package.json文件  --- require() .js/.json/node 以外的文件全部当做js文件处理
      const pkgFile = require(path.resolve(dir, 'package.json'))
      // 寻找main/lib
      // 路径的兼容（macOS/windows）  
      // windows对路径/返回\
      if (pkgFile && (pkgFile.main)) {
        return formatPath(path.resolve(dir, pkgFile.main))
      }
    }
    if (this.storeDir) {
      // 使用缓存
      return _getRootFile(this.cacheFilePath)
    } else {
      // 不使用缓存
      return _getRootFile(this.targetPath)
    }
  }
}

module.exports = Package;
