<template>
  <div class="fileTreeList" v-if="cardShow">
    <slot :card-title="cardTitle" :card-file-parent-id="cardFileParentId" :card-breadcrumbs="cardBreadcrumbs">
      <!-- 浮动卡片框 -->
      <div class="card floating">
        <!-- 卡片的抬头 -->
        <div class="card-title">
          <h2>{{ cardTitle }}</h2>
        </div>
        <!-- 卡片的内容 -->
        <div class="card-content">
          <p>请选择欲{{ cardTitle }}至的目录：</p>
          <div>
            <ul class="file-list" ref="cardFileList" @scroll="cardFileListScroll">
              <li v-if="cardBreadcrumbs[cardBreadcrumbs.length - 1].fileId !== 0" @click="click(null, true)"
                  @dblclick="doubleClick(null, true)"
                  role="button" tabindex="0" aria-label=".." :aria-selected="fileParentSelect">
                <i class="material-icons">
                  <svg-icon icon-class="file-folder"></svg-icon>
                </i>
                ..
              </li>
              <li role="button" tabindex="0"
                  v-for="(item, index) in fileList" :key="index"
                  @click="click(item, false)" @dblclick="doubleClick(item, false)"
                  :aria-label="item.fileName" :aria-selected="!item.select ? 'false' : 'true'">
                <i class="material-icons">
                  <svg-icon icon-class="file-folder"></svg-icon>
                </i>
                {{ item.fileName }}
              </li>
            </ul>
            <p>当前目录： <code>{{ breadcrumbsTruncation() }}</code>.</p>
          </div>
        </div>
        <!-- 卡片底部(取消、确定按钮) -->
        <div class="card-action">
          <button aria-label="取消" title="取消" class="button button--flat button--grey" @click="$emit('card-close')">
            <span>取消</span>
          </button>
          <button :aria-label="cardTitle" :title="cardTitle" class="button button--flat" @click="cardConfirm">
            <span>{{ cardTitle }}</span>
          </button>
        </div>
      </div>
    </slot>
    <!-- 背景model -->
    <div class="overlay"></div>
  </div>
</template>

<script>
import {search} from '@/api/file'

export default {
  name: 'fileCard',
  data () {
    return {
      // 初始化的分页信息(默认从第一页开始请求页面文件夹列表数据)
      page: 1,
      // 页面上拉触底事件(如果页面上拉触底请求下一页的数据时 没有数据了 这里显示true 表示不请求数据)
      pageBottomEvent: false,
      // 当前页面的文件夹列表信息(记录着当前页面中所有的文件夹数据)
      fileList: [],
      // 文件父级是否被选中(专门用来记录文件的父级选中状态)
      fileParentSelect: false,
      // 是否显示当前卡片false:默认不显示
      cardShow: false
    }
  },
  props: {
    // 卡片抬头(复制、粘贴、保存..)
    cardTitle: {
      type: String,
      default () {
        return ''
      }
    },
    // 路径信息的面包屑导航(数组中的第一位元素为主页)
    cardBreadcrumbs: {
      type: Array,
      default () {
        return [{
          fileName: '/',
          fileId: 0
        }]
      }
    },
    // 卡片中展示的文件pid信息
    cardFileParentId: {
      type: Number,
      default () {
        return 0
      }
    }
  },
  // 钩子函数：页面加载完成后执行
  mounted: function () {
    // 页面加载完成后，根据对应的fileParentId查找文件夹列表
    this.getFileFolderListInfo(this.page, this.cardFileParentId)
  },
  methods: {
    /**
     * 从服务器端获取文件夹列表信息
     * @param page 页码
     * @param fileParentId 文件的上一级id
     * @param resetData 是否重置文件列表数据
     * @param callback 回调函数
     */
    getFileFolderListInfo: function (page, fileParentId, resetData, callback) {
      if (page === null || page === undefined) {
        // 默认第一页
        page = 1
      }

      if (fileParentId === null || fileParentId === undefined) {
        // 默认从 路径信息的面包屑导航 数据中获取最后一位元素
        fileParentId = this.cardBreadcrumbs[this.cardBreadcrumbs.length - 1].fileId
      }
      search({
        page: page,
        fileParentId: fileParentId,
        fileFolder: true
      }).then((response) => {
        // 重置文件列表数据
        if (resetData !== undefined && resetData) {
          this.fileList = []
        }

        // 当前pid为0 ，同时文件夹列表为空的
        if (fileParentId === 0 && response.data['toTal'] === 0) {
          // 直接抛出成功的事件
          this.cardConfirm()
          return
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
        this.cardShow = true
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
        this.getFileFolderListInfo(this.page, null)
      }
    },
    /**
     * 当前页面的文件夹列表-单击执行事件
     * @param item 当前选中的对象
     * @param isParentSelect 是否为父级的选中 true:取消之前所选，单独选中父级
     */
    click: function (item, isParentSelect) {
      if (isParentSelect || !item.select) {
        // 取消之前所选的
        this.fileList.forEach(res => {
          if (res.select) {
            res.select = false
          }
        })
      }

      // 如果当前选中对象不是父级
      if (!isParentSelect) {
        // 选中当前数据
        item.select = !item.select
        // 父级取消选中
        this.fileParentSelect = false
        return
      }
      this.fileParentSelect = !this.fileParentSelect
    },
    /**
     * 文件夹列表 - 双击事件
     * @param item 当前双击要打开的对象
     * @param isParentSelect 是否为父级的选中 true:取消之前所选，单独选中父级
     */
    doubleClick: function (item, isParentSelect) {
      // 设置当前页码为1
      this.page = 1
      // 返回上一层级
      if (isParentSelect) {
        let fileParentId = this.cardBreadcrumbs[this.cardBreadcrumbs.length - 2].fileId
        this.getFileFolderListInfo(this.page, fileParentId, true, response => {
          this.$emit('card-folder-previous', fileParentId)
        })
      } else {
        // 下一级
        this.getFileFolderListInfo(this.page, item.fileId, true, res => {
          // 增加面包屑导航数据
          this.$emit('card-folder-next', {
            fileId: item.fileId,
            fileName: item.fileName
          })
        })
      }
    },
    /**
     * 面包屑breadcrumbs数组截断
     * 将当前目录的路径转为字符串输出
     */
    breadcrumbsTruncation: function () {
      // 当前可以显示的 ，非首页路径字符串
      let breadcrumbs = this.cardBreadcrumbs.filter(res => res.fileId !== 0)
      if (!breadcrumbs.length) {
        // 如果是空的
        return '/'
      }
      return '/' + breadcrumbs.map(item => item.fileName).join('/') + '/'
    },
    /**
     * 卡片面板中文件夹列表对应的滚动条事件
     */
    cardFileListScroll () {
      // 变量scrollTop是滚动条滚动时，距离顶部的距离
      let scrollTop = this.$refs.cardFileList.scrollTop
      // 变量windowHeight是可视区的高度
      let windowHeight = this.$refs.cardFileList.clientHeight
      // 变量scrollHeight是滚动条的总高度
      let scrollHeight = this.$refs.cardFileList.scrollHeight
      console.log((Math.floor(scrollTop) + windowHeight) + 1, scrollHeight)
      // 滚动条到底部的条件
      if ((Math.floor(scrollTop) + windowHeight) + 1 === scrollHeight) {
        // 加载下一页
        this.nextPage()
      }
    },
    /**
     * 确认执行动作
     */
    cardConfirm () {
      // 获取当前选中的文件夹
      let currentlySelectedFileFolder = this.fileList.filter(res => res.select)
      // 记录选中的文件夹的文件id
      let currentlySelectedValue
      if (!currentlySelectedFileFolder.length) {
        // 判断文件父级是否被选中
        currentlySelectedValue = this.cardBreadcrumbs[this.cardBreadcrumbs.length - (this.fileParentSelect ? 2 : 1)].fileId
      } else {
        currentlySelectedValue = currentlySelectedFileFolder[0].fileId
      }
      // 向父级抛出确认事件
      this.$emit('card-confirm', currentlySelectedValue, this.cardTitle)
    }
  }
}
</script>

<style lang="scss" scoped>
.fileTreeList {
  -webkit-transition: transform .2s ease;
  transition: transform .2s ease;
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
  z-index: 1999;
}

.image-ex-container {
  margin: auto;
  overflow: hidden;
  position: relative
}

.image-ex-img {
  position: absolute
}

.image-ex-img-center {
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  position: absolute;
  -webkit-transition: none;
  transition: none
}

.image-ex-img-ready {
  left: 0;
  top: 0;
  -webkit-transition: -webkit-transform .1s ease;
  transition: -webkit-transform .1s ease;
}

:root {
  --blue: #2196f3;
  --dark-blue: #1e88e5;
  --red: #f44336;
  --dark-red: #d32f2f;
  --moon-grey: #f2f2f2
}

.material-icons {
  vertical-align: sub;
  line-height: 1.4;
  font-size: 1.75em;
  margin-right: .25em;
}

.button {
  outline: 0;
  padding: .5em 1em;
  border-radius: .1em;
  background: var(--blue);
  color: #fff;
  border: 1px solid rgba(0, 0, 0, .05);
  -webkit-box-shadow: 0 0 5px rgba(0, 0, 0, .05);
  box-shadow: 0 0 5px rgba(0, 0, 0, .05);
  -webkit-transition: all .1s ease;
  transition: all .1s ease;
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
}

.button:hover {
  background-color: #1e88e5
}

.button--block {
  margin: 0 0 .5em;
  display: block;
  width: 100%
}

.button--red {
  background: var(--red)
}

.button--blue {
  background: #2196f3
}

.button--flat {
  color: #1e88e5;
  background: transparent;
  -webkit-box-shadow: 0 0 0;
  box-shadow: 0 0 0;
  border: 0;
  text-transform: uppercase
}

.button--flat.button--red {
  color: var(--dark-red)
}

.button--flat.button--grey {
  color: #6f6f6f
}

.button[disabled] {
  opacity: .5;
  cursor: not-allowed
}

.input {
  border-radius: .1em;
  padding: .5em 1em;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, .1);
  -webkit-transition: all .2s ease;
  transition: all .2s ease;
  color: #333;
  margin: 0
}

.input:focus, .input:hover {
  border-color: rgba(0, 0, 0, .2)
}

.input--block {
  margin-bottom: .5em;
  display: block;
  width: 100%
}

.input--textarea {
  line-height: 1.15;
  font-family: monospace;
  min-height: 10em;
  resize: vertical
}

.input--red {
  background: #fcd0cd
}

.input--green {
  background: #c9f2da
}

.shell {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 25em;
  max-height: calc(100% - 4em);
  background: #fff;
  color: #212121;
  z-index: 9999;
  width: 100%;
  font-family: monospace;
  overflow: auto;
  font-size: 1rem;
  cursor: text;
  -webkit-box-shadow: 0 0 5px rgba(0, 0, 0, .1);
  box-shadow: 0 0 5px rgba(0, 0, 0, .1);
  -webkit-transition: transform .2s ease;
  transition: transform .2s ease
}

.shell__result {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  padding: .5em;
  -webkit-box-align: start;
  -ms-flex-align: start;
  align-items: flex-start;
  border-top: 1px solid rgba(0, 0, 0, .05)
}

.shell--hidden {
  -webkit-transform: translateY(105%);
  transform: translateY(105%)
}

.shell__result--hidden {
  opacity: 0
}

.shell__prompt, .shell__prompt i, .shell__text {
  font-size: inherit
}

.shell__prompt {
  width: 1.2rem
}

.shell__prompt i {
  color: var(--blue)
}

.shell__text {
  margin: 0;
  font-family: inherit;
  white-space: pre-wrap;
  width: 100%
}

.share__box {
  text-align: center;
  -webkit-box-shadow: rgba(0, 0, 0, .06) 0 1px 3px, rgba(0, 0, 0, .12) 0 1px 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .06), 0 1px 2px rgba(0, 0, 0, .12);
  background: #fff;
  display: block;
  border-radius: .2em;
  width: 90%;
  max-width: 25em;
  margin: 6em auto
}

.share__box__download {
  width: 100%;
  padding: 1em;
  background: #fff;
  color: rgba(0, 0, 0, .5);
  border-bottom: 1px solid rgba(0, 0, 0, .05)
}

.share__box__info {
  padding: 2em 3em
}

.share__box__title {
  margin-top: .2em;
  overflow: hidden;
  text-overflow: ellipsis
}

.button--flat:hover {
  background: #f2f2f2;
}

body {
  font-family: Roboto, sans-serif;
  padding-top: 4em;
  background-color: #fafafa;
  color: #333
}

* {
  -webkit-box-sizing: border-box;
  box-sizing: border-box
}

*, :active, :focus, :hover {
  outline: 0
}

a {
  text-decoration: none
}

img {
  max-width: 100%
}

audio, video {
  width: 100%
}

.mobile-only {
  display: none !important
}

.container {
  width: 95%;
  max-width: 960px;
  margin: 1em auto 0
}

i.spin {
  -webkit-animation: spin 1s linear infinite;
  animation: spin 1s linear infinite
}

#app {
  -webkit-transition: padding .2s ease;
  transition: padding .2s ease
}

#app.multiple {
  padding-bottom: 4em
}

li code, p code {
  background: rgba(0, 0, 0, .05);
  padding: .1em;
  border-radius: .2em
}

.small {
  font-size: .8em;
  line-height: 1.5
}

.card {
  position: relative;
  margin: .5rem 0 1rem 0;
  background-color: #fff;
  border-radius: 2px;
  -webkit-box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12), 0 3px 1px -2px rgba(0, 0, 0, .2);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 5px 0 rgba(0, 0, 0, .12), 0 3px 1px -2px rgba(0, 0, 0, .2);
  overflow: auto
}

.card.floating {
  position: fixed;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  max-width: 25em;
  width: 90%;
  max-height: 95%;
  z-index: 1002;
  -webkit-animation: show .1s forwards;
  animation: show .1s forwards
}

.card > * > :first-child {
  margin-top: 0
}

.card > * > :last-child {
  margin-bottom: 0
}

.card .card-title {
  padding: 1.5em 1em 1em;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex
}

.card .card-title > :first-child {
  margin-right: auto
}

.card > div {
  padding: 1em 1em
}

.card > div:first-child {
  padding-top: 1.5em
}

.card > div:last-child {
  padding-bottom: 1.5em
}

.card .card-title * {
  margin: 0
}

.card .card-action {
  text-align: right
}

.card .card-content.full {
  padding-bottom: 0
}

.card h2, .card h3 {
  font-weight: 500
}

.card h3 {
  color: rgba(0, 0, 0, .53);
  font-size: 1em;
  margin: 2em 0 1em
}

.card-content table {
  margin: 0 -1em;
  width: calc(100% + 2em)
}

.card code {
  word-wrap: break-word
}

code, kbd, samp {
  font-family: monospace, monospace;
  font-size: 1em;
}

.card#download {
  max-width: 15em
}

.card#share ul {
  list-style: none;
  padding: 0;
  margin: 0
}

.card#share ul li {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center
}

.card#share ul li a {
  color: #2196F3;
  margin-right: auto
}

.card#share ul li .action i {
  font-size: 1em
}

.card#share ul li input, .card#share ul li select {
  padding: .2em;
  margin-right: .5em;
  border: 1px solid #dadada
}

.card#share .action.copy-clipboard:after {
  content: "Copied!";
  position: absolute;
  left: -25%;
  width: 150%;
  font-size: .6em;
  text-align: center;
  background: #44a6f5;
  color: #fff;
  padding: .5em .2em;
  border-radius: .4em;
  top: -2em;
  -webkit-transition: opacity .1s ease;
  transition: opacity .1s ease;
  opacity: 0
}

.card#share .action.copy-clipboard.active:after {
  opacity: 1
}

.overlay {
  background-color: rgba(0, 0, 0, .5);
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 1001;
  -webkit-animation: show .1s forwards;
  animation: show .1s forwards
}

.file-list {
  max-height: 50vh;
  overflow: auto;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%
}

.file-list li {
  color: #6f6f6f;
  width: 100%;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  border-radius: .2em;
  padding: .3em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.file-list li[aria-selected=true] {
  background: #2196f3 !important;
  color: #fff !important;
  -webkit-transition: all .1s ease;
  transition: all .1s ease
}

.file-list li:hover {
  background-color: #e9eaeb;
}

.file-list li[aria-selected=true]:before {
  color: #fff
}

@-webkit-keyframes show {
  0% {
    display: none;
    opacity: 0
  }
  1% {
    display: block;
    opacity: 0
  }
  to {
    display: block;
    opacity: 1
  }
}

@keyframes show {
  0% {
    display: none;
    opacity: 0
  }
  1% {
    display: block;
    opacity: 0
  }
  to {
    display: block;
    opacity: 1
  }
}

.collapsible {
  border-top: 1px solid rgba(0, 0, 0, .1)
}

.collapsible:last-of-type {
  border-bottom: 1px solid rgba(0, 0, 0, .1)
}

.collapsible > input {
  display: none
}

.collapsible > label {
  padding: 1em 0;
  border-right: 0;
  border-left: 0;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between
}

.collapsible > label * {
  margin: 0;
  color: rgba(0, 0, 0, .57)
}

.collapsible > label i {
  -webkit-transition: transform .2s ease;
  transition: transform .2s ease;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none
}

.collapsible .collapse {
  max-height: 0;
  overflow: hidden;
  -webkit-transition: all .2s ease;
  transition: all .2s ease
}

.collapsible > input:checked ~ .collapse {
  padding-top: 1em;
  padding-bottom: 1em;
  max-height: 20em
}

.collapsible > input:checked ~ label i {
  -webkit-transform: rotate(180deg);
  transform: rotate(180deg)
}

.card .collapsible {
  width: calc(100% + 2em);
  margin: 0 -1em
}

.card .collapsible > label {
  padding: 1em
}

.card .collapsible .collapse {
  padding: 0 1em
}

.card .card-action.full {
  padding-top: 0;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap
}

.card .card-action.full .action {
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  padding: 2em;
  border-radius: .2em;
  border: 1px solid rgba(0, 0, 0, .1);
  text-align: center;
  margin: 0 .25em .5em
}

.card .card-action.full .action i {
  display: block;
  padding: 0;
  margin-bottom: .25em;
  font-size: 4em
}

.card .card-action.full .action .title {
  font-size: 1.5em;
  font-weight: 500
}

@-webkit-keyframes opac {
  0% {
    opacity: 0
  }
  to {
    opacity: 1
  }
}

@keyframes opac {
  0% {
    opacity: 0
  }
  to {
    opacity: 1
  }
}

@media (max-width: 1024px) {
  nav {
    width: 10em
  }
}

@media (max-width: 1024px) {
  main {
    width: calc(100% - 13em)
  }
}

@media (min-width: 736px) {
  .share__box__download {
    cursor: pointer;
  }

  .button {
    cursor: pointer;
  }

  .card#share ul li a {
    cursor: pointer;
  }

  .collapsible > label {
    cursor: pointer;
  }

  .file-list li:hover {
    cursor: pointer;
  }

  #click-overlay {
    cursor: pointer;
  }
}

@media (max-width: 736px) {
  body {
    padding-bottom: 5em
  }
  #listing.list .item .size {
    display: none
  }
  #listing.list .item .name {
    width: 60%
  }
  #more {
    display: inherit
  }
  header .overlay {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .1)
  }
  header .search-button, header > div:first-child > .action {
    display: inherit
  }
  header img {
    display: none
  }
  #listing {
    margin-bottom: 5em
  }
  main {
    margin: 0 1em;
    width: calc(100% - 2em)
  }
  #search {
    display: none
  }
  #search.active {
    display: block
  }
}

@media (max-width: 450px) {
  #listing.list .item .modified {
    display: none
  }
  #listing.list .item .name {
    width: 100%
  }
}

.link {
  color: var(--blue)
}

#click-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%
}

#click-overlay.active {
  display: block
}

.action .counter {
  display: block;
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--blue);
  color: #fff;
  border-radius: 50%;
  font-size: .75em;
  width: 1.5em;
  height: 1.5em;
  text-align: center;
  line-height: 1.25em;
  border: 2px solid #fff
}

#previewer {
  background-color: rgba(0, 0, 0, .9);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  overflow: hidden
}

#previewer .bar {
  width: 100%;
  text-align: right;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  padding: .5em;
  height: 3.7em
}

#previewer .bar .title {
  margin-right: auto;
  padding: 0 1em;
  line-height: 2.7em;
  overflow: hidden;
  word-break: break-word;
  color: #fff
}

#previewer .action i {
  color: #fff
}

#previewer .action:hover {
  background-color: hsla(0, 0%, 100%, .3)
}

#previewer .action span {
  display: none
}

#previewer .preview {
  margin: 2em auto 4em;
  max-width: 80%;
  text-align: center;
  height: calc(100vh - 9.7em)
}

#previewer .preview pre {
  text-align: left;
  overflow: auto
}

#previewer .preview img, #previewer .preview pre, #previewer .preview video {
  max-height: 100%;
  margin: 0
}

#previewer .pdf {
  width: 100%;
  height: 100%
}

#previewer h2.message {
  color: hsla(0, 0%, 100%, .5)
}

#previewer > button {
  margin: 0;
  position: fixed;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%)
}

#previewer > button:first-of-type {
  left: .5em
}

#previewer > button:last-of-type {
  right: .5em
}

#editor-container {
  background-color: #fafafa;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  overflow: hidden
}

#editor-container .bar {
  width: 100%;
  text-align: right;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  padding: .5em;
  height: 3.7em;
  background-color: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, .075);
  -webkit-box-shadow: 0 0 5px rgba(0, 0, 0, .1);
  box-shadow: 0 0 5px rgba(0, 0, 0, .1)
}

#editor-container .title {
  margin-right: auto;
  padding: 0 1em;
  line-height: 2.7em;
  overflow: hidden;
  word-break: break-word
}

#previewer .title span {
  font-size: 1.2em
}

#previewer .loading {
  height: 100%;
  width: 100%
}

#editor-container #editor {
  height: calc(100vh - 8.2em)
}

.noty_buttons {
  text-align: right;
  padding: 0 10px 10px !important
}

.noty_buttons button {
  background: rgba(0, 0, 0, .05);
  border: 1px solid rgba(0, 0, 0, .1);
  -webkit-box-shadow: 0 0 0 0;
  box-shadow: 0 0 0 0;
  font-size: 14px
}

.credits {
  font-size: .6em;
  margin: 3em 2.5em;
  color: #a5a5a5
}

.credits > span {
  display: block;
  margin: .3em 0
}

.credits a, .credits a:hover {
  color: inherit;
  cursor: pointer
}

@-webkit-keyframes spin {
  to {
    -webkit-transform: rotate(-1turn);
    transform: rotate(-1turn)
  }
}

@keyframes spin {
  to {
    -webkit-transform: rotate(-1turn);
    transform: rotate(-1turn)
  }
}

.rules > div {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  margin: .5rem 0
}

.rules input[type=checkbox] {
  margin-right: .2rem
}

.rules input[type=text] {
  border: 1px solid #ddd;
  padding: .2rem
}

.rules label {
  margin-right: .5rem
}

.rules button {
  margin-left: auto
}

.rules button.delete {
  padding: .2rem .5rem;
  margin-left: .5rem
}

</style>
