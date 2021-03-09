<template>
  <div class="home">

    <div id="mbx">

      <el-breadcrumb
        class="textmbx"
        separator-class="el-icon-arrow-right"
      >
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumbs"
          :key="item.fileId"
          @click.native="previous(item, index)"
        >{{item.fileName}}</el-breadcrumb-item>
      </el-breadcrumb>

    </div>

    <div class="topsa">
      <p>
        名称
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
      v-for="item in diskFile"
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

    <div>

      <!-- 显示图片 -->
      <el-image-viewer
        v-show="imageUrl !== ''"
        :on-close="closeViewer"
        :url-list="[imageUrl]"
      />

      <!-- 播放视频 -->
      <el-dialog
        :center="true"
        :roundButton="true"
        :before-close="beforeClose"
        :visible.sync="dialogVideo"
      >
        <div
          slot="footer"
          id="dplayer"
          ref="dplayer"
        ></div>
      </el-dialog>
    </div>

  </div>
</template>

<script>
import { search, download } from '@/api/file'
import { storageUnitConversion } from '@/utils/utils'
import DPlayer from 'dplayer'
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'

export default {
  name: 'home',
  props: ['file', 'path'],
  components: {
    ElImageViewer
  },
  data () {
    return {
      // 初始化分页信息
      page: 1,
      // 构建文件初始化数据
      diskFile: [],
      // 如果页面上拉触底请求下一页的数据时 没有数据了 这里显示true
      documentRetrieval: false,
      // 路径信息的面包屑导航
      breadcrumbs: [{
        fileName: '/',
        fileId: 0
      }],
      // 是否显示播放视频的 dialog
      dialogVideo: false,
      // 图片地址
      imageUrl: '',
      // 视频插件对象
      player: null
    }
  },
  // 钩子函数：页面加载完成后执行
  mounted: function () {
    this.player = new DPlayer({
      container: document.getElementById('dplayer'),
      volume: 1,
      playbackSpeed: [0.5, 1, 1.25, 1.5, 2, 2.5, 3, 4],
      contextmenu: [],
      video: {
        url: ''
      }
    })
    search({
      page: this.page,
      fileParentId: 0
    }).then((response) => {
      console.log(response.data)
      this.diskFile = response.data.diskFile
      this.$emit('getCurrentFile', response.data.diskFile)
    }).catch((err) => {
      console.log(err)
    })
    window.getSelection().removeAllRanges()
  },
  watch: {
    file: function (val) {
      this.diskFile = val
    },
    path: function (val) {
      this.breadcrumbs = val
    }
  },
  created: function () {
    window.onscroll = () => {
      // 变量scrollTop是滚动条滚动时，距离顶部的距离
      let scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      // 变量windowHeight是可视区的高度
      let windowHeight = document.documentElement.clientHeight || document.body.clientHeight
      // 变量scrollHeight是滚动条的总高度
      let scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
      // 滚动条到底部的条件
      if (parseInt(scrollTop + windowHeight) === scrollHeight) {
        // 后台加载数据的函数
        this.onReachBottom()
      }
    }
  },
  methods: {
    /**
     * 点击执行单选事件
     */
    click: function (event) {
      for (let item of document.getElementsByClassName('item')) {
        if (item !== event.currentTarget) {
          item.dataset.selected = 'false'
        }
      }
      if (event.currentTarget.dataset.selected === 'false') {
        this.$emit('getOperation', true)
        this.$emit('getMultiSelect', true)
        event.currentTarget.dataset.selected = 'true'
      } else {
        this.$emit('getOperation', false)
        this.$emit('getMultiSelect', false)
        event.currentTarget.dataset.selected = 'false'
      }
    },
    /**
     * ctrl 执行多选事件
     */
    ctrl: function (event) {
      // 如果点击的同时 按下了 ctrl
      if (!event.ctrlKey) {
        for (let item of document.getElementsByClassName('item')) {
          if (item !== event.currentTarget) {
            item.dataset.selected = 'false'
          }
        }
      }
      if (event.currentTarget.dataset.selected === 'false') {
        event.currentTarget.dataset.selected = 'true'
      } else {
        event.currentTarget.dataset.selected = 'false'
      }

      // 获取所有已经点击的值
      let size = 0
      for (let item of document.getElementsByClassName('item')) {
        if (item.dataset.selected === 'true') {
          size++
        }
      }
      this.$emit('getMultiSelect', size === 1)
      this.$emit('getOperation', size > 0)
    },
    /**
     * shift 执行多选事件
     */
    shift: function (event) {
      // 获取所有已经点击的值
      let size = 0
      let arr = []
      for (let item of document.getElementsByClassName('item')) {
        arr.push(item)
        if (item.dataset.selected === 'true') {
          size++
        }
      }
      if (size > 1) {
        this.click(event)
        return
      }
      // 起始值
      let startIdx = 0
      // 结束值
      let endIdx = 0
      arr.forEach((item, index) => {
        if (item.dataset.selected === 'true') {
          startIdx = index
        }
        if (item === event.currentTarget) {
          endIdx = index
        }
      })
      // 用户可能反向选取，所以要取绝对值
      const sum = Math.abs(startIdx - endIdx) + 1
      // 获取起点和终点较小的值
      const min = Math.min(startIdx, endIdx)
      this.$emit('getMultiSelect', sum === 1)
      let i = 0
      while (i < sum) {
        const index = min + i
        document.getElementsByClassName('item')[index].dataset.selected = 'true'
        i++
      }
    },
    /**
     * 点击选中事件
     */
    choose: function (event) {
      if (event.ctrlKey) {
        this.ctrl(event)
        return
      }

      if (event.shiftKey) {
        this.shift(event)
        return
      }

      this.click(event)
    },
    /**
     * 存储单元转换
     */
    storageUnitConversion: function (bytes) {
      return storageUnitConversion(bytes)
    },
    /**
     * 上一级
     */
    previous: function (item, idx) {
      this.page = 1
      // 文件夹拥有下一级
      search({
        page: this.page,
        fileParentId: item.fileId
      }).then((response) => {
        this.diskFile = response.data.diskFile
        let breadcrumbs = []
        this.breadcrumbs.forEach(function (item, index) {
          if (index <= idx) {
            breadcrumbs.push(item)
          }
        })
        this.breadcrumbs = breadcrumbs
        // 传给父组件的值
        this.$emit('getBreadcrumbs', breadcrumbs)
        this.$emit('getCurrentFile', response.data.diskFile)
        this.$emit('getOperation', false)
        this.$emit('getMultiSelect', false)
        this.documentRetrieval = false
      }).catch((err) => {
        console.log(err)
      })
    },
    /**
     * 下一级
     */
    nextLevel: function (item) {
      console.log(item)
      // 判断当前点击的是否为文件夹
      if (item.fileFolder === true) {
        // 设置当前页码为1
        this.page = 1
        // 文件夹拥有下一级
        search({
          page: this.page,
          fileParentId: item.fileId
        }).then((response) => {
          // 增加面包屑导航数据
          this.breadcrumbs.push({
            fileId: item.fileId,
            fileName: item.fileName
          })
          this.formatCrumbs()
          this.diskFile = response.data.diskFile
          this.documentRetrieval = response.data.diskFile.length <= 0
          // 传给父组件的值
          this.$emit('getBreadcrumbs', this.breadcrumbs)
          this.$emit('getCurrentFile', response.data.diskFile)
          this.$emit('getOperation', false)
          this.$emit('getMultiSelect', false)
        }).catch((err) => {
          console.log(err)
        })
      } else {
        console.log('当前点击的是文件')
        console.log(item.fileMimeType)
        download({
          key: item.fileKey,
          time: 3600
        }).then((res) => {
          if (item.fileMimeType.indexOf('image') !== -1 && item.fileMimeType !== 'application/x-iso9660-image') {
            this.imageUrl = res.data
            return
          }
          if (item.fileMimeType.indexOf('video') !== -1) {
            console.log('点击的是视频')
            this.dialogVideo = true
            this.player.switchVideo({
              url: res.data
            })
            this.player.play()
            return
          }
          // 如果当前文件的属性是图片
          this.download(res.data, item.fileName)
        }).catch((err) => {
          console.log(err)
        })
      }
    },
    /**
     * 大图预览关闭事件回掉
     */
    closeViewer: function () {
      this.imageUrl = ''
    },
    // 下载文件
    download (url, name) {
      let link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', name)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    },
    /**
     * Dialog 关闭前的回调函数
     */
    beforeClose (done) {
      // 关闭播放器
      this.dialogVideo = false
      // 暂停视频播放
      this.player.pause()
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom () {
      let that = this
      let page = that.page + 1
      if (!that.documentRetrieval) {
        // 根据下标获取数据
        let breadcrumbs = this.breadcrumbs[this.breadcrumbs.length - 1]
        // 文件检索 获取用户根目录文件
        search({
          page: page,
          fileParentId: breadcrumbs.fileId
        }).then(data => {
          // 如果数据不为空
          if (data.data.diskFile.length > 0) {
            that.diskFile = that.diskFile.concat(data.data.diskFile)
            that.page = page
            that.documentRetrieval = false
            this.$emit('getCurrentFile', that.diskFile)
            console.log(data.data)
          } else {
            that.documentRetrieval = true
          }
        }).catch(e => {
          console.log(e)
        })
      }
    },
    /**
     * 格式化面包屑数组
     * 返回一个新的数组，数组第一位显示 ...
     * 入: [1，2，3，4，5，6]
     * 出: [1，...，4，5，6]
     */
    formatCrumbs () {
      let array = this.breadcrumbs
      let length = 5
      // 如果数组的长度 <= 需要格式化的长度
      if (array.length <= length - 1) {
        // 不进行格式化 ，返回原数组
        return array
      }
      let newarray = []
      newarray.push({
        fileName: array[0].fileName,
        fileId: array[0].fileId
      })
      newarray.push({
        fileName: '...',
        fileId: array[array.length - 4].fileId
      })
      newarray.push({
        fileName: array[array.length - 3].fileName,
        fileId: array[array.length - 3].fileId
      })
      newarray.push({
        fileName: array[array.length - 2].fileName,
        fileId: array[array.length - 2].fileId
      })
      newarray.push({
        fileName: array[array.length - 1].fileName,
        fileId: array[array.length - 1].fileId
      })
      console.log(newarray)

      console.log(array.slice(-4))
      return newarray
    }
  }
}
</script>

<style scoped>
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
  width: 99%;
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
  height: 90.7vh;
  -moz-user-height: 90.7vh;
  -webkit-user-height: 90.7vh;
  -ms-user-height: 90.7vh;
  -khtml-user-height: 90.7vh;
  /* height:calc(88vh - 20px); */
  overflow-x: hidden;
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
  padding: 0px 20px 10px 0px;
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
