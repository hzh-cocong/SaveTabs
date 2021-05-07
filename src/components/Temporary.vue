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
        <div v-if="storageList.length > 0">{{ lang('temporaryNoResult') }}</div>
        <div>{{ lang('temporaryCountTip')+storageList.length+lang('temporaryCountTip2') }}</div>
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
    @load="load">
    <template #default="{ index, item, isActive, isSelected }">
      <div
        class="item"
        :style="{
          backgroundColor: isSelected
                          ? config.list_focus_background_color
                          : config.list_background_color,
          color: isSelected
                ? config.list_focus_font_color
                : config.list_font_color
        }"
        @click="currentIndex=index;_openWindow()">

        <span
          class="left"
          :style="{
            width: (config.item_height-10)+'px',
            height: (config.item_height-10)+'px' }">
          <div class="image" :style="{ height: (config.item_height-14)+'px' }">
            <div class="a" :style="{
              transform : 'scale('+config.item_height/50*1.3+', '+config.item_height/50*1.3+')'
            }">{{ item.tabs.length}}</div>
            <div class="b" :style="{
              transform : 'scale('+config.item_height/50/2+', '+config.item_height/50/2+')',
              marginTop : config.item_height > 50
                        ? ((config.item_height-50)/5) + 'px'
                        : 0,
            }">{{ lang('temporaryTabTip') }}</div>
          </div>
        </span>

        <div
          class="main"
          :style="{
            height: config.item_height+'px',
            flexDirection: ! isSelected ? 'row' : 'column',
            alignContent: ! isSelected ? 'center' : 'stretch', }">
          <template v-if="isSelected">
            <el-tag
              v-for="(tab, i) in item.tabs"
              :key="index+'.'+i"
              :title="tab.title+'\r\n'+tab.url"
              style="margin:3px 3px 0px 0px;cursor: pointer;"
              size="mini"
              :type="tabFocus[index+'|'+i] ? 'primary' : 'info'"
              :effect="'light'"
              :closable="isActive"
              :disable-transitions="true"
              :hit="false"
              @mouseover.native="$set(tabFocus, index+'|'+i, true)"
              @mouseout.native="$set(tabFocus, index+'|'+i, false)"
              @click.stop="openTab(i)"
              @close.stop="deleteTab(i)">
              <el-image
                v-if="isLoad"
                :src="getIcon(tab.icon, tab.url, 12)"
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
              <span
                class="tab-title"
                :style="{
                    width: isSelected
                        ? ( isActive ? '145px' : '57px')
                        : '140px'}">{{ tab.title || tab.url }}</span>
            </el-tag>
          </template>
          <template v-else>
            <div
            class="title"
            style="display:flex; overflow: hidden; align-items: center;"
            :style="{ fontSize: config.list_font_size+'px' }">
              <el-image
                v-if="isLoad"
                :src="getIcon(item.tabs[0].icon, item.tabs[0].url, 12)"
                fit="cover"
                :style="{ width: config.list_font_size+'px',
                          height: config.list_font_size+'px' }"
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
              <span style="margin-left: 5px;flex: 1; overflow: hidden; text-overflow: ellipsis;">{{ item.tabs[0].title || item.tabs[0].url }}</span>
            </div>
            <div
              class="sub-title"
              :style="{
                fontSize: config.list_explain_font_size+'px',
                color: isSelected
                      ? config.list_explain_focus_font_color
                      : config.list_explain_font_color }">
                {{ item.tabs[0].url }}
            </div>
          </template>
        </div>

        <div class="right">
          <div v-if="isActive">
            <i
              class="el-icon-close"
              style="font-size: 20px;cursor:pointer;border:2px solid white;border-radius:2px"
              @click.stop="deleteTemporary"
              :style="{
                color:config.list_focus_font_color,
                borderColor:config.list_focus_font_color}"></i>
          </div>
          <div v-if=" ! isActive">
            <span
              :style="{
                fontSize: config.list_state_size+'px',
                color: isSelected
                  ? config.list_focus_state_color
                  : config.list_state_color,
              }">{{ timeShow(item.lastVisitTime) }}</span>
          </div>
          <div v-if=" ! isActive">
            <span
              v-if="isSelected"
              :style="{
                fontSize: config.list_keymap_size+'px',
                color: config.list_focus_keymap_color,
              }">↩</span>
            <span
              v-else-if="platform != ''
                && (index-$refs.list.scrollLines+1) <= config.item_show_count
                && (index-$refs.list.scrollLines+1) >= 1
                && (index-$refs.list.scrollLines+1) <= 9"
              :style="{
                fontSize: config.list_keymap_size+'px',
                color: config.list_keymap_color,
              }">{{
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
  name: 'Temporary',
  inject: ['focus'],
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
      storageKeyword: null,

      currentIndex: -1,

      tabFocus: {},

      isSearched: false,
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

      this.storageKeyword = keyword.trim();

      // 查找
      let keywords = this.storageKeyword.toUpperCase().split(/\s+/);
      let filterList = this.storageList.filter(temporary => {
        for(let tab of temporary.tabs) {
          let isMath = true;
          for(let keyword of keywords) {
            // 关键词需全部匹配
            let title = tab.title.toUpperCase();
            let url = tab.url.toUpperCase();
            if(title.indexOf(keyword) == -1
            && url.indexOf(keyword) == -1) {
              isMath = false;
              break;
            }
          }
          // 只要有一个搜到就成功
          if(isMath) {
            return true;
          }
        }
        return false;
      })

      // 列表赋值
      this.cacheList = filterList;
      this.list = this.cacheList.slice(0, this.config.list_page_count);
      this.page = 1;
      this.currentIndex = 0;
      this.scrollDisabled = this.list.length >= this.cacheList.length;

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
    add() {
      let currentWindowId = -1;

      new Promise((resolve) => {
        // 获取当前窗口的所有标签
        chrome.tabs.query({
          currentWindow: true
        }, tabs => {
          resolve(tabs)
        })
      }).then((tabs) => {
        let ts = [];
        tabs.forEach(tab => {
          ts.push({
            icon: tab.favIconUrl,
            url: tab.url,
            title: tab.title,
          });
        })
        let id = nanoid();
        currentWindowId = tabs[0].windowId;
        this.storageList.unshift({
          id: id,
          windowId: currentWindowId,
          lastVisitTime: new Date().getTime(),
          tabs: ts,
        });
      }).then(() => {
        // 保存数据
        new Promise((resolve) => {
          chrome.storage.local.set({temporary: this.storageList}, () => {
            resolve();
          });
        })
      }).then(() => {
        // 关闭当前窗口
        chrome.windows.remove(currentWindowId);
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
      let temporary = this.list[ this.currentIndex ];
      let urls = temporary.tabs.map(tab => tab.url);
      let index = this.getStorageIndex();
      let blankTabId = -1;

      // 打开新窗口
      new Promise(resolve => {
        // // 获取当前窗口信息
        // chrome.windows.getCurrent({populate: true}, window => {
        //   currentWindowId = window.id;
        //   resolve()
        // })
        // 获取当前标签信息
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          // 关闭空白标签
          if(tabs[0].url == "chrome://newtab/") {
            blankTabId = tabs[0].id;
          }
          resolve();
        })
      }).then(() => {
        // 新建新窗口（先不激活，否则无法存储数据）
        return new Promise(resolve => {
          chrome.windows.create({ url: urls, focused: false }, window => {
            resolve(window)
          })
        })
      }).then((window) => {
        // 更新数据（移除该临时窗口）
        this.storageList.splice(index , 1);
        return new Promise(resolve => {
          chrome.storage.local.set({temporary: this.storageList}, () => {
            resolve(window);
          });
        })
      }).then((window) => {
        // 激活新窗口
        chrome.windows.update(window.id, { focused: true});
        // // 关闭当前窗口
        // chrome.windows.remove(currentWindowId);

        // 关闭空白标签
        if(blankTabId != -1) {
          chrome.tabs.remove(blankTabId);
        }
      })
    },
    openTab(i) {
      // 先删除标签
      let url = this.list[ this.currentIndex ].tabs[i].url;
      let index = this.getStorageIndex();
      if(this.storageList[index].tabs.length == 1) {
        this.storageList.splice(index, 1);
      } else {
        this.storageList[index].tabs.splice(i , 1);
      }
      chrome.storage.local.set({temporary: this.storageList}, () => {
        // 再打开
        this.$open(url);
      });
    },
    deleteTab(i) {
      if(this.list[ this.currentIndex ].tabs.length == 1) {
        this.deleteTemporary();
        return;
      }

      let index = this.getStorageIndex();
      this.storageList[index].tabs.splice(i , 1);
      chrome.storage.local.set({temporary: this.storageList}, () => {
      });

      this.focus();
    },
    deleteTemporary() {
      let index = this.getStorageIndex();
      this.storageList.splice(index , 1);
      chrome.storage.local.set({temporary: this.storageList}, () => {
        this.list.splice(this.currentIndex, 1);
        if(this.list.length < this.config.list_page_count
        && this.scrollDisabled == false) {
          this.load();
        }
      });

      this.focus();
    },

    getStorageIndex() {
      let temporary = this.list[ this.currentIndex ];
      for(let i in this.storageList) {
        if(this.storageList[i].id == temporary.id) {
          return i;
        }
      }
    },
  },
  mounted() {

    // 获取本地数据
    chrome.storage.local.get({temporary: []}, items => {
      this.storageList = items.temporary;

      this.$emit('finish');

      // 更新列表
      // this.search();
    });
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
}
.item .left {
  padding: 5px;
  text-align: center;
  cursor: default;
}
.item .image {
  /* background-color: #c0c4cb; */
  border-radius: 5px;
  border: 2px solid #c0c4cb;
  text-align: center;
  display: flex;
  /* box-shadow: 1px 1px 2px 2px #ebeef5; */
  flex-direction: column;
  /* justify-content: space-evenly; */
  justify-content: center;
}
.image .a {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* font-size: 16px; */
  font-size: 12px;
  /* transform : scale(16/12, 16/12); */
}
.image .b {
  overflow: hidden;
  white-space: nowrap;
  font-size: 12px;
  /* transform : scale(0.5,0.5); */
}
.item .main {
  flex: 1;
  text-align: left;
  overflow: scroll;
  cursor: default;

  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: flex-start;
  flex-wrap: wrap;

  /* display: flex;
  flex-direction: column;
  justify-content: center; */
}
.item .title {
  width: 100%;
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

.el-tag {
  display: flex;
}
.el-tag .el-image{
  width: 12px;
  height: 12px;
  margin-right: 5px;
  margin-top: 3px;
}
.el-tag .tab-title {
  display: inline-block;
  flex: 1;
  overflow: hidden;
  /* text-overflow: ellipsis;
  white-space: nowrap; */
}
</style>

<style>
.el-tag .el-icon-close {
  margin-top: 2px;
}
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