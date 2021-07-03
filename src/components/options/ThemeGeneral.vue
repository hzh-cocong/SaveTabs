<template>
  <el-container>
    <el-aside
      width="200px"
      style="display: flex;flex-direction: column;height: 100vh;">
      Aside
    </el-aside>
    <el-container
      style="height: 100vh;">
      <el-header>
        Header
      </el-header>
      <el-main>
        <el-tabs type="card">
          <el-tab-pane label="用户管理" name="test">
            <!-- <span slot="label"><i class="el-icon-date"></i> 我的行程</span> -->

            <router-link slot="label" to="/theme-general/test">Go to Foo</router-link>

            用户管理

          </el-tab-pane>
          <el-tab-pane label="配置管理" name="test2">

            <router-link slot="label" to="/theme-general/test2">Go to Foo2</router-link>

            配置管理
          </el-tab-pane>
          <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
          <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'ThemeGeneral'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

<style>

</style>