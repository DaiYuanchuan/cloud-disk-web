import request from '@/utils/request'

/**
 * 支付订单信息检索
 *
 * @param {Object} params 包含需要搜索的参数信息
 * @param {Boolean} loading 是否需要加载loading面板
 */
export function paymentOrderSearch (params, loading) {
  return request({
    url: '/payment-order/search',
    loading: loading,
    method: 'get',
    params
  })
}
