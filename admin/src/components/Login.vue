<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像区域 -->
      <el-avatar class="avatar-box">
        <img src="@/assets/image/avatar.png" alt />
      </el-avatar>
      <!-- 登录表单区域 -->
      <el-form
        class="login-form"
        ref="loginFormRef"
        :rules="rules"
        :model="form"
        label-width="70px"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="form.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input type="password" prefix-icon="iconfont icon-3702mima" v-model="form.password"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="form-btn-box">
          <el-button type="primary" @click="login()">登录</el-button>
          <el-button type="button" @click="resetForm() ">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登陆表单数据绑定对象
      form: {
        username: '',
        password: ''
      },
      // 表单验证规则对象
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    //点击登陆按钮,发起请求，用户信息验证  （async await）异步函数--> 优化promise
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.post('login', this.form)
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        //element-ui的message组件
        this.$message({
          message: '登录成功',
          type: 'success'
        })

        // 1.将登录成功之后的token, 保存到客户端的sessionStorage 中
        window.sessionStorage.setItem('token', res.data.token)
        console.log(res.data.token)
        // 1.1项目中除了登录之外的其他API接口，必须在登录之后才能访问
        // 1.2 token只应在当前网站打开期间生效，所以将token 保存在sessionStorage 中
        // 2.通过编程式导航跳转到后台主页，路由地址是/home
        this.$router.push('/home')
      })
    },
    // 点击重置按钮，重置登陆表单
    resetForm() {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100%;
  background: url('../assets/image/bg.png') no-repeat 0 0;
  background-size: 100% 100%;
  .login-box {
    width: 450px;
    height: 300px;
    background-color: #eee;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .avatar-box {
      width: 130px;
      height: 130px;
      position: absolute;
      left: 50%;
      // top: 50%;
      transform: translate(-50%, -50%);
      img {
        width: 100%;
        height: 100%;
      }
    }
    .login-form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 5%;

      .el-form-item {
        text-align: center;
        //   justify-content: center;
        // width: 90%;
        margin-right: 5%;

        // .el-input {
        //   width: 80% ;
        // }
      }

      .form-btn-box {
        display: flex;
        flex-direction: row-reverse;
      }
    }
  }
}
</style>