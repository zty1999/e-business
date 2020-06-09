<template>
  <div class="goods-list-container">
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
          @keyup.enter.native="Search"
          class="input-with-select"
        >
          <el-button slot="append" icon="el-icon-search" @click="Search"></el-button>
        </el-input>
        <!-- 添加商品按钮 -->
        <el-button type="primary" @click="goAddPage">添加商品</el-button>
      </div>
      <!-- 商品列表 -->
      <el-table :data="goodsList" border stripe style="width: 100%">
        <el-table-column type="index" label="#" width="50"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column prop="add_time" label="创建时间">
          <template slot-scope="scope">{{scope.row.add_time | dataFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              @click="getGood(scope.row)"
              size="mini"
              icon="el-icon-edit"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoodById(scope.row.goods_id)"
            ></el-button>          
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 修改商品的对话框 -->
      <el-dialog
        title="修改商品信息"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <el-form :model="editForm" :rules="editGoodRules" ref="editFormRef" label-width="70px">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="editForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="editForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="editForm.goods_number"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editGood">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取商品列表的参数对象
      queryInfo: {
        // 查询参数
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      //商品列表数据
      goodsList: [],
      //商品总数
      total: 0,
      // 控制修改商品对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的商品信息对象
      editForm: {},
      // 修改表单的验证规则对象
      editGoodRules: {
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
          { required: true, message: '请输入商品价格', trigger: 'blur' }
          // { required: true, type: 'number', message: '价格必须为数字值',trigger: 'blur'}
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
      // 控制修改商品对话框的显示与隐藏
      deleteDialogVisible: false,
      // 要删除的商品信息对象
      deleteForm: {},
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //获取商品列表数据
    async getGoodsList() {
      const { data: res } = await this.$axios.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.goodsList = res.data.goods
      this.total = res.data.total
      console.log(res)
    },
    //搜索功能
    Search() {
      this.queryInfo.pagenum = 1
      this.getGoodsList()
    },
    // 点击添加商品跳转页面
    goAddPage() {
      this.$router.push('/goods/add')
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
    //展示编辑商品的对话框 获取该商品数据
    async getGood(good) {
      this.editDialogVisible = true
      this.editForm = good
      console.log(good)
    },
    // 监听修改分类对话框的关闭事件  重置对话框表单
    editDialogClose(editForm) {
      this.$refs.editFormRef.resetFields()
    },
    // 修改商品信息并提交
    editGood() {
    //   this.$refs.editFormRef.validate(async valid => {
    //     if (!valid) return
    //     // 发起修改商品信息的数据请求
    //     const { data: res } = await this.$axios.put(
    //       `goods/${this.editForm.id}`,this.editForm
    //     )
    //     console.log(res.data)
    //     if (res.meta.status != 201)
    //       return this.$message.error('更新商品信息失败')
    //   // 关闭修改商品信息的对话框
    //   this.editDialogVisible = false
    //   //刷新数据列表
    //   this.getGoodsList()  
    //   //提示修改成功
    //   this.$message.success('更新商品信息成功')
    //   })
    },
    // 删除商品并提交
    async removeGoodById(id) {
      const result = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
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
  }
}
</script>

<style lang="scss" scoped>

.box-card {
  margin-top: 1em;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.15) !important;
  .el-input-group {
    width: 40%;
    margin-right: 2em;
  }
  .el-table {
    margin: 20px 0;
    border-radius: 5px;
    font-size: 12px;
  }
}

</style>