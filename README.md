# 兜兜网盘

> 兜兜网盘 ，一个 vue 网盘项目

基于 [vue](https://github.com/vuejs/vue) 和 [element-ui](https://github.com/ElemeFE/element) 实现的个人文件存储项目，文件存储的底层基于七牛云实现。

##

网盘支持图片、视频的在线预览(视频支持记住播放进度)

支持文件分享、浏览器无限速下载等特性

可以针对不同的文件类型展示不同的文件图标

文件上传部分采用 el-upload 结合 七牛云 的方式实现.

支持多文件、拖拽、图片的剪贴板 上传

单文件最大支持20GB的上传

支持 大文件分片、秒传、断点续传

##

* [在线预览](https://cloud.novelweb.cn/#/login)
* [组件]()
  * [fileCard]() 文件复制、移动、保存时的弹窗组件。
  * [SvgIcon]() 一个可以灵活的使用svg的组件。
  * [upload]() 一个文件支持批量上传的面板组件。

#### 登录:
![login](https://images.gitee.com/uploads/images/2021/0310/105344_a5d31fc9_1882312.png "login")

#### 文件列表页面:
![文件列表页面](https://images.gitee.com/uploads/images/2021/0324/182730_dca68773_1882312.png "文件列表页面")

#### 多文件上传页面:
![多文件上传页面](https://images.gitee.com/uploads/images/2021/0324/141357_78203cfd_1882312.png "多文件上传页面")

#### 文件复制、移动时的弹窗:
![文件复制、移动时弹窗](https://images.gitee.com/uploads/images/2021/0428/165548_5cbe695a_1882312.png "文件复制、移动时弹窗")

#### 文件分享弹窗
![文件分享弹窗](https://images.gitee.com/uploads/images/2021/0324/141503_7d5fa86d_1882312.png "文件分享弹窗")

#### 文件分享页面
![文件分享页面](https://images.gitee.com/uploads/images/2021/0531/191134_5a7452d5_1882312.png "文件分享页面")

#### 资源包支付页面(动态获取支付二维码)
![支付页](https://images.gitee.com/uploads/images/2021/0531/183322_2f0bade4_1882312.png "支付页")

#### 个人中心页面
![个人中心页面](https://images.gitee.com/uploads/images/2021/0531/182653_73280269_1882312.png "个人中心页面")

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:9527
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
