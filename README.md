## 项目功能

前端项目技术栈
vue
Vue -router
Element-UI
Axios 
Echarts

后端项目技术栈
Node.js
Express
Jwt
Mysql
sequelize

登录/退出功能
主页布局
用户管理模块
权限管理模块
分类管理模块
参数管理模块
商品管理模块
订单管理模块
数据统计模块

# 项目搭建
# 项目初始化
# 后台项目的环境安装配置
①安装 MySQL数据库
安装phpstudy，开启mysql，新建数据库，导入项目中的数据库
②安装 Nodejs环境
③配置项目相关信息
④启动项目
node ./app.js  
⑤使用 Postman测试后台项目接口是否正常


登录/退出功能
============= 
## 1.登录概述
### 1.1登录业务流程
①在登录页面输入用户名和密码
②调用后台接口进行验证
③通过验证之后，根据后台的响应状态跳转到项目主页
### 1.2登录业务的相关技术点
>http是无状态的
通过cookie在客户端记录状态
通过session在服务器端记录状态
通过token方式维持状态
（登录页面输入用户名和密码进行登录
服务器验证通过之后生成该用户的token并返回
客户端存储该token
后续所有的请求都携带该token发送请求
服务器端验证token是否通过
）
## 2.登录功能实现
### 2.1登录页面的布局
通过Element-UI组件实现布局
el-form
el-form-item
el-input
el-button
字体图标


## 3.路由导航守卫控制访问权限
如果用户没有登录，但是直接通过URL访问特定页面，需要重新导航到登录页面。

>//为路由对象，添加**beforeEach** 导航守卫
router.beforeEach((to, from, next) => {
//如果用户访问的登录页，直接放行
if (to.path === '/login') return next()
//从sessionStorage 中获取到保存的token值
const tokenstr = window.sessionstorage.getItem('token')
//没有token,强制跳转到登录页
if (!tokenstr) return next('/login')
next ()
})

## 4.退出
退出功能实现原理
基于token的方式实现退出比较简单，只需要销毁本地的token即可。这样，后续的请求就不会携带token ,必须重新登录生成一个新的 token之后才可以访问页面。
>//清空token
window.sessionstorage.clear()
//跳转到登录页
this.$router.push('/login')




# 页面内容
## 通过接口获取菜单数据

>通过axios请求拦截器添加token,保证拥有获取数据的权限。
// axios请求拦截
axios.interceptors.request.use (config => (
//为请求头对象，添加Token验证的Authorization字段
config.headers.Authorization = window.sessionStorage.getItem('token')
return config




tag
=====
>.prettierrc文件更改vscode格式化规则，对照eslint模式规则。


安装 vue-table-with-tree-grid————树形表格组件
=====
>https://github.com/MisterTaki/vue-table-with-tree-grid

初始化一个node项目
npm init -y 会生成一个package.json文件
新建入口文件index.js

全局安装nodemon：npm i -g nodemon
在package.json文件的"scripts"：{}中加入以下内容：  "serve": "nodemon index.js"

启动项目
npm run serve 另一种启动方式：(有误，启动不了) （批处理：在node项目中新建start.txt文件 输入 nodemon app.js 将start.txt后缀名改为.bat 之后双击start.bat文件就可以启动该项目 这样启动速度更快）

安装mongodb客户端
msi版本 安装后将安装路径C:\Program Files\MongoDB\Server\4.2\bin加入系统环境变量，打开cmd输入mongo，出现版本信息说明配置成功

安装常用模块：
npm i express@next mongoose cors -S express@next express是node.js的一个框架，@next表示最后一个版本 mongoose 连接数据库 cors 允许跨域请求 安装完模块会自动生成node_modules文件夹

创建实例
const express = require("express"); //引用express

const app = express(); //定义app为express的一个实例

app.listen(3000, () => { console.log('App listening on port 3000!') }) //监听3000端口

创建路由
新建routes文件夹 在routes文件夹下新建admin文件夹（放置后台管理系统相关的代码），新建index.js 在index.js中写路由接口 index.js中 module.exports = app => {} //接收一个函数的app对象，在入口文件index.js中加上require('./routers/admin')(app);//引用并执行admin文件夹下index.js中的函数并把app传给该函数 这样就可以在admin的index.js文件中使用app 在admin/index.js中引入express、router、并将router挂载到app上 如下： module.exports = app => { const express = require('express') const router = express.Router() //express的子路由 app.use('/admin/api',router) }