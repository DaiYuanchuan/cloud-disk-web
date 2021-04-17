import request from '@/utils/request'

/**
 * 新增用户反馈记录
 *
 * @param {Object} params 包含用户 联系方式、反馈内容
 */
export function insertFeedback (params) {
  return request({
    url: '/disk-feedback/insert',
    method: 'post',
    data: params
  })
}
