<template>
  <div>
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
            :src="isLoad ? getIcon(item.tabs[0].icon, item.tabs[0].url, config.item_height-20) : ''"
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

        <span
          class="title"
          :style="{fontSize: config.list_font_size+'px'}">{{ item.name }}</span>

        <div class="right">
          <div v-if="isActive || item.windowId == currentWindowId || activeWindows[item.windowId]">
            <div v-if="isActive">
              <el-button
                type="success"
                icon="el-icon-folder-opened"
                circle
                @click.stop="openGroup"></el-button>
              <el-button
                type="primary"
                icon="el-icon-edit"
                circle
                @click.stop="showGroupNameDialog"></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                circle
                @click.stop="deleteGroup"></el-button>
              <el-badge
                is-dot
                class="refresh"
                v-if="isCurrentWindowChange && item.windowId == currentWindowId"
                :style="{ borderColor: config.list_current_focus_state_color } " >
                <el-button
                  type="warning"
                  icon="el-icon-refresh"
                  circle
                  @click.stop="updateGroup"></el-button>
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

  <el-dialog
    :visible.sync="groupVisible"
    :append-to-body="true"
    width="80%"
    class="group">
    <div slot="title" style="width: 100%;display:flex;">
      <el-link type="info" @click="download"><i class="el-icon-download"></i></el-link>
      <span style="margin-left: 15px;font-size: 18px; flex: 1; overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{group.name}}</span>
    </div>
    <ul
      class="group-list"
      :style="{ height: (30*config.item_show_count)+'px' }">
      <li class="group-list-item" v-for="(tab, index) in group.tabs" :key="index">

        <el-image
          :src="getIcon(tab.icon, tab.url, 20)"
          style="width:20px; height:20px;"
          fit="cover"
          lazy>
          <div slot="error" class="image-slot">
            <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
          </div>
          <div slot="placeholder" class="image-slot">
            <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
          </div>
        </el-image>

        <span class="tab-name" type="default" @click="$open(tab.url)">{{ tab.title }}</span>

      </li>
    </ul>
  </el-dialog>

  <el-dialog
    :title="lang('updateGroupName')"
    :visible.sync="groupChangeVisible"
    :append-to-body="true"
    :center="false"
    width="80%">
    <el-input
      v-model="groupName"
      :placeholder="lang('groupNameInput')"></el-input>
    <span slot="footer" class="dialog-footer">
      <el-button @click="groupChangeVisible = false">{{ lang('cancel' )}}</el-button>
      <el-button
        type="primary"
        @click="changeGroupName"
        :disabled="groupName==''">{{ lang('sure' )}}</el-button>
    </span>
  </el-dialog>

  </div>
</template>

<script>
import List from './List.vue'
import { nanoid } from 'nanoid'

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
      keyword: '',

      currentIndex: 0,
      currentWindowId: -1,
      activeWindows: {},

      isCurrentWindowChange: false,
      isInCurrentWindow: false,

      groupVisible: false,
      group: {},

      groupChangeVisible: false,
      groupName: '',
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
      if(keyword != undefined && this.keyword == keyword.trim()) return;
      if(keyword != undefined) this.keyword = keyword.trim();
      console.error('search', keyword+'|');

      // 查找
      let filterList = this.storageList.filter(group => {
        let name = group.name.toUpperCase();
        for(let keyword of this.keyword.toUpperCase().split(/\s+/)) {
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
      this.page = 1;
      this.scrollDisabled = this.cacheList.length <= this.config.list_page_count;
      if(keyword == undefined && this.isInCurrentWindow && this.list.length > 1) {
        this.currentIndex = 1;
      } else {
        this.currentIndex = 0;
      }

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
    add(callback) {
      // 当前窗口只能有一个
      if(this.isInCurrentWindow) {
        this.$message({
          type: 'warning',
          message: this.isCurrentWindowChange ? this.lang('saved2') : this.lang('saved'),
          offset: 69,
          duration: 200000,
          customClass: 'window-message-box',
        });
        return;
      }
      // 窗口名不允许为空
      if(this.keyword == '') {
        this.$message({
          type: 'warning',
          message: this.lang('emptyGroupName'),
          offset: 69,
          duration: 2000,
        });
        return;
      }
      // 窗口名不允许重复
      for(let group of this.storageList) {
        if(group.name == this.keyword) {
          this.$message({
            type: 'warning',
            message: this.lang('groupNameRepeat'),
            offset: 69,
            duration: 2000,
          });
          return;
        }
      }

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
        let currentWindowId = tabs[0].windowId;
        this.storageList.unshift({
          name: this.keyword,
          tabs: ts,
          windowId: currentWindowId,
          id: id,
        });
        console.error('add', this.storageList);
        return currentWindowId;
      }).then((currentWindowId) => {
        console.error('currentWindowId', currentWindowId)
        // 保存数据
        chrome.storage.local.set({list: this.storageList}, () => {
          this.currentWindowId = currentWindowId;
          this.activeWindows[this.currentWindowId] = true;
          this.isCurrentWindowChange = false;
          this.isInCurrentWindow = true;
          // this.search();
          callback();
        });
      })
    },
    openWindow() {
      // alert('ss')
      let group = this.list[ this.currentIndex];
      let urls = group.tabs.map(tab => tab['url']);

      // 窗口已打开，直接切换
      if(this.activeWindows[group.windowId]) {
        chrome.windows.update(group.windowId, { focused: true});

        let index = this.getStorageIndex();
        this.storageList.unshift(this.storageList.splice(index , 1)[0]);
        chrome.storage.local.set({list: this.storageList});

        return;
      }

      // 打开新窗口
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.windows.create({
          url: urls,
        }, window => {
          let index = this.getStorageIndex();
          this.storageList[index].windowId = window.id;
          this.storageList.unshift(this.storageList.splice(index , 1)[0]);
          chrome.storage.local.set({list: this.storageList});
        })

        if(tabs[0].url == "chrome://newtab/") {
          chrome.tabs.remove(tabs[0].id);
        }
      });
    },
    openGroup: function() {
      this.group = this.list[this.currentIndex];
      this.groupVisible = true;
    },
    showGroupNameDialog: function() {
      this.group = this.list[this.currentIndex];
      this.groupChangeVisible = true;
      this.groupName = this.group.name;
    },
    changeGroupName: function() {
      this.groupName = this.groupName.trim();
      // if(this.groupName == '') {
      //   this.$message({
      //     type: 'warning',
      //     message: this.lang('emptyGroupName'),
      //     offset: 12,
      //     duration: 2000,
      //   });
      //   return;
      // }

      let index = this.getStorageIndex();
      for(let i in this.storageList) {
        if(i != index && this.storageList[i].name == this.groupName) {
          this.$message({
            type: 'warning',
            message: this.lang('groupNameRepeat'),
            offset: 12,
            duration: 2000,
          });
          return;
        }
      }

      this.storageList[index].name = this.groupName;
      chrome.storage.local.set({list: this.storageList}, () => {
        this.groupChangeVisible = false;
      });
    },
    deleteGroup() {
      let group = this.list[this.currentIndex];
      this.$confirm(this.lang('deleteConfirm')+' ('+group.name+') ?', this.lang('tip'), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true,
        customClass: 'window-message-box'
      }).then(() => {
        let index = this.getStorageIndex();
        this.storageList.splice(index , 1);
        chrome.storage.local.set({list: this.storageList}, () => {
          if(group.windowId == this.currentWindowId) {
            this.isInCurrentWindow = false;
          }
          this.search();
        });
      }).catch(() => {
      });
    },
    updateGroup: function() {
      let group = this.list[this.currentIndex];
      this.$confirm(this.lang('changeConfirm')+' ('+group.name+') ?', this.lang('tip'), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true
      }).then(() => {
        chrome.tabs.query({
          currentWindow: true
        }, tabs => {
          let ts = [];
          tabs.forEach(tab => {
            ts.push({
              url: tab.url,
              title: tab.title,
              icon: tab.favIconUrl,
            });
          })

          let index = this.getStorageIndex();
          this.storageList[index].tabs = ts;
          chrome.storage.local.set({list: this.storageList}, () => {
            this.isCurrentWindowChange = false;
            // this.search();
          });
        })
      }).catch(() => {

      });
    },

    getStorageIndex() {
      let group = this.list[ this.currentIndex ];
      for(let i in this.storageList) {
        if(this.storageList[i].id == group.id) {
          return i;
        }
      }
    },
    download: function() {
      let group = this.list[this.currentIndex];
      let filename = group.name + '.tabs.html';

      let patt = /^(?!\.)[^\\\/:\*\?"<>\|]{1,250}$/;
      if( ! patt.test(filename)) {
        filename = 'InvalidGroupName.tabs.html';
      }

      chrome.runtime.sendMessage({
          filename: filename,
          tabs: group.tabs,
      });
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
        if(window.tabs[i].status == 'complete'
          && ( tabs.url != window.tabs[i].url
            || tabs.title != window.tabs[i].title
            || (window.tabs[i].favIconUrl != undefined
              && window.tabs[i].favIconUrl != ''
              && tabs.icon != window.tabs[i].favIconUrl))) {
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

      // 保存活跃的窗口
      for(let window of windows) {
        this.activeWindows[ window.id ] = true;
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