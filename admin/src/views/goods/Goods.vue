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
      <!-- 主体头部搜索框、添加商品按钮 -->
      <div>
        <!-- 搜索框 -->
        <el-input
          placeholder="请输入内容"
          v-model="queryInfo.query"
          clearable
          @clear="Search"
          class="input-with-select"
        >
        

          <el-button
            slot="append"
            icon="el-icon-search"
            @click="Search"
          ></el-button>
        </el-input>
        <!-- 添加商品按钮 -->
        <el-button type="primary" @click="toAddPage">添加商品</el-button>
      </div>
      <!-- 商品列表 -->
      <el-table :data="GoodsList" border stripe style="width: 100%">
        <el-table-column type="index" label="#" width="50"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格" width="90"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140">
          <template slot-scope="scope">{{
            scope.row.add_time | dataFormat
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              @click="$router.push(`/good/edit/${scope.row.goods_id}`)"
              size="mini"
              icon="el-icon-edit"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoodsById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //搜索框数据
      searchInput: '',
      // 获取商品列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10,
      },
      //商品列表数据
      GoodsList: [],
      //当前页
      currentPage: 1,
      //商品总数
      total: 0,
      //分类数据
      cateList: [],
      //添加商品的表单数据
      addForm: {
        goodsname: '',
        goods_cat: '',
        goods_price: '',
        goods_weight: '',
        goods_introduce: '',
        pics: {},
        attrs: [],
      },
      //添加商品表单的验证规则对象
      addGoodsRules: {
        goods_name: [
          { required: true, message: '请输入商品名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '商品名长度在 3 到 10 个字符之间 ',
            trigger: 'blur',
          },
        ],
        goods_cat: [
          { required: true, message: '请设置密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '密码长度在 6 到 15 个字符之间',
            trigger: 'blur',
          },
        ],
        goods_price: [
          { required: true, message: '请设置价格', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '价格长度在 6 到 15 个字符之间',
            trigger: 'blur',
          },
        ],
        goods_weight: [
          { required: true, message: '请设置重量', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '重量长度在 6 到 15 个字符之间',
            trigger: 'blur',
          },
        ],
      },
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 控制修改商品对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的商品信息对象
      editForm: {},
      // 修改表单的验证规则对象
      editGoodsRules: {
        // email: [
        //   { required: true, message: '请输入商品邮箱', trigger: 'blur' },
        //   { validator: checkEmail, trigger: 'blur' },
        // ],
        // mobile: [
        //   { required: true, message: '请输入商品手机号', trigger: 'blur' },
        //   { validator: checkMobile, trigger: 'blur' },
        // ],
      },
      // 控制修改商品对话框的显示与隐藏
      deleteDialogVisible: false,
      // 要删除的商品信息对象
      deleteForm: {},
      // 控制分配角色对话框的显示与隐藏
      setDialogVisible: false,
      // 需要被分配角色的商品信息
      GoodsInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: '',
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //获取商品列表数据
    async getGoodsList() {
      const { data: res } = await this.$axios.get('goods', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.GoodsList = res.data.goods
      this.total = res.data.total
      console.log(res)
    },
    // 监听 pagesize 改变的事件 一页显示条数变更
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
      console.log(`每页 ${newSize} 条`)
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
      console.log(`当前页: ${newPage}`)
    },
    //搜索功能
    Search() {
      this.queryInfo.pagenum = 1
      this.getGoodsList()
    },
    //跳转商品添加页面
    toAddPage() {
      this.$router.push('/good/add')
    },
    //获取分类数据
    async getCateList() {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择框选择项发生变化触发这个函数
    handleChanged() {
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData() {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 证明选中的是三级分类  获取数据
      console.log(this.selectedCateKeys)
      const { data: res } = await this.$axios.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      )
      if (res.meta.status !== 200)
        return this.$message.error('获取参数列表失败！')
      //将字符串分割为数组，以在表格中进行循环渲染
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 删除商品并提交
    async removeGoodsById(id) {
      console.log(id)
      const result = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => {
        return err
      })
      // 如果商品确认删除，则返回值为字符串 confirm
      // 如果商品取消了删除，则返回值为字符串 cancel
      // console.log(result)
      if (result !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$axios.delete(`goods/${id}`)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败！')
      }

      this.$message.success('删除商品成功！')
      this.getGoodsList()
    },
  },
}
</script>

<style lang="scss" scoped>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
}
.clearfix:after {
  clear: both;
}
</style>
