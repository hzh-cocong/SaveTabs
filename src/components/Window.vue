<template>
  <list
    :list="list"
    :itemHeight="config.item_height"
    :itemShowCount="config.item_show_count"
    :scrollDisabled="scrollDisabled"
    v-model="currentIndex"
    @load="load">
    <template #default="{ index, item, isActive, isSelected }">
      <div
        class="item"
        :style="{
          backgroundColor: item.windowId == currentWindowId
                          ? ( isSelected
                              ? config.list_current_focus_background_color
                              : config.list_current_background_color)
                          : ( isSelected
                              ? config.list_focus_background_color
                              : config.list_background_color),
          color: item.windowId == currentWindowId
                          ? ( isSelected
                              ? config.list_current_focus_font_color
                              : config.list_current_font_color)
                          : ( isSelected
                              ? config.list_focus_font_color
                              : config.list_font_color)
        }"
        @click="currentIndex=index;openWindow()">

        <span
          class="left"
          :style="{
            width: (config.item_height-20)+'px',
            height: (config.item_height-20)+'px' }">
          <el-image
            :src="isLoad ? getIcon(item.tabs[0].url, config.item_height-20) : ''"
            style="width:100%; height: 100%;"
            fit="cover"
            :lazy="index >= config.item_show_count">
            <div slot="error" class="image-slot" v-if="isLoad">
              <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
              <!-- <img :src="item.tabs[0].icon2" style="width:100%; height: 100%;" /> -->
            </div>
            <div
              slot="placeholder"
              v-show="isLoad"
              style="background-color:#c0c4cb;text-align:center;border-radius: 3px;color: white;">
              <i class="el-icon-loading" :style="{ fontSize: (config.item_height-20)+'px' }"></i>
            </div>
          </el-image>
        </span>

        <span
          class="title"
          :style="{fontSize: config.list_font_size+'px'}">{{ item.name }}</span>

        <div class="right">
          <div v-if="isActive || item.windowId == currentWindowId || activeWindows[item.windowId]">
            <div v-if="isActive">
              <el-button type="success" icon="el-icon-folder-opened" circle @click.stop="openGroup"></el-button>
              <el-button type="primary" icon="el-icon-edit" circle @click.stop="showGroupNameDialog"></el-button>
              <el-button type="danger" icon="el-icon-delete" circle @click.stop="deleteGroup"></el-button>
              <el-badge
                is-dot
                class="refresh"
                v-if="isCurrentWindowChange"
                :style="{ borderColor: config.list_current_focus_state_color } " >
                <el-button type="warning" icon="el-icon-refresh" circle @click.stop="updateGroup"></el-button>
              </el-badge>
            </div>
            <div
              v-else-if="item.windowId == currentWindowId"
              :style="{
                fontSize: config.list_state_size+'px',
                color: isSelected
                      ? config.list_current_focus_state_color
                      : config.list_current_state_color,
                borderColor: isSelected
                      ? config.list_current_focus_state_color
                      : config.list_current_state_color }">
              <template v-if="isCurrentWindowChange">
                <el-badge
                  :value="12"
                  is-dot>
                  <span style="margin-right: 5px;">{{ lang('currentWindow') }}</span>
                </el-badge>
              </template>
              <template v-else>
                <span>{{ lang('currentWindow') }}</span>
              </template>
            </div>
            <div
              v-else-if="activeWindows[item.windowId]"
              :style="{
                fontSize: config.list_state_size+'px',
                color: isSelected
                    ? config.list_focus_state_color
                    : config.list_state_color }">
              {{ lang('opened') }}
            </div>
          </div>
          <div
            v-show=" ! isActive && item.windowId != currentWindowId">
            <span
              v-if="isSelected"
              :style="{
                fontSize: isSelected
                    ? config.list_state_color
                    : config.list_keymap_size+'px',
                color: isSelected
                    ? config.list_focus_keymap_color
                    : config.list_focus_keymap_color }">↩</span>
            <span
              v-else
              :style="{
                fontSize: activeWindows[item.windowId]
                    ? config.list_state_size+'px'
                    : config.list_keymap_size+'px',
                color: activeWindows[item.windowId]
                    ? config.list_state_color
                    : config.list_keymap_color }">{{ '⌘'+(index+1) }}</span>
          </div>
        </div>
      </div>
    </template>
  </list>
</template>

<script>
import List from './List.vue'
// import { nanoid } from 'nanoid'

export default {
  name: 'Window',
  props: {
    config: {
      type: Object,
      required: require,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
    }
  },
  data() {
    return {
      list: [],
      cacheList: [],
      storageList: [],

      page: 0,
      scrollDisabled: false,
      keywords: '',

      currentIndex: 0,
      currentWindowId: -1,
      activeWindows: {},

      isCurrentWindowChange: false,
      isInCurrentWindow: false,
    }
  },
  components: {
    List,
  },
  methods: {
    test() {
      return true;
    },
    up() {
      this.currentIndex--;
    },
    down() {
      this.currentIndex++;
    },
    search(keywords) {
      if(this.keywords == keywords.trim()) return;
      this.keywords = keywords.trim();
      console.error('search', keywords, keywords.length);

      // 查找
      let filterList = this.storageList.filter(group => {
        let name = group.name.toUpperCase();
        for(let keyword of keywords.trim().toUpperCase().split(/\s+/)) {
          if(name.indexOf(keyword) == -1) {
            return false;
          }
        }
        return true;
      })

      // 重新排序
      let currentList = filterList.filter(group => {
        return group.windowId == this.currentWindowId;
      });
      let openedList = filterList.filter(group => {
        return this.activeWindows[group.windowId] && group.windowId != this.currentWindowId;
      });
      let closeList = filterList.filter(group => {
        return ! this.activeWindows[group.windowId];
      });

      // 列表赋值
      this.cacheList = currentList.concat(openedList).concat(closeList);
      this.list = this.cacheList.slice(0, this.config.list_page_count);
      this.currentIndex = 0;
      this.page = 1;
      this.scrollDisabled = this.cacheList.length <= this.config.list_page_count;

      console.warn('search', this.cacheList, this.config.list_page_count, this.cacheList.length <= this.config.list_page_count);
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

      if(data.length != this.config.list_page_count) {
        this.scrollDisabled = true;
      }
    },
  },
  mounted() {
    // todo
    window.w = this;

    new Promise((resolve) => {
      // 获取本地数据
      chrome.storage.local.get({'list': []}, items => {
        this.storageList = items.list;
        console.error('window-list', items)
        resolve()
      });
    }).then(() => {
      // 获取当前窗口
      return new Promise((resolve) => {
        chrome.windows.getCurrent({populate: true}, window => {
            this.currentWindowId = window.id;
            console.error('window-window', window)
            resolve(window)
        })
      })
    }).then((window) => {
      // 处理当前窗口数据

      // 判断是否存在在当前分组
      let index = -1;
      for(let i in this.storageList) {
        if(this.storageList[i].windowId == this.currentWindowId) {
          index = i;
          break;
        }
      }
      if(index == -1) return;

      // 标记
      // if(this.storageList.length > 1) this.currentIndex = 1; // 列表还未赋值，会被改回去
      this.isInCurrentWindow = true;

      // 判断当前分组是否需要更新
      let currentGroup = this.storageList[index];
      if(currentGroup.tabs.length != window.tabs.length) {
        this.isCurrentWindowChange = true;
        return;
      }
      for(let i in currentGroup.tabs) {
        let tabs = currentGroup.tabs[i];
        if(tabs.url != window.tabs[i].url
          || tabs.title != window.tabs[i].title) {
          this.isCurrentWindowChange = true;
          break;
        }
      }

      return;
    }).then(() => {
      // 获取全部窗口
      return new Promise((resolve) => {
        // 判断窗口是否已打开
        chrome.windows.getAll({}, windows => {
          console.error('window-windows', windows)
          resolve(windows);
        })
      })
    }).then((windows) => {
      console.error('window-windows2', windows)

      // 处理所有窗口数据
      let map = {}; // window.focused 不准确
      for(let window of windows) {
        map[window.id] = this.currentWindowId == window.id;
      }

      // 排序处理
      let openedList = this.storageList.filter(group => {
        if(map[ group.windowId ] != undefined && map[ group.windowId ] == false) {
          // group.isActive = true;
          this.activeWindows[ group.windowId ] = true;
          return true;
        }
        return false;
      });
      let closeList = this.storageList.filter(group => {
        if(map[ group.windowId ] == undefined) {
          // group.isActive = false;
          this.activeWindows[ group.windowId ] = false;
          return true;
        }
        return false;
      });
      let currentList = this.storageList.filter(group => {
        if(map[ group.windowId ] != undefined && map[ group.windowId ] == true) {
          // group.isActive = true;
          this.activeWindows[ group.windowId ] = true
          return true;
        }
        return false;
      });

      // 列表赋值
      this.cacheList = currentList.concat(openedList).concat(closeList);
      this.list = this.cacheList.slice(0, this.config.list_page_count);
      this.page = 1;
      if(this.cacheList.length <= this.config.list_page_count) this.scrollDisabled = true;

      // 命中第二行
      if(this.storageList.length > 1 && this.isInCurrentWindow) this.currentIndex = 1;
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
.item .title {
  /* border: 1px solid blue; */
  text-align: left;
  cursor: default;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
</style>