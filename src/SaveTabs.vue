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
    <div class="toolbar">
      <el-input
        class="search-input"
        :class="{ hide: ! config.show_workspace_name }"
        :placeholder="currentWorkspace == undefined
                    ? ''
                    : lang(currentWorkspace.placeholder)"
        v-model="keyword"
        :suffix-icon="this.keyword == '' ? 'el-icon-search' : ''"
        :clearable="true"
        @keydown.down.native.prevent="selectDelay('down', $event)"
        @keydown.up.native.prevent="selectDelay('up', $event)"
        @keydown.left.native="selectDelay('left', $event)"
        @keydown.right.native="selectDelay('right', $event)"
        @keydown.enter.native="openWindow"
        @keydown.native="keydown"
        @input="search"
        ref="input">
        <template slot="prepend">

          <el-select
            v-show="this.workspaces.length >= 1"
            v-model="activeWorkspaceIndex"
            @change="$refs.carousel.setActiveItem(activeWorkspaceIndex);"
            @mouseenter.native="$refs['select'].$el.click()"
            ref="select">
            <template slot="prefix">
              <svg-icon
                :name="currentWorkspace == undefined ? 'frown-open-regular' : currentWorkspace.svg"
                :style="{ color: config.pinned && currentWorkspace != undefined && config.active_workspace_type == currentWorkspace.type
                      ? 'gray' : '#c0c4cc'}"
                style="margin: 10px 0 0 5px; width: 18px; height: 20px"></svg-icon>
            </template>
            <el-option-group>
              <el-option
                v-for="(workspace, index) in workspaces"
                :label="lang(workspace.title)"
                :value="index"
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
              </el-option>
            </el-option-group>
            <el-option-group>
              <el-option
                :value="activeWorkspaceIndex"
                :disabled="true"
                style="cursor: default;text-align: center;display:flex;justify-content: space-between">
                <span @click="$open('./options.html?type=workspace')">
                  <svg-icon
                    name="cog-solid"
                    style="cursor:pointer;height: 20px;color: #c0c4cc"
                  ></svg-icon>
                </span>
                <span
                  :style="{ color: config.theme_mode == 'light' ? '#c0c4cc' : 'gray'}"
                  @click="changeThemeMode">
                  <svg-icon
                    :name="config.theme_mode == 'light' ? 'sun-solid' : 'moon-solid'"
                    style="cursor:pointer;height: 20px;"></svg-icon>
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
                    style="cursor:pointer;height: 20px;"></svg-icon>
                </span>
              </el-option>
            </el-option-group>
          </el-select>
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
import Window from './components/Window.vue'
import History from './components/History.vue'
import Tab from './components/Tab.vue'
import Bookmark from './components/Bookmark.vue'
import Note from './components/Note.vue'
import Temporary from './components/Temporary.vue'
import userConfig from './config/user_config.json'
import projectConfig from './config/project_config.json'

export default {
  name: 'app',
  provide(){
    return {
      focus: this.focus
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

      config: userConfig,
      allWorkspaces: projectConfig.allWorkspaces
    }
  },
  computed: {
    activeWorkspaceRefIndex() {
      return this.isOpened[ this.activeWorkspaceIndex ]-1;
    },
    currentWorkspace() {
      return this.workspaces[ this.activeWorkspaceIndex ];
    }
  },
  components: {
    List,
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
      let index = this.getTypeIndex(type);
      this.$refs.carousel.setActiveItem(index);
      if(this.isOpened[ index ] == undefined) {
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
      workspace.add(()=>{
        this.keyword = '';
        if(refIndex == this.activeWorkspaceRefIndex) {
          // 添加完后当前窗口可能还没有完全切换过去，此时刷新的仍然是切换前的窗口，所以不需要刷新
          // 至于切换完后的刷新问题，这个完全不用担心，有专门的事件负责
          this.search();
        }
      }, this.keyword);
    },


    keydown(event) {
      console.log('keydown', event)
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

      if(this.lock == false) return;
      // 防止滚动过快，渲染速度跟不上看起来会停止，体验不好
      this.lock = setTimeout(() => {
        if(type == 'down') {
          this.down();
        } else if(type == 'up') {
          this.up();
        } else if(type == 'left') {
          this.$refs.carousel.prev();
        } else if(type == 'right') {
          this.$refs.carousel.next();
        }
        this.lock = true;
      }, 1);
      this.lock = false;
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
      document.querySelector('html').style.filter = this.config.theme_mode == 'dark' ? 'invert(1) hue-rotate(180deg)' : '';
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
    }
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
        document.querySelector('html').style.filter = 'invert(1) hue-rotate(180deg)';
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
  }
}
</script>

<style>
#app {
  padding: 10px 0 0px 0;
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
  /* min-width: 130px; */
  border-radius: 0;
}
.toolbar .search-input .el-input-group__prepend {
  width: 90px;
  min-width: 90px;
  max-width: 90px;
}
.toolbar .search-input.hide .el-input-group__prepend{
  width: 20px !important;
  min-width: 20px !important;
  max-width: 20px !important;
  /* min-width: 0 !important;
  max-width: 10px !important; */
}
.toolbar .search-input .el-input-group__prepend input {
  min-width: auto;
  text-align: center;
  border: 0;
}
.toolbar .search-input .el-input-group__prepend input:focus {
  border-color: none;
  border: 0;
}
.toolbar .el-button-group .el-button:first-child {
  border-left-width: 0;
  border-radius: 0;
}
.toolbar .el-button-group .el-button:last-child {
  border-radius: 0;
}

body {
  margin: 0;
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
.el-badge__content {
    background-color: inherit !important;
    border-color: inherit !important;
}

.group .el-dialog__header {
  padding: 10px 53px 0 16px !important;
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
