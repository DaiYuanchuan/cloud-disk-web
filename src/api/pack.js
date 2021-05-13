import request from '@/utils/request'

/**
 * 查找网盘资源包配置
 *
 * @param {Object} params 包含分页信息
 */
export function resourcePackSearch (params) {
  return request({
    url: '/disk-resource-pack/search',
    method: 'get',
    params
  })
}

/**
 * 获取一个新的资源包支付token
 *
 * @param {Object} params 包含 资源包标识 、需要购买的数量 等
 */
export function resourcePackToken (params) {
  return request({
    url: '/disk-resource-pack/token',
    loading: false,
    method: 'get',
    params
  })
}

/**
 * 获取资源包token当前状态
 *
 * @param {String} token 需要查询的token字符串
 */
export function resourcePackTokenState (token) {
  return request({
    url: '/disk-resource-pack/token-state/' + token,
    loading: false,
    method: 'get'
  })
}
