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
              {{ card.cardMessage }}
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
                <el-avatar :size="50" :src="form.userAvatar" @error="true" :alt="form.userName">
                  <img src="/static/img/default.png" :alt="form.userName"/>
                </el-avatar>
              </div>
            </div>
            <div class="verify-property">
              <div class="verify-user theme-share-text">
                <div class="username theme-share-name">{{ form.userName }}</div>
                <div style="margin-left: 5px;">给您分享了文件</div>
              </div>
            </div>
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
          > 提取文件
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 文件列表页面 -->
    <shareList v-if="file.isShow" :root-list="file.sharedRootList" :code="form.code"/>

  </div>
</template>

<script>
import {shareDetail} from '@/api/share'
import shareList from '@/views/share/share-list'
import cookies from 'js-cookie'

export default {
  name: 'share-detail',
  components: {
    shareList
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
        code: [{required: true, trigger: 'blur', validator: validateSecurityCode}]
      },
      file: {
        // 文件列表是否展示
        isShow: false,
        // 文件分享的根目录列表
        sharedRootList: []
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
     * 获取分享详情
     */
    detail () {
      // 从cookie中获取到分享的code
      let shortCode = cookies.get(`short:${this.$route.params.short}`)
      if (shortCode !== undefined) {
        this.form.code = shortCode
      }
      shareDetail({
        shareShort: this.$route.params.short,
        code: this.form.code
      }).then((response) => {
        if (response.code === '404' || response.code === '412') {
          this.card.isShow = true
          this.form.isShow = false
          this.file.isShow = false
          this.card.cardMessage = response.message
          if (shortCode !== undefined) {
            cookies.remove(`short:${this.$route.params.short}`)
          }
        } else if (response.code === '428' || response.code === '499') {
          this.card.isShow = false
          this.form.isShow = true
          this.file.isShow = false
          this.form.userName = response.data.userInfo.userName
          this.form.userAvatar = response.data.userInfo.userAvatar
          if (shortCode !== undefined) {
            cookies.remove(`short:${this.$route.params.short}`)
          }
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
          this.file.sharedRootList = []
          response.data['fileInfo'].forEach(res => {
            res['select'] = false
            this.file.sharedRootList.push(res)
          })
          if (shortCode === undefined) {
            // code添加到cookies中，并且设置 3 小时的有效时间
            cookies.set(`short:${this.$route.params.short}`, this.form.code, {
              expires: new Date(new Date().getTime() + 3 * 60 * 60 * 1000)
            })
          }
          this.file.isShow = true
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
  max-width: 980px;
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
  background: url('/static/img/share_tit_bg.png') no-repeat;
  background-size: 100% 100%;
  border-radius: 4px;
  height: 100px;
}

.avatar {
  width: 20%;
  float: left;
  height: 100px;
}

.verify-property {
  width: 79%;
  color: #fff;
  line-height: 100px;
  height: 100px;
  float: right;
}

.verify-property .username {
  font-size: 16px;
  font-family: PingFangSC-Semibold;
  max-width: 125px; // 文字容器宽度
  overflow: hidden; // 超出边框外隐藏
  text-overflow: ellipsis; // 属性规定当文本溢出包含元素时发生的事情。
  white-space: nowrap; // 规定段落中的文本不进行换行
}

.verify-user-avatar {
  display: inline-block;
  vertical-align: middle;
}

.verify-user div {
  float: left;
}

.photo-frame {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.detail {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

@media (max-width: 420px) {
  .code-box {
    width: 21em;
    padding: 17px 16px 0 17px;
  }

  .avatar {
    width: 24%;
  }

  .verify-property .username {
    max-width: 8em;
  }

  .verify-property {
    width: 76%;
  }
}

@media (max-width: 380px) {
  .code-box {
    width: 18em;
    padding: 17px 16px 0 17px;
  }

  .avatar {
    width: 22%;
  }

  .verify-property .username {
    max-width: 7em;
  }

  .verify-property {
    width: 78%;
  }
}

@media (max-width: 330px) {
  .code-box {
    width: 16em;
    padding: 17px 16px 0 17px;
  }

  .verify-property .username {
    max-width: 4em;
  }

  .avatar {
    width: 26%;
  }

  .verify-property {
    width: 72%;
  }
}
</style>
<style>
@media (max-width: 730px) {
  .el-message-box {
    width: 300px;
    word-wrap: break-word;
  }
}

@media (max-width: 376px) {
  .el-message {
    min-width: 340px;
  }
}

@media (max-width: 330px) {
  .el-message {
    min-width: 300px;
  }
}
</style>
