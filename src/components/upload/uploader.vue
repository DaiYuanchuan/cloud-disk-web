<template>
  <div
    id="global-uploader"
    v-show="displayUploadPanel"
  >
    <div class="uploader-list">
      <!-- title -->
      <div class="file-title">
        <p class="file-list-title">文件列表</p>
        <div class="operate">
          <el-button
            type="text"
            @click="operate"
            :title="unfoldFileList ? '折叠' : '展开' "
          >
            <i :class="unfoldFileList ? 'el-icon-caret-bottom' : 'el-icon-caret-top'"></i>
          </el-button>
          <el-button
            type="text"
            class="global-uploader-close-btn"
            title="关闭"
            @click="$emit('close')"
          >
            <i class="uploader-close-icon">×</i>
          </el-button>
        </div>
      </div>

      <!-- file-list -->
      <slot
        :file-list="fileList"
        :display-upload-panel="displayUploadPanel"
      >
        <ul
          class="file-list"
          ref="upFileList"
        >
          <li
            v-for="(item,key) in fileList"
            :key="key"
          >
            <div
              class="uploader-file"
              :status="item.status"
            >
              <!-- 背景进度条 -->
              <div
                class="uploader-file-progress"
                :style="item.progress"
              ></div>
              <div class="uploader-file-info">
                <div class="uploader-file-name">
                  <i
                    :icon="item.icon"
                    class="uploader-file-icon"
                  ></i>
                  {{ item.name }}
                </div>
                <div class="uploader-file-size">{{ item.size }}</div>
                <div class="uploader-file-meta"></div>
                <div class="uploader-file-status">
                  <span v-show="item.status !== 'uploading'">{{ item.state }}</span>
                  <!-- <span style="">paused</span> -->
                  <span v-show="item.status === 'uploading'">
                    <span>{{ item.progress.progress }}</span>
                  </span>
                </div>
                <div class="uploader-file-actions">
                  <!-- 暂停 -->
                  <span
                    class="uploader-file-pause"
                    @click="$emit('pause', item)"
                  ></span>
                  <!-- 开始 -->
                  <span
                    class="uploader-file-resume"
                    @click="$emit('resume', item)"
                  >️</span>
                  <!-- 重试 -->
                  <span
                    class="uploader-file-retry"
                    @click="$emit('retry', item)"
                  ></span>
                  <!-- 删除 -->
                  <span
                    class="uploader-file-remove"
                    @click="$emit('remove', item)"
                  ></span>
                </div>
              </div>
            </div>
          </li>
          <div
            class="no-file"
            v-if="!fileList.length"
          >
            暂无待上传文件
          </div>
        </ul>
      </slot>

    </div>
  </div>
</template>

<script>
export default {
  name: 'uploader',
  props: {
    // 上面面板中维护的文件上传列表
    fileList: {
      type: Array,
      default () {
        return {}
      }
    },
    // 是否显示文件上传面板
    displayUploadPanel: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data () {
    return {
      // 文件列表(ul - li)的展开、折叠
      unfoldFileList: true
    }
  },
  computed: {},
  methods: {
    /**
     * 折叠、展开面板动态切换
     */
    operate: function () {
      if (this.unfoldFileList) {
        // 折叠
        this.unfoldFileList = false
        this.$refs['upFileList'].style.height = '0px'
      } else {
        // 展开
        this.unfoldFileList = true
        this.$refs['upFileList'].style.height = '240px'
      }
    }
  }
}
</script>

<style scoped lang="scss">
#global-uploader {
  position: fixed;
  z-index: 20;
  right: 15px;
  bottom: 15px;
  width: 550px;
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
}

.uploader-list {
  position: relative;
  background-color: #fff;
  border: 1px solid #e2e2e2;
  border-radius: 7px 7px 0 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.uploader-list > ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.file-title {
  display: flex;
  height: 40px;
  line-height: 44px;
  padding: 0 15px;
  border-bottom: 1px solid #ddd;
}

.file-list-title {
  line-height: 10px;
}

.operate {
  flex: 1;
  text-align: right;
}

.global-uploader-close-btn i {
  font-weight: 800;
  font-size: 20px;
  color: #22b9ff;
}

.uploader-close-icon {
  font-family: layui-icon;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.el-icon-caret-bottom {
  color: #22b9ff;
}

.el-icon-caret-top {
  color: #22b9ff;
}

.file-list {
  position: relative;
  height: 240px;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #fff;
  padding: 0px;
  margin: 0 auto;
  transition: all 0.5s;
}

li {
  background-color: #fff;
  list-style-type: none;
}

.uploader-file {
  position: relative;
  height: 49px;
  line-height: 49px;
  overflow: hidden;
  border-bottom: 1px solid #cdcdcd;
}

/**
 * 根据状态[status] 值判断对应的样式显示
 */
.uploader-file[status='waiting'] .uploader-file-pause,
.uploader-file[status='uploading'] .uploader-file-pause {
  display: block;
}

.uploader-file[status='paused'] .uploader-file-resume {
  display: block;
}

.uploader-file[status='error'] .uploader-file-retry {
  display: block;
}

.uploader-file[status='success'] .uploader-file-remove {
  display: none;
}

.uploader-file[status='error'] .uploader-file-progress {
  background: #ffe0e0;
}

/**
 * 进度条
 */
.uploader-file-progress {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #e2eeff;
  transform: translateX(-100%);
}

/**
 * file-list 主体信息
 */
.uploader-file-info {
  position: relative;
  z-index: 1;
  height: 100%;
  overflow: hidden;
}

.uploader-file-info:hover {
  background-color: rgba(240, 240, 240, 0.2);
}

.uploader-file-info i,
.uploader-file-info em {
  font-style: normal;
}

.uploader-file-icon {
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: top;
  margin-top: 13px;
  margin-right: 8px;
}

.uploader-file-icon::before {
  content: '📃';
  display: block;
  height: 100%;
  font-size: 24px;
  line-height: 1;
  text-indent: 0;
}

.uploader-file-icon[icon='folder']::before {
  content: '📂';
}

.uploader-file-icon[icon='image']::before {
  content: '🖼️';
}

.uploader-file-icon[icon='video']::before {
  content: '🎬';
}

.uploader-file-icon[icon='audio']::before {
  content: '🎵';
}

.uploader-file-icon[icon='document']::before {
  content: '📋';
}

.uploader-file-size {
  width: 13%;
  text-indent: 10px;
}

.uploader-file-meta {
  width: 8%;
}

.uploader-file-status {
  width: 24%;
  text-indent: 20px;
}

.uploader-file-name,
.uploader-file-size,
.uploader-file-meta,
.uploader-file-status,
.uploader-file-actions {
  float: left;
  position: relative;
  height: 100%;
}

.uploader-file-name {
  width: 45%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-indent: 14px;
}

.uploader-file-actions {
  width: 10%;
}

.uploader-file-actions > span {
  display: none;
  float: left;
  width: 16px;
  height: 16px;
  margin-top: 16px;
  margin-right: 10px;
  cursor: pointer;
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAABkCAYAAAD0ZHJ6AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAJcEhZcwAACxMAAAsTAQCanBgAAARkSURBVGje7ZnfS1NRHMAH4ptPkvQSuAdBkCxD8FUQJMEULUgzy1KyyPVQ4JMiiP4Bvg6EwUQQfMmwhwRDshwaKUjDVCgoSdDNHkzTJZ6+Z37Purve8+PeTb2TM/ggu+ew89l33x8H9BBCPG7GowXTJej3+wnDvEm0JuLC04+EYWftVAUv+fiCvDUdQR1BHUEdQR3BTIygvixoQS14XgTtthLVdpNWwXRLqvQ724LplFRtyrYF0yVpFLQrKRVMh6RZ0I6kkmCqklaCqpKZH0FX56Crq9jVfdDVk0RfFrSgFsxkQVmLcdKCVrKySCrryhPEyYShhzOcrFtG0EoilfHHk1CRU5rF6ZjNZhlVOW6RnMSVyyilKies4pO41diVy8wIujoHXV3FGdMHXTtJKLFYTLhZtq4vC1rwXApCZTIqgR6g1PBMCO9DL3bMMSqBHqDU8EyISDAHiGKvWwcCQG2KgjlAFCDAOhAAap0K5gKLphk8mqJgLrCIgoxRJ4J5wKpJ7gAoMkn5EBXBPGDVJHcAFJmkfIhQcAql1oBpTvTol9gG9pm4RHAKpdaAaU706JfYBvaZuJVgPQrt4sFlnOh5MC/p3lmJYD0K7eLBZZzoeTAv6d5ZnuAYHjpgEOnk5F0ufhG6v1ggOIaHDhhEOjl5l4tfhO4vthLcwAMrFNvLJO5vEwhu4IEViu1lEve3WQmyoihQFBzG/V0CQVYUBYqCw7i/SxTBcpsRbFeIYLnNCLZbCY5b5KAnxRwct8hBj9McZFVMW0ihRNBuFdMWUigRlFaxuQ9WWYjRMTiIe5z0wSoLMToGB3GPsA9aTZIJoB+nRgBnM1tzOkkmgH6cGgGczWzNpzqLx3n/aULJJgezeNw07oxQySbVywKjBOgFRnDs+VEsx8FlgVEC9AIjOPb8KJYjvSzoG7UW1IJaUAtqQS14toLNM5fN5APdwBJA8G83Pk/aK/rgzVvXzeQD3cASQPBvNz5P2ssTzAaGUIrHEO6zI5gNDKEUjyHcxxWkh4Ylcowwk1QQpIeGJXKMMJO0EgwqyjGCioJBJvDrxRMSuVOTJEXfbz1/bHwWtBL0yoQehK6RucgE+bGzanzulQh6E3IgQV+xpc8kcrfuSO7eTfJ3ZYmQw0Oy9azVKOk1C/bJ5D5F38YPeLfx0rjWJxHsS0SqsSYuxySjj5qO5Oj7xQWy2VBtFOwzCy6ryH3YfE3uh64Y1xckgstJPydEjkkeHv07Iy4Xaao15+KCWTBx6M/db+T9xivSErqaJDdzXI6yLRE8Vgg0coex/SPJvT0SbWu0KpZtbgSpCH3NRt7I5OxHkObc6heU+/M/J5vrpBFM5GBLqCQux14COXs5CNXK5OjPGm1tSMrJSOMNYQ4mVTGV/L6zTL7+DovkbFUxbSW0Wo05l8hJWsU+cRWfSh+Mt5Lb1ck/J1TvVsdDaR/MiEni+llsdZuZp62EViu+96bpNjNPWwmtVnzvFd5m9IVVC54x/wA7gNvqFG9vXQAAAABJRU5ErkJggg==') no-repeat 0 0;
}

.uploader-file-actions > span:hover {
  background-position-x: -21px;
}

.uploader-file-actions .uploader-file-pause {
  background-position-y: 0;
}

.uploader-file-actions .uploader-file-resume {
  background-position-y: -17px;
}

.uploader-file-actions .uploader-file-retry {
  background-position-y: -53px;
}

.uploader-file-actions .uploader-file-remove {
  display: block;
  background-position-y: -34px;
}

.no-file {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
}

@media (max-width: 450px) {
  #global-uploader {
    width: 90%;
  }
}
</style>
