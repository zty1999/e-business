import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
/*导入全局样式表*/
import '@/assets/style/global.css'
// 导入字体图标
import '@/assets/fonts/iconfont.css'
Vue.use(ElementUI)

//导入树形表格组件
import  TreeTable from 'vue-table-with-tree-grid'
Vue.component( 'tree-table',TreeTable)

Vue.config.productionTip = false

//定义一个格式化时间的全局过滤器
Vue.filter('dataFormat',function(originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m =  (dt.getMonth() + 1 + '').padStart(2,'0')
  const d = (dt.getDate() + '').padStart(2,'0')
  const hh = (dt.getHours() + '').padStart(2,'0')
  const mm = (dt.getMinutes() + '').padStart(2,'0')
  const ss = (dt.getSeconds() + '').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
