let fs = require('fs')
let util = require('util')

let dateFormat = require('dateformat')
let clc = require('cli-color')

let severityMap = {
  'info': clc.blue,
  'warn': clc.yellow,
  'error': clc.red
}

let severityLevels = ['info', 'warn', 'error']

let logDir = global.config.logging.files.directory

if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir)
  } catch (e) {
    throw e
  }
}

let pendingWrites = {}

setInterval(function () {
  for (let fileName in pendingWrites) {
    let data = pendingWrites[fileName]
    fs.appendFile(fileName, data, (err) => { if (err) console.log(err) })
    delete pendingWrites[fileName]
  }
}, global.config.logging.files.flushInterval * 1000)

global.log = function (severity, system, text, data) {
  let logConsole = severityLevels.indexOf(severity) >= severityLevels.indexOf(global.config.logging.console.level)
  let logFiles = severityLevels.indexOf(severity) >= severityLevels.indexOf(global.config.logging.files.level)

  if (!logConsole && !logFiles) return

  let time = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')
  let formattedMessage = text

  if (data) {
    data.unshift(text)
    formattedMessage = util.format.apply(null, data)
  }

  if (logConsole) {
    if (global.config.logging.console.colors) { console.log(severityMap[severity](time) + clc.white.bold(' [' + system + '] ') + formattedMessage) } else { console.log(time + ' [' + system + '] ' + formattedMessage) }
  }

  if (logFiles) {
    let fileName = logDir + '/' + system + '_' + severity + '.log'
    let fileLine = time + ' ' + formattedMessage + '\n'
    pendingWrites[fileName] = (pendingWrites[fileName] || '') + fileLine
  }
}
