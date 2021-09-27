import axios from 'axios'
import {Message, Loading} from 'element-ui'
import cookies from 'js-cookie'

// 定义loading变量
let loading

// 创建一个axios实例
const service = axios.create({
  // url = base url + request url
  baseURL: process.env.BASE_API,
  // 在跨域请求时发送cookie
  withCredentials: true,
  // 请求超时5分钟(单位:毫秒)
  timeout: 300000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    if (config['loading'] === undefined || config['loading'] === true) {
      loading = Loading.service({
        lock: true,
        text: '玩命加载中……',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
    return config
  },
  // 请求错误怎么办
  error => {
    if (loading !== undefined) {
      loading.close()
    }
    // 调试命令
    console.log(error)
    Message({
      message: '加载超时',
      showClose: true,
      type: 'error',
      duration: 3 * 1000
    })
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (loading !== undefined) {
      loading.close()
    }
    switch (res.code) {
      case '1':
        // 接口参数校验失败时
        Message({
          message: res.message || 'error',
          showClose: true,
          type: 'error',
          duration: 3 * 1000
        })
        return Promise.reject(new Error(res || 'Error'))
      case '400':
        // 接口内容校验失败时
        Message({
          message: res.message || 'error',
          showClose: true,
          type: 'error',
          duration: 3 * 1000
        })
        return Promise.reject(new Error(res || 'Error'))
      case '401':
        // 没有权限时
        Message({
          message: res.message || 'error',
          showClose: true,
          type: 'error',
          duration: 3 * 1000
        })
        return Promise.reject(new Error(res || 'Error'))
      case '403':
        // 登录过期时
        Message({
          message: res.message || 'error',
          showClose: true,
          type: 'error',
          duration: 3 * 1000
        })
        cookies.remove('userInfo')
        location.reload()
        return Promise.reject(new Error(res || 'Error'))
      case '405':
        // 接口请求方法类型与接收类型不一致时
        Message({
          message: res.message || 'error',
          showClose: true,
          type: 'error',
          duration: 3 * 1000
        })
        return Promise.reject(new Error(res || 'Error'))
      case '406':
        // 接口参数类型异常时
        Message({
          message: res.message || 'error',
          showClose: true,
          type: 'error',
          duration: 3 * 1000
        })
        return Promise.reject(new Error(res || 'Error'))
      case '416':
        // 接口参数类型与接收类型不匹配时
        Message({
          message: res.message || 'error',
          showClose: true,
          type: 'error',
          duration: 3 * 1000
        })
        return Promise.reject(new Error(res || 'Error'))
      case '500':
        // 服务器错误
        Message({
          message: '请求异常',
          showClose: true,
          type: 'error',
          duration: 3 * 1000
        })
        console.info('服务器错误:', res)
        return Promise.reject(new Error(res || 'Error'))
      default:
        return res
    }
  },
  error => {
    if (loading !== undefined) {
      loading.close()
    }
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      showClose: true,
      type: 'error',
      duration: 3 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
