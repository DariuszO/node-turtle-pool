let async = require('async')
let cnUtil = new TurtleCoinUtils.Address()
let TurtleCoinUtils = require('turtlecoin-utils')
let turtleUtil = new TurtleCoinUtils.CryptoNote()
let Address = TurtleCoinUtils.Address

let logSystem = 'payments'
require('./exceptionWriter.js')(logSystem)

let addressBase58Prefix = cnUtil.Base58.decode(new Buffer.from(global.config.poolServer.poolAddress))

try {
  let poolAddress = Address.fromAddress(global.config.poolServer.poolAddress, addressBase58Prefix)
  if (!poolAddress) throw new Error('Could not decode address')
} catch (e) {
  global.log('error', logSystem, 'Pool server address is invalid', [global.config.poolServer.poolAddress])
  process.exit(1)
}

let apiInterfaces = require('./apiInterfaces.js')(global.config.daemon, global.config.wallet, global.config.api)

global.log('info', logSystem, 'Started')

function runInterval () {
  async.waterfall([

    // Get worker keys
    function (callback) {
      global.redisClient.keys(global.config.coin + ':workers:*', function (error, result) {
        if (error) {
          global.log('error', logSystem, 'Error trying to get worker balances from redis %j', [error])
          callback(true)
          return
        }
        callback(null, result)
      })
    },

    // Get worker balances
    function (keys, callback) {
      let redisCommands = keys.map(function (k) {
        return ['hmget', k, 'balance', 'minPayoutLevel']
      })
      global.redisClient.multi(redisCommands).exec(function (error, replies) {
        if (error) {
          global.log('error', logSystem, 'Error with getting balances from redis %j', [error])
          callback(true)
          return
        }
        let balances = {}
        let minPayoutLevel = {}
        for (let i = 0; i < replies.length; i++) {
          let parts = keys[i].split(':')
          let workerId = parts[parts.length - 1]
          let data = replies[i]
          let defaultPaymentThreshold = global.config.payments.minPayment
          balances[workerId] = parseInt(data[0]) || 0
          let minerAddress
          minPayoutLevel[workerId] = parseFloat(data[1]) || global.config.payments.minPayment
          try {
            minerAddress = turtleUtil.decodeAddress(workerId, addressBase58Prefix)
            if (minerAddress.paymentId.length !== 0) {
              if (minPayoutLevel[workerId] < global.config.payments.minPaymentIdPayment) {
                minPayoutLevel[workerId] = global.config.payments.minPaymentIdPayment
              }
              defaultPaymentThreshold = global.config.payments.minPaymentIdPayment
            }
          } catch (e) {
            global.log('error', logSystem, 'Skipping invalid miner payment address %s', [workerId])
            continue
          }
          global.log('info', logSystem, 'Using payout level %d for worker %s (default: %d)', [minPayoutLevel[workerId], workerId, defaultPaymentThreshold])
        }
        callback(null, balances, minPayoutLevel)
      })
    },

    // Filter workers under balance threshold for payment
    function (balances, minPayoutLevel, callback) {
      let payments = {}

      for (let worker in balances) {
        let balance = balances[worker]
        if (balance >= minPayoutLevel[worker]) {
          let remainder = balance % global.config.payments.denomination
          let payout = balance - remainder
          if (payout < 0) continue
          payments[worker] = payout
        }
      }

      if (Object.keys(payments).length === 0) {
        global.log('info', logSystem, 'No workers\' balances reached the minimum payment threshold')
        callback(true)
        return
      }

      let transferCommands = []
      let addresses = 0
      let commandAmount = 0
      let commandIndex = 0

      for (worker in payments) {
        let minerAddress
        let paymentId
        try {
          minerAddress = turtleUtil.decodeAddress(worker, addressBase58Prefix)
          if (minerAddress.paymentId.length !== 0 && addresses !== 0) {
            commandIndex++
            addresses = 0
            commandAmount = 0
            paymentId = minerAddress.paymentId
          }
        } catch (e) {
          global.log('error', logSystem, 'Skipping payment to invalid miner payment address %s', [worker])
          continue
        }

        let amount = parseInt(payments[worker])
        if (global.config.payments.maxTransactionAmount && amount + commandAmount > global.config.payments.maxTransactionAmount) {
          amount = global.config.payments.maxTransactionAmount - commandAmount
        }

        if (!transferCommands[commandIndex]) {
          transferCommands[commandIndex] = {
            redis: [],
            amount: 0,
            rpc: {
              transfers: []
            }
          }
        }

        if (paymentId) {
          transferCommands[commandIndex].rpc.paymentId = paymentId
        }

        transferCommands[commandIndex].rpc.transfers.push({ amount: amount, address: worker })
        transferCommands[commandIndex].redis.push(['hincrby', global.config.coin + ':workers:' + worker, 'balance', -amount])
        transferCommands[commandIndex].redis.push(['hincrby', global.config.coin + ':workers:' + worker, 'paid', amount])
        transferCommands[commandIndex].amount += amount

        addresses++
        commandAmount += amount
        if (addresses >= global.config.payments.maxAddresses || (global.config.payments.maxTransactionAmount && commandAmount >= global.config.payments.maxTransactionAmount) || minerAddress.paymentId.length !== 0) {
          commandIndex++
          addresses = 0
          commandAmount = 0
        }
      }

      let timeOffset = 0

      async.filter(transferCommands, function (transferCmd, cback) {
        apiInterfaces.rpcWallet('sendTransaction', transferCmd.rpc, function (error, result) {
          if (error) {
            global.log('error', logSystem, 'Error with sendTransaction RPC request to wallet daemon %j', [error])
            global.log('error', logSystem, 'Payments failed to send to %j', transferCmd.rpc.transfers)
            cback(false)
            return
          }

          let now = (timeOffset++) + Date.now() / 1000 | 0
          let txHash = result.transactionHash
          let txFee = result.fee || global.config.payments.transferFee

          transferCmd.redis.push(['zadd', global.config.coin + ':payments:all', now, [
            txHash,
            transferCmd.amount,
            txFee,
            Object.keys(transferCmd.rpc.transfers).length
          ].join(':')])

          for (let i = 0; i < transferCmd.rpc.transfers.length; i++) {
            let destination = transferCmd.rpc.transfers[i]
            transferCmd.redis.push(['zadd', global.config.coin + ':payments:' + destination.address, now, [
              txHash,
              destination.amount,
              txFee
            ].join(':')])
          }

          global.log('info', logSystem, 'Payments sent via wallet daemon %j', [result])
          global.redisClient.multi(transferCmd.redis).exec(function (error, replies) {
            if (error) {
              global.log('error', logSystem, 'Super critical error! Payments sent yet failing to update balance in redis, double payouts likely to happen %j', [error])
              global.log('error', logSystem, 'Double payments likely to be sent to %j', transferCmd.rpc.transfers)
              cback(false)
              return
            }
            cback(true)
          })
        })
      }, function (succeeded) {
        let failedAmount = transferCommands.length - succeeded.length
        global.log('info', logSystem, 'Payments splintered and %d successfully sent, %d failed', [succeeded.length, failedAmount])
        callback(null)
      })
    }

  ], function (error, result) {
    global.log('info', logSystem, 'Payments processing failed: %s', [error])
    setTimeout(runInterval, global.config.payments.interval * 1000)
  })
}

runInterval()
