'use strict';

const axios = require('axios')
const urljoin = require('url-join')
const semver = require('semver')

function getNpmInfo(npmName, registry) {
    if(!npmName) {
        return null
    }
    const registryUrl = registry || getDefaultRegistry()
    const npmInfoUrl = urljoin(registryUrl, npmName) //封装路径
    
    return axios.get(npmInfoUrl).then(response => {
        if(response.status === 200) return response.data
        return null
    }).catch(err => {
        return Promise.reject(err)
    })

}

async function getNpmVersions(npmName, registry) {
    const data = await getNpmInfo(npmName, registry)
    if(data) {
        return Object.keys(data.versions)
    }else {
        return []
    }
}

function getSemverVersions(baseVersion, versions) {
    //semver.satisfies()返回满足范围的版本号，包含当前版本号
    //semver.gt(v1, v2) 返回v1 > v2
    return versions
        .filter(version => semver.satisfies(version, `^${baseVersion}`))
        .sort((a, b) => semver.gt(b, a))
}

async function getNpmSemverVersion(npmName, baseVersion, registry) {
    const versions = await getNpmVersions(npmName, registry)
    const newVersions = getSemverVersions(baseVersion, versions)

    if( newVersions && newVersions.length > 0) return newVersions[0]
    return null
}

function getDefaultRegistry(isOringinal = false){
    return isOringinal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}

module.exports = {
    getNpmInfo,
    getDefaultRegistry,
    getNpmSemverVersion
};