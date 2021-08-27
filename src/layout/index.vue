<template>
  <div class="layout">
    <el-container>
      <!-- 头部 -->
      <el-header height="65px">
        <div class="right-logo">
          <button aria-label="切换侧边栏" title="切换侧边栏" class="action" @click="toggleSidebar">
            <i class="el-icon-more material-icons"></i>
          </button>
          <img src="/static/img/logo.png" alt="兜兜网盘">
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
            :auto-upload="false"
            :before-upload="beforeUpload"
            :http-request="uploadRequest"
            :on-progress="progressChange"
            :on-change="handleChange"
            action="https://upload-z2.qiniup.com"
          >
            <button class="action">
              <i class="el-icon-upload material-icons"></i>
            </button>
          </el-upload>
        </div>
      </el-header>
      <el-container :class="toggleSidebarClick ? 'active' : ''">
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
          <el-button aria-label="个人中心" title="个人中心" class="action" @click="setting">
            <i class="material-icons">
              <svg-icon icon-class="setting"></svg-icon>
            </i>
            <span>个人中心</span>
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
                <!-- 已用磁盘容量 -->
                {{ storageUnitFormatting(userInfo.usedDiskCapacity) }}
                /
                <!-- 总磁盘容量 -->
                {{ storageUnitFormatting(userInfo.totalDiskCapacity) }}
                <span class="expansion">
                  <a @click="getResourcePacksInfo(0)">扩容</a>
                </span>
              </div>
              <!-- 已用磁盘容量的百分比 -->
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
                       @nextPage="nextPage" @doubleClick="doubleClick" @openPayDialog="getResourcePacksInfo"
                       @ctrlC="setPreprocessing('copy')" @ctrlX="setPreprocessing('move')"
                       @previous="previous" @delete="fileDeletion" @userAvatar="setUserAvatar"></router-view>
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
        <el-button type="primary" @click="createFileShare">{{ fileSharingForm.fileSharingBtnText }}</el-button>
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
    <el-dialog title="文件详情" :visible.sync="fileInfoDialog.show"
               customClass="fileInfoPopup" width="18em" :before-close="documentDetailsClose">
      <div class="fileInfoPopup">
        <div class="fileInfoPopupPreview">
          <img v-if="fileInfoDialog.fileType === 'image' && !fileInfoDialog.forbidden" class="fileInfoPopupPreviewImg"
               :src="fileInfoDialog.userDynamicPreviewUrl" :alt="fileInfoDialog.fileName">
          <svg-icon v-else :icon-class="fileInfoDialog.mimeTypes" width="6em" height="6em" color="#8ea1ff"
                    class="fileInfoPopupPreviewSvg"></svg-icon>
        </div>
        <p class="fileInfoPopupBlock">
          <strong style="display: flex;align-items: flex-start;">
            <svg-icon icon-class="file-info-name" width="18" height="18" className="fileInfoPopupBlockSvg"></svg-icon>
            <span class="fileInfoPopupBlockText">{{ fileInfoDialog.fileName }}</span>
          </strong>
          <span class="fileInfoPopupBlockValue">{{ fileInfoDialog.fileSize }}</span>
        </p>
        <p class="fileInfoPopupBlock">
          <strong>
            <svg-icon icon-class="file-info-create" width="18" height="18" className="fileInfoPopupBlockSvg"></svg-icon>
            创建时间：
          </strong>
          <span class="fileInfoPopupBlockValue">{{ fileInfoDialog.create }}</span>
        </p>
        <p class="fileInfoPopupBlock">
          <strong>
            <svg-icon icon-class="file-info-update" width="18" height="18" className="fileInfoPopupBlockSvg"></svg-icon>
            修改时间：
          </strong>
          <span class="fileInfoPopupBlockValue">{{ fileInfoDialog.update }}</span>
        </p>
        <p class="fileInfoPopupBlock" v-if="fileInfoDialog.userDynamicPreviewUrl !== '' && !fileInfoDialog.forbidden">
          <el-button type="primary" class="file-download-btn" @click="fileDownloadBtn">
            <svg-icon icon-class="file-info-download" width="2em" height="2em"
                      className="fileInfoPopupBlockSvg"></svg-icon>
            下 载
          </el-button>
        </p>
      </div>
    </el-dialog>

    <!-- 支付的表单对象 -->
    <el-dialog :title="payment.title" customClass="pay-dialog" :visible.sync="payment.show"
               :before-close="resourcePacksDialogClose">
      <div v-if="payment.state === 0" class="pay-scene-card">
        <!-- 卡片内容 -->
        <section class="pay-section pay-product">
          <ul class="pay-product-list">
            <li v-for="(item, index) in payment.resourcePack" :key="index"
                :class="item.active ? 'pay-product-item pay-active' : 'pay-product-item'"
                @click="payProductClick(item)">
              <div v-if="item['packLabel'] !== ''" class="pay-product-item-corner">{{ item['packLabel'] }}</div>
              <div class="pay-product-item-month">{{ item['packName'] }}</div>
              <div class="pay-product-item-origin">
                <span class="pay-product-item-origin-label">￥</span>
                <span class="pay-product-item-origin-final-price">{{ item['packPrice'] / 100 }}</span>
              </div>
              <div class="pay-product-item-desc">
                <div>{{ item['packDesc'] }}</div>
              </div>
            </li>
          </ul>
        </section>
        <section class="pay-section pay-form">
          <el-form ref="form" :model="payment.form" label-width="80px">
            <el-form-item label="开通时长">
              <input-number v-model="payment.form.defaultValue" @change="paymentOpeningTimeChange" :min="1"
                               :max="9999" ref="paymentFormInputNumber"
                               :step="payment.form.defaultSelfIncrement" step-strictly></input-number>
              <span class="pay-opening-time-text">月</span>
            </el-form-item>
            <el-form-item v-if="payment.mobile" class="pay-method-form-item">
              <el-button class="pay-method-mobile-btn" @click="payMethodMobileBtnClick">支付宝支付</el-button>
            </el-form-item>
            <el-form-item v-else label="支付方式">
              <div class="pay-qrCode">
                <vue-qr :correctLevel="0" :autoColor="false" :text="payment.redirectionPayment" :size="95" :margin="0"
                        :logoMargin="0"></vue-qr>
              </div>
              <div class="pay-method-detail">
                <p class="pay-method-detail-title">使用支付宝扫码支付</p>
                <div class="pay-method-detail-svg">
                  <svg-icon width="30" height="30" icon-class="pay-method-alipay"
                            className="pay-method-alipay"></svg-icon>
                </div>
                <div class="pay-method-detail-body">
                  <span class="pay-method-detail-origin-price">
                    {{
                      ((payment.form.defaultValue / payment.form.itemPack['packMonth']) * payment.form.itemPack['packPrice']) / 100
                    }}
                  </span>元
                </div>
              </div>
            </el-form-item>
          </el-form>
        </section>
      </div>
      <div v-else-if="payment.state === 1" class="pay-modal-content">
        <!-- 扫码成功后的model -->
        <div class="pay-modal-content-icon">
          <svg-icon icon-class="pay-success" width="80" height="80" className="paySuccess"></svg-icon>
        </div>
        <h3 class="pay-modal-content-title">扫描成功</h3>
        <p class="pay-modal-content-desc">请在支付宝上完成支付</p>
        <a class="pay-modal-content-btn" @click="reselect">重新选择</a>
      </div>
      <div v-else-if="payment.state === 2" class="pay-modal-content">
        <!-- 支付成功后的model -->
        <div class="pay-modal-content-icon">
          <svg-icon icon-class="pay-success" width="80" height="80" className="paySuccess"></svg-icon>
        </div>
        <h3 class="pay-modal-content-title">支付成功</h3>
        <div class="pay-modal-content-box">
          <p class="pay-modal-content-desc">付款金额：{{
              ((payment.form.defaultValue / payment.form.itemPack['packMonth']) * payment.form.itemPack['packPrice']) / 100
            }}元</p>
          <p class="pay-modal-content-desc">商品信息：{{
              `${payment.form.itemPack['packName']}${payment.form.itemPack['packType'] === 0 ? '扩容包' : '流量包'} · ${payment.form.defaultValue}个月`
            }}</p>
          <p class="pay-modal-content-desc">到期时间：{{ estimatedExpirationTime() }}</p>
        </div>
      </div>
    </el-dialog>

    <!-- 文件 复制、移动 时选择目标文件夹的面板 -->
    <file-card v-if="fileCard.show" :card-title="fileCard.title" :card-breadcrumbs="fileCard.cardBreadcrumbs"
               @card-close="cardClose" @card-confirm="cardConfirm"
               @card-folder-previous="cardFolderPrevious" @card-folder-next="cardFolderNext"></file-card>

    <!-- 手机模式下 切换左边菜单栏按钮点击时的model -->
    <div v-if="toggleSidebarClick" class="el-image-viewer__mask" style="z-index: 1000;position: fixed;"
         @click="toggleSidebar"></div>

  </div>
</template>

<script>
import {logout} from '@/api/login'
import {getToken, upload} from '@/api/qiniu'
import {getDiskUserToSession} from '@/api/user'
import {resourcePackSearch, resourcePackToken, resourcePackTokenState} from '@/api/pack'
import {paymentAddress, alipayWap} from '@/api/payment'
import {validEmail} from '@/utils/validate'
import {search, insertFileFolder, deleteFile, renameFile, copyFile, moveFile} from '@/api/file'
import {createShare} from '@/api/share'
import {insertFeedback} from '@/api/feedback'
import {resetRouter} from '@/router/index'
import VueQr from 'vue-qr'
import cookies from 'js-cookie'
import uploader from '@/components/upload/uploader'
import fileCard from '@/components/fileCard/fileCard'
import inputNumber from '@/components/inputNumer/index'
import {storageUnitConversion, formatDate, fileCategory, mimeTypes, clipboard, downloadByUrl} from '@/utils/utils'

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
      // 文件最大同时上传数量控制(作为常量控制，从0开始)
      maxUpload: 2,
      // 是否显示当前文件上传面板
      displayUploadPanel: false,
      // 是否显示文件分享的对话框
      showFileSharingDialog: false,
      // 是否显示文件分享的请求结果
      showFileSharingRequestResults: false,
      // 切换侧边栏的点击动作标识
      toggleSidebarClick: false,
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
        // 文件分享按钮显示文字
        fileSharingBtnText: '确 定',
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
      // 文件详情Dialog弹窗对象
      fileInfoDialog: {
        // 是否显示弹窗
        show: false,
        // 文件名称
        fileName: '',
        // 文件大小
        fileSize: '',
        // 创建时间
        create: '',
        // 更新时间
        update: '',
        // 是否为文件夹
        fileFolder: '',
        // 文件是否被禁用
        forbidden: '',
        // 文件类型
        fileType: '',
        // 文件mime类型
        mimeTypes: '',
        // 动态预览url
        userDynamicPreviewUrl: '',
        // 动态下载Url
        userDynamicDownloadUrl: '',
        // 用户剩余流量
        userRemainingTraffic: '',
        // 文件数据
        fileData: ''
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
        // 总磁盘容量
        totalDiskCapacity: '',
        // 已用磁盘容量
        usedDiskCapacity: '',
        // 剩余磁盘容量
        remainingDiskCapacity: '',
        // 已用容量的百分比
        percentageCapacity: {}
      },
      // 购买资源包dialog对象信息
      payment: {
        // 是否显示当前dialog弹窗对象
        show: false,
        // 当前dialog标题
        title: '',
        // 当前发起请求的对象是否为手机
        mobile: false,
        // 当前选中的资源包所对应的token信息(5分钟有效期)
        token: '',
        // 根据当前token构建二维码的地址
        redirectionPayment: '',
        // 当前token所属状态
        state: 0,
        // 当前执行的timeout对象
        timeout: null,
        // 购买资源包时的表单
        form: {
          // 当前选中的资源包对象
          itemPack: {},
          // 开通时长默认值
          defaultValue: 1,
          // 开通时长默认自增值
          defaultSelfIncrement: 1
        },
        // 资源包对象
        resourcePack: []
      }
    }
  },
  components: {
    uploader, fileCard, inputNumber, VueQr
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
    // 从缓存中获取当前登录的用户信息
    getDiskUserToSession().then((response) => {
      this.setUserInfoCookies(response.data.userInfo)
    }).catch((err) => {
      console.log(err)
    })
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
      // 判断上传空间容量，用户当前可用总容量 - 用户当前已经使用的容量 < 0
      if (this.userInfo['userTotalDiskCapacity'] - this.userInfo['userUsedDiskCapacity'] < 0) {
        this.$message({
          showClose: true,
          message: '存储空间不足，无法分享',
          type: 'error'
        })
        return
      }
      this.fileSharingForm.fileSharingBtnText = '确 定'
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
      // 判断上传空间容量，用户当前可用总容量 - 用户当前已经使用的容量 < 0
      if (this.userInfo['userTotalDiskCapacity'] - this.userInfo['userUsedDiskCapacity'] < 0) {
        this.$message({
          showClose: true,
          message: '存储空间不足，无法分享',
          type: 'error'
        })
        return
      }
      if (this.showFileSharingRequestResults) {
        this.showFileSharingDialog = false
        this.showFileSharingRequestResults = false
        let response = this.fileSharingForm.fileSharingRequestResults
        // 向剪切板复制分享链接
        clipboard(this.userInfo.username + '向您分享了' + response['shareFileName'] + '，您打开链接后可以享受不限速下载' +
          '\n链接：' + response['shareShortUrl'] +
          '\n有效期：' + response['periodOfValidity'] + (response['shareCode'] === '' ? '' : '\n提取码：' + response['shareCode']))
        // 复制成功的提示框
        this.$message({
          showClose: true,
          type: 'success',
          message: '复制到剪切板了，粘贴给您的朋友吧~'
        })
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
        this.fileSharingForm.fileSharingBtnText = '复 制'
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
            selectData[0].userDynamicPreviewUrl = response['data'].userDynamicPreviewUrl
            // 成功的提示框
            this.$message({
              showClose: true,
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
            showClose: true,
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

      // 获取cookie缓存中的用户信息
      let token = cookies.get('userInfo')
      if (token === undefined) {
        // 如果在未登录的情况下使用，则跳转登录页面
        this.$router.push({name: 'login'})
        return
      }
      let userInfo = JSON.parse(token)

      this.fileInfoDialog = {
        // 是否显示弹窗
        show: true,
        // 文件名称
        fileName: selectData[0]['userFileName'],
        // 文件大小
        fileSize: storageUnitConversion(selectData[0]['ossFileSize']),
        // 创建时间
        create: selectData[0]['createTime'],
        // 更新时间
        update: selectData[0]['updateTime'],
        // 是否为文件夹
        fileFolder: selectData[0]['fileFolder'],
        // 文件是否被禁用
        forbidden: selectData[0]['forbidden'],
        // 文件类型
        fileType: fileCategory(selectData[0]['ossFileMimeType']),
        // 文件mime类型
        mimeTypes: selectData[0]['forbidden'] ? 'file-forbidden' : mimeTypes(selectData[0]['ossFileMimeType']),
        // 动态预览url
        userDynamicPreviewUrl: selectData[0]['userDynamicPreviewUrl'],
        // 动态下载Url
        userDynamicDownloadUrl: selectData[0]['userDynamicDownloadUrl'],
        // 用户剩余流量
        userRemainingTraffic: userInfo['userRemainingTraffic'],
        // 文件数据
        fileData: selectData[0]
      }

      // 如果当前剩余流量不足以抵扣本次下载，则提示异常信息
      if ((userInfo['userRemainingTraffic'] - selectData[0]['ossFileSize']) < 0) {
        this.fileInfoDialog.fileType = 'unknown'
        this.fileInfoDialog.forbidden = true
        this.fileInfoDialog.userDynamicPreviewUrl = ''
      }
    },
    /**
     * 文件下载按钮事件
     */
    fileDownloadBtn: function () {
      // 获取cookie缓存中的用户信息
      let token = cookies.get('userInfo')
      if (token === undefined) {
        // 如果在未登录的情况下使用，则跳转登录页面
        this.$router.push({name: 'login'})
        return
      }
      let userInfo = JSON.parse(token)

      // 如果当前剩余流量不足以抵扣本次下载，则提示异常信息
      if ((userInfo['userRemainingTraffic'] - this.fileInfoDialog.fileData.ossFileSize) < 0) {
        this.$message({
          showClose: true,
          message: '当前可用流量不足，无法下载',
          type: 'error'
        })
        return
      }

      // 重置用户当前流量信息
      userInfo['userUsedTraffic'] = userInfo['userUsedTraffic'] + this.fileInfoDialog.fileData.ossFileSize
      userInfo['userRemainingTraffic'] = userInfo['userRemainingTraffic'] - this.fileInfoDialog.fileData.ossFileSize
      // 重新对cookie中的用户信息赋值
      cookies.set('userInfo', userInfo)
      // 文件下载
      downloadByUrl(this.fileInfoDialog.userDynamicDownloadUrl, this.fileInfoDialog.fileName)
    },
    /**
     * 文件详情弹窗关闭前回调事件
     */
    documentDetailsClose: function (done) {
      if (done !== false) {
        this.fileInfoDialog = {
          // 是否显示弹窗
          show: false,
          // 文件名称
          fileName: '',
          // 文件大小
          fileSize: '',
          // 创建时间
          create: '',
          // 更新时间
          update: '',
          // 是否为文件夹
          fileFolder: '',
          // 文件是否被禁用
          forbidden: '',
          // 文件类型
          fileType: '',
          // 文件mime类型
          mimeTypes: '',
          // 动态预览url
          userDynamicPreviewUrl: '',
          // 动态下载Url
          userDynamicDownloadUrl: '',
          // 用户剩余流量
          userRemainingTraffic: '',
          // 文件数据
          fileData: ''
        }
      }
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
        if (this.userInfo.remainingDiskCapacity <= 0 || this.userInfo.remainingDiskCapacity - fileSize < 0) {
          this.$message({
            showClose: true,
            message: '存储空间不足',
            type: 'error'
          })
          return
        }
        copyFile({
          copyFileInfo: operationFileInfo,
          targetFileId: currentlySelectedValue
        }).then((response) => {
          console.log(response)
          // 复制成功的提示框
          this.$message({
            showClose: true,
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
            showClose: true,
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
        if (this.userInfo.remainingDiskCapacity <= 0 || this.userInfo.remainingDiskCapacity - fileSize < 0) {
          this.$message({
            showClose: true,
            message: '存储空间不足',
            type: 'error'
          })
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
            showClose: true,
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
            showClose: true,
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
      this.toggleSidebarClick = false
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
      this.toggleSidebarClick = false
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
            showClose: true,
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
      this.toggleSidebarClick = false
      if (this.$route.path !== '/share-record') {
        this.$router.push({name: 'share-record'})
      }
    },
    /**
     * 页面左侧菜单栏-意见与反馈
     */
    feedbackBtn: function () {
      this.toggleSidebarClick = false
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
              showClose: true,
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
      this.toggleSidebarClick = false
      if (this.$route.path !== '/setting') {
        this.$router.push({name: 'setting'})
      }
    },
    /**
     * 页面左侧菜单栏-退出登录
     */
    logout: function () {
      this.toggleSidebarClick = false
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
     * 手机端切换侧边栏
     */
    toggleSidebar: function () {
      this.toggleSidebarClick = !this.toggleSidebarClick
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
      userInfo['userUsedDiskCapacity'] = userInfo['userUsedDiskCapacity'] + fileSize
      userInfo['userRemainingDiskCapacity'] = userInfo['userRemainingDiskCapacity'] - fileSize
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
        totalDiskCapacity: userInfo['userTotalDiskCapacity'],
        // 已用容量
        usedDiskCapacity: userInfo['userUsedDiskCapacity'],
        // 剩余容量
        remainingDiskCapacity: userInfo['userRemainingDiskCapacity'],
        // 已用容量的百分比
        percentageCapacity: {
          width: ((userInfo['userUsedDiskCapacity'] / userInfo['userTotalDiskCapacity']) * 100) + '%',
          maxWidth: '100%'
        }
      }
    },
    /**
     * 重置用户头像信息
     */
    setUserAvatar: function () {
      // 获取cookie缓存中的用户信息
      let token = cookies.get('userInfo')
      if (token === undefined) {
        // 如果在未登录的情况下使用，则跳转登录页面
        this.$router.push({name: 'login'})
        return
      }
      let userInfo = JSON.parse(token)
      userInfo.userAvatar = userInfo.userAvatar + '?' + new Date().getTime()
      this.userInfo.userAvatar = userInfo.userAvatar
      this.setUserInfoCookies(userInfo)
    },
    // ============================== 文件上传部分方法
    /**
     * 上传暂停事件
     */
    pause (file) {
      file.status = 'paused'
      file.state = this.fileStatusText('paused')
      if (file.subscription != null) {
        file.subscription.unsubscribe()
      }
      this.eleUpload()
    },
    /**
     * 上传开始事件
     */
    resume (file) {
      file.status = 'waiting'
      file.state = this.fileStatusText('waiting')
      // 获取当前正在上传的文件数量
      let uploading = this.uploadedFilesList.filter(item => item.status === 'etag' || item.status === 'uploading')
      if (uploading.length <= this.maxUpload) {
        if (file.observable == null) {
          this.$refs.elementUpload.$refs['upload-inner'].upload(file.raw)
        } else {
          file.status = 'uploading'
          file.state = this.fileStatusText('uploading')
          // 构建七牛云上传
          file.subscription = file.observable.subscribe(
            next => this.nextUpload(next, file.uid),
            error => this.errorUpload(error, file.uid),
            complete => this.completeUpload(complete, file.uid, file.size))
        }
      }
    },
    /**
     * 上传删除事件
     */
    remove (file) {
      // 删除之前先暂停当前上传
      this.pause(file)
      // 删除 element 上传组件维护的上传列队
      this.$refs.elementUpload.handleRemove(file)
      // 删除当前上传列队中的文件数据
      this.uploadedFilesList.splice(this.uploadedFilesList.findIndex(item => item.uid === file.uid), 1)
    },
    /**
     * 上传重试事件
     */
    retry (file) {
      // 先删除 element 上传组件维护的上传列队
      this.$refs.elementUpload.handleRemove(file)
      // 再 push 一条记录
      this.$refs.elementUpload.uploadFiles.push({
        status: 'ready',
        name: file.name,
        size: file.request.file.size,
        percentage: 0,
        uid: file.uid,
        raw: file.request.file
      })
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
      this.eleUpload()
    },
    /**
     * 上传成功时返回
     */
    completeUpload (complete, uid, size) {
      this.eleUpload()
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
        let uploadComplete = this.uploadedFilesList
          .filter(item => item.status === 'waiting' || item.status === 'etag' || item.status === 'uploading')
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
          this.$message({
            showClose: true,
            message: '单文件最大上传20GB',
            type: 'error'
          })
          return
        }
        // 判断上传空间容量
        if (this.userInfo.remainingDiskCapacity <= 0 || this.userInfo.remainingDiskCapacity - file.size < 0) {
          this.$message({
            showClose: true,
            message: '存储空间不足',
            type: 'error'
          })
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
            raw: file.raw,
            size: storageUnitConversion(file.size),
            status: 'waiting',
            state: this.fileStatusText('waiting'),
            progress: this.progressStyle(0),
            etagProgress: this.progressStyle(0),
            icon: this.fileCategory(file.name.split('.').pop().toLowerCase(), file.raw.type.split('/')[0])
          })
          // 获取当前正在上传的文件数量
          let uploading = this.uploadedFilesList.filter(item => item.status === 'etag' || item.status === 'uploading')
          if (uploading.length <= this.maxUpload) {
            this.$refs.elementUpload.$refs['upload-inner'].upload(file.raw)
          }
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
        // 调用el-upload的上传进度条事件
        request.onProgress(0)
      })
      let partList = this.createChunks(request.file)
      let sha1List = []
      // 开启一个外部线程 ，用于etag的计算
      let worker = new Worker('/static/js/fileEtag.js')
      // 给外部线程传递消息
      worker.postMessage({
        partList: partList,
        fileInfo: request.file.uid,
        status: 'block'
      })
      // 接收外部Worker回传的信息
      worker.onmessage = e => {
        const {percent, sha1Value, status, sha1, i, fileInfo} = e.data
        sha1List[i] = sha1Value
        if (status === 'block') {
          this.uploadedFilesListFilter(fileInfo, res => {
            res.etagProgress = this.progressStyle(percent)
          })
        }
        if (percent === 100 && status !== 'success') {
          // 计算成功后 ，对计算结果进行合并处理
          worker.postMessage({
            partList: partList,
            fileInfo: fileInfo,
            status: 'merge',
            sha1List: sha1List
          })
        }
        if (status === 'success' && sha1 !== undefined) {
          // 将文件状态重置为读取文件中
          this.uploadedFilesListFilter(fileInfo, res => {
            // 关闭worker线程
            worker.terminate()
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
          this.eleUpload()
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
        this.eleUpload()
      })
    },
    /**
     * element 手动调用上传组件
     */
    eleUpload () {
      let uploading = this.uploadedFilesList.filter(item => item.status === 'etag' || item.status === 'uploading')
      if (!uploading.length || uploading.length <= this.maxUpload) {
        // 过滤出其中待上传的文件数据
        let waitingUpload = this.uploadedFilesList.filter(item => item.status === 'waiting')
        if (!waitingUpload.length) {
          return
        }
        if (waitingUpload[0].observable == null) {
          this.$refs.elementUpload.$refs['upload-inner'].upload(waitingUpload[0].raw)
        } else {
          waitingUpload[0].status = 'uploading'
          waitingUpload[0].state = this.fileStatusText('uploading')
          // 构建七牛云上传
          waitingUpload[0].subscription = waitingUpload[0].observable.subscribe(
            next => this.nextUpload(next, waitingUpload[0].uid),
            error => this.errorUpload(error, waitingUpload[0].uid),
            complete => this.completeUpload(complete, waitingUpload[0].uid, waitingUpload[0].size))
        }
      }
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
        this.$message({
          showClose: true,
          message: '文件名50个字符以内，不能包含特殊字符',
          type: 'error'
        })
        return false
      }
      // 规定文件上传大小 最大为 20 GB
      let maxFileSize = 20 * 1024 * 1024 * 1024
      if (file.size > maxFileSize) {
        return false
      }
      // 判断上传空间容量
      return !(this.userInfo.remainingDiskCapacity <= 0 || this.userInfo.remainingDiskCapacity - file.size < 0)
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
      this.toggleSidebarClick = false
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
                      <li><strong>Click</strong> - 选择或者打开文件/文件夹</li>
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
      if (this.$route.path === '/home') {
        // 阻止拖拽的默认行为
        e.stopPropagation()
        e.preventDefault()
      }
    },
    /**
     * 在一个拖动过程中，释放鼠标键时触发此事件
     * @param e
     */
    drop: function (e) {
      if (this.$route.path === '/home') {
        // 阻止拖拽的默认行为
        e.stopPropagation()
        e.preventDefault()
        this.fileDrag(e)
      }
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
      this.eleUpload()
    },
    // ============================== 支付块 ==============================
    /**
     * 获取资源包信息
     * @param packType {Number} 资源包类型(0:容量包，1:流量包)
     */
    getResourcePacksInfo: function (packType) {
      this.toggleSidebarClick = false
      // 获取后台配置的容量包信息
      resourcePackSearch({
        page: 1,
        pageSize: 100,
        packType: packType
      }).then(response => {
        let resourcePack = []
        response.data['diskResourcePack'].forEach((res, index) => {
          res.active = index === 0
          resourcePack.push(res)
        })

        this.payment = {
          // 是否显示当前dialog弹窗对象
          show: true,
          // 当前dialog抬头
          title: packType === 0 ? '购买网盘扩容包' : '购买流量包',
          // 当前发起请求的对象是否为手机
          mobile: response.data.mobile,
          // 当前选中的资源包所对应的token信息(5分钟有效期)
          token: response.data.token,
          // 根据当前token构建二维码的地址
          redirectionPayment: paymentAddress(response.data.token),
          // 当前token所属状态
          state: 0,
          // 当前执行的timeout对象
          timeout: null,
          // 购买资源包时的表单
          form: {
            // 当前选中的资源包对象
            itemPack: resourcePack[0],
            // 开通时长默认值
            defaultValue: resourcePack[0]['packMonth'],
            // 开通时长默认自增值
            defaultSelfIncrement: resourcePack[0]['packMonth']
          },
          // 资源包对象
          resourcePack: resourcePack
        }
        // 获取当前资源包的状态
        this.getResourcePackTokenState()
      }).catch((err) => {
        console.log(err)
      })
    },
    /**
     * 资源包Dialog弹窗关闭事件
     * @param done
     */
    resourcePacksDialogClose: function (done) {
      if (done !== false) {
        this.$emit('update:visible', false)
        this.$emit('close')
        this.payment.show = false
        this.payment.title = ''
        if (this.payment.timeout !== null) {
          clearTimeout(this.payment.timeout)
        }
      }
    },
    /**
     * 获取一个新的资源包支付token
     * 重置用于支付的token
     */
    paymentTokenRequest: function () {
      if (!this.payment.show) {
        return
      }
      if (this.payment.state === 0 || this.payment.state === 3) {
        resourcePackToken({
          packId: this.payment.form.itemPack.packId,
          number: this.payment.form.defaultValue
        }).then(response => {
          console.log(response)
          this.payment.token = response.data.token
          // 根据当前token构建二维码的地址
          this.payment.redirectionPayment = paymentAddress(response.data.token)
          this.payment.state = response.data.state
          // 获取当前资源包的状态
          this.getResourcePackTokenState()
        }).catch((err) => {
          console.log(err)
        })
      }
    },
    /**
     * 用于字符的资源被点击时执行的事件
     * @param {Object} item 被点击的对象
     */
    payProductClick: function (item) {
      let that = this

      // 获取到当前已经被选中的对象
      let selectData = that.payment.resourcePack.filter(res => res.active)[0]
      if (selectData === undefined || selectData === null) {
        return
      }

      // 判断当前选中的与被点击的是否为同一个对象，同时当前状态是被选中的状态
      if (selectData.packId === item.packId && (selectData.active && item.active)) {
        return
      }

      that.payment.resourcePack.forEach(res => {
        if (res.packId === item.packId) {
          res.active = true
          // 当前选中的资源包对象
          that.payment.form = {
            // 当前选中的资源包对象
            itemPack: res,
            // 开通时长默认值
            defaultValue: res['packMonth'],
            // 开通时长默认自增值
            defaultSelfIncrement: res['packMonth']
          }
        } else {
          res.active = false
        }
      })
      this.paymentTokenRequest()
    },
    /**
     * 资源包表单-开通时长 input change 绑定值被改变时触发事件
     * @param newVal 新值
     * @param oldVal 旧值
     */
    paymentOpeningTimeChange: function (newVal, oldVal) {
      this.paymentTokenRequest()
    },
    /**
     * 获取当前资源包的状态
     */
    getResourcePackTokenState: function () {
      if (this.payment.timeout !== null) {
        clearTimeout(this.payment.timeout)
      }
      this.payment.timeout = setTimeout(() => {
        if (this.payment.token === '' || this.payment.token === undefined) {
          return
        }
        // 当前token的状态等于 0 或者 1 的时候，持续的去获取当前token状态(0:初始状态 1:扫码成功)
        if (this.payment.state === 0 || this.payment.state === 1) {
          resourcePackTokenState(this.payment.token).then(response => {
            this.payment.state = response.data.state
            // token不存在
            if (response.data.state === 3) {
              this.paymentTokenRequest()
              return
            }
            // 订单支付成功
            if (response.data.state === 2) {
              this.setUserInfoCookies(response.data.userInfo)
              return
            }
            // 递归回调自己
            this.getResourcePackTokenState()
          }).catch((err) => {
            console.log(err)
          })
        }
      }, 2000)
    },
    /**
     * 手机支付时支付按钮的点击事件
     */
    payMethodMobileBtnClick: function () {
      alipayWap(this.payment.token).then(response => {
        window.location.href = response.data['paymentRequestUrl']
      }).catch((err) => {
        console.log(err)
      })
    },
    /**
     * 预计的用户资源包过期时间
     * @returns {string} 返回一个过期时间
     */
    estimatedExpirationTime: function () {
      let currentDate = new Date()
      currentDate.setMonth(currentDate.getMonth() + this.payment.form.defaultValue)
      return `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`
    },
    /**
     * 扫码成功后的重新选择
     */
    reselect: function () {
      this.payment.state = 0
      // 重新获取一个token
      this.paymentTokenRequest()
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

.el-badge {
  border-bottom: 0 !important;
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

.expansion {
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
  color: #09AAFF;
  text-align: right;
  float: right;
}

/deep/ .pay-dialog {
  width: 800px;
}

.pay-product-item-desc {
}

.pay-product-item-desc div {
  display: inline-block;
  width: 90%;
}

.expansion a, .expansion a:hover {
  color: inherit;
  cursor: pointer;
  text-align: right;
  border: 0;
}

.pay-scene-card {
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
}

.pay-product-list {
  display: flex;
  padding: 0 15px;
}

.pay-product-list .pay-product-item.pay-active {
  border-color: rgba(255, 58, 58, .75);
}

.pay-product-list .pay-product-item {
  -webkit-box-flex: 1;
  -webkit-flex: 1;
  flex: 1;
  border: 2px solid #eee;
  border-radius: 10px;
  height: 148px;
  margin: 0 5px;
  position: relative;
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, .08);
}

.pay-product-item {
  padding: 0;
  list-style: none;
}

.pay-product-list .pay-product-item.pay-active .pay-product-item-corner {
  left: -2px;
}

.pay-product-list .pay-product-item-corner {
  position: absolute;
  left: 0;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pay-product-list .pay-product-item-corner {
  background-image: -webkit-linear-gradient(left, #ff5a4c, #ff1d12);
  background-image: linear-gradient(90deg, #ff5a4c, #ff1d12);
  border-radius: 10px 10px 10px 0;
  top: -8px;
  color: #fff;
  line-height: 26px;
  height: 26px;
  padding: 0 8px;
  max-width: 85%;
  box-sizing: border-box;
}

.pay-product-list .pay-product-item-origin {
  color: #ff3a3a;
  text-align: center;
  vertical-align: text-bottom;
  line-height: 36px;
}

.pay-product-list .pay-product-item-origin-label {
  font-size: 20px;
}

.pay-product-list .pay-product-item-origin {
  color: #ff3a3a;
  text-align: center;
  vertical-align: text-bottom;
  line-height: 36px;
}

.pay-product-list .pay-product-item-origin-final-price {
  font-size: 30px;
  font-weight: 500;
}

.pay-product-list .pay-product-item-origin {
  color: #ff3a3a;
  text-align: center;
  vertical-align: text-bottom;
  line-height: 36px;
}

.pay-product-list .pay-product-item-month {
  text-align: center;
  width: 100%;
  padding-top: 29px;
  font-size: 17px;
  font-weight: 700;
  color: #000000;
}

.pay-product-list .pay-product-item-desc {
  font-size: 14px;
  color: #999;
  text-align: center;
  max-width: 80%;
  margin: 0 auto;
}

.pay-opening-time-text {
  margin: 7px;
}

.pay-qrCode {
  display: inline-block;
  position: absolute;
  width: 100px;
  height: 100px;
}

.pay-qrCode img {
  width: 100%;
  max-width: 100%;
  border: 0;
}

.pay-method-detail {
  display: inline-block;
  padding-left: 120px;
  width: 100%;
  font-size: 14px;
  vertical-align: top;
  height: 100px;
}

.pay-method-detail .pay-method-detail-title {
  font-size: 14px;
  line-height: 14px;
  color: #333;
  padding: 0;
  margin: 0;
}

.pay-method-detail .pay-method-detail-svg {
  margin-top: 10px;
  height: 18px;
}

.pay-method-detail .pay-method-alipay {
  display: inline-block;
  height: 100%;
  max-width: 100%;
  border: 0;
  margin-right: 10px;
}

.pay-method-detail .pay-method-detail-body {
  margin-top: 18px;
  color: #333;
}

.pay-method-detail .pay-method-detail-body .pay-method-detail-origin-price {
  font-size: 44px;
  line-height: 44px;
}

.pay-modal-content {
  font-size: 12px;
  color: #333;
  padding-bottom: 40px;
}

.pay-modal-content .pay-modal-content-icon {
  padding-top: 40px;
  padding-bottom: 10px;
  text-align: center;
  font-size: 12px;
  color: #333;
}

.pay-modal-content .pay-modal-content-icon img {
  width: 48px;
  text-align: center;
  font-size: 12px;
  color: #333;
  max-width: 100%;
  border: 0;
}

.pay-modal-content .pay-modal-content-title {
  font-size: 23px;
  color: #333;
  text-align: center;
  font-weight: 400;
  padding: 0;
  margin: 6px 0;
}

.pay-modal-content .pay-modal-content-desc {
  font-size: 12px;
  color: #333;
  text-align: center;
  margin-top: 10px;
  padding: 0;
}

.pay-modal-content .pay-modal-content-btn {
  background-image: linear-gradient(-133deg, #fb5758, #ff8063);
  border-radius: 80px;
  color: #fff;
  text-align: center;
  padding: 9px 45px;
  display: block;
  width: 31%;
  margin: 40px auto 0;
  cursor: pointer;
  font-size: 15px;
}

.pay-modal-content-box {
  width: 200px;
  margin-top: 20px;
  margin-left: 334px;
}

.pay-modal-content-box p {
  text-align: left;
}

.pay-modal-content .pay-modal-content-box .pay-modal-content-desc {
  text-align: left;
  font-size: 13px;
  color: #666;
}

.card > div {
  padding: 1em 1em;
}

/deep/ .feedbackContent > textarea {
  height: 6em;
}

.content-bottom {
  width: 14em;
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
  z-index: 1;
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
  margin-left: 10px;
  max-width: 77%;
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
  vertical-align: middle !important;
  position: relative;
  top: 0;
}

/deep/ .fileInfoPopup > .el-dialog__body {
  padding: 20px;
}

.fileInfoPopupPreview {
  text-align: center;
  margin: 0 auto 12%;
  width: 140px;
  height: 111px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fileInfoPopupPreviewImg {
  max-height: 100%;
}

.fileInfoPopupPreviewSvg {
  position: relative;
  top: 6%;
}

.fileInfoPopupBlockText {
  display: inline-block;
  width: 85%;
  margin-left: 2%;
}

.file-download-btn {
  width: 100%;
}

header > div:first-child > .action {
  display: none;
}

header > div:first-child > .action, header img {
  margin-right: 1em;
}

.active > aside {
  left: 0;
  width: 16em !important;
}

.active > .content-bottom {
  left: 24px;
  z-index: 100000;
}

.active > .sider-bottom {
  left: 0;
  z-index: 100000;
}

@media (max-width: 1024px) {
  main {
    width: calc(100% - 13em);
  }

  .user-info-name {
    max-width: 55%;
  }

  .content-bottom {
    width: 9em !important;
  }

  .sider-bottom {
    width: 15em !important;
  }

  .el-aside {
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

  .right-logo img {
    display: none;
  }

  header > div:first-child > .action {
    display: inherit;
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
    transition: left .3s ease;
    left: -17em;
  }

  .content-bottom {
    -webkit-transition: left .1s ease;
    transition: left .3s ease;
    left: -17em;
  }

  .sider-bottom {
    -webkit-transition: left .1s ease;
    transition: left .3s ease;
    left: -17em;
  }

  #listing.list .item .size {
    display: none !important;
  }
}

@media (max-width: 450px) {
  /deep/ .el-dialog {
    width: 84%;
  }

  /deep/ .el-dialog__body {
    padding: 20px 20px 0 20px;
  }

  /deep/ .pay-dialog .el-dialog__body {
    padding: 20px 0;
  }
  /deep/ .pay-dialog .el-dialog__body .pay-scene-card {
    padding: 0 10px;
  }
  .pay-product-list {
    padding: 0;
  }

  .pay-section.pay-product {
    width: 99%;
    overflow-x: scroll;
  }

  .pay-product-list {
    display: block;
    justify-content: space-between;
    width: calc(680px);
  }

  .pay-product-list .pay-product-item {
    width: 160px;
    float: left;
    flex: auto;
    height: 100px;
  }

  .pay-product-list .pay-product-item-desc {
    max-width: 90%;
  }

  .pay-modal-content {
    padding-bottom: 0
  }

  .pay-modal-content .pay-modal-content-btn {
    width: 68%;
  }

  .pay-modal-content-box {
    margin-left: 83px;
  }

  .pay-modal-content .pay-modal-content-icon {
    padding-top: 0;
  }

  .pay-product-list .pay-product-item-month {
    padding-top: 10px;
  }

  /deep/ .el-input-number {
    width: 135px;
  }

  .pay-section.pay-form {
    margin-top: 10px;
  }

  /deep/ .pay-method-form-item .el-form-item__content {
    margin-left: 5% !important;
    width: 90%;
  }

  .pay-method-mobile-btn {
    width: 100%;
    background: rgb(68, 123, 252);
    color: #fff;
    border: none;
  }
}

</style>
<style>

.openPayDialog {
  z-index: 5000 !important;
}

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
