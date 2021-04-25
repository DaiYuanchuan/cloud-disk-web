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
          </div>
          <div>
            <el-button aria-label="我的分享" title="我的分享" class="action" @click="fileShareList">
              <i class="material-icons">
                <svg-icon icon-class="file-share"></svg-icon>
              </i>
              <span>我的分享</span>
            </el-button>
            <el-button aria-label="问题反馈" title="问题反馈" class="action" @click="feedbackBtn">
              <i class="material-icons">
                <svg-icon icon-class="file-feedback"></svg-icon>
              </i>
              <span>问题反馈</span>
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
          <p class="credits"><span><a @click="helpPanel">帮助</a></span></p>
        </el-aside>
        <div class="content-bottom">
          <div class="storage-wrapper">
            <div class="usage-progress">
              <div class="text">
                <!-- 以用容量 -->
                {{ storageUnitFormatting(userInfo.usedCapacity) }}
                /
                <!-- 总容量 -->
                {{ storageUnitFormatting(userInfo.totalCapacity) }}
              </div>
              <!-- 已用容量的百分比 -->
              <span class="progress" :style="userInfo.percentageCapacity"></span>
            </div>
          </div>
        </div>
        <div class="sider-bottom">
          <div class="bottom-wrapper">
            <div class="user-info">
              <el-avatar :size="35" @error="true" :alt="userInfo.username"
                         :src="userInfo.userAvatar">
                <img src="/static/img/default.png" alt="username"/>
              </el-avatar>
            </div>
            <span class="user-info-name">{{ userInfo.username }}</span>
          </div>
        </div>
        <!-- main -->
        <el-main>
          <router-view :breadcrumbs="breadcrumbs" :file-list="fileList"
                       @nextPage="nextPage" @doubleClick="doubleClick"
                       @ctrlC="setPreprocessing('copy')" @ctrlX="setPreprocessing('move')"
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

    <!-- 意见与反馈的表单对象 -->
    <el-dialog title="意见与反馈" :visible.sync="feedback.show">
      <el-form ref="feedback" :model="feedback.form" :rules="feedback.rules">
        <el-form-item label="意见与问题" prop="feedbackContent">
          <el-input type="textarea" v-model="feedback.form.feedbackContent" class="feedbackContent" maxlength="500"
                    placeholder="您可以向我们提出您的疑问或者是一些建设性的意见"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="feedbackContact">
          <el-input
            type="text"
            placeholder="请填写您的常用邮箱地址，便于我们与您联系。"
            v-model="feedback.form.feedbackContact"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="feedbackSubmit('feedback')">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 文件详情的Dialog弹窗 -->
    <el-dialog title="文件详情" :visible.sync="fileInfoDialog.show" class="fileInfoPopup">
      <div class="fileInfoPopup">
        <p class="fileInfoPopupBlock">
          <strong>
            <svg-icon icon-class="file-share" width="18" height="18" className="fileInfoPopupBlockSvg"></svg-icon>
            名称：
          </strong>
          <span class="fileInfoPopupBlockValue">文件</span>
        </p>
        <p class="fileInfoPopupBlock">
          <strong>
            <svg-icon icon-class="file-share" width="18" height="18" className="fileInfoPopupBlockSvg"></svg-icon>
            大小：
          </strong>
          <span class="fileInfoPopupBlockValue">1GB</span>
        </p>
        <p class="fileInfoPopupBlock">
          <strong>
            <svg-icon icon-class="file-share" width="18" height="18" className="fileInfoPopupBlockSvg"></svg-icon>
            创建时间：
          </strong>
          <span class="fileInfoPopupBlockValue">2021-04-25 12:12:13</span>
        </p>
        <p class="fileInfoPopupBlock">
          <strong>
            <svg-icon icon-class="file-share" width="18" height="18" className="fileInfoPopupBlockSvg"></svg-icon>
            修改时间：
          </strong>
          <span class="fileInfoPopupBlockValue">2021-04-25 12:12:13</span>
        </p>
      </div>
    </el-dialog>

    <!-- 文件 复制、移动 时选择目标文件夹的面板 -->
    <file-card v-if="fileCard.show" :card-title="fileCard.title" :card-breadcrumbs="fileCard.cardBreadcrumbs"
               @card-close="cardClose" @card-confirm="cardConfirm"
               @card-folder-previous="cardFolderPrevious" @card-folder-next="cardFolderNext"></file-card>

  </div>
</template>

<script>
import {logout} from '@/api/login'
import {getToken, upload} from '@/api/qiniu'
import {validEmail} from '@/utils/validate'
import {search, insertFileFolder, deleteFile, renameFile, copyFile, moveFile} from '@/api/file'
import {createShare} from '@/api/share'
import {insertFeedback} from '@/api/feedback'
import {resetRouter} from '@/router/index'
import cookies from 'js-cookie'
import uploader from '@/components/upload/uploader'
import fileCard from '@/components/fileCard/fileCard'
import {storageUnitConversion, formatDate} from '@/utils/utils'

export default {
  name: 'layout',
  data () {
    // 邮箱校验
    const validateEmail = (rule, value, callback) => {
      if (validEmail(value)) {
        callback()
      } else {
        callback(new Error('邮箱地址不规范'))
      }
    }
    // 反馈内容的长度校验
    const validateFeedbackContent = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error('请填写您宝贵的意见，您的意见对我们真的很重要.'))
      } else if (value.length <= 500) {
        callback()
      } else {
        callback(new Error('请尽量精简您要反馈的内容'))
      }
    }
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
        userFileName: '主页',
        userFileId: 0
      }],
      // 初始化的分页信息(默认从第一页开始请求页面文件列表数据)
      page: 1,
      // 页面上拉触底事件(如果页面上拉触底请求下一页的数据时 没有数据了 这里显示true 表示不请求数据)
      pageBottomEvent: false,
      // 当前页面的文件列表信息(记录着当前页面中所有的文件数据)
      fileList: [],
      // 文件预处理信息列表(ctrl+c 复制后进入此列表，ctrl+v 粘贴读取此列表的数据 ，以实现复制、移动功能)
      filePreprocessing: [],
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
          label: '3天', value: 259200
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
      },
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
      fileInfoDialog: {
        show: false
      },
      // 意见与反馈的对象
      feedback: {
        // 是否显示表单
        show: false,
        // 表单
        form: {
          // 联系方式
          feedbackContact: '',
          // 反馈内容
          feedbackContent: ''
        },
        // 表单验证，需要在 el-form-item 元素中增加 prop 属性
        rules: {
          feedbackContact: [{required: true, trigger: 'blur', validator: validateEmail}],
          feedbackContent: [{required: true, trigger: 'blur', validator: validateFeedbackContent}]
        }
      },
      // 当前登录的用户信息
      userInfo: {
        // 当前登录的用户名
        username: '',
        // 用户头像
        userAvatar: '',
        // 总容量
        totalCapacity: '',
        // 已用容量
        usedCapacity: '',
        // 剩余容量
        remainingCapacity: '',
        // 已用容量的百分比
        percentageCapacity: {}
      }
    }
  },
  components: {
    uploader, fileCard
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
    // 获取cookie缓存中的用户信息
    let userInfo = cookies.get('userInfo')
    if (userInfo === undefined) {
      // 如果在未登录的情况下使用，则跳转登录页面
      this.$router.push({name: 'login'})
      return
    }
    this.setUserInfoCookies(JSON.parse(userInfo))
    // 自动获取文件列表的第一页
    this.getFileListInfo()
    // 监听全局粘贴事件 ，将粘贴事件绑定到 ctrlV 方法
    document.addEventListener('paste', this.ctrlV)
    // 监听全局拖拽事件 ，将拖拽事件绑定到 dragover、drop 方法
    document.addEventListener('dragover', this.dragover)
    document.addEventListener('drop', this.drop)
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
        files: selectData.map(item => item.userFileId)
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

      let character = selectData[0].userFileName
      // 如果这个名字很长 ...
      if (character.length > 8) {
        character = character.slice(0, 8) + '...'
      }

      this.$prompt(`请输入新名称，旧名称为:${character}`, '重命名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: selectData[0].userFileName,
        inputPattern: /^((?![\\/:*?？^`~&<>|'%]).){1,50}$/,
        inputErrorMessage: '50个字符以内，不能包含特殊字符',
        closeOnClickModal: false
      }).then(({value}) => {
        // 当前新名字 需与 旧名字 不相等 才能更改
        if (value !== selectData[0].userFileName) {
          renameFile({
            userFileId: selectData[0].userFileId,
            newUserFileName: value
          }).then((response) => {
            selectData[0].userFileName = response['data'].userFileName
            selectData[0].updateTime = formatDate(new Date(Date.now()), 'yyyy-MM-dd hh:mm:ss')
            selectData[0].userDynamicDownloadUrl = response['data'].userDynamicDownloadUrl
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
      // 打开文件夹面板时 取消 body 的滚动条
      document.body.setAttribute('style', 'margin: 0; background: #fafafa; overflow: hidden;')
      this.fileCard.title = '复制'
      // 重置卡片面包屑数据
      this.fileCard.cardBreadcrumbs = [{
        userFileName: '/',
        userFileId: 0
      }]
      this.fileCard.show = true
    },
    /**
     * 右上角-文件移动 按钮
     */
    fileMove: function () {
      // 打开文件夹面板时 取消 body 的滚动条
      document.body.setAttribute('style', 'margin: 0; background: #fafafa; overflow: hidden;')
      this.fileCard.title = '移动'
      // 重置卡片面包屑数据
      this.fileCard.cardBreadcrumbs = [{
        userFileName: '/',
        userFileId: 0
      }]
      this.fileCard.show = true
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
        deleteFile(selectData.map(item => item.userFileId)).then((response) => {
          console.log(response)
          // 重新对cookie中的用户信息赋值
          this.setUserInfoCookies(response.data)
          // 删除成功的提示框
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          selectData.forEach(res => {
            // 删除文件列表中对应的文件数据
            this.fileList = this.fileList.filter(item => item !== res)
          })
        }).catch((err) => {
          console.log(err)
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
      this.fileInfoDialog.show = true

      // this.$alert(
      //   ``, '文件信息', {
      //     dangerouslyUseHTMLString: true
      //   }).catch(res => {
      // })
    },
    /**
     * 关闭文件 复制、移动 时选择目标文件夹的面板
     */
    cardClose: function () {
      this.fileCard.title = ''
      this.fileCard.show = false
      document.body.setAttribute('style', 'margin: 0; background: #fafafa;')
    },
    /**
     * 复制、移动 时选择目标文件夹面板中的确认事件
     * @param currentlySelectedValue 文件夹面板中选中的目标文件夹的文件id
     * @param cardTitle 文件夹面板的title(在当前页面只有俩种情况  复制 - 移动)
     */
    cardConfirm: function (currentlySelectedValue, cardTitle) {
      // 获取所有当前选中的数据
      let selectData = this.fileList.filter(res => res.select)
      if (!selectData.length) {
        // 如果没有数据选中的 ，则不执行
        return
      }
      let fileSize = 0
      // 需要操作的用户文件标识集合信息
      let operationFileInfo = []
      selectData.forEach(res => {
        fileSize += res.ossFileSize
        operationFileInfo.push({
          fromFileId: res.userFileId
        })
      })
      if (cardTitle === '复制') {
        // 判断上传空间容量
        if (this.userInfo.remainingCapacity <= 0 || this.userInfo.remainingCapacity - fileSize < 0) {
          this.$message.error('存储空间不足')
          return
        }
        copyFile({
          copyFileInfo: operationFileInfo,
          targetFileId: currentlySelectedValue
        }).then((response) => {
          console.log(response)
          // 复制成功的提示框
          this.$message({
            type: 'success',
            message: '复制完成!'
          })
          // 如果目标文件夹与当前已经文件夹一致时，刷新当前文件夹
          if (this.breadcrumbs[this.breadcrumbs.length - 1].userFileId === currentlySelectedValue) {
            // 在当前的文件列表中添加对应的文件数据
            response.data['fromUserFileList'].forEach(fromUserFileInfo => {
              fromUserFileInfo['select'] = false
              this.fileList.unshift(fromUserFileInfo)
            })
          }
          // 重新对cookie中的用户信息赋值
          this.setUserInfoCookies(response.data['userInfo'])
        }).catch((err) => {
          console.log(err)
        })
      } else {
        moveFile({
          moveFileInfo: operationFileInfo,
          targetFileId: currentlySelectedValue
        }).then((response) => {
          console.log(response)
          // 删除成功的提示框
          this.$message({
            type: 'success',
            message: '剪切完成!'
          })
          // 如果目标文件夹与当前已经文件夹一致时，刷新当前文件夹
          if (this.breadcrumbs[this.breadcrumbs.length - 1].userFileId === currentlySelectedValue) {
            // 在当前的文件列表中添加对应的文件数据
            response.data.forEach(fromUserFileInfo => {
              fromUserFileInfo['select'] = false
              this.fileList.unshift(fromUserFileInfo)
            })
          }
          selectData.forEach(res => {
            // 删除文件列表中对应的文件数据
            this.fileList = this.fileList.filter(item => item !== res)
          })
        }).catch((err) => {
          console.log(err)
        })
      }
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
    // ============================== 页面工具方法
    /**
     * 从服务器端获取文件列表信息
     * @param page 页码
     * @param userFileParentId 文件的上一级id
     * @param resetData 是否重置文件列表数据
     * @param callback 回调函数
     */
    getFileListInfo: function (page, userFileParentId, resetData, callback) {
      if (page === null || page === undefined) {
        // 默认第一页
        page = 1
      }

      if (userFileParentId === null || userFileParentId === undefined) {
        // 默认从 路径信息的面包屑导航 数据中获取最后一位元素
        userFileParentId = this.breadcrumbs[this.breadcrumbs.length - 1].userFileId
      }
      search({
        page: page,
        userFileParentId: userFileParentId
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
      if (item.userFileId !== this.breadcrumbs[this.breadcrumbs.length - 1].userFileId) {
        this.page = 1
        this.getFileListInfo(this.page, item.userFileId, true, response => {
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
      this.getFileListInfo(this.page, item.userFileId, true, res => {
        // 增加面包屑导航数据
        this.breadcrumbs.push({
          userFileId: item.userFileId,
          userFileName: item.userFileName
        })
      })
    },
    /**
     * 页面 ctrl + v 事件(文件粘贴)
     */
    ctrlV: function (e) {
      // 获取所有copy类型文件
      let copy = this.filePreprocessing.filter(res => res.type === 'copy')
      // 获取当前展开的目录的文件夹id
      let fpId = this.breadcrumbs[this.breadcrumbs.length - 1].userFileId
      if (copy.length > 0) {
        let fileSize = 0
        // 需要操作的用户文件标识集合信息
        let operationFileInfo = []
        copy.forEach(res => {
          fileSize += res.file.ossFileSize
          operationFileInfo.push({
            fromFileId: res.file.userFileId
          })
        })
        // 判断上传空间容量
        if (this.userInfo.remainingCapacity <= 0 || this.userInfo.remainingCapacity - fileSize < 0) {
          this.$message.error('存储空间不足')
          return
        }
        // 复制文件
        copyFile({
          copyFileInfo: operationFileInfo,
          targetFileId: fpId
        }).then((response) => {
          console.log(response)
          // 复制成功的提示框
          this.$message({
            type: 'success',
            message: '复制完成!'
          })
          // 在当前的文件列表中添加对应的文件数据
          response.data['fromUserFileList'].forEach(fromUserFileInfo => {
            fromUserFileInfo['select'] = false
            this.fileList.unshift(fromUserFileInfo)
          })
          // 重新对cookie中的用户信息赋值
          this.setUserInfoCookies(response.data['userInfo'])
        }).catch((err) => {
          console.log(err)
        })
        this.filePreprocessing = []
        return
      }
      // 获取所有move类型文件
      let move = this.filePreprocessing.filter(res => res.type === 'move')
      if (move.length > 0) {
        // 需要操作的用户文件标识集合信息
        let operationFileInfo = []
        move.forEach(res => {
          operationFileInfo.push({
            fromFileId: res.file.userFileId
          })
        })
        // 移动文件
        moveFile({
          moveFileInfo: operationFileInfo,
          targetFileId: fpId
        }).then((response) => {
          console.log(response)
          // 删除成功的提示框
          this.$message({
            type: 'success',
            message: '剪切完成!'
          })
          // 在当前的文件列表中添加对应的文件数据
          response.data.forEach(fromUserFileInfo => {
            fromUserFileInfo['select'] = false
            this.fileList.unshift(fromUserFileInfo)
          })
        }).catch((err) => {
          console.log(err)
        })
        this.filePreprocessing = []
        return
      }
      if (e.clipboardData.items.length > 0 && (e.clipboardData.items[0].type === 'image/png' ||
        e.clipboardData.items[0].type === 'image/jpeg' ||
        e.clipboardData.items[0].type === 'image/gif')) {
        let upload = this.$refs.elementUpload
        if (!upload) {
          return
        }
        upload.handleStart(new File([e.clipboardData.items[0].getAsFile()], new Date().getTime() + '.png'))
        upload.submit()
      }
    },
    /**
     * 当执行 ctrl + c 或者 ctrl + v 时 ，向 文件预处理信息队列 添加需要处理的文件信息
     */
    setPreprocessing: function (type) {
      // 获取当前选中的数据
      let selectData = this.fileList.filter(res => res.select)
      if (!selectData.length) {
        // 如果没有数据选中的 ，则不执行
        return
      }
      // 清空文件预处理信息队列后，重新添加数据
      this.filePreprocessing = []
      selectData.forEach(res => {
        this.filePreprocessing.push({
          file: res,
          type: type
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
          userFileId: 0
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
        inputPattern: /^((?![\\/:*?？^`~&<>|'%]).){1,50}$/,
        inputErrorMessage: '50个字符以内，不能包含特殊字符'
      }).then(({value}) => {
        // 如果是空的
        insertFileFolder({
          userFileId: 0,
          userFileName: value,
          userFileParentId: breadcrumbs.userFileId
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
     * 页面左侧菜单栏-意见与反馈
     */
    feedbackBtn: function () {
      // 用户联系方式 默认为当前账号绑定的邮箱地址
      let userEmail = localStorage.getItem('userEmail')
      if (this.feedback.form.feedbackContact === '' && userEmail != null) {
        this.feedback.form.feedbackContact = userEmail
      }
      this.feedback.show = true
    },
    /**
     * 意见与反馈 模态框的确认按钮
     */
    feedbackSubmit: function (formName) {
      // 为表单绑定验证功能
      this.$refs[formName].validate((valid) => {
        if (valid) {
          insertFeedback({
            feedbackContact: this.feedback.form.feedbackContact,
            feedbackContent: this.feedback.form.feedbackContent
          }).then(() => {
            this.feedback.show = false
            this.feedback.form.feedbackContent = ''
            this.$message({
              type: 'success',
              message: '提交成功，我们会尽快给您答复'
            })
          }).catch((err) => {
            console.log(err)
          })
        }
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
        logout().then(() => {
          // 重置路由
          resetRouter()
          cookies.remove('userInfo')
          this.$router.push({name: 'login'})
        }).catch((err) => {
          console.log(err)
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    /**
     * 存储单位格式化
     * @param size 字节数
     */
    storageUnitFormatting: function (size) {
      if (size > 0) {
        return storageUnitConversion(size)
      }
      return '0'
    },
    /**
     * 上传成功后 增加当前已用容量信息
     * @param fileSize 文件大小(字节)
     */
    setUserCapacityInfo: function (fileSize) {
      // 获取cookie缓存中的用户信息
      let token = cookies.get('userInfo')
      if (token === undefined) {
        // 如果在未登录的情况下使用，则跳转登录页面
        this.$router.push({name: 'login'})
        return
      }
      let userInfo = JSON.parse(token)
      userInfo['userUsedCapacity'] = userInfo['userUsedCapacity'] + fileSize
      userInfo['userRemainingCapacity'] = userInfo['userRemainingCapacity'] - fileSize
      this.setUserInfoCookies(userInfo)
    },
    /**
     * 重置cookie中的用户信息
     * @param userInfo 最新的用户信息
     */
    setUserInfoCookies: function (userInfo) {
      // 重新对cookie中的用户信息赋值
      cookies.set('userInfo', userInfo)
      this.userInfo = {
        // 当前登录的用户名
        username: userInfo.userName,
        // 用户头像
        userAvatar: userInfo.userAvatar,
        // 总容量
        totalCapacity: userInfo['userTotalCapacity'],
        // 已用容量
        usedCapacity: userInfo['userUsedCapacity'],
        // 剩余容量
        remainingCapacity: userInfo['userRemainingCapacity'],
        // 已用容量的百分比
        percentageCapacity: {
          width: ((userInfo['userUsedCapacity'] / userInfo['userTotalCapacity']) * 100) + '%'
        }
      }
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
      if (file.observable == null) {
        this.uploadRequest(file.request)
      } else {
        file.status = 'uploading'
        file.state = this.fileStatusText('uploading')
        // 构建七牛云上传
        file.subscription = file.observable.subscribe(
          next => this.nextUpload(next, file.uid),
          error => this.errorUpload(error, file.uid),
          complete => this.completeUpload(complete, file.uid, file.size))
      }
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
    completeUpload (complete, uid, size) {
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
        this.setUserCapacityInfo(size)
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
        // 规定文件上传大小 最大为 20 GB
        let maxFileSize = 20 * 1024 * 1024 * 1024
        if (file.size > maxFileSize) {
          this.$message.error('单文件最大上传20GB')
          return
        }
        // 判断上传空间容量
        if (this.userInfo.remainingCapacity <= 0 || this.userInfo.remainingCapacity - file.size < 0) {
          this.$message.error('存储空间不足')
          return
        }
        let regular = /^((?![\\/:*?？^`~&<>|'%]).){1,50}$/
        if (regular.test(file.name)) {
          // 显示文件上传面板
          if (!this.displayUploadPanel) {
            this.displayUploadPanel = true
          }
          // 向上传面板中的文件列队添加新的文件数据
          this.uploadedFilesList.push({
            name: file.name,
            uid: file.uid,
            size: storageUnitConversion(file.size),
            status: 'waiting',
            state: this.fileStatusText('waiting'),
            progress: this.progressStyle(0),
            etagProgress: this.progressStyle(0),
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
      // 将文件状态重置为读取文件中
      this.uploadedFilesListFilter(request.file.uid, res => {
        res.status = 'etag'
        res.state = this.fileStatusText('etag')
        res.request = request
        res.breadcrumbs = breadcrumbs
      })
      let partList = this.createChunks(request.file)
      let sha1List = []
      // 开启一个外部线程 ，用于etag的计算
      this.worker = new Worker('/static/js/fileEtag.js')
      // 给外部线程传递消息
      this.worker.postMessage({
        partList: partList,
        fileInfo: request.file.uid,
        status: 'block'
      })
      // 接收外部Worker回传的信息
      this.worker.onmessage = e => {
        const {percent, sha1Value, status, sha1, i, fileInfo} = e.data
        sha1List[i] = sha1Value
        if (status === 'block') {
          this.uploadedFilesListFilter(fileInfo, res => {
            res.etagProgress = this.progressStyle(percent)
          })
        }
        if (percent === 100 && status !== 'success') {
          // 计算成功后 ，对计算结果进行合并处理
          this.worker.postMessage({
            partList: partList,
            fileInfo: fileInfo,
            status: 'merge',
            sha1List: sha1List
          })
        }
        if (status === 'success' && sha1 !== undefined) {
          // 将文件状态重置为读取文件中
          this.uploadedFilesListFilter(fileInfo, res => {
            // 执行上传程序
            this.getFileUpToken(sha1, res.breadcrumbs, res.request)
          })
        }
      }
    },
    /**
     * 创建文件所需要的块
     * 将大文件进行分块读取
     */
    createChunks (file) {
      const partList = []
      // 以4M为单位分割
      let blockSize = 4 * 1024 * 1024
      let blockCount = Math.ceil(file.size / blockSize)
      for (let i = 0; i < blockCount; i++) {
        // 核心是对文件的 slice
        const chunk = file.slice(i * blockSize, (i + 1) * blockSize)
        partList.push({chunk, size: chunk.size})
      }
      return partList
    },
    /**
     * 根据当前请求的文件，以及文件etag获取文件上传token
     * 执行文件上传程序
     */
    getFileUpToken (etag, breadcrumbs, request) {
      console.log('文件: ' + request.file.name + ' ' + ' 计算结果为: ' + etag)
      getToken({
        ossFileEtag: etag,
        ossFileSize: request.file.size,
        userFileName: request.file.name,
        userFileParentId: breadcrumbs.userFileId
      }).then(response => {
        // 根据返回码判断当前文件状态
        if (response.code === '201') {
          // 秒传成功 ，直接重置当前文件的状态
          this.uploadedFilesListFilter(request.file.uid, res => {
            // 调用el-upload的上传进度条事件
            request.onProgress(100)
            res.status = 'success'
            res.state = this.fileStatusText('secondPass')
            res.request = request
          })
          response.data['diskUserFile']['select'] = false
          this.fileList.unshift(response.data['diskUserFile'])
          this.setUserCapacityInfo(response.data['diskUserFile']['ossFileSize'])
        } else {
          // 执行普通上传程序
          const key = response.data.key
          const token = response.data.token
          // 构建七牛云上传
          let qiNiUp = upload(token, key, request,
            next => this.nextUpload(next, request.file.uid),
            error => this.errorUpload(error, request.file.uid),
            complete => this.completeUpload(complete, request.file.uid, request.file.size))
          // 重置当前上传文件的状态
          this.uploadedFilesListFilter(request.file.uid, res => {
            res.status = 'uploading'
            res.state = this.fileStatusText('uploading')
            res.observable = qiNiUp.observable
            res.subscription = qiNiUp.subscription
            res.request = request
            res.header = response.data
          })
        }
      }).catch(err => {
        console.log(err)
        // 重置为上传失败
        this.uploadedFilesListFilter(request.file.uid, res => {
          res.status = 'error'
          res.state = this.fileStatusText('error')
          res.request = request
          // 调用el-upload的上传失败事件
          request.onError(err.message)
        })
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
      let regular = /^((?![\\/:*?？^`~&<>|'%]).){1,50}$/
      if (!regular.test(file.name)) {
        this.$message.error('文件名50个字符以内，不能包含特殊字符')
        return false
      }
      // 规定文件上传大小 最大为 20 GB
      let maxFileSize = 20 * 1024 * 1024 * 1024
      if (file.size > maxFileSize) {
        return false
      }
      // 判断上传空间容量
      return !(this.userInfo.remainingCapacity <= 0 || this.userInfo.remainingCapacity - file.size < 0)
    },
    /**
     * 文件上传队列过滤
     * 根据uid查找对应的file对象
     * 参数:
     * uid:文件唯一标识
     * result:回调函数
     */
    uploadedFilesListFilter: function (uid, result) {
      this.uploadedFilesList.forEach(res => {
        if (res.uid === uid) {
          result(res)
        }
      })
    },
    /**
     * 状态换算
     */
    fileStatusText: function (status) {
      return {
        success: '成功',
        error: '失败',
        uploading: '上传中',
        paused: '暂停',
        waiting: '等待',
        etag: '校验MD5',
        secondPass: '秒传'
      }[status]
    },
    /**
     * 帮助面板
     */
    helpPanel: function () {
      this.$alert(
        `<div class="card-content">
                    <ul>
                      <li><strong>DEL</strong> - 删除所选的文件/文件夹</li>
                      <li><strong>CTRL + Click</strong> - 选择多个文件或目录</li>
                      <li><strong>SHIFT + Click</strong> - 连续选择多个文件或目录</li>
                      <li><strong>CTRL + A</strong> - 选择全部文件或目录</li>
                      <li><strong>CTRL + X</strong> - 剪切一个或多个文件/文件夹</li>
                      <li><strong>CTRL + C</strong> - 复制一个或多个文件/文件夹</li>
                      <li><strong>CTRL + V</strong> - 粘贴一个或多个文件/文件夹</li>
                      <li><strong>Click</strong> - 选择文件或目录</li>
                      <li><strong>Double Click</strong> - 打开文件/文件夹</li>
                      <li><strong>Click + Enter</strong> - 选中后回车打开文件/文件夹</li>
                    </ul>
                   </div>`, '帮助', {
          dangerouslyUseHTMLString: true
        }).catch(res => {
      })
    },
    /**
     * 当被拖动的对象在另一对象容器范围内拖动时触发此事件
     * @param e
     */
    dragover: function (e) {
      // 阻止拖拽的默认行为
      e.stopPropagation()
      e.preventDefault()
    },
    /**
     * 在一个拖动过程中，释放鼠标键时触发此事件
     * @param e
     */
    drop: function (e) {
      // 阻止拖拽的默认行为
      e.stopPropagation()
      e.preventDefault()
      this.fileDrag(e)
    },
    /**
     * 文件拖拽上传处理实现
     * @param e
     */
    fileDrag: function (e) {
      let upload = this.$refs.elementUpload
      if (!upload) {
        return
      }

      // 批量添加文件
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        if (e.dataTransfer.files[i].size > 0) {
          // 向文件队列中添加文件信息
          upload.handleStart(new File([e.dataTransfer.files[i]], e.dataTransfer.files[i].name))
        }
      }
      upload.submit()
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

.el-aside div {
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

.credits {
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
  font-size: .6em;
  margin: 3em 2.5em;
  color: #a5a5a5;
}

.credits > span {
  display: block;
  margin: .3em 0;
}

.credits a, .credits a:hover {
  color: inherit;
  cursor: pointer;
}

.card > div {
  padding: 1em 1em;
}

/deep/ .feedbackContent > textarea {
  height: 6em;
}

.content-bottom {
  width: 145px;
  left: 24px;
  bottom: 70px;
  padding-bottom: 28px;
  position: fixed;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.usage-progress {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  position: relative;
}

.text {
  font-size: 11px;
  line-height: 160%;
  color: var(--context_primary);
  margin-bottom: 12px;
}

.progress {
  height: 6px;
  position: absolute;
  bottom: 0;
  left: 0;
  transition-duration: 0.274778s;
  background-color: rgba(28, 175, 253, 1);
  border-radius: 100px;
}

.usage-progress::after {
  content: "";
  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: rgba(222, 223, 235, .5);
  width: 100%;
  height: 6px;
  border-radius: 100px;
}

.sider-bottom {
  height: 75px;
  width: 16em;
  position: fixed;
  bottom: 0;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-pack: center;
  justify-content: center;
  -ms-flex-direction: column;
  flex-direction: column;
  padding: 0 20px 0 24px;
}

.el-avatar.el-avatar--circle {
  float: left;
}

.user-info-name {
  line-height: 35px;
  margin-left: 16px;
  max-width: 75%;
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
}

/deep/ .uploader-file {
  height: 47px !important;
}

/deep/ .uploader-file-etag-progress {
  height: 3px !important;
  bottom: -1.5px !important;
}

.fileInfoPopupBlock {
  margin-top: 12px;
}

.fileInfoPopupBlock strong {
  display: inline-block;
  width: 100%;
  font-weight: 500;
}

.fileInfoPopupBlockValue {
  padding-left: 23px;
  color: #999;
  margin-top: 5px;
  display: inline-block;
}

.fileInfoPopupBlockSvg {
  margin-right: 2px;
  position: relative;
  top: 2px;
}

@media (max-width: 1024px) {
  main {
    width: calc(100% - 13em);
  }

  .user-info-name {
    max-width: 55%;
  }

  .el-aside, .sider-bottom {
    width: 10em !important;
  }
}

@media (min-width: 736px) {
  .action {
    cursor: pointer
  }
}

@media (max-width: 736px) {
  main {
    margin: 0 1em;
    width: calc(100% - 2em);
  }

  .layout {
    padding-bottom: 2em;
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

  .content-bottom {
    display: none !important;
  }

  .sider-bottom {
    display: none !important;
  }

  #listing.list .item .size {
    display: none !important;
  }
}

@media (max-width: 450px) {
  /deep/ .el-dialog {
    width: 84%;
  }

  /deep/ .fileInfoPopup {
    padding-bottom: 20px;
  }

  /deep/ .el-dialog__body {
    padding: 20px 20px 0 20px;
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

@media (max-width: 450px) {
  .el-message-box {
    width: 90%;
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
