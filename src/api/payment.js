import request from '@/utils/request'

/**
 * 获取支付页地址，也是构建二维码的地址
 *
 * @param {string} token 需要构建的token
 * @returns {string} 返回构建支付扫码的地址
 */
export function paymentAddress (token) {
  // 由于配置了跨越，处在dev环境中时会被直接替换为 /api
  // dev环境中需要将其修改为具体的服务地址 https://cloudtest.novelweb.cn
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
