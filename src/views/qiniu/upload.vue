<template>
  <div>
    <el-upload
      :data="dataObj"
      :multiple="true"
      :before-upload="beforeUpload"
      action="https://upload.qiniup.com"
      :http-request="uploadRequest"
      drag
    >
      <i class="el-icon-upload" />
      <i class="fas fa-camera"></i>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
    </el-upload>

    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
      <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>

    <font-awesome-icon icon="fas fa-camera"/>

    <el-dialog
      :visible.sync="dialogVideo"
      id="dplayer"
      ref="dplayer"
    >
    </el-dialog>

    <el-button @click="button">播放</el-button>
  </div>
</template>

<script>
import { getToken, upload } from '@/api/qiniu'
import DPlayer from 'dplayer'
// 获取七牛token 后端通过Access Key,Secret Key,bucket等生成token
// 七牛官方sdk https://developer.qiniu.com/sdk#official-sdk

export default {
  data () {
    return {
      dataObj: { token: '', key: '' },
      image_uri: [],
      fileList: [],
      player: null,
      dialogVideo: false
    }
  },
  mounted: function () {

  },
  methods: {
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
        upload(
          token,
          key,
          request,
          next => {
            let total = next.total
            console.log(total)
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
    }
  }
}
</script>
