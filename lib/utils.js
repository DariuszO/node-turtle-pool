exports.uid = function () {
  let min = 100000000000000
  let max = 999999999999999
  let id = Math.floor(Math.random() * (max - min + 1)) + min
  return id.toString()
}

exports.ringBuffer = function (maxSize) {
  let data = []
  let cursor = 0
  let isFull = false

  return {
    append: function (x) {
      if (isFull) {
        data[cursor] = x
        cursor = (cursor + 1) % maxSize
      } else {
        data.push(x)
        cursor++
        if (data.length === maxSize) {
          cursor = 0
          isFull = true
        }
      }
    },
    avg: function (plusOne) {
      let sum = data.reduce(function (a, b) { return a + b }, plusOne || 0)
      return sum / ((isFull ? maxSize : cursor) + (plusOne ? 1 : 0))
    },
    size: function () {
      return isFull ? maxSize : cursor
    },
    clear: function () {
      data = []
      cursor = 0
      isFull = false
    }
  }
}

exports.varIntEncode = function (n) {

}
