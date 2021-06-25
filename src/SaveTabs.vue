<template>
<div
  id="app"
  v-loading.fullscreen="isLoading"
  :style="{
    width: (config.width
          + config.border_width*2
          + config.padding_width*2)+'px',
  }">

  <div
    style="border-style:solid;overflow:hidden;"
    :style="{
      height: (config.item_height*config.item_show_count
          + config.toolbar_height
          + 20
          + 10)+'px',
      backgroundColor: config.background_color,
      borderWidth: config.border_width+'px',
      borderColor: config.border_color,
      padding: config.padding_width+'px',
    }">

    <div
      class="toolbar"
      :style="{  height: config.toolbar_height+'px',

                '--toolbar_height': config.toolbar_height+'px',
                '--toolbar-background-color': config.toolbar_background_color,
                '--toolbar-border-color': config.toolbar_border_color,

                '--toolbar-icon-color': config.toolbar_icon_color,
                '--toolbar-icon-focus-color': config.toolbar_icon_focus_color,

                '--toolbar-input-font-size': config.toolbar_input_font_size+'px',
                '--toolbar-input-font-color': config.toolbar_input_font_color,
                '--toolbar-input-focus-color': config.toolbar_input_focus_color,

                '--toolbar-button-font-color': config.toolbar_button_font_color,
                '--toolbar-button-hover-font-color': config.toolbar_button_hover_font_color,
                '--toolbar-button-active-font-color': config.toolbar_button_active_font_color,
                '--toolbar-button-hover-border-color': config.toolbar_button_hover_border_color,
                '--toolbar-button-active-border-color': config.toolbar_button_active_border_color,
                '--toolbar-button-hover-background-color': config.toolbar_button_hover_background_color,
                '--toolbar-button-active-background-color': config.toolbar_button_active_background_color,

                }">
      <!-- autofocus 会报错 -->
      <el-input
        class="search-input"
        name="search-input"
        :placeholder="currentWorkspace == undefined || ! config.toolbar_show_input_tip
                    ? ''
                    : lang(currentWorkspace.placeholder)"
        v-model="keyword"
        :clearable="keyword == '' ? false : true"
        @keydown.down.native.prevent.stop="selectDelay('down', getKeyType($event))"
        @keydown.up.native.prevent.stop="selectDelay('up', getKeyType($event))"
        @keydown.left.native="leftOrRightDown('left', $event)"
        @keydown.right.native="leftOrRightDown('right', $event)"
        @keydown.enter.native="openWindow(getKeyType($event))"
        @keydown.esc.native="close"
        @keydown.native="keydown"
        @keyup.native="keyType=getKeyType($event)"
        @input="search"
        @compositionstart.native="isComposition=true"
        @compositionupdate.native="$refs.workspaces[ activeWorkspaceRefIndex ].search(keyword+$event.data)"
        @compositionend.native="isComposition=false"
        ref="input">
        <template slot="prepend">
          <el-dropdown
            v-if="config.show_menu"
            trigger="hover"
            placement="bottom-start"
            style="height: 100%;"
            :style="{ width: config.show_workspace_name ? '140px' : 'auto' }"
            :hide-on-click="false"
            :show-timeout="0"
            @visible-change="menuVisible = arguments[0]"
            @command="arguments[0] != -1
                    && (activeWorkspaceIndex=arguments[0],
                        $refs.carousel.setActiveItem(activeWorkspaceIndex)),
                        focus()"><!-- 可能重复点击，所以还是要 focus 的 -->
            <span class="el-dropdown-link" @click="focus"> <!-- 工作区标题 -->
              <svg-icon
                :name="currentWorkspace == undefined ? 'frown-open-regular' : currentWorkspace.svg"
                style="width: 20px; height: 20px; margin-right: 3px;"
                :style="{ color: localConfig.pinned && currentWorkspace != undefined && localConfig.active_workspace_type == currentWorkspace.type
                      ? config.toolbar_menu_icon_fixed_color : config.toolbar_menu_icon_color}"></svg-icon>
              <span
                v-if="config.show_workspace_name"
                :style="{ color: config.toolbar_menu_font_color }">{{ currentWorkspace == undefined ? '' : lang(currentWorkspace.title) }}</span>
              <i style="transition: transform .3s;"
                class="el-icon-arrow-down el-icon--right"
                :class="{ 'is-reverse': menuVisible}"
                :style="{ color: config.toolbar_icon_color }"></i>
            </span>
            <el-dropdown-menu
              slot="dropdown"
              class="toolbar-menu"
              :style="{ maxHeight: (config.item_height*config.item_show_count
                                  + config.border_width
                                  + config.padding_width
                                  + statusbarHeight
                                  - 10)+'px' }">
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
        <template slot="prefix">
          <template v-if="currentWorkspace != undefined && currentWorkspace.type == 'history'">
            <el-popover
              v-model="history.visible"
              placement="top-start"
              trigger="manual"
              transition=""
              @after-enter="history.date == null ? $refs.date.focus() : focus()"
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
                @click="keyword.trim() != '' ? '' : history.isDel = true"></i>
              <i
                class="el-icon-close"
                style="margin-left: 10px; cursor: pointer;"
                @click="history.visible = false;"></i>
              <i
                class="el-icon-date"
                slot="reference"
                style="padding-left: 4px;cursor: pointer;"
                :style="{ 'line-height': config.toolbar_height+'px',
                          color: history.visible ? config.toolbar_icon_focus_color : config.toolbar_icon_color }"
                @click="history.visible = ! history.visible"></i>
            </el-popover>
          </template>
          <template v-else-if="currentWorkspace != undefined && currentWorkspace.type == 'bookmark'">
            <el-popover
              v-model="bookmark.visible"
              placement="top-start"
              trigger="manual"
              transition=""
              @after-leave="focus"
              @after-enter="focus">
              <el-button
                size="mini"
                icon="el-icon-s-fold"
                :disabled="keyword.trim() != ''"
                @click="bookmark.fold = true;focus();">全部收起</el-button>
              <el-button
                size="mini"
                icon="el-icon-s-unfold"
                :disabled="keyword.trim() != ''"
                @click="bookmark.unfold = true;focus();">全部展开</el-button>
              <i
                class="el-icon-close hover"
                style="float: right;margin-top: 8px;margin-left: 10px;cursor: pointer;"
                @click="bookmark.visible = false;"></i>
              <i
                class="el-icon-setting hover"
                style="float: right;margin-top: 8px;margin-left: 10px;cursor: pointer;"
                @click="$open('chrome://bookmarks', getKeyType($event));focus();"></i>
              <i
                class="el-icon-s-operation"
                slot="reference"
                style="padding-left: 4px;cursor: pointer;"
                :style="{ 'line-height': config.toolbar_height+'px',
                          color: bookmark.visible ? config.toolbar_icon_focus_color : config.toolbar_icon_color }"
                @click="bookmark.visible = ! bookmark.visible"></i>
            </el-popover>
          </template>
          <template v-else-if="currentWorkspace != undefined && currentWorkspace.type == 'tab'">
            <el-popover
              v-model="tab.visible"
              placement="top-start"
              trigger="manual"
              transition=""
              popper-class="tab-popver"
              @after-leave="focus"
              @after-enter="focus">
              <span
                style="display: inline-block; max-width: 200px;margin-bottom: -5px;padding: 12px 0;overflow: scroll; white-space:nowrap;"
                @click="focus">
                <!-- <el-radio
                  v-model="tab.windowId"
                  style="margin-right: 10px;"
                  v-for="([windowId, name]) in tab.windowFilter"
                  :label="windowId"
                  :key="windowId">{{ name }}</el-radio> -->
                <el-radio-group
                  v-model="tab.windowId"
                  size="mini">
                  <el-radio-button
                    v-for="([windowId, name]) in tab.windowFilter"
                    :label="windowId"
                    :key="windowId">{{ name }}</el-radio-button>
                </el-radio-group>
              </span>
              <i
                class="el-icon-close hover"
                style="float: right;margin-left: 10px;margin-top: 20px;cursor: pointer;"
                @click="tab.visible = false;"></i>
              <i
                class="el-icon-search"
                slot="reference"
                style="padding-left: 4px;cursor: pointer;"
                :style="{ 'line-height': config.toolbar_height+'px',
                          color: tab.visible ? config.toolbar_icon_focus_color : config.toolbar_icon_color }"
                @click="tab.visible = ! tab.visible"></i>
            </el-popover>
          </template>
          <template v-else>
            <el-popover
              v-model="other.visible"
              placement="top-start"
              trigger="manual"
              transition=""
              @after-leave="focus"
              @after-enter="focus">
              <span>暂无其它功能</span>
              <i
                class="el-icon-close hover"
                style="float: right;margin-top: 3px;cursor: pointer;"
                @click="other.visible = false;"></i>
              <i
                class="el-icon-search"
                slot="reference"
                style="padding-left: 4px;cursor: pointer;"
                :style="{ 'line-height': config.toolbar_height+'px',
                          color: other.visible ? config.toolbar_icon_focus_color : config.toolbar_icon_color }"
                @click="other.visible = ! other.visible"></i>
            </el-popover>
          </template>
        </template>
      </el-input>
      <el-button-group
        style="display: flex"
        :style="{ width: ((config.toolbar_height/(40/(40+15)))*config.operateOrder.length)+'px' }">
        <el-button
          v-for="(type, i) in config.operateOrder"
          :key="i"
          type="default"
          :icon="allWorkspaces[type].icon_simple"
          :title="limited
                ? '功能受限'
                : keymap['add_'+type] ? '快捷键：'+keymap['add_'+type] : ''"
          @click="operate(getKeyType($event), type)"></el-button><!-- todo  :disabled="limited" -->
      </el-button-group>
    </div>

    <el-carousel
      v-if="activeWorkspaceIndex != -1"
      indicator-position="outside"
      arrow="never"
      :autoplay="false"
      :loop="true"
      :initial-index="activeWorkspaceIndex"
      :height="(config.item_height*config.item_show_count)+'px'"
      :trigger="carouselTrigger"
      @change="workspaceChange"
      ref="carousel">
      <el-carousel-item
        v-for="(workspace, index) in workspaces"
        :key="index">
        <component
          v-if="isOpened[index]"
          :is="workspace.type"
          :config="config"
          :localConfig="localConfig"
          :project_config="project_config"
          :isLoad="isLoad"
          :keyType="keyType"
          :activeWorkspace="currentWorkspace == undefined ? {} : currentWorkspace"

          :history="history"
          :bookmark="bookmark"
          :tab="tab"

          @finish="finish"
          ref="workspaces"></component>
      </el-carousel-item>
    </el-carousel>

  </div>

  <Statusbar
    v-if="config.statusbar_show"
    :config="config"
    :localConfig="localConfig"
    :isLoad="isLoad"
    :currentWorkspace="currentWorkspace == undefined ? {} : currentWorkspace"
    :statusbarHeight="statusbarHeight"
    @click.native="focus"
    ref="statusbar"></Statusbar>

  <el-dialog
    :visible.sync="themeDialogVisible"
    :modal="false"
    :append-to-body="true"
    :close-on-click-modal="false"
    :destroy-on-close="false"
    width="200px"
    class="theme"
    @open="themeDialogVisible2=true"
    @closed="themeDialogVisible2=false"
    @click.native="focus">
    <div slot="title" style="font-size: 16px;">
      <i
        class="el-icon-s-tools"
        style="position: relative;top: 1px;margin-right: 5px;cursor: pointer;"
        @click="$open('./options.html?type=themes', getKeyType($event))"></i>选择主题
    </div>
    <SelectX
      v-if="themeDialogVisible2"
      :list="themes"
      :itemHeight="65"
      :itemShowCount="3"
      style="width:200px"
      v-model="currentThemeIndex">
      <template #default="{ index, item, isSelected }">
        <div
          class="theme-item"
          :class="{ selected: isSelected }"
          @click="changeTheme(item, index)">
          <span
            style="display:inline-block;border-width: 5px;border-style: solid; padding: 6px;"
            :style="{ borderColor: item.config.border_color,
                      backgroundColor: item.config.background_color }"><span
              style="display:inline-block;padding:0;margin:0;width: 8px;height:34px;"
              :style="{
                backgroundColor: item.config.list_background_color,
                color: item.config.list_background_color,
              }">.</span><span
              style="display:inline-block;padding:0;margin:0;width: 8px;height:34px;"
              :style="{
                backgroundColor: item.config.list_font_color,
                color: item.config.list_font_color,
              }">.</span><span
              style="display:inline-block;padding:0;margin:0;width: 8px;height:34px;"
              :style="{
                backgroundColor: item.config.list_focus_background_color,
                color: item.config.list_focus_background_color,
              }">.</span><span
              style="display:inline-block;padding:0;margin:0;width: 8px;height:34px;"
              :style="{
                backgroundColor: item.config.list_focus_font_color,
                color: item.config.list_focus_font_color,
              }">.</span></span>
          <span
            class="title"
            :style="{ color: item.id == config.theme_id ? config.list_focus_background_color : 'black' }">{{ item.name }}</span>
          <i
            v-show="isSelected"
            class="el-icon-check"
            style="font-weight: 700"
            :style="{ color:  item.id == config.theme_id ? config.list_focus_background_color : 'black' }"></i>
        </div>
      </template>
    </SelectX>
  </el-dialog>

</div>
</template>

<script>
import SelectX from './components/common/SelectX.vue'
import Window from './components/savetabs/Window.vue'
import History from './components/savetabs/History.vue'
import Tab from './components/savetabs/Tab.vue'
import Bookmark from './components/savetabs/Bookmark.vue'
import Note from './components/savetabs/Note.vue'
import Temporary from './components/savetabs/Temporary.vue'
import All from './components/savetabs/All.vue'
import Statusbar from './components/savetabs/Statusbar.vue'

import userConfig from './config/user_config.json'
import userLocalConfig from './config/user_local_config.json'
import projectConfig from './config/project_config.json'
import userTheme from './config/user_theme.json'

export default {
  name: 'app',
  provide(){
    return {
      focus: this.focus,
      input: this.input,
      loading: this.loading,

      prev: () => this.$refs.carousel.prev(),
      next: () => this.$refs.carousel.next(),

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
      things: { 0: []}, // 一开始没有切换事件
      lock: false,
      keyType: '',
      carouselTrigger: 'click',

      config: userConfig,
      localConfig: userLocalConfig,
      project_config: projectConfig,
      themes: userTheme,
      allWorkspaces: projectConfig.allWorkspaces,
      commands: {},

      menuVisible: false,
      themeDialogVisible: false,
      themeDialogVisible2: false,
      themeScrollPosition: 0,
      // currentThemeIndex: -1,

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
      w: {
        statusbarTipTimer: null,
        statusbarTipShowSpeed: 200,
      }
    }
  },
  computed: {
    activeWorkspaceRefIndex() {
      return this.isOpened[ this.activeWorkspaceIndex ]-1;
    },
    currentWorkspace() {
      return this.workspaces[ this.activeWorkspaceIndex ];
    },
    currentTheme() {
      return this.themes[ this.currentThemeIndex ];
    },
    currentThemeIndex() {
      let index = -1;
      for(let theme of this.themes) {
        index++;
        if(theme.id == this.config.theme_id) {
          return index;
        }
      }
      return -1;
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
    SelectX,
    Window,
    History,
    Tab,
    Bookmark,
    Note,
    Temporary,
    All,
    Statusbar,
  },
  methods: {
    focus() {
      // 输入框聚焦
      this.$refs['input'].focus();
    },
    select() {
      // this.keyword = value; 和 input 双向绑定，但更新是最后执行的，此时值还未变，无法全选，所以得在主线程之后
      this.$nextTick(() => {
        // 全选
        this.$refs['input'].$el.querySelector("input[name='search-input']").select();
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
          this.focus();
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
    statusTip(tip, lower=false) {
      if(this.config.statusbar_show) {
        if(this.$refs.statusbar.showTip(tip, lower)) {
          this.$refs.statusbar.finishTip();
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
console.log('mmmmmmmmmmffff', JSON.stringify(things))
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
console.log('search', this.activeWorkspaceRefIndex )
console.log('mmmmmmmmmmmm', JSON.stringify(this.things))
        this.things[ this.activeWorkspaceRefIndex ].push('search');
console.log('mmmmmmmmmmmm2', JSON.stringify(this.things))
        // 如果在这之前已经有其它事情待处理（如添加），则不作查询，会有人帮忙处理
        // if(this.things[ this.activeWorkspaceRefIndex ] == undefined) {
        //   this.things[ this.activeWorkspaceRefIndex ] = 'search';
        // }
        return;
      }
console.log('mmmmmmmmmmmm3', JSON.stringify(this.things))
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

        this.focus();

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
      this.focus();
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
    changeTheme(theme, index) {
      if(this.currentThemeIndex == index) return;

      this.config.theme_id = theme.id;
      Object.assign(this.config, theme.config);

      chrome.storage.sync.set({'config': this.config});
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

      if(Object.keys(localItems.info).length > 0) {
        chrome.storage.local.remove('info');
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
      this.config.operateOrder = this.config.operateOrder.filter(type => {
        return this.config.workspaces.indexOf(type) != -1;
      })

      this.activeWorkspaceIndex = this.getTypeIndex(localItems.info.active_workspace_type || this.localConfig.active_workspace_type);
      this.$set(this.isOpened, this.activeWorkspaceIndex, Object.keys(this.isOpened).length+1);
      this.search();

      // this.things[ this.activeWorkspaceRefIndex ].push({
      //   'method': 'add',
      //   'params': ['note', this.keyword],
      // });

      if(localItems.info.add_type != undefined) {
        let type = localItems.info.add_type;
        // let index = this.getTypeIndex(type);

        this.things[ this.activeWorkspaceRefIndex ].push({
          'method': 'add',
          'params': [type, this.keyword],
        });
      }
    })

    // 等页面加载完了再加载图片，否则插件弹出的速度回变慢
    // 这个才是最对的
    document.body.onload=() => {
      console.warn('isLoad');
      this.isLoad = true;

      if( ! this.config.statusbar_show) {
        document.querySelector('.el-carousel__indicators').children.forEach((el, index) => {
          let workspace = this.workspaces[ index ];
          let title = this.lang(workspace.title)
          title += this.keymap['open_workspace_'+workspace.type]
                  ?  (' ('+this.keymap['open_workspace_'+workspace.type]+') ')
                  : '';
          el.setAttribute('title', title)
        })
        return;
      }

      // 走马灯底部指示器提示
      document.querySelector('.el-carousel__indicators').children.forEach((el, index) => {
        el.onmouseenter = () => {
          clearTimeout(this.w.statusbarTipTimer);
          this.w.statusbarTipTimer = setTimeout(() => {
            let workspace = this.workspaces[ index ];
            let title = this.lang(workspace.title)
            title += this.keymap['open_workspace_'+workspace.type]
                    ?  (' ('+this.keymap['open_workspace_'+workspace.type]+') ')
                    : '';
            this.$refs.statusbar.showTip(title);
            this.w.statusbarTipShowSpeed = 0;
          }, this.w.statusbarTipShowSpeed)
        }
        el.onmouseleave = () => {
          clearTimeout(this.w.statusbarTipTimer);
          this.$refs.statusbar.finishTip(() => {
            this.w.statusbarTipShowSpeed = 200;
            this.carouselTrigger = 'click';
          });
        }
        el.onclick = () => {
          this.carouselTrigger = 'hover';
        }
      })
    };

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
          if(tab.url == chrome.extension.getURL("savetabs.html")) {
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

    this.focus();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#app {
  display: inline-block;
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

body {
  margin: 0;
}

img {
  filter: var(--filter);
}

.theme .el-dialog__header {
  padding: 10px 53px 0 11px !important;
  text-align: left;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.theme .el-dialog__header .el-dialog__headerbtn {
  top: 12px !important;
}
.theme .el-dialog__body{
  padding: 8px 0 0 0 !important;
}

.theme-item {
  margin: 4px 4px 6px 4px;
  padding: 0px 9px 0px 0px;

  border-radius: 2px;

  background-color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;

   /* 禁止选择 */
  -moz-user-select:none; /*火狐*/
  -webkit-user-select:none; /*webkit浏览器*/
  -ms-user-select:none; /*IE10*/
  -khtml-user-select:none; /*早期浏览器*/
  user-select:none;
}
.theme-item.selected {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  font-weight: 700;
}
.theme-item .title {
  flex: 1;
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.theme-item:hover:not(.selected) {
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
}
.toolbar .search-input input:focus {
  border-color: var(--toolbar-input-focus-color);
}
.toolbar .search-input input::placeholder {
  color: var(--toolbar-icon-color);
}
/* .toolbar .el-input__suffix .el-icon-circle-close {
  line-height: var(--toolbar_height);
  color: var(--toolbar-icon-color);
} */
/* .toolbar .el-input__suffix .el-icon-circle-close:hover, */
.toolbar .el-input__prefix .el-icon-search:hover,
.toolbar .el-input__prefix .el-icon-date:hover,
.toolbar .el-input__prefix .el-icon-s-operation:hover {
  color: var(--toolbar-icon-focus-color) !important;
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
/* .toolbar .el-dropdown {
  width: 140px;
} */
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

.product-box {
  margin-bottom: 5px !important;
}

/* 组件共享样式 */
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
