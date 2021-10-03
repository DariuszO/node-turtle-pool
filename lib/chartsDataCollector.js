let charts = require('./charts.js')

let logSystem = 'chartsDataCollector'
require('./exceptionWriter.js')(logSystem)

global.log('info', logSystem, 'Started')

charts.startDataCollectors()
