<template>
  <div id="Goodss-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item></el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <!-- 页面提示信息 -->
      <el-alert title="添加商品信息" center type="info" show-icon> </el-alert>
      <!-- 步骤条 active只接收数字，与tab栏的数据联动使传过来的数据为字符串， -0转为数字-->
      <el-steps :active="activeIndex - 0" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 表单-->
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addFormRef"
        label-width="70px"
        label-position="top"
      >
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                type="number"
                v-model="addForm.goods_price"
                onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                type="number"
                v-model="addForm.goods_weight"
                onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                type="number"
                v-model="addForm.goods_number"
                onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                :props="cateProps"
                expand-trigger="hover"
                v-model="addForm.goods_cat"
                :options="cateList"
                @change="handleChanged()"
                clearable
              ></el-cascader
            ></el-form-item>
            <!-- 选择商品分类的级联选择框 -->
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item
              :label="item.attr_name"
              v-model="manyTableData"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="i"
                  v-for="(i, index) in item.attr_vals"
                  :key="index"
                  border
                ></el-checkbox>
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
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的后台API地址 drag 拖拽上传 accept限制上传文件类型 *表示支持所有的格式-->
            <el-upload
              :action="uploadUrl"
              :headers="getAuthHeaders()"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :before-upload="beforeUpload"
              accept="image/*" drag
              list-type="picture-card"
            >
                <i class="el-icon-plus"></i>
            </el-upload>
            <!-- 图片预览 -->
            <el-dialog
              title="图片预览"
              :visible.sync="previewVisible"
              width="50%"
            >
              <img :src="previewPath" alt class="previewImg" />
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor
    ref="myQuillEditor"
    v-model="addForm.goods_introduce"
    
  />
            <!-- 添加商品的按钮 -->
            <div style="text-align:right">
              <el-button type="primary" class="btnAdd"  @click="add">添加商品</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //默认展示的tab项
      activeIndex: 0,
      // 添加商品表单
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        // 图片数组
        pics: [],
        //商品介绍
        goods_introduce: '',
        // 商品参数、属性
        attrs: []
      },
      //添加商品表单的验证规则对象
      addRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      //商品分类数据
      cateList: [],
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 指定级联选择器的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      //上传图片的url地址
      // uploadUrl: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      // getAuthHeaders: {
      //   Authorization: window.sessionStorage.getItem('token')
      // },
      fileList: [],
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
    //获取分类列表
    async getCateList() {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 级联选择框选择项发生变化触发这个函数
    async handleChanged() {
      // 证明选中的不是三级分类
      // let goods_cat = this.addForm.goods_cat
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return
      }
      // 证明选中的是三级分类  获取数据
      console.log(this.addForm.goods_cat)
    },
    //切换tab页前的钩子
    beforeTabLeave(activeName, oldActiveName) {
      // if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
      //   this.$message.error('请先选择商品分类！')
      //   return false
      // }
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
    //上传前的钩子
    beforeUpload(file) {
      console.log(file)
      // const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2
      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!');
      //   return false
      // }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
        return false
      }
      // console.log(isJPG)
      console.log(isLt2M)
      // return isJPG && isLt2M;
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      // 1. 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2. 将图片信息对象，push 到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },

    // 处理移除图片的操作
    handleRemove(file) {
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从 pics 数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(v => v.pic === filePath)
      // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    //添加商品
    async add(){
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

<style lang="scss">
.el-steps {
  margin: 1em 0;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.el-upload-dragger {
border: none;
width: 140px !important;
height: 140px !important;

}
.btnAdd {
  margin: 2em;
}

</style>
