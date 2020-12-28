<template>
  <div class="body">
    <div class="h1">
      <h1>{{title}}</h1>
    </div>
    <el-form
      ref="resetPassword"
      :model="form"
      :rules="rules"
      class="frame"
    >
      <div
        v-if="step == 1"
        class="step"
      >
        <p></p>
        <el-form-item prop="userEmail">
          <el-input
            placeholder="请输入邮箱以重设登录密码"
            v-model="form.userEmail"
            maxlength="50"
            clearable
          >
          </el-input>
        </el-form-item>
      </div>

      <div
        v-if="step == 2"
        class="step"
      >
        <el-form-item prop="securityCode">
          <p></p>
          <el-input
            placeholder="请输入您收到的验证码"
            v-model="form.securityCode"
            maxlength="4"
            clearable
          >
            <div style=" height: 30px;">

            </div>
          </el-input>
        </el-form-item>
      </div>

      <div
        class="step"
        v-if="step == 3"
      >
        <p></p>
        <el-form-item prop="userPwd">
          <el-input
            placeholder="新密码"
            v-model="form.userPwd"
            clearable
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="reUserPwd">
          <el-input
            placeholder="请再次输入密码"
            v-model="form.reUserPwd"
            clearable
          >
          </el-input>
        </el-form-item>
      </div>

      <el-form-item class="button">
        <el-button
          type="primary"
          @click="submit('resetPassword')"
        >{{next}}</el-button>
      </el-form-item>

    </el-form>

  </div>
</template>

<script>
import { validEmail, validUsername } from '@/utils/validate'
import { sendSecurityCode, verifySecurityCode, resetPassword } from '@/api/login'

export default {
  name: 'forgot-passwd',
  data () {
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
      // 表单元素
      form: {
        userPwd: '',
        reUserPwd: '',
        userEmail: '',
        securityCode: ''
      },
      // 表单验证，需要在 el-form-item 元素中增加 prop 属性
      rules: {
        userPwd: [{ required: true, trigger: 'blur', validator: validatePassword }],
        reUserPwd: [{ required: true, trigger: 'blur', validator: validateRePassword }],
        userEmail: [{ required: true, trigger: 'blur', validator: validateEmail }],
        securityCode: [{ required: true, trigger: 'blur', validator: validateSecurityCode }]
      },
      title: '忘记密码',
      next: '下一步',
      step: 1
    }
  },
  methods: {
    submit (formName) {
      // 为表单绑定验证功能
      this.$refs[formName].validate((valid) => {
        if (valid) {
          switch (this.step) {
            case 1:
              sendSecurityCode(this.form.userEmail, true).then((response) => {
                this.step = 2
              }).catch((err) => {
                console.log(err)
              })
              break
            case 2:
              verifySecurityCode({
                email: this.form.userEmail,
                code: this.form.securityCode
              }).then((response) => {
                if (response.data) {
                  this.step = 3
                  this.title = '设置新密码'
                  this.next = '提交'
                } else {
                  this.$message({
                    message: '验证码错误，请重新输入' || 'error',
                    showClose: true,
                    type: 'error',
                    duration: 3 * 1000
                  })
                }
              }).catch((err) => {
                console.log(err)
              })
              break
            case 3:
              resetPassword({
                securityCode: this.form.securityCode,
                userEmail: this.form.userEmail,
                userPwd: this.form.userPwd
              }).then((response) => {
                // 跳转登陆页面
                this.$router.push({ name: 'login' })
              }).catch((err) => {
                console.log(err)
              })
              break
            default:
              break
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.body {
  width: 100%;
  height: 100vh;
  background: #f5f6f7 !important;
}
.h1 {
  width: 100%;
  text-align: center;
  height: 130px;
  line-height: 130px;
}
.h1 h1 {
  font-size: 32px;
  font-weight: 400;
  margin: 0 auto;
  max-width: 1000px;
  position: relative;
}
.frame {
  max-width: 1000px;
  height: auto;
  margin: 0 auto;
  background: #fff;
}
.el-step__title.is-process {
  font-weight: 700;
  color: #c9c7cc;
}
.el-input {
  width: 420px;
}
/deep/ .el-input__inner {
  height: 45px;
  margin: 0px 0px 10px;
  -webkit-appearance: none;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  line-height: 45px;
  outline: 0;
  padding: 0 15px;
  -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}
/deep/ .el-form-item__content {
  width: 420px;
  margin: 0 auto;
}

.step {
  width: 80%;
  text-align: center;
  margin: 0 auto;
  height: auto;
}
.step p {
  line-height: 80px;
  padding-top: 28px;
}
.button {
  width: 420px;
  text-align: center;
  margin: 16px auto;
  height: 100px;
}
.button button {
  width: 100%;
  height: 45px;
}
</style>
