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

import userConfig from './config/user_config.json'
import userLocalConfig from './config/user_local_config.json'
import projectConfig from './config/project_config.json'

import user_theme from './config/user_theme.json'

export default {
  name: 'app',
  data() {
    return {
      menus: menus,

      syncConfig: userConfig,
      localConfig: userLocalConfig,

      theme: user_theme,

      commands: [],
    }
  },
  methods: {
    upgrade(syncItems, localItems) {
      // 老用户升级
      console.log('upgrade', syncItems, localItems);

      // 提取异步配置
      let syncConfig = {};
      if(syncItems.config.workspaces != undefined) {
        syncItems.config.workspaces.unshift('all');
        syncConfig.workspaces = syncItems.config.workspaces;

        if(syncItems.config.button_follow_workspace == true) {
          syncConfig.operateOrder = [];
          for(let type of syncItems.config.workspaces) {
            if([ 'window', 'note', 'temporary' ].indexOf(type) != -1) {
              syncConfig.operateOrder.push(type);
            }
          }
        } else {
          syncConfig.operateOrder = [ 'window', 'note', 'temporary' ].filter(type => {
            return syncItems.config.workspaces.indexOf(type) != -1;
          })
        }
      }

      // 提取主题（旧版只有 popup）
      let theme_popup = {
        "id": "Old Version Sync",
        "name": "Old Version Sync",
        "type": 1,
      }
      theme_popup.config = [
        "list_font_color",
        "list_background_color",
        "list_state_color",
        "list_keymap_color",
        "list_font_size",
        "list_state_size",
        "list_keymap_size",
        "list_page_count",

        "list_explain_font_size",
        "list_explain_font_color",
        "list_explain_focus_font_color",

        "list_focus_background_color",
        "list_focus_font_color",
        "list_focus_state_color",
        "list_focus_keymap_color",

        "list_current_background_color",
        "list_current_font_color",
        "list_current_state_color",

        "list_current_focus_background_color",
        "list_current_focus_font_color",
        "list_current_focus_state_color",

        "item_height",
        "item_show_count",

        "width",
        "background_color",

        "border_width",
        "border_color",
      ].reduce((accumulator, key) => {
        if(syncItems.config[key] != undefined) {
          accumulator[key] = syncItems.config[key]
        }
        return accumulator;
      }, {});
      // 添加新增的属性，旧版虽然没有配置但有默认值
      theme_popup.config.toolbar_input_tip_show = true;
      theme_popup.config.toolbar_input_font_size = 14;
      theme_popup.config.toolbar_input_font_color = '#606266';
      theme_popup.config.toolbar_input_focus_border_color = '#ffffff';
      theme_popup.config.toolbar_icon_color = '#C1C4CB';
      theme_popup.config.toolbar_border_color = '#dcdfe6';
      theme_popup.config.toolbar_input_focus_border_color = '#c0c4cc';
      if(theme_popup.config.list_explain_font_color != undefined)
        theme_popup.config.list_current_explain_font_color = theme_popup.config.list_explain_font_color;
      if(theme_popup.config.list_explain_focus_font_color != undefined)
        theme_popup.config.list_current_explain_focus_font_color = theme_popup.config.list_explain_focus_font_color;

      theme_popup.config = Object.assign({}, this.localConfig.theme_popup.config, theme_popup.config);

      // 提取本地配置
      let localConfig = {};
      if(syncItems.config.active_workspace_type != undefined) {
        localConfig.active_workspace_type = syncItems.config.active_workspace_type;
      }
      if(syncItems.config.pinned != undefined) {
        localConfig.pinned = syncItems.config.pinned;
      }
      if(syncItems.config.theme_mode != undefined) {
        localConfig.theme_mode = syncItems.config.theme_mode;
      }
      localConfig.theme_popup = theme_popup;

      console.log('options.test', syncConfig, '|', localConfig, '|', theme_popup)

      Object.assign(this.syncConfig, syncConfig);
      Object.assign(this.localConfig, localConfig);
      this.theme.user_theme_list.push(theme_popup);

      // 重新保存
      console.log('options.test2', this.syncConfig, '|', this.localConfig, '|', this.theme)
      chrome.storage.sync.set({'config': this.syncConfig});
      chrome.storage.local.set({'config': this.localConfig, 'theme': this.theme});
    }
  },
  mounted: function() {
    // todo
    window.o = this;


    Promise.all([
      new Promise((resolve) => {
        chrome.storage.sync.get({'config': {}}, items => {
          resolve(items);
        })
      }),
      new Promise((resolve) => {
        chrome.storage.local.get({'config': {}, 'theme': {}}, items => {
          resolve(items);
        })
      }),
      new Promise((resolve) => {
        chrome.commands.getAll(commands => {
          resolve(commands)
        })
      })
    ]).then(([syncItems, localItems, commands]) => {
      console.log('options:storage.get', syncItems, localItems)

      if(Object.keys(syncItems.config).length == 0) {
        // 新用户
        console.log('新用户')
        chrome.storage.sync.set({'config': this.syncConfig});
        chrome.storage.local.set({'config': this.localConfig});
      } else if(localItems.config.theme_popup == undefined) {
        // 老用户升级
        console.log('老用户升级')
        this.upgrade(syncItems, localItems);
      } else {
        // 新版
        console.log('新版')
        Object.assign(this.syncConfig, syncItems.config);
        Object.assign(this.localConfig, localItems.config);
        Object.assign(this.theme, localItems.theme);
      }

      this.commands = commands;
    })
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