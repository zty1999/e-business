e-commerce
## 自定义指令(lintfix)
eslint状态下可自定义指令使用eslint自带的--fix参数自动修复代码规范
"scripts": { "serve": "vue-cli-service serve", "build": "vue-cli-service build", "lint": "vue-cli-service lint", }, 
在以上代码中加入"lintfix": "vue-cli-service lint --fix" 自动按规范校正代码， 使用npm run lintfix命令再启动项目生效 也可直接修改配置使eslint不生效

pakage.json中serve指令里加上--open，启动项目时会自动打开浏览器
## 项目准备
ui---element-ui 基于vue 适用于pc端项目
https://element.eleme.cn/#/zh-CN/component/quickstart
版本控制---git

git init ->生成.git
git satus
git add .
git commit -m '注释'
在托管平台新建仓库
git remote add origin 仓库地址
git push -u origin master(首次提交加-u 之后再push直接git push)
新建分支-login 组件配置路由
git checkout -b dev-login //创建并切换到login分支
git branch //查看分支状态



