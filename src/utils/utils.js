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
 * 此类型用于页面的svg维护
 */
const typeToSvg = {
  'image/pict': 'file-list-picture',
  'image/x-portable-graymap': 'file-list-picture',
  'application/atom+xml': 'file-list-picture',
  'application/voicexml+xml': 'file',
  'application/x-csh': 'file-list-csh',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template': 'file-list-dotx',
  'application/vnd.mozilla.xul+xml': 'file',
  'audio/midi': 'file-list-midi',
  'application/x-troff': 'file',
  'application/vnd.sun.xml.draw.template': 'file',
  'application/x-shockwave-flash': 'file-list-swf-fill',
  'video/x-msvideo': 'file-list-video',
  'image/x-portable-bitmap': 'file',
  'application/vnd.openxmlformats-officedocument.presentationml.slide': 'file',
  'application/x-ustar': 'file',
  'text/sgml': 'file',
  'image/x-rgb': 'file',
  'application/vnd.oasis.opendocument.spreadsheet-template': 'file',
  'application/vnd.ms-excel': 'file',
  'audio/mp4a-latm': 'file',
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12': 'file',
  'application/x-futuresplash': 'file',
  'application/x-sv4cpio': 'file',
  'application/xml-dtd': 'file',
  'application/pdf': 'file-list-pdf',
  'application/x-troff-man': 'file',
  'application/json': 'file-list-json',
  'application/vnd.wap.wmlc': 'file',
  'application/x-bittorrent': 'file-list-torrent',
  'video/vnd.mpegurl': 'file',
  'application/x-netcdf': 'file',
  'application/x-tcl': 'file',
  'audio/amr': 'file',
  'application/mathml+xml': 'file',
  'text/html': 'file',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'file',
  'application/vnd.oasis.opendocument.text-template': 'file',
  'application/x-hdf': 'file',
  'application/x-texinfo': 'file',
  'application/vnd.oasis.opendocument.database': 'file',
  'application/x-rpm': 'file',
  'text/csv': 'file',
  'image/x-xpixmap': 'file',
  'application/smil': 'file',
  'text/css': 'file',
  'video/quicktime': 'file',
  'application/vnd.symbian.install': 'file',
  'text/calendar': 'file',
  'video/mp4': 'file-list-video',
  'application/xml': 'file',
  'application/vnd.sun.xml.writer.template': 'file',
  'application/x-sh': 'file',
  'image/cgm': 'file',
  'video/webm': 'file',
  'audio/x-ms-wma': 'file',
  'application/vnd.sun.xml.math': 'file',
  'application/x-troff-ms': 'file',
  'image/bmp': 'file',
  'image/vnd.djvu': 'file',
  'application/x-wais-source': 'file',
  'video/x-ms-wm': 'file',
  'application/postscript': 'file',
  'application/xhtml+xml': 'file',
  'video/x-m4v': 'file',
  'model/vrml': 'file',
  'application/vnd.sun.xml.calc.template': 'file',
  'image/x-cmu-raster': 'file',
  'application/x-troff-me': 'file',
  'image/x-quicktime': 'file',
  'application/vnd.sun.xml.writer': 'file',
  'audio/basic': 'file',
  'application/x-dvi': 'file',
  'application/x-latex': 'file',
  'application/mac-compactpro': 'file',
  'video/3gpp': 'file',
  'video/ogv': 'file',
  'application/x-chess-pgn': 'file',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template': 'file',
  'application/vnd.sun.xml.writer.global': 'file',
  'application/vnd.ms-powerpoint': 'file',
  'application/mac-binhex40': 'file',
  'image/jp2': 'file',
  'application/x-tex': 'file',
  'application/vnd.openxmlformats-officedocument.presentationml.template': 'file',
  'video/mpeg': 'file',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file',
  'image/tiff': 'file',
  'application/x-stuffit': 'file',
  'application/zip': 'file',
  'application/oda': 'file',
  'application/vnd.wap.wbxml': 'file',
  'application/xslt+xml': 'file',
  'application/vnd.oasis.opendocument.text-master': 'file',
  'application/vnd.sun.xml.draw': 'file',
  'application/x-gtar': 'file',
  'image/ief': 'file',
  'text/tab-separated-values': 'file',
  'x-conference/x-cooltalk': 'file',
  'image/gif': 'file-list-picture',
  'application/vnd.sun.xml.calc': 'file',
  'application/srgs': 'file',
  'image/webp': 'file',
  'image/x-xbitmap': 'file',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-list-docx',
  'application/vnd.oasis.opendocument.graphics-template': 'file',
  'application/x-cdlink': 'file',
  'application/vnd.oasis.opendocument.text-web': 'file',
  'application/andrew-inset': 'file',
  'application/x-killustrator': 'file',
  'audio/x-wav': 'file',
  'application/srgs+xml': 'file',
  'application/vnd.rn-realmedia': 'file',
  'audio/x-aiff': 'file',
  'text/rtf': 'file',
  'text/x-setext': 'file',
  'application/vnd.oasis.opendocument.graphics': 'file',
  'audio/x-ms-wax': 'file',
  'application/octet-stream': 'file',
  'application/msword': 'file',
  'application/x-java-jnlp-file': 'file',
  'application/x-javascript': 'file',
  'application/x-sv4crc': 'file',
  'application/rdf+xml': 'file',
  'video/x-ms-wvx': 'file',
  'audio/mpeg': 'file-list-audio',
  'video/x-ms-wmv': 'file',
  'application/vnd.oasis.opendocument.text': 'file',
  'application/x-bcpio': 'file',
  'image/x-portable-pixmap': 'file',
  'video/x-ms-wmx': 'file',
  'application/x-koan': 'file',
  'text/vnd.sun.j2me.app-descriptor': 'file',
  'image/x-macpaint': 'file',
  'chemical/x-pdb': 'file',
  'application/vnd.oasis.opendocument.presentation': 'file',
  'application/vnd.wap.wmlscriptc': 'file',
  'text/vnd.wap.wml': 'file',
  'application/vnd.mif': 'file',
  'model/iges': 'file',
  'text/richtext': 'file',
  'image/vnd.wap.wbmp': 'file',
  'audio/x-mpegurl': 'file',
  'model/mesh': 'file',
  'application/vnd.oasis.opendocument.chart': 'file',
  'image/jpeg': 'file-list-picture',
  'application/ogg': 'file',
  'image/x-icon': 'file',
  'image/svg+xml': 'file',
  'application/x-shar': 'file',
  'video/x-flv': 'file',
  'application/x-director': 'file',
  'application/vnd.ms-excel.addin.macroEnabled.12': 'file',
  'application/vnd.sun.xml.impress': 'file',
  'application/x-kspread': 'file',
  'audio/x-pn-realaudio': 'file',
  'application/vnd.oasis.opendocument.spreadsheet': 'file',
  'text/plain': 'file',
  'application/x-java-archive': 'file',
  'application/x-gzip': 'file',
  'application/vnd.oasis.opendocument.image': 'file',
  'image/png': 'file-list-picture',
  'application/x-bzip2': 'file',
  'chemical/x-xyz': 'file',
  'image/x-xwindowdump': 'file',
  'application/x-cpio': 'file',
  'video/x-sgi-movie': 'file',
  'application/vnd.android.package-archive': 'file',
  'application/vnd.oasis.opendocument.presentation-template': 'file',
  'application/x-kchart': 'file',
  'application/x-tar': 'file',
  'video/x-dv': 'file',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow': 'file',
  'text/vnd.wap.wmlscript': 'file',
  'image/x-portable-anymap': 'file',
  'application/vnd.sun.xml.impress.template': 'file',
  'application/vnd.oasis.opendocument.formula': 'file'
}

/**
 * 根据mime类型判断文件所属的SVG图片类型
 * 用于 与文件列表的SVG相互对应
 * @param type 文件的mime类型
 */
export function mimeTypes (type) {
  let mimeSvg = typeToSvg[type]
  if (mimeSvg === undefined) {
    return 'file'
  }
  return mimeSvg
}

const typeMap = {
  image: ['image/gif', 'image/png', 'image/bmp', 'image/jpeg', 'application/x-shockwave-flash'],
  video: ['video/mp4', 'video/ogg', 'video/webm'],
  audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac', 'amr'],
  document: ['doc', 'txt', 'json', 'docx', 'pages', 'epub', 'pdf', 'vue', 'numbers', 'csv', 'xls', 'xlsx', 'keynote', 'ppt', 'pptx']
}

/**
 * 根据mime类型判断当前文件是否支持预览
 * 支持预览的 ，返回预览类型
 * @param mimeType 文件的mime类型
 */
export function fileCategory (mimeType) {
  // 未能匹配到默认返回的类型
  let type = 'unknown'
  Object.keys(typeMap).forEach((_type) => {
    const extensions = typeMap[_type]
    if (extensions.indexOf(mimeType) > -1) {
      type = _type
    }
  })
  return type
}

/**
 * 根据传入的时间与现在的时间差
 * 将时间差转成可读字符串 如:刚刚、3秒前、一小时前等等
 *
 * @param time 需要进行比较的毫秒级时间(毫秒 同时需要 小于 当前时间)
 * @return 返回可读字符串, 大于20天的 将会直接显示日期
 */
export function timeDifference (time) {
  if (time === null || time === undefined) {
    return ''
  }

  // 获取两个日期之间相差的毫秒数
  let timeDifference = Math.abs(Date.now() - time)

  let days = timeDifference / 1000 / 60 / 60 / 24
  let hours = timeDifference / 1000 / 60 / 60 - (24 * Math.floor(days))
  let minutes = timeDifference / 1000 / 60 - (24 * 60 * Math.floor(days)) - (60 * Math.floor(hours))
  let seconds = timeDifference / 1000 - (24 * 60 * 60 * Math.floor(days)) - (60 * 60 * Math.floor(hours)) - (60 * Math.floor(minutes))

  // 1分钟以内(1分钟 = 60000ms)
  if (timeDifference < 60000) {
    // 如果是5秒内
    let just = 5
    if (timeDifference < 1000 * just) {
      return '刚刚'
    } else {
      return Math.floor(seconds) + '秒前'
    }
  }

  // 一小时内(大于 1分钟[60000ms] 小于 1小时[3600000ms])
  if (timeDifference >= 60000 && timeDifference < 3600000) {
    return Math.floor(minutes) + '分钟前'
  }

  // 一天内
  if (timeDifference >= 3600000 && timeDifference < 86400000) {
    return Math.floor(hours) + '小时前'
  }

  // 二十天内
  let twentyDays = 86400000 * 20
  if (timeDifference >= 86400000 && timeDifference < twentyDays) {
    return Math.floor(days) + '天前'
  }

  return ''
}

/**
 * 日期格式化
 * @param date 日期对象
 * @param fmt format yyyy-MM-dd
 * @returns {*}
 */
export function formatDate (date, fmt) {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : ('00' + str).substr(str.length))
    }
  }
  return fmt
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
  let s = []
  let hexDigits = '0123456789abcdefghijklmnopqrstuvwxyz'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4'
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = ''
  return s.join('')
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
