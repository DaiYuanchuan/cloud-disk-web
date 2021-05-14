<template>
  <div id="login">
    <img
      src="/static/img/logo.png"
      alt="兜兜网盘"
    />
    <h1>欢迎注册</h1>
    <el-form
      ref="registerForm"
      :model="form"
      :rules="rules"
      class="login-box"
    >
      <el-form-item prop="userName">
        <el-input
          type="text"
          placeholder="用户名"
          v-model="form.userName"
        />
      </el-form-item>
      <el-form-item prop="userPwd">
        <el-input
          type="password"
          placeholder="设置你的登录密码"
          v-model="form.userPwd"
        />
      </el-form-item>
      <el-form-item prop="reUserPwd">
        <el-input
          type="password"
          placeholder="请再次输入你的密码"
          v-model="form.reUserPwd"
        />
      </el-form-item>
      <el-form-item prop="userEmail">
        <el-input
          type="text"
          placeholder="请输入邮箱地址"
          v-model="form.userEmail"
        />
        <el-button
          v-on:click="sendSecurityCode()"
          :disabled="!disabled"
          class="zmm"
        > {{ codeText }}
        </el-button>
      </el-form-item>
      <el-form-item prop="securityCode">
        <el-input
          type="text"
          placeholder="请输入邮箱验证码"
          v-model="form.securityCode"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          class="button-register"
          type="primary"
          v-on:click="register('registerForm')"
        > 注册
        </el-button>
      </el-form-item>
      <el-form-item class="login-blocks">
        <router-link
          :to="{ name: 'login'}"
          class="keep-right"
        > >>前往登录
        </router-link>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {validWeChatId, validEmail, validUsername} from '@/utils/validate'
import {sendSecurityCode, register} from '@/api/login'

export default {
  name: 'register',
  data () {
    // 用户名校验
    const validateUsername = (rule, value, callback) => {
      if (validWeChatId(value)) {
        callback()
      } else {
        callback(new Error('用户名 6 ~ 20位，以字母开头'))
      }
    }
    // 密码校验
    const validatePassword = (rule, value, callback) => {
      if (validUsername(value)) {
        callback()
      } else {
        callback(new Error('密码 4 ~ 16位，不包含特殊字符'))
      }
    }
    // 两次密码一次性校验
    const validateRePassword = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('密码 4 ~ 16位，不包含特殊字符'))
      } else if (this.form.userPwd !== value) {
        callback(new Error('两次密码不相等'))
      } else {
        callback()
      }
    }
    // 邮箱校验
    const validateEmail = (rule, value, callback) => {
      if (validEmail(value)) {
        callback()
      } else {
        callback(new Error('邮箱地址不规范'))
      }
    }
    // 验证码长度校验
    const validateSecurityCode = (rule, value, callback) => {
      if (value.length === 4) {
        callback()
      } else {
        callback(new Error('验证码错误'))
      }
    }
    return {
      form: {
        userName: '',
        userPwd: '',
        reUserPwd: '',
        userEmail: '',
        securityCode: '',
        userId: 0,
        userAvatar: 'https://static-page-1255518771.cos.ap-shanghai.myqcloud.com/common/image/literaryMale.jpg'
      },
      // 控制验证码按钮是否可用
      disabled: true,
      codeText: '获取验证码',
      // 表单验证，需要在 el-form-item 元素中增加 prop 属性
      rules: {
        userName: [{required: true, trigger: 'blur', validator: validateUsername}],
        userPwd: [{required: true, trigger: 'blur', validator: validatePassword}],
        reUserPwd: [{required: true, trigger: 'blur', validator: validateRePassword}],
        userEmail: [{required: true, trigger: 'blur', validator: validateEmail}],
        securityCode: [{required: true, trigger: 'blur', validator: validateSecurityCode}]
      }
    }
  },
  methods: {
    /**
     * 用户注册
     */
    register (formName) {
      // 为表单绑定验证功能
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 执行用户注册
          register(this.form).then((response) => {
            console.log(response)
            this.$message({
              showClose: true,
              message: '注册成功',
              type: 'success',
              duration: 3 * 1000
            })
            // 跳转登陆页面
            this.$router.push({name: 'login'})
          }).catch((err) => {
            console.log(err)
          })
        }
      })
    },
    /**
     * 验证码倒计时方法
     */
    countdown (time) {
      if (time === 0) {
        this.disabled = true
        this.codeText = '重新发送'
        return
      } else {
        this.disabled = false
        this.codeText = `重新发送(${time})`
        time--
      }
      setTimeout(() => {
        this.countdown(time)
      }, 1000)
    },
    /**
     * 获取邮箱验证码
     */
    sendSecurityCode () {
      if (validEmail(this.form.userEmail)) {
        // 发送验证码
        sendSecurityCode(this.form.userEmail, false).then(() => {
          this.$message({
            showClose: true,
            message: '验证码已发送',
            type: 'success',
            duration: 3 * 1000
          })
          // 验证码倒计时60s
          this.countdown(60)
        }).catch((err) => {
          console.log(err)
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
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

img {
  max-width: 100%;
  border-style: none;
}

.login-blocks {
  margin: 8px 0;
  text-align: right;
  zoom: 1;
}

.keep-right {
  color: #9b9ea0;
  cursor: pointer;
  font-size: 12px;
}

.zmm {
  position: absolute;
  right: 1px;
  top: 2px;
  font-size: 12px;
  padding: 12px 10px;
  border: none;
  border-left: 1px solid #dcdfe6;
  border-radius: 0px;
}

.button-register {
  width: 100%;
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
    border: 0;
    width: 90%;
  }

  #login h1 {
    text-align: center;
    font-size: 2.5em;
    margin: .4em 0 .67em;
  }

  #login form {
    position: fixed;
    left: 50%;
    margin: 0;
    padding: .1em 1em;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    max-width: 16em;
    width: 90%;
  }

  .el-form-item {
    margin: 0;
    padding: .5em 1em;
  }

  >>> .el-form-item__content {
    line-height: 1em;
  }

  >>> .el-input__inner {
    argin-bottom: .5em;
    display: block;
    width: 100%;
    border-radius: .1em;
    padding: .5em 1em;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, .1);
    -webkit-transition: all .2s ease;
    transition: all .2s ease;
    color: #333;
    margin: 0;
  }
}

@media (max-width: 450px) {
  #login form {
    max-width: 21em;
  }
}

@media (max-width: 376px) {
  #login form {
    top: 55%;
    max-width: 19em;
  }
}

@media (max-width: 360px) {
  #login form {
    top: 64%;
    max-width: 16em;
  }
}
</style>
