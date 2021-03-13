<template>
  <div class="layout">
    <slot :root-list="rootList" :code="code">
      <el-container>
        <!-- main -->
        <el-main>
          <filePanel :breadcrumbs="breadcrumbs" :file-list="fileList"
                     @nextPage="nextPage" @doubleClick="doubleClick" @previous="previous"></filePanel>
          <!--        <router-view :breadcrumbs="breadcrumbs" :file-list="fileList"-->
          <!--                     @nextPage="nextPage" @doubleClick="doubleClick"-->
          <!--                     @previous="previous" @delete="fileDeletion"></router-view>-->
        </el-main>
      </el-container>
    </slot>
  </div>
</template>

<script>
import filePanel from '@/views/file/index'
import {search} from '@/api/share'

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
    }
  },
  components: {
    filePanel
  },
  data () {
    return {
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
      fileList: []
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
     * @param fileParentId 文件的上一级id
     * @param shareKey 分享的文件夹key值
     * @param resetData 是否重置文件列表数据
     * @param callback 回调函数
     */
    getFileListInfo: function (page, fileParentId, shareKey, resetData, callback) {
      if (page === null || page === undefined) {
        // 默认第一页
        page = 1
      }

      // 获取面包屑最后一位元素
      let lastElement = this.breadcrumbs[this.breadcrumbs.length - 1]
      if (fileParentId === null || fileParentId === undefined) {
        // 默认从 路径信息的面包屑导航 数据中获取最后一位元素
        fileParentId = lastElement.fileId
      }

      if (shareKey === null || shareKey === undefined) {
        // 默认从 路径信息的面包屑导航 数据中获取最后一位元素
        shareKey = lastElement.shareKey
      }

      // 如果点击的是主页，不用请求 ，直接返回根目录 rootList (根目录、最后一位元素的fileId为0)
      if (fileParentId === 0) {
        this.fileList = this.rootList
        if (callback !== undefined) {
          callback()
        }
      } else {
        search({
          code: this.code,
          page: page,
          fileParentId: fileParentId,
          shareShort: this.$route.params.short,
          shareKey: shareKey
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
      }
    },
    /**
     * 页面 面包屑点击事件(加载上一级)
     */
    previous: function (item) {
      // 判断点击的是否是当前的目录(面包屑的最后一个元素为当前元素)
      if (item.fileId !== this.breadcrumbs[this.breadcrumbs.length - 1].fileId) {
        this.page = 1
        this.getFileListInfo(this.page, item.fileId, item.shareKey, true, response => {
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
      this.getFileListInfo(this.page, item.fileId, item.shareKey, true, res => {
        // 增加面包屑导航数据
        this.breadcrumbs.push({
          fileId: item.fileId,
          fileName: item.fileName,
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
    }
  }
}
</script>

<style lang="scss" scoped>
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
  margin: 0 1em 1em auto;
  width: calc(100% - 19em);
}

main {
  display: block;
}

* {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

</style>
