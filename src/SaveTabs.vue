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

    <div
      class="toolbar"
      :style="{ margin: config.padding_width+'px '
                      +(config.padding_width+10)+'px '
                      +'10px '
                      +(config.padding_width+10)+'px',
                height: config.toolbar_height+'px',

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
      <el-input
        class="search-input"
        :placeholder="currentWorkspace == undefined || ! config.toolbar_show_input_tip
                    ? ''
                    : lang(currentWorkspace.placeholder)"
        v-model="keyword"
        :clearable="keyword == '' ? false : true"
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
                        $refs.carousel.setActiveItem(activeWorkspaceIndex)),
                        focus()"><!-- 可能重复点击，所以还是要 focus 的 -->
            <span class="el-dropdown-link" @click="focus"> <!-- 工作区标题 -->
              <svg-icon
                :name="currentWorkspace == undefined ? 'frown-open-regular' : currentWorkspace.svg"
                style="width: 20px; height: 20px; position: relative; top: 2px;margin-right: 3px;"
                :style="{ color: config.pinned && currentWorkspace != undefined && config.active_workspace_type == currentWorkspace.type
                      ? config.toolbar_menu_icon_fixed_color : config.toolbar_menu_icon_color}"></svg-icon>
              <span style="position: relative; top: -3px;">
                <span
                  v-if="config.show_workspace_name"
                  style="display:inline-block;width: 70px;text-align:center;"
                  :style="{ color: config.toolbar_menu_font_color }">{{ currentWorkspace == undefined ? '' : lang(currentWorkspace.title) }}</span>
                <i style="transition: transform .3s;"
                  class="el-icon-arrow-down el-icon--right"
                  :class="{ 'is-reverse': menuVisible}"
                  :style="{ color: config.toolbar_icon_color }"></i>
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
                  style="width:16px;margin-right: 10px;vertical-align: -0.50em"
                  :style="{
                    color: config.pinned
                  && config.active_workspace_type == workspace.type
                  ? 'gray' : '#c0c4cc'}"
                  @click="toPin"
                ></svg-icon><span>{{ lang(workspace.title) }}</span>
              </el-dropdown-item>
              <el-dropdown-item
                divided
                :command="-1"
                class="other"
                style="width: 92px; overflow: hidden; text-overflow:ellipsis; white-space:nowrap;"
                @click.native="themeDialogVisible=true;"><!-- 顶部已甚至了 click focus -->
                <i class="el-icon-check"></i><span>{{ currentTheme.name }}</span>
              </el-dropdown-item>
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
                    :style="{ transform: config.pinned
                                      && currentWorkspace != undefined
                                      && config.active_workspace_type == currentWorkspace.type
                                      ? 'rotate(0)' : 'rotate(90deg)' }"
                    style="cursor:pointer;height: 20px; position: relative; top: 6px;"></svg-icon>
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <!-- <template slot="suffix">
          <i
            v-if="keyword != ''"
            class="el-icon-circle-close"
            style="padding-right: 4px; cursor: pointer;"
            :style="{ 'line-height': config.toolbar_height+'px' }"
            ></i>
        </template> -->
        <template slot="prefix">
          <template v-if="currentWorkspace == undefined
                        ||currentWorkspace.type == 'window'">
            <i
              class="el-icon-search"
              style="padding-left: 4px;"
              :style="{ 'line-height': config.toolbar_height+'px',
                        color: config.toolbar_icon_color }"></i>
          </template>
          <template v-else>
            <el-popover
              v-model="history.visible"
              placement="top-start"
              trigger="manual"
              transition=""
              @after-enter="history.date == null ? $refs.date.focus() : ''">
              <el-date-picker
                type="date"
                v-model="history.date"
                placeholder="选择日期"
                :picker-options="history.pickerOptions"
                @blur="focus();"
                @change="history.date == null ? history.visible = false : '';focus();"
                ref="date">
              </el-date-picker>
              <i
                class="el-icon-delete"
                style="margin-left: 10px;cursor: pointer;"
                :style="{ color: keyword.trim() != '' ? '#c0c4cc' : 'inherit',
                          cursor: keyword.trim() != '' ? 'not-allowed' : 'pointer' }"
                @click="keyword.trim() != '' ? '' : history.isDel = true"></i>
              <i
                class="el-icon-date"
                slot="reference"
                style="padding-left: 4px;cursor: pointer;"
                :style="{ 'line-height': config.toolbar_height+'px',
                          color: history.visible ? config.toolbar_icon_focus_color : config.toolbar_icon_color }"
                @click="history.visible = ! history.visible;history.visible ? '' : focus()"></i>
            </el-popover>
          </template>
        </template>
      </el-input>
      <el-button-group
        style="display: flex"
        :style="{ width: (config.toolbar_height*3+45)+'px' }">
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
      :style="{ padding: '0 '
                        +config.padding_width+'px '
                        +config.padding_width+'px '
                        +config.padding_width+'px',
              }"
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

          :history="history"

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
      input: this.input,
    }
  },
  data() {
    return {
      keyword: '',
      activeWorkspaceIndex: -1,//0,
      workspaces: [],
      isLoad: false,
      isOpened: {},
      things: { 0: []}, // 一开始没有切换事件
      operateOrder: [ 'window', 'note', 'temporary' ],
      lock: false,

      config: userConfig,
      themes: userTheme,
      allWorkspaces: projectConfig.allWorkspaces,

      menuVisible: false,
      themeDialogVisible: false,
      themeScrollPosition: 0,
      // currentThemeIndex: -1,

      history: {
        date: null,
        visible: false,
        lastVisible: false,
        isActive: true,
        isDel: false,
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
        }
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
    input(value) {
      this.keyword = value;
      this.search();
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
console.log('search', this.activeWorkspaceRefIndex )
        this.things[ this.activeWorkspaceRefIndex ].push('search');

        // 如果在这之前已经有其它事情待处理（如添加），则不作查询，会有人帮忙处理
        // if(this.things[ this.activeWorkspaceRefIndex ] == undefined) {
        //   this.things[ this.activeWorkspaceRefIndex ] = 'search';
        // }
        return;
      }

      this.$refs.workspaces[ this.activeWorkspaceRefIndex ].search(this.keyword);
    },
    openWindow(event) {
      this.$refs.workspaces[ this.activeWorkspaceRefIndex ].openWindow(undefined, event);
    },
    // down() {
    //   // if(this.$refs.workspaces == undefined
    //   // || this.$refs.workspaces[ this.activeWorkspaceRefIndex ] == undefined) {
    //   //   this.things[ this.activeWorkspaceRefIndex ].push('down');
    //   //   return;
    //   // }
    //   this.$refs.workspaces[ this.activeWorkspaceRefIndex ].down();
    // },
    // up() {
    //   // if(this.$refs.workspaces == undefined
    //   // || this.$refs.workspaces[ this.activeWorkspaceRefIndex ] == undefined) {
    //   //   this.things[ this.activeWorkspaceRefIndex ].push('up');
    //   //   return;
    //   // }
    //   this.$refs.workspaces[ this.activeWorkspaceRefIndex ].up();
    // },
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
      // console.log('keydown', event)
      if(this._device.platform == '') return;

      let index = event.keyCode-49+1;
      if(index <= 0 || index > 9) return;

      if(this._device.platform == 'Mac' && event.metaKey == true) {
        event.stopPropagation();
        event.preventDefault();

        // this.openWindow(index);
        this.$refs.workspaces[ this.activeWorkspaceRefIndex ].openWindow(index, {});
      } else if(this._device.platform != '' && event.altKey == true) {
        event.stopPropagation();
        event.preventDefault();

        // this.openWindow(index);
        this.$refs.workspaces[ this.activeWorkspaceRefIndex ].openWindow(index, {});
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
        // this.down();
        this.$refs.workspaces[ this.activeWorkspaceRefIndex ].down();
        setTimeout(() => { this.lock = false; }, 1);
      } else if(type == 'up') {
        // this.up();
        this.$refs.workspaces[ this.activeWorkspaceRefIndex ].up();
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
      console.log('workspaceChange', newIndex)
      this.activeWorkspaceIndex = newIndex;
      if( ! this.isOpened[this.activeWorkspaceIndex]) {
        this.$set(this.isOpened, this.activeWorkspaceIndex, Object.keys(this.isOpened).length+1);
console.log('workspaceChange2', this.activeWorkspaceRefIndex)
        console.log('99999999999999999999999999999999999', this.activeWorkspaceRefIndex)
        // add 会比这里先
        if( ! this.things[ this.activeWorkspaceRefIndex ]) {
          this.things[ this.activeWorkspaceRefIndex ] = [];
        }
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

      // 切换后输入框自动获取聚焦
      // 其它地方注意不要再重复foucs，没有意义
      this.focus();
      // this.$refs['input'].focus();

      if(this.currentWorkspace.type == 'history') {
        if(this.history.lastVisible) {
          this.history.visible = this.history.lastVisible;
          this.history.lastVisible = false;
          this.history.isActive = true;
        }
      } else if(this.history.visible) {
        this.history.lastVisible = this.history.date != null && this.history.visible;
        this.history.visible = false;
        this.history.isActive = false;
      }

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
    // todo
    window.s = this;

    // this.config = config;
    // this.config = userConfig+projectConfig
    // this.config = userConfig;
    // this.allWorkspaces = projectConfig.allWorkspaces;

    this.focus();

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
  padding: 0 10px;
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
.toolbar .el-input__suffix .el-icon-circle-close {
  line-height: var(--toolbar_height);
  color: var(--toolbar-icon-color);
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
.toolbar .el-dropdown-link {
  cursor: pointer;
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

.el-carousel__indicators {
  line-height: 0;
}
.el-carousel__indicator--horizontal {
   /* 注意，这里还和列表选择事件有关，列表隐藏部分会有几px的误差，不过套在了跑马灯上后倒是不会了，有问题就改成 6px */
  padding-top: 8px !important;
  padding-bottom: 0px !important;
}

/* 组件共享样式 */
.window-message-box {
  width: 80%;
  min-width: auto !important;
  max-width: 80% !important;
}
</style>
