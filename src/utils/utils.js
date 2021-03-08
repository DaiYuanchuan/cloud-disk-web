/**
 * 存储单元转换
 * @param {Long} bytes 字节数
 */
export function storageUnitConversion (bytes) {
  if (bytes === 0) return '0 B'
  let k = 1024
  let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
}

/**
 * 字符串格式转换(大写字母转小写，前面加 - )
 * 例:
 * cloudDisk -> cloud-disk
 * @param {String}} s 字符串
 */
export function kebabCase (s) {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

/**
 * 获取全局唯一标识符uuid
 */
export function uuid () {
  var s = []
  var hexDigits = '0123456789abcdefghijklmnopqrstuvwxyz'
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4'
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = ''
  var uuid = s.join('')
  return uuid
}

/**
 * 获得一个随机的字符串（只包含数字和字符）
 * @param {Integer} length 字符串的长度
 * @return 随机字符串
 */
export function randomString (length) {
  let BASE_NUMBER = '0123456789'
  let BASE_CHAR = 'abcdefghijklmnopqrstuvwxyz'
  let baseString = BASE_CHAR + BASE_NUMBER
  if (length < 1) {
    length = 1
  }
  let character = ''
  let baseLength = baseString.length
  for (let i = 0; i < length; i++) {
    let number = Math.floor(Math.random() * (baseLength))
    character += baseString.charAt(number)
  }
  return character
}
