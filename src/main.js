// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
import cookies from 'js-cookie'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import {asyncRoutes} from './router/routers'

import './icons' // icon

Vue.config.productionTip = false

// 进度条配置
NProgress.configure({showSpinner: false})

Vue.use(ElementUI)
Vue.use(VueAxios, axios)

const whiteList = ['/login', '/register', '/forgot-passwd']

// 校验是否登陆  只要路由跳转，刷新   进行加载
router.beforeEach((to, from, next) => {
  // 进度条开始
  NProgress.start()
  // 获取cookie中缓存的用户信息
  let token = cookies.get('userInfo')
  if (token === undefined) {
    // 未登录的情况下
    if (whiteList.indexOf(to.path) !== -1 || to.path.substr(0, 3) === '/s/') {
      next()
    } else {
      // 其他没有访问权限的页面被重定向到登录页面。
      next({path: '/login'})
      // 完成进度条
      NProgress.done()
    }
  } else {
    // 如果已登录，则重定向到主页
    if (to.path === '/login') {
      next({path: '/home'})
      // 完成进度条
      NProgress.done()
    } else {
      next()
    }
  }
})

router.afterEach(() => {
  // 完成进度条
  NProgress.done()
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
  // 创建时触发
  created: function () {
    // 获取cookie中缓存的用户信息
    let token = cookies.get('userInfo')
    if (token !== undefined) {
      // 已登录的情况下 ，根据用户权限动态的加载路由
      // 所有未识别的路由 ，跳转404路由
      this.$router.addRoutes(asyncRoutes.concat([{
        path: '*',
        redirect: '/404'
      }]))
    }
  }
})
