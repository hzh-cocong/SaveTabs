<template>
  <div>

  <el-alert
    type="info"
    :closable="false"
    show-icon
    v-if="list.length == 0"
    style="margin: 0 10px;"
    :style="{ width: (config.width-20)+'px' }">
    <div
      slot="title"
      style="display:flex;align-items: center;"
      :style="{ width: (config.width-70)+'px' }">
      <div style="flex:1;">
        <div>{{ '查找不到，你可以使用空格分割多个关键词进行搜索' }}</div>
        <div>{{ '当前共存储 '+storageList.length+' 个便签' }}</div>
      </div>
      <el-button circle size="mini" icon="el-icon-coffee-cup" style="margin-left: 2px !important;" @click="$open('./options.html')"></el-button>
      <el-button circle size="mini" icon="el-icon-chat-dot-square" style="margin-left: 2px !important;" @click="$open('https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno/reviews')"></el-button>
      <el-button circle size="mini" icon="el-icon-setting" style="margin-left: 2px !important;" @click="$open('./options.html')"></el-button>
    </div>
  </el-alert>

  <list
    :list="list"
    :itemHeight="config.item_height"
    :itemShowCount="config.item_show_count"
    :scrollDisabled="scrollDisabled"
    v-model="currentIndex"
    ref="list"
    @load="load">
    <template #default="{ index, item, isActive, isSelected }">
      <div
        class="item"
        :style="{
          backgroundColor: item.tabId == currentTab.id
                        && item.windowId == currentTab.windowId
                          ? ( isSelected
                              ? config.list_current_focus_background_color
                              : config.list_current_background_color)
                          : ( isSelected
                              ? config.list_focus_background_color
                              : config.list_background_color),
          color: item.tabId == currentTab.id
              && item.windowId == currentTab.windowId
              ? ( isSelected
                  ? config.list_current_focus_font_color
                  : config.list_current_font_color)
              : ( isSelected
                  ? config.list_focus_font_color
                  : config.list_font_color)
        }"
        @click="currentIndex=index;_openWindow()">

        <span
          class="left"
          :style="{
            width: (config.item_height-20)+'px',
            height: (config.item_height-20)+'px' }">
          <el-image
            :src="isLoad ? getIcon(item.icon, item.url, config.item_height-20) : ''"
            style="width:100%; height: 100%;"
            fit="cover"
            :lazy="index >= config.item_show_count">
            <div slot="error" class="image-slot" v-if="isLoad">
              <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
            <div slot="placeholder" class="image-slot" v-if="isLoad">
              <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
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
          <div v-if="isActive || activeTabs[item.tabId] == item.windowId">
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
                      && item.windowId == currentTab.windowId"
              :style="{
                fontSize: config.list_state_size+'px',
                color: isSelected
                      ? config.list_current_focus_state_color
                      : config.list_current_state_color,
                borderColor: isSelected
                      ? config.list_current_focus_state_color
                      : config.list_current_state_color }">
                <span>{{ '当前便签' }}</span>
            </div>
            <div
              v-else-if="activeTabs[item.tabId] == item.windowId"
              :style="{
                fontSize: config.list_state_size+'px',
                color: isSelected
                    ? config.list_focus_state_color
                    : config.list_state_color }">
              {{ lang('opened') }}
            </div>
          </div>
          <div
            v-show=" ! isActive
                  && ! (item.tabId == currentTab.id
                    && item.windowId == currentTab.windowId)">
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
                      && index-$refs.list.scrollLines+1 <= config.item_show_count
                      && index-$refs.list.scrollLines+1 >= 1"
              :style="{
                fontSize: activeTabs[item.tabId] == item.windowId
                    ? config.list_state_size+'px'
                    : config.list_keymap_size+'px',
                color: activeTabs[item.tabId] == item.windowId
                    ? config.list_state_color
                    : config.list_keymap_color }">{{
                      platform == 'Win'
                      ?  '⌃'+(index-$refs.list.scrollLines+1)
                      : '⌥'+(index-$refs.list.scrollLines+1)
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
      keyword: '',

      currentIndex: -1,
      currentTab: {},
      activeTabs: {},

      isInCurrentTab: false,
    }
  },
  components: {
    List,
  },
  watch: {
    scrollDisabled: function(newVal, oldVal) {
      console.log('test.scrollDisabled.load', newVal, oldVal)
    }
  },
  methods: {
    up() {
      this.currentIndex--;
    },
    down() {
      this.currentIndex++;
    },
    search(keyword) {
      if(keyword != undefined && this.keyword == keyword.trim()) return;
      if(keyword != undefined) this.keyword = keyword.trim();
      console.log('search', keyword+'|');

      // 查找
      let filterList = this.storageList.filter(tab => {
        let title = tab.title.toUpperCase();
        let url = tab.url.toUpperCase();
        for(let keyword of this.keyword.toUpperCase().split(/\s+/)) {
          if(title.indexOf(keyword) == -1 && url.indexOf(keyword) == -1) {
            return false;
          }
        }
        return true;
      })

      // 重新排序
      let currentList = filterList.filter(tab => {
        return tab.tabId == this.currentTab.id
            && tab.windowId == this.currentTab.windowId;
      });
      let openedList = filterList.filter(tab => {
        return this.activeTabs[tab.tabId]
            && ! (tab.tabId == this.currentTab.id
                && tab.windowId == this.currentTab.windowId);
      });
      let closeList = filterList.filter(tab => {
        return ! this.activeTabs[tab.tabId];
      });

      // 列表赋值
      this.cacheList = currentList.concat(openedList).concat(closeList);
      this.list = this.cacheList.slice(0, this.config.list_page_count);
      this.page = 1;

      this.scrollDisabled = this.list.length >= this.cacheList.length;
      if(keyword == undefined && this.isInCurrentTab && this.list.length > 1) {
        this.currentIndex = 1;
      } else {
        this.currentIndex = 0;
      }

      console.log('search', this.cacheList, this.config.list_page_count, this.cacheList.length <= this.config.list_page_count);
    },
    load() {
      console.log('load', this.scrollDisabled);

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
          message: '已保存',
          offset: 69,
          duration: 2000,
          customClass: 'window-message-box',
        });
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
      });

      // 保存数据
      chrome.storage.local.set({tabs: this.storageList}, () => {

        this.activeTabs[this.currentTab.id] = true;
        this.isInCurrentTab = true;

        // 这样列表才会刷新
        this.keyword = undefined;

        // this.search();
        callback();
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
      console.log('openWindow', currentIndex);

      this.currentIndex = currentIndex;
      this._openWindow();
    },
    _openWindow() {
      let tab = this.list[ this.currentIndex ];
      let index = this.getStorageIndex();

      // 标签已打开，直接切换
      if(this.activeTabs[tab.tabId] == tab.windowId) {
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
      })
    },
    deleteTab() {
      let tab = this.list[ this.currentIndex ];
      let index = this.getStorageIndex();
      this.storageList.splice(index , 1);
      chrome.storage.local.set({tabs: this.storageList}, () => {
        if(tab.tabId == this.currentTab.id
          && tab.windowId == this.currentTab.windowId) {
          this.isInCurrentTab = false;
        }
        this.list.splice(this.currentIndex, 1);
        if(this.list.length < this.config.list_page_count
        && this.scrollDisabled == false) {
          this.load();
        }
      });
    },

    getStorageIndex() {
      let tab = this.list[ this.currentIndex ];
      for(let i in this.storageList) {
        if(this.storageList[i].id == tab.id) {
          return i;
        }
      }
    },
  },
  mounted() {
    // todo
    window.n = this;

    new Promise((resolve) => {
      // 获取本地数据
      chrome.storage.local.get({tabs: []}, items => {
        this.storageList = items.tabs;
        console.log('tab-list', items)
        resolve()
      });
    }).then(() => {
      // 获取当前标签
      return new Promise((resolve) => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          this.currentTab = tabs[0];
          console.log('tab-tab', tabs[0])
          resolve(tabs[0])
        })
      })
    }).then(() => {
      // 处理当前标签数据

      // 判断是否存在在当前标签
      let index = -1;
      for(let i in this.storageList) {
        if(this.storageList[i].windowId == this.currentTab.windowId
          && this.storageList[i].tabId == this.currentTab.id) {
          index = i;
          break;
        }
      }
      console.log('tab.index', index);
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
      console.log('tabs-tabs2', tabs)

      // 保存活跃的窗口
      for(let tab of tabs) {
        this.activeTabs[ tab.id ] = tab.windowId;
      }

      // 更新列表
      this.search();
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.item {
  margin: 0 11px;
  border-top: 0;
  border-bottom: 0;
  height:100%;
  display:flex;
  align-items: center;
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

<style>
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