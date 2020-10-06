<template>
  <div id="Goodss-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      <el-breadcrumb-item></el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <!-- 主体头部搜索框、添加订单按钮 -->
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
      </div>
      <!-- 订单列表 -->
      <el-table :data="OrdersList" border stripe style="width: 100%">
        <el-table-column type="index" label="#" width="50"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="90"
        ></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="90">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          width="70"
        ></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="140">
          <template slot-scope="scope">{{
            scope.row.create_time | dataFormat
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template v-slot="scope">
          <!-- 修改地址 编辑按钮 -->
          <el-button
            type="primary"
            @click="showEditDialog"
            size="mini"
            icon="el-icon-edit"
          ></el-button>
          <!-- 物流信息 -->
          <el-button
            type="success"
            icon="el-icon-location"
            size="mini"
            @click="showProgressDialog(scope.row.order_id)"
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
      <!-- 编辑对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="addressDialogVisible"
        width="50%"
        @close="addressDialogClosed"
      >
        <el-form
          :model="addressForm"
          :rules="addressFormRules"
          ref="addressFormRef"
          label-width="100px"
        >
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader style="width: 100%"
              v-model="addressForm.address1"
              :options="citydata"
              :props="{ expandTrigger: 'hover' }"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false"
            >确 定</el-button
          >
        </span>
      </el-dialog>
      <!-- 展示物流进度对话框 -->
      <el-dialog
        title="查看物流进度"
        :visible.sync="progressDialogVisible"
        width="50%"
      >
        <!-- 时间线 -->
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
            >{{ activity.context }}</el-timeline-item
          >
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import citydata from './citydata.js'
export default {
  data() {
    return {
      //搜索框数据
      searchInput: '',
      // 获取订单列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10
      },
      //订单列表数据
      OrdersList: [],
      //当前页
      currentPage: 1,
      //订单总数
      total: 0,
      // 控制修改订单对话框的显示与隐藏
      addressDialogVisible: false,
      //修改订单状态的携带参数
      editQueryInfo: {
        is_send: '',
        order_pay: '',
        pay_status: ''
      },
      //导入的地址数据
      citydata,
      //订单数据
      cateList: [],
      // 物流进度对话框
      progressDialogVisible: false,
      // 物流进度
      progressInfo: [],
      // 查询到的订单信息对象
      addressForm: {
        address1: [],
        address2: ''
      },
      // 修改表单的验证规则对象
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    //获取订单列表数据
    async getOrdersList() {
      const { data: res } = await this.$axios.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.OrdersList = res.data.goods
      this.total = res.data.total
      console.log(res)
    },
    // 监听 pagesize 改变的事件 一页显示条数变更
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
      console.log(`每页 ${newSize} 条`)
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
      console.log(`当前页: ${newPage}`)
    },
    //搜索功能
    Search() {
      this.queryInfo.pagenum = 1
      this.getOrdersList()
    },
    //展示编辑对话框
    showEditDialog () {
      this.addressDialogVisible = true
    },
    // 监听编辑对话框的关闭事件  重置对话框表单
    addressDialogClosed(addressForm) {
      this.$refs.addressFormRef.resetFields()
    },
    //展示物流信息
    async showProgressDialog (id) {
      // 供测试的物流单号：1106975712662
      const { data: res } = await this.$axios.get(`kuaidi/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败!')
      }
      this.progressInfo = res.data
      this.progressDialogVisible = true
    }
  }
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
