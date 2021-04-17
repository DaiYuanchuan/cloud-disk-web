<template>
  <div>
    <el-avatar :size="50" src="https://cloud-storage-cs-1256166828.cos.ap-nanjing.myqcloud.com/backiee-129901.jpg"
               @error="true">
      <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" alt="yonghumog"/>
    </el-avatar>
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

    <el-image-viewer
      v-if="showViewer"
      :initialIndex="5"
      :url-list="image"/>

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

    <fileCard :card-title="cardTitle" :card-file-parent-id="cardFileParentId" v-if="true"></fileCard>

  </div>
</template>

<script>
import {getToken, upload} from '@/api/qiniu'
import {storageUnitConversion} from '@/utils/utils'
import DPlayer from 'dplayer'
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
import uploader from '@/components/upload/uploader'
import fileCard from '@/components/fileCard/fileCard'
// 获取七牛token 后端通过Access Key,Secret Key,bucket等生成token
// 七牛官方sdk https://developer.qiniu.com/sdk#official-sdk

export default {
  data () {
    return {
      cardTitle: '保存',
      cardShow: true,
      cardFileParentId: 0,
      cardFileList: [
        {
          'fileId': 5020,
          'fileName': '11',
          'fileHash': '',
          'fileSize': 0,
          'fileMimeType': 'application/octet-stream',
          'fileKey': '',
          'fileParentId': 0,
          'fileUserId': 13,
          'fileFolder': true,
          'select': false,
          'createTime': '2021-04-11 17:26:11'
        },
        {
          'fileId': 5019,
          'fileName': '10',
          'fileHash': '',
          'fileSize': 0,
          'fileMimeType': 'application/octet-stream',
          'fileKey': '',
          'fileParentId': 0,
          'fileUserId': 13,
          'fileFolder': true,
          'select': false,
          'createTime': '2021-04-11 17:26:06'
        },
        {
          'fileId': 5018,
          'fileName': '9',
          'fileHash': '',
          'fileSize': 0,
          'fileMimeType': 'application/octet-stream',
          'fileKey': '',
          'fileParentId': 0,
          'fileUserId': 13,
          'fileFolder': true,
          'select': false,
          'createTime': '2021-04-11 17:25:59'
        },
        {
          'fileId': 5017,
          'fileName': '8',
          'fileHash': '',
          'fileSize': 0,
          'fileMimeType': 'application/octet-stream',
          'fileKey': '',
          'fileParentId': 0,
          'fileUserId': 13,
          'fileFolder': true,
          'select': false,
          'createTime': '2021-04-11 17:25:54'
        },
        {
          'fileId': 5016,
          'fileName': '7',
          'fileHash': '',
          'fileSize': 0,
          'fileMimeType': 'application/octet-stream',
          'fileKey': '',
          'fileParentId': 0,
          'fileUserId': 13,
          'fileFolder': true,
          'select': false,
          'createTime': '2021-04-11 17:25:49'
        },
        {
          'fileId': 5015,
          'fileName': '6',
          'fileHash': '',
          'fileSize': 0,
          'fileMimeType': 'application/octet-stream',
          'fileKey': '',
          'fileParentId': 0,
          'fileUserId': 13,
          'fileFolder': true,
          'select': false,
          'createTime': '2021-04-11 17:25:44'
        },
        {
          'fileId': 5014,
          'fileName': '5',
          'fileHash': '',
          'fileSize': 0,
          'fileMimeType': 'application/octet-stream',
          'fileKey': '',
          'fileParentId': 0,
          'fileUserId': 13,
          'fileFolder': true,
          'select': false,
          'createTime': '2021-04-11 17:25:39'
        },
        {
          'fileId': 5013,
          'fileName': '4',
          'fileHash': '',
          'fileSize': 0,
          'fileMimeType': 'application/octet-stream',
          'fileKey': '',
          'fileParentId': 0,
          'fileUserId': 13,
          'fileFolder': true,
          'select': false,
          'createTime': '2021-04-11 17:25:34'
        },
        {
          'fileId': 5012,
          'fileName': '3',
          'fileHash': '',
          'fileSize': 0,
          'fileMimeType': 'application/octet-stream',
          'fileKey': '',
          'fileParentId': 0,
          'fileUserId': 13,
          'fileFolder': true,
          'select': false,
          'createTime': '2021-04-11 17:25:29'
        },
        {
          'fileId': 5011,
          'fileName': '2',
          'fileHash': '',
          'fileSize': 0,
          'fileMimeType': 'application/octet-stream',
          'fileKey': '',
          'fileParentId': 0,
          'fileUserId': 13,
          'fileFolder': true,
          'select': false,
          'createTime': '2021-04-11 17:25:23'
        }
      ],
      dataObj: {token: '', key: ''},
      image_uri: [],
      fileList: [],
      player: null,
      file: [],
      dialogVideo: false,
      dialogPlay: false,
      showViewer: false,
      image: ['http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/a5dc343d4adf45608139724169bf3074hfbc32qibx.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/7643f3d31a7547d68e1525a04db31386izz3vndv27.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/52788f389fde441eb4b8f06b0b1e35b78u4yiybjr0.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/a20088782970494c9486a00de6bddba4n8l7oxpifm.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/9cdaf83222324e88952febffaf3995279wtz1o741h.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/10d3d63fda4040468debb87387dc913948urp8pjn8.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/d196659f5fe342298afb626da5dae232hzdeynbk3t.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/4b0bda4157714ee1a28e68cc8e599a881tftpze3l3.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/6890869c8bec4ae7a919dae3c6a539b0a24ate2jd7.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/e1d51b21b2ae481689369398983aeac0r6uhrwfn6r.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/1806fb8a64d74223a3e6f6f589f4b214vnk8d7lrre.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/ac7c5a8c850d4db99bc29350486fe62dgxdhy9dsd7.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/2dd09dc695624615a6b6627ad0b1c166fjpllqvg4u.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/a5851848002444c4aec62437f5f72fe1rpa6vfhfdx.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/2c74676aa52e47df9027ebe517923e5angmg1rbix7.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/1d39962737a04dc0ade4639d6035c4160z2to4eyqq.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/f2cc05a6f25146d9b2588dfac239386fbm7lk389nu.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/5da1e91ce13c45ff909c7f4ab3c25664e11urm18yp.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/3d0b42eb13fa4ccd92f03ecb6e8bf0f1ojr78yttxj.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/d05ee120b6e84a01828b0d184158696dw80m86gvak.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/9db5e9da80f14bc59baf3e1838ebf36dhqqrcgy75d.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/091155fe2c1b4456af7034f32da20091dl8d99vdqc.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/50c0c440212949bda67d419c3c0d8428u317azu1kl.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/dd4549846a6048c2b5bc4f111efd1d281ad1n5cc3t.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/204d3c7d49b848ff9b31036f8b20c8cbsmx8gvng7j.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/e1d51b21b2ae481689369398983aeac0r6uhrwfn6r.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/7643f3d31a7547d68e1525a04db31386izz3vndv27.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/83f66cffd4bf4a95b1883a4fba1d3f4b1vsxoppzli.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/f2cc05a6f25146d9b2588dfac239386fbm7lk389nu.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/52788f389fde441eb4b8f06b0b1e35b78u4yiybjr0.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/fa8a1bbcdc5a45f688e9f4038c1dc3ddzg12uvxam4.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/1317c2a3e55343dcbc0f30746a4008dak8saezbb8k.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/0adb044a7e0b448c939127d703aca1e4mn6qwbm4dn.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/d2d47c65721b47fa9c180a45a415a30ev9upskxzmv.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/a5dc343d4adf45608139724169bf3074hfbc32qibx.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/1d39962737a04dc0ade4639d6035c4160z2to4eyqq.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/10d3d63fda4040468debb87387dc913948urp8pjn8.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/2c74676aa52e47df9027ebe517923e5angmg1rbix7.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/ac7c5a8c850d4db99bc29350486fe62dgxdhy9dsd7.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/4b0bda4157714ee1a28e68cc8e599a881tftpze3l3.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/a5851848002444c4aec62437f5f72fe1rpa6vfhfdx.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/9cdaf83222324e88952febffaf3995279wtz1o741h.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/1806fb8a64d74223a3e6f6f589f4b214vnk8d7lrre.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/a20088782970494c9486a00de6bddba4n8l7oxpifm.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/2dd09dc695624615a6b6627ad0b1c166fjpllqvg4u.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/6890869c8bec4ae7a919dae3c6a539b0a24ate2jd7.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/d196659f5fe342298afb626da5dae232hzdeynbk3t.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/3f45b334e8f84b558eb416daae5bd3dervrhenftsw.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/78b392a0be2d492294fd59a42124cc69v98851jbe7.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/bd853e0b33814cecafeba427f43bd2e025olzx67pl.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/20aeda5a99504647b6ceca309f2faeeett7ptkbn74.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/d7e024b7a378443794ee98485e008b943x1xm2swk9.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/590b9f30f64943398729a47e78410638y7s8ynp3on.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/7e1805477ad64717b51fc8df8777ba964k7b468cgs.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/f223602f4d58403c96a7bc9a8d1e2e15v9b26kbzac.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/f6d7d770ad0544f09881cf483cfd6e3feht0rjp7jn.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/35d317cd6b5241d6a600ac2b773b03e2rhluc64xhq.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/0adb044a7e0b448c939127d703aca1e4mn6qwbm4dn.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/d05ee120b6e84a01828b0d184158696dw80m86gvak.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/d2d47c65721b47fa9c180a45a415a30ev9upskxzmv.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/3d0b42eb13fa4ccd92f03ecb6e8bf0f1ojr78yttxj.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/9db5e9da80f14bc59baf3e1838ebf36dhqqrcgy75d.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/50c0c440212949bda67d419c3c0d8428u317azu1kl.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/dd4549846a6048c2b5bc4f111efd1d281ad1n5cc3t.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/952259aa0fd54d599814307506b7eeafvn88e3r6a7.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/a20088782970494c9486a00de6bddba4n8l7oxpifm.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/83f66cffd4bf4a95b1883a4fba1d3f4b1vsxoppzli.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/7643f3d31a7547d68e1525a04db31386izz3vndv27.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/204d3c7d49b848ff9b31036f8b20c8cbsmx8gvng7j.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/091155fe2c1b4456af7034f32da20091dl8d99vdqc.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/1806fb8a64d74223a3e6f6f589f4b214vnk8d7lrre.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/f2cc05a6f25146d9b2588dfac239386fbm7lk389nu.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/1d39962737a04dc0ade4639d6035c4160z2to4eyqq.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/6890869c8bec4ae7a919dae3c6a539b0a24ate2jd7.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/fa8a1bbcdc5a45f688e9f4038c1dc3ddzg12uvxam4.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/1317c2a3e55343dcbc0f30746a4008dak8saezbb8k.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/a5851848002444c4aec62437f5f72fe1rpa6vfhfdx.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/52788f389fde441eb4b8f06b0b1e35b78u4yiybjr0.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/d196659f5fe342298afb626da5dae232hzdeynbk3t.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/2dd09dc695624615a6b6627ad0b1c166fjpllqvg4u.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/a5dc343d4adf45608139724169bf3074hfbc32qibx.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/9cdaf83222324e88952febffaf3995279wtz1o741h.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/e1d51b21b2ae481689369398983aeac0r6uhrwfn6r.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/2c74676aa52e47df9027ebe517923e5angmg1rbix7.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/10d3d63fda4040468debb87387dc913948urp8pjn8.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/ac7c5a8c850d4db99bc29350486fe62dgxdhy9dsd7.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/4b0bda4157714ee1a28e68cc8e599a881tftpze3l3.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/e1d51b21b2ae481689369398983aeac0r6uhrwfn6r.jpg', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/590b9f30f64943398729a47e78410638y7s8ynp3on.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/d05ee120b6e84a01828b0d184158696dw80m86gvak.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/78b392a0be2d492294fd59a42124cc69v98851jbe7.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/bd853e0b33814cecafeba427f43bd2e025olzx67pl.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/3f45b334e8f84b558eb416daae5bd3dervrhenftsw.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/20aeda5a99504647b6ceca309f2faeeett7ptkbn74.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/35d317cd6b5241d6a600ac2b773b03e2rhluc64xhq.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/3d0b42eb13fa4ccd92f03ecb6e8bf0f1ojr78yttxj.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/0adb044a7e0b448c939127d703aca1e4mn6qwbm4dn.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/d2d47c65721b47fa9c180a45a415a30ev9upskxzmv.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/d7e024b7a378443794ee98485e008b943x1xm2swk9.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/7e1805477ad64717b51fc8df8777ba964k7b468cgs.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/590b9f30f64943398729a47e78410638y7s8ynp3on.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/d05ee120b6e84a01828b0d184158696dw80m86gvak.png', 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/f223602f4d58403c96a7bc9a8d1e2e15v9b26kbzac.png'],
      videoUrl: 'http://111.231.141.191:8084/disk-file/resource/redirection?key=cloud/fb0e7500802946cc9c46fe9519535499/4b1bcbfb9a6a4b82af36782a970453ed9qi4k6ema1.mp4'
    }
  },
  components: {
    uploader, ElImageViewer, fileCard
  },
  mounted: function () {
  },
  methods: {
    /**
     * 对父组件传入的fileList进行重新赋值与过滤，只保留文件夹部分
     * @param fileList 父组件传入的文件列表信息
     */
    fileFolderList: function (fileList) {
      console.log('+++++++++++++++', fileList)
      return fileList
    },
    fileKey: function () {
      return this.image.map(res => 'http://111.231.141.191:8084/disk-file/resource/redirection?key=' + res.fileKey)
    },
    slide: function (event) {
      let curTarget = event.currentTarget
      let containsCurClass = curTarget.classList.contains('up')
      let nextSibling = curTarget.nextSibling
      while (nextSibling.nodeType === 3 && /\s/.test(nextSibling.nodeValue)) {
        nextSibling = nextSibling.nextSibling
      }

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
