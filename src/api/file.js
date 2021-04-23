import request from '@/utils/request'
import qs from 'qs'

/**
 * 新建文件夹
 *
 * @param {object} params 包含创建文件夹时的数据模型
 */
export function insertFileFolder (params) {
  return request({
    url: '/disk-file/insert-file-folder',
    method: 'post',
    data: params
  })
}

/**
 * 批量删除用户文件模块
 *
 * @param {object} params 文件id
 */
export function deleteFile (params) {
  return request({
    url: '/disk-file/delete-batch-file',
    method: 'post',
    data: params
  })
}

/**
 * 重命名文件
 *
 * @param {*} params 重命名文件需要的参数
 */
export function renameFile (params) {
  return request({
    url: '/disk-file/rename-file',
    method: 'post',
    data: qs.stringify(params)
  })
}

/**
 * 批量复制用户文件模块
 *
 * @param {*} params 复制文件需要的参数
 */
export function copyFile (params) {
  return request({
    url: '/disk-file/copy-batch-file',
    method: 'post',
    data: params
  })
}

/**
 * 批量移动用户文件模块
 *
 * @param {*} params 移动文件需要的参数
 */
export function moveFile (params) {
  return request({
    url: '/disk-file/move-batch-file',
    method: 'post',
    data: params
  })
}

/**
 * 文件搜索、检索文件、获取文件列表
 *
 * @param {object} params 包含需要搜索的文件参数信息
 */
export function search (params) {
  params.pageSize = 100
  return request({
    url: '/disk-file/search',
    method: 'get',
    params
  })
}
