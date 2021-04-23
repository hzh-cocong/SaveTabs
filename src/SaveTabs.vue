<template>
  <div
    id="app"
    :style="{
      width: config.width+'px',
      backgroundColor: config.background_color,
      }">

    <div class="toolbar">
      <el-input
        class="search-input"
        :placeholder="lang('searchTip')"
        v-model="keyword"
        autofocus="autofocus"
        :suffix-icon="this.keyword == '' ? 'el-icon-search' : ''"
        :clearable="true"
        @keydown.down.native.prevent="selectDelay('down')"
        @keydown.up.native.prevent="selectDelay('up')"
        @keydown.left.native.prevent="selectDelay('left')"
        @keydown.right.native.prevent="selectDelay('right')"
        @keydown.enter.native="openWindow"
        @keydown.native="keydown"
        @input="search">
        <template slot="prepend">

          <el-select
            v-if="this.workspaces.length >= 1"
            v-model="activeWorkspaceIndex"
            placeholder="请选择"
            @change="$refs.carousel.setActiveItem(activeWorkspaceIndex);"
            @mouseenter.native="$refs['select'].$el.click()"
            style="width: 100px;"
            ref="select">
            <template slot="prefix">
              <font-awesome-icon
                :icon="currentWorkspace.icon"
                :style="{ color: config.pinned && config.activeWorkspaceType == currentWorkspace.type
                      ? 'gray' : '#c0c4cc'}"
                style="margin: 10px 0 0 5px; cursor:pointer;"
                size="lg"
              ></font-awesome-icon>
            </template>
            <el-option-group>
              <el-option
                v-for="(workspace, index) in workspaces"
                :label="workspace.title"
                :value="index"
                :key="index">
                <font-awesome-icon
                  :icon="workspace.icon"
                  :style="{ color: config.pinned && config.activeWorkspaceType == workspace.type
                                  ? 'gray' : '#c0c4cc'}"
                  style="width:20px;margin-right: 10px"
                  @click="toPin"
                ></font-awesome-icon>{{ workspace.title }}
              </el-option>
            </el-option-group>
            <el-option-group>
              <el-option
                :value="activeWorkspaceIndex"
                :disabled="true"
                style="cursor: default;">
                <font-awesome-icon
                  icon="thumbtack"
                  :style="{color: config.pinned && config.activeWorkspaceType == currentWorkspace.type
                                  ? 'gray' : '#c0c4cc',
                          transform: config.pinned && config.activeWorkspaceType == currentWorkspace.type
                                  ? 'rotate(0)' : 'rotate(90deg)'}"
                  style="margin-left: 5px; cursor:pointer;"
                  size="lg"
                  @click="toPin"
                ></font-awesome-icon>
              </el-option>
              <el-option
                :value="activeWorkspaceIndex"
                :disabled="true"
                style="cursor: default">
                <font-awesome-icon
                  :icon=" themeMode == 'white' ? 'sun' : 'moon'"
                  style="margin-left: 5px; cursor:pointer;"
                  :style="{ color: themeMode == 'white' ? 'gray' : 'gray'}"
                  size="lg"
                  @click="changeThemeMode"
                ></font-awesome-icon>
              </el-option>
            </el-option-group>
            <el-option-group>
              <el-option
                :value="activeWorkspaceIndex"
                :disabled="true"
                style="cursor: default">
                <font-awesome-icon
                  icon="cog"
                  style="margin-left: 5px; cursor:pointer;"
                  :style="{ color: themeMode == 'white' ? '#c0c4cc' : 'gray'}"
                  size="lg"
                  @click="$open('./options.html')"
                ></font-awesome-icon>
              </el-option>
            </el-option-group>
          </el-select>
        </template>
      </el-input>
      <el-button-group
        style="">
        <el-button
          type="default"
          icon="el-icon-download"
          @click="add('window')"
          ></el-button>
        <el-button
          type="default"
          icon="el-icon-collection-tag"
          @click="add('note')"
          ></el-button>
        <el-button
          type="default"
          icon="el-icon-paperclip"
          @click="add('temporary')"
          ></el-button>
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
      @change="workspaceChange"
      ref="carousel">
      <el-carousel-item v-for="(workspace, index) in workspaces"  :key="index">
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
import config from './config.json'

export default {
  name: 'app',
  data() {
    return {
      keyword: '',
      activeWorkspaceIndex: -1,//0,
      workspaces: [],
      isLoad: false,
      config: {},
      themeMode: 'white',
      platform: '',
      isOpened: {},
      things: {},
      allWorkspaces: {
        'tab': {
          'type': 'tab',
          'title': '标签',
          'icon': ['fas', 'window-maximize'],
        },
        'note': {
          'type': 'note',
          'title': '便签',
          'icon': ['fas', 'bookmark']
        },
        'window': {
          'type': 'window',
          'title': '窗口',
          'icon': ['fab', 'windows']
        },
        'temporary': {
          'type': 'temporary',
          'title': 'temporary',
          'icon': ['fas', 'paperclip']
        },
        'history': {
          'type': 'history',
          'title': '历史',
          'icon': ['fas', 'history']
        },
        'bookmark': {
          'type': 'bookmark',
          'title': '书签',
          'icon': ['fas', 'star']
        },
      }
    }
  },
  watch: {
    activeWorkspaceIndex(newVal, oldVal) {
      console.warn('activeWorksapceIndex', newVal, typeof(newVal), oldVal)
    }
  },
  computed: {
    activeWorkspaceRefIndex() {
      console.log('activeWorkspaceRefIndex', this.isOpened[ this.activeWorkspaceIndex ]-1)
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
    getTypeIndex(type) {
      console.log('q', type);
      for(let index in this.workspaces) {
        if(this.workspaces[index].type == type) {
          console.log('getTypeIndex2', index, typeof(index));
          return parseInt(index);
        }
      }
      console.log('getTypeIndex3');
    },

    finish() {
      // 只有组件在一开始创建的时候才会调用到这里
      let something = this.things[ this.activeWorkspaceRefIndex ];
      console.log('finish', this.activeWorkspaceRefIndex, something, this.$refs.workspaces)
      if(something) {
        if(typeof(something) == 'string') {
          this[something]();
        } else {
          this[something.method](...something.params);
        }
      }
    },

    search() {
      console.log('start.search', this.activeWorkspaceRefIndex, this.$refs)
      if(this.$refs.workspaces == undefined
      || this.$refs.workspaces[ this.activeWorkspaceRefIndex ] == undefined) {
        // 如果在这之前已经有其它事情待处理（如添加），则不作查询，会有人帮忙处理
        if(this.things[ this.activeWorkspaceRefIndex ] == undefined) {
          this.things[ this.activeWorkspaceRefIndex ] = 'search';
        }
        return;
      }
      console.log('searchffffffff', this.$refs.workspaces[ this.activeWorkspaceRefIndex ])
      this.$refs.workspaces[ this.activeWorkspaceRefIndex ].search(this.keyword);
    },
    openWindow() {
      if(this.$refs.workspaces == undefined
      || this.$refs.workspaces[ this.activeWorkspaceRefIndex ] == undefined) {
        this.things[ this.activeWorkspaceRefIndex ] = 'openWindow';
        return;
      }
      this.$refs.workspaces[ this.activeWorkspaceRefIndex ].openWindow();
    },
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
      console.log('add', index, this.isOpened[ index ])
      if(this.isOpened[ index ] == undefined) {
        let refIndex = Object.keys(this.isOpened).length;
        this.things[ refIndex ] = {
          'method': 'add',
          'params': [type, this.keyword]
        }
        console.log(this.things)
        return;
      }
      let refIndex =  this.isOpened[ index ]-1;
      let workspace = this.$refs.workspaces[ refIndex ];
      // if(workspace == undefined) {
      //   this.things[ refIndex ] = 'add';
      //   return;
      // }
      console.log('add2')
      workspace.add(()=>{
        console.log('add3', 'success', refIndex, this.activeWorkspaceRefIndex, this.$refs.workspaces[ refIndex ]);
        this.keyword = '';
        if(refIndex == this.activeWorkspaceRefIndex) {
          // 添加完后当前窗口可能还没有完全切换过去，此时刷新的仍然是切换前的窗口，所以不需要刷新
          // 至于切换完后的刷新问题，这个完全不用担心，有专门的事件负责
          this.search();
        }
      }, this.keyword);
    },


    keydown(event) {
      if(this.platform == '') return;

      let index = event.keyCode-49+1;
      if(index <= 0 || index > 9) return;

      if(this.platform == 'Mac' && event.altKey == true) {
        event.stopPropagation();
        event.preventDefault();

        this.openWindow();
      } else if(this.platform == 'Win' && event.ctrlKey == true) {
        event.stopPropagation();
        event.preventDefault();

        this.openWindow();
      }
    },
    selectDelay(type) {
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
      console.log('workspaceChange', newIndex)
      this.activeWorkspaceIndex = newIndex;
      if( ! this.isOpened[this.activeWorkspaceIndex]) {
        console.log('workspaceChange2', newIndex)
        this.$set(this.isOpened, this.activeWorkspaceIndex, Object.keys(this.isOpened).length+1);
      }

      if( ! this.config.pinned) {
        this.config.activeWorkspaceType = this.currentWorkspace.type;
      }

      this.search();
    },

    changeThemeMode() {
      this.themeMode = this.themeMode == 'white' ? 'dark' : 'white';
      document.querySelector('html').style.filter = this.themeMode == 'dark' ? 'invert(1) hue-rotate(180deg)' : '';
    },
    toPin() {
      if(this.config.activeWorkspaceType == this.currentWorkspace.type) {
        this.config.pinned = ! this.config.pinned;
      } else {
        this.config.activeWorkspaceType = this.currentWorkspace.type;
        this.config.pinned = true;
      }
    }
  },
  mounted() {
    // todo
    window.vue = this;

    if(navigator.platform.indexOf("Win") == 0) {
      this.platform = 'Win';
    } else if(navigator.platform.indexOf("Mac") == 0) {
      this.platform = 'Mac';
    }

    this.config = config;
    chrome.storage.sync.get({'config': {}}, items => {
      // alert('a')
      Object.assign(this.config, items.config);

      // for(let type of this.config.workspaces) {
      //   this.workspaces.push(this.allWorkspaces[type]);
      // }
      this.workspaces = this.config.workspaces.map((workspace) => {
        return this.allWorkspaces[workspace];
      });//*/
      console.log('ffffffff', this.workspaces);

      this.activeWorkspaceIndex = this.getTypeIndex(this.config.activeWorkspaceType);
      console.log('8888888888888888888888888888888', this.activeWorkspaceIndex)
      this.$set(this.isOpened, this.activeWorkspaceIndex, Object.keys(this.isOpened).length+1);
      console.log(JSON.stringify(this.isOpened))
      this.search();
    });

    // 等页面加载完了再加载图片，否则插件弹出的速度回变慢
    document.body.onload=() => {
      // setTimeout(() => {
        this.isLoad = true;
      // }, 1000)

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
  min-width: 130px;
  border-radius: 0;
}
.toolbar .search-input .el-input-group__prepend input {
  min-width: auto;
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

.el-carousel__indicators {
  line-height: 0;
}
.el-carousel__indicator--horizontal {
  padding-top: 6px !important;
  padding-bottom: 0px !important;
}
</style>
