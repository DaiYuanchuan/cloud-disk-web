<template>
  <div class="detail">
    <!-- 卡片 -->
    <div
      v-if="card.isShow"
      id="content"
    >
      <section
        class="bd bdy b-rlv clearfix"
        id="mainContent"
      >
        <section
          class="main clearfix b-bdr-slv"
          style="background:#f9f9f9"
        >

          <div class="share-error-left">
            <div id="share_nofound_des">
              <div class="error-img">
                <img src="/static/img/errorImg_492ea64.png">
              </div>
              {{card.cardMessage}}
            </div>
            <div
              class="platform-tips"
              node-id="web-cancelleddoc"
              style="margin:0;width:750px;overflow:hidden"
              id="platform-non-found"
            >
            </div>
            <section
              class="tail"
              id="tail"
            >
            </section>
          </div>
        </section>
      </section>
    </div>

    <!-- 提取码输入表单 -->
    <div
      v-if="form.isShow"
      id="code"
    >
      <img
        src="/static/svg/logo.svg"
        class="logo"
        alt="File Browser"
      />
      <h1>文档管理器</h1>
      <el-form
        ref="codeForm"
        :model="form"
        :rules="rules"
        class="code-box"
      >

        <el-form-item>
          <div class="CMxQsC">
            <div class="avatar">
              <div class="photo-frame theme-share-head">
                <span class="radius-3">
                  <img
                    :alt="form.userName"
                    :src="form.userAvatar"
                    width="44"
                  ></span>
              </div>
            </div>
            <div class="verify-property">
              <div class="verify-user theme-share-text">
                <div class="username theme-share-name">{{form.userName}}</div>
                给您加密分享了文件
              </div>
            </div>
            <div class="verify-btn">
            </div>
            <div class="cb"></div>
          </div>
        </el-form-item>

        <dt>请输入提取码：</dt>
        <el-form-item prop="code">
          <el-input
            type="text"
            placeholder="提取码"
            v-model="form.code"
            maxlength="4"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="code-button"
            v-on:click="extractingFiles('codeForm')"
          > 提取文件 </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 文件列表页面 -->
    <div
      v-if="file.isShow"
      id="file"
      class="home"
    >

      <div id="mbx">

        <el-breadcrumb
          class="textmbx"
          separator-class="el-icon-arrow-right"
        >
          <el-breadcrumb-item
            v-for="(item, index) in file.breadcrumbs"
            :key="item.fileId"
            @click.native="previous(item, index)"
          >{{item.fileName}}</el-breadcrumb-item>
        </el-breadcrumb>

      </div>

      <div class="topsa">
        <p>
          文件
        </p>
        <p>
          时间
        </p>
        <p>
          大小
        </p>

      </div>

      <div
        class="grid-content bg-purple-dark item"
        v-for="item in file.fileInfo"
        :key="item.fileId"
        @dblclick="nextLevel(item)"
        @click="choose($event)"
        data-selected="false"
        :fileid="item.fileId"
        :name="item.fileName"
      >

        <img
          v-if="item.fileFolder"
          src="/static/img/folder.png"
          alt=""
        >
        <img
          v-else
          src="/static/img/file.png"
          alt=""
        >
        <p>{{item.fileName}}</p>
        <p>{{item.createTime}}</p>
        <p>{{item.fileFolder ? '-' : storageUnitConversion(item.fileSize)}}</p>
      </div>

      <div>

        <!-- 显示图片 -->
        <el-image-viewer
          v-show="file.imageUrl !== ''"
          :on-close="closeViewer"
          :url-list="[file.imageUrl]"
        />

      </div>

    </div>

    <!-- 播放视频 -->
    <el-dialog
      :center="true"
      :roundButton="true"
      :before-close="beforeClose"
      :visible.sync="file.dialogVideo"
    >
      <div
        slot="footer"
        id="dplayer"
        ref="dplayer"
      ></div>
    </el-dialog>

  </div>
</template>

<script>
import { shareDetail } from '@/api/share'
import { search, download } from '@/api/file'
import { storageUnitConversion } from '@/utils/utils'
import DPlayer from 'dplayer'
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'

export default {
  name: 'share-detail',
  components: {
    ElImageViewer
  },
  data () {
    // 验证码长度校验
    const validateSecurityCode = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error('请输入提取码'))
      } else if (value.length === 4) {
        callback()
      } else {
        callback(new Error('提取码错误'))
      }
    }
    return {
      card: {
        // 卡片是否展示
        isShow: false,
        // 卡片面板消息
        cardMessage: ''
      },
      form: {
        // 表单是否展示
        isShow: false,
        // 提取码
        code: '',
        userAvatar: '',
        userName: ''
      },
      // 表单验证，需要在 el-form-item 元素中增加 prop 属性
      rules: {
        code: [{ required: true, trigger: 'blur', validator: validateSecurityCode }]
      },
      file: {
        // 文件列表是否展示
        isShow: false,
        // 文件列表
        fileInfo: [],
        // 路径信息的面包屑导航
        breadcrumbs: [{
          fileName: '/',
          fileId: 0
        }],
        // 是否显示播放视频的 dialog
        dialogVideo: false,
        // 图片地址
        imageUrl: '',
        // 视频插件对象
        player: null
      }
    }
  },
  // 钩子函数：页面加载完成后执行
  mounted: function () {
    this.file.player = new DPlayer({
      container: document.getElementById('dplayer'),
      volume: 1,
      playbackSpeed: [0.5, 1, 1.25, 1.5, 2, 2.5, 3, 4],
      contextmenu: [],
      video: {
        url: ''
      }
    })
    this.detail()
  },
  watch: {
    $route: {
      handler () {
        this.card.cardMessage = ''
        this.form.code = ''
        // 监听param参数变化
        this.detail()
      },
      deep: true
    }
  },
  methods: {
    /**
     * 提取文件
     */
    extractingFiles (formName) {
      // 为表单绑定验证功能
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.detail()
        }
      })
    },
    /**
     * 点击执行单选事件
     */
    click: function (event) {
      for (let item of document.getElementsByClassName('item')) {
        if (item !== event.currentTarget) {
          item.dataset.selected = 'false'
        }
      }
      if (event.currentTarget.dataset.selected === 'false') {
        this.$emit('getOperation', true)
        this.$emit('getMultiSelect', true)
        event.currentTarget.dataset.selected = 'true'
      } else {
        this.$emit('getOperation', false)
        this.$emit('getMultiSelect', false)
        event.currentTarget.dataset.selected = 'false'
      }
    },
    /**
     * ctrl 执行多选事件
     */
    ctrl: function (event) {
      // 如果点击的同时 按下了 ctrl
      if (!event.ctrlKey) {
        for (let item of document.getElementsByClassName('item')) {
          if (item !== event.currentTarget) {
            item.dataset.selected = 'false'
          }
        }
      }
      if (event.currentTarget.dataset.selected === 'false') {
        event.currentTarget.dataset.selected = 'true'
      } else {
        event.currentTarget.dataset.selected = 'false'
      }

      // 获取所有已经点击的值
      let size = 0
      for (let item of document.getElementsByClassName('item')) {
        if (item.dataset.selected === 'true') {
          size++
        }
      }
      this.$emit('getMultiSelect', size === 1)
      this.$emit('getOperation', size > 0)
    },
    /**
     * shift 执行多选事件
     */
    shift: function (event) {
      // 获取所有已经点击的值
      let size = 0
      let arr = []
      for (let item of document.getElementsByClassName('item')) {
        arr.push(item)
        if (item.dataset.selected === 'true') {
          size++
        }
      }
      if (size > 1) {
        this.click(event)
        return
      }
      // 起始值
      let startIdx = 0
      // 结束值
      let endIdx = 0
      arr.forEach((item, index) => {
        if (item.dataset.selected === 'true') {
          startIdx = index
        }
        if (item === event.currentTarget) {
          endIdx = index
        }
      })
      // 用户可能反向选取，所以要取绝对值
      const sum = Math.abs(startIdx - endIdx) + 1
      // 获取起点和终点较小的值
      const min = Math.min(startIdx, endIdx)
      this.$emit('getMultiSelect', sum === 1)
      let i = 0
      while (i < sum) {
        const index = min + i
        document.getElementsByClassName('item')[index].dataset.selected = 'true'
        i++
      }
    },
    /**
     * 点击选中事件
     */
    choose: function (event) {
      if (event.ctrlKey) {
        this.ctrl(event)
        return
      }

      if (event.shiftKey) {
        this.shift(event)
        return
      }

      this.click(event)
    },
    /**
     * 存储单元转换
     */
    storageUnitConversion: function (bytes) {
      return storageUnitConversion(bytes)
    },
    /**
     * 上一级
     */
    previous: function (item, idx) {
      this.page = 1
      // 文件夹拥有下一级
      search({
        page: this.page,
        fileParentId: item.fileId
      }).then((response) => {
        this.diskFile = response.data.diskFile
        let breadcrumbs = []
        this.breadcrumbs.forEach(function (item, index) {
          if (index <= idx) {
            breadcrumbs.push(item)
          }
        })
        this.breadcrumbs = breadcrumbs
        // 传给父组件的值
        this.$emit('getBreadcrumbs', breadcrumbs)
        this.$emit('getCurrentFile', response.data.diskFile)
        this.$emit('getOperation', false)
        this.$emit('getMultiSelect', false)
        this.documentRetrieval = false
      }).catch((err) => {
        console.log(err)
      })
    },
    /**
     * 下一级
     */
    nextLevel: function (item) {
      console.log(item)
      // 判断当前点击的是否为文件夹
      if (item.fileFolder === true) {
        // 设置当前页码为1
        this.page = 1
        // 文件夹拥有下一级
        search({
          page: this.page,
          fileParentId: item.fileId
        }).then((response) => {
          // 增加面包屑导航数据
          this.breadcrumbs.push({
            fileId: item.fileId,
            fileName: item.fileName
          })
          this.diskFile = response.data.diskFile
          this.documentRetrieval = response.data.diskFile.length <= 0
          // 传给父组件的值
          this.$emit('getBreadcrumbs', this.breadcrumbs)
          this.$emit('getCurrentFile', response.data.diskFile)
          this.$emit('getOperation', false)
          this.$emit('getMultiSelect', false)
        }).catch((err) => {
          console.log(err)
        })
      } else {
        console.log('当前点击的是文件')
        console.log(item.fileMimeType)
        download({
          key: item.fileKey,
          time: 3600
        }).then((res) => {
          if (item.fileMimeType.indexOf('image') !== -1 && item.fileMimeType !== 'application/x-iso9660-image') {
            this.file.imageUrl = res.data
            return
          }
          if (item.fileMimeType.indexOf('video') !== -1) {
            console.log('点击的是视频')
            this.file.dialogVideo = true
            this.file.player.switchVideo({
              url: res.data
            })
            this.file.player.play()
            return
          }
          // 如果当前文件的属性是图片
          this.download(res.data, item.fileName)
        }).catch((err) => {
          console.log(err)
        })
      }
    },
    /**
     * 大图预览关闭事件回掉
     */
    closeViewer: function () {
      this.file.imageUrl = ''
    },
    // 下载文件
    download (url, name) {
      let link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', name)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    },
    /**
     * Dialog 关闭前的回调函数
     */
    beforeClose (done) {
      // 关闭播放器
      this.file.dialogVideo = false
      // 暂停视频播放
      this.file.player.pause()
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom () {
      let that = this
      let page = that.page + 1
      if (!that.documentRetrieval) {
        // 根据下标获取数据
        let breadcrumbs = this.breadcrumbs[this.breadcrumbs.length - 1]
        // 文件检索 获取用户根目录文件
        search({
          page: page,
          fileParentId: breadcrumbs.fileId
        }).then(data => {
          // 如果数据不为空
          if (data.data.diskFile.length > 0) {
            that.diskFile = that.diskFile.concat(data.data.diskFile)
            that.page = page
            that.documentRetrieval = false
            this.$emit('getCurrentFile', that.diskFile)
            console.log(data.data)
          } else {
            that.documentRetrieval = true
          }
        }).catch(e => {
          console.log(e)
        })
      }
    },
    /**
     * 获取分享详情
     */
    detail () {
      shareDetail({
        shareShort: this.$route.params.short,
        code: this.form.code
      }).then((response) => {
        if (response.code === '404' || response.code === '412') {
          this.card.isShow = true
          this.form.isShow = false
          this.file.isShow = false
          this.card.cardMessage = response.message
        } else if (response.code === '428' || response.code === '499') {
          this.card.isShow = false
          this.form.isShow = true
          this.file.isShow = false
          this.form.userName = response.data.userInfo.userName
          this.form.userAvatar = response.data.userInfo.userAvatar
          if (response.code === '499') {
            this.$message({
              message: response.message || 'error',
              showClose: true,
              type: 'error',
              duration: 3 * 1000
            })
          }
        } else {
          this.card.isShow = false
          this.form.isShow = false
          this.file.isShow = true
          this.file.fileInfo = response.data.fileInfo
        }
      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#content {
  position: relative;
  padding-top: 66px;
  height: 100%;
  box-sizing: border-box;
}

#mainContent {
  margin: 0 auto;
  width: 980px;
}

.b-rlv {
  position: relative;
  z-index: 1;
}

.clearfix {
  zoom: 1;
}

.main {
  background: #fff !important;
  border: 1px solid #c1d5f0;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.bdy {
  padding: 10px 20px 0;
}

#share_nofound_des {
  color: #424e67;
  text-align: center;
  padding: 40px 0;
  font-weight: 200;
  font-size: 14px;
}

#share_nofound_des .error-img {
  margin-bottom: 15px;
}

#share_nofound_des .error-img img {
  width: 74px;
  height: 70px;
}

.platform-tips {
  min-height: 120px;
}

.code-box {
  border: 1px solid #dcdfe6;
  width: 350px;
  margin: 45px auto;
  padding: 35px 35px 15px 35px;
  border-radius: 5px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  box-shadow: 0 0 25px #909399;
}

.code-title {
  text-align: center;
  margin: 0 auto 40px auto;
  color: #303133;
}

#code h1 {
  text-align: center;
  font-size: 2.5em;
  margin: 0.4em 0 0.67em;
}

.code-button {
  width: 100%;
}

.logo {
  width: 4em;
  height: 4em;
  margin: 0 auto;
  display: block;
  margin-top: 6vh;
  max-width: 100%;
  border-style: none;
}

dt {
  padding: 0 0 5px;
  margin: 20px 0 10px;
  color: #666;
  font-weight: 500;
}

.CMxQsC {
  background: url('https://pan.baidu.com/sns/box-static/disk-share/widget/pageModule/init/image/share_tit_bg_5855301.png?t=1608023046263')
    no-repeat;
  background-size: 100% 100%;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.avatar {
  padding: 15px 10px 15px 25px;
  float: left;
}

.photo-frame,
.photo-frame span {
  width: 44px;
  height: 44px;
  overflow: hidden;
  border-radius: 60px;
}

.photo-frame {
  padding: 3px;
  background: #9adaf2;
}

.photo-frame img {
  width: 100%;
  vertical-align: middle;
}

.verify-property {
  width: 275px;
  color: #fff;
  margin: 10px 0;
  overflow: hidden;
}

.verify-property .verify-user {
  height: 30px;
  line-height: 30px;
  overflow: hidden;
}

.verify-property .username {
  display: inline-block;
  font-size: 16px;
  font-family: PingFangSC-Semibold;
}

.verify-user-avatar {
  display: inline-block;
  vertical-align: middle;
}

.verify-property .verify-user {
  height: 30px;
  line-height: 30px;
  overflow: hidden;
}

.item[data-selected='true'] {
  background-color: #2196f3;
  color: #ffffff;
}

.item {
  text-align: left;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  line-height: 11px;
  padding: 10px;
  position: relative;
  overflow: hidden;
  cursor: default;
}
.item img {
  position: absolute;
  top: 23px;
  width: 25px;
  left: 15px;
}
#mbx {
  width: 100%;
  height: 55px;
  line-height: 10px;
  padding: 0px 0px 0px 10px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.topsa {
  width: 100%;
  height: 40px;
  line-height: 10px;
  margin: 0px 0px 10px 0px;
}
.topsa p:nth-of-type(1) {
  width: 42%;
  text-align: left;
  padding: 0px 0px 0px 15px;
  float: left;
}
.topsa p {
  width: 25%;
  float: right;
  text-align: center;
}
.textmbx {
  float: left;
  font-size: 17px;
  line-height: 45px;
  padding: 0px 5px;
}
.item p:nth-of-type(1) {
  width: 42%;
  text-align: left;
  padding: 0px 0px 0px 15px;
  float: left;
  position: relative;
  left: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item p {
  line-height: 18px;
  width: 25%;
  float: right;
  text-align: center;
}
.home {
  overflow-y: auto;
  height: 88vh;
  /* height:calc(88vh - 20px); */
  overflow-x: hidden;
}

.home::-webkit-scrollbar {
  width: 5px;
}

.home::-webkit-scrollbar-track {
  background: #999;
  border-radius: 2px;
}

.home::-webkit-scrollbar-thumb {
  background: #2196f3;
  border-radius: 5px;
}

.home::-webkit-scrollbar-thumb:hover {
  background: #2196f3;
}

.home::-webkit-scrollbar-corner {
  background: #2196f3;
}
html::-webkit-scrollbar {
  width: 5px;
}
body::-webkit-scrollbar {
  width: 5px;
}
.el-breadcrumb__separator {
  display: block;
  font-size: 24px;
}
#dplayer {
  top: -30px;
}
.el-dialog,
.el-pager li {
  background: none;
}
</style>
