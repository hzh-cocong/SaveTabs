<template>
  <el-container id="app">

    <el-aside
      :width="collapse ? '65px' : '200px'"
      style="display: flex;flex-direction: column;height: 100vh;position: fixed;">
      <div
        style="display: flex; flex-direction: column;justify-content: center;align-items: center;height: 120px;min-height: 120px;width: 100%;box-sizing: border-box;border-right:solid 1px #e6e6e6;text-align:center;">
        <a :href="'https://www.cocong.cn/savetabs/#/'+lang('@@ui_locale')" target="_blank">
          <img
          src="@/assets/icon-128.png"
          style="cursor: pointer;"
          :style="{ width: collapse ? '20px' : '32px',
                    height: collapse ? '20px' : '32px', }" />
        </a>
        <!-- <img
          src="@/assets/icon-128.png"
          style="cursor: pointer;"
          :style="{ width: collapse ? '20px' : '32px',
                    height: collapse ? '20px' : '32px', }"
          @click="$open('https://www.cocong.cn/savetabs/#/'+lang('@@ui_locale'), getKeyType($event))" /> -->
        <h3
          class="hover"
          style="margin-bottom:0;font-weight:500;"
          :style="{ fontSize: collapse ? '12px' : '1.17em' }">
          <router-link
            style="color: #408DDC;text-decoration: none;"
            :to="{name: 'general'}">SaveTabs</router-link>
        </h3>
        <i
          :class="[ collapse ? 'el-icon-s-fold' : 'el-icon-s-unfold' ]"
          :title="collapse ? lang('unfold') : lang('fold')"
          class="collapse"
          style="position: absolute;left: 0;top: 0;color:#6699CC;"
          @click="collapseChange"></i>
        <i
          :class="[ uniqueOpened ? 'el-icon-menu' : 'el-icon-s-grid' ]"
          :title="uniqueOpened ? lang('submenuUniqueOpenTip') : lang('multipleSubmenuOpenTip')"
          class="collapse"
          style="position: absolute;left: 0;top: 18px;color:#6699CC;"
          @click="uniqueOpenedChange"></i>
      </div>
      <el-menu
        id="app"
        :collapse="collapse"
        :collapse-transition="false"
        :default-active="$route.name"
        style="flex: 1;overflow-x:hidden;overflow-y:auto;"
        :unique-opened="uniqueOpened"
        router>
        <el-submenu
          v-for="menu in menus"
          :index="menu.name"
          :key="menu.name">
          <template slot="title">
            <i :class="menu.icon"></i>
            <span>{{ lang(menu.title) }}</span>
          </template>
          <el-menu-item
            v-for="submenu in menu.children"
            :index="menu.name+'-'+submenu.name"
            :key="submenu.name">
            {{ lang(submenu.title) }}
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>

    <el-main
      class="main"
      :style="{ marginLeft: collapse ? '65px' : '200px' }">
      <router-view
        :syncConfig="syncConfig"
        :localConfig="localConfig"
        :projectConfig="projectConfig"

        :currentThemeList="currentThemeList"
        :currentTheme.sync="currentTheme"
        :openWay="openWay"

        :theme="theme"

        :commands="commands"
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
import { nanoid } from 'nanoid'

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
      resetSearchEngine: this.resetSearchEngine,

      changeThemeType: this.changeThemeType,
      changeThemeName: this.changeThemeName,
      editTheme: this.editTheme,
      themeSort: this.themeSort,
      addTheme: this.addTheme,
      cloneTheme: this.cloneTheme,
      deleteTheme: this.deleteTheme,
      changeTheme: this.changeTheme,

      editLocalConfig: this.editLocalConfig,
      editSyncConfig: this.editSyncConfig,

      download: this.download,
    }
  },
  data() {
    return {
      menus: menus,

      syncConfig: userConfig,
      localConfig: JSON.parse(JSON.stringify(userLocalConfig)),
      projectConfig: projectConfig,

      theme: userTheme,

      commands: [],

      // collapse: false,
      collapse: !! localStorage.getItem('collapse'),
      uniqueOpened: !! localStorage.getItem('uniqueOpened'), // 默认保持多个子菜单的展开
    }
  },
  computed: {
    allWorkspaces() {
      return this.projectConfig.allWorkspaces;
    },
    allOperationButtons() {
      return this.projectConfig.allOperationButtons;
    },

    currentThemeIndex() {
      let index = -1;
      for(let theme of this.currentThemeList) {
        index++;
        if(this.currentThemeId == theme.id) {
          return index;
        }
      }
      return -1;
    },
    currentThemeId() {
      if(this.openWay == 'popup') return this.localConfig.theme_popup.id;
      else return this.localConfig.theme_inject.id;
    },
    currentTheme: {
      set(theme) {
        if(this.openWay == 'popup') this.localConfig.theme_popup = theme;
        else this.localConfig.theme_inject = theme;
        // this.storeTheme({ 'config': true, 'theme': false, 'tip': false });
        this.store('local', false);
      },
      get() {
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
    popupThemeList() {
      let themeList = this.themeList.filter(theme => THEME_TYPWE.POPUP & theme.type );

      // 对主题排序（没有 rank 的排最后）
      let rank = this.theme.rank.popup;
      themeList.sort((theme1, theme2) => {
        if(rank[theme1.id] == undefined && rank[theme2.id] == undefined) return 0;
        if(rank[theme1.id] == undefined) return 1;
        if(rank[theme2.id] == undefined) return -1;

        return rank[theme2.id]-rank[theme1.id];
      });

      return themeList;
    },
    injectThemeList() {
      let themeList =  this.themeList.filter(theme => THEME_TYPWE.INJECT & theme.type );

      // 对主题排序（没有 rank 的排最后）
      let rank = this.theme.rank.inject;
      themeList.sort((theme1, theme2) => {
        if(rank[theme1.id] == undefined && rank[theme2.id] == undefined) return 0;
        if(rank[theme1.id] == undefined) return 1;
        if(rank[theme2.id] == undefined) return -1;

        return rank[theme2.id]-rank[theme1.id];
      });

      return themeList;
    },
    currentThemeList() {
      let themeType = this.openWay == 'popup' ? THEME_TYPWE.POPUP : THEME_TYPWE.INJECT;
      let themeList = this.themeList.filter(theme => themeType & theme.type );

      // 对主题排序（没有 rank 的排最后）
      let rank = this.openWay == 'popup' ? this.theme.rank.popup : this.theme.rank.inject;
      themeList.sort((theme1, theme2) => {
        if(rank[theme1.id] == undefined && rank[theme2.id] == undefined) return 0;
        if(rank[theme1.id] == undefined) return 1;
        if(rank[theme2.id] == undefined) return -1;

        return rank[theme2.id]-rank[theme1.id];
      });

      return themeList;
    },
    themeList() {
      // 合并系统主题和用户主题
      let themeList = this.theme.system_theme_list.concat(this.theme.user_theme_list);

      // // 对主题排序（没有 rank 的排最后）
      // themeList.sort((theme1, theme2) => {
      //   if(this.theme.rank[theme1.id] == undefined && this.theme.rank[theme2.id] == undefined) return 0;
      //   if(this.theme.rank[theme1.id] == undefined) return 1;
      //   if(this.theme.rank[theme2.id] == undefined) return -1;

      //   return this.theme.rank[theme2.id]-this.theme.rank[theme1.id];
      // });

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
    uniqueOpenedChange() {
      this.uniqueOpened = ! this.uniqueOpened;
      if(this.uniqueOpened) {
        localStorage.setItem('uniqueOpened', 1);
      } else {
        localStorage.removeItem('uniqueOpened');
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
          message: this.lang('modifySuccess'),
          duration: 1000,
        });
      });
    },
    storeTheme({config = true, theme = true, tip = true}={}) {
      chrome.storage.local.set({
        'config': config ? this.localConfig : undefined,
        'theme': theme ? {
          rank: this.theme.rank,
          user_theme_list: this.theme.user_theme_list,
        } : undefined,
      }, () => {
        if( ! tip) return;

        this.$notify({
          title: this.lang('theme'),
          message: this.lang('saveSuccess'),
          position: 'top-right',
          duration: 1000,
        });
      })
    },

    changeWorkspaceState(type) {
      let workspace = this.allWorkspaces[type];

      workspace.isEnabled = ! workspace.isEnabled;

      // 启用
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

      // 撤销（只剩最后一个）
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

      // 关闭
      let index = this.syncConfig.workspaces.indexOf(type);
      this.syncConfig.workspaces.splice(index, 1);

      // 重选 active_workspace_type
      if(this.localConfig.active_workspace_type == type) {
        // 取消固定
        if(this.localConfig.pinned) this.localConfig.pinned = false;
        // 重选 active_workspace_type
        this.localConfig.active_workspace_type = this.syncConfig.workspaces[0];
        this.store('local', false)
      } else {
        // 有可能 active_workspace_type 和实际存储的不一样
        // popup 切换窗口就会不同
        // 再保存一次可以避免一些问题
        this.store('local', false)
      }
      // 去除对应的操作按钮
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
          message: this.lang('enableWorkspaceTip'),
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
    popupChange(tip = true) {
      this.localConfig.popup = ! this.localConfig.popup;
      chrome.browserAction.setPopup({ popup: this.localConfig.popup ? chrome.extension.getURL("savetabs.html") : ''})
      this.store('local', tip);
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
      if(newIndex == oldIndex) {
        return;
      }

      if(newIndex >= this.localConfig.all_include.length) {
        newIndex = this.localConfig.all_include.length-1;
      }
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
      data.name = data.name.trim();
      data.formate = data.formate.trim();
      this.localConfig.all_search_engine.push({
        name: data.name,
        formate: data.formate
      });
      this.store('local');
    },
    editSearchEngine(index, data) {
      this.$set(this.localConfig.all_search_engine, index, {
        name: data.name.trim(),
        formate: data.formate.trim()
      });
      this.store('local');
    },
    deleteSearchEngine(index) {
      let engine = this.localConfig.all_search_engine[index];
      this.$confirm(engine.name+' | '+engine.formate, this.lang('searchEngineDeleteConfirm'), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true,
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
    resetSearchEngine(data) {
      this.$confirm('', this.lang('restoreEngineDeleteConfirm'), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true,
      }).then(() => {
        this.localConfig.all_search_engine = data;
        this.store('local');
      }).catch(() => {
      });
    },

    changeThemeType(type) {
      if(this.currentTheme.is_system) return;

      let currentType = this.currentTheme.type;
      if(currentType & type) {
        currentType ^= type;
      } else {
        currentType |= type;
      }

      if(currentType == 0) {
        this.$message({
          type: 'warning',
          message: this.lang('atLeastOneTypeTip'),
          duration: 1000,
        });
        return;
      }

      if( ! (currentType & THEME_TYPWE.POPUP)
      && this.popupThemeList.length <= 1) {
        this.$message({
          type: 'warning',
          message: this.lang('onlyLastPopupTip'),
          duration: 1000,
        });
        return;
      }

      if( ! (currentType & THEME_TYPWE.INJECT)
      && this.injectThemeList.length <= 1) {
        this.$message({
          type: 'warning',
          message: this.lang('onlyLastInjectTip'),
          duration: 1000,
        });
        return;
      }

      let currentThemeId = this.currentThemeId;
      this.currentTheme.type = currentType;

      // 重新选一个主题
      if( ! (currentType & THEME_TYPWE.POPUP)
        && this.localConfig.theme_popup.id == currentThemeId) {
        this.localConfig.theme_popup = this.popupThemeList[0];
      }
      if( ! (currentType & THEME_TYPWE.INJECT)
        && this.localConfig.theme_inject.id == currentThemeId) {
        this.localConfig.theme_inject = this.injectThemeList[0];
      }

      // 重新排序
      this.theme.rank.popup = this.popupThemeList.reduce((accumulator, key, index) => {
        accumulator[key.id] = this.popupThemeList.length-index;
        return accumulator;
      }, {});
      this.theme.rank.inject = this.injectThemeList.reduce((accumulator, key, index) => {
        accumulator[key.id] = this.injectThemeList.length-index;
        return accumulator;
      }, {});

      this.storeTheme();
    },
    changeThemeName(name, save) {
      save && (name = name.trim());
      this.currentTheme.name = name;
      save && this.storeTheme();
    },
    editTheme(type, value) {
      if(type == 'all') {
        this.$confirm('', this.lang('undoConfirm'), {
          confirmButtonText: this.lang('sure'),
          cancelButtonText: this.lang('cancel'),
          type: 'warning',
          center: true,
        }).then(() => {
          this.currentTheme.config = value;
          this.storeTheme();
        }).catch(() => {
        });
        return;
      } else if(type == 'background_blur') {
        if(this.currentTheme.config.container_background_blur > 0) {
          this.currentTheme.config.container_background_blur = 0;
          this.$message({
            type: 'warning',
            message: this.lang('blurTip'),
          });
        }
      } else if(type == 'container_background_blur') {
        if(this.currentTheme.config.background_blur > 0) {
          this.currentTheme.config.background_blur = 0;
          this.$message({
            type: 'warning',
            message: this.lang('blurTip'),
          });
        }
      } else if(type == 'position_horizontal_align') {
        if(value != 'center'
        && this.currentTheme.config.position_horizontal_distance < 0) {
          this.currentTheme.config.position_horizontal_distance = 0;
        }
      } else if(type == 'position_vertical_align') {
        if(value != 'center'
        && this.currentTheme.config.position_vertical_distance < 0) {
          this.currentTheme.config.position_vertical_distance = 0;
        }
      } else if(type == 'position_horizontal_distance') {
        if(value < 0) {
          this.currentTheme.config.position_horizontal_align = 'center';
        }
      } else if(type == 'position_vertical_distance') {
        if(value < 0) {
          this.currentTheme.config.position_vertical_align = 'center';
        }
      } else if(type == 'item_show_count') {
        if(this.currentTheme.config.list_page_count <= value) {
          this.currentTheme.config.list_page_count = value+1;
        }
      } else if(type == 'list_page_count') {
        if(this.currentTheme.config.item_show_count >= value) {
          this.currentTheme.config.item_show_count = value-1;
        }
      } else if(type == 'no_search_item_show_count') {
        if(value == 0) {
          this.currentTheme.config.no_search_list_page_count = 0;
        } else if(this.currentTheme.config.no_search_list_page_count <= value) {
          this.currentTheme.config.no_search_list_page_count = value+1;
        }
      } else if(type == 'no_search_list_page_count') {
        if(value <= 1) {
          value = 0;
          this.currentTheme.config.no_search_item_show_count = 0;
        } else if(this.currentTheme.config.no_search_item_show_count >= value) {
          this.currentTheme.config.no_search_item_show_count = value-1;
        } else if(this.currentTheme.config.no_search_item_show_count <= 0) {
          this.currentTheme.config.no_search_item_show_count = 1;
        }
      } else if(type == 'toolbar_height') {
        if(this.currentTheme.config.toolbar_input_font_size > Math.floor((value-2)/1.15)) {
          this.currentTheme.config.toolbar_input_font_size = Math.floor((value-2)/1.15);
        }
      } else if(type == 'toolbar_input_font_size') {
        if(this.currentTheme.config.toolbar_height < Math.ceil(value*1.15)+2) {
          this.currentTheme.config.toolbar_height = Math.ceil(value*1.15)+2;
        }
      }

      this.currentTheme.config[type] = value;
      this.storeTheme();
    },
    themeSort({newIndex, oldIndex }) {
      if(newIndex == oldIndex) {
          return;
        }

      if(newIndex >= this.currentThemeList.length) {
        newIndex = this.currentThemeList.length-1;
      }

      this.currentThemeList.splice(newIndex, 0, this.currentThemeList.splice(oldIndex , 1)[0]);
      let type = this.openWay == 'popup' ? 'popup' : 'inject';
      this.theme.rank[type] = this.currentThemeList.reduce((accumulator, key, index) => {
        accumulator[key.id] = this.currentThemeList.length-index;
        return accumulator;
      }, {});

      this.storeTheme({ config: false, theme: true });
    },
    addTheme(callback) {
      this.$prompt('', this.lang('themeNameInput'), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        inputValue: '',
      }).then(({ value }) => {
        let newTheme = Object.assign(
          {},
          JSON.parse(JSON.stringify(this.theme.system_theme_list[0])),
          {
            id: nanoid(),
            name: value,
            type: this.openWay == 'popup' ? THEME_TYPWE.POPUP : THEME_TYPWE.INJECT,
            is_system: undefined,
          }
        );
        let type = this.openWay == 'popup' ? 'popup' : 'inject';

        this.theme.user_theme_list.push(newTheme)
        this.localConfig['theme_'+type] = newTheme;

        this.storeTheme({tip: false});

        callback && callback();
      }).catch(() => {
      });
    },
    cloneTheme() {
      let newTheme = Object.assign(
        {},
        JSON.parse(JSON.stringify(this.currentTheme)),
        {
          id: nanoid(),
          is_system: undefined,
        }
      );
      if(this.currentTheme.is_system) newTheme.name = this.lang(newTheme.name);
      let type = this.openWay == 'popup' ? 'popup' : 'inject';

      this.theme.user_theme_list.push(newTheme)
      this.localConfig['theme_'+type] = newTheme;

      this.storeTheme({tip: false});
    },
    deleteTheme(callback) {
      this.$confirm(this.currentTheme.name, this.lang('themeDeleteConfirm'), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true,
      }).then(() => {
        let currentThemeType = this.currentTheme.type;
        let currentThemeId = this.currentThemeId;

        // 先删除上一个主题
        this.theme.user_theme_list = this.theme.user_theme_list.filter(theme => {
          return theme.id != currentThemeId
        });

        // 注意：user_theme_list 的变动会导致 themeList 变动
        //      themeList 变动引起 currentTheme 变动
        //      currentTheme 重新计算会调用 currentThemeId 和 themeList，即在 themeList 中找出 currentThemeId
        //      currentThemeId 的值是通过 localConfig 计算来的
        //      由于 localConfig 还未修改，所以 currentThemeId 不变，但是 themeList 中对应的 currentThemeId 已经被前面删除了
        //      所以 currentTheme 是 undefined 的，导致相关调用报错
        //      但实际并不会报错，因为 currentTheme 是在 dom 中被调用的，而 Vue 在更新 DOM 时是**异步**执行的
        //      也就是下面 localConfig 修改并存储后，Vue 才会更新 DOM，此时才会去获取 currentTheme 的值，这时就不会 undefined
        //      反过来说，如果现在直接在这里获取 currentTheme 的值，则会立刻进行计算，最终导致报错。

        // 重新选一个主题
        if((currentThemeType & THEME_TYPWE.POPUP)
          && this.localConfig.theme_popup.id == currentThemeId) {
          this.localConfig.theme_popup = this.popupThemeList[0];
        }
        if((currentThemeType & THEME_TYPWE.INJECT)
          && this.localConfig.theme_inject.id == currentThemeId) {
          this.localConfig.theme_inject = this.injectThemeList[0];
        }

        // 重新排序
        this.theme.rank.popup = this.popupThemeList.reduce((accumulator, key, index) => {
          accumulator[key.id] = this.popupThemeList.length-index;
          return accumulator;
        }, {});
        this.theme.rank.inject = this.injectThemeList.reduce((accumulator, key, index) => {
          accumulator[key.id] = this.injectThemeList.length-index;
          return accumulator;
        }, {});

        this.storeTheme();
        callback && callback();
      }).catch(() => {
      });
    },
    changeTheme(theme) {
      // if(theme.rank) this.theme.rank = theme.rank;
      if(theme.user_theme_list) this.theme.user_theme_list = theme.user_theme_list;
    },

    editLocalConfig(type, value) {
      this.localConfig[type] = value;
      this.store('local');
    },
    editSyncConfig(type, value) {
      this.syncConfig[type] = value;
      this.store('sync');
    },

    download: function(filename, data) {
      var urlObject = window.URL || window.webkitURL || window;
      var blob = new Blob([data], {type: "application/json"});
      var url = urlObject.createObjectURL(blob);

      chrome.downloads.download({
          url: url,
          filename: filename,
          //saveAs: false,
      });
    },
  },
  mounted() {
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
      if(Object.keys(syncItems.config).length == 0) {
        // 新用户（第一次安装）
        if(this._device.platform == 'Win') {
          this.localConfig.adjust_window_width = 16;
          this.localConfig.adjust_window_height = 28+22;
          this.localConfig.adjust_window_top = 37;
        }

        chrome.storage.sync.set({'config': this.syncConfig});
        chrome.storage.local.set({'config': this.localConfig});
      } else {
        // 新版（已安装过）
        Object.assign(this.syncConfig, syncItems.config);
        Object.assign(this.localConfig, localItems.config);

        // 防止一些恶意行为
        delete localItems.theme.system_theme_list;
        if(Array.isArray(localItems.theme.user_theme_list)) {
          localItems.theme.user_theme_list.forEach(theme => delete theme.is_system );
          Object.assign(this.theme, localItems.theme);
        }
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

.main {
  padding: 0;
  min-height: 100vh;
  /* height: 100vh;
  overflow: auto; */
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

.beautify-scrollbar {
  overflow: overlay !important;
}
.beautify-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background: transparent;
}
.beautify-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: rgba(127, 127, 127, .6);
}
.beautify-scrollbar::-webkit-scrollbar-thumb:hover {
  border-radius: 5px;
  background-color: rgba(127, 127, 127, .9);;
}
/* 边角 */
.beautify-scrollbar::-webkit-scrollbar-corner  {
  background: transparent;
}
</style>