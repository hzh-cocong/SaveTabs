<template>
  <div class="export-adjust">
    <el-alert
      type="info"
      title="仅在注入模式下，并且弹窗才有效"
      style="margin-bottom: 20px"
      :closable="false">
    </el-alert>
    <el-row :gutter="20">
      <el-col :sm="12" :md="8">
        <el-card
          class="box-card"
          header="宽度矫正"
          :body-style="{ paddingBottom: '10px' }">
          <el-input-number
            size="mini"
            style="width: 100px;margin-bottom: 10px;margin-right: 10px;"
            :value="localConfig.adjust_window_width"
            :min="-100"
            :max="100"
            :precision="0"
            @change="editLocalConfig('adjust_window_width', $event || 0)"></el-input-number>
        </el-card>
      </el-col>
      <el-col :sm="12" :md="8">
        <el-card
          class="box-card"
          header="高度矫正"
          :body-style="{ paddingBottom: '10px' }">
          <el-input-number
            size="mini"
            style="width: 100px;margin-bottom: 10px;margin-right: 10px;"
            :value="localConfig.adjust_window_height"
            :min="-100"
            :max="100"
            :precision="0"
            @change="editLocalConfig('adjust_window_height', $event || 0)"></el-input-number>
        </el-card>
      </el-col>
      <el-col :sm="12" :md="8">
        <el-card
          class="box-card"
          header="顶部偏移"
          :body-style="{ paddingBottom: '10px' }">
          <el-input-number
            size="mini"
            style="width: 100px;margin-bottom: 10px;margin-right: 10px;"
            :value="localConfig.adjust_window_top"
            :min="-100"
            :max="100"
            :precision="0"
            @change="editLocalConfig('adjust_window_top', $event || 0)"></el-input-number>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'ThemeAdjust',
  inject: [
    "editLocalConfig"
  ],
  props: {
    localConfig: {
      type: Object,
      required: true,
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.export-adjust {
  padding:20px;
}
.box-card {
  margin-bottom: 20px;
}
</style>

<style>

</style>