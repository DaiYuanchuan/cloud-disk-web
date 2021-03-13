<template>
  <div id="login">
    <img
      src="/static/svg/logo.svg"
      alt="File Browser"
    />
    <h1>文档管理器</h1>
    <el-form
      ref="loginForm"
      :model="form"
      :rules="rules"
      class="login-box"
    >
      <el-form-item prop="username">
        <el-input
          type="text"
          placeholder="邮箱/用户名"
          v-model="form.username"
          @keyup.enter.native="login('loginForm')"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          type="password"
          placeholder="请输入登录密码"
          v-model="form.password"
          @keyup.enter.native="login('loginForm')"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="login-button"
          v-on:click="login('loginForm')"
        > 登录
        </el-button>
      </el-form-item>
      <el-form-item class="login-blocks">
        <a
          class="keep-left"
          @click="forgotPasswd()"
        > 忘记密码 </a>

        <a
          class="keep-right"
          @click="registered()"
        > 免费注册 </a>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {validWeChatId, validEmail, validUsername} from '@/utils/validate'
import {login, secretKeyLogin} from '@/api/login'
import {asyncRoutes} from '@/router/routers'
import {resetRouter} from '@/router/index'
import cookies from 'js-cookie'

export default {
  name: 'login',
  data () {
    // 用户名校验
    const validateUsername = (rule, value, callback) => {
      if (validEmail(value) || validWeChatId(value)) {
        callback()
      } else {
        callback(new Error('用户名 6 ~ 20位，以字母开头'))
      }
    }
    // 密码校验
    const validatePassword = (rule, value, callback) => {
      console.log(validUsername(value))
      if (!validUsername(value)) {
        callback(new Error('密码 4 ~ 16位，不包含特殊字符'))
      } else {
        callback()
      }
    }
    return {
      form: {
        username: '',
        password: ''
      },
      // 表单验证，需要在 el-form-item 元素中增加 prop 属性
      rules: {
        username: [{required: true, trigger: 'blur', validator: validateUsername}],
        password: [{required: true, trigger: 'blur', validator: validatePassword}]
      }
    }
  },
  // 钩子函数：页面加载完成后执行
  mounted: function () {
    this.secretKeyLogin()
  },
  methods: {
    /**
     * 用户登录事件
     */
    login (formName) {
      // 为表单绑定验证功能
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 获取登录结果
          login({
            username: this.form.username,
            password: this.form.password
          }).then((response) => {
            console.log(response)
            cookies.set('userInfo', response.data.userInfo)
            // 保存用户密钥数据
            localStorage.setItem('secretKey', response.data.userInfo.userSecretKey)
            // 动态添加路由数据
            this.$router.addRoutes(asyncRoutes)
            this.$router.push({name: 'home'})
          }).catch((err) => {
            console.log(err)
          })
        }
      })
    },
    /**
     * 跳转用户注册
     */
    registered () {
      // 使用name跳转
      this.$router.push({name: 'register'})
    },
    /**
     * 跳转忘记密码
     */
    forgotPasswd () {
      this.$router.push({name: 'forgot-passwd'})
    },
    /**
     * 用户密钥登陆
     */
    secretKeyLogin () {
      let token = cookies.get('userInfo')
      if (token === undefined) {
        // 未登录的情况下
        // 获取缓存中localStorage的值
        let secretKey = localStorage.getItem('secretKey')
        if (secretKey != null) {
          secretKeyLogin(secretKey).then((response) => {
            console.log(response)
            cookies.set('userInfo', response.data.userInfo)
            // 保存用户密钥数据
            localStorage.setItem('secretKey', response.data.userInfo.userSecretKey)
            // 动态添加路由数据
            resetRouter()
            this.$router.addRoutes(asyncRoutes)
            this.$router.push({name: 'home'})
          }).catch((err) => {
            console.log(err)
            localStorage.removeItem('secretKey')
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.login-box {
  border: 1px solid #dcdfe6;
  width: 350px;
  margin: 45px auto;
  padding: 35px 35px 15px 35px;
  border-radius: 5px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  box-shadow: 0 0 25px #909399;
}

.login-title {
  text-align: center;
  margin: 0 auto 40px auto;
  color: #303133;
}

#login img {
  width: 4em;
  height: 4em;
  margin: 0 auto;
  display: block;
  margin-top: 6vh;
}

#login h1 {
  text-align: center;
  font-size: 2.5em;
  margin: 0.4em 0 0.67em;
}

.login-button {
  width: 100%;
}

img {
  max-width: 100%;
  border-style: none;
}

.login-blocks {
  margin: 8px 0;
  text-align: right;
  zoom: 1;
}

.keep-left {
  color: #9b9ea0;
  cursor: pointer;
  font-size: 12px;
  float: left;
}

.keep-right {
  color: #9b9ea0;
  cursor: pointer;
  font-size: 12px;
}

@media (max-width: 736px) {
  #login {
    background: #fff;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .login-box {
    position: fixed;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    max-width: 16em;
    width: 70%;
    border: 0;
  }
}

@media (max-width: 450px) {
  #login form {
    top: 40%;
    max-width: 21em;
  }
}

@media (max-width: 376px) {
  #login form {
    top: 43%;
    max-width: 19em;
  }
}

@media (max-width: 360px) {
  #login form {
    top: 45%;
    max-width: 16em;
  }
}

@media (max-width: 330px) {
  #login form {
    top: 50%;
    max-width: 16em;
  }
}

</style>
