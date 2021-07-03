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
        <el-tabs
          type="card"
          v-model="activeName"
          @tab-click="tabClick">
          <el-tab-pane label="用户管理" name="test">
            <!-- <span slot="label"><i class="el-icon-date"></i> 我的行程</span> -->

            <!-- <router-link slot="label" to="?test">Go to Foo</router-link> -->

          </el-tab-pane>
          <el-tab-pane label="配置管理" name="test2">

            <!-- <router-link slot="label" to="?test2">Go to Foo2</router-link> -->

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
  name: 'ThemeGeneral',
  data() {
    return {
      activeName: 'test',
    }
  },
  methods: {
    tabClick() {
      console.log('tabClick', this.activeName);
      this.$router.push('/theme-general?'+this.activeName);
    }
  },
  mounted() {
    // todo
    window.tg = this;

    let res = window.location.href.match(/\?([^?]+)$/);
    if(res != null) {
      this.activeName = res[1];
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

<style>

</style>