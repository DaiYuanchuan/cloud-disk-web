import request from '@/utils/request'

/**
 * 批量取消分享链接
 *
 * @param {object} params 包含分享数据标识集合信息
 */
export function cancelShare (params) {
  return request({
    url: '/disk-share/cancel-share',
    method: 'post',
    data: params
  })
}

/**
 * 创建文件分享链接
 *
 * @param {object} params 包含文件标识列表、是否需要提取码、过期时间等参数信息
 */
export function createShare (params) {
  return request({
    url: '/disk-share/create-share',
    method: 'post',
    data: params
  })
}

/**
 * 我的分享记录列表
 *
 * @param {object} params 包含页码等参数
 * @param {Boolean} loading 是否需要加载loading面板
 */
export function share (params, loading) {
  return request({
    url: '/disk-share/search',
    loading: loading,
    method: 'get',
    params
  })
}

/**
 * 分享详情
 *
 * @param {object} params 包含分享短链、提取码等参数信息
 */
export function shareDetail (params) {
  return request({
    url: '/disk-share/share-detail',
    method: 'get',
    params
  })
}

/**
 * 获取分享的文件列表
 *
 * @param {object} params 包含需要搜索的文件参数信息
 */
export function search (params) {
  params.pageSize = 100
  return request({
    url: '/disk-share/share-file',
    method: 'get',
    params
  })
}
