<template>
  <div
    id="app"
    :style="{
      width: config.width+'px',
      backgroundColor: config.background_color,
      }">

    <div class="search-input">
      <el-input
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
            v-model="activeWorkspace"
            placeholder="请选择"
            @change="changeWorkspace"
            @mouseenter.native="$refs['select'].$el.click()"
            ref="select"
            style="width:80px;">
            <el-option-group>
              <el-option
                v-for="(workspace, index) in workspaces"
                :label="workspace.title"
                :value="index"
                :key="index"></el-option>
            </el-option-group>
            <el-option-group>
              <el-option
                :value="activeWorkspace"
                :disabled="true"
                style="cursor: default">
                <el-link
                  type="info"
                  style="margin-left: 5px; font-size: 18px; cursor:pointer;"
                  @click="changeThemeMode">
                  <i :class="themeMode == 'white' ? 'el-icon-sunny' : 'el-icon-moon'"></i>
                </el-link>
              </el-option>
              <el-option
                :value="activeWorkspace"
                :disabled="true"
                style="cursor: default">
                <el-link
                  type="info"
                  style="margin-left: 5px; font-size: 18px; cursor:pointer;"
                  @click="$open('./options.html')">
                  <i class="el-icon-s-tools"></i>
                </el-link>
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
          @click="addWindow"
          ></el-button>
        <el-button
          type="default"
          icon="el-icon-collection-tag"
          @click="addTab"
          ></el-button>
        <el-button
          type="default"
          icon="el-icon-paperclip"
          @click="addTemporary"
          ></el-button>
      </el-button-group>
    </div>

    <el-carousel
      indicator-position="outside"
      arrow="never"
      :autoplay="false"
      :loop="true"
      :initial-index="activeWorkspace"
      :height="(config.item_height*config.item_show_count)+'px'"
      @change="workspaceChange"
      ref="carousel">
      <el-carousel-item v-for="(workspace, index) in workspaces"  :key="index">
        <component
          v-if="index==activeWorkspace || isOpened[index]"
          :is="workspace.type"
          :config="config"
          :isLoad="isLoad"
          :keyword="keyword"
          :platform="platform"
          ref="workspaces"></component>
        <!-- <keep-alive>
        <component
          v-if="index==activeWorkspace"
          :is="workspace.type"
          :config="config"
          :isLoad="isLoad"
          :keyword="keyword"
          :platform="platform"
          ref="workspaces"></component>
        </keep-alive> -->
      </el-carousel-item>
    </el-carousel>

  </div>
</template>

<script>
import Vue from 'vue'
import List from './components/List.vue'
// import Window from './components/Window.vue'
// import History from './components/History.vue'
// import Tab from './components/Tab.vue'
// import Bookmark from './components/Bookmark.vue'
// import Note from './components/Note.vue'
// import Temporary from './components/Temporary.vue'
import config from './config.json'

const Window = Vue.component('Window', function (resolve) {
    // setTimeout(function () {
    //     require(['./components/Window.vue'], resolve)
    // }, 3000);
    require(['./components/Window.vue'], resolve)
});
const History = Vue.component('History', function (resolve) {
    // setTimeout(function () {
    //     require(['./components/History.vue'], resolve)
    // }, 3000);
    require(['./components/History.vue'], resolve)
});
const Tab = Vue.component('Tab', function (resolve) {
    // setTimeout(function () {
    //     require(['./components/Tab.vue'], resolve)
    // }, 3000);
    require(['./components/Tab.vue'], resolve)
});
const Bookmark = Vue.component('Bookmark', function (resolve) {
    // setTimeout(function () {
    //     require(['./components/Bookmark.vue'], resolve)
    // }, 3000);
    require(['./components/Bookmark.vue'], resolve)
});
const Note = Vue.component('Note', function (resolve) {
    // setTimeout(function () {
    //     require(['./components/Note.vue'], resolve)
    // }, 3000);
    require(['./components/Note.vue'], resolve)
});
const Temporary = Vue.component('Temporary', function (resolve) {
    // setTimeout(function () {
    //     require(['./components/Temporary.vue'], resolve)
    // }, 3000);
    require(['./components/Temporary.vue'], resolve)
});

export default {
  name: 'app',
  data() {
    return {
      keyword: '',
      activeWorkspace: 4,//0,
      workspaces: [],
      isLoad: false,
      config: {},
      themeMode: 'white',
      platform: '',
      isOpened: {},
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
    keydown(event) {
      console.log('key', arguments)
      console.log('key', arguments[0].key)

      if(this.platform == '') return;

      let index = event.keyCode-49+1;
      if(index <= 0 || index > 9) return;

      if(this.platform == 'Mac' && event.altKey == true) {
        event.stopPropagation();
        event.preventDefault();

        this.$refs.workspaces[this.activeWorkspace].openWindow(index);
      } else if(this.platform == 'Win' && event.ctrlKey == true) {
        event.stopPropagation();
        event.preventDefault();

        this.$refs.workspaces[this.activeWorkspace].openWindow(index);
      }
    },

    changeThemeMode() {
      this.themeMode = this.themeMode == 'white' ? 'dark' : 'white';
      document.querySelector('html').style.filter = this.themeMode == 'dark' ? 'invert(1) hue-rotate(180deg)' : '';
    },
    addWindow() {
      this.$refs.workspaces[this.activeWorkspace].add(()=>{
        this.keyword = '';
        this.search();
      });
    },
    addTab() {
      this.$refs.workspaces[this.activeWorkspace].add(()=>{
        this.keyword = '';
        this.search();
      });
    },
    addTemporary() {
      this.$refs.workspaces[this.activeWorkspace].add(()=>{
        this.keyword = '';
        this.search();
      });
    },
    selectDelay(type) {
      if(this.lock == false) return;
      // 防止滚动过快，渲染速度跟不上看起来会停止，体验不好
      this.lock = setTimeout(() => {
        if(type == 'down') {
          this.$refs.workspaces[this.activeWorkspace].down();
        } else if(type == 'up') {
          this.$refs.workspaces[this.activeWorkspace].up();
        } else if(type == 'left') {
          this.$refs.carousel.prev();
        } else if(type == 'right') {
          this.$refs.carousel.next();
        }
        this.lock = true;
      }, 1);
      this.lock = false;
    },
    changeWorkspace() {
      this.$refs.carousel.setActiveItem(this.activeWorkspace);
    },
    workspaceChange(newIndex, oldIndex) {
      this.activeWorkspace = newIndex;
      console.log(oldIndex);
      this.$set(this.isOpened, this.activeWorkspace, true);
      console.log('aaaaaaaaaaaaaaaaaaaa', this.isOpened);
    },

    openWindow() {
      this.$refs.workspaces[this.activeWorkspace].openWindow();
    },
    search: function() {
      // if(this.timer != undefined) clearTimeout(this.timer);
      // this.timer = setTimeout(() => {
      //   this.$refs.workspaces[this.activeWorkspace].search(this.keyword);
      // }, 100);

      // if(this.lock2 == false) return;
      // // 防止滚动过快，渲染速度跟不上看起来会停止，体验不好
      // this.lock2 = setTimeout(() => {
      //   this.$refs.workspaces[this.activeWorkspace].search(this.keyword);
      //   this.lock2 = true;
      // }, 30);
      // this.lock2 = false;

      this.$refs.workspaces[this.activeWorkspace].search(this.keyword);
    },
  },
  mounted() {
    // todo
    window.vue = this;

    this.$set(this.isOpened, this.activeWorkspace, true);

    if(navigator.platform.indexOf("Win") == 0) {
      this.platform = 'Win';
    } else if(navigator.platform.indexOf("Mac") == 0) {
      this.platform = 'Mac';
    }
    console.log('platform', this.platform);
    console.log('navigator', navigator);

    this.config = config;
    chrome.storage.sync.get({'config': {}}, items => {
      Object.assign(this.config, items.config);
    });

    // 等页面加载完了再加载图片，否则插件弹出的速度回变慢
    document.body.onload=() => {
      console.info('onload')
      // setTimeout(() => {
        this.isLoad = true;
      // }, 1000)

    };

    this.workspaces.push({
      'type': 'temporary',
      'title': '临时',
    });
    this.workspaces.push({
      'type': 'note',
      'title': '便签',
    });
    this.workspaces.push({
      'type': 'window',
      'title': '窗口',
    });
    this.workspaces.push({
      'type': 'history',
      'title': '历史',
    });
    this.workspaces.push({
      'type': 'tab',
      'title': '标签',
    });
    this.workspaces.push({
      'type': 'bookmark',
      'title': '书签',
    });

    console.log(this.workspaces);
    console.log(this.storageList);
  }
}
</script>

<style>
#app {
  padding: 10px 0 0px 0;
}
.search-input {
  display: flex;
  margin: 0 10px 10px 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.search-input .el-input {
  flex:1;
}
.search-input input {
  min-width: 130px;
  border-radius: 0;
}
.search-input input:focus {
  border-color: #C0C4CC;
}
.search-input .el-input .el-input-group__prepend {
  background-color: #fff;
  border-radius: 0;
}
.search-input .el-button-group .el-button:first-child {
  border-left-width: 0;
  border-radius: 0;
}
.search-input .el-button-group .el-button:last-child {
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
