<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <!-- 主体头部添加角色按钮 -->
      <div>
        <!-- 添加角色按钮 -->
        <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        <!-- 添加角色的对话框 -->
        <el-dialog
          title="添加角色"
          :visible.sync="addDialogVisible"
          width="50%"
          @close="addDialogClose"
        >
          <el-form :model="addForm" :rules="addRoleRules" ref="addFormRef" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="addForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
              <el-input v-model="addForm.roleDesc"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRole">确 定</el-button>
          </span>
        </el-dialog>
      </div>
      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe style="width: 100%">
        <!-- 展开栏 --角色权限管理 -->
        <el-table-column type="expand" width="50">
          <template v-slot="scope">
            <el-divider></el-divider>
            <el-row v-for="item in scope.row.children" :key="item.id" class="expanded-row">
              <el-col :span="4">
                <el-tag closable @close="deleteRights(scope.row.id,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="20">
                <el-row
                  :class="[index === 0 ? '':'border-top']"
                  v-for="(item2,index) in item.children"
                  :key="item2.index"
                  class="expanded-row2"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="deleteRights(scope.row.id,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="deleteRights(scope.row.id,item3.id)"
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="50"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              @click="getRole(scope.row.id)"
              size="mini"
              icon="el-icon-edit"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showRightsDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 编辑用户的对话框 -->
      <el-dialog
        title="编辑用户信息"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <el-form :model="editForm" :rules="editRoleRules" ref="editFormRef" label-width="90px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限的对话框   -->
      <el-dialog title="分配权限" :visible.sync="setDialogVisible" width="50%" @close="setDialogClose">
        <el-tree
          :data="rightsList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          ref="treeRef"
          default-expand-all
          :default-checked-keys="defKeys"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //角色列表
      rolesList: [],
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //添加角色的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      //添加角色表单的验证规则对象
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '角色名称长度在 2 到 10 个字符之间 ',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            max: 100,
            message: '角色描述长度在 100 个字符以内 ',
            trigger: 'blur'
          }
        ]
      },
      // 控制编辑用户对话框的显示与隐藏
      editDialogVisible: false,
      //编辑角色的表单数据
      editForm: {},
      //编辑角色表单的验证规则对象
      editRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '角色名称长度在 2 到 10 个字符之间 ',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            max: 100,
            message: '角色描述长度在 100 个字符以内 ',
            trigger: 'blur'
          }
        ]
      },
      // 控制分配权限对话框的显示与隐藏
      setDialogVisible: false,
      //权限列表
      rightsList: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: ''
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    //获取角色列表
    async getRoleList() {
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status != 200) return this.$message.error('角色列表获取失败')
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    //添加角色
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起添加角色的网络请求
        const { data: res } = await this.$axios.post('roles', {
          roleName: this.addForm.roleName,
          roleDesc: this.addForm.roleDesc
        })
        if (res.meta.status != 201) return this.$message.error('角色创建失败')
        console.log(res)
        this.$message.success('角色添加成功')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        //重新获取角色列表数据
        this.getRoleList()
      })
    },
    // 监听添加角色对话框的关闭事件  重置对话框表单
    addDialogClose(addForm) {
      this.$refs.addFormRef.resetFields()
    },
    // 监听编辑角色对话框的关闭事件  重置对话框表单
    editDialogClose(editForm) {
      this.$refs.editFormRef.resetFields()
    },
    // 监听分配权限对话框的关闭事件  重置对话框表单
    setDialogClose() {
      this.defkeys = []
    },
    //展示编辑角色信息的对话框 获取该角色数据
    async getRole(id) {
      const { data: res } = await this.$axios.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 编辑角色信息并提交
    editRole() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起编辑角色的网络请求
        const { data: res } = await this.$axios.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )
        console.log(res)
        if (res.meta.status != 200) return this.$message.error('角色编辑失败')
        this.$message.success('角色编辑成功')
        // 隐藏添加用户的对话框
        this.editDialogVisible = false
        //重新获取角色列表数据
        this.getRoleList()
      })
    },
    // 删除角色并提交
    async removeRoleById(id) {
      const result = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        return err
      })
      // 如果角色确认删除，则返回值为字符串 confirm
      // 如果角色取消了删除，则返回值为字符串 cancel
      // console.log(result)
      if (result !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$axios.delete(`roles/${id}`)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }

      this.$message.success('删除角色成功！')
      this.getRoleList()
    },
    // 删除角色指定权限并提交
    async deleteRights(roleId, id) {
      const { data: res } = await this.$axios.delete(
        'roles/' + roleId + '/rights/' + id
      )
      console.log(res)
      console.log(id)
      console.log(roleId)
      if (res.meta.status !== 200) {
        return this.$message.error('权限删除失败！')
      }
      this.$message.success('权限删除成功')
      this.getRoleList()
    },
    //展示分配权限的对话框
    async showRightsDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$axios.get('rights/tree')

      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      this.rightsList = res.data
      console.log(this.rightsList)
      // 递归获取三级节点的Id
      this.getLeafKeys(role, this.defKeys)
      this.setDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    //分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys)
      const idStr = keys.join(',')
      const {
        data: res
      } = await this.$axios.post(`roles/ ${this.roleId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      console.log('分配权限成功！')
      this.setDialogVisible = false
      this.getRoleList()
    }
  }
}
</script>
<style lang="scss" scoped>
.el-divider--horizontal {
  display: block;
  height: 1px;
  margin: 0;
  background-color: #eee;
}
.expanded-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
}
.expanded-row2 {
  display: flex;
  align-items: center;
}
.el-tag {
  margin: 7px;
}
.border-top {
  border-top: 1px solid #eee;
}
</style>
