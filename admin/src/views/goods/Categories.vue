<template>
  <div class="categories-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      <el-breadcrumb-item></el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <!-- 主体头部添加分类按钮 -->
      <div>
        <!-- 添加分类按钮 -->
        <el-button type="primary" @click="showAddDialogVisible">添加分类</el-button>
        <!-- 添加分类的对话框 -->
        <el-dialog
          title="添加分类"
          :visible.sync="addDialogVisible"
          width="50%"
          @close="addDialogClose"
        >
          <el-form :model="addForm" :rules="addCategoryRules" ref="addFormRef" label-width="80px">
            <el-form-item label="分类名称：" prop="cat_name" label-width="100px">
              <el-input v-model="addForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类：" label-width="100px">
              <el-cascader
                :props="cascaderProps" v-model="selectedKeys" expand-trigger="hover"
                :options="ParentCateList" @change="parentCateChanged"   clearable change-on-select
              ></el-cascader>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCategory">确 定</el-button>
          </span>
        </el-dialog>
      </div>
      <!-- 分类列表 -->
      <tree-table
      show-index index-text="#"
      :data="categoryList"  border stripe show-row-hover
      :columns="columns" :selection-type="false" :expand-type="false"
      style="width: 100%"
      >
      <template v-slot:isok="scope" style="width: 100px;">
        <i class="el-icon-success" v-if="scope.row.cat_deleted == false" style="color: #67C23A;"></i>
        <i class="el-icon-error" v-else style="color: red;"></i>
      </template>
      <template #level="scope">
        <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
        <el-tag type="warning" v-else>三级</el-tag>
      </template>
      <template #edit="scope">
        <!-- 编辑按钮 -->
        <el-button
          type="primary"
          @click="getCategoryById(scope.row.cat_id)"
          size="mini"
          icon="el-icon-edit"     
        >编辑</el-button>    
        <!-- 删除按钮 -->
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          @click="removeCategoryById(scope.row.cat_id)"
        >删除</el-button>
    
      </template>
    </tree-table>
      <!-- 编辑分类的对话框 -->
      <el-dialog
        title="修改分类"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <el-form :model="categoryEditForm" :rules="editCategoryRules" ref="editFormRef" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="categoryEditForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCategory">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20, 25, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
// import ZkSwitch from 'vue-table-with-tree-grid';
export default {
  // name: 'example',
  // components: {
  //     ZkSwitch,
  //   },
  data() {
    return {
      // 获取分类列表的参数对象
      queryInfo: {
        type: [],
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10
      },
      //分类列表数据
      categoryList: [],
      //当前页
      // currentPage: 1,
      //分类总数
      total: 0,
      // 控制添加分类对话框的显示与隐藏
      addDialogVisible: false,
      //添加分类的表单数据
      addForm: {
        cat_name: '',
        //父级分类ID
        cat_pid: 0,
        //分类等级，默认为一级分类
        cat_level: 0
      },
      //添加分类表单的验证规则对象
      addCategoryRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '分类名长度在 2 到 20 个字符之间 ',
            trigger: 'blur'
          }
        ]
      },
      // 控制修改分类对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的分类信息对象
      categoryEditForm: {},
      editCategoryRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '用户名长度在 2 到 20 个字符之间 ',
            trigger: 'blur'
          }
        ]
      },
      pid: 0,
      //树形表格每列数据
      columns: [
        {
        label: '分类名称',
        prop: 'cat_name'
        },
        {
        label: '是否有效',
        prop: 'cat_pid',
        type: 'template',
        template: 'isok'
        },
        {
        label: '排序',
        prop: 'cat_level',
        type: 'template',
        template: 'level'
        },
        {
        label: '操作',
        prop: 'categoryList',
        type: 'template',
        template: 'edit'
        }
      ],
      //多选框中获取的父级分类列表数据
      ParentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedKeys: []
    
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    //获取分类列表数据
    async getCategoryList() {
      const { data: res } = await this.$axios.get('categories', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      // 把数据列表，赋值给 catelist
      this.categoryList = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件 一页显示条数变更
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoryList()
      console.log(`每页 ${newSize} 条`)
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCategoryList()
      console.log(`当前页: ${newPage}`)
    },
    
    //点击编辑按钮通过id查询到该分类数据
    async getCategoryById(id) {
      const { data: res } = await this.$axios.get(`categories/${id}`)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取分类失败')
      this.categoryEditForm = res.data
      this.editDialogVisible = true
    },
    //删除分类并提交
    async removeCategoryById(id) {
      const result = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        return err
      })
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(result)
      if (result !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$axios.delete(`categories/${id}`)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      }

      this.$message.success('删除分类成功！')
      this.getCategoryList()
    },
    // 修改分类信息并提交
    editCategory() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改分类信息的数据请求
        const { data: res } = await this.$axios.put(
          `categories/${this.categoryEditForm.cat_id}`,
          {
            cat_name: this.categoryEditForm.cat_name
          }
        )
        console.log(res)
        if (res.meta.status != 200)
          return this.$message.error('更新分类信息失败')
        //刷新数据列表
        this.getCategoryList()
        // 关闭修改分类信息的对话框
        this.editDialogVisible = false
        //提示修改成功
        this.$message.success('更新分类信息成功')
      })
    },
    // 监听添加分类对话框的打开事件
    showAddDialogVisible() {
      this.addDialogVisible = true;
      this.getParentCateList();
    },
    
    // 监听修改分类对话框的关闭事件  重置对话框表单
    editDialogClose(categoryEditForm) {
      this.$refs.editFormRef.resetFields()
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const {data: res} = await this.$axios.get('categories', {
        params: {type: 2}
      });
      if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败')
      // 把数据列表，赋值给 parentCateList
      this.ParentCateList = res.data;
      console.log(res.data);
    },
     // 选择项发生变化触发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中了父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 为当前分类的等级赋值
        this.addForm.cat_level = this.selectedKeys.length
        return
      } else {
        // 父级分类的Id
        this.addForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addForm.cat_level = 0
      }
    },
    //对话框中点击确定按钮添加分类
    addCategory() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起添加分类的网络请求
        const { data: res } = await this.$axios.post('categories', this.addForm)
        console.log(res.data)
        if (res.meta.status != 201) return this.$message.error('分类添加失败')
        this.$message.success('分类添加成功')
        // 重新获取分类列表数据
        this.getCategoryList()
        // 隐藏添加分类的对话框
        this.addDialogVisible = false
      })
    },
    // 监听添加分类对话框的关闭事件  重置对话框表单
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
      this.selectedKeys = []
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    },
  }
}
</script>






<style lang="scss">
.box-card {
  margin-top: 1em;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.15) !important;
  .el-input-group {
    width: 40%;
    margin-right: 2em;
  }
  .zk-table {
    margin: 20px 0;
    border-radius: 5px;
    font-size: 12px;
  }
}
</style>