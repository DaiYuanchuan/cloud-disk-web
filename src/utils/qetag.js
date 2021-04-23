/**
 * 文件唯一标识etag计算方法
 * @param buffer 文件的buffer
 * @param progress 当前计算进度
 * @param callback 计算成功的回调函数
 * @returns {*}
 */
export function getEtag (buffer, progress, callback) {
  let sha1 = require('js-sha1')
  // sha1算法
  let shA1 = sha1.digest

  // 以4M为单位分割
  let blockSize = 4 * 1024 * 1024
  let sha1String = []
  let prefix = 0x16
  let blockCount = 0

  let bufferSize = buffer.size || buffer.length || buffer.byteLength
  blockCount = Math.ceil(bufferSize / blockSize)

  for (let i = 0; i < blockCount; i++) {
    sha1String.push(shA1(buffer.slice(i * blockSize, (i + 1) * blockSize)))
    // 上传进度回调
    progress((i + 1) / blockCount)
  }

  function concatArr2Uint8 (s) {
    let tmp = []
    for (let i of s) tmp = tmp.concat(i)
    return new Uint8Array(tmp)
  }

  function Uint8ToBase64 (u8Arr, uriSafe) {
    let CHUNK_SIZE = 0x8000
    let index = 0
    let length = u8Arr.length
    let result = ''
    let slice
    while (index < length) {
      slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length))
      result += String.fromCharCode.apply(null, slice)
      index += CHUNK_SIZE
    }
    return uriSafe ? btoa(result).replace(/\//g, '_').replace(/\+/g, '-') : btoa(result)
  }

  function calcEtag () {
    if (!sha1String.length) return 'Fto5o-5ea0sNMlW_75VgGJCv2AcJ'
    let sha1Buffer = concatArr2Uint8(sha1String)
    // 如果大于4M，则对各个块的sha1结果再次sha1
    if (blockCount > 1) {
      prefix = 0x96
      sha1Buffer = shA1(sha1Buffer.buffer)
    } else {
      sha1Buffer = Array.apply([], sha1Buffer)
    }
    sha1Buffer = concatArr2Uint8([[prefix], sha1Buffer])
    return Uint8ToBase64(sha1Buffer, true)
  }

  return callback(calcEtag())
}
