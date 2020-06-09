<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
      <el-breadcrumb-item></el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            :props="cascaderProps"
            expand-trigger="hover"
            v-model="selectedCateKeys"
            :options="cateList"
            @change="handleChanged"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 管理参数、属性的面板 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border style="width: 100%">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="tagClose( i, scope.row )"
                >{{item}}</el-tag>
                <el-input
                  class="input_new_tag"
                  v-if="scope.row.inputVisible"
                  maxlength="10"
                  size="small"
                  v-model="scope.row.inputValue"
                  @keyup.enter.native="addTag(scope.row)" @blur="addTag(scope.row)" 
                  ref="saveTagInput"
                ></el-input>
                <el-button
                  size="small"
                  v-else
                  @click="showInput(scope.row)"
                >&emsp;+&emsp;New&emsp;Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" lable="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <!-- 修改按钮 -->
                <el-button
                  type="primary"
                  @click="showEditDialogVisible(scope.row.attr_id)"
                  size="mini"
                  icon="el-icon-edit"
                >修改</el-button>
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border style="width: 100%">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="tagClose( i, scope.row )"
                >{{item}}</el-tag>
                <el-input
                  class="input_new_tag"
                  v-if="scope.row.inputVisible"
                  maxlength="10"
                  size="small"
                  v-model="scope.row.inputValue"
                  @keyup.enter.native="addTag(scope.row)" @blur="addTag(scope.row)" 
                  ref="saveTagInput"
                ></el-input>
                <el-button
                  size="small"
                  v-else
                  @click="showInput(scope.row)"
                >&emsp;+&emsp;New&emsp;Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" lable="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <!-- 修改按钮 -->
                <el-button
                  type="primary"
                  @click="showEditDialogVisible(scope.row.attr_id)"
                  size="mini"
                  icon="el-icon-edit"
                >修改</el-button>
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog title="添加动态参数" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="paramsAddForm" :rules="addParamsRules" ref="addFormRef" label-width="80px">
        <el-form-item label="动态参数" prop="attr_name">
          <el-input v-model="paramsAddForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑参数的对话框 -->
    <el-dialog
      title="修改动态参数"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        :model="paramsEditForm"
        :rules="editParamsRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="动态参数" prop="attr_name">
          <el-input v-model="paramsEditForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      //默认选中的标签页
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 控制添加参数对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据
      paramsAddForm: {
        attr_name: ''
      },
      //添加参数表单的验证规则对象
      addParamsRules: {
        attr_name: [
          { required: true, message: '请输入参数名', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '参数名长度在 2 到 10 个字符之间 ',
            trigger: 'blur'
          }
        ]
      },
      // 控制修改参数对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的参数信息对象
      paramsEditForm: {},
      // 修改参数验证规则
      editParamsRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '参数名称长度在 2 到 20 个字符之间 ',
            trigger: 'blur'
          }
        ]
      },
      // inputVisible: false,
      // inputValue: ''
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的Id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    }
  },
  methods: {
    //获取分类列表
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
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200)
        return this.$message.error('获取参数列表失败！')
      //将字符串分割为数组，以在表格中进行循环渲染
      res.data.forEach(item => {
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
    // tab 页签点击事件的处理函数
    handleTabClick(tab, event) {
      console.log(tab, event)
      this.getParamsData()
    },
    //点击编辑按钮通过id查询到该参数数据
    async showEditDialogVisible(id) {
      const { data: res } = await this.$axios.get(
        `categories/${this.cateId}/attributes/${id}`
      )
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      this.paramsEditForm = res.data
      this.editDialogVisible = true
    },
    // 监听添加参数对话框的关闭事件  重置对话框表单
    addDialogClose(paramsAddForm) {
      this.$refs.addFormRef.resetFields()
    },
    // 监听修改参数对话框的关闭事件  重置对话框表单
    editDialogClose(paramsEditForm) {
      this.$refs.editFormRef.resetFields()
    },
    // 添加参数信息并提交
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起添加参数的网络请求
        const { data: res } = await this.$axios.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.paramsAddForm.attr_name,
            attr_sel: this.activeName
          }
        )
        console.log(res.data)
        if (res.meta.status != 201) return this.$message.error('参数添加失败')
        this.$message.success('参数添加成功')
        // 隐藏添加参数的对话框
        this.addDialogVisible = false
        // 重新获取参数列表数据
        this.getParamsData()
      })
    },
    // 修改参数信息并提交
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改参数信息的数据请求
        const { data: res } = await this.$axios.put(
          `categories/${this.cateId}/attributes/${this.paramsEditForm.attr_id}`,
          {
            attr_name: this.paramsEditForm.attr_name,
            attr_sel: this.activeName
          }
        )
        console.log(res)
        if (res.meta.status != 200)
          return this.$message.error('更新参数信息失败')
        //提示修改成功
        this.$message.success('更新参数信息成功')
        //刷新数据列表
        this.getParamsData()
        // 关闭修改参数信息的对话框
        this.editDialogVisible = false
      })
    },
    // 根据Id删除对应的参数项
    async removeParams(attrId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 用户取消了删除的操作
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }

      // 删除的业务逻辑
      const { data: res } = await this.$axios.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )

      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')

      this.$message.success('删除参数成功！')
      this.getParamsData()
    },
    //关闭tag标签删除对应的参数可选项
    async tagClose(i, row) {
      row.attr_vals.splice(i, 1)
      // 发起删除参数项的数据请求
      const { data: res } = await this.$axios.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' ')
          //attr_vals渲染时被转换成了数组，需要再转回字符串
        }
      )
      console.log(res)
      if (res.meta.status != 200) return this.$message.error('删除参数项失败')
    },
    // 点击按钮，展示文本输入框
    showInput(row) {
      row.inputVisible = true;
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    // 文本框失去焦点，或摁下了 Enter 都会触发
    async addTag(row) {
      //文本框输入内容为空
      if (row.inputValue.length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      // 文本框内已输入内容，需要做后续处理
      row.attr_vals.push(row.inputValue)
      row.inputVisible = false
      row.inputValue = ''
      // 发起修改参数信息的数据请求
      const { data: res } = await this.$axios.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' ')
          //attr_vals渲染时被转换成了数组，需要再转回字符串
        }
      )
      console.log(res)
      if (res.meta.status != 200) return this.$message.error('添加参数项失败')
    }
  }
}
</script>

<style lang="scss" scoped>
.el-row {
  margin: 1em 0;
}
.el-table {
  margin: 20px 0;
  border-radius: 5px;
  font-size: 12px;
}
.el-tag {
  margin: 0 5px;
}
.input_new_tag {
  width: 120px;
}
</style>