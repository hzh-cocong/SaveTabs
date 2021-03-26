<template>
  <div id="app" class="search">

    <div class="search-input" @mouseenter="mouseStart=true">
      <input
        type="text"
        class="el-input__inner"
        v-model.trim="keyword"
        :placeholder="lang('searchTip')"
        autofocus="autofocus"
        @keydown.down.prevent="selectDelay('down')"
        @keydown.up.prevent="selectDelay('up')"
        @keydown.enter="openWindow"
        @input="search">
      <el-button
        type="default"
        icon="el-icon-download"
        circle
        @click="add"
        :disabled="isInCurrentWindow || isGroupNameRepeat"
        :title="isInCurrentWindow
                ? lang('saved')
                : (isGroupNameRepeat ? lang('repeatTip') : '')"></el-button>
    </div>

    <ul class="search-list">
      <li
        class="search-list-item"
        :style="{
          backgroundColor: item.windowId == currentWindowId
                          ? ( index==currentIndex
                              ? config.list_current_focus_background_color
                              : config.list_current_background_color)
                          : ( index==currentIndex
                              ? config.list_focus_background_color
                              : config.list_background_color),
          color: item.windowId == currentWindowId
                          ? ( index==currentIndex
                              ? config.list_current_focus_font_color
                              : config.list_current_font_color)
                          : ( index==currentIndex
                              ? config.list_focus_font_color
                              : config.list_font_color)
        }"
        v-for="(item, index) in list"
        :key="index"
        @mouseenter="mouseStart ? (currentIndex=index,mouseEnter=true) : mouseStart=true;"
        @mouseleave="mouseEnter=false"
        @click="currentIndex=index;openWindow()">

        <el-avatar
          shape="square"
          :size="30"
          :src="fastIcon[item.id]"
          style="background:none">
          <img src="./assets/fallback.png" />
        </el-avatar>

        <span
          class="group-name"
          :style="{fontSize: config.list_font_size+'px'}">{{ item.name }}</span>

        <div v-if="mouseEnter && currentIndex==index">
          <el-button type="success" icon="el-icon-folder-opened" circle @click.stop="openGroup"></el-button>
          <el-button type="primary" icon="el-icon-edit" circle @click.stop="showGroupNameDialog"></el-button>
          <el-button type="danger" icon="el-icon-delete" circle @click.stop="deleteGroup"></el-button>
          <el-badge
            is-dot
            class="item refresh"
            v-if="isCurrentWindowChange && item.windowId == currentWindowId"
            :style="{ borderColor: config.list_current_focus_state_color } " >
            <el-button type="warning" icon="el-icon-refresh" circle @click.stop="updateGroup"></el-button>
          </el-badge>
        </div>
        <div
          v-else-if="item.windowId == currentWindowId"
          :style="{
            color: currentIndex==index
                  ? config.list_current_focus_state_color
                  : config.list_current_state_color,
            borderColor: currentIndex==index
                  ? config.list_current_focus_state_color
                  : config.list_current_state_color }"
          style="width: 65px;text-align: right;">
          <template v-if="isCurrentWindowChange">
            <el-badge
              :value="12"
              is-dot
              class="item">
              <span style="margin-right: 5px;" v-if="item.isActive">{{ lang('currentWindow') }}</span>
            </el-badge>
          </template>
          <template v-else>
            <span style="margin-right: 5px;" v-if="item.isActive">{{ lang('currentWindow') }}</span>
          </template>
        </div>
        <div
          v-else
          :style="{
            color: currentIndex==index
                ? config.list_focus_state_color
                : config.list_state_color }"
          style="width: 65px;text-align: right;">
          <span style="margin-right: 5px;" v-if="item.isActive">{{ lang('opened') }}</span>
          <span v-show="currentIndex==index">↩</span>
        </div>

      </li>
    </ul>

    <el-alert
      type="info"
      :closable="false"
      show-icon
      v-if="list.length == 0 && isLoading == false"
      style="position: relative;top: -377px;">
      <div slot="title" style="width: 444px;display:flex;align-items: center;">
        <div style="flex:1;">{{ lang('noResult') }}</div>
        <el-button circle size="mini" icon="el-icon-coffee-cup" style="margin-left: 2px !important;" @click="praiseVisible=true"></el-button>
        <el-button circle size="mini" icon="el-icon-chat-dot-square" style="margin-left: 2px !important;" @click="openTab('https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno/reviews')"></el-button>
        <el-button circle size="mini" icon="el-icon-setting" style="margin-left: 2px !important;" @click="openTab('./options.html')"></el-button>
      </div>
    </el-alert>

    <el-dialog
      :visible.sync="groupVisible"
      width="400px"
      class="group">
      <div slot="title" style="width: 100%;display:flex;">
        <el-link type="info" @click="download"><i class="el-icon-download"></i></el-link>
        <span style="margin-left: 15px;font-size: 18px; flex: 1; overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{group.name}}</span>
      </div>
      <ul class="group-list">
        <li class="group-list-item" v-for="(tab, index) in group.tabs" :key="index">

          <el-avatar shape="square" :size="20" :src="tab.icon" style="background:none">
            <img src="./assets/fallback.png" />
          </el-avatar>

          <span class="tab-name" type="default" @click="openTab(tab.url)">{{ tab.title }}</span>

        </li>
      </ul>
    </el-dialog>

    <el-dialog
      :title="lang('updateGroupName')"
      :visible.sync="groupChangeVisible"
      width="80%">
      <el-input
        v-model="groupName"
        :placeholder="lang('groupNameInput')"
        @focus="$event.target.select()"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="groupChangeVisible = false">{{ lang('cancel' )}}</el-button>
        <el-button
          type="primary"
          @click="changeGroupName"
          :disabled="groupName==''">{{ lang('sure' )}}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="lang('praise')"
      :visible.sync="praiseVisible"
      top="25px"
      width="55%"
      class="praise"
      style="overflow:hidden">
      <el-carousel height="320px" v-if="praiseVisible">
        <el-carousel-item>
          <el-card class="box-card" style="margin: 10px;">
            <img src="./assets/PayPal.png" style="width:100%;cursor: pointer;" @click="openTab('https://www.paypal.com/paypalme/hzhcocong')" />
          </el-card>
        </el-carousel-item>
        <el-carousel-item>
          <el-card class="box-card" style="margin: 10px;">
            <img src="./assets/Alipay.png" style="width:100%;" />
          </el-card>
        </el-carousel-item>
        <el-carousel-item>
          <el-card class="box-card" style="margin: 10px;">
            <img src="./assets/WeChatPay.png" style="width:100%;" />
          </el-card>
        </el-carousel-item>
      </el-carousel>
      <div style="margin: 0px auto -10px auto;text-align:center;">{{ lang('thankYou' )}}</div>
    </el-dialog>

  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import config from './config.json'

export default {
  name: 'app',
  data: () => ({
    keyword: '',
    list: [],
    storageList: [],
    currentIndex: 0,
    scrollIndex: 0,
    groupVisible: false,
    group: {},

    praiseVisible: false,

    groupChangeVisible: false,
    groupName: '',

    currentWindowId: -1,
    isCurrentWindowChange: false,
    isInCurrentWindow: false,

    mouseEnter: false,
    mouseStart: false,

    config: {},
    fastIcon: {},
    isLoading: true,

    w: {},
  }),
  methods: {
    lang: function(key) {
      return chrome.i18n.getMessage(key);
    },
    selectDelay: function(type) {
      if(this.lock == false) return;
      this.lock = setTimeout(() => {
        type == 'down' ? this.selectDown() : this.selectUp();
        this.lock = true;
      }, 1);
      this.lock = false;
    },
    selectDown:function () {
      this.currentIndex++;
      if(this.currentIndex >= this.list.length) {
        this.currentIndex=0;
        let list = document.querySelector('.search .search-list');
        list.scrollTop = 0;
      }
      if(this.currentIndex >= this.scrollIndex+7) {
        this.scrollIndex++;
        let list = document.querySelector('.search .search-list');
        list.scrollTop = list.scrollTop+54;
      }
    },
    selectUp:function () {
      this.currentIndex--;
      if(this.currentIndex < 0) {
        this.currentIndex = this.list.length-1;
        this.scrollIndex = this.list.length-7;
        let list = document.querySelector('.search .search-list');
        list.scrollTop = this.scrollIndex*54;
      }
      if(this.currentIndex < this.scrollIndex) {
        this.scrollIndex--;
        let list = document.querySelector('.search .search-list');
        list.scrollTop = list.scrollTop-54;
      }
    },

    search: function() {
      let filterList = this.storageList.filter(group => {
        let name = group.name.toUpperCase();
        for(let keyword of this.keyword.trim().toUpperCase().split(/\s+/)) {
          if(name.indexOf(keyword) == -1) {
            return false;
          }
        }
        return true;
      })

      let currentList = filterList.filter(group => {
        return group.windowId == this.currentWindowId;
      });
      let openedList = filterList.filter(group => {
        return group.isActive && group.windowId != this.currentWindowId;
      });
      let closeList = filterList.filter(group => {
        return ! group.isActive
      });
      this.list = currentList.concat(openedList).concat(closeList);

      this.currentIndex = 0;
      this.mouseStart = false;
      this.mouseEnter = false;
    },
    add: function() {
      this.keyword = this.keyword.trim();
      if(this.keyword == '') {
        this.$message({
          type: 'warning',
          message: this.lang('emptyGroupName'),
          offset: 72,
          duration: 2000,
        });
        return;
      }

      chrome.tabs.query({
          currentWindow: true
      }, tabs => {
        let ts = [];
        tabs.forEach(tab => {
          let icon = tab.favIconUrl;
          if(icon == '' || icon == undefined || icon.indexOf("chrome-extension://") > -1) {
            let res = tab.url.match(/[a-zA-z-]+:\/\/[^/]+/);
            icon = res ? "chrome://favicon/size/16@2x/"+res[0] : '';
          }

          ts.push({
            url: tab.url,
            title: tab.title,
            icon: icon,
          });
        })
        let id = nanoid();
        this.storageList.unshift({
          name: this.keyword,
          tabs: ts,
          windowId: tabs[0].windowId,
          isActive: true,
          id: id,
        });
        this.fastIcon[id] = ts[0].icon;
        chrome.storage.local.set({list: this.storageList}, () => {
          this.keyword = '';
          this.search();
          this.mouseStart = true;
          this.isCurrentWindowChange = false;
          this.isInCurrentWindow = true;
        });
      })
    },

    openWindow: function() {
      if(this.list.length == 0) return;

      let group = this.list[ this.currentIndex];
      let urls = group.tabs.map(tab => tab['url']);

      if(group.isActive) {
        chrome.windows.update(group.windowId, { focused: true});

        let index = this.getStorageIndex();
        this.storageList.unshift(this.storageList.splice(index , 1)[0]);
        chrome.storage.local.set({list: this.storageList});

        return;
      }

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
      if(this.groupName == '') {
        this.$message({
          type: 'warning',
          message: this.lang('emptyGroupName'),
            offset: 12,
          duration: 2000,
        });
        return;
      }

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
    deleteGroup: function() {
      let group = this.list[this.currentIndex];
      this.$confirm(this.lang('deleteConfirm')+' ('+group.name+') ?', this.lang('tip'), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true
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
    openTab: function(url) {
      chrome.tabs.create({
        url: url
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
          let icon = tab.favIconUrl;
            if(icon == '' || icon == undefined || icon.indexOf("chrome-extension://") > -1) {
              let res = tab.url.match(/[a-zA-z-]+:\/\/[^/]+/);
              icon = res ? "chrome://favicon/size/16@2x/"+res[0] : '';
            }

            ts.push({
              url: tab.url,
              title: tab.title,
              icon: icon,
            });
          })

          let index = this.getStorageIndex();
          this.storageList[index].tabs = ts;
          chrome.storage.local.set({list: this.storageList}, () => {
            this.search();
            this.isCurrentWindowChange = false;
          });
        })
      }).catch(() => {

      });
    },

    getStorageIndex: function() {
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

      //^(?!\.)[^\\\/:\*\?"<>\|]{1,255}$/
      // (?!\.)[^\\\/:\*\?"<>\|]{1,250}
      let patt = /^(?!\.)[^\\\/:\*\?"<>\|]{1,250}$/;
      if( ! patt.test(filename)) {
        this.$message({
          type: 'warning',
          message: this.lang('invalidGroupName'),
          offset: 72,
          duration: 2000,
        });
        return;
      }

      chrome.runtime.sendMessage({
          filename: filename,
          tabs: group.tabs,
      });

//       let href = '';
//       group.tabs.forEach(tab => {
//           href += `    <a href="${tab.url}">${tab.title}</a><br/>\n`;
//       });


//       let data = `<!DOCTYPE>
// <html>
// <head>
//     <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
//     <title>SaveTabs</title>
// </head>
// <body>
// ${href}
//     <script>
//         var res = new Object();
//         document.querySelectorAll('a').forEach(function(el){
//             var res2 = window.open(el.getAttribute('href'));
//             if(res2 == null) {
//                 res = null;
//             }
//         })
//         if(res != null) {
//             window.close()
//         };
//     `+"<\/script>\n<\/body>\n<\/html>";

//       var urlObject = window.URL || window.webkitURL || window;
//       var blob = new Blob([data], {type: "text/html"});
//       var url = urlObject.createObjectURL(blob);

//       chrome.downloads.download({
//           url: url,
//           filename: filename,
//           //saveAs: false,
//       });
    }
  },
  computed: {
    isGroupNameRepeat: function() {
      for(let group of this.storageList) {
        if(group.name == this.keyword) return true;
      }
      return false;
    }
  },
  mounted: function() {
    this.config = config;

    chrome.storage.sync.get({'config': {}}, items => {
      Object.assign(this.config, items.config);
    });

    chrome.storage.local.get({'list': []}, items => {
      this.storageList = items.list;
      // this.list = this.storageList.filter(() => true);

      if(this.storageList.length <= 3) {
        this.mouseStart = true;
      }

      chrome.windows.getCurrent({populate:true}, window => {
        this.currentWindowId = window.id;

        // 判断窗口是否已打开
        chrome.windows.getAll({}, windows => {
          let map = {}; // window.focused 不准确
          for(let window of windows) {
            map[window.id] = this.currentWindowId == window.id;
          }

          let openedList = this.storageList.filter(group => {
            if(map[ group.windowId ] != undefined && map[ group.windowId ] == false) {
              group.isActive = true;
              return true;
            }
            return false;
          });
          let closeList = this.storageList.filter(group => {
            if(map[ group.windowId ] == undefined) {
              group.isActive = false;
              return true;
            }
            return false;
          });
          let currentList = this.storageList.filter(group => {
            if(map[ group.windowId ] != undefined && map[ group.windowId ] == true) {
              group.isActive = true;
              return true;
            }
            return false;
          });
          // console.log(currentList, map);
          // this.list = currentList.concat(openedList).concat(closeList);

          let list = currentList.concat(openedList).concat(closeList);
          for(let group of list) {
            let url = group.tabs[0].url;
            let res = url.match(/[a-zA-z-]+:\/\/[^/]+/);
            let icon = res ? "chrome://favicon/size/16@2x/"+res[0] : '';
            this.fastIcon[group.id] = icon;
          }
          this.list = list;
          this.isLoading = false;
        });

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
        if(this.storageList.length > 1) this.currentIndex = 1;
        this.isInCurrentWindow = true;

        // 判断当前分组是否需要更新
        let currentGroup = this.storageList[index];
        if(currentGroup.tabs.length != window.tabs.length) {
          this.isCurrentWindowChange = true;
          return;
        }

        for(let i in currentGroup.tabs) {
          let tabs = currentGroup.tabs[i];

          if(window.tabs[i].favIconUrl != ''
            && window.tabs[i].favIconUrl != undefined
            && window.tabs[i].favIconUrl.indexOf("chrome-extension://") < 0
            && window.tabs[i].favIconUrl != tabs.icon) {
            this.isCurrentWindowChange = true;
            break;
          }

          if(tabs.url != window.tabs[i].url
            || tabs.title != window.tabs[i].title) {
            this.isCurrentWindowChange = true;
            break;
          }
        }

      });
    });

    let self=this;
    self.w.timer = null
    self.w.t2 = self.w.t1=0;
    self.w.flag=true;
    self.w.speed=100;
    document.querySelector('.search .search-list').addEventListener("scroll", function (e) {
      clearTimeout(self.w.timer);
      self.w.timer = setTimeout(function() {
        self.w.t2 = e.target.scrollTop;

        if(self.w.t2 == self.w.t1){
          if(e.target.scrollTop%54 != 0) {
            self.w.speed=1;
            if(self.w.flag) { // 向下滚动
              e.target.scrollTop += 1;
            } else {
              e.target.scrollTop -= 1;
            }
          } else {
            self.w.speed=100;
            self.scrollIndex=e.target.scrollTop/54;
            if(self.currentIndex < self.scrollIndex) self.currentIndex = self.scrollIndex;
            else if(self.currentIndex >= self.scrollIndex+7) self.currentIndex = self.scrollIndex+7-1;
          }
        }
      }, self.w.speed);

      self.w.flag = self.w.t1 < e.target.scrollTop
      self.w.t1 = e.target.scrollTop;
    })
  }
}
</script>

<style>

.search {
  width: 500px;
  padding:10px;

  /* 放第一次加载慢而闪烁 */
  height: 426px;
  overflow: hidden;
}
.search .search-input {
  display: flex;
  margin-bottom: 10px;
}
.search .search-input input {
  flex:1;
  margin-right:10px;
}
.search .search-list {
  padding: 0;
  margin: 0;
  /* max-height: 376px;
  min-height: 376px; */
  height: 376px;
  overflow: scroll;
}
.search .search-list .search-list-item {
  height: 50px;
  padding: 2px 5px;
  margin: 0;
  align-items: center;
  color: black;
  list-style: none;
  display: flex;
  overflow: hidden;
}
/* .search .search-list .search-list-item.active {
  background: #7497de;
  color: white;
} */

.group-name {
  text-align: left;
  /* color: black; */
  /* font-size: 20px; */
  margin-left: 5px;
  cursor: default;
  flex: 1;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
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
  min-height: 90px;
  max-height: 210px;
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
}

.tab-name{
  font-size:15px;
  margin-left: 10px;
  cursor: pointer;
  flex: 1;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
/* .search .search-list .search-list-item.current-window {
  background: #c0c4cc;
  color: white;
} */
/* .search .search-list .search-list-item.current-window.active {
  background: #909399;
  color: white;
} */
.el-badge__content {
    background-color: inherit;
    border-color: inherit;
}
.el-badge__content {
    background-color: inherit;
    border-color: inherit;
}
.el-badge {
    margin-right: 5px;
    border-color: inherit;
}
.el-badge.refresh {
    margin-left: 10px;
}
.praise .el-dialog__body {
  padding-top: 0;
}
</style>
