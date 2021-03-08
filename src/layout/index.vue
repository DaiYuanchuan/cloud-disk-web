<template>
  <div class="home">
    <el-header>
      <div class="spanbutt">
        <!-- 上传 -->
        <el-upload
          class="upload"
          title="上传文件"
          ref="elementUpload"
          :multiple="true"
          :show-file-list="false"
          :auto-upload="true"
          :before-upload="beforeUpload"
          :http-request="uploadRequest"
          :on-progress="progressChange"
          :on-change="handleChange"
          action="https://upload.qiniup.com"
        >
          <button class="upload-cloud">
            <i class="el-icon-upload material-icons"></i>
          </button>
        </el-upload>

        <div>
          <!-- 删除 -->
          <button v-show="isOperation">
            <i
              class="el-icon-delete-solid"
              title="立即刪除"
              @click="del"
            ></i>
          </button>
          <!-- 编辑 -->
          <button v-show="isMultiSelect">
            <i
              title="编辑文件"
              @click="edit"
              class="el-icon-edit"
            ></i>
          </button>
        </div>

      </div>

    </el-header>
    <el-container>
      <el-aside
        width="400px;"
        style="border-right: solid 1px #e6e6e6;"
      >
        <el-menu
          default-active="2"
          class="el-menu-vertical-demo"
          style="border-right: none"
          router
        >

          <el-menu-item @click="myFile()">
            <i class="el-icon-folder"></i>
            <span slot="title">我的文件</span>
          </el-menu-item>
          <el-menu-item @click="insertFileFolder()">
            <i class="el-icon-folder-add"></i>
            <span slot="title">新建文件夹</span>
          </el-menu-item>
          <el-menu-item @click="logout()">
            <i class="el-icon-switch-button"></i>
            <span slot="title">退出登陆</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>

        <el-main>
          <router-view
            :file="file"
            :path="path"
            @getBreadcrumbs="breadcrumb"
            @getCurrentFile="currentFile"
            @getOperation="operation"
            @getMultiSelect="multiSelect"
          ></router-view>
        </el-main>
      </el-container>
    </el-container>
    <!-- 文件上传列队 -->
    <uploader
      ref="uploader"
      :file-list="fileList"
      :display-upload-panel="displayUploadPanel"
      @pause="pause"
      @resume="resume"
      @retry="retry"
      @remove="remove"
      @close="close"
    ></uploader>
  </div>
</template>

<script>
import { logout } from '@/api/login'
import { getToken, upload } from '@/api/qiniu'
import { search, insertFileFolder, deleteFile, renameFile } from '@/api/file'
import { resetRouter } from '@/router/index'
import cookies from 'js-cookie'
import uploader from '@/components/upload/uploader'
import { storageUnitConversion } from '@/utils/utils'

export default {
  name: 'home',
  data () {
    return {
      file: [],
      // 记录文件上传的列队
      fileList: [],
      // 是否显示当前文件上传面板
      displayUploadPanel: false,
      // 当前目录的文件列表信息
      current: [],
      path: [],
      breadcrumbs: [{
        fileName: '/',
        fileId: 0
      }],
      // 是否显示复制粘贴移动
      isOperation: false,
      // 是否显示重命名
      isMultiSelect: false
    }
  },
  components: {
    uploader
  },
  methods: {
    /**
     * 上传暂停事件
     */
    pause (file) {
      file.status = 'paused'
      file.state = this.fileStatusText('paused')
      file.subscription.unsubscribe()
    },
    /**
    * 上传开始事件
    */
    resume (file) {
      file.status = 'uploading'
      file.state = this.fileStatusText('uploading')
      // 构建七牛云上传
      file.subscription = file.observable.subscribe(
        next => this.nextUpload(next, file.uid),
        error => this.errorUpload(error, file.uid),
        complete => this.completeUpload(complete, file.uid))
    },
    /**
     * 上传删除事件
     */
    remove (file) {
      // 删除之前先暂停当前上传
      this.pause(file)
      // 删除 element 上传组件维护的上传列队
      let uploadFiles = this.$refs.elementUpload.uploadFiles
      let index = uploadFiles.findIndex(item => item.uid === file.uid)
      uploadFiles.splice(index, 1)

      // 删除当前上传列队中的文件数据
      this.fileList.splice(this.fileList.findIndex(item => item.uid === file.uid), 1)
    },
    /**
     * 上传重试事件
     */
    retry (file) {
      this.resume(file)
    },
    /**
     * 关闭当前上传面板
     */
    close () {
      this.displayUploadPanel = false
    },
    /**
     * 文件状态改变时的钩子
     * 添加文件、上传成功和上传失败时都会被调用
     */
    handleChange (file, fileList) {
      if (file.status === 'ready') {
        // 显示文件上传面板
        this.displayUploadPanel = true
        // 添加文件时
        this.fileList.push({
          name: file.name,
          uid: file.uid,
          size: storageUnitConversion(file.size),
          status: 'waiting',
          state: this.fileStatusText('waiting'),
          progress: this.progressStyle(0),
          icon: this.fileCategory(file.name.split('.').pop().toLowerCase(), file.raw.type.split('/')[0])
        })
      }
    },
    /**
     * 上传进度条事件触发
     */
    progressChange (event, file, fileList) {
      console.log(event, file, Date.now())
      this.fileList.forEach(res => {
        if (res.uid === file.uid) {
          res.progress = this.progressStyle(event)
        }
      })
    },
    /**
     * 进度条
     */
    progressStyle (progressBar) {
      const progress = Math.floor(progressBar)
      const style = `translateX(${Math.floor(progress - 100)}%)`
      return {
        progress: `${progress}%`,
        webkitTransform: style,
        mozTransform: style,
        msTransform: style,
        transform: style
      }
    },
    /**
     * 匹配icon
     */
    fileCategory (suffix, mime) {
      let type = 'unknown'
      const typeMap = {
        image: ['gif', 'ief', 'jpg', 'jpeg', 'png', 'wbmp', 'ras', 'pnm', 'pbm', 'pgm', 'ppm', 'bmp', 'rgb', 'webp'],
        video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
        audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac', 'amr'],
        document: ['doc', 'txt', 'json', 'docx', 'pages', 'epub', 'pdf', 'vue', 'numbers', 'csv', 'xls', 'xlsx', 'keynote', 'ppt', 'pptx']
      }
      Object.keys(typeMap).forEach((_type) => {
        const extensions = typeMap[_type]
        if (extensions.indexOf(suffix) > -1) {
          type = _type
        } else if (_type === mime) {
          type = _type
        }
      })
      return type
    },
    /**
     * 状态换算
     */
    fileStatusText (status) {
      return {
        success: '成功',
        error: '失败',
        uploading: '上传中',
        paused: '暂停',
        waiting: '等待'
      }[status]
    },
    /**
     * 覆盖 element 原有的上传请求
     */
    uploadRequest: function (request) {
      // 根据下标获取数据
      let breadcrumbs = this.breadcrumbs[this.breadcrumbs.length - 1]
      getToken({
        fileName: request.file.name,
        fileParentId: breadcrumbs.fileId
      }).then(response => {
        const key = response.data.key
        const token = response.data.token
        // 构建七牛云上传
        let qiniup = upload(token, key, request,
          next => this.nextUpload(next, request.file.uid),
          error => this.errorUpload(error, request.file.uid),
          complete => this.completeUpload(complete, request.file.uid))
        // 重置当前上传文件的状态
        this.fileListFilter(request.file.uid, res => {
          res.status = 'uploading'
          res.state = this.fileStatusText('uploading')
          res.observable = qiniup.observable
          res.subscription = qiniup.subscription
          res.request = request
          res.header = response.data
        })
      }).catch(err => {
        console.log(err)
      })
    },
    /**
     * 用于接收上传过程中返回的上传进度
     */
    nextUpload (next, uid) {
      let total = next.total
      this.fileListFilter(uid, res => {
        res.request.onProgress(total.percent)
        // 当前进度条为100时，认定上传成功
        if (total.percent === 100) {
          res.status = 'success'
          res.state = this.fileStatusText('success')
        }
      })
    },
    /**
     * 上传失败触发
     */
    errorUpload (error, uid) {
      this.$message({
        message: error.message || 'error',
        showClose: true,
        type: 'error',
        duration: 3 * 1000
      })

      // 重置为上传失败
      this.fileListFilter(uid, res => {
        res.status = 'error'
        res.state = this.fileStatusText('error')
        res.request.onError(error.message)
      })
    },
    /**
     * 上传成功时返回
     */
    completeUpload (complete, uid) {
      console.log(complete)
      // 请求成功时返回统一状态码
      if (complete.code !== '200') {
        this.$message({
          message: complete.message || 'error',
          showClose: true,
          type: 'error',
          duration: 3 * 1000
        })
        // 重置为上传失败
        this.fileListFilter(uid, res => {
          res.status = 'error'
          res.state = this.fileStatusText('error')
        })
      } else {
        let uploadComplete = this.fileList.filter(item => item.status === 'uploading')
        if (uploadComplete.length <= 0) {
          // 根据下标获取数据
          let breadcrumbs = this.breadcrumbs[this.breadcrumbs.length - 1]
          search({
            page: 1,
            fileParentId: breadcrumbs.fileId
          }).then((response) => {
            this.file = response.data.diskFile
          }).catch((err) => {
            console.log(err)
          })
        }
      }
    },
    /**
     * 文件上传队列过滤
     * 根据uid查找对应的file对象
     * 参数:uid
     */
    fileListFilter (uid, result) {
      this.fileList.forEach(res => {
        if (res.uid === uid) {
          result(res)
        }
      })
    },
    /**
     * 文件上传前调用的函数
     */
    beforeUpload (file) {
      let regular = /^((?!\\|\/|:|\*|\?|<|>|\||'|%).){1,50}$/
      if (!regular.test(file.name)) {
        this.$message.error('文件名50个字符以内，不包含特殊字符')
        return false
      }
      return true
    },
    logout: function () {
      this.$confirm('确认退出吗?', '提示').then(() => {
        logout().then((response) => {
          console.log(response)
          // 重置路由
          resetRouter()
          cookies.remove('userInfo')
          this.$router.push({ name: 'login' })
          // 删除保存的用户密钥数据
          localStorage.removeItem('secretKey')
        }).catch((err) => {
          console.log(err)
        })
      }).catch(() => { })
    },
    /**
     * 新建文件夹
     */
    insertFileFolder: function () {
      // 根据下标获取数据
      let breadcrumbs = this.breadcrumbs[this.breadcrumbs.length - 1]
      // 获取当前路径
      this.$prompt('请输入新目录的名称。', '新建目录', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^((?!\\|\/|:|\*|\?|<|>|\||'|%).){1,50}$/,
        inputErrorMessage: '50个字符以内，不包含特殊字符'
      }).then(({ value }) => {
        insertFileFolder({
          fileId: 0,
          fileName: value,
          fileParentId: breadcrumbs.fileId
        }).then((response) => {
          console.log(response.data)
          this.current.unshift(response.data)
          console.log(this.current)
          this.$message({
            type: 'success',
            message: response.message
          })
        }).catch((err) => {
          console.log(err)
        })
      }).catch(() => { })
    },
    /**
     * 我的文件
     */
    myFile: function () {
      search({
        page: 1,
        fileParentId: 0
      }).then((response) => {
        this.file = response.data.diskFile
        console.log(response.data.diskFile)
        // 当前目录的文件列表信息
        this.current = response.data.diskFile
        this.path = [{
          fileName: '/',
          fileId: 0
        }]
        this.breadcrumbs = [{
          fileName: '/',
          fileId: 0
        }]
        // 是否显示复制粘贴移动
        this.isOperation = false
        // 是否显示重命名
        this.isMultiSelect = false
      }).catch((err) => {
        console.log(err)
      })
    },
    /**
     * 面包屑数据同步
     */
    breadcrumb: function (val) {
      this.breadcrumbs = val
    },
    /**
     * 当前的文件路径数据同步
     */
    currentFile: function (val) {
      this.current = val
    },
    /**
     * 是否进行操作的数据同步
     */
    operation: function (val) {
      this.isOperation = val
    },
    /**
     * 是否显示重命名的数据同步
     */
    multiSelect: function (val) {
      this.isMultiSelect = val
    },
    /**
     * 文件删除
     */
    del: function () {
      this.$confirm('你确定要删除这个文件/文件夹吗?', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }).then(() => {
        // 获取当前选中值
        for (let item of document.getElementsByClassName('item')) {
          if (item.dataset.selected === 'true') {
            // 文件id
            let fileid = item.getAttribute('fileid')
            deleteFile({
              fileId: fileid
            }).then((response) => {
              // 删除文件列表中对应的文件数据
              this.current = this.current.splice(this.current.findIndex(item => item.fileId === parseInt(fileid)), 1)
              console.log(this.current)
              // 取消操作的显示
              this.isOperation = false
              this.isMultiSelect = false
              // 删除成功的提示框
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.myFile()
              console.log(response)
            }).catch((err) => {
              console.log(err)
            })
          }
        }
      }).catch(() => { })
    },
    /**
     * 文件/文件夹重命名
     */
    edit: function () {
      let id = 0
      let name = ''
      // 获取当前选中值
      for (let item of document.getElementsByClassName('item')) {
        if (item.dataset.selected === 'true') {
          id = item.getAttribute('fileid')
          name = item.getAttribute('name')
        }
      }
      if (id !== 0) {
        let omit = ''
        if (name.length > 8) {
          omit = name.slice(0, 8) + '...'
        }
        this.$prompt(`请输入新名称，旧名称为:${omit}`, '重命名', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: name,
          inputPattern: /^((?!\\|\/|:|\*|\?|<|>|\||'|%).){1,50}$/,
          inputErrorMessage: '50个字符以内，不包含特殊字符'
        }).then(({ value }) => {
          renameFile({
            fileId: id,
            newFileName: value
          }).then((response) => {
            console.log(this.current)
            // 替换数据中原有值
            this.current.forEach((res) => {
              if (res.fileId === parseInt(id)) {
                res.fileName = value
              }
            })
            // 替换页面中原有值
            this.file = this.current
            // 成功的提示框
            this.$message({
              type: 'success',
              message: '修改成功!'
            })
            console.log(response)
          }).catch((err) => {
            console.log(err)
          })
        }).catch(() => { })
      }
    }
  }
}
</script>

<style scoped>
.el-icon-upload:link {
  color: #333 !important;
}
.el-icon-upload:visited {
  color: #333 !important;
}
.el-icon-upload:active {
  color: #333 !important;
}
.el-icon-upload:hover {
  color: #333 !important;
}
.el-header,
.el-footer {
  background-color: #fff;
  color: #333;
  text-align: center;
  line-height: 60px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.075);
}
.el-header {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}
.el-aside {
  position: fixed;
  left: 0;
  top: 60px;
  width: 220px;
  height: calc(100% - 60px);
}
.el-container {
  width: calc(100% - 220px);
  float: right;
}
.el-main {
  color: #333;
  text-align: center;
  line-height: 80px;
  padding: 0px;
}
.el-dialog.is-fullscreen {
  background: rgba(0, 0, 0, 0.9);
}
body > .el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}

.spanbutt {
  float: right;
  font-size: 24px;
  letter-spacing: 8px;
}
.upload {
  width: 45px;
  text-align: right;
}
.spanbutt > div {
  float: right;
}
.el-breadcrumb__separator {
  display: block;
}

.upload-button {
  outline: none;
  display: inline-block;
  cursor: pointer;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
  border: 0;
  margin: 0;
  border-radius: 50%;
  background: transparent;
  padding: 0;
  -webkit-box-shadow: none;
  box-shadow: none;
  vertical-align: middle;
  text-align: left;
  position: relative;
}

.upload-button i {
  padding: 0.4em;
  -webkit-transition: all 0.1s ease-in-out;
  transition: all 0.1s ease-in-out;
  border-radius: 50%;
}

.material-icons {
  font-family: Material Icons;
  font-weight: 400;
  font-style: normal;
  font-size: 16px;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-feature-settings: 'liga';
  font-feature-settings: 'liga';
}

.spanbutt button {
  background: none;
  border: none;
  outline: medium;
  padding: 9px 10px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  margin: -8px;
}

.spanbutt button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.upload-cloud {
  position: relative;
  left: -10px;
}
</style>
