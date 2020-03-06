import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import ('@/views/Home')
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})
//挂载路由导航守卫  控制访问权限
//如果用户没有登录，是直接通过URL访问特定页面，需要重新导航到登录页面。
router.beforeEach((to,from,next) => {
// to将要访问的路径
// from代表从哪个路径跳转而来
// next是一个函数，表示放行
//next()放行 next(' /login')强制跳转
  //如果用户访问的登录页，直接放行
  if (to.path === '/login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  //没有token,强制跳转到登录页
  if(!tokenStr) return next('/login')
  next();
})

export default router
