import request from '@/utils/request'
import qs from 'qs'

/**
 * 从缓存中获取当前登录的用户信息
 * @returns {*}
 */
export function getDiskUserToSession () {
  return request({
    url: '/disk-user/user-info',
    method: 'get'
  })
}

/**
 * 更新用户信息
 * @param {object} params 需要更新的用户信息的参数
 * @returns {*}
 */
export function updateUserInfo (params) {
  return request({
    url: '/disk-user/update-user',
    method: 'post',
    data: qs.stringify(params)
  })
}
