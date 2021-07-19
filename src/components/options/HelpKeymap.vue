<template>
  <div
    class="help-keymap">
    <el-card
      class="box-card"
      header="常用快捷键">
      <el-table
        :data="tableData"
        style="width: 100%">
        <el-table-column
          prop="date"
          label="日期"
          width="180">
        </el-table-column>
        <el-table-column
          prop="name"
          label="姓名"
          width="180">
        </el-table-column>
        <el-table-column
          prop="address"
          label="地址">
        </el-table-column>
      </el-table>
    </el-card>
    <el-card
      class="box-card"
      header="列表选择">

    </el-card>
    <el-card
      class="box-card"
      header="工作区切换">

    </el-card>
    <el-card
      class="box-card"
      header="特殊操作">

    </el-card>
    <el-card
      class="box-card"
      header="自定义快捷键">

    </el-card>
  </div>
</template>

<script>
export default {
  name: 'HelpKeymap',
  data() {
    return {
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.help-keymap {
  padding:20px;
}

.box-card {
  margin-bottom: 20px;
}
</style>

<style>

</style>