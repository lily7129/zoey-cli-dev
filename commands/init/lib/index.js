'use strict';

const Command = require('@zoey-cli-dev/command')

class InitCommand extends Command {

}

function init(agrv)  {
    // console.log('init', projectName, options.force, process.env.CLI_TARGET_PATH)
  return new InitCommand(agrv)
}

module.exports = init;
module.exports.InitCommand = InitCommand;