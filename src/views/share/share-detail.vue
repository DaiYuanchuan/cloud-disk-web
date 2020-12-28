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

    </div>

  </div>
</template>

<script>
import { shareDetail } from '@/api/share'

export default {
  name: 'share-detail',
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
        // 图片地址
        imageUrl: ''
      }
    }
  },
  // 钩子函数：页面加载完成后执行
  mounted: function () {
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
     * 存储单元转换
     */
    storageUnitConversion: function (bytes) {
      if (bytes === 0) return '0 B'
      let k = 1024
      let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      let i = Math.floor(Math.log(bytes) / Math.log(k))
      return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
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
