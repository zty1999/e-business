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
    component: () => import ('@/views/Home'),
    redirect: '/welcome',
    children: [
      //欢迎页
      {path: '/welcome',name: 'Welcome', component: () => import ('@/views/Welcome')},
      //用户列表
      {path: '/users',name: 'Users', component: () => import ('@/views/user/Users')},
      //角色列表
      {path: '/roles',name: 'Roles', component: () => import ('@/views/power/Roles')},
      //权限列表
      {path: '/rights',name: 'Rights', component: () => import ('@/views/power/Rights')},
      //商品列表
      {path: '/goods',name: 'Goods', component: () => import ('@/views/goods/Goods')},
      //商品添加列表
      {path: '/good/add',name: 'Add', component: () => import ('@/views/goods/Add')},
      //商品编辑列表
      {path: '/good/edit/:id',name: 'Edit', component: () => import ('@/views/goods/Edit')},
      // 分类参数
      {path: '/params',name: 'Params', component: () => import ('@/views/goods/Params')},
      // 商品分类
      {path: '/categories',name: 'Categories', component: () => import ('@/views/goods/Categories')},
      // 订单列表
      {path: '/orders',name: 'Orders', component: () => import ('@/views/Orders')},
      // 数据报表
      {path: '/reports',name: 'Reports', component: () => import ('@/views/Reports')},
    
    ]
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
