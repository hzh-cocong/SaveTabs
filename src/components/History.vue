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
                : config.list_font_color
        }"
        @click="$event.stopPropagation();currentIndex=index;_openWindow()">

        <span
          class="left"
          :style="{
            width: (config.item_height-20)+'px',
            height: (config.item_height-20)+'px' }">
          <el-image
            v-if="isLoad"
            :src="getIcon('', item.url, config.item_height-20)"
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
              index+'|'+item.type+(item.type == 'folder' ? '('+item.count+')' : '')+' | '+(item.title || item.url) }}</div>
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
          <div v-if="isActive">
            <i
              class="el-icon-close"
              style="font-size: 20px;cursor:pointer;border:2px solid white;border-radius:2px"
              @click.stop="deleteHistory(index)"
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
    }
  },
  data() {
    return {
      list: [],

      lastVisitTime: new Date().getTime(),
      startTime: 0,

      scrollDisabled: true,
      storageKeyword: null,

      currentIndex: -1,

      isSearched: false,
    }
  },
  components: {
    List,
  },
  computed: {
    currentHistory() {
      if(this.list.length == 0) return {};
      return this.list[ this.currentIndex ];
    },
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

      this.lastVisitTime = new Date().getTime();

      // 默认只展示 24 小时内的数据（体验不好）
      // this.startTime = this.storageKeyword == '' ?  new Date().getTime()-86400000 : 0;

      // 反正历史记录就不太对，不如将错就错
      this.startTime = 0;

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

        let list = [];
        let map = {};
        let lastDomain = '';
        for(let i = 0; i <= historys.length; i++) {
          let domain = i == historys.length ? '' : this.getDomain(historys[i].url);

          if(i == historys.length || (i != 0 && domain != lastDomain)) {
            let data = map[ lastDomain ];
            if(data.length == 1) {
              let file = data[0];
              file.type = 'file';
              list.push(file);
            } else {
              let folder = {
                type: 'folder',
                fold: true,
                count: data.length,

                title: data[0].title ,
                url: lastDomain,
                lastVisitTime: data[0].lastVisitTime,

                subFiles: data.map(subFile => {
                  subFile.type = 'sub-file';
                  return subFile;
                }),
              }
              list.push(folder);
            }
            delete map[ lastDomain ];

            if(i == historys.length) break;
          }

          if(map[ domain ] == undefined) {
            map[ domain ] = [ historys[i] ];
          } else {
            map[ domain ].push(historys[i]);
          }

          lastDomain = domain;
        }

        this.list = list;
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

        this.list = this.list.concat(historys);
        // this.scrollDisabled = false; // 加载前本来就是 false
      })
    },
    query(callback) {
      let max = 100; // 100

      // 查找
      chrome.history.search({
          text: this.storageKeyword,
          startTime: this.startTime,
          endTime: this.lastVisitTime,
          maxResults: max, // this.config.list_page_count, 每次尽可能查多一点，这样就可以大大减少错误结果
        }, (historys)=>{
        console.log('chrome.history.search', {
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

      // let currentIndex = index+this.$refs.list.scrollLines-1;
      // if(currentIndex >= this.list.length || index > this.config.item_show_count) {
      //   return;
      // }
      // this.currentIndex = currentIndex;
      // console.log('Kengdkeng', this.currentIndex, this.$refs.list.currentIndex);
      // setTimeout(()=>{
      //   console.log('Kengdkeng2', this.currentIndex, this.$refs.list.currentIndex);
      // },)

      this._openWindow(event);
    },
    _openWindow(event) {
      if(this.currentHistory.type.indexOf('file') != -1) {
        // 打开新标签
        this.$open(this.currentHistory.url, event);
        return;
      }

      // 展开或收起目录
      // if(this.currentHistory.type == 'folder')

      if(this.currentHistory.fold) {
        // 展开
        this.list.splice(this.currentIndex+1, 0, ...this.currentHistory.subFiles.splice(0, this.currentHistory.count));
        console.log('展开', this.list.length)

        this.$nextTick(() => {
          // 由于 currentIndex List 组件通过 $emit 调用触发的，虽然对于父组件 currentIndex 的更新是实时的，但是对于其依赖（即子组件的 currentIndex），则是被放到异步队列中执行的，因此此时子组件的 currentIndex 值依然是旧的
          if(this.$refs.list.visiualIndex+this.currentHistory.count+1 > this.config.item_show_count) {
            let index = this.config.item_show_count-this.currentHistory.count-1;
            // index = index < 0 ? 0 : index;
            console.warn('kkkk2')
            this.$refs.list.currentTo(index);
          }
        })
        // this.$refs.list.currentToTop();
      } else {
        // 收起
        this.currentHistory.subFiles = this.list.splice(this.currentIndex+1, this.currentHistory.count);
      }

      this.currentHistory.fold = ! this.currentHistory.fold;
      this.focus();
    },
    deleteHistory(index) {
      let url = this.list[index].url;
      chrome.history.deleteUrl({ url: url }, () => {
        this.list.splice(index, 1);
        if(this.list.length < this.config.list_page_count
        && this.scrollDisabled == false) {
          this.load();
        }
      })

      this.focus();
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
