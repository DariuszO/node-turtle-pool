let async = require('async')

let apiInterfaces = require('./apiInterfaces.js')(global.config.daemon, global.config.wallet, global.config.api)

let logSystem = 'unlocker'
require('./exceptionWriter.js')(logSystem)

global.log('info', logSystem, 'Started')

function runInterval () {
  async.waterfall([

    // Get all block candidates in redis
    function (callback) {
      global.redisClient.zrange(global.config.coin + ':blocks:candidates', 0, -1, 'WITHSCORES', function (error, results) {
        if (error) {
          global.log('error', logSystem, 'Error trying to get pending blocks from redis %j', [error])
          callback(true)
          return
        }
        if (results.length === 0) {
          global.log('info', logSystem, 'No blocks candidates in redis')
          callback(true)
          return
        }

        let blocks = []

        for (let i = 0; i < results.length; i += 2) {
          let parts = results[i].split(':')
          blocks.push({
            serialized: results[i],
            height: parseInt(results[i + 1]),
            hash: parts[0],
            time: parts[1],
            difficulty: parts[2],
            shares: parts[3]
          })
        }

        callback(null, blocks)
      })
    },

    // Check if blocks are orphaned
    function (blocks, callback) {
      async.filter(blocks, function (block, mapCback) {
        apiInterfaces.rpcDaemon('getblockheaderbyheight', { height: block.height }, function (error, result) {
          if (error) {
            global.log('error', logSystem, 'Error with getblockheaderbyheight RPC request for block %s - %j', [block.serialized, error])
            block.unlocked = false
            mapCback()
            return
          }
          if (!result.block_header) {
            global.log('error', logSystem, 'Error with getblockheaderbyheight, no details returned for %s - %j', [block.serialized, result])
            block.unlocked = false
            mapCback()
            return
          }
          let blockHeader = result.block_header
          block.orphaned = blockHeader.hash === block.hash ? 0 : 1
          block.unlocked = blockHeader.depth >= global.config.blockUnlocker.depth
          block.reward = blockHeader.reward
          mapCback(block.unlocked)
        })
      }, function (unlockedBlocks) {
        if (unlockedBlocks.length === 0) {
          global.log('info', logSystem, 'No pending blocks are unlocked yet (%d pending)', [blocks.length])
          callback(true)
          return
        }

        callback(null, unlockedBlocks)
      })
    },

    // Get worker shares for each unlocked block
    function (blocks, callback) {
      let redisCommands = blocks.map(function (block) {
        return ['hgetall', global.config.coin + ':shares:round' + block.height]
      })

      global.redisClient.multi(redisCommands).exec(function (error, replies) {
        if (error) {
          global.log('error', logSystem, 'Error with getting round shares from redis %j', [error])
          callback(true)
          return
        }
        for (let i = 0; i < replies.length; i++) {
          let workerShares = replies[i]
          blocks[i].workerShares = workerShares
        }
        callback(null, blocks)
      })
    },

    // Handle orphaned blocks
    function (blocks, callback) {
      let orphanCommands = []

      blocks.forEach(function (block) {
        if (!block.orphaned) return

        orphanCommands.push(['del', global.config.coin + ':shares:round' + block.height])

        orphanCommands.push(['zrem', global.config.coin + ':blocks:candidates', block.serialized])
        orphanCommands.push(['zadd', global.config.coin + ':blocks:matured', block.height, [
          block.hash,
          block.time,
          block.difficulty,
          block.shares,
          block.orphaned
        ].join(':')])

        if (block.workerShares) {
          let workerShares = block.workerShares
          Object.keys(workerShares).forEach(function (worker) {
            orphanCommands.push(['hincrby', global.config.coin + ':shares:roundCurrent', worker, workerShares[worker]])
          })
        }
      })

      if (orphanCommands.length > 0) {
        global.redisClient.multi(orphanCommands).exec(function (error, replies) {
          if (error) {
            global.log('error', logSystem, 'Error with cleaning up data in redis for orphan block(s) %j', [error])
            callback(true)
            return
          }
          callback(null, blocks)
        })
      } else {
        callback(null, blocks)
      }
    },

    // Handle unlocked blocks
    function (blocks, callback) {
      let unlockedBlocksCommands = []
      let payments = {}
      let totalBlocksUnlocked = 0
      blocks.forEach(function (block) {
        if (block.orphaned) return
        totalBlocksUnlocked++

        unlockedBlocksCommands.push(['del', global.config.coin + ':shares:round' + block.height])
        unlockedBlocksCommands.push(['zrem', global.config.coin + ':blocks:candidates', block.serialized])
        unlockedBlocksCommands.push(['zadd', global.config.coin + ':blocks:matured', block.height, [
          block.hash,
          block.time,
          block.difficulty,
          block.shares,
          block.orphaned,
          block.reward
        ].join(':')])

        let feePercent = global.config.blockUnlocker.poolFee / 100

        if (Object.keys(global.donations).length) {
          for (let wallet in global.donations) {
            let percent = global.donations[wallet] / 100
            feePercent += percent
            payments[wallet] = Math.round(block.reward * percent)
            global.log('info', logSystem, 'Block %d donation to %s as %d percent of reward: %d', [block.height, wallet, percent, payments[wallet]])
          }
        }

        let reward = Math.round(block.reward - (block.reward * feePercent))

        global.log('info', logSystem, 'Unlocked %d block with reward %d and donation fee %d. Miners reward: %d', [block.height, block.reward, feePercent, reward])

        if (block.workerShares) {
          let totalShares = parseInt(block.shares)
          Object.keys(block.workerShares).forEach(function (worker) {
            let percent = block.workerShares[worker] / totalShares
            let workerReward = Math.round(reward * percent)
            payments[worker] = (payments[worker] || 0) + workerReward
            global.log('info', logSystem, 'Block %d payment to %s for %d shares: %d', [block.height, worker, totalShares, payments[worker]])
          })
        }
      })

      for (let worker in payments) {
        let amount = parseInt(payments[worker])
        if (amount <= 0) {
          delete payments[worker]
          continue
        }
        unlockedBlocksCommands.push(['hincrby', global.config.coin + ':workers:' + worker, 'balance', amount])
      }

      if (unlockedBlocksCommands.length === 0) {
        global.log('info', logSystem, 'No unlocked blocks yet (%d pending)', [blocks.length])
        callback(true)
        return
      }

      global.redisClient.multi(unlockedBlocksCommands).exec(function (error, replies) {
        if (error) {
          global.log('error', logSystem, 'Error with unlocking blocks %j', [error])
          callback(true)
          return
        }
        global.log('info', logSystem, 'Unlocked %d blocks and update balances for %d workers', [totalBlocksUnlocked, Object.keys(payments).length])
        callback(null)
      })
    }
  ], function (error, result) {
    /* If the result is empty we've already sent back a log statement, we dont' need to do it again */
    if (error && result) {
      global.log('info', logSystem, 'Error running blockUnlocker: %s', [result])
    }
    setTimeout(runInterval, global.config.blockUnlocker.interval * 1000)
  })
}

runInterval()
