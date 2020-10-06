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
      <el-alert title="修改商品信息" center type="info" show-icon> </el-alert>
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
        :model="good"
        :rules="editRules"
        ref="goodRef"
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
              <el-input v-model="good.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                type="number"
                v-model="good.goods_price"
                onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                type="number"
                v-model="good.goods_weight"
                onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                type="number"
                v-model="good.goods_number"
                onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              </el-form-item>
            <!-- 选择商品分类的级联选择框 -->
            <el-cascader
                :props="cateProps"
                expand-trigger="hover"
                v-model="good.goods_cat"
                :options="cateList"
                @change="handleChanged()"
                clearable
              ></el-cascader
            >
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
          <el-tab-pane label="商品图片" name="3" style="display: flex">
            <!-- action 表示图片要上传到的后台API地址 drag 拖拽上传 accept限制上传文件类型 *表示支持所有的格式-->
            <div style="display: flex; ">
            <div class="" v-for="(item,index) in good.pics" :key="index" v-if="item.pics_big_url" style="padding-right: 5px; ">
            <el-image style="width: 148px; height: 148px; border: 1px solid #c0ccda;border-radius: 6px;"  :src="item.pics_big_url" >
              </el-image></div></div>
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
    v-model="good.goods_introduce"
    
  />
            <!-- 保存商品修改的按钮 -->
            <div style="text-align:right">
              <el-button type="primary" class="btnEdit"  @click="edit">保存</el-button>
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
      // 商品数据
      good: {
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
      //修改商品表单的验证规则对象
      editRules: {
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
      fileList: [],
      previewPath: '',
      previewVisible: false
    }
  },
  created() {
this.getGood()
  },
  computed: {
    cateId() {
      if (this.good.goods_cat.length === 3) {
        return this.good.goods_cat[2]
      }
      return null
    },
  },
  methods: {
    //获取商品数据
    async getGood() {
      let id = this.$route.params.id - 0
      console.log(id)
      const { data: res } = await this.$axios.get('goods/' + id);
      this.good = res.data;
      //商品分类字符串转为数组
      this.good.goods_cat = this.good.goods_cat.split(',')
      // this.good.goods_cat.map(Number)
      this.good.goods_cat = JSON.parse('[' + String(this.good.goods_cat) + ']') // [1,2,3]
      this.getCateList()
      console.log(this.good.goods_cat)
    },
     //获取分类数据
    async getCateList() {
 const { data: res } = await this.$axios.get('categories');
 if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
      console.log(this.cateList)

    },
    // 级联选择框选择项发生变化触发这个函数
    async handleChanged() {
      // 证明选中的不是三级分类
      // let goods_cat = this.good.goods_cat
      if (this.good.goods_cat.length !== 3) {
        this.good.goods_cat = []
        return
      }
      // 证明选中的是三级分类  获取数据
      console.log(this.good.goods_cat)
    },
    //切换tab页前的钩子
    beforeTabLeave(activeName, oldActiveName) {
      // if (oldActiveName === '0' && this.good.goods_cat.length !== 3) {
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
      this.good.pics.push(picInfo)
      console.log(this.good)
    },

    // 处理移除图片的操作
    handleRemove(file) {
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从 pics 数组中，找到这个图片对应的索引值
      const i = this.good.pics.findIndex(v => v.pic === filePath)
      // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.good.pics.splice(i, 1)
      console.log(this.good)
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    //提交商品编辑
    async edit(){
      this.$refs.goodRef.validate(async valid =>{
        if(!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 执行修改的业务逻辑
        // 1.goods_cat转为字符串 
        this.good.goods_cat = 
        this.good.goods_cat.join(',')
        new Number(this.good.goods_price)
        new Number(this.good.goods_weight)
        new Number(this.good.goods_number)
        // 2.处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.good.attrs.push(newInfo)
        })
        // 3.处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.good.attrs.push(newInfo)
        })
        console.log(this.good)
        // 发起请求修改商品
         let id = this.$route.params.id + ''
        console.log(id)

        const { data: res } = await this.$axios.put('goods/' + id,this.good)
        console.log(res)
        if (res.meta.status != 200)
        return this.$message.error('修改商品失败')
        //提示修改成功
        this.$message.success('修改商品成功')  
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
.btnEdit {
  margin: 2em;
}

</style>
  
      