<template>
  <div class="home">
    <el-progress
      v-show="progressShow"
      :show-text="false"
      :percentage="progress"
    ></el-progress>
    <el-header>
      <div class="spanbutt">
        <!-- 上传 -->
        <el-upload
          class="sc"
          title="上传文件"
          :data="head"
          :multiple="false"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :http-request="uploadRequest"
          action="https://upload.qiniup.com"
        >
          <i class="el-icon-upload" />

        </el-upload>

        <div>
          <!-- 删除 -->
          <span
            class="el-icon-delete-solid"
            title="立即刪除"
            v-show="isOperation"
            @click="del"
          ></span>
          <!-- 编辑 -->
          <span
            v-show="isMultiSelect"
            title="编辑文件"
            @click="edit"
            class="el-icon-edit"
          ></span>
        </div>

      </div>

    </el-header>
    <el-container>
      <el-aside
        width="400px;"
        style="border-right: solid 1px #e6e6e6;"
      >
        <el-menu
          default-active="2"
          class="el-menu-vertical-demo"
          style="border-right: none"
          router
        >

          <el-menu-item @click="myFile()">
            <i class="el-icon-folder"></i>
            <span slot="title">我的文件</span>
          </el-menu-item>
          <el-menu-item @click="insertFileFolder()">
            <i class="el-icon-folder-add"></i>
            <span slot="title">新建文件夹</span>
          </el-menu-item>
          <el-menu-item @click="logout()">
            <i class="el-icon-switch-button"></i>
            <span slot="title">退出登陆</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>

        <el-main>
          <router-view
            :file="file"
            :path="path"
            @getBreadcrumbs="breadcrumb"
            @getCurrentFile="currentFile"
            @getOperation="operation"
            @getMultiSelect="multiSelect"
          ></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { logout } from '@/api/login'
import { getToken, upload } from '@/api/qiniu'
import { search, insertFileFolder, deleteFile, renameFile } from '@/api/file'
import { resetRouter } from '@/router/index'
import cookies from 'js-cookie'

export default {
  name: 'home',
  data () {
    return {
      progressShow: false,
      progress: 0,
      file: [],
      // 当前目录的文件列表信息
      current: [],
      path: [],
      breadcrumbs: [{
        fileName: '/',
        fileId: 0
      }],
      // 是否显示复制粘贴移动
      isOperation: false,
      // 是否显示重命名
      isMultiSelect: false,
      head: {
        token: '',
        key: ''
      }
    }
  },
  methods: {
    /**
     * 覆盖 element 原有的上传请求
     */
    uploadRequest: function (request) {
      // 根据下标获取数据
      let breadcrumbs = this.breadcrumbs[this.breadcrumbs.length - 1]
      getToken({
        fileName: request.file.name,
        fileParentId: breadcrumbs.fileId
      }).then(response => {
        const key = response.data.key
        const token = response.data.token
        // 显示进度条
        this.progressShow = true
        upload(
          token,
          key,
          request,
          next => {
            let total = next.total
            console.log(total)
            // 设置进度条百分比
            this.progress = total.percent
          },
          error => {
            console.log(error)
          },
          complete => {
            // 隐藏进度条
            this.progressShow = false
            this.progress = 0
            // 根据下标获取数据
            let breadcrumbs = this.breadcrumbs[this.breadcrumbs.length - 1]
            search({
              page: 1,
              fileParentId: breadcrumbs.fileId
            }).then((response) => {
              this.file = response.data.diskFile
            }).catch((err) => {
              console.log(err)
            })
          }
        )
      }).catch(err => {
        console.log(err)
      })
    },
    /**
     * 文件上传前调用的函数
     */
    beforeUpload (file) {
      let regular = /^((?!\\|\/|:|\*|\?|<|>|\||'|%).){1,50}$/
      if (!regular.test(file.name)) {
        this.$message.error('文件名50个字符以内，不包含特殊字符')
        return false
      }
      return true
    },
    logout: function () {
      this.$confirm('确认退出吗?', '提示').then(() => {
        logout().then((response) => {
          console.log(response)
          // 重置路由
          resetRouter()
          cookies.remove('userInfo')
          this.$router.push({ name: 'login' })
          // 删除保存的用户密钥数据
          localStorage.removeItem('secretKey')
        }).catch((err) => {
          console.log(err)
        })
      }).catch(() => { })
    },
    /**
     * 新建文件夹
     */
    insertFileFolder: function () {
      // 根据下标获取数据
      let breadcrumbs = this.breadcrumbs[this.breadcrumbs.length - 1]
      // 获取当前路径
      this.$prompt('请输入新目录的名称。', '新建目录', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^((?!\\|\/|:|\*|\?|<|>|\||'|%).){1,50}$/,
        inputErrorMessage: '50个字符以内，不包含特殊字符'
      }).then(({ value }) => {
        insertFileFolder({
          fileId: 0,
          fileName: value,
          fileParentId: breadcrumbs.fileId
        }).then((response) => {
          console.log(response.data)
          this.current.unshift(response.data)
          console.log(this.current)
          this.$message({
            type: 'success',
            message: response.message
          })
        }).catch((err) => {
          console.log(err)
        })
      }).catch(() => { })
    },
    /**
     * 我的文件
     */
    myFile: function () {
      search({
        page: 1,
        fileParentId: 0
      }).then((response) => {
        this.progressShow = false
        this.progress = 0
        this.file = response.data.diskFile
        console.log(response.data.diskFile)
        // 当前目录的文件列表信息
        this.current = response.data.diskFile
        this.path = [{
          fileName: '/',
          fileId: 0
        }]
        this.breadcrumbs = [{
          fileName: '/',
          fileId: 0
        }]
        // 是否显示复制粘贴移动
        this.isOperation = false
        // 是否显示重命名
        this.isMultiSelect = false
        this.head = {
          token: '',
          key: ''
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    /**
     * 面包屑数据同步
     */
    breadcrumb: function (val) {
      this.breadcrumbs = val
    },
    /**
     * 当前的文件路径数据同步
     */
    currentFile: function (val) {
      this.current = val
    },
    /**
     * 是否进行操作的数据同步
     */
    operation: function (val) {
      this.isOperation = val
    },
    /**
     * 是否显示重命名的数据同步
     */
    multiSelect: function (val) {
      this.isMultiSelect = val
    },
    /**
     * 文件删除
     */
    del: function () {
      this.$confirm('你确定要删除这个文件/文件夹吗?', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }).then(() => {
        // 获取当前选中值
        for (let item of document.getElementsByClassName('item')) {
          if (item.dataset.selected === 'true') {
            // 文件id
            let fileid = item.getAttribute('fileid')
            deleteFile({
              fileId: fileid
            }).then((response) => {
              // 删除自生元素
              item.remove()
              // 取消操作的显示
              this.isOperation = false
              this.isMultiSelect = false
              // 删除成功的提示框
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              console.log(response)
              this.current.map((currentFile, index) => {
                if (currentFile.fileId === fileid) {
                  console.log(this.current.splice(index, 1))
                }
              })
              console.log(this.current)
            }).catch((err) => {
              console.log(err)
            })
          }
        }
      }).catch(() => { })
    },
    /**
     * 文件/文件夹重命名
     */
    edit: function () {
      let id = 0
      let name = ''
      // 获取当前选中值
      for (let item of document.getElementsByClassName('item')) {
        if (item.dataset.selected === 'true') {
          id = item.getAttribute('fileid')
          name = item.getAttribute('name')
        }
      }
      if (id !== 0) {
        let omit = ''
        if (name.length > 8) {
          omit = name.slice(0, 8) + '...'
        }
        this.$prompt(`请输入新名称，旧名称为:${omit}`, '重命名', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: name,
          inputPattern: /^((?!\\|\/|:|\*|\?|<|>|\||'|%).){1,50}$/,
          inputErrorMessage: '50个字符以内，不包含特殊字符'
        }).then(({ value }) => {
          renameFile({
            fileId: id,
            newFileName: value
          }).then((response) => {
            console.log(this.current)
            // 替换数据中原有值
            this.current.forEach((res) => {
              if (res.fileId === parseInt(id)) {
                res.fileName = value
              }
            })
            // 替换页面中原有值
            this.file = this.current
            // 成功的提示框
            this.$message({
              type: 'success',
              message: '修改成功!'
            })
            console.log(response)
          }).catch((err) => {
            console.log(err)
          })
        }).catch(() => { })
      }
    }
  }
}
</script>

<style scoped>
.el-icon-upload:link {
  color: #333 !important;
}
.el-icon-upload:visited {
  color: #333 !important;
}
.el-icon-upload:active {
  color: #333 !important;
}
.el-icon-upload:hover {
  color: #333 !important;
}
.el-header,
.el-footer {
  background-color: #fff;
  color: #333;
  text-align: center;
  line-height: 60px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.075);
}
.el-header {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}
.el-aside {
  position: fixed;
  left: 0;
  top: 60px;
  width: 220px;
  height: calc(100% - 60px);
}
.el-container {
  width: calc(100% - 220px);
  float: right;
}
.el-main {
  color: #333;
  text-align: center;
  line-height: 80px;
  padding: 0px;
}
.el-dialog.is-fullscreen {
  background: rgba(0, 0, 0, 0.9);
}
body > .el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}

.spanbutt {
  float: right;
  font-size: 24px;
  letter-spacing: 8px;
}
.sc {
  width: 45px;
  text-align: right;
}
.spanbutt > div {
  float: right;
}
.el-breadcrumb__separator {
  display: block;
}
</style>
