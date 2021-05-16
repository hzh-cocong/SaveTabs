<template>
  <div class="window">

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
        <div>{{ storageList.length == 0 ? lang('windowNoResult') : lang('windowNoResult2') }}</div>
        <div v-if="storageList.length > 0">{{ lang('windowCountTip')+storageList.length+lang('windowCountTip2') }}</div>
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
    :scrollbarColor="config.list_scrollbar_color"
    :scrollbarFocusColor="config.list_scrollbar_focus_color"
    v-model="currentIndex"
    ref="list"
    @load="load"
    @click.native="focus">
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
        @click="$event.stopPropagation();currentIndex=index;_openWindow()">

        <span
          class="left"
          :style="{
            width: (config.item_height-20)+'px',
            height: (config.item_height-20)+'px' }">
          <el-image
            v-if="isLoad"
            :src="getIcon(item.tabs[0].icon, item.tabs[0].url, config.item_height-20)"
            style="width:100%; height: 100%;"
            fit="cover"
            :lazy="index >= config.item_show_count">
            <div slot="error">
              <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
            <div slot="placeholder">
              <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
          </el-image>
        </span>

        <span
          class="title"
          :style="{fontSize: config.list_font_size+'px'}">{{ item.name }}</span>

        <div class="right">
          <div v-if="isActive || activeWindows[item.windowId] || (storageKeyword != '' && item.lastVisitTime != undefined)">
            <div v-if="isActive">
              <el-badge
                v-if="isCurrentWindowChange && item.windowId == currentWindowId"
                is-dot
                class="refresh"
                :style="{ borderColor: config.list_current_focus_state_color } " >
                <el-button
                  type="warning"
                  icon="el-icon-refresh"
                  circle
                  @click.stop="showDifference"></el-button>
              </el-badge>
              <el-button
                v-if="! isInCurrentWindow && ! activeWindows[item.windowId]"
                type="warning"
                icon="el-icon-refresh"
                circle
                @click.stop="showDifference"></el-button>
              <el-button
                type="success"
                icon="el-icon-folder-opened"
                circle
                @click.stop="openGroup"></el-button>
              <el-button
                type="primary"
                icon="el-icon-edit"
                circle
                @click.stop="changeGroupName"></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                circle
                @click.stop="deleteGroup"></el-button>
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
            v-show=" ! isActive && item.windowId != currentWindowId">
            <span
              v-if="isSelected"
              :style="{
                fontSize: config.list_keymap_size+'px',
                color: config.list_focus_keymap_color }">↩</span>
            <span
              v-else-if="platform != ''
                      && (index-$refs.list.scrollLines+1) <= config.item_show_count
                      && (index-$refs.list.scrollLines+1) >= 1
                      &&  (index-$refs.list.scrollLines+1) <= 9"
              :style="{
                fontSize: activeWindows[item.windowId] || (storageKeyword != ''  && item.lastVisitTime != undefined)
                    ? config.list_state_size+'px'
                    : config.list_keymap_size+'px',
                color: activeWindows[item.windowId]
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

  <el-dialog
    :visible.sync="groupVisible"
    :append-to-body="true"
    width="80%"
    class="window-group"
    @close="focus">
    <div slot="title" style="width: 100%;display:flex;">
      <!-- <el-link type="info" @click="download"><i class="el-icon-download"></i></el-link> -->
      <span style="color:gray;cursor:pointer;margin-top:4px;" @click="download"><i class="el-icon-download"></i></span>
      <span style="margin-left: 15px;font-size: 18px; flex: 1; overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        <span>{{group.name}}</span>
        <span
          style="color:hsl(0, 0%, 66%);margin-left: 20px;"
          v-if="group.tabs">{{ group.tabs.length+' '+(group.tabs.length>1?'tabs':'tab') }}</span>
      </span>
    </div>
    <ul
      class="group-list"
      :style="{ height: (30*config.item_show_count)+'px' }">
      <li
        class="group-list-item"
        v-for="(tab, index) in group.tabs"
        :key="index">

        <el-image
          :src="getIcon(tab.icon, tab.url, 20)"
          style="width:20px; height:20px;"
          fit="cover"
          lazy>
          <div slot="error">
            <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
          </div>
          <div slot="placeholder">
            <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
          </div>
        </el-image>

        <span
          class="tab-name"
          type="default"
          :title="tab.url"
          @click="$open(tab.url)">{{ tab.title }}</span>

      </li>
    </ul>
  </el-dialog>

  <el-dialog
    :visible.sync="differenceVisible"
    :append-to-body="true"
    :destroy-on-close="true"
    width="80%"
    class="window-difference"
    @opened="addCompareEvent"
    @close="focus">
    <div slot="title" style="width: 100%;display:flex;">
      <span style="color:gray;cursor:pointer;margin-top:4px;" @click="download"><i class="el-icon-refresh"></i></span>
      <span style="margin-left: 15px;font-size: 18px; flex: 1; overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        <span>{{oldGroup.name}}</span>
      </span>
    </div>
    <div class="compare">
      <div class="left">
        <div style="text-align: center;padding: 5px 0;">
          <span>旧</span>
          <span
            style="margin-left: 20px;"
            v-if="oldGroup.tabs">{{ oldGroup.tabs.length+' '+(oldGroup.tabs.length>1?'tabs':'tab') }}</span>
        </div>
        <ul
          class="group-list"
          :style="{ height: (30*(config.item_show_count <= 2 ? 1 : config.item_show_count-2)+10)+'px' }">
          <li
            class="group-list-item"
            v-for="(tab, index) in oldGroup.tabs"
            :key="index">

            <el-image
              :src="getIcon(tab.icon, tab.url, 20)"
              style="width:20px; height:20px;"
              fit="cover"
              lazy>
              <div slot="error">
                <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
              <div slot="placeholder">
                <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
            </el-image>

            <span
              class="tab-name"
              type="default"
              :title="tab.url"
              @click="$open(tab.url)">{{ tab.title }}</span>

          </li>
        </ul>
      </div>
      <div class="right">
        <div style="text-align: center;padding: 5px 0;">
          <span>新</span>
          <span
            style="margin-left: 20px;"
            v-if="currentWindow.tabs">{{ currentWindow.tabs.length+' '+(currentWindow.tabs.length>1?'tabs':'tab') }}</span>
        </div>
        <ul
          class="group-list"
          :style="{ height: (30*(config.item_show_count <= 2 ? 1 : config.item_show_count-2)+10)+'px' }">
          <li
            class="group-list-item"
            v-for="(tab, index) in currentWindow.tabs"
            :key="index">

            <el-image
              :src="getIcon(tab.favIconUrl, tab.url, 20)"
              style="width:20px; height:20px;"
              fit="cover"
              lazy>
              <div slot="error">
                <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
              <div slot="placeholder">
                <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
            </el-image>

            <span
              class="tab-name"
              type="default"
              :title="tab.url"
              @click="$active(tab.id)">{{ tab.title }}</span>

          </li>
        </ul>
      </div>
    </div>
    <span slot="footer">
      <el-button size="small" v-if="isCurrentWindowChange" style="float: left;" @click="restore">还 原</el-button>
      <el-button size="small" v-else style="float: left;" @click="bind">绑 定</el-button>
      <el-button size="small" @click="differenceVisible = false">取 消</el-button>
      <el-button type="primary" size="small" @click="updateGroup">确 定</el-button>
    </span>
  </el-dialog>

  </div>
</template>

<script>
import List from './List.vue'
import { nanoid } from 'nanoid'

export default {
  name: 'Window',
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
      currentWindowId: -1,
      activeWindows: {},

      isCurrentWindowChange: false,
      isInCurrentWindow: false,

      groupVisible: false,
      group: {},

      isSearched: false,

      lock: false,

      differenceVisible: false,
      oldGroup: {},
      currentWindow: {},
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
      let filterList = this.storageList.filter(group => {
        let name = group.name.toUpperCase();
        for(let keyword of this.storageKeyword.toUpperCase().split(/\s+/)) {
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

      this.scrollDisabled = this.list.length >= this.cacheList.length;
      // this.scrollDisabled = this.cacheList.length <= this.config.list_page_count;
      if(isFirstSearch && this.isInCurrentWindow && this.list.length > 1) {
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
    add(callback, keyword) {
      this.$prompt('', '添加', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入窗口名',
        inputValue: keyword.trim() == '' ? null : keyword.trim(),
        inputValidator: ( value ) => {
          value = value == null ? '' : value.trim();

          // 窗口名不允许为空
          if(value == '') {
            return this.lang('emptyGroupName');
          }

          // 窗口名不允许重复
          for(let group of this.storageList) {
            if(group.name == value) {
              return this.lang('groupNameRepeat');
            }
          }

          return true;
        }
      }).then(({ value }) => {
        value = value.trim();

        new Promise((resolve) => {
          // 获取当前窗口的所有标签
          chrome.tabs.query({
              currentWindow: true
          }, tabs => {
            resolve(tabs)
          })
        }).then((tabs) => {
          // 如果是已保存过并已打开（即当前窗口），则先解除当前窗口
          if(this.isInCurrentWindow) {
            // 当前窗口肯定排在第一
            this.storageList[0].windowId = -1;
          }

          // 添加数据并绑定窗口id
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
            name: value,
            tabs: ts,
            windowId: currentWindowId,
            lastVisitTime: new Date().getTime(),
            id: id,
          });
          return currentWindowId;
        }).then((currentWindowId) => {
          // 保存数据
          return new Promise((resolve) => {
            chrome.storage.local.set({list: this.storageList}, () => {
              resolve(currentWindowId)
            });
          })
        }).then((currentWindowId) => {
          // 更新结果
          this.currentWindowId = currentWindowId;
          this.activeWindows[this.currentWindowId] = true;
          this.isCurrentWindowChange = false;
          this.isInCurrentWindow = true;

          // 这样列表才会被触发更新，不能为 undefined，否则会自动选择第二项
          this.storageKeyword = ' ';

          // 调用方会自动调用 search，不用我们处理
          // this.search();
          callback(true);

          // 虽然有了默认数据，但是用户有可能把数据全清了，这个依然有用
          if(this.storageList.length == 1) {
            this.$message({
              type: 'success',
              message: this.lang('windowFirstAdd'),
              customClass: 'window-message-box',
              offset: 69,
              duration: 5000,
            });
          }
        })
      }).catch(() => {
        callback(false);
      });
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
      // alert('ss')
      let group = this.list[ this.currentIndex ];
      let urls = group.tabs.map(tab => tab['url']);
      let index = this.getStorageIndex();
      let blankTabId = -1;

      // 更新时间
      this.storageList[index].lastVisitTime = new Date().getTime();

      // 窗口已打开，直接切换
      if(this.activeWindows[group.windowId]) {
        // 存储新数据（排序发生变化）
        this.storageList.unshift(this.storageList.splice(index , 1)[0]);
        chrome.storage.local.set({list: this.storageList}, () => {
          // 先存储，再切换
          chrome.windows.update(group.windowId, { focused: true});
        });
        return;
      }

      // 打开新窗口
      new Promise(resolve => {
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
      }).then(window => {
        // 存储数据
        return new Promise(resolve => {
          this.storageList[index].windowId = window.id;
          this.storageList.unshift(this.storageList.splice(index , 1)[0]);
          chrome.storage.local.set({list: this.storageList}, () => {
            resolve(window);
          });
        })
      }).then(window => {
        // 激活窗口
        chrome.windows.update(window.id, { focused: true});

        // 关闭空白标签
        if(blankTabId != -1) {
          chrome.tabs.remove(blankTabId);
        }
      })
    },
    openGroup() {
      this.group = this.list[this.currentIndex];
      this.groupVisible = true;
    },
    changeGroupName() {
      let index = this.getStorageIndex();
      this.group = this.list[this.currentIndex];
      this.$prompt('', this.lang('updateGroupName'), {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: this.lang('groupNameInput'),
        inputValue: this.group.name,
        inputValidator: ( value ) => {
          value = value == null ? '' : value.trim();

          // 窗口名不允许为空
          if(value == '') {
            return this.lang('emptyGroupName');
          }

          // 窗口名不允许重复，自己的不算
          for(let i in this.storageList) {
            if(i != index && this.storageList[i].name == value) {
              return this.lang('groupNameRepeat');
            }
          }

          return true;
        }
      }).then(({ value }) => {
        value = value.trim();

        this.focus();

        // 未修改则不更新
        if(this.storageList[index].name == value) {
          return;
        }

        // 存储数据
        this.storageList[index].name = value;
        chrome.storage.local.set({list: this.storageList}, () => {

        });
      }).catch(() => {
        this.focus();
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
          this.list.splice(this.currentIndex, 1);
          if(this.list.length < this.config.list_page_count
          && this.scrollDisabled == false) {
            this.load();
          }
        });
        this.focus();
      }).catch(() => {
        this.focus();
      });
    },
    addCompareEvent() {
      let leftNode = document.querySelector('.compare .left .group-list');
      let rightNode = document.querySelector('.compare .right .group-list');

      leftNode.addEventListener('scroll',() => {
        rightNode.scrollTop = leftNode.scrollTop;
        rightNode.scrollLeft = leftNode.scrollLeft;
      });
      rightNode.addEventListener('scroll',() => {
        leftNode.scrollTop = rightNode.scrollTop;
        leftNode.scrollLeft = rightNode.scrollLeft;
      });
    },
    showDifference() {
      // 获取当前窗口
      chrome.windows.getCurrent({populate: true}, window => {
        console.log(window)
        this.currentWindow = window;
      })

      this.oldGroup = this.list[this.currentIndex];
      this.differenceVisible = true;
    },
    updateGroup() {
      // 更新数据
      let index = this.getStorageIndex();
      this.storageList[index].windowId = this.currentWindowId;
      this.storageList[index].lastVisitTime = new Date().getTime();
      this.storageList[index].tabs = this.currentWindow.tabs.map(tab => {
        return {
          url: tab.url,
          title: tab.title,
          icon: tab.favIconUrl,
        };
      })

      // 排到最前面
      this.storageList.unshift(this.storageList.splice(index , 1)[0]);

      // 存储数据
      chrome.storage.local.set({list: this.storageList}, () => {
        this.isCurrentWindowChange = false;

        // 更新结果（强制绑定需要这个，current update 可以不用）
        this.activeWindows[this.currentWindowId] = true;
        this.isInCurrentWindow = true;

        // 这样列表才会被触发更新，不能为 undefined，否则会自动选择第二项
        let origin = this.storageKeyword;
        this.storageKeyword = ' ';
        this.search(origin);

        // 关闭 dialog
        this.differenceVisible = false;
      })
    },
    bind() {
      // 更新数据
      let index = this.getStorageIndex();
      this.storageList[index].windowId = this.currentWindowId;
      this.storageList[index].lastVisitTime = new Date().getTime();

      // 排到最前面
      this.storageList.unshift(this.storageList.splice(index , 1)[0]);

      // 存储数据
      chrome.storage.local.set({list: this.storageList}, () => {
        // 判断当前分组是否需要更新
        this.isCurrentWindowChange = this.isDifference(this.storageList[0], this.currentWindow);

        // 更新结果（强制绑定需要这个，current update 可以不用）
        this.activeWindows[this.currentWindowId] = true;
        this.isInCurrentWindow = true;

        // 这样列表才会被触发更新，不能为 undefined，否则会自动选择第二项
        let origin = this.storageKeyword;
        this.storageKeyword = ' ';
        this.search(origin);

        // 关闭 dialog
        this.differenceVisible = false;
      })
    },
    restore() {
      // let tabIds = this.currentWindow.tabs.map(tab => {
      //   return tab.id;
      // })
      // 关闭当前所有标签页
      // 会影响撤销功能
      // chrome.tabs.remove(tabIds)

      let index = this.getStorageIndex();

      let currentTabIndex;
      for(let tab of this.currentWindow.tabs) {
        if(tab.active == true) {
          currentTabIndex = tab.index;
        }
      }





      // 获取当前所有标签页
      let currentTabIds = this.currentWindow.tabs.map(tab => {
        return tab.id;
      })
      // 获取旧的标签页地址
      let oldTabUrls = this.oldGroup.tabs.map(tab => {
        return tab.url;
      })
      console.log('ffff', this.currentWindow, this.oldGroup, currentTabIds, oldTabUrls)
      // 数据处理
      let coverTabs = currentTabIds.slice(0, oldTabUrls.length).map((tabId, index) => {
        return {
          tabId: tabId,
          url: oldTabUrls[index],
        }
      });
      let createTabUrls = oldTabUrls.slice(currentTabIds.length);
      let removeTabIds = currentTabIds.slice(oldTabUrls.length);
      console.log('eeeggg', coverTabs, createTabUrls, removeTabIds)

      // 覆盖当前标签页
      coverTabs.forEach(({tabId, url}) => {
        chrome.tabs.update(tabId, {url :url});
      })
      // 新建新的标签页
      createTabUrls.forEach((url) => {
        chrome.tabs.create({url: url, active: false});
      })
      // // 关闭多余的标签页
      // chrome.tabs.remove(removeTabIds)
      // 更新时间

      // 更新时间
      this.storageList[index].lastVisitTime = new Date().getTime();
      // 存储新数据（更新顺序）
      this.storageList.unshift(this.storageList.splice(index , 1)[0]);
      chrome.storage.local.set({list: this.storageList}, () => {
        // 先存储，再关闭多余的标签
        chrome.tabs.remove(removeTabIds)

        // 覆盖当前标签
        chrome.tabs.remove(removeTabIds)

        // 更新数据
        this.isCurrentWindowChange = false;
        // 关闭 dialog
        this.differenceVisible = false;
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
    isDifference(currentGroup, window) {
      // 判断当前分组是否需要更新
      if(currentGroup.tabs.length != window.tabs.length) {
        return true;
      }
      for(let i in currentGroup.tabs) {
        let tabs = currentGroup.tabs[i];
        if(window.tabs[i].status == 'complete'
          && ( tabs.url != window.tabs[i].url
            || tabs.title != window.tabs[i].title
            || (window.tabs[i].favIconUrl != undefined
              && window.tabs[i].favIconUrl != ''
              && tabs.icon != window.tabs[i].favIconUrl))) {
          return true;
        }
      }
      return false;
    },
    download() {
      let group = this.list[this.currentIndex];
      let filename = group.name + '.tabs.html';

      let patt = /^(?!\.)[^\\\/:\*\?"<>\|]{1,250}$/;
      if( ! patt.test(filename)) {
        filename = 'InvalidWindowName.tabs.html';
      }

      chrome.runtime.sendMessage({
          filename: filename,
          tabs: group.tabs,
      });
    },
  },
  mounted() {
    new Promise((resolve) => {
      // 获取本地数据
      chrome.storage.local.get({'list': []}, items => {
        this.storageList = items.list;
        resolve()
      });
    }).then(() => {
      // 获取当前窗口
      return new Promise((resolve) => {
        chrome.windows.getCurrent({populate: true}, window => {
          this.currentWindowId = window.id;
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
      this.isCurrentWindowChange = this.isDifference(this.storageList[index], window);
      // if(currentGroup.tabs.length != window.tabs.length) {
      //   this.isCurrentWindowChange = true;
      //   return;
      // }
      // for(let i in currentGroup.tabs) {
      //   let tabs = currentGroup.tabs[i];
      //   if(window.tabs[i].status == 'complete'
      //     && ( tabs.url != window.tabs[i].url
      //       || tabs.title != window.tabs[i].title
      //       || (window.tabs[i].favIconUrl != undefined
      //         && window.tabs[i].favIconUrl != ''
      //         && tabs.icon != window.tabs[i].favIconUrl))) {
      //     this.isCurrentWindowChange = true;
      //     break;
      //   }
      // }

      return;
    }).then(() => {
      // 获取全部窗口
      return new Promise((resolve) => {
        // 判断窗口是否已打开
        chrome.windows.getAll({}, windows => {
          resolve(windows);
        })
      })
    }).then((windows) => {
      // 保存活跃的窗口
      for(let window of windows) {
        this.activeWindows[ window.id ] = true;
      }

      this.$emit('finish');

      // 更新列表
      // this.search();
    })

    this.$el.addEventListener("mousewheel", (event) => {
      const eventDeltaX = -event.wheelDeltaX || event.deltaX * 3;
      const eventDeltaY = -event.wheelDeltaY || event.deltaY * 3;
      if(Math.abs(eventDeltaX) <= 0 || eventDeltaY != 0)
        return;

      // 防止滚动过快，渲染速度跟不上看起来会停止，体验不好
      if(this.lock == true) return;
      this.lock = true;

      eventDeltaX > 0 ? this.next() : this.prev();

      setTimeout(() => { this.lock = false; }, 1000);
    })
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
.window .el-badge {
  margin-right: 10px;
  vertical-align: inherit;
}
.window .el-badge__content {
    background-color: inherit !important;
    border-color: inherit !important;
}

.window-group .el-dialog__header {
  padding: 16px 53px 0 16px !important;
  text-align: left;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.window-group .el-dialog__body{
  padding: 10px 10px 10px 10px !important;
}
.window-group .group-list {
  padding: 0;
  margin: 0;
  overflow: auto;
  font-size: 15px;
}
.window-group .group-list-item {
  padding: 5px;
  align-items: center;
  color: black;
  list-style: none;
  display: flex;
}
.window-group .tab-name{
  font-size:14px;
  margin-left: 10px;
  cursor: pointer;
  flex: 1;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color: #4682BE;
}
.window-group .tab-name:hover {
  /* color: #409eff; */
  text-decoration: underline;
  color: #1288ff;
}

.window-difference .el-dialog__header {
  padding: 16px 53px 0 16px !important;
  text-align: left;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.window-difference .el-dialog__body{
  padding: 10px 10px 10px 10px !important;
}
.window-difference .el-dialog__footer{
  padding: 0px 10px 10px 10px !important;
}
.window-difference .compare .left,
.window-difference .compare .right {
  display: inline-block;
  padding: 0 5px;
  width: 50%;
  box-sizing: border-box;
  border: 1px solid #EBEEF5;
}
.window-difference .compare .left {
  color: hsl(0, 0%, 66%);
  border-radius: 2px 0 0 2px;
}
.window-difference .compare .right {
  /* color: black; */
  border-radius: 0px 2px 2px 0;
  border-left: 0;
}
.compare .right {
  border-left: 0;
}
.window-difference .group-list {
  padding: 0 0 10px 0;
  margin: 0;
  overflow: overlay;
  font-size: 15px;
}
.window-difference .group-list::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background: transparent;
}
.window-difference .group-list::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: rgba(127, 127, 127, .6);
}
.window-difference .group-list::-webkit-scrollbar-thumb:hover {
  border-radius: 5px;
  background-color: rgba(127, 127, 127, .9);;
}
.window-difference .group-list-item {
  padding: 5px;
  align-items: center;
  color: black;
  list-style: none;
  display: flex;
}
.window-difference .el-image{
  flex: none;
}
.window-difference .tab-name{
  font-size:14px;
  margin-left: 10px;
  padding-right: 10px;
  cursor: pointer;
  flex: 1;
  color: #606266;

  white-space:nowrap;

  /* overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap; */
}
.window-difference .tab-name:hover {
  text-decoration: underline;
  color: black;
}
.window-difference .compare .left .tab-name{
  color: hsl(0, 0%, 66%);
}
.window-difference .compare .left .tab-name:hover {
  color: #606266;
}
</style>