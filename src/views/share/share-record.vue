<template>
  <div class="file-panel">

    <!-- 文件列表部分 -->
    <div id="listing" class="list">
      <div class="action-btn">
        <el-button :disabled="handleSelectionValue.length !== 1" type="primary" round @click="copyMyShareUrl">
          <i class="el-icon-link"></i>
          复制链接
        </el-button>
        <el-button :disabled="!handleSelectionValue.length" type="primary" round @click="cancelShareBatch">
          <i class="el-icon-remove-outline"></i>
          取消分享
        </el-button>
      </div>
      <el-card class="box-card" shadow="always">
        <div slot="header" class="clearfix">
          <span>分享列表信息</span>
        </div>
        <!-- title -->
        <el-table :data="shareList" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" min-width="35"></el-table-column>
          <el-table-column prop="shareFileName" label="分享文件" min-width="350">
            <template slot-scope="scope">
              <el-button type="text" @click="newWindow(scope.$index, scope.row)">{{
                  scope.row.shareFileName
                }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="shareCode" label="提取码" min-width="80"></el-table-column>
          <el-table-column prop="shareExpirationTimeFormat" label="有效期" min-width="80">
            <template slot-scope="scope">
              {{ scope.row.expiration ? '已过期' : scope.row.shareExpirationTimeFormat }}
            </template>
          </el-table-column>
          <el-table-column prop="shareViewCount" label="浏览量" min-width="80"></el-table-column>
          <el-table-column prop="createTime" label="分享时间" min-width="180"></el-table-column>
          <el-table-column label="操作" min-width="230">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary" plain
                @click="rowCopyMyShareUrl(scope.$index, scope.row)">
                <i class="el-icon-link"></i>
                复制链接
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="rowCancelMyShare(scope.$index, scope.row)">
                <i class="el-icon-remove-outline"></i>
                取消分享
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pagination-pc" background
          layout="sizes, prev, pager, next, ->, total"
          @size-change="myShareListSizeChange"
          @current-change="myShareListCurrentChange"
          :total="shareListPagingInfo.toTal"
          :page-size="shareListPagingInfo.pageSize"
          :current-page="shareListPagingInfo.currentChange">
        </el-pagination>
        <el-pagination
          class="pagination-mobile" small
          layout="prev, pager, next"
          @size-change="myShareListSizeChange"
          @current-change="myShareListCurrentChange"
          :total="shareListPagingInfo.toTal"
          :page-size="shareListPagingInfo.pageSize"
          :current-page="shareListPagingInfo.currentChange">
        </el-pagination>
      </el-card>
    </div>

  </div>
</template>

<script>
import {share, cancelShare} from '@/api/share'
import {clipboard} from '@/utils/utils'
import cookies from 'js-cookie'

export default {
  name: 'share-record',
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
  data () {
    return {
      // 我的分享列表
      shareList: [],
      // 当前登录的用户对象信息
      userInfo: {},
      // 表格中被选中的值
      handleSelectionValue: [],
      // 我的分享表格的分页信息
      shareListPagingInfo: {
        // 总数
        toTal: 0,
        // 每页显示个数
        pageSize: 10,
        // 当前页码
        currentChange: 1
      }
    }
  },
  // 钩子函数：页面加载完成后执行
  mounted: function () {
    // 获取cookie缓存中的用户信息
    let userInfo = cookies.get('userInfo')
    if (userInfo === undefined) {
      // 如果在未登录的情况下使用，则跳转登录页面
      this.$router.push({name: 'login'})
      return
    }
    this.userInfo = JSON.parse(userInfo)
    // 判断上传空间容量，用户当前可用总容量 - 用户当前已经使用的容量 < 0
    if (userInfo['userTotalCapacity'] - userInfo['userUsedCapacity'] < 0) {
      this.$message({
        showClose: true,
        message: '存储空间不足，已限制分享功能',
        type: 'error'
      })
    }
    // 获取当前用户的分享列表
    this.getMyShareList(false)
  },
  methods: {
    /**
     * 获取我的分享文件列表
     * @param {Boolean} loading 是否需要加载loading面板
     */
    getMyShareList: function (loading) {
      share({
        page: this.shareListPagingInfo.currentChange,
        pageSize: this.shareListPagingInfo.pageSize
      }, loading).then(response => {
        this.shareListPagingInfo.toTal = response.data.toTal
        console.log(response)
        this.shareList = response.data['diskShare']
      }).catch((err) => {
        console.log(err)
      })
    },
    /**
     * pageSize 改变时会触发
     * @param size 每页条数
     */
    myShareListSizeChange: function (size) {
      this.shareListPagingInfo.pageSize = size
      // 重置当前页为第一页
      this.shareListPagingInfo.currentChange = 1
      // 重置表格数据
      this.getMyShareList(true)
    },
    /**
     * currentPage 改变时会触发
     * @param current 当前页
     */
    myShareListCurrentChange: function (current) {
      this.shareListPagingInfo.currentChange = current
      // 重置表格数据
      this.getMyShareList(true)
    },
    /**
     * 表格选择更改的change
     * @param val 被选中的值
     */
    handleSelectionChange: function (val) {
      this.handleSelectionValue = val
    },
    /**
     * 复制我的分享文件链接地址(表格中...)
     * @param index 下标
     * @param row 当前选中的行
     */
    rowCopyMyShareUrl: function (index, row) {
      // 向剪切板复制分享链接
      clipboard(this.userInfo.userName + '向您分享了' + row['shareFileName'] + '，您打开链接后可以享受不限速下载' +
        '\n链接：' + row['shareShortUrl'] +
        '\n有效期：' + row['shareExpirationTimeFormat'] + (row['shareCode'] === '' ? '' : '\n提取码：' + row['shareCode']))
      // 复制成功的提示框
      this.$message({
        showClose: true,
        type: 'success',
        message: '复制到剪切板了，粘贴给您的朋友吧~'
      })
    },
    /**
     * 取消我的分享链接(表格中...)
     * @param index 下标
     * @param row 当前选中的行
     */
    rowCancelMyShare: function (index, row) {
      this.$confirm('取消分享后，该条分享记录将被删除，您确认要取消分享吗？',
        '确认取消分享').then(() => {
        cancelShare({
          shareId: [row['shareId']]
        }).then(() => {
          // 取消外链分享成功的提示框
          this.$message({
            showClose: true,
            type: 'success',
            message: '取消外链分享成功!'
          })
          let toTal = this.shareListPagingInfo.toTal - 1
          this.shareListPagingInfo.toTal = toTal <= 0 ? 0 : toTal
          // 删除文件列表中对应的文件数据
          this.shareList = this.shareList.filter(item => item !== row)
        }).catch((err) => {
          console.log(err)
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    /**
     * 复制我的分享文件链接地址
     */
    copyMyShareUrl: function () {
      // 获取当前被选中的数据
      if (this.handleSelectionValue[0] !== undefined) {
        this.rowCopyMyShareUrl(0, this.handleSelectionValue[0])
      }
    },
    /**
     * 批量取消分享
     */
    cancelShareBatch: function () {
      let handleSelectionValue = this.handleSelectionValue
      // 获取当前被选中的数据
      if (!handleSelectionValue) {
        // 如果没有数据选中的 ，则不执行
        return
      }
      this.$confirm('取消分享后，该条分享记录将被删除，您确认要取消分享吗？',
        '确认取消分享').then(() => {
        cancelShare({
          shareId: handleSelectionValue.map(item => item.shareId)
        }).then(() => {
          // 取消外链分享成功的提示框
          this.$message({
            showClose: true,
            type: 'success',
            message: '取消外链分享成功!'
          })
          handleSelectionValue.forEach(res => {
            // 删除文件列表中对应的文件数据
            this.shareList = this.shareList.filter(item => item !== res)
          })
          // 重置分页的总数
          let toTal = this.shareListPagingInfo.toTal - handleSelectionValue.length
          this.shareListPagingInfo.toTal = toTal <= 0 ? 0 : toTal
        }).catch((err) => {
          console.log(err)
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    /**
     * 跳转新窗口
     * @param index 下标
     * @param row 当前选中的行
     */
    newWindow: function (index, row) {
      window.open(row['shareShortUrl'], '_blank')
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

.action-btn {
  margin-top: 10px;
}

.box-card {
  margin-top: 10px;
}

a {
  text-decoration: none;
  background-color: transparent;
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

.pagination-mobile {
  display: none;
}

p {
  display: block;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0;
  margin-inline-end: 0;
}

.el-image-viewer__canvas {
  max-height: 83%;
  max-width: 85%;
  margin: 0 auto;
}

/deep/ .el-table--fit {
  margin-bottom: 15px;
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
  .pagination-pc {
    display: none;
  }

  .pagination-mobile {
    display: block;
  }
}
</style>
