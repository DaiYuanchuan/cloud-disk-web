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
 * 删除文件
 *
 * @param {long} id 文件id
 */
export function deleteFile (id) {
  return request({
    url: '/disk-file/delete-file',
    method: 'post',
    data: qs.stringify(id)
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

/**
 * 文件下载
 *
 * @param {object} params 包含下载参数信息
 */
export function download (params) {
  return request({
    url: '/disk-file/resource',
    method: 'get',
    params
  })
}
