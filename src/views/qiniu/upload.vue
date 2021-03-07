<template>
  <div>

    <el-upload
      class="sc"
      title="上传文件"
      ref="upload"
      :data="dataObj"
      :multiple="true"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="uploadRequest"
      :on-progress="progressChange"
      :on-change="handleChange"
      action="https://upload.qiniup.com"
    >
      <button class="upload-button">
        <i class="el-icon-upload material-icons"></i>
      </button>
    </el-upload>

    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
      <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>

    <div style="width:400px;margin:100px auto;">
      <div class="con">
        <div class="same_module">
          <div
            class="title up"
            @click="slide($event)"
          ><span>标题一</span><i class="arrow"></i></div>
          <div
            class="detail"
            style="height:0"
          >
            <div class="inner">
              <p>这是一段文本</p>
              <p>这是一段文本</p>
              <p>这是一段文本</p>
              <p>这是一段文本</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <font-awesome-icon icon="fas fa-camera" /> -->

    <el-dialog
      :visible.sync="dialogVideo"
      id="dplayer"
      ref="dplayer"
    >
    </el-dialog>

    <el-button @click="button">播放</el-button>
    <uploader
      ref="uploader"
      :file-list="fileList"
      @pause="pause"
      @resume="resume"
    ></uploader>
  </div>
</template>

<script>
import { getToken, upload } from '@/api/qiniu'
import { storageUnitConversion } from '@/utils/utils'
import DPlayer from 'dplayer'
import uploader from '@/components/upload/uploader'
// 获取七牛token 后端通过Access Key,Secret Key,bucket等生成token
// 七牛官方sdk https://developer.qiniu.com/sdk#official-sdk

export default {
  data () {
    return {
      dataObj: { token: '', key: '' },
      image_uri: [],
      fileList: [],
      player: null,
      file: [],
      dialogVideo: false
    }
  },
  components: {
    uploader
  },
  mounted: function () {

  },
  methods: {
    slide: function (event) {
      let curTarget = event.currentTarget
      let containsCurClass = curTarget.classList.contains('up')
      let nextSibling = curTarget.nextSibling
      while (nextSibling.nodeType === 3 && /\s/.test(nextSibling.nodeValue)) {
        nextSibling = nextSibling.nextSibling
      };
      let detailScrollHeight = nextSibling.scrollHeight
      if (containsCurClass) {
        curTarget.classList.remove('up')
        this.toggleSlide(nextSibling, detailScrollHeight, '500')
      } else {
        curTarget.classList.add('up')
        this.toggleSlide(nextSibling, 0, '500')
      }
    },
    toggleSlide: function (dom, height, time) {
      dom.style.transition = 'height ' + time + 'ms'
      dom.style.height = height + 'px'
    },
    button: function () {
      console.log(document.getElementById('dplayer'))
      this.dialogVideo = true
      this.player = new DPlayer({
        ontainer: document.getElementById('dplayer'),
        screenshot: true,
        volume: 1,
        playbackSpeed: [0.5, 1, 1.25, 1.5, 2, 2.5, 3, 4],
        contextmenu: [{}],
        video: {
          url: ''
        }
      })
    },
    uploadRequest: function (request) {
      console.log(request)
      console.log(request.file.name)
      getToken({
        fileName: request.file.name,
        fileParentId: 0
      }).then(response => {
        const key = response.data.key
        const token = response.data.token
        let subscription = upload(
          token,
          key,
          request,
          next => {
            let total = next.total
            console.log(total)
            request.onProgress(total.percent)
            // this.$refs.elementUpload.onProgress(total.percent)
          },
          error => {
            console.log(error)
          },
          complete => {
            let hash = complete.hash
            let key = complete.key
            console.log(hash)
            console.log(key)
          }
        )
        this.fileList.forEach(res => {
          if (res.uid === request.file.uid) {
            res.status = 'uploading'
            res.state = this.fileStatusText('uploading')
            res.subscription = subscription
          }
        })
      }).catch(err => {
        console.log(err)
      })
    },
    beforeUpload (file) {
      return true
      // const _self = this
      // return new Promise((resolve, reject) => {
      //   getToken({
      //     fileName: file.name,
      //     fileParentId: 0
      //   }).then(response => {
      //     const key = response.data.key
      //     const token = response.data.token
      //     _self._data.dataObj.token = token
      //     _self._data.dataObj.key = key
      //     resolve(true)
      //   }).catch(err => {
      //     console.log(err)
      //     reject(new Error(false))
      //   })
      // })
    },
    /**
     * 暂停事件
     */
    pause (file) {
      console.log('pause', file)
      file.status = 'paused'
      file.state = this.fileStatusText('paused')
      file.subscription.unsubscribe()
    },
    /**
    * 开始事件
    */
    resume (file) {
      console.log('resume', file)
      file.status = 'waiting'
      file.state = this.fileStatusText('waiting')
      this.$refs.upload.submit()
    },
    progressChange (event, file, fileList) {
      console.log(event, file, Date.now())
      this.fileList.forEach(res => {
        if (res.uid === file.uid) {
          res.progress = this.progressStyle(event)
        }
      })
    },
    /**
     * 文件状态改变时的钩子
     * 添加文件、上传成功和上传失败时都会被调用
     */
    handleChange (file, fileList) {
      if (file.status === 'ready') {
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
    }
  }
}
</script>
<style>
.same_module {
  border: 1px solid grey;
}
.title {
  color: #fff;
  height: 30px;
  line-height: 30px;
  background: blue;
  padding: 0 10px;
  cursor: pointer;
  overflow: hidden;
}
.title span {
  vertical-align: middle;
}
.title .arrow {
  float: right;
}
.detail {
  overflow: hidden;
}
.detail .inner {
  padding: 5px 10px;
  background: #808080;
  color: #fff;
}
.detail p {
  line-height: 26px;
}
.arrow {
  display: inline-block;
  border-top: 2px solid;
  border-right: 2px solid;
  width: 8px;
  height: 8px;
  border-color: #ea6000;
  transform: rotate(315deg);
  position: relative;
  transition: all 0.5s ease-in;
  transform-origin: center center;
  top: 50%;
  margin-top: -10px;
}
.up .arrow {
  transform: rotate(135deg);
}
.upload-button {
  outline: none;
  display: inline-block;
  cursor: pointer;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
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
  -webkit-font-feature-settings: 'liga';
  font-feature-settings: 'liga';
}
</style>
