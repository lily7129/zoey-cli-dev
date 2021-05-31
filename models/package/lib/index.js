'use strict';

const path = require('path')
const pkgDir = require('pkg-dir').sync

const npminstall = require('npminstall')
const getDefaultRegistry = require('@zoey-cli-dev/get-npm-info')
const formatPath = require('@zoey-cli-dev/format-path')
const { isObject }  = require('@zoey-cli-dev/utils')

class Package {
    constructor(options) {
        if( !options){
            throw new Error('Package类的options参数不能为空！')
        }
        if( !isObject(options) ){
            throw new Error('Package类的options参数必须为对象！')
        }
        // package目标路径
        this.targetPath = options.targetPath
        // // package的存储路径
        this.storeDir = options.storeDir
        // package的name
        this.packageName = options.packageName
        // package的version
        this.packageVersion = options.packageVersion;

        console.log(this.getRootFilePath())
    }
    // 判断当前Package是否存在
    exists(){}

    // 安装Package
    install(){
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
    update(){}

    //获取入口文件路径
    getRootFilePath(){
        // 获取package.json文件所在目录  --- pkg-dir
        const dir = pkgDir(this.targetPath)
        if(!dir) return null
        // 读取package.json文件  --- require() .js/.json/node 以外的文件全部当做js文件处理
        const pkgFile =require(path.resolve(dir, 'package.json'))
        // 寻找main/lib
        // 路径的兼容（macOS/windows）  
        // windows对路径/返回\
        if(pkgFile && (pkgFile.main)){
            return formatPath(path.resolve(dir, pkgFile.main))
        }
        return null
    }
}

module.exports = Package;
