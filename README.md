# 兜兜网盘简介

> 兜兜网盘是一款速度快、不限速、浏览器下载、易于分享的个人网盘,兜兜网盘为您提供文件的网络存储和分享服务。速度快、不限速,支持手机端是我们的特点

兜兜网盘的前端是基于 [vue](https://github.com/vuejs/vue) 和 [element-ui](https://github.com/ElemeFE/element) 实现的，前端页面是开源的。

兜兜网盘支持图片、视频的在线预览(视频支持记住播放进度)，后期可加入更多文件格式的在线预览。

我们还支持文件夹分享、浏览器无限速下载、拖拽上传、分片上传、秒传、断点续传等等

我们的单文件最大支持20GB的上传

##

* [在线预览](https://cloud.novelweb.cn/#/login)
* [组件]()
  * [fileCard]() 文件复制、移动、保存时的弹窗组件。
  * [SvgIcon]() 一个可以灵活的使用svg的组件。
  * [upload]() 一个文件支持批量上传的面板组件。

## 开发环境说明
由于采用的是单点登录系统，故开发环境中暂未设置预览的用户名密码，需要注册后才能实现登录。

开发环境中注册的新用户 ，初始容量为10TB，初始流量为1TB。
<br/>开发环境中上传的文件会不定期进行清理，请留意。
<br/>开发环境中单文件最大支持500MB的上传

开发环境中的支付需要将文件src/api/payment.js#paymentAddress中的
process.env.BASE_API替换为具体的服务地址
https://cloudtest.api.novelweb.cn

开发环境中的支付支付使用的是支付宝的沙箱环境
![支付宝沙箱](https://qcloud-1256166828.cos.ap-shanghai.myqcloud.com/cloud/alipaydev.png "支付宝沙箱")
<br/>买家账号dbdiqn3780@sandbox.com
<br/>登录密码111111
<br/>支付密码111111

开发环境中需要修改上传的存储区域，由cnEast2更改为z0

## 页面预览

#### 登录:
![login](https://qcloud-1256166828.cos.ap-shanghai.myqcloud.com/cloud/login.png "login")

#### 注册:
![注册](https://qcloud-1256166828.cos.ap-shanghai.myqcloud.com/cloud/register.png "注册页")

#### 文件列表页面:
![文件列表页面](https://qcloud-1256166828.cos.ap-shanghai.myqcloud.com/cloud/filelist.png "文件列表页面")

#### 多文件上传页面:
<font size="3">dev环境上传请修改文件上传区域配置</font>
![多文件上传页面](https://qcloud-1256166828.cos.ap-shanghai.myqcloud.com/cloud/fileupload.png "多文件上传页面")

#### 文件复制、移动时的弹窗:
![文件复制、移动时弹窗](https://qcloud-1256166828.cos.ap-shanghai.myqcloud.com/cloud/filecopy.png "文件复制、移动时弹窗")

#### 文件分享弹窗
![文件分享弹窗](https://qcloud-1256166828.cos.ap-shanghai.myqcloud.com/cloud/filesharing.png "文件分享弹窗")

#### 文件分享页面
![文件分享页面](https://qcloud-1256166828.cos.ap-shanghai.myqcloud.com/cloud/filesharepage.png "文件分享页面")

#### 资源包支付页面(动态获取支付二维码)
![支付页](https://qcloud-1256166828.cos.ap-shanghai.myqcloud.com/cloud/pay.png "支付页")

#### 个人中心页面
![个人中心页面](https://qcloud-1256166828.cos.ap-shanghai.myqcloud.com/cloud/setting.png "个人中心页面")

#### 我的分享列表页面
![分享列表页](https://qcloud-1256166828.cos.ap-shanghai.myqcloud.com/cloud/filesharelist.png "分享列表页")

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:9527
npm run dev

# build for production with minification
npm run build
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
