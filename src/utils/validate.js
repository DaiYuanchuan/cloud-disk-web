/**
 * 火车车次，例如: G1868, D102, D9, Z5, Z24, Z17
 *
 * @param {string} trainNumber 需要校验的车次信息
 */
export function validTrainNumber (trainNumber) {
  const reg = /^[GCDZTSPKXLY1-9]\d{1,4}$/
  return reg.test(trainNumber)
}

/**
 * 手机机身码(IMEI)，例如: 123456789012345, 1234567890123456, 12345678901234567
 *
 * @param {string} imei 需要校验的imei信息
 */
export function validPhoneIMEI (imei) {
  const reg = /^\d{15,17}$/
  return reg.test(imei)
}

/**
 * 必须带端口号的网址(或ip)，例如: https://www.qq.com:8080, 127.0.0.1:5050, baidu.com:8001, http://192.168.1.1:9090 , 反例: https://www.jd.com
 *
 * @param {string} url 需要校验的url信息
 */
export function validUrlPortNumber (url) {
  const reg = /^((ht|f)tps?:\/\/)?[\w-]+(\.[\w-]+)+:\d{1,5}\/?$/
  return reg.test(url)
}

/**
 * 统一社会信用代码，例如: 91230184MA1BUFLT44, 92371000MA3MXH0E3W
 *
 * @param {string} code 需要校验的code信息
 */
export function validUnifiedSocialCreditCode (code) {
  const reg = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/
  return reg.test(code)
}

/**
 * 统一社会信用代码(宽松匹配)(15位/18位/20位数字/字母)，例如: 91110108772551611J, 911101085923662400
 *
 * @param {string} code 需要校验的code信息
 */
export function validUnifiedSocialCreditCodeEasyMatch (code) {
  const reg = /^(([0-9A-Za-z]{15})|([0-9A-Za-z]{18})|([0-9A-Za-z]{20}))$/
  return reg.test(code)
}

/**
 * 迅雷链接，例如: thunder://QUEsICdtYWduZXQ6P3h0PXVybjpidGloOjBCQTE0RTUxRkUwNjU1RjE0Qzc4NjE4RjY4NDY0QjZFNTEyNjcyOUMnWlo=
 *
 * @param {string} url 需要校验的url信息
 */
export function validThunder (url) {
  const reg = /^thunderx?:\/\/[a-zA-Z\d]+=$/
  return reg.test(url)
}

/**
 * ed2k链接(宽松匹配)，例如: ed2k://|file|%E5%AF%84%E7%94%9F%E8%99%AB.2019.mp4|2501554832|C0B93E032C20CE577A3|h=5HTKZIHFIBV|/
 *
 * @param {string} url 需要校验的url信息
 */
export function validEd2k (url) {
  const reg = /^ed2k:\/\/\|file\|.+\|\/$/
  return reg.test(url)
}

/**
 * 磁力链接(宽松匹配)，例如: magnet:?xt=urn:btih:40A89A6F4FB1498A98087109D012A9A851FBE0FC
 *
 * @param {string} url 需要校验的url信息
 */
export function validMagneticLink (url) {
  const reg = /^magnet:\?xt=urn:btih:[0-9a-fA-F]{40,}.*$/
  return reg.test(url)
}

/**
 * 子网掩码，例如: 255.255.255.0, 255.224.0.0
 *
 * @param {string} ip 需要校验的ip信息
 */
export function validSubnetMask (ip) {
  const reg = /^(?:\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(?:\.(?:\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/
  return reg.test(ip)
}

/**
 * window"文件夹"路径，例如: C:\Users\Administrator\Desktop, e:\m\
 *
 * @param {string} path 需要校验的path信息
 */
export function validWinFolderPath (path) {
  const reg = /^[a-zA-Z]:\\(?:\w+\\?)*$/
  return reg.test(path)
}

/**
 * window下"文件"路径，例如: C:\Users\Administrator\Desktop\qq.link, e:\m\vscode.exe
 *
 * @param {string} path 需要校验的path信息
 */
export function validWinFilePath (path) {
  const reg = /^[a-zA-Z]:\\(?:\w+\\)*\w+\.\w+$/
  return reg.test(path)
}

/**
 * 股票代码(A股)，例如: sz000858, SZ002136, sz300675, SH600600, sh601155
 *
 * @param {string} code 需要校验的code信息
 */
export function validStockCode (code) {
  const reg = /^(s[hz]|S[HZ])(000[\d]{3}|002[\d]{3}|300[\d]{3}|600[\d]{3}|60[\d]{4})$/
  return reg.test(code)
}

/**
 * 大于等于0, 小于等于150, 支持小数位出现5, 如145.5, 用于判断考卷分数，例如: 150, 100.5
 *
 * @param {string} scores 需要校验的scores信息
 */
export function validScores (scores) {
  const reg = /^150$|^(?:\d|[1-9]\d|1[0-4]\d)(?:.5)?$/
  return reg.test(scores)
}

/**
 * html注释，例如: <!--<div class="_bubble"></div>-->
 *
 * @param {string} code 需要校验的code信息
 */
export function validAnnotated (code) {
  const reg = /^<!--[\s\S]*?-->$/
  return reg.test(code)
}

/**
 * md5格式(32位)，例如: 21fe181c5bfc16306a6828c1f7b762e8
 *
 * @param {string} md5 需要校验的md5信息
 */
export function validMd5 (md5) {
  const reg = /^([a-f\d]{32}|[A-F\d]{32})$/
  return reg.test(md5)
}

/**
 * 版本号(version)格式必须为X.Y.Z，例如: 16.3.10
 *
 * @param {string} version 需要校验的version信息
 */
export function validVersion (version) {
  const reg = /^\d+(?:\.\d+){2}$/
  return reg.test(version)
}

/**
 * 视频(video)链接地址（视频格式可按需增删），例如: http://www.abc.com/video/wc.avi
 *
 * @param {string} url 需要校验的url信息
 */
export function validVideoUrl (url) {
  const reg = /^https?:\/\/(.+\/)+.+(\.(swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4))$/i
  return reg.test(url)
}

/**
 * 图片(image)链接地址（图片格式可按需增删），例如: https://www.abc.com/logo.png
 *
 * @param {string} url 需要校验的url信息
 */
export function validImgUrl (url) {
  const reg = /^https?:\/\/(.+\/)+.+(\.(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif))$/i
  return reg.test(url)
}

/**
 * 24小时制时间（HH:mm:ss），例如: 23:34:55
 *
 * @param {string} time 需要校验的time信息
 */
export function valid24Hour (time) {
  const reg = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/
  return reg.test(time)
}

/**
 * 12小时制时间（hh:mm:ss），例如: 11:34:55 , 反例: 23:34:55
 *
 * @param {string} time 需要校验的time信息
 */
export function valid12Hour (time) {
  const reg = /^(?:1[0-2]|0?[1-9]):[0-5]\d:[0-5]\d$/
  return reg.test(time)
}

/**
 * 数字/货币金额（支持负数、千分位分隔符），例如: 100, -0.99, 3, 234.32, -1, 900, 235.09, 12,345,678.90
 *
 * @param {string} currency 需要校验的currency信息
 */
export function validCurrencySupportNegative (currency) {
  const reg = /^-?\d+(,\d{3})*(\.\d{1,2})?$/
  return reg.test(currency)
}

/**
 * 数字/货币金额 (只支持正数、不支持校验千分位分隔符)，例如: 0.99, 8.99, 666
 *
 * @param {string} currency 需要校验的currency信息
 */
export function validCurrency (currency) {
  const reg = /(?:^[1-9]([0-9]+)?(?:\.[0-9]{1,2})?$)|(?:^(?:0){1}$)|(?:^[0-9]\.[0-9](?:[0-9])?$)/
  return reg.test(currency)
}

/**
 * 银行卡号（10到30位, 覆盖对公/私账户, 参考[微信支付](https://pay.weixin.qq.com/wiki/doc/api/xiaowei.php?chapter=22_1)），例如: 6234567890, 6222026006705354000
 *
 * @param {string} creditCardNumber 需要校验的银行卡号信息
 */
export function validCreditCardNumber (creditCardNumber) {
  const reg = /^[1-9]\d{9,29}$/
  return reg.test(creditCardNumber)
}

/**
 * 中文姓名，例如: 葛二蛋, 凯文·杜兰特, 德克·维尔纳·诺维茨基
 *
 * @param {string} chinese 需要校验的字符串信息
 */
export function validChinese (chinese) {
  const reg = /^(?:[\u4e00-\u9fa5·]{2,16})$/
  return reg.test(chinese)
}

/**
 * 英文姓名，例如: James, Kevin Wayne Durant, Dirk Nowitzki
 *
 * @param {string} english 需要校验的字符串信息
 */
export function validEnglish (english) {
  const reg = /(^[a-zA-Z]{1}[a-zA-Z\s]{0,20}[a-zA-Z]{1}$)/
  return reg.test(english)
}

/**
 * 车牌号(新能源)，例如: 京AD92035, 甘G23459F
 *
 * @param {string} number 需要校验的字符串信息
 */
export function validNewEnergyLicensePlateNumber (number) {
  const reg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-HJ-NP-Z]{1}(([0-9]{5}[DF])|([DF][A-HJ-NP-Z0-9][0-9]{4}))$/
  return reg.test(number)
}

/**
 * 车牌号(非新能源)，例如: 京A00599, 黑D23908
 *
 * @param {string} number 需要校验的字符串信息
 */
export function validNoNewEnergyLicensePlateNumber (number) {
  const reg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-HJ-NP-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/
  return reg.test(number)
}

/**
 * 车牌号(新能源+非新能源)，例如: 京A12345D, 京A00599 , 反例: 宁AD1234555555, 浙苏H6F681
 *
 * @param {string} number 需要校验的字符串信息
 */
export function validLicensePlateNumber (number) {
  const reg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-HJ-NP-Z]{1}(?:(([0-9]{5}[DF])|([DF][A-HJ-NP-Z0-9][0-9]{4}))|[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1})$/
  return reg.test(number)
}

/**
 * 手机号(mobile phone)中国(严谨), 根据工信部2019年最新公布的手机号段，例如: 008618311006933, +8617888829981, 19119255642
 *
 * @param {string} phone 需要校验的手机号信息
 */
export function validMobilePhone (phone) {
  const reg = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/
  return reg.test(phone)
}

/**
 * 手机号(mobile phone)中国(宽松), 只要是13,14,15,16,17,18,19开头即可，例如: 008618311006933, +8617888829981, 19119255642
 *
 * @param {string} phone 需要校验的手机号信息
 */
export function validLooseMobilePhone (phone) {
  const reg = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 手机号(mobile phone)中国(最宽松), 只要是1开头即可, 如果你的手机号是用来接收短信, 优先建议选择这一条，例如: 008618311006933, +8617888829981, 19119255642
 *
 * @param {string} phone 需要校验的手机号信息
 */
export function validLoosestMobilePhone (phone) {
  const reg = /^(?:(?:\+|00)86)?1\d{10}$/
  return reg.test(phone)
}

/**
 * date(日期)，例如: 1990-12-12, 2020-1-1
 *
 * @param {string} date 需要校验的date信息
 */
export function validDate (date) {
  const reg = /^\d{4}(-)(1[0-2]|0?\d)\1([0-2]\d|\d|30|31)$/
  return reg.test(date)
}

/**
 * email(邮箱)，例如: 90203918@qq.com, nbilly@126.com
 *
 * @param {string} email 需要校验的邮箱信息
 */
export function validEmail (email) {
  const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

/**
 * 座机(tel phone)电话(国内)，例如: 0936-4211235
 *
 * @param {string} telPhone 需要校验的座机信息
 */
export function validTelPhone (telPhone) {
  const reg = /^\d{3}-\d{8}$|^\d{4}-\d{7,8}$/
  return reg.test(telPhone)
}

/**
 * 身份证号(1代,15位数字)，例如: 123456991010193
 *
 * @param {string} cardNumber 需要校验的cardNumber信息
 */
export function valid1GenerationCitizenIdCard (cardNumber) {
  const reg = /^[1-9]\d{7}(?:0\d|10|11|12)(?:0[1-9]|[1-2][\d]|30|31)\d{3}$/
  return reg.test(cardNumber)
}

/**
 * 身份证号(2代,18位数字),最后一位是校验位,可能为数字或字符X，例如: 12345619991205131x
 *
 * @param {string} cardNumber 需要校验的cardNumber信息
 */
export function valid2GenerationCitizenIdCard (cardNumber) {
  const reg = /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|10|11|12)(?:0[1-9]|[1-2]\d|30|31)\d{3}[\dXx]$/
  return reg.test(cardNumber)
}

/**
 * 身份证号, 支持1/2代(15位/18位数字)，例如: 622223199912051311
 *
 * @param {string} cardNumber 需要校验的cardNumber信息
 */
export function validCitizenIdCard (cardNumber) {
  const reg = /(^\d{8}(0\d|10|11|12)([0-2]\d|30|31)\d{3}$)|(^\d{6}(18|19|20)\d{2}(0[1-9]|10|11|12)([0-2]\d|30|31)\d{3}(\d|X|x)$)/
  return reg.test(cardNumber)
}

/**
 * 香港身份证，例如: K034169(1)
 *
 * @param {string} cardNumber 需要校验的cardNumber信息
 */
export function validHongKongCitizenIdCard (cardNumber) {
  const reg = /^[a-zA-Z]\d{6}\([\dA]\)$/
  return reg.test(cardNumber)
}

/**
 * 澳门身份证，例如: 5686611(1)
 *
 * @param {string} cardNumber 需要校验的cardNumber信息
 */
export function validMacauCitizenIdCard (cardNumber) {
  const reg = /^[1|5|7]\d{6}[(\d)]{3}$/
  return reg.test(cardNumber)
}

/**
 * 台湾身份证，例如: U193683453
 *
 * @param {string} cardNumber 需要校验的cardNumber信息
 */
export function validTaiwanCitizenIdCard (cardNumber) {
  const reg = /^[a-zA-Z][0-9]{9}$/
  return reg.test(cardNumber)
}

/**
 * 护照（包含香港、澳门），例如: s28233515, 141234567, 159203084, MA1234567, K25345719
 *
 * @param {string} passport 需要校验的passport信息
 */
export function validPassport (passport) {
  const reg = /(^[EeKkGgDdSsPpHh]\d{8}$)|(^(([Ee][a-fA-F])|([DdSsPp][Ee])|([Kk][Jj])|([Mm][Aa])|(1[45]))\d{7}$)/
  return reg.test(passport)
}

/**
 * 帐号是否合法(字母开头，允许5-16字节，允许字母数字下划线组合，例如: justin, justin1989, justin_666
 *
 * @param {string} account 需要校验的account信息
 */
export function validAccount (account) {
  const reg = /^[a-zA-Z]\w{4,15}$/
  return reg.test(account)
}

/**
 * 中文/汉字，例如: 正则,前端
 *
 * @param {string} str 需要校验的str信息
 */
export function validChineseCharacters (str) {
  const reg = /^(?:[\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0])+$/
  return reg.test(str)
}

/**
 * 小数，例如: 0.0, 0.09
 *
 * @param {string} decimal 需要校验的decimal信息
 */
export function validDecimal (decimal) {
  const reg = /^\d+\.\d+$/
  return reg.test(decimal)
}

/**
 * 数字，例如: 12345678
 *
 * @param {string} number 需要校验的number信息
 */
export function validNumber (number) {
  const reg = /^\d{1,}$/
  return reg.test(number)
}

/**
 * html标签(宽松匹配)，例如: <div id="app"> 2333 </div>, <input type="text">, <br>
 *
 * @param {string} htmlTags 需要校验的htmlTags信息
 */
export function validHtmlTags (htmlTags) {
  const reg = /<(\w+)[^>]*>(.*?<\/\1>)?/
  return reg.test(htmlTags)
}

/**
 * qq号格式正确，例如: 903013545, 9020304
 *
 * @param {string} QQNumber 需要校验的QQNumber信息
 */
export function validQQNumber (QQNumber) {
  const reg = /^[1-9][0-9]{4,10}$/
  return reg.test(QQNumber)
}

/**
 * 数字和字母组成，例如: james666, haha233hi
 *
 * @param {string} numbersAndLetters 需要校验的numbersAndLetters信息
 */
export function validNumbersAndLetters (numbersAndLetters) {
  const reg = /^[A-Za-z0-9]+$/
  return reg.test(numbersAndLetters)
}

/**
 * 英文字母，例如: Russel
 *
 * @param {string} englishAlphabet 需要校验的englishAlphabet信息
 */
export function validEnglishAlphabet (englishAlphabet) {
  const reg = /^[a-zA-Z]+$/
  return reg.test(englishAlphabet)
}

/**
 * 小写英文字母组成，例如: russel
 *
 * @param {string} lowercaseLetter 需要校验的lowercaseLetter信息
 */
export function validLowercaseLetter (lowercaseLetter) {
  const reg = /^[a-z]+$/
  return reg.test(lowercaseLetter)
}

/**
 * 大写英文字母，例如: ABCD
 *
 * @param {string} capitalLetter 需要校验的capitalLetter信息
 */
export function validCapitalLetter (capitalLetter) {
  const reg = /^[A-Z]+$/
  return reg.test(capitalLetter)
}

/**
 * 密码强度校验，最少6位，包括至少1个大写字母，1个小写字母，1个数字，1个特殊字符，例如: Kd%curry666
 *
 * @param {string} password 需要校验的password信息
 */
export function validPassword (password) {
  const reg = /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/
  return reg.test(password)
}

/**
 * 用户名正则校验，4到16位（字母，数字，下划线，减号），例如: xiaohua_qq
 *
 * @param {string} username 需要校验的用户名
 * @returns {Boolean} 返回校验结果
 */
export function validUsername (username) {
  const reg = /^[a-zA-Z0-9_-]{4,16}$/
  return reg.test(username)
}

/**
 * ip-v4，例如: 172.16.0.0, 127.0.0.0
 *
 * @param {string} ipv4 需要校验的ipv4
 * @returns {Boolean} 返回校验结果
 */
export function validIpv4 (ipv4) {
  const reg = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return reg.test(ipv4)
}

/**
 * ip-v6，例如: 2031:0000:130f:0000:0000:09c0:876a:130b
 *
 * @param {string} ipv6 需要校验的ipv6
 * @returns {Boolean} 返回校验结果
 */
export function validIpv6 (ipv6) {
  const reg = /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i
  return reg.test(ipv6)
}

/**
 * 16进制颜色，例如: #f00, #F90, #000, #fe9de8
 *
 * @param {string} hexadecimal 需要校验的hexadecimal信息
 */
export function validHexadecimal (hexadecimal) {
  const reg = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
  return reg.test(hexadecimal)
}

/**
 * 微信号(wx)，6至20位，以字母开头，字母，数字，减号，下划线，例如: github666, kd_-666
 *
 * @param {string} weChatId 需要校验的weChatId信息
 */
export function validWeChatId (weChatId) {
  const reg = /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/
  return reg.test(weChatId)
}

/**
 * 邮政编码(中国)，例如: 734500, 100101
 *
 * @param {string} postalCode 需要校验的postalCode信息
 */
export function validPostalCode (postalCode) {
  const reg = /^(0[1-7]|1[0-356]|2[0-7]|3[0-6]|4[0-7]|5[1-7]|6[1-7]|7[0-5]|8[013-6])\d{4}$/
  return reg.test(postalCode)
}

/**
 * 中文和数字，例如: 哈哈哈, 你好6啊
 *
 * @param {string} str 需要校验的str信息
 */
export function validChineseNumbers (str) {
  const reg = /^((?:[\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0])|(\d))+$/
  return reg.test(str)
}

/**
 * 不能包含字母，例如: 你好6啊, @¥()！
 *
 * @param {string} str 需要校验的str信息
 */
export function validNoLetters (str) {
  const reg = /^[^A-Za-z]*$/
  return reg.test(str)
}

/**
 * java包名，例如: com.bbb.name
 *
 * @param {string} packageName 需要校验的str信息
 */
export function validPackageName (packageName) {
  const reg = /^([a-zA-Z_][a-zA-Z0-9_]*)+([.][a-zA-Z_][a-zA-Z0-9_]*)+$/
  return reg.test(packageName)
}

/**
 * mac地址，例如: 38:f9:d3:4b:f5:51, 00-0C-29-CA-E4-66
 *
 * @param {string} mac 需要校验的mac信息
 */
export function validMac (mac) {
  const reg = /^((([a-f0-9]{2}:){5})|(([a-f0-9]{2}-){5}))[a-f0-9]{2}$/i
  return reg.test(mac)
}

/**
 * 匹配连续重复的字符，例如: 我我我, 112233, 11234
 *
 * @param {string} str 需要校验的str信息
 */
export function validTandemDuplication (str) {
  const reg = /(.)\1+/
  return reg.test(str)
}

/**
 * 数字和英文字母组成，并且同时含有数字和英文字母，例如: 我a我1我, a对1
 *
 * @param {string} str 需要校验的str信息
 */
export function validNumbersEnglish (str) {
  const reg = /^(?=.*[a-zA-Z])(?=.*\d).+$/
  return reg.test(str)
}
