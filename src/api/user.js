import request from '@/utils/request'

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
