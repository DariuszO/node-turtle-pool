'use strict'

let Buffer = require('safe-buffer').Buffer
let cnUtil = require('turtlecoin-cryptonote-util')
let TurtleCoinUtils = require('turtlecoin-utils')
let turtleUtil = new TurtleCoinUtils.CryptoNote()
let Crypto = new TurtleCoinUtils.Crypto()
let Address = TurtleCoinUtils.Address
let multiHashing = require('turtlecoin-multi-hashing')
let assert = require('assert')

// turtlecoin-multi-hashing tests

let xmrigdata = new Buffer.from('0100fb8e8ac805899323371bb790db19218afd8db8e3755d8b90f39b3d5506a9abce4fa912244500000000ee8146d49fa93ee724deb57d12cbc6c6f3b924d946127c7a97418f9348828f0f02', 'hex')

let cnfasthash = new Buffer.from('b542df5b6e7f5f05275c98e7345884e2ac726aeeb07e03e44e0389eb86cd05f0', 'hex')
let xmrigcnletiant0hash = new Buffer.from('1b606a3f4a07d6489a1bcd07697bd16696b61c8ae982f61a90160f4e52828a7f', 'hex')
let xmrigcnletiant1hash = new Buffer.from('c9fae8425d8688dc236bcdbc42fdb42d376c6ec190501aa84b04a4b4cf1ee122', 'hex')
let xmrigcnletiant2hash = new Buffer.from('871fcd6823f6a879bb3f33951c8e8e891d4043880b02dfa1bb3be498b50e7578', 'hex')

let xmrigcnliteletiant0hash = new Buffer.from('28a22bad3f93d1408fca472eb5ad1cbe75f21d053c8ce5b3af105a57713e21dd', 'hex')
let xmrigcnliteletiant1hash = new Buffer.from('87c4e570653eb4c2b42b7a0d546559452dfab573b82ec52f152b7ff98e79446f', 'hex')
let xmrigcnliteletiant2hash = new Buffer.from('b7e78fab22eb19cb8c9c3afe034fb53390321511bab6ab4915cd538a630c3c62', 'hex')

let xmrigcndarkletiant0hash = new Buffer.from('bea42eadd78614f875e55bb972aa5ec54a5edf2dd7068220fda26bf4b1080fb8', 'hex')
let xmrigcndarkletiant1hash = new Buffer.from('d18cb32bd5b465e5a7ba4763d60f88b5792f24e513306f1052954294b737e871', 'hex')
let xmrigcndarkletiant2hash = new Buffer.from('a18a14d94efea108757a42633a1b4d4dc11838084c3c4347850d39ab5211a91f', 'hex')

let xmrigcndarkliteletiant0hash = new Buffer.from('faa7884d9c08126eb164814aeba6547b5d6064277a09fb6b414f5dbc9d01eb2b', 'hex')
let xmrigcndarkliteletiant1hash = new Buffer.from('c75c010780fffd9d5e99838eb093b37c0dd015101c9d298217866daa2993d277', 'hex')
let xmrigcndarkliteletiant2hash = new Buffer.from('fdceb794c1055977a955f31c576a8be528a0356ee1b0a1f9b7f09e20185cda28', 'hex')

let xmrigcnturtleletiant0hash = new Buffer.from('546c3f1badd7c1232c7a3b88cdb013f7f611b7bd3d1d2463540fccbd12997982', 'hex')
let xmrigcnturtleletiant1hash = new Buffer.from('29e7831780a0ab930e0fe3b965f30e8a44d9b3f9ad2241d67cfbfea3ed62a64e', 'hex')
let xmrigcnturtleletiant2hash = new Buffer.from('fc67dfccb5fc90d7855ae903361eabd76f1e40a22a72ad3ef2d6ad27b5a60ce5', 'hex')

let xmrigcnturtleliteletiant0hash = new Buffer.from('5e1891a15d5d85c09baf4a3bbe33675cfa3f77229c8ad66c01779e590528d6d3', 'hex')
let xmrigcnturtleliteletiant1hash = new Buffer.from('ae7f864a7a2f2b07dcef253581e60a014972b9655a152341cb989164761c180a', 'hex')
let xmrigcnturtleliteletiant2hash = new Buffer.from('b2172ec9466e1aee70ec8572a14c233ee354582bcb93f869d429744de5726a26', 'hex')

let cnsoftshellHashv0 = []
cnsoftshellHashv0.push(new Buffer.from('5e1891a15d5d85c09baf4a3bbe33675cfa3f77229c8ad66c01779e590528d6d3', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('e1239347694df77cab780b7ec8920ec6f7e48ecef1d8c368e06708c08e1455f1', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('118a03801c564d12f7e68972419303fe06f7a54ab8f44a8ce7deafbc6b1b5183', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('8be48f7955eb3f9ac2275e445fe553f3ef359ea5c065cde98ff83011f407a0ec', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('d33da3541960046e846530dcc9872b1914a62c09c7d732bff03bec481866ae48', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('8be48f7955eb3f9ac2275e445fe553f3ef359ea5c065cde98ff83011f407a0ec', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('118a03801c564d12f7e68972419303fe06f7a54ab8f44a8ce7deafbc6b1b5183', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('e1239347694df77cab780b7ec8920ec6f7e48ecef1d8c368e06708c08e1455f1', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('5e1891a15d5d85c09baf4a3bbe33675cfa3f77229c8ad66c01779e590528d6d3', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('e1239347694df77cab780b7ec8920ec6f7e48ecef1d8c368e06708c08e1455f1', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('118a03801c564d12f7e68972419303fe06f7a54ab8f44a8ce7deafbc6b1b5183', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('8be48f7955eb3f9ac2275e445fe553f3ef359ea5c065cde98ff83011f407a0ec', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('d33da3541960046e846530dcc9872b1914a62c09c7d732bff03bec481866ae48', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('8be48f7955eb3f9ac2275e445fe553f3ef359ea5c065cde98ff83011f407a0ec', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('118a03801c564d12f7e68972419303fe06f7a54ab8f44a8ce7deafbc6b1b5183', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('e1239347694df77cab780b7ec8920ec6f7e48ecef1d8c368e06708c08e1455f1', 'hex'))
cnsoftshellHashv0.push(new Buffer.from('5e1891a15d5d85c09baf4a3bbe33675cfa3f77229c8ad66c01779e590528d6d3', 'hex'))

let cnsoftshellHashv1 = []
cnsoftshellHashv1.push(new Buffer.from('ae7f864a7a2f2b07dcef253581e60a014972b9655a152341cb989164761c180a', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('ce8687bdd08c49bd1da3a6a74bf28858670232c1a0173ceb2466655250f9c56d', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('ddb6011d400ac8725995fb800af11646bb2fef0d8b6136b634368ad28272d7f4', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('02576f9873dc9c8b1b0fc14962982734dfdd41630fc936137a3562b8841237e1', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('d37e2785ab7b3d0a222940bf675248e7b96054de5c82c5f0b141014e136eadbc', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('02576f9873dc9c8b1b0fc14962982734dfdd41630fc936137a3562b8841237e1', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('ddb6011d400ac8725995fb800af11646bb2fef0d8b6136b634368ad28272d7f4', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('ce8687bdd08c49bd1da3a6a74bf28858670232c1a0173ceb2466655250f9c56d', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('ae7f864a7a2f2b07dcef253581e60a014972b9655a152341cb989164761c180a', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('ce8687bdd08c49bd1da3a6a74bf28858670232c1a0173ceb2466655250f9c56d', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('ddb6011d400ac8725995fb800af11646bb2fef0d8b6136b634368ad28272d7f4', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('02576f9873dc9c8b1b0fc14962982734dfdd41630fc936137a3562b8841237e1', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('d37e2785ab7b3d0a222940bf675248e7b96054de5c82c5f0b141014e136eadbc', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('02576f9873dc9c8b1b0fc14962982734dfdd41630fc936137a3562b8841237e1', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('ddb6011d400ac8725995fb800af11646bb2fef0d8b6136b634368ad28272d7f4', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('ce8687bdd08c49bd1da3a6a74bf28858670232c1a0173ceb2466655250f9c56d', 'hex'))
cnsoftshellHashv1.push(new Buffer.from('ae7f864a7a2f2b07dcef253581e60a014972b9655a152341cb989164761c180a', 'hex'))

let fastHashData = multiHashing['cryptonight'](xmrigdata, true)
let cnletiant0Data = multiHashing['cryptonight'](xmrigdata)
let cnletiant1Data = multiHashing['cryptonight'](xmrigdata, 1)
let cnletiant2Data = multiHashing['cryptonight'](xmrigdata, 2)
let cnliteletiant0Data = multiHashing['cryptonight-lite'](xmrigdata, 0)
let cnliteletiant1Data = multiHashing['cryptonight-lite'](xmrigdata, 1)
let cnliteletiant2Data = multiHashing['cryptonight-lite'](xmrigdata, 2)
let cndarkletiant0Data = multiHashing['cryptonight-dark'](xmrigdata, 0)
let cndarkletiant1Data = multiHashing['cryptonight-dark'](xmrigdata, 1)
let cndarkletiant2Data = multiHashing['cryptonight-dark'](xmrigdata, 2)
let cndarkliteletiant0Data = multiHashing['cryptonight-dark-lite'](xmrigdata, 0)
let cndarkliteletiant1Data = multiHashing['cryptonight-dark-lite'](xmrigdata, 1)
let cndarkliteletiant2Data = multiHashing['cryptonight-dark-lite'](xmrigdata, 2)
let cnturtleletiant0Data = multiHashing['cryptonight-turtle'](xmrigdata, 0)
let cnturtleletiant1Data = multiHashing['cryptonight-turtle'](xmrigdata, 1)
let cnturtleletiant2Data = multiHashing['cryptonight-turtle'](xmrigdata, 2)
let cnturtleliteletiant0Data = multiHashing['cryptonight-turtle-lite'](xmrigdata, 0)
let cnturtleliteletiant1Data = multiHashing['cryptonight-turtle-lite'](xmrigdata, 1)
let cnturtleliteletiant2Data = multiHashing['cryptonight-turtle-lite'](xmrigdata, 2)

// Easy fill soft shell data
let cnsoftshellDatav0 = []
for (let i = 0; i <= 8192; i += 512) {
  cnsoftshellDatav0.push({ height: i, hash: multiHashing['cryptonight-soft-shell'](xmrigdata, 0, i) })
}

// Easy fill soft shell data
let cnsoftshellDatav1 = []
for (i = 0; i <= 8192; i += 512) {
  cnsoftshellDatav1.push({ height: i, hash: multiHashing['cryptonight-soft-shell'](xmrigdata, 1, i) })
}

// Easy fill soft shell data
let cnsoftshellDatav2 = []
for (i = 0; i <= 8192; i += 512) {
  cnsoftshellDatav2.push({ height: i, hash: multiHashing['cryptonight-soft-shell'](xmrigdata, 2, i) })
}

console.log('')
console.log('[#1] Cryptonight Fast Hash: ', fastHashData.toString('hex'))
assert.deepEqual(fastHashData, cnfasthash)
console.log('')
console.log('[#2] Cryptonight v0: ', cnletiant0Data.toString('hex'))
assert.deepEqual(cnletiant0Data, xmrigcnletiant0hash)
console.log('[#3] Cryptonight v1: ', cnletiant1Data.toString('hex'))
assert.deepEqual(cnletiant1Data, xmrigcnletiant1hash)
console.log('[#4] Cryptonight v2: ', cnletiant2Data.toString('hex'))
assert.deepEqual(cnletiant2Data, xmrigcnletiant2hash)
console.log('')
console.log('[#5] Cryptonight Lite v0: ', cnliteletiant0Data.toString('hex'))
assert.deepEqual(cnliteletiant0Data, xmrigcnliteletiant0hash)
console.log('[#6] Cryptonight Lite v1: ', cnliteletiant1Data.toString('hex'))
assert.deepEqual(cnliteletiant1Data, xmrigcnliteletiant1hash)
console.log('[#7] Cryptonight Lite v2: ', cnliteletiant2Data.toString('hex'))
assert.deepEqual(cnliteletiant2Data, xmrigcnliteletiant2hash)
console.log('')
console.log('[#8] Cryptonight Dark v0: ', cndarkletiant0Data.toString('hex'))
assert.deepEqual(cndarkletiant0Data, xmrigcndarkletiant0hash)
console.log('[#9] Cryptonight Dark v1: ', cndarkletiant1Data.toString('hex'))
assert.deepEqual(cndarkletiant1Data, xmrigcndarkletiant1hash)
console.log('[#10] Cryptonight Dark v2: ', cndarkletiant2Data.toString('hex'))
assert.deepEqual(cndarkletiant2Data, xmrigcndarkletiant2hash)
console.log('')
console.log('[#11] Cryptonight Dark Lite v0: ', cndarkliteletiant0Data.toString('hex'))
assert.deepEqual(cndarkliteletiant0Data, xmrigcndarkliteletiant0hash)
console.log('[#12] Cryptonight Dark Lite v1: ', cndarkliteletiant1Data.toString('hex'))
assert.deepEqual(cndarkliteletiant1Data, xmrigcndarkliteletiant1hash)
console.log('[#13] Cryptonight Dark Lite v2: ', cndarkliteletiant2Data.toString('hex'))
assert.deepEqual(cndarkliteletiant2Data, xmrigcndarkliteletiant2hash)
console.log('')
console.log('[#14] Cryptonight Turtle v0: ', cnturtleletiant0Data.toString('hex'))
assert.deepEqual(cnturtleletiant0Data, xmrigcnturtleletiant0hash)
console.log('[#15] Cryptonight Turtle v1: ', cnturtleletiant1Data.toString('hex'))
assert.deepEqual(cnturtleletiant1Data, xmrigcnturtleletiant1hash)
console.log('[#16] Cryptonight Turtle v2: ', cnturtleletiant2Data.toString('hex'))
assert.deepEqual(cnturtleletiant2Data, xmrigcnturtleletiant2hash)
console.log('')
console.log('[#17] Cryptonight Turtle Lite v0: ', cnturtleliteletiant0Data.toString('hex'))
assert.deepEqual(cnturtleliteletiant0Data, xmrigcnturtleliteletiant0hash)
console.log('[#18] Cryptonight Turtle Lite v1: ', cnturtleliteletiant1Data.toString('hex'))
assert.deepEqual(cnturtleliteletiant1Data, xmrigcnturtleliteletiant1hash)
console.log('[#19] Cryptonight Turtle Lite v2: ', cnturtleliteletiant2Data.toString('hex'))
assert.deepEqual(cnturtleliteletiant2Data, xmrigcnturtleliteletiant2hash)

// Spit out soft shell hashes
let count = 20
console.log('')

for (i = 0; i < cnsoftshellDatav0.length; i++) {
  console.log('[#' + count + '] Cryptonight Soft Shell v0 (' + cnsoftshellDatav0[i].height + '): ', cnsoftshellDatav0[i].hash.toString('hex'))
  count++
}

for (i = 0; i < cnsoftshellDatav0.length; i++) {
  assert.deepEqual(cnsoftshellDatav0[i].hash, cnsoftshellHashv0[i])
}

console.log('')
for (i = 0; i < cnsoftshellDatav1.length; i++) {
  console.log('[#' + count + '] Cryptonight Soft Shell v1 (' + cnsoftshellDatav1[i].height + '): ', cnsoftshellDatav1[i].hash.toString('hex'))
  count++
}

for (i = 0; i < cnsoftshellDatav1.length; i++) {
  assert.deepEqual(cnsoftshellDatav1[i].hash, cnsoftshellHashv1[i])
}

/* We cannot currently generate a valid Soft Shell v2 hash at this time
   that issue will be rectified soon */


console.log('')
for (i = 0; i < cnsoftshellDatav2.length; i++) {
  console.log('[#' + count + '] Cryptonight Soft Shell v2 (' + cnsoftshellDatav2[i].height + '): ', cnsoftshellDatav2[i].hash.toString('hex'))
  count++
}


// turtlecoin-cryptonote-util tests

let validAddressPrefix = 3914525
let address = new Buffer.from('TRTLuxN6FVALYxeAEKhtWDYNS9Vd9dHVp3QHwjKbo76ggQKgUfVjQp8iPypECCy3MwZVyu89k1fWE2Ji6EKedbrqECHHWouZN6g')

let addressPrefix = cnUtil.adress_decode(address)

console.log('')
console.log('')
console.log('[#' + count + '] Address Prefix: ', addressPrefix)

assert.deepEqual(validAddressPrefix, addressPrefix)
