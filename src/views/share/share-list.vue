<template>
  <div class="layout">
    <slot :root-list="rootList" :code="code" :share-expiration-time-format="shareExpirationTimeFormat"
          :share-create-time="shareCreateTime" :share-file-name="shareFileName">
      <el-container>
        <!-- main -->
        <el-main class="share-list-main">
          <div class="topBtn">
            <div class="leftTit">
              <h4>{{ shareFileName }}</h4>
              <p>
                <i class="icons">
                  <svg-icon icon-class="file-share-time"></svg-icon>
                </i>{{ shareCreateTime }}
                <span>有效期：{{ shareExpirationTimeFormat }}</span>
              </p>
            </div>
            <div class="">
              <el-button class="code-button" id="code-button" @click="saveToMine">
                <i class="icons">
                  <svg-icon icon-class="file-share-save"></svg-icon>
                </i>
                保存到我的
              </el-button>
              <el-button class="code-button fot-button" @click="saveToMine">
                <i class="material-icons">
                  <svg-icon icon-class="file-share-save"></svg-icon>
                </i>
              </el-button>

            </div>
          </div>
          <filePanel :breadcrumbs="breadcrumbs" :file-list="fileList"
                     @nextPage="nextPage" @doubleClick="doubleClick" @previous="previous"></filePanel>
        </el-main>
      </el-container>
    </slot>

    <!-- 文件 复制、移动 时选择目标文件夹的面板 -->
    <file-card v-if="fileCard.show" :card-title="fileCard.title" :card-breadcrumbs="fileCard.cardBreadcrumbs"
               @card-close="cardClose" @card-confirm="cardConfirm"
               @card-folder-previous="cardFolderPrevious" @card-folder-next="cardFolderNext"></file-card>

    <!-- 登录页的Dialog弹窗 -->
    <el-dialog :visible.sync="login.show"
               customClass="loginDialog" :before-close="closeLoginModel">
      <loginPanel :hopRouting="false" @loginSuccessfully="loginSuccessfully"></loginPanel>
    </el-dialog>

  </div>
</template>

<script>
import filePanel from '@/views/file/index'
import loginPanel from '@/views/login/index'
import {copyFile} from '@/api/file'
import {search} from '@/api/share'
import fileCard from '@/components/fileCard/fileCard'
import cookies from 'js-cookie'

export default {
  name: 'share-list',
  props: {
    // 分享的文件的根目录数据
    rootList: {
      type: Array,
      default () {
        return []
      }
    },
    code: {
      type: String,
      default () {
        return ''
      }
    },
    shareExpirationTimeFormat: {
      type: String,
      default () {
        return ''
      }
    },
    shareCreateTime: {
      type: String,
      default () {
        return ''
      }
    },
    shareFileName: {
      type: String,
      default () {
        return ''
      }
    }
  },
  components: {
    filePanel, fileCard, loginPanel
  },
  data () {
    return {
      // 路径信息的面包屑导航(数组中的第一位元素为主页)
      breadcrumbs: [{
        userFileName: '主页',
        userFileId: 0
      }],
      // 初始化的分页信息(默认从第一页开始请求页面文件列表数据)
      page: 1,
      // 页面上拉触底事件(如果页面上拉触底请求下一页的数据时 没有数据了 这里显示true 表示不请求数据)
      pageBottomEvent: false,
      // 当前页面的文件列表信息(记录着当前页面中所有的文件数据)
      fileList: [],
      // 文件 复制、移动 时选择的面板
      fileCard: {
        // 面板是否显示
        show: false,
        // 卡片抬头(复制、粘贴、保存..)
        title: '',
        // 面板内的文件夹路径信息面包屑导航(数组中的第一位元素为主页)
        cardBreadcrumbs: [{
          userFileName: '/',
          userFileId: 0
        }]
      },
      // 当前登录页弹窗model
      login: {
        // 是否显示(文件下载、转存时校验当前登录状态)
        show: false,
        // 弹窗model关闭后执行的方法名称
        method: '',
        // 弹窗model关闭后执行的方法所对应的参数
        parameter: ''
      }
    }
  },
  // 钩子函数：页面加载完成后执行
  mounted: function () {
    this.fileList = this.rootList
  },
  methods: {
    // ============================== 页面工具方法
    /**
     * 从服务器端获取文件列表信息
     * @param page 页码
     * @param userFileParentId 文件的上一级id
     * @param shareKey 分享的文件夹key值
     * @param resetData 是否重置文件列表数据
     * @param callback 回调函数
     */
    getFileListInfo: function (page, userFileParentId, shareKey, resetData, callback) {
      if (page === null || page === undefined) {
        // 默认第一页
        page = 1
      }

      // 获取面包屑最后一位元素
      let lastElement = this.breadcrumbs[this.breadcrumbs.length - 1]
      if (userFileParentId === null || userFileParentId === undefined) {
        // 默认从 路径信息的面包屑导航 数据中获取最后一位元素
        userFileParentId = lastElement.userFileId
      }

      if (shareKey === null || shareKey === undefined) {
        // 默认从 路径信息的面包屑导航 数据中获取最后一位元素
        shareKey = lastElement.shareKey
      }

      // 如果点击的是主页，不用请求 ，直接返回根目录 rootList (根目录、最后一位元素的fileId为0)
      if (userFileParentId === 0) {
        this.fileList = this.rootList
        if (callback !== undefined) {
          callback()
        }
      } else {
        search({
          code: this.code,
          page: page,
          userFileParentId: userFileParentId,
          shareShort: this.$route.params.short,
          shareKey: shareKey
        }).then((response) => {
          // 重置文件列表数据
          if (resetData !== undefined && resetData) {
            this.fileList = []
          }
          response.data['diskUserFile'].forEach(res => {
            res['select'] = false
            this.fileList.push(res)
          })
          // 判断是否进行下一次的分页请求
          if (response.data['diskUserFile'].length < 100 || response.data['toTal'] < 100 ||
            (response.data['diskUserFile'].length === 100 && response.data['toTal'] === 100)) {
            // 数组长度小于 pageSize 不进行下一次分页请求
            this.pageBottomEvent = true
          } else if (response.data['diskUserFile'].length === 100 && response.data['toTal'] > 100) {
            this.pageBottomEvent = false
          }
          if (callback !== undefined) {
            callback(response)
          }
        }).catch((err) => {
          console.log(err)
        })
      }
    },
    /**
     * 页面 面包屑点击事件(加载上一级)
     */
    previous: function (item) {
      // 判断点击的是否是当前的目录(面包屑的最后一个元素为当前元素)
      if (item.userFileId !== this.breadcrumbs[this.breadcrumbs.length - 1].userFileId) {
        this.page = 1
        this.getFileListInfo(this.page, item.userFileId, item.shareKey, true, response => {
          this.breadcrumbs = this.breadcrumbs.slice(0, this.breadcrumbs.findIndex(res => res.userFileId === item.userFileId) + 1)
        })
      }
    },
    /**
     * 页面 文件双击事件(只有文件被双击了才会触发)
     */
    doubleClick: function (item) {
      // 设置当前页码为1
      this.page = 1
      this.getFileListInfo(this.page, item.userFileId, item.shareKey, true, res => {
        // 增加面包屑导航数据
        this.breadcrumbs.push({
          userFileId: item.userFileId,
          userFileName: item.userFileName,
          shareKey: item.shareKey
        })
      })
    },
    /**
     * 加载下一页
     */
    nextPage: function () {
      if (!this.pageBottomEvent) {
        // 当前页码+1
        this.page += 1
        this.getFileListInfo(this.page)
      }
    },
    /**
     * 关闭文件 保存 时选择目标文件夹的面板
     */
    cardClose: function () {
      this.fileCard.title = ''
      this.fileCard.show = false
      document.body.setAttribute('style', 'margin: 0; background: #fafafa;')
    },
    /**
     * 保存 时选择目标文件夹面板中的确认事件
     * @param currentlySelectedValue 文件夹面板中选中的目标文件夹的文件id
     */
    cardConfirm: function (currentlySelectedValue) {
      // 获取所有当前选中的数据
      let selectData = this.fileList.filter(res => res.select)
      if (!selectData.length) {
        // 如果没有数据选中的 ，则默认为全部文件
        selectData = this.fileList
      }

      // 获取cookie中缓存的用户信息
      let token = cookies.get('userInfo')
      if (token === undefined) {
        // 如果在未登录的情况下使用，则打开登录页面弹窗
        this.login = {
          // 是否显示(文件下载、转存时校验当前登录状态)
          show: true,
          // 弹窗model关闭后执行的方法名称
          method: 'cardConfirm',
          // 弹窗model关闭后执行的方法所对应的参数
          parameter: currentlySelectedValue
        }
        return
      }

      let fileSize = 0
      let copyFileInfo = []
      selectData.forEach(res => {
        fileSize += res.ossFileSize
        copyFileInfo.push({
          fromFileId: res.userFileId,
          shareKey: res.shareKey
        })
      })

      let userInfo = JSON.parse(token)

      // 判断上传空间容量
      if (userInfo.userRemainingDiskCapacity <= 0 || userInfo.userRemainingDiskCapacity - fileSize < 0) {
        this.$message({
          showClose: true,
          message: '存储空间不足',
          type: 'error'
        })
        return
      }

      // 保存至我的文件夹
      copyFile({
        code: this.code,
        shareShort: this.$route.params.short,
        targetFileId: currentlySelectedValue,
        copyFileInfo: copyFileInfo
      }).then((response) => {
        console.log(response)
        // 复制成功的提示框
        this.$message({
          showClose: true,
          type: 'success',
          message: '保存成功!'
        })
      }).catch((err) => {
        console.log(err)
      })
      this.cardClose()
    },
    /**
     * 复制、移动 时选择目标文件夹面板中返回上一级事件
     * @param userFileParentId 上一级文件夹id
     */
    cardFolderPrevious: function (userFileParentId) {
      this.fileCard.cardBreadcrumbs = this.fileCard.cardBreadcrumbs.slice(0, this.fileCard.cardBreadcrumbs
        .findIndex(res => res.userFileId === userFileParentId) + 1)
    },
    /**
     * 复制、移动 时选择目标文件夹面板中加载下一级事件
     * @param item 加载完成后返回的面包屑对象
     */
    cardFolderNext: function (item) {
      // 增加面包屑导航数据
      this.fileCard.cardBreadcrumbs.push({
        userFileId: item.userFileId,
        userFileName: item.userFileName
      })
    },
    /**
     * 保存到我的网盘
     */
    saveToMine: function () {
      // 获取cookie中缓存的用户信息
      let token = cookies.get('userInfo')
      if (token === undefined) {
        // 如果在未登录的情况下使用，则打开登录页面弹窗
        this.login = {
          // 是否显示(文件下载、转存时校验当前登录状态)
          show: true,
          // 弹窗model关闭后执行的方法名称
          method: 'saveToMine',
          // 弹窗model关闭后执行的方法所对应的参数
          parameter: ''
        }
        return
      }

      // 打开文件夹面板时 取消 body 的滚动条
      document.body.setAttribute('style', 'margin: 0; background: #fafafa; overflow: hidden;')
      this.fileCard.title = '保存'
      this.fileCard.show = true
      // 重置卡片面包屑数据
      this.fileCard.cardBreadcrumbs = [{
        userFileName: '/',
        userFileId: 0
      }]
    },
    /**
     * 关闭登录页面model
     * @param done 是否完成
     */
    closeLoginModel: function (done) {
      if (done !== false) {
        this.login = {
          // 是否显示(文件下载、转存时校验当前登录状态)
          show: false,
          // 弹窗model关闭后执行的方法名称
          method: '',
          // 弹窗model关闭后执行的方法所对应的参数
          parameter: ''
        }
      }
    },
    /**
     * 登录model登录成功后的跳转
     */
    loginSuccessfully: function () {
      this.login.show = false
      this[this.login.method](this.login.parameter)
      this.login = {
        show: false,
        method: '',
        parameter: ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.topBtn {
  height: 100px;
  position: relative;
  width: 100%;
  border-bottom: 1px solid #f6f6f6;
}

.share-list-main {
  margin-top: 0;
}

.el-button {
  position: absolute;
  bottom: 28px;
  right: 0;
}

.fot-button {
  position: fixed;
  bottom: 26px;
  right: 10px;
  z-index: 10;
  cursor: none;
}

.leftTit h4 {
  font-size: 18px;
  font-weight: 800;
  position: absolute;
  top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 20em;
  white-space: nowrap;
}

.leftTit p {
  position: absolute;
  top: 50px;
  font-size: 13px;
  color: #888;
}

.leftTit i {
  margin-right: 6px;
}

.leftTit span {
  margin-left: 10px;
}

.layout {
  font-family: Roboto, sans-serif;
  background-color: #fafafa;
  color: #333;
  margin: 0;
  display: block;
}

.el-aside {
  width: 16em;
  position: fixed;
  top: 4em;
  left: 0;
}

main {
  min-height: 1em;
  width: calc(100% - 19em);
}

main {
  display: block;
}

* {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.fot-button {
  display: none;
}

/deep/ .loginDialog {
  max-width: 600px;
  margin-top: 10%;
}

/deep/ .loginDialog > .el-dialog__header {
  padding: 0;
}

/deep/ .loginDialog > .el-dialog__body {
  padding: 1px;
}

/deep/ .loginDialog > .el-dialog__body > div > .login-box {
  border: 0;
  padding: 0;
  box-shadow: none;
  width: 86%;
}

@media (max-width: 780px) {
  /deep/ .loginDialog > .el-dialog__body > #login {
    top: 5%;
  }
}

@media screen and (max-width: 480px) {
  #code-button {
    display: none;
  }
  .fot-button {
    padding: 12px;
    border-radius: 50%;
    display: block;
  }
  .leftTit h4 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 12em;
  }
}

@media (max-width: 450px) {
  /deep/ .loginDialog > .el-dialog__body > #login {
    width: 80%;
    height: 60%;
    left: 10%;
    top: 10%;
  }
  /deep/ .loginDialog > .el-dialog__body > #login form {
    top: 42%;
    max-width: 16em;
  }
  /deep/ .el-dialog__headerbtn{
    z-index: 999;
    top: -32px;
    right: -55px;
  }
}

@media (max-width: 450px) and (min-height: 631px) {
  /deep/ .loginDialog > .el-dialog__body > #login form {
    top: 49%;
    max-width: 22em;
  }

  /deep/ .loginDialog > .el-dialog__body > #login {
    height: 66%;
    top: 9%;
  }
}

@media (max-width: 415px) {
  /deep/ .loginDialog > .el-dialog__body > #login {
    width: 80%;
    height: 60%;
    left: 10%;
    top: 10%;
  }

  /deep/ .loginDialog > .el-dialog__body > #login form {
    top: 45%;
    max-width: 21em;
  }

  /deep/ .el-dialog__headerbtn{
    z-index: 999;
    top: -32px;
    right: -55px;
  }
}

@media (max-width: 412px) {
  @media (min-height: 800px) {
    /deep/ .loginDialog > .el-dialog__body > #login form {
      top: 42%;
      max-width: 21em;
    }

    /deep/ .loginDialog > .el-dialog__body > #login {
      height: 54%;
    }
  }
}

@media (max-width: 380px) {
  /deep/ .loginDialog > .el-dialog__body > #login {
    width: 86%;
    height: 62%;
    left: 7%;
    top: 8%;
  }

  /deep/ .loginDialog > .el-dialog__body > #login form {
    top: 46%;
    max-width: 16em;
  }
}

@media (max-width: 376px) {
  /deep/ .loginDialog > .el-dialog__body > #login {
    width: 86%;
    height: 55%;
    left: 7%;
    top: 8%;
  }

  /deep/ .loginDialog > .el-dialog__body > #login form {
    top: 41%;
    max-width: 16em;
  }
}

@media (max-width: 376px) and (min-height: 631px) {
  /deep/ .loginDialog > .el-dialog__body > #login form {
    top: 46%;
    max-width: 19em;
  }

  /deep/ .loginDialog > .el-dialog__body > #login {
    height: 66%;
  }
}

@media (max-width: 376px) and (min-height: 811px) {
  /deep/ .loginDialog > .el-dialog__body > #login form {
    top: 40%;
    max-width: 19em;
  }

  /deep/ .loginDialog > .el-dialog__body > #login {
    height: 55%;
  }
}

@media (max-width: 361px) {
  /deep/ .loginDialog > .el-dialog__body > #login {
    width: 86%;
    height: 66%;
    left: 7%;
    top: 8%;
  }

  /deep/ .loginDialog > .el-dialog__body > #login form {
    top: 46%;
    max-width: 18em;
  }
}

@media (max-width: 330px) {
  /deep/ .loginDialog > .el-dialog__body > #login {
    width: 90%;
    height: 50%;
    left: 5%;
    top: 10%;
  }
  /deep/ .loginDialog > .el-dialog__body > #login form {
    top: 38%;
    max-width: 16em;
  }
  /deep/ .loginDialog > .el-dialog__body > #login img {
    margin-top: 3vh;
  }
}

@media (max-width: 320px) {
  /deep/ .loginDialog > .el-dialog__body > #login {
    width: 90%;
    height: 70%;
    left: 5%;
    top: 8%;
  }
  /deep/ .loginDialog > .el-dialog__body > #login form {
    top: 47%;
    max-width: 16em;
  }
  /deep/ .loginDialog > .el-dialog__body > #login img {
    margin-top: 3vh;
  }
}

@media (max-width: 320px) and (min-height: 650px) {
  /deep/ .loginDialog > .el-dialog__body > #login {
    width: 90%;
    height: 58%;
    left: 5%;
    top: 8%;
  }
  /deep/ .loginDialog > .el-dialog__body > #login form {
    top: 42%;
    max-width: 16em;
  }
  /deep/ .loginDialog > .el-dialog__body > #login img {
    margin-top: 3vh;
  }
}

</style>
