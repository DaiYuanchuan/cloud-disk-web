<template>
  <div class="file-panel">
    <slot :breadcrumbs="breadcrumbs" :file-list="fileList">
      <!-- 面包屑部分 -->
      <div class="breadcrumbs">
        <span v-for="(item, index) in breadcrumbsTruncation()" :key="index"
              :aria-label="item.fileName" :title="index === 0 ? item.fileName : ''">
          <i :class="index === 0 ? 'shadow' : ''" class="material-icons" @click="$emit('previous', item, index)">
            <svg-icon :icon-class="index === 0 ? 'file-home' : 'breadcrumb-right'"></svg-icon>
          </i>
          <span v-if="index !== 0" class="breadcrumb-item shadow" @click="$emit('previous', item, index)">
            {{ breadcrumbs.length &lt; 5 ? item.fileName : index === 1 ? '...' : item.fileName }}
          </span>
        </span>
      </div>
      <div v-if="!fileList.length">
        <h2 class="message">
          <i class="material-icons">
            <svg-icon icon-class="file-crying-face"></svg-icon>
          </i>
          <span>这里没有任何文件...</span>
        </h2>
      </div>
      <!-- 文件列表部分 -->
      <div v-else id="listing" class="list" @keydown.ctrl.c="$emit('ctrlC')" @keydown.ctrl.x="$emit('ctrlX')">
        <!-- title -->
        <div class="list-title">
          <div class="item header">
            <div></div>
            <div>
              <p role="button" tabindex="0" title="名称" aria-label="名称" class="name">
                <span>名称</span>
              </p>
              <p role="button" tabindex="0" title="大小" aria-label="大小" class="size">
                <span>大小</span>
              </p>
              <p role="button" tabindex="0" title="最后修改时间" aria-label="最后修改时间" class="modified">
                <span>最后修改</span>
              </p>
            </div>
          </div>
        </div>
        <!-- 文件列表 -->
        <div class="list-file" @keydown.delete="$emit('delete')" @keydown.a="ctrlA($event)">
          <div role="button" tabindex="0" draggable="true"
               v-for="(item,index) in fileList" :key="index"
               @click="choose($event, item, index)" @dblclick="doubleClick(item)"
               :data-dir="item['fileFolder']" :aria-label="item.fileName"
               :aria-selected="!item.select ? 'false' : 'true'"
               class="item">
            <div>
              <i class="material-icons">
                <svg-icon :icon-class="iconClass(item)"></svg-icon>
              </i>
            </div>
            <div>
              <p class="name">{{ item.fileName }}</p>
              <p :data-order="item.fileSize === 0 ? -1 : storageUnitFormatting(item.fileSize)" class="size">
                {{ storageUnitFormatting(item.fileSize) }}</p>
              <p class="modified">
                <time>{{ timeDifferenceCalculation(item) }}</time>
              </p>
            </div>
          </div>
        </div>
      </div>
    </slot>

    <!-- element 大图预览组件 -->
    <el-image-viewer v-if="elImageViewer.show"
                     :initialIndex="elImageViewer.initialIndex"
                     :on-close="imageViewerClose"
                     :url-list="elImageViewer.imagesList"/>
  </div>
</template>

<script>
import {storageUnitConversion, timeDifference, mimeTypes, fileCategory} from '@/utils/utils'
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'

export default {
  name: 'file-panel',
  props: {
    // 路径信息的面包屑导航(数组中的第一位元素为主页)
    breadcrumbs: {
      type: Array,
      default () {
        return []
      }
    },
    // 文件列表(用来渲染的文件列表数据)
    fileList: {
      type: Array,
      default () {
        return []
      }
    }
  },
  components: {
    ElImageViewer
  },
  data () {
    return {
      // element图片预览组件
      elImageViewer: {
        // 是否显示图片的大图预览
        show: false,
        // 初始索引值(索引基于 图片列表imagesList 字段)
        initialIndex: 0,
        // 需要进行 大图预览的 图片列表
        imagesList: []
      }
    }
  },
  // 钩子函数：页面加载完成后执行
  mounted: function () {
  },
  // 钩子函数: 数据监听
  watch: {},
  // 钩子函数：页面创建时加载
  created: function () {
    window.onscroll = () => {
      // 变量scrollTop是滚动条滚动时，距离顶部的距离
      let scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      // 变量windowHeight是可视区的高度
      let windowHeight = document.documentElement.clientHeight || document.body.clientHeight
      // 变量scrollHeight是滚动条的总高度
      let scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
      // 滚动条到底部的条件
      if (Math.round(scrollTop + windowHeight + 1) === scrollHeight) {
        // 加载下一页
        this.$emit('nextPage')
      }
    }
  },
  methods: {
    /**
     * 文件列表 - 双击事件
     */
    doubleClick: function (item) {
      // 判断当前点击的是否为文件夹
      if (item['fileFolder']) {
        this.$emit('doubleClick', item)
        return
      }
      // 设置重定向地址
      let redirectionAddress = process.env.BASE_API + '/disk-file/resource/redirection?key='
      // 判断当前点击的是否是图片，执行图片预览操作
      if (fileCategory(item['fileMimeType']) === 'image') {
        // 实时筛选出当前文件中的所有图片类型的文件
        this.elImageViewer.imagesList = this.fileList.filter(res => fileCategory(res['fileMimeType']) === 'image')
          .map(res => redirectionAddress + res['fileKey'])
        // 设置初始索引值
        this.elImageViewer.initialIndex = this.elImageViewer.imagesList.findIndex(res => res === redirectionAddress + item['fileKey'])
        // 显示 大图预览组件
        this.elImageViewer.show = true
      }
    },
    /**
     * element 大图预览组件 关闭组件
     */
    imageViewerClose: function () {
      // 关闭 大图预览组件
      this.elImageViewer.show = false
      this.elImageViewer.initialIndex = 0
      this.elImageViewer.imagesList = []
    },
    /**
     * 文件列表 单机选中事件
     */
    choose: function (event, item, index) {
      if (event.ctrlKey) {
        this.ctrl(item)
      } else if (event.shiftKey) {
        this.shift(item, index)
      } else {
        this.click(item)
      }
    },
    /**
     * 当前页面的文件列表-单击执行事件
     */
    click: function (item) {
      if (!item.select) {
        // 取消之前所选的
        this.fileList.forEach(res => {
          if (res.select) {
            res.select = false
          }
        })
      }
      item.select = !item.select
    },
    /**
     * ctrl 执行多选事件(按住 ctrl + 鼠标 左键触发)
     */
    ctrl: function (item) {
      item.select = !item.select
    },
    /**
     * ctrl + A 执行全选事件(按住 ctrl + A 触发)
     */
    ctrlA: function (event) {
      if (event.ctrlKey) {
        // 全选
        this.fileList.forEach(res => {
          res.select = true
        })
      }
    },
    /**
     * shift 执行多选事件(按住 shift + 鼠标 左键触发)
     */
    shift: function (item, index) {
      // 获取所有被选中的值
      let selectData = this.fileList.filter(res => res.select)
      if (!selectData.length) {
        // 如果没有被选中的 ，则默认选择当前元素
        item.select = !item.select
        return
      }
      // 获取当前已经被选中的最小值的下标
      let minIndex = this.fileList.map(item => item.fileId).indexOf(selectData[0].fileId) + 1
      if (minIndex === index || item.select) {
        // 如果选中了它本身 或者的已经是选中状态的了
        item.select = !item.select
        return
      }
      if (minIndex > index) {
        minIndex -= 1
      }
      for (let i = Math.min(index, minIndex); i <= Math.max(index, minIndex); i++) {
        this.fileList[i].select = true
      }
    },
    /**
     * 存储单位格式化
     * @param size 字节数
     */
    storageUnitFormatting: function (size) {
      if (size > 0) {
        return storageUnitConversion(size)
      }
      return '—'
    },
    /**
     * 时间差计算
     * @param item 文件对象
     */
    timeDifferenceCalculation: function (item) {
      // 默认等于创建时间
      let time = item['createTime']
      // 如果更新时间不为空，则 等于 更新时间
      if (item['updateTime'] !== undefined) {
        time = item['updateTime']
      }
      let difference = timeDifference((new Date(time.replace(new RegExp('-', 'gm'), '/'))).getTime())
      if (difference === '') {
        return time
      }
      return difference
    },
    /**
     * 获取文件icon
     * @param item 文件对象
     */
    iconClass: function (item) {
      if (item['fileFolder']) {
        return 'file-folder'
      }
      // 获取文件类型
      return mimeTypes(item['fileMimeType'])
    },
    /**
     * 面包屑breadcrumbs数组截断，第一位 + 后四位
     */
    breadcrumbsTruncation: function () {
      if (this.breadcrumbs.length < 5) {
        // 不进行格式化 ，返回原数组
        return this.breadcrumbs
      }
      // 切片数组[取后4位元素]
      let sliceArray = this.breadcrumbs.slice(-4)
      // 向新数组的开头插入第一个元素
      sliceArray.unshift(this.breadcrumbs[0])
      return sliceArray
    }
  }
}
</script>

<style scoped lang="scss">
.file-panel {
  display: block;
  outline: none;
  box-sizing: border-box;
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
}

.breadcrumbs, .breadcrumbs span {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  color: #6f6f6f;
}

.breadcrumbs {
  height: 3em;
  border-bottom: 1px solid rgba(0, 0, 0, .05);
}

a {
  text-decoration: none;
  background-color: transparent;
}

.breadcrumbs .shadow {
  color: inherit;
  -webkit-transition: .1s ease-in;
  transition: .1s ease-in;
  border-radius: .125em;
}

.breadcrumbs .shadow:hover {
  cursor: pointer;
  background-color: rgba(0, 0, 0, .05);
}

.breadcrumb-item {
  padding: .2em;
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

.message {
  text-align: center;
  font-size: 2em;
  margin: 1em auto;
  display: block !important;
  width: 95%;
  color: rgba(0, 0, 0, .3);
  font-weight: 500;
}

.message i {
  font-size: 2.5em;
  margin-bottom: .2em;
  display: block;
}

#listing.list {
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  margin: 0;
}

#listing .item.header {
  display: none !important;
  background-color: #ccc;
}

#listing.list .item.header {
  display: -webkit-box !important;
  display: -ms-flexbox !important;
  display: flex !important;
  background: #fafafa;
  z-index: 999;
  padding: .85em;
  border: 0;
  border-bottom: 1px solid rgba(0, 0, 0, .1);
}

#listing.list .item {
  width: 100%;
  margin: 0;
  border: 1px solid rgba(0, 0, 0, .1);
  padding: 1em;
  border-top: 0;
}

#listing .item {
  background-color: #fff;
  position: relative;
  -ms-flex-wrap: nowrap;
  flex-wrap: nowrap;
  color: #6f6f6f;
  -webkit-transition: background .1s ease, opacity .1s ease;
  transition: background .1s ease, opacity .1s ease;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

#listing.list .item.header > div:first-child {
  width: 0;
}

#listing.list .item div:first-of-type {
  width: 3em;
}

#listing.list .item div:last-of-type {
  width: calc(100% - 3em);
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

#listing .item div:last-of-type {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

#listing.list .item.header .active {
  font-weight: 700;
}

#listing.list .item.header .name {
  margin-right: 3em;
}

#listing.list .item .name {
  width: 50%;
}

#listing .item div:last-of-type * {
  text-overflow: ellipsis;
  overflow: hidden;
}

#listing.list .name {
  outline: 0;
  font-weight: 400;
}

#listing .item p {
  margin: 0;
}

p {
  display: block;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
}

#listing.list .header span {
  vertical-align: middle;
}

#listing.list .header .active i, #listing.list .header p:hover i {
  opacity: 1;
}

#listing.list .header i {
  opacity: 0;
  -webkit-transition: all .1s ease;
  transition: all .1s ease;
}

#listing.list .header i {
  font-size: 1.5em;
  vertical-align: middle;
  margin-left: .2em;
}

#listing.list .item .size {
  width: 25%;
}

#listing .item .modified, #listing .item .size {
  font-size: .9em;
  outline: 0;
}

#listing .item, #listing > div {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

#listing > div {
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -webkit-box-pack: start;
  -ms-flex-pack: start;
  justify-content: flex-start;
}

#listing.list .item div:first-of-type i {
  font-size: 2em;
}

#listing .item i {
  font-size: 4em;
}

#listing .item i, #listing .item img {
  margin-right: .1em;
  vertical-align: bottom;
}

#listing .item[aria-selected=true] {
  background: #2196f3 !important;
  color: #fff !important;
}

.list-file {
  cursor: pointer
}

@media (max-width: 736px) {
  #listing.list .item .size {
    display: none !important;
  }
}

@media (max-width: 450px) {
  #listing.list .item .modified {
    display: none !important;
  }
}
</style>
