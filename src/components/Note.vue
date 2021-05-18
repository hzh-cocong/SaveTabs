<template>
  <div>

  <el-alert
    type="info"
    :closable="false"
    show-icon
    v-if="isSearched && list.length == 0"
    style="margin: 0 10px;"
    :style="{ width: (config.width-20)+'px' }">
    <div
      slot="title"
      style="display:flex;align-items: center;"
      :style="{ width: (config.width-70)+'px' }">
      <div style="flex:1;">
        <div v-if="storageList.length > 0">{{ lang('noteNoResult') }}</div>
        <div>{{ lang('noteCountTip')+storageList.length+lang('noteCountTip2') }}</div>
      </div>
      <el-button circle size="mini" icon="el-icon-coffee-cup" style="margin-left: 2px !important;" @click="$open('./options.html?type=praise')"></el-button>
      <el-button circle size="mini" icon="el-icon-chat-dot-square" style="margin-left: 2px !important;" @click="$open('https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno/reviews')"></el-button>
      <el-button circle size="mini" icon="el-icon-setting" style="margin-left: 2px !important;" @click="$open('./options.html?type=other')"></el-button>
    </div>
  </el-alert>

  <list
    :list="list"
    :itemHeight="config.item_height"
    :itemShowCount="config.item_show_count"
    :scrollDisabled="scrollDisabled"
    v-model="currentIndex"
    ref="list"
    @load="load"
    @click.native="focus">
    <template #default="{ index, item, isActive, isSelected }">
      <div
        class="item"
        :style="{
          backgroundColor: item.tabId == currentTab.id
                        && item.windowId == currentTab.windowId
                        && item.url == currentTab.url
                          ? ( isSelected
                              ? config.list_current_focus_background_color
                              : config.list_current_background_color)
                          : ( isSelected
                              ? config.list_focus_background_color
                              : config.list_background_color),
          color: item.tabId == currentTab.id
              && item.windowId == currentTab.windowId
              && item.url == currentTab.url
              ? ( isSelected
                  ? config.list_current_focus_font_color
                  : config.list_current_font_color)
              : ( isSelected
                  ? config.list_focus_font_color
                  : config.list_font_color)
        }"
        @click="$event.stopPropagation();currentIndex=index;_openWindow()">

        <span
          class="left"
          :style="{
            width: (config.item_height-20)+'px',
            height: (config.item_height-20)+'px' }">
          <el-image
            v-if="isLoad"
            :src="getIcon(item.icon, item.url, config.item_height-20)"
            style="width:100%; height: 100%;"
            fit="cover"
            :lazy="index >= config.item_show_count">
            <div slot="error" class="image-slot">
              <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
            <div slot="placeholder" class="image-slot">
              <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
            <!-- <div slot="placeholder" class="image-slot">
              <img
                v-if="index >= config.item_show_count"
                src="../assets/fallback.png"
                style="width:100%; height: 100%;" />
            </div> -->
          </el-image>
        </span>

        <div class="main">
          <div
            class="title"
            :style="{ fontSize: config.list_font_size+'px' }">{{
                item.title
            }}</div>
          <div
            class="sub-title"
            :style="{
              fontSize: config.list_explain_font_size+'px',
              color: isSelected
                    ? config.list_explain_focus_font_color
                    : config.list_explain_font_color,
              direction: isSelected ? 'rtl' : 'ltr' }">{{ item.url }}</div>
        </div>

        <div class="right">
          <div v-if="isActive
                  || (activeTabs[item.tabId]
                    && activeTabs[item.tabId].windowId == item.windowId)
                  || (storageKeyword != '' && item.lastVisitTime != undefined)">
            <div v-if="isActive">
              <i
              class="el-icon-close"
              style="font-size: 20px;cursor:pointer;border:2px solid white;border-radius:2px"
              @click.stop="deleteTab"
              :style="{
                color:config.list_focus_font_color,
                borderColor:config.list_focus_font_color}"></i>
            </div>
            <div
              v-else-if="item.tabId == currentTab.id
                      && item.windowId == currentTab.windowId
                      && item.url == currentTab.url"
              :style="{
                fontSize: config.list_state_size+'px',
                color: isSelected
                      ? config.list_current_focus_state_color
                      : config.list_current_state_color,
                borderColor: isSelected
                      ? config.list_current_focus_state_color
                      : config.list_current_state_color }">
                <span>{{ lang('currentNote') }}</span>
            </div>
            <div
              v-else-if="activeTabs[item.tabId]
                      && activeTabs[item.tabId].windowId == item.windowId
                      && activeTabs[item.tabId].url == item.url"
              :style="{
                fontSize: config.list_state_size+'px',
                color: isSelected
                    ? config.list_focus_state_color
                    : config.list_state_color }">
              {{ lang('opened') }}
            </div>
            <div
              v-else-if="storageKeyword != '' && item.lastVisitTime != undefined"
              :style="{
                fontSize: config.list_state_size+'px',
                color: isSelected
                    ? config.list_focus_state_color
                    : config.list_keymap_color }">
              {{ timeShow(item.lastVisitTime) }}
            </div>
          </div>
          <div
            v-show=" ! isActive
                  && ! (item.tabId == currentTab.id
                    && item.windowId == currentTab.windowId
                    && item.url == currentTab.url)">
            <span
              v-if="isSelected"
              :style="{
                fontSize: isSelected
                    ? config.list_state_size
                    : config.list_keymap_size+'px',
                color: isSelected
                    ? config.list_focus_keymap_color
                    : config.list_focus_keymap_color }">↩</span>
            <span
              v-else-if="platform != ''
                      && (index-$refs.list.scrollLines+1) <= config.item_show_count
                      && (index-$refs.list.scrollLines+1) >= 1
                      && (index-$refs.list.scrollLines+1) <= 9"
              :style="{
                fontSize: (activeTabs[item.tabId]
                          && activeTabs[item.tabId].windowId == item.windowId
                          && activeTabs[item.tabId].url == item.url)
                        || (storageKeyword != ''  && item.lastVisitTime != undefined)
                    ? config.list_state_size+'px'
                    : config.list_keymap_size+'px',
                color: activeTabs[item.tabId]
                    && activeTabs[item.tabId].windowId == item.windowId
                    && activeTabs[item.tabId].url == item.url
                    ? config.list_state_color
                    : config.list_keymap_color }">{{
                      platform == 'Win'
                      ?  'Alt+'+(index-$refs.list.scrollLines+1)
                      : '⌘'+(index-$refs.list.scrollLines+1)
                      }}</span>
          </div>
        </div>

      </div>
    </template>
  </list>

  </div>
</template>

<script>
import List from './List.vue'
import { nanoid } from 'nanoid'

export default {
  name: 'Note',
  inject: ['focus', 'prev', 'next'],
  props: {
    config: {
      type: Object,
      required: require,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
    },
    platform: {
      type: String,
      required: false,
      default: '',
    }
  },
  data() {
    return {
      list: [],
      cacheList: [],
      storageList: [],

      page: 0,
      scrollDisabled: true,
      storageKeyword: undefined,

      currentIndex: -1,
      currentTab: {},
      activeTabs: {},

      isInCurrentTab: false,

      isSearched: false,

      w: {
        lock: false,
        timer: null,
      },
    }
  },
  components: {
    List,
  },
  methods: {
    up() {
      this.currentIndex--;
    },
    down() {
      this.currentIndex++;
    },
    search(keyword) {
      if(keyword == undefined) return;
      if(this.storageKeyword == keyword.trim()) return;

      let isFirstSearch = this.storageKeyword == undefined;

      this.storageKeyword = keyword.trim();

      // 查找
      let filterList = this.storageList.filter(tab => {
        let title = tab.title.toUpperCase();
        let url = tab.url.toUpperCase();
        for(let keyword of this.storageKeyword.toUpperCase().split(/\s+/)) {
          if(title.indexOf(keyword) == -1 && url.indexOf(keyword) == -1) {
            return false;
          }
        }
        return true;
      })

      // 重新排序
      let currentList = filterList.filter(tab => {
        // 当前窗口需要三个条件同时满足
        return tab.tabId == this.currentTab.id
            && tab.windowId == this.currentTab.windowId
            && tab.url == this.currentTab.url;
      });
      let openedList = filterList.filter(tab => {
        // 需已打开，并且地址未变化，而且不是当前窗口
        return this.activeTabs[tab.tabId]
            && this.activeTabs[tab.tabId].url == tab.url
            && ! (tab.tabId == this.currentTab.id
                && tab.windowId == this.currentTab.windowId);
      });
      let closeList = filterList.filter(tab => {
        return ! this.activeTabs[tab.tabId]
              || this.activeTabs[tab.tabId].url != tab.url;
      });

      // 列表赋值
      this.cacheList = currentList.concat(openedList).concat(closeList);
      this.list = this.cacheList.slice(0, this.config.list_page_count);
      this.page = 1;

      this.scrollDisabled = this.list.length >= this.cacheList.length;
      if(isFirstSearch && this.isInCurrentTab && this.list.length > 1) {
        this.currentIndex = 1;
      } else {
        this.currentIndex = 0;
      }

      // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
      this.isSearched = true;
    },
    load() {
      let data = this.cacheList.slice(this.page*this.config.list_page_count, (this.page+1)*this.config.list_page_count);
      if(data.length <= 0) {
        this.scrollDisabled = true;
        return;
      }

      this.list.push(...data);
      this.page++;
      this.scrollDisabled = this.list.length >= this.cacheList.length;
    },
    add(callback) {
      // 当前标签只能有一个
      if(this.isInCurrentTab) {
        this.$message({
          type: 'warning',
          message: this.lang('noteSaved'),
          offset: 69,
          duration: 2000,
          customClass: 'window-message-box',
        });
        // 返回 true，这样会清空输入框，避免用户的一些困惑更为重要
        callback(true);

        return;
      }

      let id = nanoid();
      this.storageList.unshift({
        id: id,
        title: this.currentTab.title,
        url: this.currentTab.url,
        icon: this.currentTab.favIconUrl,
        tabId: this.currentTab.id,
        windowId: this.currentTab.windowId,
        lastVisitTime: new Date().getTime(),
      });

      // 保存数据
      chrome.storage.local.set({tabs: this.storageList}, () => {

        this.activeTabs[this.currentTab.id] = {
          id: this.currentTab.id,
          url: this.currentTab.url,
          windowId: this.currentTab.windowId,
        }
        this.isInCurrentTab = true;

        // 这样列表才会被触发更新，不能为 undefined，否则会自动选择第二项
        this.storageKeyword = ' ';

        // this.search(this.storageKeyword);
        callback(true);
      })
    },
    openWindow(index) {
      if(index == undefined) {
        this._openWindow();
        return;
      }

      let currentIndex = index+this.$refs.list.scrollLines-1;
      if(currentIndex >= this.list.length || index > this.config.item_show_count) {
        return;
      }

      this.currentIndex = currentIndex;
      this._openWindow();
    },
    _openWindow() {
      let tab = this.list[ this.currentIndex ];
      let index = this.getStorageIndex();

      // 更新时间
      this.storageList[index].lastVisitTime = new Date().getTime();

      // 标签已打开，直接切换
      if( this.activeTabs[tab.tabId]
        && this.activeTabs[tab.tabId].windowId == tab.windowId
        && this.activeTabs[tab.tabId].url == tab.url) {
        // 存储新数据（排序发生变化）
        this.storageList.unshift(this.storageList.splice(index , 1)[0]);
        chrome.storage.local.set({tabs: this.storageList}, () => {
          chrome.tabs.update(tab.tabId, { active: true }, () => {
            // 先存储，再切换
            chrome.windows.update(tab.windowId, { focused: true});
          });
        });
        return;
      }

      // 打开新标签
      new Promise(resolve => {
        // 新建标签
        chrome.tabs.create({url: tab.url, active: false}, tab => {
          resolve(tab);
        })
      }).then(tab => {
        // 更新数据
        return new Promise(resolve => {
          this.storageList[index].tabId = tab.id;
          this.storageList[index].windowId = tab.windowId;
          this.storageList.unshift(this.storageList.splice(index , 1)[0]);
          chrome.storage.local.set({tabs: this.storageList}, () => {
            resolve(tab);
          });
        })
      }).then((tab) => {
        // 激活标签
        chrome.tabs.update(tab.id, { active: true });
        // 关闭空白标签
        if(this.currentTab.url == "chrome://newtab/") {
          chrome.tabs.remove(this.currentTab.id);
        }

        // 兼容非 popup 方式的操作（过于复杂，而且也不指定对，还是算了）
        /*
        this.activeTabs[this.currentTab.id] = {
          id: tab.id,
          url: tab.url,
          windowId: tab.windowId,
        }
        this.storageKeyword = ' ';
        this.search('');//*/
      })
    },
    deleteTab() {
      let tab = this.list[ this.currentIndex ];
      let index = this.getStorageIndex();
      this.storageList.splice(index , 1);
      chrome.storage.local.set({tabs: this.storageList}, () => {
        if(tab.tabId == this.currentTab.id
        && tab.windowId == this.currentTab.windowId
        && tab.url == this.currentTab.url) {
          this.isInCurrentTab = false;
        }

        this.list.splice(this.currentIndex, 1);
        if(this.list.length < this.config.list_page_count
        && this.scrollDisabled == false) {
          this.load();
        }

        if(this.activeTabs[tab.tabId]
        && this.activeTabs[tab.tabId].url == tab.url) {
          // 如果删除的是已经打开的便签，则顺带把对应的标签页给关闭了
          chrome.tabs.remove(tab.tabId);
        }
      });

      this.focus();
    },

    getStorageIndex() {
      let tab = this.list[ this.currentIndex ];
      for(let i in this.storageList) {
        if(this.storageList[i].id == tab.id) {
          return i;
        }
      }
    }
  },
  mounted() {
    new Promise((resolve) => {
      // 获取本地数据
      chrome.storage.local.get({tabs: []}, items => {
        this.storageList = items.tabs;
        resolve()
      });
    }).then(() => {
      // 获取当前标签
      return new Promise((resolve) => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          this.currentTab = tabs[0];
          resolve()
        })
      })
    }).then(() => {
      // 处理当前标签数据

      // 判断是否存在在当前标签
      let index = -1;
      for(let i in this.storageList) {
        if(this.storageList[i].windowId == this.currentTab.windowId
          && this.storageList[i].tabId == this.currentTab.id
          && this.storageList[i].url == this.currentTab.url) {
          index = i;
          break;
        }
      }
      if(index == -1) return;

      // 标记
      // if(this.storageList.length > 1) this.currentIndex = 1; // 列表还未赋值，会被改回去
      this.isInCurrentTab = true;
    }).then(() => {
      // 获取全部标签
      return new Promise((resolve) => {
        chrome.tabs.query({}, tabs => {
          resolve(tabs)
        })
      })
    }).then((tabs) => {
      // 保存活跃的窗口
      for(let tab of tabs) {
        this.activeTabs[ tab.id ] = tab;// tab.windowId;
      }

      this.$emit('finish');

      // 更新列表
      // this.search(this.storageKeyword);
    })

//     this.$el.addEventListener("mousewheel", (event) => {
//       const eventDeltaX = -event.wheelDeltaX || event.deltaX * 3;
//       const eventDeltaY = -event.wheelDeltaY || event.deltaY * 3;

//       if(Math.abs(eventDeltaX) <= 0 || eventDeltaY != 0) {
//         // 上下滚动时睡眠，以免突然左右滚动
//         this.w.lock = true;
//         // 等上下滚动停止一段时间后才允许左右滚动
//         clearTimeout(this.w.timer);
//         this.w.timer = setTimeout(() => { this.w.lock = false; }, 100);
//         return;
//       }
// event.preventDefault();
// event.stopPropagation();
//       // 防止滚动过快，渲染速度跟不上看起来会停止，体验不好
//       if(this.w.lock == true) return;
//       this.w.lock = true;

//       eventDeltaX > 0 ? this.next() : this.prev();

//       setTimeout(() => { this.w.lock = false; }, 1000);
//     })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.item {
  /* margin: 0 11px; */
  border-top: 0;
  border-bottom: 0;
  height:100%;
  display:flex;
  align-items: center;

  /* 禁止选择 */
  -moz-user-select:none; /*火狐*/
  -webkit-user-select:none; /*webkit浏览器*/
  -ms-user-select:none; /*IE10*/
  -khtml-user-select:none; /*早期浏览器*/
  user-select:none;
}
.item .left {
  padding: 10px;
  text-align: center;
}
.item .main {
  flex: 1;
  text-align: left;
  overflow: hidden;
  cursor: default;

  height: 100%;
  display: flex;
  flex-direction: column;
  /* justify-content: space-evenly; */
  justify-content: center;
}
.item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item .sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 5px;
}
.item .right {
  /* border: 1px solid black; */
  margin-left: 10px;
  margin-right: 10px;
  font-size: 12px;
  text-align: right;

  height: 100%;
  display:flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.el-badge {
    /* margin-right: 5px; */
    border-color: inherit !important;
}
.el-badge.refresh {
    margin-left: 10px;
}


</style>
