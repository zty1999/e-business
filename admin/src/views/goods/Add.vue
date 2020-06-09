<template>
  <div class="good-add-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item></el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
      <!-- 步骤条 -->
      <el-steps :active="activeIndex - 0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 左侧tab栏区域 标签页 -->
      <el-form :model="addForm" :rules="addGoodRules" ref="addFormRef" label-width="80px">
        <el-tabs
          :tab-position="tabPosition"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 选择商品分类的级联选择框 -->
              <el-cascader
                :props="cateProps"
                expand-trigger="hover"
                v-model="addForm.goods_cat"
                :options="cateList"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item
              :label="item.attr_name"
              v-model="manyTableData"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <br />
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="i" v-for="(i,index) in item.attr_vals" :key="index" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-model="onlyTableData"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <br />
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的后台API地址 drag 拖拽上传-->
            <el-upload
              class="upload-demo"
              :action="uploadUrl"
              :headers="getAuthHeaders()"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor ref="myQuillEditor" v-model="addForm.goods_introduce" />
            <!-- 添加商品的按钮 -->
            <div style="text-align:right">
              <el-button type="primary" class="btnAdd"  @click="add">添加商品</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      activeIndex: '0',
      tabPosition: 'left',
      //添加商品的表单数据
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        // 商品所属的分类数组
        goods_cat: [],
        // 图片数组
        pics: [],
        // 商品介绍
        goods_introduce: '',
        // 商品参数、属性
        attrs: []

      },
      //添加商品表单的验证规则对象
      addGoodRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '商品名称长度在 2 到 10 个字符之间 ',
            trigger: 'blur'
          }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          // { type: 'number', message: '价格必须为数字值'}
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          // { type: 'number', message: '重量必须为数字值'}
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          // { type: 'number', message: '数量必须为数字值'}
        ]
      },
      // 商品分类列表
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      previewPath: '',
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    },
    editor() {
      return this.$refs.myQuillEditor.quill
    }
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$axios.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }

      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择器选中项变化，会触发这个函数
    handleChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    //切换tab页前的钩子
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
      //  console.log('即将离开的标签页名字是：' + oldActiveName)
      // console.log('即将进入的标签页名字是：' + activeName)
    },
    //tab页切换
    async tabClicked() {
      // 证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }
        console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败！')
        }
        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 上传图片
    async uploadList() {
      const { data: res } = await this.$axios.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }

      this.cateList = res.data
      console.log(this.cateList)
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从 pics 数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      // 1. 拼接得到一个图片信息对象
      const picInfo = { pics: response.data.tmp_path }
      // 2. 将图片信息对象，push 到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    add() {
      this.$refs.addFormRef.validate(async valid =>{
        if(!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 执行添加的业务逻辑
        // 1.goods_cat转为字符串
        this.addForm.goods_cat = 
        this.addForm.goods_cat.join(',')
        new Number(this.addForm.goods_price)
        new Number(this.addForm.goods_weight)
        new Number(this.addForm.goods_number)
        // 2.处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 3.处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        console.log(this.addForm)
        // 发起请求添加商品
        const { data: res } = await this.$axios.post('goods',this.addForm)
        console.log(res.data)
        if (res.meta.status != 201)
        return this.$message.error('添加商品失败')
        //提示修改成功
        this.$message.success('添加商品成功')  
        this.$router.push('/goods')
      })
     
    }
  }
}
</script>
<style lang="scss" >

.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 15px;
}
</style>