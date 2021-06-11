<template>
  <el-container id="app">

    <el-aside
      width="200px"
      style="display: flex;flex-direction: column;height: 100vh;">
      <div
        style="display: flex; flex-direction: column;justify-content: center;align-items: center;height: 120px;min-height: 120px;width: 100%;box-sizing: border-box;border-right:solid 1px #e6e6e6;text-align:center;">
        <img
          src="@/assets/icon-128.png"
          style="wdith:32px;height: 32px;cursor: pointer;"
          @click="$open('http://www.cocong.cn', $event)" />
        <h3
          style="margin-bottom:0;"
          class="hover">
          <router-link
            style="color: #408DDC;text-decoration: none;"
            :to="{name: 'general'}">SaveTabs</router-link>
        </h3>
      </div>
      <el-menu
        id="app"
        :default-active="$route.name"
        style="flex: 1;overflow: auto;"
        :unique-opened="true"
        router>
        <el-submenu
          v-for="menu in menus"
          :index="menu.name"
          :key="menu.name">
          <template slot="title">
            <i :class="menu.icon"></i>
            <span>{{ menu.title }}</span>
          </template>
          <el-menu-item
            v-for="submenu in menu.children"
            :index="menu.name+'-'+submenu.name"
            :key="submenu.name">
            {{ submenu.title }}
          </el-menu-item>
        </el-submenu>

        <!-- <el-submenu index="workspaces">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>工作区</span>
          </template>
          <el-menu-item index="general">总览</el-menu-item>
          <el-menu-item index="window">窗口</el-menu-item>
          <el-menu-item index="note">便签</el-menu-item>
          <el-menu-item index="temporary">临时窗口</el-menu-item>
          <el-menu-item index="tab">活跃标签</el-menu-item>
          <el-menu-item index="bookmark">书签</el-menu-item>
          <el-menu-item index="history">历史记录</el-menu-item>
          <el-menu-item index="import-export">导入导出</el-menu-item>
        </el-submenu>
        <el-submenu index="2">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>导航一</span>
          </template>
          <el-submenu index="2-1">
            <template slot="title">选项4</template>
            <el-menu-item index="2-1-1">选项1</el-menu-item>
          </el-submenu>
        </el-submenu> -->
      </el-menu>
    </el-aside>

    <el-main style="padding: 0;">
      <router-view></router-view>
    </el-main>

  </el-container>
</template>

<script>

import menus from './components/options/menus.config.js'

export default {
  name: 'app',
  data() {
    return {
      menus: menus,
    }
  },
  mounted: function() {
    // todo
    window.o = this;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

<style>
body {
  margin: 0;
}

.el-submenu__title, .el-submenu .el-menu-item {
  height: 40px !important;
  line-height: 40px !important;
}

/* 组件共享样式 */
.hover {
  /* color: red !important; */
  opacity: 0.8;
}
.hover2 {
  /* color: red !important; */
  opacity: 0.6;
}
.hover, .hover2 {
  cursor: pointer;
}
.hover:hover, .hover2:hover {
  /* color: blue !important; */
  opacity: 1;
}
</style>