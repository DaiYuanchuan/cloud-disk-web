<template>
  <div class="file-panel">

    <!-- 文件列表部分 -->
    <div id="listing" class="list">

      <!-- 取消分享按钮部分 -->
      <div class="breadcrumbs">
        <span class="breadcrumb-item shadow">
          <i class="shadow material-icons">
            <svg-icon icon-class="file-home"></svg-icon>
          </i>
        </span>
      </div>

      <div v-if="!shareList.length">
        <h2 class="message">
          <i class="material-icons">
            <svg-icon icon-class="file-crying-face"></svg-icon>
          </i>
          <span>你还没有进行分享...</span>
        </h2>
      </div>

      <!-- title -->
      <div v-else class="list-title">
        <div class="item header">
          <div></div>
          <div>
            <p role="button" tabindex="0" title="分享文件" aria-label="分享文件" class="name">
              <span>分享文件</span>
            </p>
            <p role="button" tabindex="0" title="分享链接" aria-label="分享链接" class="shareLink">
              <span>分享链接</span>
            </p>
            <p role="button" tabindex="0" title="提取码" aria-label="提取码" class="code">
              <span>提取码</span>
            </p>
            <p role="button" tabindex="0" title="有效期" aria-label="有效期" class="code">
              <span>有效期</span>
            </p>
            <p role="button" tabindex="0" title="浏览次数" aria-label="浏览次数" class="code">
              <span>浏览次数</span>
            </p>
            <p role="button" tabindex="0" title="分享时间" aria-label="分享时间" class="code">
              <span>分享时间</span>
            </p>
          </div>
        </div>
      </div>

      <div class="list-file">
        <div role="button" tabindex="0" draggable="true" data-dir="true" aria-label="cloud.api.novelweb.cn"
             class="item">
          <div>
            <i class="material-icons">
              <svg-icon icon-class="file"></svg-icon>
            </i>
          </div>
          <div><p class="name">cloud.api.novelweb.cn</p>
            <p data-order="-1" class="size">—</p>
            <p class="modified">
              <time>26 分钟前</time>
            </p>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
export default {
  name: 'share-record',
  data () {
    return {
      // 我的分享列表
      shareList: [
        {
          'shareId': 63,
          'shareUserId': 13,
          'shareFileIds': '4989,4988,4987',
          'shareFileName': 'w',
          'shareShortUrl': 'http://localhost:9527/#/s/07DC4EB8B11542238DDDAC6B12837C9B',
          'shareShort': '07DC4EB8B11542238DDDAC6B12837C9B',
          'shareCode': 'i1l2',
          'shareViewCount': 0,
          'shareSaveCount': 0,
          'shareDownloadCount': 0,
          'shareExpirationTime': 86400,
          'shareExpirationTimeFormat': '1天',
          'expiration': false,
          'includeFolder': true,
          'createTime': '2021-03-30 14:58:37'
        },
        {
          'shareId': 62,
          'shareUserId': 13,
          'shareFileIds': '4988,4987',
          'shareFileName': '猫和老鼠.mp4',
          'shareShortUrl': 'http://localhost:9527/#/s/CEEB839650B049BAB3DEEB4FCE2C9544',
          'shareShort': 'CEEB839650B049BAB3DEEB4FCE2C9544',
          'shareCode': 'ra7p',
          'shareViewCount': 0,
          'shareSaveCount': 0,
          'shareDownloadCount': 0,
          'shareExpirationTime': 86400,
          'shareExpirationTimeFormat': '1天',
          'expiration': false,
          'includeFolder': false,
          'createTime': '2021-03-30 14:58:19'
        }
      ]
    }
  },
  methods: {}
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

#listing.list .item .shareLink {
  width: 25%;
}

#listing .item .code, #listing .item .shareLink {
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

.el-image-viewer__canvas {
  max-height: 83%;
  max-width: 85%;
  margin: 0 auto;
}

#previewVideo {
  top: 10%;
}

@media (max-width: 769px) {
  #listing.list .item .name {
    width: 17em;
  }
}

@media (min-width: 736px) {
  .list-file {
    cursor: pointer
  }

  .breadcrumbs .shadow:hover {
    cursor: pointer;
    background-color: rgba(0, 0, 0, .05);
  }
}

@media (max-width: 736px) {
  #listing.list .item .shareLink {
    display: none !important;
  }
}

@media (max-width: 451px) {
  #listing.list .item .code {
    display: none !important;
  }

  #listing.list .item .name {
    width: 15em;
  }
}

@media (max-width: 415px) {
  #listing.list .item .name {
    width: 17em;
  }
}

@media (max-width: 376px) {
  #listing.list .item .name {
    width: 14em;
  }
}

@media (max-width: 331px) {
  #listing.list .item .name {
    width: 10em;
  }
}
</style>
