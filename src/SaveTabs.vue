<template>
  <div
    id="app"
    style="border-style:solid;"
    :style="{
      width: config.width+'px',
      backgroundColor: config.background_color,
      borderWidth: config.border_width+'px',
      borderColor: config.border_color,
    }">

    <el-dialog
      :visible.sync="themeDialogVisible"
      :modal="false"
      :append-to-body="true"
      :close-on-click-modal="false"
      :destroy-on-close="false"
      width="200px"
      class="theme"
      @click.native="focus">
      <div slot="title" style="font-size: 16px;">
        <i
          class="el-icon-s-tools"
          style="position: relative;top: 1px;margin-right: 5px;cursor: pointer;"
          @click="$open('./options.html?type=themes')"></i>选择主题
      </div>
      <SelectX
        v-if="themeDialogVisible"
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

    <div class="toolbar">
      <el-input
        class="search-input"
        :placeholder="currentWorkspace == undefined
                    ? ''
                    : lang(currentWorkspace.placeholder)"
        v-model="keyword"
        :clearable="this.keyword == '' ? false : true"
        @keydown.down.native.prevent="selectDelay('down', $event)"
        @keydown.up.native.prevent="selectDelay('up', $event)"
        @keydown.left.native="selectDelay('left', $event)"
        @keydown.right.native="selectDelay('right', $event)"
        @keydown.enter.native="openWindow"
        @keydown.native="keydown"
        @input="search"
        ref="input">
        <template slot="prepend">
          <el-dropdown
            :hide-on-click="false"
            trigger="hover"
            placement="bottom"
            @visible-change="menuVisible = arguments[0]"
            @command="arguments[0] != -1
                    && (activeWorkspaceIndex=arguments[0],
                        $refs.carousel.setActiveItem(activeWorkspaceIndex),
                        focus())">
            <span class="el-dropdown-link" @click="focus">
              <svg-icon
                :name="currentWorkspace == undefined ? 'frown-open-regular' : currentWorkspace.svg"
                :style="{ color: config.pinned && currentWorkspace != undefined && config.active_workspace_type == currentWorkspace.type
                      ? 'gray' : '#c0c4cc'}"
                style="width: 20px; height: 20px; position: relative; top: 2px;margin-right: 3px;"></svg-icon>
              <span style="position: relative; top: -3px;">
                <span
                  v-if="config.show_workspace_name"
                  style="display:inline-block;width: 70px;text-align:center; color: #909399;">{{ currentWorkspace == undefined ? '' : lang(currentWorkspace.title) }}</span>
                <i style="transition: transform .3s;"
                  class="el-icon-arrow-down el-icon--right"
                  :class="{ 'is-reverse': menuVisible}"></i>
              </span>
            </span>
            <el-dropdown-menu slot="dropdown" class="toolbar-menu">
              <el-dropdown-item
                v-for="(workspace, index) in workspaces"
                :label="lang(workspace.title)"
                :command="index"
                :class="{ selected: index == activeWorkspaceIndex }"
                :key="index">
                <svg-icon
                  :name="workspace.svg"
                  :style="{
                    color: config.pinned
                  && config.active_workspace_type == workspace.type
                  ? 'gray' : '#c0c4cc'}"
                  style="width:16px;margin-right: 10px;vertical-align: -0.50em"
                  @click="toPin"
                ></svg-icon><span>{{ lang(workspace.title) }}</span>
              </el-dropdown-item>
              <el-dropdown-item
                divided
                icon="el-icon-check"
                :command="-1"
                class="other"
                style="display:inline-block; width: 92px; overflow: hidden; text-overflow:ellipsis; white-space:nowrap;"
                @click.native="themeDialogVisible=true;focus();">{{ currentTheme.name }}</el-dropdown-item>
              <el-dropdown-item
                divided
                :value="activeWorkspaceIndex"
                :command="-1"
                style="cursor: default"
                class="other">
                <span @click="$open('./options.html?type=workspace')">
                  <svg-icon
                    name="cog-solid"
                    style="cursor:pointer;height: 20px;color: #c0c4cc; position: relative; top: 6px;"
                  ></svg-icon>
                </span>
                <span
                  :style="{ color: config.theme_mode == 'light' ? '#c0c4cc' : 'gray'}"
                  style="margin: 0 10px;"
                  @click="changeThemeMode">
                  <svg-icon
                    :name="config.theme_mode == 'light' ? 'sun-solid' : 'moon-solid'"
                    style="cursor:pointer;height: 20px; position: relative; top: 6px;"></svg-icon>
                </span>
                <span
                  :style="{
                    color: config.pinned
                  && currentWorkspace != undefined
                  && config.active_workspace_type == currentWorkspace.type
                  ? 'gray' : '#c0c4cc',}"
                  @click="toPin">
                  <svg-icon
                    name="thumbtack-solid"
                    :style="{transform: config.pinned
                                      && currentWorkspace != undefined
                                      && config.active_workspace_type == currentWorkspace.type
                                      ? 'rotate(0)' : 'rotate(90deg)'}"
                    style="cursor:pointer;height: 20px; position: relative; top: 6px;"></svg-icon>
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template slot="prefix">
          <template v-if="currentWorkspace == undefined
                        ||currentWorkspace.type == 'window'">
            <i
              class="el-icon-search"
              style="line-height: 40px;padding-left: 4px;"></i>
          </template>
          <template v-else>
            <el-popover
              placement="top-start"
              title="标题"
              width="200"
              trigger="hover"
              content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。">
              <i
                class="el-icon-date"
                slot="reference"
                style="line-height: 40px;padding-left: 4px;"></i>
            </el-popover>
          </template>
        </template>
      </el-input>
      <el-button-group
        style="">
        <el-button
          v-for="(type, i) in operateOrder"
          :key="i"
          type="default"
          :icon="allWorkspaces[type].icon_simple"
          @click="add(type)"></el-button>
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
      trigger="click"
      @change="workspaceChange"
      ref="carousel">
      <el-carousel-item
        v-for="(workspace, index) in workspaces"
        :key="index">
        <component
          v-if="isOpened[index]"
          :is="workspace.type"
          :config="config"
          :isLoad="isLoad"
          :platform="platform"
          @finish="finish"
          ref="workspaces"></component>
      </el-carousel-item>
    </el-carousel>

  </div>
</template>

<script>
import List from './components/List.vue'
import SelectX from './components/SelectX.vue'
import Window from './components/Window.vue'
import History from './components/History.vue'
import Tab from './components/Tab.vue'
import Bookmark from './components/Bookmark.vue'
import Note from './components/Note.vue'
import Temporary from './components/Temporary.vue'
import userConfig from './config/user_config.json'
import projectConfig from './config/project_config.json'
import userTheme from './config/user_theme.json'

export default {
  name: 'app',
  provide(){
    return {
      focus: this.focus,
      prev: this.prev,
      next: this.next,
    }
  },
  data() {
    return {
      keyword: '',
      activeWorkspaceIndex: -1,//0,
      workspaces: [],
      isLoad: false,
      platform: '',
      isOpened: {},
      things: {},
      operateOrder: [ 'window', 'note', 'temporary' ],
      lock: false,

      config: userConfig,
      themes: userTheme,
      allWorkspaces: projectConfig.allWorkspaces,

      menuVisible: false,
      themeDialogVisible: false,
      themeScrollPosition: 0,
      // currentThemeIndex: -1,
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
    }
  },
  components: {
    List,
    SelectX,
    Window,
    History,
    Tab,
    Bookmark,
    Note,
    Temporary
  },
  methods: {
    focus() {
      // 输入框聚焦
      this.$refs['input'].focus();
    },
    prev() {
      // if(this.lock == true) return;
      // this.lock = true;

      // this.$refs.carousel.prev();

      // setTimeout(() => { this.lock = false; }, 500);
      this.$refs.carousel.prev();
    },
    next() {
      // if(this.lock == true) return;
      // this.lock = true;

      // this.$refs.carousel.next();

      // setTimeout(() => { this.lock = false; }, 500);
      this.$refs.carousel.next();
    },

    getTypeIndex(type) {
      for(let index in this.workspaces) {
        if(this.workspaces[index].type == type) {
          return parseInt(index);
        }
      }
      // 找不到则返回第一个（pinned相关会需要这个避免出现问题）
      return 0;
    },

    finish() {
      // 只有组件在一开始创建的时候才会调用到这里
      let something = this.things[ this.activeWorkspaceRefIndex ];
      if(something) {
        if(typeof(something) == 'string') {
          this[something]();
        } else {
          this[something.method](...something.params);
        }
      }

      // 输入框聚焦
      this.focus();
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
        // 如果在这之前已经有其它事情待处理（如添加），则不作查询，会有人帮忙处理
        if(this.things[ this.activeWorkspaceRefIndex ] == undefined) {
          this.things[ this.activeWorkspaceRefIndex ] = 'search';
        }
        return;
      }

      this.$refs.workspaces[ this.activeWorkspaceRefIndex ].search(this.keyword);
    },
    openWindow() {
      this.$refs.workspaces[ this.activeWorkspaceRefIndex ].openWindow();
    },
    // openWindow(index) {
    //   if(this.$refs.workspaces == undefined
    //   || this.$refs.workspaces[ this.activeWorkspaceRefIndex ] == undefined) {
    //     this.things[ this.activeWorkspaceRefIndex ] = 'openWindow';
    //     return;
    //   }
    //   this.$refs.workspaces[ this.activeWorkspaceRefIndex ].openWindow(index);
    // },
    down() {
      if(this.$refs.workspaces == undefined
      || this.$refs.workspaces[ this.activeWorkspaceRefIndex ] == undefined) {
        this.things[ this.activeWorkspaceRefIndex ] = 'down';
        return;
      }
      this.$refs.workspaces[ this.activeWorkspaceRefIndex ].down();
    },
    up() {
      if(this.$refs.workspaces == undefined
      || this.$refs.workspaces[ this.activeWorkspaceRefIndex ] == undefined) {
        this.things[ this.activeWorkspaceRefIndex ] = 'up';
        return;
      }
      this.$refs.workspaces[ this.activeWorkspaceRefIndex ].up();
    },
    add(type) {
      // 先切换到对应的工作区
      let index = this.getTypeIndex(type);
      this.$refs.carousel.setActiveItem(index);
      if(this.isOpened[ index ] == undefined) {
        // 若工作区还未创建，则由 finish 来处理 add
        let refIndex = Object.keys(this.isOpened).length;
        this.things[ refIndex ] = {
          'method': 'add',
          'params': [type, this.keyword]
        }
        return;
      }

      let refIndex =  this.isOpened[ index ]-1;
      let workspace = this.$refs.workspaces[ refIndex ];
      // if(workspace == undefined) {
      //   this.things[ refIndex ] = 'add';
      //   return;
      // }
      workspace.add((isSuccess)=>{
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
      // console.log('keydown', event)
      if(this.platform == '') return;

      let index = event.keyCode-49+1;
      if(index <= 0 || index > 9) return;

      if(this.platform == 'Mac' && event.metaKey == true) {
        event.stopPropagation();
        event.preventDefault();

        // this.openWindow(index);
        this.$refs.workspaces[ this.activeWorkspaceRefIndex ].openWindow(index);
      } else if(this.platform == 'Win' && event.altKey == true) {
        event.stopPropagation();
        event.preventDefault();

        // this.openWindow(index);
        this.$refs.workspaces[ this.activeWorkspaceRefIndex ].openWindow(index);
      }
    },
    selectDelay(type, event) {
      // 只有一个工作区可用时，输入框回复左右选择能力
      if(this.workspaces.length > 1) {
        event.preventDefault();
      }

      // 防止滚动过快，渲染速度跟不上看起来会停止，体验不好
      if(this.lock == true) return;
      this.lock = true;

      if(type == 'down') {
        this.down();
        setTimeout(() => { this.lock = false; }, 1);
      } else if(type == 'up') {
        this.up();
        setTimeout(() => { this.lock = false; }, 1);
      } else if(type == 'left') {
        this.$refs.carousel.prev();
        setTimeout(() => { this.lock = false; }, 150);
      } else if(type == 'right') {
        this.$refs.carousel.next();
        setTimeout(() => { this.lock = false; }, 150);
      }
    },
    workspaceChange(newIndex) {
      this.activeWorkspaceIndex = newIndex;
      if( ! this.isOpened[this.activeWorkspaceIndex]) {
        this.$set(this.isOpened, this.activeWorkspaceIndex, Object.keys(this.isOpened).length+1);
      }

      if( ! this.config.pinned) {
        this.config.active_workspace_type = this.currentWorkspace.type;
        chrome.storage.sync.set({'config': this.config}, () => {
          // this.$message({
          //   type: 'success',
          //   message: this.lang('saveSuccess')
          // });
        });
      }

      // 输入框聚焦
      this.focus();
      // this.$refs['input'].focus();

      this.search();

      // 屏蔽鼠标事件
      // if(this.$refs.workspaces != undefined
      // && this.$refs.workspaces[ this.activeWorkspaceRefIndex ] != undefined) {
      //   this.$refs.workspaces[ this.activeWorkspaceRefIndex ].mouseRealMoveRegister();
      // }
    },

    changeThemeMode() {
      this.focus();

      this.config.theme_mode = this.config.theme_mode == 'light' ? 'dark' : 'light';

      let htmlNode = document.querySelector('html');
      htmlNode.style.filter = this.config.theme_mode == 'dark' ? 'invert(1) hue-rotate(180deg)' : '';
      htmlNode.style.setProperty("--filter", this.config.theme_mode == 'dark' ? 'invert(1) hue-rotate(180deg)' : '');
      // this.filter = this.config.theme_mode == 'dark' ? 'invert(1) hue-rotate(180deg)' : '';

      chrome.storage.sync.set({'config': this.config}, () => {
        // this.$message({
        //   type: 'success',
        //   message: this.lang('saveSuccess')
        // });
      });
    },
    toPin() {
      this.focus();

      if(this.config.active_workspace_type == this.currentWorkspace.type) {
        this.config.pinned = ! this.config.pinned;
      } else {
        this.config.active_workspace_type = this.currentWorkspace.type;
        this.config.pinned = true;
      }
      chrome.storage.sync.set({'config': this.config}, () => {
        // this.$message({
        //   type: 'success',
        //   message: this.lang('saveSuccess')
        // });
      });
    },
    changeTheme(theme, index) {
      if(this.currentThemeIndex == index) return;

      // this.currentThemeIndex = index;
      this.config.theme_id = theme.id;
      Object.assign(this.config, theme.config);
      console.log(this.config, theme.config)

      chrome.storage.sync.set({'config': this.config}, () => {
        // this.$message({
        //   type: 'success',
        //   message: this.lang('saveSuccess')
        // });
      });
    },
  },
  mounted() {
    if(navigator.platform.indexOf("Win") == 0) {
      this.platform = 'Win';
    } else if(navigator.platform.indexOf("Mac") == 0) {
      this.platform = 'Mac';
    }

    // this.config = config;
    // this.config = userConfig+projectConfig
    // this.config = userConfig;
    // this.allWorkspaces = projectConfig.allWorkspaces;

    chrome.storage.sync.get({'config': {}}, items => {
      Object.assign(this.config, items.config);

      if(this.config.theme_mode == 'dark') {
        let htmlNode = document.querySelector('html');
        htmlNode.style.filter = 'invert(1) hue-rotate(180deg)';
        htmlNode.style.setProperty("--filter", 'invert(1) hue-rotate(180deg)');
        // this.filter = 'invert(1) hue-rotate(180deg)';
      }

      // 貌似没效果
      // let body = document.querySelector('body');
      // body.style.width="500px";
      // body.style.height="418px";

      // for(let type of this.config.workspaces) {
      //   this.workspaces.push(this.allWorkspaces[type]);
      // }
      this.workspaces = this.config.workspaces.map((workspace) => {
        return this.allWorkspaces[workspace];
      });//*/

      if(this.config.button_follow_workspace) {
        let operateOrder = [];
        for(let type of this.config.workspaces) {
          if(this.operateOrder.indexOf(type) != -1) {
            operateOrder.push(type);
          }
        }
        this.operateOrder = operateOrder;
      } else {
        this.operateOrder = this.operateOrder.filter(type => {
          return this.config.workspaces.indexOf(type) != -1;
        })
      }

      // 兼容老用户升级，依然打开 window （默认是 tab）
      if(items.config.active_workspace_type == undefined
      && Object.keys(items.config).length > 0) {
        this.config.active_workspace_type = 'window';
      }

      this.activeWorkspaceIndex = this.getTypeIndex(this.config.active_workspace_type);
      this.$set(this.isOpened, this.activeWorkspaceIndex, Object.keys(this.isOpened).length+1);
      this.search();
    });

    // 等页面加载完了再加载图片，否则插件弹出的速度回变慢
    // 这个才是最对的
    document.body.onload=() => {
      this.isLoad = true;
    };

    // window.oncontextmenu = function(e){
    //   // 取消默认的浏览器自带右键
    //   // 输入框也被屏蔽了
    //   e.preventDefault();
    // }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#app {
  padding: 10px 0 0px 0;
}
</style>

<!-- 全局样式 -->
<style>
body {
  margin: 0;
}

img {
  filter: var(--filter);
}

.el-input__prefix {
  transition: none;
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
  padding: 0 !important;
}

.theme-item {
  margin: 9px 0;
  padding: 0px 9px 0px 0px;

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
  display: flex;
  margin: 0 10px 10px 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.toolbar .search-input {
  flex:1;
}
.toolbar .search-input .el-input-group__prepend {
  background-color: #fff;
  border-radius: 0;
}
.toolbar .search-input input {
  border-radius: 0;
}
.toolbar .search-input input:focus {
  border-color: #C0C4CC;
}
.toolbar .search-input input {
  border-radius: 0;
}
.toolbar .search-input .el-input-group__prepend {
  padding: 0 10px;
}

.toolbar .el-icon-arrow-down.is-reverse {
  transform: rotate(-180deg);
}
.toolbar .el-dropdown-link {
  cursor: pointer;
}
.toolbar-menu .el-dropdown-menu__item.selected {
  color: #409eff;
  font-weight: 700;
}
.toolbar-menu .el-dropdown-menu__item:focus, .el-dropdown-menu__item:not(.is-disabled, .selected, .other):hover {
    /* background-color: #ecf5ff; */
    color: #606266;
}
.toolbar-menu .el-dropdown-menu__item.other:hover {
    background-color: #FFF;
    color: #606266;
}

.toolbar .el-button-group .el-button:first-child {
  border-left-width: 0;
  border-radius: 0;
}
.toolbar .el-button-group .el-button:last-child {
  border-radius: 0;
}

.el-carousel__indicators {
  line-height: 0;
}
.el-carousel__indicator--horizontal {
   /* 注意，这里还和列表选择事件有关，列表隐藏部分会有几px的误差，不过套在了跑马灯上后倒是不会了，有问题就改成 6px */
  padding-top: 8px !important;
  padding-bottom: 0px !important;
}

/* 组件共享样式，注意会影响所有组件，之所以放这里是因为这个是弹出框，是 body 的直接子元素 */
.group .el-dialog__header {
  padding: 16px 53px 0 16px !important;
  text-align: left;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.group .el-dialog__body{
  padding: 10px 10px 10px 10px !important;
}
.group .group-list {
  padding: 0;
  margin: 0;
  overflow: auto;
  font-size: 15px;
}
.group .group-list-item {
  padding: 5px;
  align-items: center;
  color: black;
  list-style: none;
  display: flex;
}
.group .group-list-item span:hover {
  /* color: #409eff; */
  text-decoration: underline;
  color: #1288ff;
}
.group .tab-name{
  font-size:14px;
  margin-left: 10px;
  cursor: pointer;
  flex: 1;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color: #4682BE;
}

.window-message-box {
  width: 80%;
  min-width: auto !important;
  max-width: 80% !important;
}
</style>
