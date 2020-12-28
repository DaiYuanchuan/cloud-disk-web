import request from '@/utils/request'
import qs from 'qs'

/**
 * 用户密码登录
 *
 * @param {object} params 包含用户名密码的参数
 */
export function login (params) {
  return request({
    url: '/disk-user/cloud-disk-login',
    method: 'post',
    data: qs.stringify(params)
  })
}

/**
 * 用户退出登录
 */
export function logout () {
  return request({
    url: '/disk-user/logout',
    method: 'get'
  })
}

/**
 * 使用密钥登录
 *
 * @param {string} secretKey 用户密钥
 */
export function secretKeyLogin (secretKey) {
  return request({
    url: '/disk-user/secret-key/' + secretKey,
    method: 'get'
  })
}

/**
 * 发送邮箱验证码
 *
 * @param {string} email 用户邮箱
 * @param {boolean} exist 是否需要验证邮箱存在
 */
export function sendSecurityCode (email, exist) {
  return request({
    url: '/disk-user/send-security-code',
    method: 'get',
    params: {
      email: email,
      exist: exist
    }
  })
}

/**
 * 用户注册
 *
 * @param {string} params 包含用户注册信息的参数
 */
export function register (params) {
  return request({
    url: '/disk-user/register',
    method: 'post',
    data: params
  })
}

/**
 * 验证--邮箱验证码
 * @param {string} data 包含邮箱、验证码等参数
 */
export function verifySecurityCode (data) {
  return request({
    url: '/disk-user/verify-security-code',
    method: 'get',
    params: data
  })
}

/**
 * 重置用户密码
 *
 * @param {string} params 包含用户邮箱、验证码、密码等参数
 */
export function resetPassword (params) {
  return request({
    url: '/disk-user/reset-password',
    method: 'post',
    data: params
  })
}
