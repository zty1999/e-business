<template>
  <el-container id="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div class="logo-box">
        <img src="@/assets/image/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout()">退出</el-button>
    </el-header>
    <!-- 主体内容 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          width="200px"
          router
          unique-opened
          :default-active="activePath"
          :collapse="isCollapse"
          :collapse-transition="false"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
        >
          <!-- 一级菜单 index只接受字符串不接受数值，所以拼接空字符串-->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <!-- <el-menu-item-group> -->
              <el-menu-item @click="saveNavState('/' + subItem.path)"
                :index="'/' + subItem.path"
                v-for="subItem in item.children"
                :key="subItem.id"
              >
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </el-menu-item>
            <!-- </el-menu-item-group> -->
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 中间内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      //侧边栏是否折叠
      isCollapse: false,
      //侧边栏数据
      menuList: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      activePath: ''
    }
  },
  created() {
    this.getMenus();
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    //退出登录
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },

    //获取侧边栏数据
    async getMenus() {
      const { data: res } = await this.$axios.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      console.log(res)
    },
    //点击按钮 侧边栏收起展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    //保存侧边栏链接激活高亮状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath',activePath);
      this.activePath = activePath
    }
  }
}
</script>

<style lang="scss" scoped>
#home-container {
  height: 100%;
}
// 头部
.el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  background-color: #373d41;
  color: #ffffff;
  .logo-box {
    display: flex;
    align-items: center;
    font-size: 22px;
    img {
      width: 50px;
      height: 50px;
      margin-right: 15px;
    }
  }
}
// 侧边栏
.el-aside {
  background-color: #333744;
  .iconfont {
    margin-right: 10px;
  }
  .toggle-button {
    text-align: center;
    // padding: 5px;
    font-size: 10px;
    line-height: 24px;
    letter-spacing: 0.2em;
    color: #fff;
    background-color: #4a5064;
    cursor: pointer;
  }
  .el-menu {
    border: none;
  }
}
</style>