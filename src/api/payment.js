import request from '@/utils/request'

/**
 * 获取支付页地址，也是构建二维码的地址
 *
 * @param {string} token 需要构建的token
 * @returns {string} 返回构建支付扫码的地址
 */
export function paymentAddress (token) {
  return process.env.BASE_API + '/pay/redirection-payment/' + token
}

/**
 * 获取支付宝手机支付跳转链接
 * @param token 需要构建的token
 * @returns {string} 返回支付宝手机支付跳转链接
 */
export function alipayWap (token) {
  return request({
    url: '/pay/alipay-wap/' + token,
    method: 'get'
  })
}
