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
