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
        <div>{{ lang('historyNoResult') }}</div>
        <div>{{ lang('historyCountTip') }}</div>
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
          backgroundColor: isSelected
                          ? config.list_focus_background_color
                          : config.list_background_color,
          color: isSelected
                ? config.list_focus_font_color
                : config.list_font_color,
          marginLeft: item.count == undefined
                    ? 10+'px'
                    : 0
        }"
        @click="$event.stopPropagation();currentIndex=index;_openWindow()">

        <span
          class="left"
          :style="{
            width: (config.item_height-20)+'px',
            height: (config.item_height-20)+'px' }">
          <el-image
            v-if="isLoad"
            :src="getIcon('', item.count == undefined
                            ? item.url
                            : (
                                item.subFiles.length > 0
                              ? item.subFiles[0].url
                              : list[index+1].url
                            ), config.item_height-20)"
            style="width:100%; height: 100%;"
            fit="cover"
            :lazy="index >= config.item_show_count">
            <div slot="error" class="image-slot">
              <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
            <div slot="placeholder" class="image-slot">
              <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
          </el-image>
        </span>

        <div class="main">
          <div
            class="title"
            :style="{ fontSize: config.list_font_size+'px' }">{{
              item.count == undefined || item.count == 1
            ? (
                item.count == undefined
                ? (index + ' | ' + 'file' + ' | ' + (item.title || item.url))
                : (index + ' | ' + 'file' + ' | ' + (item.subFiles[0].title || item.subFiles[0].url))
              )
            : (
                item.subFiles.length > 0
                ? (index + ' | ' + 'folder' +'('+item.count+')'+ ' | ' + '+' + (item.subFiles[0].title || item.subFiles[0].url))
                : (index + ' | ' + 'folder' +'('+item.count+')'+ ' | ' + '-' + (list[index+1].title || list[index+1].url))
              )
            }}</div>
          <div
            class="sub-title"
            :style="{
              fontSize: config.list_explain_font_size+'px',
              color: isSelected
                    ? config.list_explain_focus_font_color
                    : config.list_explain_font_color,
              direction: isSelected ? 'rtl' : 'ltr' }">{{
                item.count == undefined || item.count == 1
              ? (
                  item.count == undefined
                  ? item.url
                  : item.subFiles[0].url
                )
              : (
                  item.subFiles.length > 0
                  ? getDomain(item.subFiles[0].url)
                  : getDomain(list[index+1].url)
                )
              }}</div>
        </div>

        <div class="right">
          <div v-if="isActive">
            <i
              class="el-icon-close"
              style="font-size: 20px;cursor:pointer;border:2px solid white;border-radius:2px"
              @click.stop="deleteHistory"
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
              }">{{
                timeShow(
                  item.count == undefined
                ? item.lastVisitTime
                : (
                    item.subFiles.length > 0
                  ? item.subFiles[0].lastVisitTime
                  : list[index+1].lastVisitTime
                ))
              }}</span>
          </div>
          <div v-if=" ! isActive">
            <span
              v-if="isSelected"
              :style="{
                fontSize: config.list_keymap_size+'px',
                color: config.list_focus_keymap_color,
              }">↩</span>
            <span
              v-else-if="_device.platform != ''
                && (index-$refs.list.scrollLines+1) <= config.item_show_count
                && (index-$refs.list.scrollLines+1) >= 1
                && (index-$refs.list.scrollLines+1) <= 9"
              :style="{
                fontSize: config.list_keymap_size+'px',
                color: config.list_keymap_color,
              }">{{
                  _device.platform == 'Win'
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

export default {
  name: 'History',
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
    },
    history: {
      type: Object,
      required: false,
      default: function() {
        return {
          date: null,
        }
      },
    }
  },
  data() {
    return {
      list: [],

      lastVisitTime: null, // new Date().getTime(),
      lastEndTime: null,
      // startTime: 0,

      scrollDisabled: true,
      storageKeyword: null,

      currentIndex: -1,

      isSearched: false,

      urlMap: {},
      lastDomain: '',
    }
  },
  components: {
    List,
  },
  watch: {
    // todo
    "history.date": function(newVal, oldVal) {
      console.log('history.date', this.history.date, newVal, oldVal);
      this.search();
    },
    "history.visible": function(newVal, oldVal) {
      console.log('history.visible', newVal, oldVal);
      this.search();
    },

    // history: {
    //   handler: function(newVal, oldVal) {


    //     console.log('have to search')
    //     console.log('history.date', JSON.stringify(newVal), JSON.stringify(oldVal))
    //   },
    //   deep: true,
    // }
  },
  computed: {
    endTime() {
      console.log('computed.endTime');
      if(this.history.date == null) {
        // return null;
        return new Date().getTime();
      } else {
        return this.history.date.getTime()+86400000-1000;
      }
    },
    startTime() {
      console.log('computed.startTime');
      if(this.history.date == null) {
        return 0;
      } else {
        return this.history.date.getTime();
      }
    },
    currentHistory() {
      if(this.list.length == 0) return {};
      return this.list[ this.currentIndex ];
    },
    currentFolderIndex() {
      // 从当前位置网上寻找父亲
      console.log('currentFolderIndex', this.currentIndex)
      let k = this.currentIndex;
      while(this.list[ k ].count == undefined) k--;
      console.log('currentFolderIndex', this.currentIndex, k, this.list[k])
      return k;
    },
    currentFolder() {
      // 从当前位置网上寻找父亲
      console.log('currentFolder', this.list[ this.currentFolderIndex ]);
      return this.list[ this.currentFolderIndex ];
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
      // 无参数时则强制刷新
      if(keyword != undefined) {
        if(this.storageKeyword == keyword.trim()) return;
        this.storageKeyword = keyword.trim();
      }

      /*
      if(keyword == undefined) return;
      if(this.storageKeyword == keyword.trim()) return;

      this.storageKeyword = keyword.trim();//*/

      console.log('search', this.storageKeyword, keyword,  this.endTime, new Date().getTime());

      if(this.lastEndTime == this.endTime) return;

      this.lastEndTime = this.endTime;
      this.lastVisitTime = this.endTime;

      // let lastVisitTime = this.history.visible && this.endTime != null ? this.endTime : new Date().getTime();
      // if(Math.abs(this.lastVisitTime-lastVisitTime) < 1000) return;

      console.log('search2', this.storageKeyword, this.lastEndTime, this.lastVisitTime);

      // this.lastVisitTime = lastVisitTime;
      // this.lastVisitTime = new Date().getTime();

      // 默认只展示 24 小时内的数据（体验不好）
      // this.startTime = this.storageKeyword == '' ?  new Date().getTime()-86400000 : 0;

      // 反正历史记录就不太对，不如将错就错
      // this.startTime = 0;

      // 查找历史
      this.query((historys) => {
        console.log('history.search', historys);
        if(historys.length == 0) {
          this.list = [];
          this.currentIndex = 0; //-1;（-1比较危险，不过bug修复后应该没问题，下个版本再思考-1的问题吧）
          this.scrollDisabled == true;

          // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
          this.isSearched = true;

          return;
        }

        this.list = [];
        this.mergeHistory(this.list, historys);
        this.currentIndex = 0;
        this.scrollDisabled = false;

        // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
        this.isSearched = true;
      })
    },
    load() {
      // 查找历史
      this.query((historys) => {
        console.log('history.load', historys);

        if(historys.length == 0) {
          this.scrollDisabled = true;
          return;
        }

        this.mergeHistory(this.list, historys);
      })
    },
    query(callback) {
      let max = 100; // todo

      // 查找
      chrome.history.search({
          text: this.storageKeyword,
          startTime: this.startTime,
          endTime: this.lastVisitTime,
          maxResults: max, // this.config.list_page_count, 每次尽可能查多一点，这样就可以大大减少错误结果
        }, (historys)=>{
        console.log('chrome.history.query', {
          text: this.storageKeyword,
          startTime: this.startTime,
          endTime: this.lastVisitTime,
          maxResults: 10, //100, // this.config.list_page_count, 每次尽可能查多一点，这样就可以大大减少错误结果
        }, historys)

        // 谷歌提供的接口返回的结果过有时候会是错误的，排序出问题容易被看出，所以我们要自己给它重新排一下
        historys = historys.sort((a, b)=>{
          return b.lastVisitTime-a.lastVisitTime;
        });

        // 这个比较特殊，这里处理结果会更准确
        // 其实当过滤完了没数据后，已经没得救了，所以还是交给别人处理吧
        // this.scrollDisabled = historys.length < max;

        if(historys.length == 0) {
          callback([]);
          return;
          // return [];
        }

        // 谷歌可能返回超出时间范围的结果，很容易被看出，这里我们给它过滤一下
        historys = historys.filter((history) => {
          return history.lastVisitTime < this.lastVisitTime;
        })

        // 过滤
        if(historys.length == 0) {
          // 糟糕，被过滤完了
          console.warn('history.loading.result.warn', this.lastVisitTime, this.timeShow(this.lastVisitTime));
          // this.lastVisitTime = this.lastVisitTime-1000*1;
          console.warn('history.loading.result.warn', this.lastVisitTime, this.timeShow(this.lastVisitTime));
          callback([]);
          return;
        }

        let lastVisitTime = Math.floor(historys[historys.length-1].lastVisitTime)-1;
        // if(this.lastVisitTime <= lastVisitTime) {
        //   // todo 没问题就注释掉这个判断
        //   // 由于比 this.lastVisitTime 大或等于的都被过滤掉了，并且如果都过滤完的话，在前面就已经返回了，不会运行到这里，所以这个理论上不能出现
        //   console.error('history.loading.result.error', this.lastVisitTime, this.timeShow(this.lastVisitTime), lastVisitTime, this.timeShow(lastVisitTime), historys);
        //   lastVisitTime = this.lastVisitTime-1000*1;
        // }
        this.lastVisitTime = lastVisitTime;

        callback(historys);
        // return history;
      })
    },

    openWindow(index, event) {
      if(index == undefined) {
        this._openWindow(event);
        return;
      }

      if( ! this.$refs.list.choice(index)) {
        return;
      }

      this._openWindow(event);
    },
    _openWindow(event) {
      console.log('chrome-extension://__MSG_@@extension_id__/background.png')
      if(this.currentHistory.count == 1) {
        // 打开新标签
        this.$open(this.currentHistory.url, event);
        return;
      }

      // 展开或收起目录
      if(this.currentHistory.subFiles.length > 0) {
        // 展开
        this.list.splice(this.currentIndex+1, 0, ...this.currentHistory.subFiles.splice(0, this.currentHistory.count));
        console.log('展开', this.list.length)

        // 由于 currentIndex List 组件通过 $emit 调用触发的，虽然对于父组件 currentIndex 的更新是实时的，但是对于其依赖（即子组件的 currentIndex），则是被放到异步队列中执行的，因此此时子组件的 currentIndex 值依然是旧的
        this.$nextTick(() => {
          if(this.$refs.list.visiualIndex+this.currentHistory.count+1 > this.config.item_show_count) {
            let index = this.config.item_show_count-this.currentHistory.count-1;
            // index = index < 0 ? 0 : index;
            console.warn('kkkk2')
            this.$refs.list.currentTo(index);
          }
          // this.$refs.list.currentToTop();
        })
      } else {
        // 收起
        this.currentHistory.subFiles = this.list.splice(this.currentIndex+1, this.currentHistory.count);
      }
      this.focus();
    },
    deleteHistory() {
      // 删除单独一条历史记录
      if(this.currentHistory.count == 1) {
        chrome.history.deleteUrl({ url: this.currentHistory.subFiles[0].url }, () => {

          this.list.splice(this.currentIndex, 1);
          // if(this.list.length < this.config.list_page_count
          // && this.scrollDisabled == false) {
          //   this.load();
          // }
        })
        return;
      }

      // 删除文件夹内的某条历史记录（肯定展开了）
      if(this.currentHistory.count == undefined) {
        chrome.history.deleteUrl({ url: this.currentHistory.url }, () => {
          if(this.currentFolder.count-1 == 1) {
            // 收起文件夹
            let index = this.currentFolderIndex+1 == this.currentIndex
                      ? this.currentFolderIndex+2  // 删除第一条
                      : this.currentFolderIndex+1; // 删除最后一条
            // 先收起
            this.currentFolder.subFiles = this.list.slice(index, index+1);
            this.currentFolder.count--;
            // 再全部移除
            this.list.splice(this.currentFolderIndex+1, 2);
          } else {
            this.currentFolder.count--;
            this.list.splice(this.currentIndex, 1);
          }
          // if(this.list.length < this.config.list_page_count
          // && this.scrollDisabled == false) {
          //   this.load();
          // }
        })

        return;
      }

      // 删除整个文件夹（未展开）
      if(this.currentHistory.count != undefined && this.currentHistory.subFiles.length != 0) {
        Promise.all(this.currentHistory.subFiles.map((history) => {
          return new Promise(resolve => {
            chrome.history.deleteUrl({ url: history.url }, () => {
              resolve()
            })
          })
        })).then(() => {
          this.list.splice(this.currentIndex, 1);
        });

        return;
      }

      // 删除整个文件夹（已展开）
      if(this.currentHistory.count != undefined && this.currentHistory.subFiles.length == 0) {
        let historys = this.list.slice(this.currentIndex+1, this.currentIndex+this.currentHistory.count+1);

        Promise.all(historys.map((history) => {
          return new Promise(resolve => {
            chrome.history.deleteUrl({ url: history.url }, () => {
              resolve()
            })
          })
        })).then(() => {
          this.list.splice(this.currentIndex, this.currentHistory.count+1);
        });

        return;
      }

      // todo
      this.focus();
    },

    mergeHistory(list, historys) {
      let k = list.length-1;
      for(let history of historys) {
        let domain = this.getDomain(history.url);
        let lastDomain = k >= 0
                      ? ( list[k].count == undefined
                        ? this.getDomain(list[k].url)
                        : this.getDomain(list[k].subFiles[0].url))
                      : '';
        if(domain == lastDomain && list[k].count == undefined) {
          // 文件夹展开的情况（一般不会遇到）
          let l = k;
          while(this.list[ l ].count == undefined) l--;
          list[l].count++;
          list[++k] = history;
        } else if(domain == lastDomain && list[k].count != undefined) {
          // 文件夹未展开
          list[k].subFiles.push(history);
          list[k].count++;
        } else {
          // 新文件夹
          list[++k] = {
            count: 1,
            subFiles: [ history ],
          }
        }
      }
      console.log('list', list)
    }
  },
  mounted() {
    // todo
    window.h = this;

    this.$emit('finish');

    // 更新列表
    // this.search();
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
