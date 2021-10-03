let fs = require('fs')
let cluster = require('cluster')

let dateFormat = require('dateformat')

module.exports = function (logSystem) {
  process.on('uncaughtException', function (err) {
    console.log('\n' + err.stack + '\n')
    let time = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')
    fs.appendFile(global.config.logging.files.directory + '/' + logSystem + '_crash.log', time + '\n' + err.stack + '\n\n', function () {
      if (cluster.isWorker) { process.exit() }
    })
  })
}
