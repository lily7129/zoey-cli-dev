'use strict';

const path = require('path')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const semver = require('semver')
const userHome = require('user-home')
const log = require('@zoey-cli-dev/log')
const Package = require('@zoey-cli-dev/package')
const Command = require('@zoey-cli-dev/command')
const { newSpinnerStart, spinnerStart, sleep } = require('@zoey-cli-dev/utils')

const TYPE_PROJECT = 'project'
const TYPE_COMPONENT = 'component'
const templateList = [{
  name: 'md-admin-template',
  npmName: 'md-admin-template',
  version: '1.0.0'
}, {
  name: 'vue2后台管理系统',
  npmName: 'imooc-cli-dev-template-vue-element-admin',
  version: '1.0.0'
}, {
  name: 'vue2标准系统',
  npmName: 'imooc-cli-dev-template-v2',
  version: '1.0.0'
}]

class InitCommand extends Command {
  init () {
    this.projectName = this._argv[0] || ''
    this.force = !!this._cmd.force
    // this.force = !!this._argv[1].force
    log.verbose('projectName', this.projectName)
    log.verbose('force', this.force)
  }

  async exec () {
    try {
      // 1. 准备阶段 【this.prepare()】
      this.projectInfo = await this.prepare()
      if (this.projectInfo) {

        // 2. 下载模版
        await this.downloadTemplate()
      }

      // 3. 安装模版(下周实现)
    } catch (e) {
      log.error(e)
    }

  }
  async downloadTemplate () {
    // 1 通过项目模版API获取项目模版信息
    // 1.1 通过egg.js搭建一套后台系统 (4-2 至 4-5)
    // 1.2 通过npm存储项目模版
    // 1.3 将项目模版信息存储到mongodb数据库中
    // 1.4 通过egg.js获取mongodb中的数据并且通过API将其返回
    const { projectTemplate } = this.projectInfo
    const templateInfo = templateList.find(item => item.npmName === projectTemplate)
    const targetPath = path.resolve(userHome, '.zoey-cli-dev', 'template')
    const storeDir = path.resolve(userHome, '.zoey-cli-dev', 'template', 'node_modules')

    const { npmName, version } = templateInfo
    log.verbose('downloadTemplate targetPath', targetPath)
    log.verbose('downloadTemplate storeDir', storeDir)
    log.verbose('downloadTemplate npmName version', npmName, version)
    const templatePkg = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version
    })
    if (await templatePkg.exists()) {
      // 更新package
      log.verbose('更新template')
      const spiner = newSpinnerStart('正在更新模板...')
      await sleep()
      try {
        await templatePkg.update()
        spiner.success('更新模板成功')
      } catch (error) {
        throw error
      } finally {
        spiner.stop() // cli-sppinner的stop方法需要传入true
      }
    } else {
      // 安装package
      log.verbose('安装template')
      const spiner = newSpinnerStart('正在下载模板...')
      await sleep()
      try {
        await templatePkg.install()
        spiner.success('下载模板成功')
      } catch (error) {
        throw error
      } finally {
        spiner.stop() // cli-sppinner的stop方法需要传入true
      }
    }
  }

  async prepare () {
    const localPath = process.cwd()
    // 1、判断当前目录是否为空
    if (!this.isDirEmpty(localPath)) {
      console.log(this.force)
      let ifContinue = false
      if (!this.force) {
        // 1.1 询问是否继续创建
        ifContinue = await inquirer.prompt({
          type: 'confirm',
          name: 'ifContinue',
          default: false,
          message: '当前文件夹不为空，是否继续创建项目？'
        }).ifContinue

        if (!ifContinue) return
      }

      if (ifContinue || this.force) {
        // 给用户做二次确认
        const { confirmDelete } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmDelete',
          default: false,
          message: '是否清空当前目录下的文件？'
        })
        if (confirmDelete) {
          // 2、启动强制更新，清空当前目录
          fse.emptydirSync(localPath) // 不会删除当前目录，只是清空文件夹
        }
      }
    }

    return this.getProjectInfo()
  }

  async getProjectInfo () {
    //return 项目的基本信息
    // 3、选择创建项目或组件
    // 4、获取项目/组件的基本信息
    let projectInfo = {}
    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '  请选择初始化类型',
      default: TYPE_PROJECT,
      choices: [{
        name: '项目',
        value: TYPE_PROJECT
      }, {
        name: '组件',
        value: TYPE_COMPONENT
      }]
    })
    log.verbose('type', type)
    if (type === TYPE_PROJECT) {
      const project = await inquirer.prompt([{
        type: 'input',
        name: 'projectName',
        message: '请输入项目名称',
        default: '',
        validate: function (v) {

          // 规则一：输入的首字符为英文字符
          // 规则二：尾字符必须为英文或数字
          // 规则三：字符仅允许-和_两种
          // \w=a-zA_Z0-9_
          const done = this.async();
          const reg = /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/

          setTimeout(function () {
            if (!reg.test(v)) {
              done('请输入合法的项目名称');
              return;
            }
            done(null, true);
          }, 0)
        },
        filter: function (v) {
          return v
        }
      }, {
        type: 'input',
        name: 'projectVersion',
        message: '请输入项目版本号',
        default: '1.0.0',
        validate: function (v) {
          const done = this.async();
          setTimeout(function () {
            if (!(!!semver.valid(v))) {
              done('请输入合法的版本号');
              return;
            }
            done(null, true);
          }, 0)
        },
        filter: function (v) {
          if (!!semver.valid(v)) {
            return semver.valid(v)
          } else {
            return v
          }
        }
      }, {
        type: 'list',
        name: 'projectTemplate',
        message: '请选择项目模板',
        default: 'md-admin-template',
        choices: this.creatTemplateChioce()
      }])
      projectInfo = {
        type,
        ...project
      }
    } else {

    }

    return projectInfo
  }

  creatTemplateChioce () {
    return templateList.map(t => {
      return {
        name: t.name,
        value: t.npmName
      }
    })
  }

  isValidName (v) {
    // 规则一：输入的首字符为英文字符
    // 规则二：尾字符必须为英文或数字
    // 规则三：字符仅允许-和_两种
    // \w=a-zA_Z0-9_
    return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v)
  }

  isDirEmpty (localPath) {
    let fileList = fs.readdirSync(localPath)
    // 文件过滤逻辑
    fileList = fileList.filter((file) => (
      !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
    ))
    return !fileList || fileList.length <= 0
  }
}

// function init (projectName, options, command) {
//   console.log('init', projectName, options.force, process.env.CLI_TARGET_PATH)
// }

function init (agrv) {
  return new InitCommand(agrv)
}

module.exports = init;
module.exports.InitCommand = InitCommand;