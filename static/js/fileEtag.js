// 引入sha1算法
self.importScripts('sha1.min.js')

// 接收主线程传递的参数
self.onmessage = event => {
  let {partList, status, sha1List, fileReq} = event.data
  let prefix = 0x16
  // sha1算法
  let shA1 = self.sha1.digest
  switch (status) {
    case 'block':
      let percent = 0
      let size = 100 / partList.length
      if (!partList.length) {
        self.postMessage({
          status: 'success',
          fileReq: fileReq,
          sha1: 'Fto5o-5ea0sNMlW_75VgGJCv2AcJ'
        })
      }
      for (let i = 0; i < partList.length; i++) {
        let chunk = partList[i].chunk
        // 本地文件读取到内存中
        let reader = new FileReader()
        // 开始读取指定的 Blob 中的内容, 一旦完成, result 属性中保存的将是被读取文件的 ArrayBuffer 数据对象.
        reader.readAsArrayBuffer(chunk)
        reader.onload = () => {
          percent += size
          // 修改滚动条
          self.postMessage({
            status: status,
            percent: Number(percent.toFixed(2)),
            fileReq: fileReq,
            sha1Value: shA1(reader.result),
            i: i
          })
        }
      }
      break
    case 'merge':
      let sha1Buffer = concatArr2Uint8(sha1List)
      // 如果大于4M，则对各个块的sha1结果再次sha1
      if (sha1List.length > 1) {
        prefix = 0x96
        sha1Buffer = shA1(sha1Buffer.buffer)
      } else {
        sha1Buffer = Array.apply([], sha1Buffer)
      }
      sha1Buffer = concatArr2Uint8([[prefix], sha1Buffer])
      self.postMessage({
        status: 'success',
        fileReq: fileReq,
        sha1: Uint8ToBase64(sha1Buffer, true)
      })
      break
    default:
      break
  }
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
