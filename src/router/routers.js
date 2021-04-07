import layout from '../layout/index.vue'

/**
 * 无权限，默认渲染的路由
 */
export const constantRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/register/index')
  },
  {
    path: '/forgot-passwd',
    name: 'forgot-passwd',
    component: () => import('@/views/forgot-password/index')
  },
  {
    path: '/s/:short',
    name: 'share-detail',
    component: () => import('@/views/share/share-detail')
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    redirect: '/login',
    name: '默认页跳转',
    meta: {
      title: '登陆',
      affix: true
    },
    component: () => import('@/views/login/index')
  }
]

/**
 * 需要根据用户角色动态加载的路由
 */
export const asyncRoutes = [
  {
    path: '/',
    component: layout,
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/file/index'),
        meta: {
          title: '文档管理器',
          icon: 'theme'
        }
      },
      {
        path: 'share-list',
        name: 'share-list',
        component: () => import('@/views/share/share-list'),
        meta: {
          title: '分享列表',
          icon: 'theme'
        }
      },
      {
        path: 'share-record',
        name: 'share-record',
        component: () => import('@/views/share/share-record'),
        meta: {
          title: '我的分享',
          icon: 'theme'
        }
      },
      {
        path: 'setting',
        name: 'setting',
        component: () => import('@/views/setting/setting'),
        meta: {
          title: '设置',
          icon: 'theme'
        }
      }
    ]
  },
  {
    path: '/upload',
    component: () => import('@/views/qiniu/upload'),
    hidden: true
  }
]

// 所有上面定义的路由都要写在下面的routers里
export let constRouters = [
  asyncRoutes,
  constantRoutes
]
