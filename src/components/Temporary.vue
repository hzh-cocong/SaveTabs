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
        <div>{{ '当前共存储 '+storageList.length+' 个临时窗口' }}</div>
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
            }">个标签</div>
          </div>
        </span>

        <div
          class="main"
          :style="{ height: (config.item_height ? config.item_height-5 : 0)+'px', margin: '2.5px 0 2.5px 0' }">
          <el-tag
            v-for="(tab, i) in item.tabs"
            :key="index+'.'+i"
            :title="tab.title+'\r\n'+tab.url"
            style="margin:0px 2.5px 2.5px 0px;cursor: pointer;"
            size="mini"
            type='info'
            :effect="isSelected ? 'light' : 'plain'"
            :closable="isActive"
            :disable-transitions="true"
            @click.stop="openTab(i)"
            @close.stop="deleteTab(i)">
            <el-image
              :src="isLoad ? getIcon(tab.icon, tab.url, 12) : ''"
              fit="cover"
              :lazy="index >= config.item_show_count">
              <div slot="error" class="image-slot" v-if="isLoad">
                <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
              <div slot="placeholder" class="image-slot" v-if="isLoad">
                <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
            </el-image>
            <span
              class="tab-title"
              :style="{
                  width: isSelected
                      ? ( isActive ? '50px' : '140px')
                      : '55px'}">{{ tab.title }}</span>
          </el-tag>
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
                && index-$refs.list.scrollLines+1 <= config.item_show_count
                && index-$refs.list.scrollLines+1 >= 1"
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
      let keywords = this.keyword.toUpperCase().split(/\s+/);
      let filterList = this.storageList.filter(temporary => {
        for(let tab of temporary.tabs) {
          let isMath = true;
          for(let keyword of keywords) {
            // 关键词需全部匹配
            if(tab.title.indexOf(keyword) == -1 && tab.url.indexOf(keyword) == -1) {
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
    add() {
      let currentWindowId = -1;

      new Promise((resolve) => {
        // 获取当前窗口的所有标签
        chrome.tabs.query({
          currentWindow: true
        }, tabs => {
          console.log('tabs', tabs);
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
        console.log('add', this.storageList);
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
      console.log('openWindow', currentIndex);

      this.currentIndex = currentIndex;
      this._openWindow();
    },
    _openWindow() {
      let temporary = this.list[ this.currentIndex ];
      let urls = temporary.tabs.map(tab => tab.url);
      let index = this.getStorageIndex();
      let currentWindowId = -1;

      // 打开新窗口
      new Promise(resolve => {
        // 获取当前窗口信息
        chrome.windows.getCurrent({populate: true}, window => {
          currentWindowId = window.id;
          resolve()
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
          chrome.storage.local.set({list: this.storageList}, () => {
            resolve(window);
          });
        })
      }).then((window) => {
        // 激活新窗口
        chrome.windows.update(window.id, { focused: true});
        // 关闭当前窗口
        chrome.windows.remove(currentWindowId);
      })
    },
    openTab(i) {
      // 先删除标签
      let url = this.list[ this.currentIndex ].tabs[i].url;
      let index = this.getStorageIndex();
      this.storageList[index].tabs.splice(i , 1);
      chrome.storage.local.set({temporary: this.storageList}, () => {
        // 再打开
        this.$open(url);
      });
    },
    deleteTab(i) {
      let index = this.getStorageIndex();
      this.storageList[index].tabs.splice(i , 1);
      chrome.storage.local.set({temporary: this.storageList}, () => {
        this.list[ this.currentIndex ].tabs.splice(i, 1);
      });
    },
    deleteTemporary() {
      let index = this.getStorageIndex();
      this.storageList.splice(index , 1);
      chrome.storage.local.set({temporary: this.storageList}, () => {
        this.list[ this.currentIndex ].splice(this.currentIndex, 1);
        if(this.list.length < this.config.list_page_count
        && this.scrollDisabled == false) {
          this.load();
        }
      });
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
    // todo
    window.t = this;
    console.log(this);

    // 获取本地数据
    chrome.storage.local.get({temporary: []}, items => {
      this.storageList = items.temporary;
      console.log('tab-list', items)
      // 更新列表
      this.search();
    });
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
  padding: 5px;
  text-align: center;
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
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;

  /* display: flex;
  flex-direction: column;
  justify-content: center; */
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