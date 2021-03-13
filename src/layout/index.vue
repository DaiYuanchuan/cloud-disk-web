<template>
  <div class="layout">
    <el-container>
      <!-- 头部 -->
      <el-header height="65px">
        <div class="right-logo">
          <img src="/static/svg/logo.svg" alt="cloud-disk">
        </div>
        <div class="left-operate">
          <div class="operate-btn">
            <el-button v-for="(item, index) in operateBtn" :key="index" @click="clickCallback(item)"
                       :title="item.title" :aria-label="item.title" class="action" v-show="item.show">
              <i :class="item.icon" class="material-icons"></i>
              <span>{{ item.title }}</span>
            </el-button>
          </div>
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
            <button class="action">
              <i class="el-icon-upload material-icons"></i>
            </button>
          </el-upload>
        </div>
      </el-header>
      <el-container>
        <!-- 左边菜单栏 -->
        <el-aside width="16em">
          <div>
            <el-button class="action" aria-label="我的文件" title="我的文件" @click="myFile">
              <i class="material-icons">
                <svg-icon icon-class="file-folder" color="#546e7a"></svg-icon>
              </i>
              <span>我的文件</span>
            </el-button>
            <el-button aria-label="新建文件夹" title="新建文件夹" class="action" @click="insertFileFolder">
              <i class="material-icons">
                <svg-icon icon-class="file-new-built-folder"></svg-icon>
              </i>
              <span>新建文件夹</span>
            </el-button>
            <el-button aria-label="我的分享" title="我的分享" class="action" @click="fileShareList">
              <i class="material-icons">
                <svg-icon icon-class="file-share"></svg-icon>
              </i>
              <span>我的分享</span>
            </el-button>
          </div>
          <el-button aria-label="设置" title="设置" class="action" @click="setting">
            <i class="material-icons">
              <svg-icon icon-class="setting"></svg-icon>
            </i>
            <span>设置</span>
          </el-button>
          <el-button aria-label="退出登录" title="退出登录" class="action" @click="logout">
            <i class="material-icons">
              <svg-icon icon-class="logout"></svg-icon>
            </i>
            <span>登出</span>
          </el-button>
        </el-aside>
        <!-- main -->
        <el-main>
          <router-view :breadcrumbs="breadcrumbs" :file-list="fileList"
                       @nextPage="nextPage" @doubleClick="doubleClick"
                       @previous="previous" @delete="fileDeletion"></router-view>
        </el-main>
      </el-container>
    </el-container>

    <!-- 文件上传面板 -->
    <uploader
      ref="uploader"
      :file-list="uploadedFilesList"
      :display-upload-panel="displayUploadPanel"
      @pause="pause"
      @resume="resume"
      @retry="retry"
      @remove="remove"
      @close="close"
    ></uploader>

    <!-- 分享文件的弹窗 -->
    <el-dialog title="文件分享" :visible.sync="showFileSharingDialog" :before-close="beforeClose">
      <el-form v-if="showFileSharingRequestResults === false" :model="fileSharingForm">
        <el-form-item label="链接有效期：">
          <el-select v-model="fileSharingForm.periodOfValiditySelectValue" placeholder="请选择活动区域">
            <el-option v-for="(item, index) in fileSharingForm.periodOfValidity"
                       :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否需要加密：">
          <el-radio-group v-model="fileSharingForm.encrypt">
            <el-radio v-for="(item, index) in fileSharingForm.encryptionRequired"
                      :key="index" :label="item.label" :value="item.value"></el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span v-else>
        <p>
          <strong>分享名称：</strong>
          {{ fileSharingForm.fileSharingRequestResults['shareFileName'] }}
        </p>
        <p>
          <strong>分享地址：</strong>
          <code style="word-wrap: break-word;">
            <a>
              {{ fileSharingForm.fileSharingRequestResults['shareShortUrl'] }}
            </a>
          </code>
        </p>
        <p>
          <strong>有效期：</strong>
          {{ fileSharingForm.fileSharingRequestResults['periodOfValidity'] }}
        </p>
        <p v-if="fileSharingForm.fileSharingRequestResults['encryptionRequired']">
          <strong>提取码：</strong>
          {{ fileSharingForm.fileSharingRequestResults['shareCode'] }}
        </p>
      </span>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createFileShare">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {logout} from '@/api/login'
import {getToken, upload} from '@/api/qiniu'
import {search, insertFileFolder, deleteFile, renameFile} from '@/api/file'
import {createShare} from '@/api/share'
import {resetRouter} from '@/router/index'
import cookies from 'js-cookie'
import uploader from '@/components/upload/uploader'
import {storageUnitConversion, formatDate} from '@/utils/utils'

export default {
  name: 'layout',
  data () {
    return {
      // 右上角需要进行操作的按钮
      operateBtn: [{
        title: '分享',
        icon: 'el-icon-share',
        show: false,
        method: 'fileSharingBtn'
      }, {
        title: '重命名',
        icon: 'el-icon-edit-outline',
        show: false,
        method: 'fileRename'
      }, {
        title: '复制',
        icon: 'el-icon-document-copy',
        show: false,
        method: 'fileCopy'
      }, {
        title: '移动',
        icon: 'el-icon-document-remove',
        show: false,
        method: 'fileMove'
      }, {
        title: '删除',
        icon: 'el-icon-delete-solid',
        show: false,
        method: 'fileDeletion'
      }, {
        title: '文件详情',
        icon: 'el-icon-info',
        show: false,
        method: 'documentDetails'
      }],
      // 路径信息的面包屑导航(数组中的第一位元素为主页)
      breadcrumbs: [{
        fileName: '主页',
        fileId: 0
      }],
      // 初始化的分页信息(默认从第一页开始请求页面文件列表数据)
      page: 1,
      // 页面上拉触底事件(如果页面上拉触底请求下一页的数据时 没有数据了 这里显示true 表示不请求数据)
      pageBottomEvent: false,
      // 当前页面的文件列表信息(记录着当前页面中所有的文件数据)
      fileList: [],
      // 上传面板中的文件上传的列队信息(包含着所有状态的文件数据)
      uploadedFilesList: [],
      // 是否显示当前文件上传面板
      displayUploadPanel: false,
      // 是否显示文件分享的对话框
      showFileSharingDialog: false,
      // 是否显示文件分享的请求结果
      showFileSharingRequestResults: false,
      // 文件分享表单
      fileSharingForm: {
        // 链接有效期的表单选中值
        periodOfValiditySelectValue: 86400,
        // 链接有效期
        periodOfValidity: [{
          label: '1天', value: 86400
        }, {
          label: '7天', value: 604800
        }, {
          label: '永久有效', value: -1
        }],
        // 是否需要加密的表单选中值
        encrypt: '是',
        // 是否需要加密
        encryptionRequired: [{
          label: '是', value: true
        }, {
          label: '否', value: false
        }],
        // 文件分享api请求结果
        fileSharingRequestResults: {}
      }
    }
  },
  components: {
    uploader
  },
  // 钩子函数: 数据监听
  watch: {
    // 监听 fileList 数据的实时变化
    fileList: {
      handler: function () {
        // 筛选所有选中的数据
        let selectData = this.fileList.filter(res => res.select)
        if (!selectData.length) {
          // 如果没有选中的数据 ，那么所有的按钮都不显示
          this.operateBtn.forEach(res => {
            res.show = false
          })
        }
        // 如果只选中了一条数据
        if (selectData.length === 1) {
          this.operateBtn.forEach(res => {
            res.show = true
          })
          // 如果选中的这一条数据是文件夹 ，则不显示 文件详情 按钮
          this.operateBtn[5].show = !selectData[0]['fileFolder']
        }
        if (selectData.length > 1) {
          // 如果选中了不止一条数据，则 重命名、文件详情 按钮不显示
          this.operateBtn[1].show = false
          this.operateBtn[5].show = false
        }
      },
      // 深度监听
      deep: true
    }
  },
  // 钩子函数：页面加载完成后执行
  mounted: function () {
    this.getFileListInfo()
  },
  methods: {
    /**
     * 点击按钮的回调函数
     * @param btn 按钮对象
     */
    clickCallback: function (btn) {
      this[btn.method](btn)
    },
    // ============================== 页面右上角按钮执行的操作方法
    /**
     * 右上角-文件分享 按钮
     */
    fileSharingBtn: function () {
      this.showFileSharingDialog = true
    },
    /**
     * 文件分享Dialog关闭前的回调函数
     */
    beforeClose: function (done) {
      if (done !== false) {
        this.$emit('update:visible', false)
        this.$emit('close')
        this.showFileSharingDialog = false
        this.showFileSharingRequestResults = false
        this.fileSharingForm.fileSharingRequestResults = {}
      }
    },
    /**
     * 创建文件分享链接
     */
    createFileShare: function () {
      console.log(this.showFileSharingRequestResults)
      if (this.showFileSharingRequestResults) {
        this.showFileSharingDialog = false
        this.showFileSharingRequestResults = false
        return
      }
      let encrypt = this.fileSharingForm.encryptionRequired.filter(res => res.label === this.fileSharingForm.encrypt)
      let periodOfValidity = this.fileSharingForm.periodOfValidity.filter(res => res.value === this.fileSharingForm.periodOfValiditySelectValue)
      // 获取当前选中的数据
      let selectData = this.fileList.filter(res => res.select)
      if (!selectData.length) {
        // 如果没有数据选中的 ，则不执行
        return
      }

      // 创建文件分享链接
      createShare({
        encrypt: encrypt[0].value,
        time: this.fileSharingForm.periodOfValiditySelectValue,
        files: selectData.map(item => item.fileId)
      }).then((response) => {
        response.data['periodOfValidity'] = periodOfValidity[0].label
        response.data['encryptionRequired'] = encrypt[0].value
        this.fileSharingForm.fileSharingRequestResults = response.data
        this.showFileSharingRequestResults = true
      }).catch((err) => {
        console.log(err)
      })
    },
    /**
     * 右上角-重命名 按钮
     */
    fileRename: function () {
      // 获取当前选中的数据
      let selectData = this.fileList.filter(res => res.select)
      if (!selectData.length) {
        // 如果没有数据选中的 ，则不执行
        return
      }

      let character = selectData[0].fileName
      // 如果这个名字很长 ...
      if (character.length > 8) {
        character = character.slice(0, 8) + '...'
      }

      this.$prompt(`请输入新名称，旧名称为:${character}`, '重命名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: selectData[0].fileName,
        inputPattern: /^((?![\\/:*?<>|'%]).){1,50}$/,
        inputErrorMessage: '50个字符以内，不包含特殊字符',
        closeOnClickModal: false
      }).then(({value}) => {
        // 当前新名字 需与 旧名字 不相等 才能更改
        if (value !== selectData[0].fileName) {
          renameFile({
            fileId: selectData[0].fileId,
            newFileName: value
          }).then((response) => {
            selectData[0].fileName = response['data']
            selectData[0].updateTime = formatDate(new Date(Date.now()), 'yyyy-MM-dd hh:mm:ss')
            // 成功的提示框
            this.$message({
              type: 'success',
              message: '修改成功!'
            })
            console.log(response)
          }).catch((err) => {
            console.log(err)
          })
        }
      }).catch(() => {
      })
    },
    /**
     * 右上角-文件复制 按钮
     */
    fileCopy: function () {
      console.log('文件复制')
      this.$message({
        showClose: true,
        message: '开发中，敬请期待！'
      })
    },
    /**
     * 右上角-文件移动 按钮
     */
    fileMove: function () {
      console.log('文件移动')
      this.$message({
        showClose: true,
        message: '开发中，敬请期待！'
      })
    },
    /**
     * 右上角-文件删除 按钮
     */
    fileDeletion: function () {
      // 获取当前选中的数据
      let selectData = this.fileList.filter(res => res.select)
      if (!selectData.length) {
        // 如果没有数据选中的 ，则不执行
        return
      }
      this.$confirm('你确定要删除这个文件/文件夹吗?', '提示', {
        confirmButtonText: '删除',
        closeOnClickModal: false,
        cancelButtonText: '取消'
      }).then(() => {
        selectData.forEach(res => {
          deleteFile({
            fileId: res.fileId
          }).then((response) => {
            console.log(response)
            // 删除成功的提示框
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            // 删除文件列表中对应的文件数据
            this.fileList = this.fileList.filter(item => item !== res)
          }).catch((err) => {
            console.log(err)
          })
        })
      }).catch(() => {
      })
    },
    /**
     * 右上角-文件详情 按钮
     */
    documentDetails: function () {
      // 获取当前选中的文件数据
      let selectData = this.fileList.filter(res => res.select && !res['fileFolder'])
      if (!selectData.length) {
        // 如果没有数据选中的 ，则不执行
        return
      }

      this.$alert(
        `<p><strong>名称：</strong>${selectData[0]['fileName']}</p>
                  <p><strong>大小：</strong>${storageUnitConversion(selectData[0]['fileSize'])}</p>
                  <p><strong>创建时间：</strong>${selectData[0]['createTime']}</p>
                  <p><strong>引用地址：</strong>
                  <code style="word-wrap: break-word;">
                  <a>${process.env.BASE_API}/disk-file/resource/redirection?key=${selectData[0]['fileKey']}</a>
                  </code></p>`, '文件信息', {
          dangerouslyUseHTMLString: true
        }).catch(res => {
      })
    },
    // ============================== 页面工具方法
    /**
     * 从服务器端获取文件列表信息
     * @param page 页码
     * @param fileParentId 文件的上一级id
     * @param resetData 是否重置文件列表数据
     * @param callback 回调函数
     */
    getFileListInfo: function (page, fileParentId, resetData, callback) {
      if (page === null || page === undefined) {
        // 默认第一页
        page = 1
      }

      if (fileParentId === null || fileParentId === undefined) {
        // 默认从 路径信息的面包屑导航 数据中获取最后一位元素
        fileParentId = this.breadcrumbs[this.breadcrumbs.length - 1].fileId
      }
      search({
        page: page,
        fileParentId: fileParentId
      }).then((response) => {
        // 重置文件列表数据
        if (resetData !== undefined && resetData) {
          this.fileList = []
        }
        response.data['diskFile'].forEach(res => {
          res['select'] = false
          this.fileList.push(res)
        })
        // 判断是否进行下一次的分页请求
        if (response.data['diskFile'].length < 100 || response.data['toTal'] < 100 ||
          (response.data['diskFile'].length === 100 && response.data['toTal'] === 100)) {
          // 数组长度小于 pageSize 不进行下一次分页请求
          this.pageBottomEvent = true
        } else if (response.data['diskFile'].length === 100 && response.data['toTal'] > 100) {
          this.pageBottomEvent = false
        }
        if (callback !== undefined) {
          callback(response)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    /**
     * 加载下一页
     */
    nextPage: function () {
      if (!this.pageBottomEvent) {
        // 当前页码+1
        this.page += 1
        this.getFileListInfo(this.page, null)
      }
    },
    /**
     * 页面 面包屑点击事件(加载上一级)
     */
    previous: function (item) {
      // 判断点击的是否是当前的目录(面包屑的最后一个元素为当前元素)
      if (item.fileId !== this.breadcrumbs[this.breadcrumbs.length - 1].fileId) {
        this.page = 1
        this.getFileListInfo(this.page, item.fileId, true, response => {
          this.breadcrumbs = this.breadcrumbs.slice(0, this.breadcrumbs.findIndex(res => res.fileId === item.fileId) + 1)
        })
      }
    },
    /**
     * 页面 文件双击事件(只有文件被双击了才会触发)
     */
    doubleClick: function (item) {
      // 设置当前页码为1
      this.page = 1
      this.getFileListInfo(this.page, item.fileId, true, res => {
        // 增加面包屑导航数据
        this.breadcrumbs.push({
          fileId: item.fileId,
          fileName: item.fileName
        })
      })
    },
    // ============================== 页面左侧菜单栏调用的方法
    /**
     * 页面左侧菜单栏-我的文件
     */
    myFile: function () {
      if (this.$route.path !== '/home') {
        this.$router.push({name: 'home'})
      } else {
        this.previous({
          fileId: 0
        })
      }
    },
    /**
     * 页面左侧菜单栏-新建文件夹
     */
    insertFileFolder: function () {
      // 获取当前目录id信息
      let breadcrumbs = this.breadcrumbs[this.breadcrumbs.length - 1]
      // 获取当前路径
      this.$prompt('请输入新目录的名称。', '新建目录', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^((?![\\/:*?<>|'%]).){1,50}$/,
        inputErrorMessage: '50个字符以内，不包含特殊字符'
      }).then(({value}) => {
        // 如果是空的
        insertFileFolder({
          fileId: 0,
          fileName: value,
          fileParentId: breadcrumbs.fileId
        }).then((response) => {
          response.data['select'] = false
          this.fileList.unshift(response.data)
          this.$message({
            type: 'success',
            message: response.message
          })
        }).catch((err) => {
          console.log(err)
        })
      }).catch(() => {
      })
    },
    /**
     * 页面左侧菜单栏-我的分享列表
     */
    fileShareList: function () {
      console.log('我的分享列表')
      this.$message({
        showClose: true,
        message: '开发中，敬请期待！'
      })
    },
    /**
     * 页面左侧菜单栏-设置
     */
    setting: function () {
      console.log('用户设置')
      this.$message({
        showClose: true,
        message: '开发中，敬请期待！'
      })
    },
    /**
     * 页面左侧菜单栏-退出登录
     */
    logout: function () {
      this.$confirm('确认退出吗?', '提示').then(() => {
        logout().then(res => {
          // 重置路由
          resetRouter()
          cookies.remove('userInfo')
          this.$router.push({name: 'login'})
          // 删除保存的用户密钥数据
          localStorage.removeItem('secretKey')
        }).catch((err) => {
          console.log(err)
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    // ============================== 文件上传部分方法
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
      this.uploadedFilesList.splice(this.uploadedFilesList.findIndex(item => item.uid === file.uid), 1)
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
     * 用于接收七牛云上传过程中返回的上传进度信息
     */
    nextUpload (next, uid) {
      let total = next.total
      this.uploadedFilesListFilter(uid, res => {
        // 调用el-upload的上传进度条事件
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
      this.uploadedFilesListFilter(uid, res => {
        res.status = 'error'
        res.state = this.fileStatusText('error')
        // 调用el-upload的上传失败事件
        res.request.onError(error.message)
      })
    },
    /**
     * 上传成功时返回
     */
    completeUpload (complete, uid) {
      // 请求成功时返回统一状态码
      if (complete.code !== '200') {
        this.$message({
          message: complete.message || 'error',
          showClose: true,
          type: 'error',
          duration: 3 * 1000
        })
        // 将当前文件状态重置为上传失败
        this.uploadedFilesListFilter(uid, res => {
          res.status = 'error'
          res.state = this.fileStatusText('error')
        })
      } else {
        let uploadComplete = this.uploadedFilesList.filter(item => item.status === 'uploading')
        if (uploadComplete.length <= 0) {
          // 重新获取当前页面的数据
          this.getFileListInfo(null, null, true)
        }
      }
    },
    /**
     * el-upload 上传进度条事件触发
     */
    progressChange: function (event, file) {
      this.uploadedFilesList.forEach(res => {
        if (res.uid === file.uid) {
          res.progress = this.progressStyle(event)
        }
      })
    },
    /**
     * el-upload 文件状态改变时的钩子
     * 添加文件、上传成功和上传失败时都会被调用
     */
    handleChange (file) {
      // 添加文件时
      if (file.status === 'ready') {
        // 显示文件上传面板
        if (!this.displayUploadPanel) {
          this.displayUploadPanel = true
        }
        let regular = /^((?![\\/:*?<>|'%]).){1,50}$/
        if (regular.test(file.name)) {
          // 向上传面板中的文件列队添加新的文件数据
          this.uploadedFilesList.push({
            name: file.name,
            uid: file.uid,
            size: storageUnitConversion(file.size),
            status: 'waiting',
            state: this.fileStatusText('waiting'),
            progress: this.progressStyle(0),
            icon: this.fileCategory(file.name.split('.').pop().toLowerCase(), file.raw.type.split('/')[0])
          })
        }
      }
    },
    /**
     * 根据文件后缀、文件类型匹配上传面板中的icon信息
     * @param suffix 文件后缀(jpg、gif等)
     * @param mime 文件类型的前缀(image、video等)
     * @returns {string}
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
     * el-upload 覆盖 element 原有的上传请求
     */
    uploadRequest: function (request) {
      // 获取当前目录id信息
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
        this.uploadedFilesListFilter(request.file.uid, res => {
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
     * 上传面板中的进度条动态样式
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
     * el-upload文件上传前调用的函数
     * 主要验证文件名是否包含特殊字符，并在50字符以内
     */
    beforeUpload: function (file) {
      let regular = /^((?![\\/:*?<>|'%]).){1,50}$/
      if (!regular.test(file.name)) {
        this.$message.error('文件名50个字符以内，不包含特殊字符')
        return false
      }
      return true
    },
    /**
     * 文件上传队列过滤
     * 根据uid查找对应的file对象
     * 参数:
     * uid:文件唯一标识
     * result:回调函数
     */
    uploadedFilesListFilter (uid, result) {
      this.uploadedFilesList.forEach(res => {
        if (res.uid === uid) {
          result(res)
        }
      })
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
    }
  }
}
</script>

<style scoped lang="scss">
.layout {
  font-family: Roboto, sans-serif;
  padding-top: 4em;
  background-color: #fafafa;
  color: #333;
  margin: 0;
  display: block;
}

header {
  z-index: 1000;
  background-color: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, .075);
  -webkit-box-shadow: 0 0 5px rgba(0, 0, 0, .1);
  box-shadow: 0 0 5px rgba(0, 0, 0, .1);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 0;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

header img {
  height: 2.5em;
}

header > div:first-child > .action, header img {
  margin-right: 1em;
}

img {
  max-width: 100%;
  border-style: none;
}

.right-logo {
  height: 4em;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  width: 100%;
  padding: .5em .5em .5em 1em;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
}

.left-operate {
  -webkit-box-pack: end;
  -ms-flex-pack: end;
  justify-content: flex-end;
}

header > div {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  width: 100%;
  padding: .5em .5em .5em 1em;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

.action {
  display: inline-block;
  cursor: pointer;
  -webkit-transition: all .2s ease;
  transition: all .2s ease;
  border: 0;
  margin: 0;
  color: #546e7a;
  border-radius: 50%;
  background: transparent;
  padding: 0;
  -webkit-box-shadow: none;
  box-shadow: none;
  vertical-align: middle;
  text-align: left;
  position: relative;
}

.action:hover {
  background-color: rgba(0, 0, 0, .1);
}

[type=button], [type=reset], [type=submit], button {
  -webkit-appearance: button;
}

button, select {
  text-transform: none;
}

button, input {
  overflow: visible;
}

button, input, optgroup, select, textarea {
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
}

.action i {
  padding: .4em;
  -webkit-transition: all .1s ease-in-out;
  transition: all .1s ease-in-out;
  border-radius: 50%;
}

.material-icons {
  font-family: Material Icons;
  font-weight: 400;
  font-style: normal;
  font-size: 24px;
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
  -webkit-font-feature-settings: "liga";
  font-feature-settings: "liga";
}

header .action span {
  display: none;
}

.operate-btn {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  vertical-align: middle;
  position: relative;
}

.el-aside {
  width: 16em;
  position: fixed;
  top: 4em;
  left: 0;
}

aside .action {
  width: 100%;
  display: block;
  border-radius: 0;
  font-size: 1.1em;
  padding: .5em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

a {
  color: inherit;
  text-decoration: none;
  background-color: transparent;
}

.el-aside .action > * {
  vertical-align: middle;
}

.el-aside div:first-child {
  border-bottom: 1px solid rgba(0, 0, 0, .05);
}

main {
  min-height: 1em;
  margin: 0 1em 1em auto;
  width: calc(100% - 19em);
}

main {
  display: block;
}

/deep/ .el-main {
  flex: none;
  padding: 0;
}

* {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  main {
    width: calc(100% - 13em);
  }

  .el-aside {
    width: 10em !important;
  }
}

@media (max-width: 736px) {
  main {
    margin: 0 1em;
    width: calc(100% - 2em);
  }

  .layout {
    padding-bottom: 5em;
  }

  .el-aside {
    top: 0;
    z-index: 99999;
    background: #fff;
    height: 100%;
    width: 16em;
    -webkit-box-shadow: 0 0 5px rgba(0, 0, 0, .1);
    box-shadow: 0 0 5px rgba(0, 0, 0, .1);
    -webkit-transition: left .1s ease;
    transition: left .1s ease;
    left: -17em;
  }

  #listing.list .item .size {
    display: none !important;
  }
}

</style>
