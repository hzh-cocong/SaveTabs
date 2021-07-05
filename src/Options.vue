<template>
  <el-container id="app">

    <el-aside
      :width="collapse ? '65px' : '200px'"
      style="display: flex;flex-direction: column;height: 100vh;">
      <div
        style="display: flex; flex-direction: column;justify-content: center;align-items: center;height: 120px;min-height: 120px;width: 100%;box-sizing: border-box;border-right:solid 1px #e6e6e6;text-align:center;">
        <img
          src="@/assets/icon-128.png"
          style="cursor: pointer;"
          :style="{ width: collapse ? '20px' : '32px',
                    height: collapse ? '20px' : '32px', }"
          @click="$open('http://www.cocong.cn', $event)" />
        <h3
          class="hover"
          style="margin-bottom:0;"
          :style="{ fontSize: collapse ? '12px' : '1.17em',
                    fontWeight: collapse ? 'normal' : 'blod' }">
          <router-link
            style="color: #408DDC;text-decoration: none;"
            :to="{name: 'general'}">SaveTabs</router-link>
        </h3>
        <i
          :class="[ collapse ? 'el-icon-s-fold' : 'el-icon-s-unfold' ]"
          class="collapse"
          style="position: absolute;left: 0;top: 0;color:#6699CC;"
          @click="collapseChange"></i>
      </div>
      <el-menu
        id="app"
        :collapse="collapse"
        :collapse-transition="false"
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
      </el-menu>
    </el-aside>

    <el-main style="padding: 0;height: 100vh;overflow: auto;">
      <router-view
        :syncConfig="syncConfig"
        :localConfig="localConfig"
        :projectConfig="projectConfig"

        :currentThemeList="currentThemeList"
        :currentTheme.sync="currentTheme"
        :openWay="openWay"
      ></router-view>
    </el-main>

  </el-container>
</template>

<script>

import menus from './components/options/menus.config.js'

import userConfig from './config/user_config.json'
import userLocalConfig from './config/user_local_config.json'
import projectConfig from './config/project_config.json'

import userTheme from './config/user_theme.json'

const THEME_TYPWE = {
  POPUP: 1,
  INJECT: 2,
}

export default {
  name: 'app',
  provide(){
    return {
      changeWorkspaceState: this.changeWorkspaceState,
      toPin: this.toPin,
      workspaceSort: this.workspaceSort,
      OperateButtonSort: this.OperateButtonSort,
      changeThemeMode: this.changeThemeMode,
      popupChange: this.popupChange,
      keymapLeftAndRightChange: this.keymapLeftAndRightChange,
      workspaceChangeWordSync: this.workspaceChangeWordSync,
      setWorkspaceChangeWord: this.setWorkspaceChangeWord,

      changeAutoSort: this.changeAutoSort,
      allIncludeRemove: this.allIncludeRemove,
      allIncludeAdd: this.allIncludeAdd,
      allIncludeCountChange: this.allIncludeCountChange,
      allIncludeChangeTop: this.allIncludeChangeTop,
      allIncludeChangeSearchState: this.allIncludeChangeSearchState,
      allIncludeSort: this.allIncludeSort,
      searchEngineEnabled: this.searchEngineEnabled,
      addSearchEngine: this.addSearchEngine,
      editSearchEngine: this.editSearchEngine,
      deleteSearchEngine: this.deleteSearchEngine,
      searchEngineSort: this.searchEngineSort,

      changeType: this.changeType,
      changeThemeName: this.changeThemeName,
      editTheme: this.editTheme,
    }
  },
  data() {
    return {
      menus: menus,

      syncConfig: userConfig,
      localConfig: userLocalConfig,
      projectConfig: projectConfig,

      theme: userTheme,

      commands: [],

      // collapse: false,
      collapse: !! localStorage.getItem('collapse'),
    }
  },
  computed: {
    allWorkspaces() {
      return this.projectConfig.allWorkspaces;
    },
    allOperationButtons() {
      return this.projectConfig.allOperationButtons;
    },

    currentThemeId() {
      if(this.openWay == 'popup') return this.localConfig.theme_popup.id;
      else return this.localConfig.theme_inject.id;
    },
    currentTheme: {
      set(theme) {
        console.log('uuuuuuuuuuu1')
        if(this.openWay == 'popup') this.localConfig.theme_popup = theme;
        else this.localConfig.theme_inject = theme;
        this.storeTheme();
        // this.store('local');
      },
      get() {
        console.log('uuuuuuuuuuu2')
        // 合并系统主题和用户主题
        let currentTheme = this.themeList.find((theme) => theme.id == this.currentThemeId);

        if(this.openWay == 'popup') this.localConfig.theme_popup = currentTheme;
        else this.localConfig.theme_inject = currentTheme;

        return currentTheme;

        // 联系得还不够紧密
        //  // 合并系统主题和用户主题
        // let themeList = this.theme.system_theme_list.concat(this.theme.user_theme_list);
        // return themeList.find((theme) => theme.id == this.currentThemeId)

        // 不直接拿，否则会失去关联
        // if(this.openWay == 'popup') return this.localConfig.theme_popup;
        // else return this.localConfig.theme_inject;
      }
    },
    currentThemeList() {
      let themeType = this.openWay == 'popup' ? THEME_TYPWE.POPUP : THEME_TYPWE.INJECT;
      return this.themeList.filter(theme => themeType & theme.type );
    },
    themeList() {
      // 合并系统主题和用户主题
      let themeList = this.theme.system_theme_list.concat(this.theme.user_theme_list);

      // 对主题排序（没有 rank 的排最后）
      themeList.sort((theme1, theme2) => {
        if(this.theme.rank[theme1.id] == undefined && this.theme.rank[theme2.id] == undefined) return 0;
        if(this.theme.rank[theme1.id] == undefined) return 1;
        if(this.theme.rank[theme2.id] == undefined) return -1;

        return this.theme.rank[theme2.id]-this.theme.rank[theme1.id];
      });

      return themeList;
    },
    openWay() {
      return this.localConfig.popup ? 'popup' : 'inject';
    }
  },
  methods: {
    collapseChange() {
      this.collapse = ! this.collapse;
      if(this.collapse) {
        localStorage.setItem('collapse', 1);
      } else {
        localStorage.removeItem('collapse');
      }
    },

    store(type, tip=true) {
      if(type != 'local' && type != 'sync') return;

      chrome.storage[type].set({
        'config': type == 'sync' ? this.syncConfig : this.localConfig,
      }, () => {
        if( ! tip) return;
        this.$message({
          type: 'success',
          message: '修改成功|'+type,
          duration: 1000,
        });
      });
    },
    storeTheme(config = true, theme = true) {
      let setting =
      chrome.storage.local.set({
        'config': this.localConfig || undefined,
        'theme': this.theme || undefined,
      }, () => {
        this.$notify({
          title: '主题',
          message: '修改成功',
          position: 'bottom-left',
          duration: 1000,
        });
        // this.$message({
        //   type: 'success',
        //   message: '修改成功|theme',
        //   duration: 1000,
        // });
      })
    },

    changeWorkspaceState(type) {
      let workspace = this.allWorkspaces[type];

      workspace.isEnabled = ! workspace.isEnabled;

      if(workspace.isEnabled) {
        if(this.syncConfig.workspaces.indexOf(type) == -1) {
          this.syncConfig.workspaces.push(type);
        }
        if(this.allOperationButtons.indexOf(type) != -1
        && this.syncConfig.operationButtons.indexOf(type) == -1) {
          this.syncConfig.operationButtons.push(type);
        }
        this.store('sync');
        return;
      }

      if(this.syncConfig.workspaces.length <= 1) {
        // 要在下一个事件队列中执行，因为 dom 依赖都是被放到下一个事件队列中执行的
        this.$nextTick(() => {
          this.$set(this.allWorkspaces[type], 'isEnabled', true);
        });
        this.$message({
          type: 'warning',
          message: this.lang('workspaceCountLimit'),
        });
        return;
      }

      let index = this.syncConfig.workspaces.indexOf(type);
      this.syncConfig.workspaces.splice(index, 1);
      if(this.localConfig.pinned && this.localConfig.active_workspace_type == type) {
        this.localConfig.pinned = false;
        this.store('local', false)
      }

      index = this.syncConfig.operationButtons.indexOf(type);
      if(index != -1) {
        this.syncConfig.operationButtons.splice(index, 1);
      }

      this.store('sync');
    },
    toPin(type) {
      // 未启用则禁止操作
      if(this.allWorkspaces[type].isEnabled == false) {
        this.$message({
          type: 'warning',
          message: this.lang('workspaceEnable'),
        });
        return;
      }

      // 固定（之前未有任何固定）
      if( ! this.localConfig.pinned) {
        this.localConfig.active_workspace_type = type;
        this.localConfig.pinned = true;
        this.store('local');
        return;
      }

      // 取消固定
      if(this.localConfig.active_workspace_type == type) {
        this.localConfig.pinned = false;
        this.store('local');
        return;
      }

      // 固定（之前是固定别的）
      // this.config.pinned = true;
      this.localConfig.active_workspace_type = type;

      this.store('local');
    },
    workspaceSort({ newIndex, oldIndex }) {
      if(newIndex == oldIndex) {
        return;
      }
      if(newIndex >= this.syncConfig.workspaces.length) {
        newIndex = this.syncConfig.workspaces.length-1;
      }

      this.syncConfig.workspaces.splice(newIndex, 0, this.syncConfig.workspaces.splice(oldIndex , 1)[0]);
      this.store('sync');
    },
    OperateButtonSort({ newIndex, oldIndex }) {
      if(newIndex == oldIndex) {
        return;
      }
      if(newIndex >= this.syncConfig.operationButtons.length) {
        newIndex = this.syncConfig.operationButtons.length-1;
      }

      this.syncConfig.operationButtons.splice(newIndex, 0, this.syncConfig.operationButtons.splice(oldIndex , 1)[0]);
      this.store('sync');
    },
    changeThemeMode() {
      this.localConfig.theme_mode = this.localConfig.theme_mode == 'light' ? 'dark' : 'light';
      this.store('local');
    },
    popupChange() {
      this.localConfig.popup = ! this.localConfig.popup;
      chrome.browserAction.setPopup({ popup: this.localConfig.popup ? chrome.extension.getURL("savetabs.html") : ''})
      this.store('local');
    },
    keymapLeftAndRightChange() {
      this.localConfig.keymap_left_and_right = ! this.localConfig.keymap_left_and_right;
      this.store('local');
    },
    workspaceChangeWordSync(value) {
      if(this.syncConfig.workspace_change_word == value.trim()) return;
      this.syncConfig.workspace_change_word = value.trim();
      this.store('sync');
    },
    setWorkspaceChangeWord(value) {
      if(this.syncConfig.workspace_change_word == value.trim()) return;
      this.syncConfig.workspace_change_word = value.trim();
      this.store('sync');
    },

    changeAutoSort() {
      this.localConfig.all_sort_auto = ! this.localConfig.all_sort_auto;
      this.store('local');
    },
    allIncludeRemove(type) {
      let index = this.localConfig.all_include.findIndex(item => {
        return item.type == type;
      })
      if(index == -1) return;

      this.localConfig.all_include.splice(index, 1);
      this.store('local');
    },
    allIncludeAdd(type) {
      let index = this.localConfig.all_include.findIndex(item => {
        return item.type == type;
      })
      if(index != -1) return;

      this.localConfig.all_include.push({
        "type": type,
        "count": 3,
        "is_top": 0,
        "only_search": false
      });
      this.store('local');
    },
    allIncludeCountChange(type, count = 3) {
      let index = this.localConfig.all_include.findIndex(item => {
        return item.type == type;
      })
      if(index == -1) return;
      if(this.localConfig.all_include[index].count == count) return;

      this.localConfig.all_include[index].count = count;
      this.store('local');
    },
    allIncludeChangeTop(type, isTop) {
      let index = this.localConfig.all_include.findIndex(item => {
        return item.type == type;
      })
      if(index == -1) return;
      if(this.localConfig.all_include[index].is_top == isTop) return;

      this.localConfig.all_include[index].is_top = isTop;

      // 重新排下序，体验更好。
      this.localConfig.all_include.sort((item1, item2) => item2.is_top-item1.is_top);

      this.store('local');
    },
    allIncludeChangeSearchState(type, onlySearch) {
      let index = this.localConfig.all_include.findIndex(item => {
        return item.type == type;
      })
      if(index == -1) return;
      if(this.localConfig.all_include[index].only_search == onlySearch) return;

      this.localConfig.all_include[index].only_search = onlySearch;
      this.store('local');
    },
    allIncludeSort({newIndex, oldIndex }) {
      console.log('allIncludeSort', newIndex, oldIndex)
      if(newIndex == oldIndex) {
        return;
      }

      if(newIndex >= this.localConfig.all_include.length) {
        newIndex = this.localConfig.all_include.length-1;
      }
console.log('allIncludeSort2', newIndex, oldIndex)
      this.localConfig.all_include.splice(newIndex, 0, this.localConfig.all_include.splice(oldIndex , 1)[0]);
      this.store('local');
    },
    searchEngineEnabled(isEnabled) {
      let index = this.localConfig.all_include.findIndex(item => item.type == 'search');

      if(isEnabled) {
        if(index != -1) return; // 不太可能出现

        this.localConfig.all_include.push({
          "type": "search",
          "count": 1000,
          "is_top": -2,
          "only_search": true
        })
      } else {
        if(index == -1) return; // 不太可能出现

        this.localConfig.all_include.splice(index, 1);
      }
      this.store('local');
    },
    addSearchEngine(data) {
      this.localConfig.all_search_engine.push({
        name: data.name,
        formate: data.formate
      });
      this.store('local');
    },
    editSearchEngine(index, data) {
      this.localConfig.all_search_engine[index] = {
        name: data.name,
        formate: data.formate
      };
      this.store('local');
    },
    deleteSearchEngine(index) {
      let engine = this.localConfig.all_search_engine[index];
      this.$confirm(engine.name+' | '+engine.formate, '删除确认', {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true,
        customClass: 'window-message-box'
      }).then(() => {
        this.localConfig.all_search_engine.splice(index, 1);
        this.store('local');
      }).catch(() => {
      });
    },
    searchEngineSort({ newIndex, oldIndex }) {
      if(newIndex == oldIndex) {
        return;
      }
      if(newIndex >= this.localConfig.all_search_engine.length) {
        newIndex = this.localConfig.all_search_engine.length-1;
      }

      this.localConfig.all_search_engine.splice(newIndex, 0, this.localConfig.all_search_engine.splice(oldIndex , 1)[0]);
      this.store('local');
    },

    changeType(type) {
      let currentType = this.currentTheme.type;
      if(currentType & type) {
        currentType ^= type;
      } else {
        currentType |= type;
      }

      if(currentType == 0) {
        this.$message({
          type: 'warning',
          message: '至少选择一种类型',
          duration: 1000,
        });
        return;
      }

      let themeType = this.openWay == 'popup' ? THEME_TYPWE.POPUP : THEME_TYPWE.INJECT;
      console.log('ffffff', currentType, themeType, currentType & themeType)
      if( ! (currentType & themeType)
      && this.currentThemeList.length <= 1) {
        this.$message({
          type: 'warning',
          message: '该类型只剩下这最后一个主题了',
          duration: 1000,
        });
        return;
      }

      this.currentTheme.type = currentType;

      // 重新选一个主题
      if( ! (currentType & themeType)) {
        // 当前主题改变会触发保存
        this.currentTheme = this.currentThemeList[0];
        return;
      }

      this.storeTheme();
    },
    changeThemeName(name, save) {
      save && (name = name.trim());
      this.currentTheme.name = name;
      save && this.storeTheme();
    },
    editTheme(type, value) {
      console.log('editTheme', type, value);
      this.currentTheme.config[type] = value;
      this.storeTheme();
    },

    upgrade(syncItems, localItems) {
      // 老用户升级
      console.log('upgrade', syncItems, localItems);

      // 提取异步配置
      let syncConfig = {};
      if(syncItems.config.workspaces != undefined) {
        syncItems.config.workspaces.unshift('all');
        syncConfig.workspaces = syncItems.config.workspaces;

        if(syncItems.config.button_follow_workspace == true) {
          syncConfig.operationButtons = [];
          for(let type of syncItems.config.workspaces) {
            if(this.allOperationButtons.indexOf(type) != -1) {
              syncConfig.operationButtons.push(type);
            }
          }
        } else {
          syncConfig.operationButtons = this.allOperationButtons.filter(type => {
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
    console.log('mounted:options.vue');

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

      Object.keys(this.projectConfig.allWorkspaces).filter(type => {
        if(this.syncConfig.workspaces.indexOf(type) == -1) {
          this.projectConfig.allWorkspaces[type].isEnabled = false;
        }
      })
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.collapse {
  opacity: 0.3;
  /* cursor: pointer; */
}
.collapse:hover {
  color: #0099CC !important;
  opacity: 1;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>

<style>
body {
  margin: 0;
  /* 在插件模式下这个值是 12px，所以要强制一下 */
  font-size: 16px;
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

.el-dialog {
  max-width: 600px;
}

</style>