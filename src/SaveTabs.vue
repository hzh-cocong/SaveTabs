<template>
<div
  id="app"
  v-loading.fullscreen="isLoading"
  :style="{
    width: (currentThemeConfig.width
          + currentThemeConfig.border_width*2
          + currentThemeConfig.padding_width*2)+'px',

    '--carousel-indicators-color': currentThemeConfig.carousel_indicators_color,
  }"
  @click.stop="focus">

<!-- height: (currentThemeConfig.item_height*currentThemeConfig.item_show_count -->
  <div
    style="border-style:solid;overflow:hidden;"
    :style="{
      height: ( listHeight
              + currentThemeConfig.toolbar_height
              + 10
              + (listHeight == 0 ? 0 : 10)
              + 10)+'px',
      backgroundColor: currentThemeConfig.background_color,
      borderWidth: currentThemeConfig.border_width+'px',
      borderColor: currentThemeConfig.border_color,
      padding: currentThemeConfig.padding_width+'px',
    }">

    <div
      class="toolbar"
      :style="{  height: currentThemeConfig.toolbar_height+'px',
                marginBottom: listHeight == 0 ? 0 : '10px',

                '--toolbar_height': currentThemeConfig.toolbar_height+'px',
                '--toolbar-background-color': currentThemeConfig.toolbar_background_color,
                '--toolbar-border-color': currentThemeConfig.toolbar_border_color,

                '--toolbar-icon-color': currentThemeConfig.toolbar_icon_color,
                '--toolbar-icon-focus-color': currentThemeConfig.toolbar_icon_focus_color,

                '--toolbar-input-font-size': currentThemeConfig.toolbar_input_font_size+'px',
                '--toolbar-input-font-color': currentThemeConfig.toolbar_input_font_color,
                '--toolbar-input-focus-border-color': currentThemeConfig.toolbar_input_focus_border_color,
                '--toolbar-input-selected-font-color': currentThemeConfig.toolbar_input_selected_font_color,
                '--toolbar-input-selected-background-color': currentThemeConfig.toolbar_input_selected_background_color,
                '--toolbar-input-prepend-border-width': ((! currentThemeConfig.toolbar_menu_auto_hide
                                                        || showClearButton
                                                        || menuVisible) ? 1 : 0 )+'px',

                '--toolbar-button-font-color': currentThemeConfig.toolbar_button_font_color,
                '--toolbar-button-hover-font-color': currentThemeConfig.toolbar_button_hover_font_color,
                '--toolbar-button-active-font-color': currentThemeConfig.toolbar_button_active_font_color,
                '--toolbar-button-hover-border-color': currentThemeConfig.toolbar_button_hover_border_color,
                '--toolbar-button-active-border-color': currentThemeConfig.toolbar_button_active_border_color,
                '--toolbar-button-hover-background-color': currentThemeConfig.toolbar_button_hover_background_color,
                '--toolbar-button-active-background-color': currentThemeConfig.toolbar_button_active_background_color,

                }"
      @mouseleave="showOperationButton=false">
      <!-- autofocus 会报错 Blocked autofocusing on a <input> element in a cross-origin subframe.-->
      <!-- up down 加 prevent 是为了让光标不跟着移动 -->
      <el-input
        v-model="keyword"
        name="search-input"
        class="search-input"
        :class="{ clearable: keyword !='' && showClearButton,
                  smaller: ! currentThemeConfig.toolbar_icon_auto_hide
                        || showClearButton
                        || (other.visible || history.visible || bookmark.visible || tab.visible) }"
        spellcheck="false"
        :placeholder="currentWorkspace == undefined || ! currentThemeConfig.toolbar_input_tip_show
                    ? ''
                    : lang(currentWorkspace.placeholder)"
        :clearable="false"
        @keyup.native="keyType=getKeyType($event)"
        @keydown.native="keydown"
        @keydown.native.down.prevent="selectDelay('down', getKeyType($event))"
        @keydown.native.up.prevent="selectDelay('up', getKeyType($event))"
        @keydown.native.left="leftOrRightDown('left', $event)"
        @keydown.native.right="leftOrRightDown('right', $event)"
        @keydown.native.enter="openWindow(getKeyType($event))"
        @keydown.native.esc="close"
        @input="search"
        @compositionstart.native="isComposition=true"
        @compositionupdate.native="$refs.workspaces[ activeWorkspaceRefIndex ].search(keyword+$event.data)"
        @compositionend.native="isComposition=false"
        @mouseleave.native="showClearButton=false;"
        ref="input">
        <template slot="prepend">
          <el-dropdown
            v-show=" ! currentThemeConfig.toolbar_menu_auto_hide
                  || showClearButton
                  || menuVisible"
            trigger="hover"
            placement="bottom-start"
            :style="{ width: currentThemeConfig.toolbar_menu_show_workspace_name ? '140px' : 'auto' }"
            :hide-on-click="false"
            :show-timeout="0"
            @visible-change="menuVisible = arguments[0]"
            @command="arguments[0] != -1
                    && (activeWorkspaceIndex=arguments[0],
                        $refs.carousel.setActiveItem(activeWorkspaceIndex))"><!-- 可能重复点击，所以还是要 focus 的 -->
            <span
              class="el-dropdown-link"
              @mousedown.prevent> <!-- 工作区标题 -->
              <svg-icon
                :name="currentWorkspace == undefined ? 'frown-open-regular' : currentWorkspace.svg"
                style="width: 20px; height: 20px; margin-right: 3px;"
                :style="{ color: localConfig.pinned && currentWorkspace != undefined && localConfig.active_workspace_type == currentWorkspace.type
                      ? currentThemeConfig.toolbar_menu_icon_fixed_color : currentThemeConfig.toolbar_menu_icon_color}"></svg-icon>
              <span
                v-if="currentThemeConfig.toolbar_menu_show_workspace_name"
                :style="{ color: currentThemeConfig.toolbar_menu_font_color }">{{ currentWorkspace == undefined ? '' : lang(currentWorkspace.title) }}</span>
              <i style="transition: transform .3s;"
                class="el-icon-arrow-down el-icon--right"
                :class="{ 'is-reverse': menuVisible}"
                :style="{ color: currentThemeConfig.toolbar_icon_color }"></i>
            </span>
              <!-- :style="{ maxHeight: (currentThemeConfig.item_height*currentThemeConfig.item_show_count -->
            <el-dropdown-menu
              slot="dropdown"
              class="toolbar-menu"
              @mousedown.native.prevent
              :style="{ maxHeight: ((listHeight == 0 ? currentThemeConfig.item_height-10 : listHeight)
                                  + currentThemeConfig.border_width
                                  + currentThemeConfig.padding_width
                                  + (currentThemeConfig.statusbar_show ? statusbarHeight : 0)
                                  - 10
                                  - 1 )+'px' }">
              <el-dropdown-item
                v-for="(workspace, index) in workspaces"
                :label="lang(workspace.title)"
                :command="index"
                :class="{ selected: index == activeWorkspaceIndex }"
                :title="keymap['open_workspace_'+workspace.type]
                      ? '快捷键：'+keymap['open_workspace_'+workspace.type]
                      : ''"
                :key="index">
                <svg-icon
                  :name="workspace.svg"
                  style="width:16px;margin-right: 10px;vertical-align: -0.50em"
                  :style="{
                    color: localConfig.pinned
                  && localConfig.active_workspace_type == workspace.type
                  ? 'gray' : '#c0c4cc'}"
                  @click="toPin"
                ></svg-icon><span>{{ lang(workspace.title) }}</span>
              </el-dropdown-item>
              <el-dropdown-item
                divided
                :command="-1"
                :title="currentTheme.name"
                style="overflow: hidden; text-overflow:ellipsis; white-space:nowrap;"
                @click.native="themeDialogVisible=true;"><!-- 顶部已继承了 click focus -->
                <i class="el-icon-check"></i><span>{{ currentTheme.name }}</span>
              </el-dropdown-item>
              <el-dropdown-item
                divided
                :value="activeWorkspaceIndex"
                :command="-1"
                style="cursor: default;line-height: 0;text-align:center;"
                class="other">
                <svg-icon
                  name="cog-solid"
                  class="hover"
                  style="cursor:pointer;height: 20px;color: #c0c4cc;margin-top: 4px;"
                  @click.native="$open('./options.html?type=workspace', getKeyType($event))"
                ></svg-icon>
                <svg-icon
                  :name="localConfig.theme_mode == 'light' ? 'sun-solid' : 'moon-solid'"
                  class="hover"
                  style="cursor:pointer;height: 20px;margin: 0 10px;"
                  :style="{ color: localConfig.theme_mode == 'light' ? '#c0c4cc' : 'gray'}"
                  @click.native="changeThemeMode"></svg-icon>
                <svg-icon
                  name="thumbtack-solid"
                  class="hover"
                  style="cursor:pointer;height: 20px;"
                  :style="{ transform: localConfig.pinned
                                    && currentWorkspace != undefined
                                    && localConfig.active_workspace_type == currentWorkspace.type
                                    ? 'rotate(0)' : 'rotate(90deg)',
                            color: localConfig.pinned
                                && currentWorkspace != undefined
                                && localConfig.active_workspace_type == currentWorkspace.type
                                ? 'gray' : '#c0c4cc', }"
                  @click.native="toPin"></svg-icon>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template slot="suffix">
          <i
            v-if="keyword !='' && showClearButton"
            class="el-icon-circle-close"
            @mousedown.prevent
            @click="$refs.input.$emit('input', '');focus();"></i>
        </template>
        <template
          slot="prefix"
          v-if=" ! currentThemeConfig.toolbar_icon_auto_hide
                || showClearButton
                || (other.visible || history.visible || bookmark.visible || tab.visible)">
          <template v-if="currentWorkspace != undefined && currentWorkspace.type == 'history'">
            <el-popover
              v-model="history.visible"
              placement="top-start"
              trigger="manual"
              transition
              @after-enter="history.date == null && $refs.date.focus()"
              @after-leave="focus">
              <el-date-picker
                type="date"
                v-model="history.date"
                placeholder="选择日期"
                :picker-options="history.pickerOptions"
                @blur="focus"
                @change="focus"
                ref="date">
              </el-date-picker>
              <i
                class="el-icon-delete"
                style="margin-left: 10px;cursor: pointer;"
                :style="{ color: keyword.trim() != '' ? '#c0c4cc' : 'inherit',
                          cursor: keyword.trim() != '' ? 'not-allowed' : 'pointer' }"
                @mousedown.prevent
                @click="keyword.trim() != '' ? '' : history.isDel = true"></i>
              <i
                class="el-icon-close"
                style="margin-left: 10px; cursor: pointer;"
                @mousedown.prevent
                @click="history.visible = false;"></i>
              <i
                class="el-icon-date"
                slot="reference"
                style="padding-left: 4px;cursor: pointer;"
                :style="{ 'line-height': currentThemeConfig.toolbar_height+'px',
                          color: history.visible ? currentThemeConfig.toolbar_icon_focus_color : currentThemeConfig.toolbar_icon_color }"
                @mousedown.prevent
                @click="history.visible = ! history.visible"></i>
            </el-popover>
          </template>
          <template v-else-if="currentWorkspace != undefined && currentWorkspace.type == 'bookmark'">
            <el-popover
              v-model="bookmark.visible"
              placement="top-start"
              trigger="manual"
              transition
              popper-class="no-padding"
              @after-leave="focus">
              <div
                style="padding: 12px;cursor: default;"
                @mousedown.prevent>
                <el-button
                  size="mini"
                  icon="el-icon-s-fold"
                  :disabled="keyword.trim() != ''"
                  @click="bookmark.fold = true;">全部收起</el-button>
                <el-button
                  size="mini"
                  icon="el-icon-s-unfold"
                  :disabled="keyword.trim() != ''"
                  @click="bookmark.unfold = true;">全部展开</el-button>
                <i
                  class="el-icon-close hover"
                  style="float: right;margin-top: 8px;margin-left: 10px;cursor: pointer;"
                  @click="bookmark.visible = false;"></i>
                <i
                  class="el-icon-setting hover"
                  style="float: right;margin-top: 8px;margin-left: 10px;cursor: pointer;"
                  @click="$open('chrome://bookmarks', getKeyType($event))"></i>
              </div>
              <i
                class="el-icon-s-operation"
                slot="reference"
                style="padding-left: 4px;cursor: pointer;"
                :style="{ 'line-height': currentThemeConfig.toolbar_height+'px',
                          color: bookmark.visible ? currentThemeConfig.toolbar_icon_focus_color : currentThemeConfig.toolbar_icon_color }"
                @mousedown.prevent
                @click="bookmark.visible = ! bookmark.visible"></i>
            </el-popover>
          </template>
          <template v-else-if="currentWorkspace != undefined && currentWorkspace.type == 'tab'">
            <el-popover
              v-model="tab.visible"
              placement="top-start"
              trigger="manual"
              transition
              popper-class="tab-popver"
              @after-leave="focus">
              <span
                style="display: inline-block; max-width: 200px;margin-bottom: -4px;padding: 12px 0;overflow: overlay; white-space:nowrap;"
                class="beautify-scrollbar">
                <!-- <el-radio
                  v-model="tab.windowId"
                  style="margin-right: 10px;"
                  v-for="([windowId, name]) in tab.windowFilter"
                  :label="windowId"
                  :key="windowId">{{ name }}</el-radio> -->
                <el-radio-group
                  v-model="tab.windowId"
                  size="mini"
                  @change="focus">
                  <el-radio-button
                    v-for="([windowId, name]) in tab.windowFilter"
                    :label="windowId"
                    :key="windowId">{{ name }}</el-radio-button>
                </el-radio-group>
              </span>
              <i
                class="el-icon-close hover"
                style="float: right;margin-left: 10px;margin-top: 20px;cursor: pointer;"
                @mousedown.prevent
                @click="tab.visible = false;"></i>
              <i
                class="el-icon-search"
                slot="reference"
                style="padding-left: 4px;cursor: pointer;"
                :style="{ 'line-height': currentThemeConfig.toolbar_height+'px',
                          color: tab.visible ? currentThemeConfig.toolbar_icon_focus_color : currentThemeConfig.toolbar_icon_color }"
                @mousedown.prevent
                @click="tab.visible = ! tab.visible"></i>
            </el-popover>
          </template>
          <template v-else>
            <el-popover
              v-model="other.visible"
              placement="top-start"
              trigger="manual"
              transition
              popper-class="no-padding"
              @after-leave="focus">
              <div
                style="padding: 12px;cursor: default;"
                @mousedown.prevent>
                <span>暂无其它功能</span>
                <i
                  class="el-icon-close hover"
                  style="float: right;margin-top: 3px;cursor: pointer;"
                  @click="other.visible = false;"></i>
              </div>
              <i
                class="el-icon-search"
                slot="reference"
                style="padding-left: 4px;cursor: pointer;"
                :style="{ 'line-height': currentThemeConfig.toolbar_height+'px',
                          color: other.visible ? currentThemeConfig.toolbar_icon_focus_color : currentThemeConfig.toolbar_icon_color }"
                @mousedown.prevent
                @click="other.visible = ! other.visible"></i>
            </el-popover>
          </template>
        </template>
      </el-input>
      <el-button-group
        v-show=" ! currentThemeConfig.toolbar_button_auto_hide || showOperationButton"
        style="display: flex"
        :style="{ width: ((currentThemeConfig.toolbar_height/(40/(40+15)))*config.operationButtons.length)+'px' }">
        <el-button
          v-for="(type, i) in config.operationButtons"
          :key="i"
          type="default"
          :icon="allWorkspaces[type].icon_simple"
          :title="limited
                ? '功能受限'
                : keymap['add_'+type] ? '快捷键：'+keymap['add_'+type] : ''"
          @mousedown.native.prevent
          @click.stop="operate(getKeyType($event), type)"></el-button><!-- todo  :disabled="limited" -->
      </el-button-group>
    </div>

      <!-- :height="(currentThemeConfig.item_height*currentThemeConfig.item_show_count)+'px'" -->
    <el-carousel
      v-if="activeWorkspaceIndex != -1"
      indicator-position="outside"
      arrow="never"
      :autoplay="false"
      :loop="true"
      :initial-index="activeWorkspaceIndex"
      :height="listHeight+'px'"
      :trigger="carouselTrigger"
      @change="workspaceChange"
      @mousedown.native.prevent
      ref="carousel">
      <el-carousel-item
        v-for="(workspace, index) in workspaces"
        :key="index">
        <component
          v-if="isOpened[index]"

          :is="workspace.type"
          :config="config"
          :localConfig="localConfig"
          :currentThemeConfig="currentThemeConfig"
          :projectConfig="projectConfig"
          :isLoad="isLoad"
          :keyType="keyType"
          :activeWorkspace="currentWorkspace == undefined ? {} : currentWorkspace"
          :openWay="openWay"

          :history="history"
          :bookmark="bookmark"
          :tab="tab"

          @update:searchTotal="$set(searchTotal, currentWorkspace.type, $event)"
          @update:listCount="$set(listCount, currentWorkspace.type, $event)"

          @finish="finish"
          ref="workspaces"></component>
      </el-carousel-item>
    </el-carousel>

  </div>

  <Statusbar
    v-if="currentThemeConfig.statusbar_show"
    :config="config"
    :currentThemeConfig="currentThemeConfig"
    :localConfig="localConfig"
    :isLoad="isLoad"
    :currentWorkspace="currentWorkspace == undefined ? {} : currentWorkspace"
    :statusbarHeight="statusbarHeight"
    @mousedown.native.prevent
    ref="statusbar"></Statusbar>

  <theme
    v-if="menuVisible || themeDialogVisible || ! themeDialogFinish"
    v-model="currentTheme"
    :visible.sync="themeDialogVisible"
    :localConfig="localConfig"
    :openWay="openWay"
    @open="themeDialogFinish=false"></theme>
    <!-- @closed="themeDialogFinish=false" -->

</div>
</template>

<script>
import Window from './components/savetabs/Window.vue'
import History from './components/savetabs/History.vue'
import Tab from './components/savetabs/Tab.vue'
import Bookmark from './components/savetabs/Bookmark.vue'
import Note from './components/savetabs/Note.vue'
import Temporary from './components/savetabs/Temporary.vue'
import All from './components/savetabs/All.vue'
import Theme from './components/savetabs/Theme.vue'
import Statusbar from './components/savetabs/Statusbar.vue'

import user_config from './config/user_config.json'
import user_local_config from './config/user_local_config.json'
import project_config from './config/project_config.json'

export default {
  name: 'app',
  provide(){
    return {
      focus: this.focus,
      blur: this.blur,
      input: this.input,
      loading: this.loading,

      prev: () => this.$refs.carousel.prev(),
      next: () => this.$refs.carousel.next(),
      left: () => this.$refs.carousel.setActiveItem(0),
      right: () => this.$refs.carousel.setActiveItem(this.workspaces.length - 1),

      changeThemeMode: this.changeThemeMode,
      toPin: this.toPin,
      popupChange: this.popupChange,
      keymapLeftAndRightChange: this.keymapLeftAndRightChange,

      statusTip: this.statusTip,
    }
  },
  data() {
    return {
      isLoading: true,
      isComposition: false,

      keyword: '',
      activeWorkspaceIndex: -1,//0,
      workspaces: [],
      isLoad: false,
      isOpened: {},
      listCount: {},
      searchTotal: {},
      things: { 0: []}, // 一开始没有切换事件
      lock: false,
      keyType: '',
      carouselTrigger: 'click',

      config: user_config,
      localConfig: user_local_config,
      openWay: user_local_config.popup ? 'popup' : 'inject',
      projectConfig: project_config,
      allWorkspaces: project_config.allWorkspaces,
      commands: {},

      menuVisible: false,
      themeDialogVisible: false,
      themeDialogFinish: true,
      themeScrollPosition: 0,

      limited: false,

      history: {
        visible: false,
        date: null,
        isDel: false,
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
        }
      },
      bookmark: {
        visible: false,
        fold: false,
        unfold: false,
      },
      tab: {
        visible: false,
        windowId: 0,
        windowFilter: [],
      },
      other: {
        visible: false,
      },

      statusbarHeight: 30,
      originInputNode: null,
      showClearButton: false,
      showOperationButton: false,
      w: {
        carouselTriggerTimer: null,

        statusbarTipTimer: null,
        statusbarTipShowSpeed: 200,
      }
    }
  },
  watch: {
    searchTotal: {
      handler(newVal, oldVal) {
        console.log('watch:searchTotal', newVal, oldVal,  ! this.currentThemeConfig.statusbar_show_search_total)
        if( ! this.currentThemeConfig.statusbar_show_search_total) return;

        let title = this.lang(this.currentWorkspace.title);
        title += this.keymap['open_workspace_'+this.currentWorkspace.type]
              ?  (' ('+this.keymap['open_workspace_'+this.currentWorkspace.type]+')')
              : '';
        if(this.searchTotal[this.currentWorkspace.type] != undefined) {
          title += ' | '+this.searchTotal[this.currentWorkspace.type];
        }
        this.statusTip(title, true, 3000)
      },
      deep:true,
      // immediate:true
    },
  },
  computed: {
    activeWorkspaceRefIndex() {
      return this.isOpened[ this.activeWorkspaceIndex ]-1;
    },
    currentWorkspace() {
      return this.workspaces[ this.activeWorkspaceIndex ];
    },

    currentThemeConfig() {
      return this.currentTheme.config;
    },
    currentTheme: {
      set(theme) {
        console.log('uuuuuuuuuuu1')
        if(this.openWay == 'popup') this.localConfig.theme_popup = theme;
        else this.localConfig.theme_inject = theme;
        chrome.storage.local.set({'config': this.localConfig}, () => {
          this.statusTip(theme.name);
          // show_menu 发生变化时可能会失去焦点
          this.focus();

          // this.$nextTick(() => {
          //   this.statusTip(theme.name);
          // })
        });
      },
      get() {
        console.log('uuuuuuuuuuu2')
        if(this.openWay == 'popup') return this.localConfig.theme_popup;
        else return this.localConfig.theme_inject;
      }
    },

    isPopover() {
      console.log('isPopover')
      if(this.currentWorkspace == undefined) return false;

      if(this.currentWorkspace.type == 'tab') return this.tab.visible;
      else if(this.currentWorkspace.type == 'bookmark') return this.bookmark.visible;
      else if(this.currentWorkspace.type == 'history') return this.history.visible;
      else return this.other.visible;
    },
    isNoSearch() {
      return this.keyword.trim() == ''
          && this.isComposition == false
          && ! this.isPopover;
    },
    listHeight() {
      console.log('history.listHeight')
      if( ! this.currentThemeConfig.height_auto || this.openWay != 'popup')
        return this.currentThemeConfig.item_show_count
              *this.currentThemeConfig.item_height;

      console.log('listHeight2')
      let listCount = this.currentWorkspace == undefined
                    ? 1000
                    : this.listCount[this.currentWorkspace.type];
      if(this.isNoSearch) {
        console.log('listHeight3')
        return ( listCount <= this.currentThemeConfig.no_search_item_show_count
              ? listCount
              : this.currentThemeConfig.no_search_item_show_count)
              * this.currentThemeConfig.item_height;
      } else {
        console.log('listHeight4', listCount, this.listCount)
        return ( listCount <= this.currentThemeConfig.item_show_count
              && ! this.isPopover
                ? listCount
                : this.currentThemeConfig.item_show_count)
              * this.currentThemeConfig.item_height;
      }
    },

    keymap() {
      if( ! Array.isArray(this.commands)) return {};

      let keymap = {};
      this.commands.forEach((command) => {
        keymap[command.name] = command.shortcut;
      })

      return keymap;
    },
  },
  components: {
    Window,
    History,
    Tab,
    Bookmark,
    Note,
    Temporary,
    All,
    Theme,
    Statusbar,
  },
  methods: {
    focus() {
      console.log('focus', this.originInputNode, document.activeElement)
      // 已获得焦点则不再 focus，以免引起闪烁
      // 闪烁并非 focus 引起，而是要先 blur 再 focus 才会
      // if(this.originInputNode == document.activeElement) return;

      // 输入框聚焦
      this.$refs['input'].focus();
    },
    blur() {
      this.$refs.input.blur();
    },
    select() {
      // this.keyword = value; 和 input 双向绑定，但更新是最后执行的，此时值还未变，无法全选，所以得在主线程之后
      this.$nextTick(() => {
        // 全选
        // this.$refs['input'].$el.querySelector("input[name='search-input']").select();
        this.originInputNode.select();
      })
    },
    input(value, type, isSelect=true) {
      if(type == undefined) {
        this.keyword = value;
        isSelect && this.select();
        this.search();
        return;
      }

      let index = this.getTypeIndex(type);
      if(index == -1) {
        this.$confirm('活跃标签已被禁用，是否前往 设置中心 开启？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$open('./options.html?type=workspace');
        }).catch(() => {
          // 窗口关闭后会自动 foucs，无需这个
          // this.focus();
        });
        return;
      }

      if(value == undefined) {
        this.$refs.carousel.setActiveItem(index);
        return;
      }

      this.keyword = value;
      isSelect && this.select();
      this.$refs.carousel.setActiveItem(index);
    },
    loading(visibility) {
      this.isLoading = visibility;
    },
    statusTip(tip, lower=false, delay=undefined) {
      if(this.currentThemeConfig.statusbar_show) {
        if(this.$refs.statusbar.showTip(tip, lower)) {
          this.$refs.statusbar.finishTip(undefined, delay);
        }
      }
    },

    getTypeIndex(type) {
      for(let index in this.workspaces) {
        if(this.workspaces[index].type == type) {
          // index 是 string 类型，得转为 int
          return parseInt(index);
        }
      }
      // 找不到则返回 -1
      return -1;
      // // 找不到则返回第一个（pinned相关会需要这个避免出现问题）
      // return 0;
    },

    finish() {
      this.loading(false);

      // 只有组件在一开始创建的时候才会调用到这里
      let things = this.things[ this.activeWorkspaceRefIndex ];
      if( ! things) {
        // 没有其它事情
        return;
      }

      things.forEach((thing) => {
        if(typeof(thing) == 'string') {
          this[thing]();
        } else {
          this[thing.method](...thing.params);
        }
      });

      // if(something) {
      //   if(typeof(something) == 'string') {
      //     this[something]();
      //   } else {
      //     this[something.method](...something.params);
      //   }
      // }

      // 输入框聚焦
      // this.focus();
      // this.$refs['input'].focus();

      // 在这里开始显示图片，体验更好
      // 这个其实是不对的，有可能组件加载完了，但页面还没 onload，就会卡
      // setTimeout(() => {
      //   if( ! this.isLoad) this.isLoad = true;
      // }, 100);
    },

    search() {
      if(this.$refs.workspaces == undefined
      || this.$refs.workspaces[ this.activeWorkspaceRefIndex ] == undefined) {
        this.things[ this.activeWorkspaceRefIndex ].push('search');
        // 如果在这之前已经有其它事情待处理（如添加），则不作查询，会有人帮忙处理
        // if(this.things[ this.activeWorkspaceRefIndex ] == undefined) {
        //   this.things[ this.activeWorkspaceRefIndex ] = 'search';
        // }
        return;
      }
      this.$refs.workspaces[ this.activeWorkspaceRefIndex ].search(this.keyword);
    },
    openWindow(keyType) {
      // 中文输入法时禁用，避免冲突
      if(this.isComposition) return;

      this.$refs.workspaces[ this.activeWorkspaceRefIndex ].openWindow(undefined, keyType);
    },

    // operate(event, type) {
    //   // 其它快捷键不管，以免混乱
    //   if(event.shiftKey == true || event.altKey == true) return;

    //   if((this._device.platform == 'Mac' && event.metaKey == true)
    //   || (this._device.platform != 'Mac' && event.altKey == true)) {

    //     let index = this.getTypeIndex(type);
    //     this.$refs.carousel.setActiveItem(index);
    //     return;
    //   }

    //   this.add(type);
    // },
    operate(keyType, type) {
      if(keyType == 'meta/ctrl') {
        let index = this.getTypeIndex(type);
        this.$refs.carousel.setActiveItem(index);
      } else if(keyType == '') {
        this.add(type);
      }// 其它快捷键不管，以免混乱
    },
    add(type) {
      // 先切换到对应的工作区
      let index = this.getTypeIndex(type);
      this.$refs.carousel.setActiveItem(index); // 注意切换是异步的
      console.log('add', this.activeWorkspaceRefIndex);
      if(this.isOpened[ index ] == undefined) {
        // 若工作区还未创建，则由 finish 来处理 add
        let refIndex = Object.keys(this.isOpened).length;
        this.things[ refIndex ] = [{
          'method': 'add',
          'params': [type, this.keyword]
        }]
        return;
      }

      let refIndex =  this.isOpened[ index ]-1;
      let workspace = this.$refs.workspaces[ refIndex ];
      // if(workspace == undefined) {
      //   this.things[ refIndex ] = 'add';
      //   return;
      // }
      workspace.add((isSuccess)=>{
        // alert('f', JSON.stringify(isSuccess))
        if(isSuccess) {
          this.keyword = '';
          this.search();
        }

        // this.focus();

        // console.log('add', refIndex, this.activeWorkspaceRefIndex)
        // if(refIndex == this.activeWorkspaceRefIndex) {
        //   // 添加完后当前窗口可能还没有完全切换过去，此时刷新的仍然是切换前的窗口，所以不需要刷新
        //   // 至于切换完后的刷新问题，这个完全不用担心，有专门的事件负责
        //   this.search();
        // }
      }, this.keyword);
    },

    keydown(event) {
      console.log('keydown', event)

      let keyType = this.getKeyType(event);

      // tab 和 shift+tab 左右切换
      if(event.keyCode == 9) {
        event.stopPropagation();
        event.preventDefault();
        if(event.shiftKey == true) {
          this.selectDelay('left', keyType);
        } else {
          this.selectDelay('right', keyType);
        }
        return;
      }
      // cmd/alt + [] 左右切换
      // cmd/ctrl + [] 左右切换
      if((event.keyCode == 219 || event.keyCode == 221)
      && (keyType == 'meta/ctrl')) {
        event.stopPropagation();
        event.preventDefault();
        if(event.keyCode == 219) {
          this.selectDelay('left', keyType);
        } else {
          this.selectDelay('right', keyType);
        }
        return
      }

      // 复制
      if(event.keyCode == 67 && keyType == 'meta/ctrl') {
        // let originInputNode = this.$refs.input.$el.querySelector("input[name='search-input']");
        if(this.originInputNode.selectionStart == this.originInputNode.selectionEnd) {
          this.$refs.workspaces[ this.activeWorkspaceRefIndex ].copy();
          return;
        }
        // 肯定不符合下面的条件，就直接返回了
        return;
      }

      this.keyType = keyType;

      let index = event.keyCode-49+1;
      if(index <= 0 || index > 9) return;

      // 数字快捷键，默认选中对应的行并点击，当 alt 也同时被按下则不点击
      if((this._device.platform == 'Mac' && event.metaKey == true)
      || (this._device.platform != 'Mac' && event.altKey == true)) {
        // shift 键被太多快捷键给包了，就不跟着起哄了
        if(event.shiftKey == true) return;

        event.stopPropagation();
        event.preventDefault();

        if(event.altKey == true) {
          this.$refs.workspaces[ this.activeWorkspaceRefIndex ].choice(index);
          return;
        }

        // 数字键打开则屏蔽其它快捷键，以免发生逻辑冲突
        this.$refs.workspaces[ this.activeWorkspaceRefIndex ].openWindow(index, '');
      }
    },
    leftOrRightDown(type, event) {
      // 左右切换快捷键未开启则无法切换
      if( ! this.localConfig.keymap_left_and_right) return;

      // 只有一个工作区可用时，输入框恢复左右选择能力
      if(this.workspaces.length <= 1) return;

      let keyType = this.getKeyType(event);
      // 移动到最左或最后
      if(keyType == 'meta/ctrl') {
         // 屏蔽事件
        event.stopPropagation();
        event.preventDefault();

        if(type == 'left') this.$refs.carousel.setActiveItem(0);
        else this.$refs.carousel.setActiveItem(this.workspaces.length - 1);

        return;
      }

      // cmd、alt、shift、ctrl 按下时不屏蔽事件
      if(event.metaKey == true
      || event.altKey == true
      || event.shiftKey == true
      || event.ctrlKey == true) return;

      // 屏蔽事件
      event.stopPropagation();
      event.preventDefault();

      this.selectDelay(type, keyType);
    },
    selectDelay(type, keyType) {
      // 中文输入法时禁用，避免冲突
      if(this.isComposition) return;

      // 防止滚动过快，渲染速度跟不上看起来会停止，体验不好
      if(this.lock == true) return;
      this.lock = true;

      if(type == 'down') {
        // this.down();
        this.$refs.workspaces[ this.activeWorkspaceRefIndex ].down(keyType);
        setTimeout(() => { this.lock = false; }, 1);
      } else if(type == 'up') {
        // this.up();
        this.$refs.workspaces[ this.activeWorkspaceRefIndex ].up(keyType);
        setTimeout(() => { this.lock = false; }, 1);
      } else if(type == 'left') {
        this.$refs.carousel.prev();
        setTimeout(() => { this.lock = false; }, 150);
      } else if(type == 'right') {
        this.$refs.carousel.next();
        setTimeout(() => { this.lock = false; }, 150);
      }
    },
    close() {
      chrome.runtime.sendMessage({
        type: 'closeExtension',
      })
    },
    workspaceChange(newIndex) {
      console.log('workspaceChange', newIndex)
      this.activeWorkspaceIndex = newIndex;
      if( ! this.isOpened[this.activeWorkspaceIndex]) {
        // this.loading(true); // 会和 dropmenu 冲突
        this.$set(this.isOpened, this.activeWorkspaceIndex, Object.keys(this.isOpened).length+1);
console.log('workspaceChange2', this.activeWorkspaceRefIndex)
        console.log('99999999999999999999999999999999999', this.activeWorkspaceRefIndex)
        // add 会比这里先
        if( ! this.things[ this.activeWorkspaceRefIndex ]) {
          this.things[ this.activeWorkspaceRefIndex ] = [];
        }
      }

      if( ! this.localConfig.pinned) {
        this.localConfig.active_workspace_type = this.currentWorkspace.type;
        chrome.storage.local.set({'config': this.localConfig});
      }

      // 切换后输入框自动获取聚焦
      // 其它地方注意不要再重复foucs，没有意义
      // 有了 @mousedown.prevent ，这里也不需要了
      // this.focus();
      // this.$refs['input'].focus();

      // 自动关闭弹框
      if(this.currentWorkspace.type == 'history') {
        if(this.history.visible && this.history.date == null) this.history.visible = false;
      } else if(this.currentWorkspace.type == 'tab') {
        if(this.tab.visible && this.tab.windowId == -1) this.tab.visible = false;
      } else if(this.currentWorkspace.type == 'bookmark') {
        if(this.bookmark.visible) this.bookmark.visible = false;
      } else if(this.other.visible){
        this.other.visible = false;
      }

      this.search();

      let title = this.lang(this.currentWorkspace.title);
      title += this.keymap['open_workspace_'+this.currentWorkspace.type]
            ?  (' ('+this.keymap['open_workspace_'+this.currentWorkspace.type]+') ')
            : '';
      if(this.currentThemeConfig.statusbar_show_search_total
      && this.searchTotal[this.currentWorkspace.type] != undefined) {
        title += ' | '+this.searchTotal[this.currentWorkspace.type];
      }
      this.statusTip(title, true);
    },

    changeThemeMode() {
      this.localConfig.theme_mode = this.localConfig.theme_mode == 'light' ? 'dark' : 'light';

      let htmlNode = document.querySelector('html');
      htmlNode.style.filter = this.localConfig.theme_mode == 'dark' ? 'invert(1) hue-rotate(180deg)' : '';
      htmlNode.style.setProperty("--filter", this.localConfig.theme_mode == 'dark' ? 'invert(1) hue-rotate(180deg)' : '');

      chrome.storage.local.set({'config': this.localConfig});
    },
    toPin() {
      // this.focus();

      if(this.localConfig.active_workspace_type == this.currentWorkspace.type) {
        this.localConfig.pinned = ! this.localConfig.pinned;
      } else {
        this.localConfig.active_workspace_type = this.currentWorkspace.type;
        this.localConfig.pinned = true;
      }
      chrome.storage.local.set({'config': this.localConfig});
    },
    popupChange() {
      this.localConfig.popup = ! this.localConfig.popup;
      chrome.storage.local.set({'config': this.localConfig}, () => {
        chrome.browserAction.setPopup({ popup: this.localConfig.popup ? chrome.extension.getURL("savetabs.html") : ''})

        if( ! this.localConfig.popup) {
          chrome.runtime.sendMessage({
            type: 'inject',
          });

          window.close();
        } else {
          chrome.runtime.sendMessage({
            type: 'closeExtension',
          })
        }
      });
    },
    keymapLeftAndRightChange() {
      chrome.storage.local.set({'config': this.localConfig}, () => {

        const h = this.$createElement;
        let message = null;
        if(this.localConfig.keymap_left_and_right) {
          message = '左右快捷键切换已开启';
        } else {
          message = h('span', { style: 'font-size: 14px;'}, [
            h('p', { style: 'color: teal;margin-bottom: 10px;' }, '左右快捷键切换已被禁用，但以下快捷键仍然可用'),
            h('div', null, [
              h('span', { class: 'keymap-box' }, this._device.platform == 'Mac' ? '⇧' : 'shift'),
              h('span', null, '+'),
              h('span', { class: 'keymap-box' }, this._device.platform == 'Mac' ? '⇥' : 'tab'),
              h('span', { style: 'margin: 0 20px 0 0' }, '向左切换'),
              h('span', { class: 'keymap-box' }, this._device.platform == 'Mac' ? '⇥' : 'tab'),
              h('span', { style: 'margin: 0' }, '向右切换'),
            ]),
            h('div', null, [
              // h('span', { class: 'keymap-box' }, this._device.platform == 'Mac' ? '⌘' : 'Alt'),
              h('span', { class: 'keymap-box' }, this._device.platform == 'Mac' ? '⌘' : 'Ctrl'),
              h('span', null, '+'),
              h('span', { class: 'keymap-box' }, '['),
              h('span', { style: 'margin: 0 20px 0 0' }, '向左切换'),
              // h('span', { class: 'keymap-box' }, this._device.platform == 'Mac' ? '⌘' : 'Alt'),
              h('span', { class: 'keymap-box' }, this._device.platform == 'Mac' ? '⌘' : 'Ctrl'),
              h('span', null, '+'),
              h('span', { class: 'keymap-box' }, ']'),
              h('span', { style: 'margin: 0' }, '向右切换'),
            ]),
          ]);
        }

        this.$message({
          showClose: true,
          type: this.localConfig.keymap_left_and_right ? 'success' : 'info',
          message: message,
          offset: 69,
          duration: this.localConfig.keymap_left_and_right ? 3000 : 5000,
        });
      });
    },

    finalWork() {
      console.warn('isLoad');
      this.isLoad = true;

      // 走马灯底部指示器提示
      let carouselNode = document.querySelector('.el-carousel__indicators');
      carouselNode.children.forEach((el, index) => {
        let workspace = this.workspaces[ index ];
        let title = this.lang(workspace.title)
        title += this.keymap['open_workspace_'+workspace.type]
                ?  (' ('+this.keymap['open_workspace_'+workspace.type]+') ')
                : '';

        el.onmouseenter = () => {
          clearTimeout(this.w.carouselTriggerTimer);
          el.setAttribute('title', this.currentThemeConfig.statusbar_show ? '' : title);

          if( ! this.currentThemeConfig.statusbar_show) return;

          clearTimeout(this.w.statusbarTipTimer);
          this.w.statusbarTipTimer = setTimeout(() => {
            this.$refs.statusbar.showTip(title);
            this.w.statusbarTipShowSpeed = 0;
          }, this.w.statusbarTipShowSpeed)
        }
        el.onmouseleave = () => {
          this.w.carouselTriggerTimer = setTimeout(() => this.carouselTrigger = 'click', 1000);

          if( ! this.currentThemeConfig.statusbar_show) return;

          clearTimeout(this.w.statusbarTipTimer);
          this.$refs.statusbar.finishTip(() => {
            this.w.statusbarTipShowSpeed = 200;
            // this.carouselTrigger = 'click';
          });
        }
        el.onclick = () => {
          this.carouselTrigger = 'hover';
        }
      })

      // 输入框鼠标经过显示清除按钮
      this.originInputNode = this.$refs['input'].$el.querySelector("input[name='search-input']")
      this.originInputNode.addEventListener('mouseenter', (event) => {
        // event.stopPropagation();
        // event.preventDefault();
        this.showClearButton = true;
        this.showOperationButton = true;
      })
    }
  },
  beforeUpdate() {
    console.warn('savetabs:beforeUpdate');
  },
  updated() {
    console.warn('savetabs:updated');
  },
  mounted() {
    // todo
    window.s = this;

    Promise.all([
      new Promise((resolve) => {
        chrome.storage.sync.get({'config': {}}, items => {
          resolve(items);
        })
      }),
      new Promise((resolve) => {
        chrome.storage.local.get({'config': {}, 'info': {}}, items => {
          resolve(items);
        })
      }),
      new Promise((resolve) => {
        chrome.commands.getAll(commands => {
          resolve(commands)
        })
      })
    ]).then(([syncItems, localItems, commands]) => {
      console.log('savetabs:storage.get', syncItems, localItems)

      Object.assign(this.config, syncItems.config);
      Object.assign(this.localConfig, localItems.config);

      this.openWay = this.localConfig.popup ? 'popup' : 'inject';
      if(Object.keys(localItems.info).length > 0) {
        chrome.storage.local.remove('info');
        this.openWay = 'inject';
      }

      this.commands = commands;

      if(this.localConfig.theme_mode == 'dark') {
        let htmlNode = document.querySelector('html');
        htmlNode.style.filter = 'invert(1) hue-rotate(180deg)';
        htmlNode.style.setProperty("--filter", 'invert(1) hue-rotate(180deg)');
        // this.filter = 'invert(1) hue-rotate(180deg)';
      }

      this.workspaces = this.config.workspaces.map((workspace) => {
        return this.allWorkspaces[workspace];
      });

      // 避免用户恶意修改
      this.config.operationButtons = this.config.operationButtons.filter(type => {
        return this.config.workspaces.indexOf(type) != -1;
      })

      this.activeWorkspaceIndex = this.getTypeIndex(localItems.info.active_workspace_type || this.localConfig.active_workspace_type);
      this.$set(this.isOpened, this.activeWorkspaceIndex, Object.keys(this.isOpened).length+1);
      this.search();

      if(localItems.info.add_type != undefined) {
        let type = localItems.info.add_type;
        // let index = this.getTypeIndex(type);

        this.things[ this.activeWorkspaceRefIndex ].push({
          'method': 'add',
          'params': [type, this.keyword],
        });
      }
    })

    // 等页面加载完了再加载图片，否则插件弹出的速度会变慢
    // 这个才是最对的
    document.body.onload = this.finalWork;

    // window.oncontextmenu = function(e){
    //   // 取消默认的浏览器自带右键
    //   // 输入框也被屏蔽了
    //   e.stopPropagation();
    //   e.preventDefault();
    // }

    // 获取当前插件信息
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      let tab = tabs[0];

      // window.open 不允许添加
      if(tab.url == chrome.extension.getURL("savetabs.html")) {
        this.limited = true;
      }

      // 单点打开
      chrome.runtime.sendMessage({ type: 'closeOther',})
      // 监听特殊事件
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if(request.type == 'closeOther') {
          if(tab.url.indexOf(chrome.extension.getURL("savetabs.html")) == 0) {
            // 弹出式窗口得自己关，closeExtension 会把所有 popup 都给关了
            // 无法区分 window.open，这里关闭也什么问题（有可能是 url 直接打开的，不会是 popup）
            window.close()
          } else {
            chrome.runtime.sendMessage({ type: 'closeExtension',})
          }
        } else if(request.type == 'isActive') {
          sendResponse({isActive: true});
        } else if(request.type == 'to_open_workspace') {
          let index = this.getTypeIndex(request.workspace);
          if(this.activeWorkspaceIndex == index) {
            chrome.runtime.sendMessage({ type: 'closeExtension',})
          } else {
            this.$refs.carousel.setActiveItem(index);
          }
        } else if(request.type == 'to_add') {
          this.add(request.workspace);
        } else if(request.type == 'copySuccessfully') {
          this.$message({
            type: 'success',
            // message: '地址复制成功',
            message: `已成功复制 ${request.count} 条地址`,
            customClass: 'window-message-box',
            offset: 69,
            duration: 1000,
          });
        }
      })
//*
      // 模拟 popup 行为

      // 一旦失去焦点就会自己把自己给关了
      // 新建窗口也会触发，并且新建多个标签将触发多个事件
      chrome.tabs.onActivated.addListener((activeInfo) => {
        // 只有一种可能，那就是直接 url 打开本扩展程序，并且多选其它标签，之后再获得焦点
        // 现在不可能了，因为使用了 window.close 后，就算是多选也会被关闭
        // if(activeInfo.tabId == tab.id) return;

        // 非当前窗口的变化交给 onFocusChanged，以免重复执行导致混乱
        // tab.create 但不 active 是不会触发本事件的，highlight 也不会
        if(tab == undefined || activeInfo.windowId != tab.windowId) return;

        // 让 background.js 帮忙关闭，减轻负担
        chrome.runtime.sendMessage({ type: 'closeExtension' })
      })

      // tabs.onActivated 不包括窗口焦点变化（如果窗口内 tab focus 没变），得再加多个监听器
      chrome.windows.onFocusChanged.addListener((windowId) => {
        // 切换到其它应用程序（非浏览器内窗口切换）则不关闭
        if(windowId == -1) return;
        // 再切换过来
        // tab == undefined 不大可能发生
        if(tab == undefined || windowId == tab.windowId) return;

        // 当标签被拖出来成为一个新窗口会出现以下情况，注释掉可以让插件重启，减少不必要的麻烦
        // if(activeInfo.tabId == tab.id) return;

        // 让 background.js 帮忙关闭，减轻负担
        chrome.runtime.sendMessage({ type: 'closeExtension' })
      })//*/
    })
/*
    // 模拟 popup 行为（完美，调试都不行，哈哈）todo 最后上线再想想要不要开启
    window.addEventListener('blur', (event)=>{
      // event.stopPropagation();
      // event.preventDefault();

      chrome.runtime.sendMessage({ type: 'closeExtension' })
    });//*/

    // 屏蔽 esc ，否则 popup 弹出框在 dialog 弹出时也会连同插件一起杀掉
    window.addEventListener('keydown', (event)=>{
      if(event.keyCode == 27) {
        event.stopPropagation();
        event.preventDefault();
      }
    })

    // autofocus 只有在页面最开始接在的时候有用，所有这个还是要的
    this.focus();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#app {
  /* 加这个在 statusbar 隐藏时底部会出现空白，使得高度超出计算范围 */
  /* display: inline-block; */

  /* 非常重要，可以避免因为字体的不同而导致的各种对齐问题 */
  line-height: 1;
}

.keymap-box {
  display: inline-block;
  height: 18px;
  min-width: 18px;
  margin: 5px;
  padding: 4px;
  text-align: center;
  border-radius: 2px;
  box-shadow: inset 0 -2px 0 0 #cdcde6,inset 0 0 1px 1px #fff,0 1px 2px 1px rgba(30,35,90,0.4);
  background: linear-gradient(-225deg,#d5dbe4,#f8f8f8);
}
/* .keymap-box {
  align-items: center;
  background: linear-gradient(-225deg,#d5dbe4,#f8f8f8);
  border-radius: 2px;
  box-shadow: inset 0 -2px 0 0 #cdcde6,inset 0 0 1px 1px #fff,0 1px 2px 1px rgba(30,35,90,0.4);
  display: flex;
  height: 18px;
  justify-content: center;
  margin-right: .4em;
  padding-bottom: 2px;
  width: 20px;
} */
</style>

<!-- 全局样式 -->
<style>
:root {
  --animate-duration: 1.5s;
  /* --animate-delay: 0s; 没有用 */
}

html, body {
  /* display: inline-block; */
  margin: 0;
  padding: 0;
}

img {
  filter: var(--filter);
}

.toolbar {
  margin: 10px;

  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.toolbar .el-input__prefix {
  transition: none;
}
.toolbar .search-input {
  height: 100%;
  flex:1;
}
.toolbar .search-input .el-input-group__prepend {
  width: var(--toolbar-input-prepend-border-width);
  border-width: var(--toolbar-input-prepend-border-width);
  background-color: var(--toolbar-background-color);
  border-radius: 0;
  padding: 0;
  border-color: var(--toolbar-border-color)
}
.toolbar .search-input input {
  height: 100%;
  border-radius: 0;
  border-color: var(--toolbar-border-color);
  font-size: var(--toolbar-input-font-size);
  color: var(--toolbar-input-font-color);
  background-color: var(--toolbar-background-color);

  padding-right: 10px;
  padding-left: 10px;
}
.toolbar .search-input.clearable input {
  padding-right: 30px;
}
.toolbar .search-input.smaller input {
  padding-left: 30px;
}
.toolbar .search-input input:focus {
  border-color: var(--toolbar-input-focus-border-color);
}
.toolbar .search-input input::placeholder {
  color: var(--toolbar-icon-color);
}
.toolbar .search-input input::selection{
  background: var(--toolbar-input-selected-background-color);
  color: var(--toolbar-input-selected-font-color);
}
.toolbar .el-input__suffix .el-icon-circle-close {
  padding-right: 4px;
  line-height: var(--toolbar_height);
  color: var(--toolbar-icon-color);
  cursor: pointer;
}
.toolbar .el-input__suffix .el-icon-circle-close:hover {
  color: var(--toolbar-icon-focus-color);
}

.toolbar .el-button-group .el-button {
  height: 100%;
  width: 100%;
  padding: 0;
  border-color: var(--toolbar-border-color);
  background-color: var(--toolbar-background-color);
  color: var(--toolbar-button-font-color);
}
.toolbar .el-button-group .el-button:hover,
.toolbar .el-button-group .el-button:focus {
  color: var(--toolbar-button-hover-font-color);
  border-color: var(--toolbar-button-hover-border-color);
  background-color: var(--toolbar-button-hover-background-color);
}
.toolbar .el-button-group .el-button:active {
  color: var(--toolbar-button-active-font-color);
  border-color: var(--toolbar-button-active-border-color);
  background-color: var(--toolbar-button-active-background-color);
}

.toolbar .el-icon-arrow-down.is-reverse {
  transform: rotate(-180deg);
}
.toolbar .el-dropdown {
  /* width: 140px; */
  height: 100%;
}
.toolbar .el-dropdown-link {
  display: flex;

  height: 100%;
  padding: 0 10px;
  cursor: pointer;

  justify-content: space-between;
  align-items: center;
}
.toolbar-menu {
  overflow:auto;
  width: 140px;
  margin: 0;
}
.toolbar-menu .el-dropdown-menu__item.selected {
  color: #409eff;
  font-weight: 700;
}
.el-dropdown-menu__item:not(.is-disabled, .selected, .other):hover {
    /* background-color: #ecf5ff; */
    color: #606266;
}
.toolbar-menu .el-dropdown-menu__item.other:hover {
    background-color: #FFF;
    color: #606266;
}
.el-dropdown-menu.el-popper.toolbar-menu {
  margin-top: 1px;
  margin-left: -1px;
  border-top: 0;
  /* border-color: red; */
  /* border-color: #dcdfe6; */
  border-radius: 0 0 4px 4px;
  box-shadow: 0 4px 10px 0 rgb(0 0 0 / 10%);
}
.el-dropdown-menu.el-popper.toolbar-menu .popper__arrow {
  display: none;
}

.toolbar .el-button-group .el-button:first-child {
  border-left-width: 0;
  border-radius: 0;
}
.toolbar .el-button-group .el-button:first-child:active {
  border-left-width: 1px;
}
.toolbar .el-button-group .el-button:last-child {
  border-radius: 0;
}

.tab-popver {
  padding: 0 12px;
}

.el-carousel__indicators {
  line-height: 0;
}
.el-carousel__indicator--horizontal {
   /* 注意，这里还和列表选择事件有关，列表隐藏部分会有几px的误差，不过套在了跑马灯上后倒是不会了，有问题就改成 6px */
  padding-top: 8px !important;
  padding-bottom: 0px !important;
}
.el-carousel__indicators .el-carousel__button {
  background-color: var(--carousel-indicators-color);
}

.product-box {
  margin-bottom: 5px !important;
}

/* 组件共享样式 */
.no-padding {
  padding: 0;
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

.el-message-box__wrapper {
  overflow: auto;
}
.window-message-box {
  min-width: 80% !important;
  max-width: 99% !important;
}
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
