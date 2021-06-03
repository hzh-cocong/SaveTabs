<template>
  <div class="temporary">

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
    :listLength="list.length"
    :itemHeight="config.item_height"
    :itemShowCount="config.item_show_count"
    :scrollDisabled="scrollDisabled"
    :scrollbarColor="config.list_scrollbar_color"
    :scrollbarFocusColor="config.list_scrollbar_focus_color"
    :itemStyle="itemStyle"
    v-model="currentIndex"
    ref="list"
    @load="load"
    @click.native="focus"
    @itemClick="_openWindow">>
    <template #default="{ index, item, isActive, isSelected }">
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
        :class="{ scroll: isActive }"
        :style="{
          height: config.item_height+'px',

          'flex-direction': ! isSelected ? 'column' : 'column',
          'flex-wrap': ! isSelected ? 'nowrap' : 'wrap',
          'align-content': ! isSelected ? 'normal' : 'flex-start',
          'justify-content': ! isSelected ? 'space-evenly' : 'flex-start',

          }">
        <template v-if="isSelected">
          <el-tag
            v-for="(tab, i) in item.tabs"
            :key="i"
            :title="tab.title+'\r\n'+tab.url"
            :style="{ height: tagConfig.tag_font_size+'px',
                      width: 'calc(100% / '+(storageKeyword == '' || item.tabs.length > tagConfig.tag_line_count ? tagConfig.tag_line_count : item.tabs.length)
                                            +' - '+(tagConfig.tag_padding_left*2+1*2+tagConfig.tag_margin_right)+'px)',
                      margin: tagConfig.tag_margin_top+'px '
                            + tagConfig.tag_margin_right+'px 0px 0px',
                      padding: tagConfig.tag_padding_top+'px '
                              +tagConfig.tag_padding_left+'px' }"
            :type="tabFocus[index+'|'+i] ? 'primary' : 'info'"
            :effect="'light'"
            :closable="isActive"
            :disable-transitions="true"
            :hit="false"
            @mouseover.native="$set(tabFocus, index+'|'+i, true)"
            @mouseout.native="$set(tabFocus, index+'|'+i, false)"
            @click.stop="openTab(i, $event)"
            @close.stop="deleteTab(i)">
            <el-image
              v-if="isLoad"
              :src="getIcon(tab.icon, tab.url, tagConfig.tag_font_size)"
              :style="{ width: tagConfig.tag_font_size+'px',
                        height: tagConfig.tag_font_size+'px',
                        marginRight: tagConfig.tag_padding_left+'px' }"
              fit="cover"
              :lazy="false">
              <div slot="error" class="image-slot">
                <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
              <div slot="placeholder" class="image-slot">
                <!-- <img src="../assets/fallback.png" style="width:100%; height: 100%;" /> -->
              </div>
            </el-image>
            <span
              class="tab-title"
              :style="{ fontSize: tagConfig.tag_font_size+'px',
                        width: 'calc(100% - '
                              +( tagConfig.tag_font_size+tagConfig.tag_padding_left*1
                                + (isActive ? 20 : 0) )
                              +'px' }">{{ tab.title || tab.url }}</span>
          </el-tag>
        </template>
        <template v-else>
          <div
          class="title"
          style="display:flex; overflow: hidden; align-items: center;"
          :style="{ fontSize: config.list_font_size+'px' }">
            <el-image
              v-if="isLoad"
              :src="iconMap[index]"
              fit="cover"
              :style="{ width: config.list_font_size+'px',
                        height: config.list_font_size+'px' }"
              lazy>
              <div slot="error" class="image-slot">
                <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
              <div slot="placeholder" class="image-slot">
                <!-- <img src="../assets/fallback.png" style="width:100%; height: 100%;" /> -->
              </div>
            </el-image>
            <span style="margin-left: 5px;flex: 1; overflow: hidden; text-overflow: ellipsis;">{{ item.tabs[0].title || item.tabs[0].url }}</span>
          </div>
          <div
            class="sub-title"
            :style="{
              fontSize: config.list_explain_font_size+'px',
              color: isSelected
                    ? config.list_explain_focus_font_color
                    : config.list_explain_font_color,
              marginLeft: (config.list_font_size+5)+'px' }">
              {{ getDomain(item.tabs[0].url) }}
          </div>
        </template>
      </div>

      <div
        class="right"
        :style="{ marginLeft: isActive ? '5px' : '10px' }">
        <div v-if="isActive">
          <i
            class="el-icon-copy-document"
            :style="{
              color:config.list_focus_font_color,
              borderColor:config.list_focus_font_color}"></i>
          <i
            class="el-icon-close"
            @click.stop="deleteTemporary"
            :style="{
              color:config.list_focus_font_color,
              borderColor:config.list_focus_font_color}"></i>
        </div>
        <template v-if=" ! isActive">
          <span
            :style="{
              fontSize: config.list_state_size+'px',
              color: isSelected
                ? config.list_focus_state_color
                : config.list_state_color,
            }">{{ timeShow(item.lastVisitTime) }}</span>
        </template>
        <template v-if=" ! isActive">
          <span
            v-if="isSelected"
            :style="{
              fontSize: config.list_keymap_size+'px',
              color: config.list_focus_keymap_color,
            }">↩</span>
          <span
            v-else-if="_device.platform != ''
              && (index-$refs.list.scrollLines+1) <= 9"
            :style="{
              fontSize: config.list_keymap_size+'px',
              color: config.list_keymap_color,
            }">{{
                (_device.platform == 'Mac' ? '⌘' : 'Alt+')
              + ( 1 > index-$refs.list.scrollLines+1
                ? 1
                : (index-$refs.list.scrollLines+1 > config.item_show_count
                  ? config.item_show_count
                  : index-$refs.list.scrollLines+1)
                )
              }}</span>
        </template>
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

      scrollDisabled: true,
      storageKeyword: null,

      currentIndex: -1,

      isSearched: false,

      tabFocus: {},
    }
  },
  components: {
    List,
  },
  computed: {
    iconMap() {
      console.log('getIcon:iconMap');
      let a = new Date().getTime();

      let ss = this.list.map((item, index) => {
        return this.getIcon(item.tabs[0].icon, item.tabs[0].url, this.config.list_font_size);
      })
      let b = new Date().getTime();
      console.log('getIcon:iconMap', (b-a)/1000);

      return ss;
    },

    // 行数尽可能多，字体尽可能大
    tagConfig() {
      let item_height = this.config.item_height;
      let border = 1; // 上下左右

      let tag_margin_top_min = 3;
      // let tag_margin_right_min = 3; // 和 tag_margin_top_min 相同
      // let tag_padding_min = 3; // 和 tag_margin_top_min 相同
      let tag_font_size_min = 12;
      let tag_row_count_min = 1;
      // let tag_line_count_min = 1;

      let tag_margin_top_max = 10;
      // let tag_margin_right_max = 10; // 同上
      // let tag_padding_max = 3; // 同上
      let tag_font_size_max = this.config.list_font_size;
      // let tag_row_count_min = 0; // 不限制
      // let tag_line_count_max = 0; // 不限制

      // 使用从小变大的原则，以下是变化顺序
      // tag_line_count
      // tag_font_size
      // tag_margin_top
      // adjust （反计算得出）

      // 提示
      //item_height = tag_row_count*(tag_font_size+tag_padding_top*2+tag_margin_top+border*2)+tag_margin_top
      //item_height = tag_row_count*(tag_font_size+tag_margin_top*3+border*2)+tag_margin_top
      //tag_margin_top=(item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count)
      //tag_padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2
      //tag_margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count)

      // tag_row_count_min
      let tag_row_count = tag_row_count_min;
      let row_count = Math.floor((item_height-tag_margin_top_min)/(tag_margin_top_min*3+tag_font_size_min+border*2));
      if(row_count > tag_row_count_min) {
        tag_row_count = row_count;
      }
console.log('oooooooooooo', tag_row_count, (item_height-tag_margin_top_min)/(tag_margin_top_min*3+tag_font_size_min+border*2))
console.log('oooooooo2', 3*(tag_font_size_min+tag_margin_top_min*3+border*2)+tag_margin_top_min);
      // tag_font_size
      let tag_font_size = tag_font_size_min;
      let font_size = (item_height-tag_margin_top_min)/tag_row_count-tag_margin_top_min*3-border*2;
      if(font_size > tag_font_size_min) {
        tag_font_size = font_size >= tag_font_size_max ? tag_font_size_max : font_size;
      }

      // tag_margin_top
      let tag_margin_top = tag_margin_top_min;
      let margin_top = (item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count);
      if(margin_top > tag_margin_top_min) {
        tag_margin_top = margin_top >= tag_margin_top_max ? tag_margin_top_max : margin_top;
      }

      let tag_padding_top = tag_margin_top;

      // 提示
      //item_height = tag_row_count*(tag_font_size+tag_padding_top*2+tag_margin_top+border*2)+tag_margin_top
      //item_height = tag_row_count*(tag_font_size+tag_margin_top*3+border*2)+tag_margin_top
      //tag_margin_top=(item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count)
      //tag_padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2
      //tag_margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count)

      let height = (tag_margin_top*3+tag_font_size+border*2)*tag_row_count+tag_margin_top;
      if(height < item_height) {
        console.log('tagConfig 有剩余空间', {height, item_height, tag_row_count, tag_font_size, tag_margin_top})

        // 和 字体 优先不同，这里由于是按 tag_row_count 优先计算，其它值都是最小的了，如果再强塞一个，会导致它们被强制缩小
        // tag_row_count++;

        // 由于没有强制添加行，所以这里其实是放大

        // 先放大 tag_font_size
        let font_size = (item_height-tag_margin_top)/tag_row_count-tag_margin_top*3-border*2;
        tag_font_size = font_size >= tag_font_size_max ? tag_font_size_max : font_size;

        if(tag_font_size != font_size) {

          // 再放大 tag_margin_top
          margin_top = (item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count);
          tag_margin_top = margin_top >= tag_margin_top_max ? tag_margin_top_max : margin_top;
          tag_padding_top = tag_margin_top;

          if(tag_margin_top != margin_top) {

            // 强制缩小 tag_padding_top 直到 1
            let padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2;
            tag_padding_top = padding_top <= 1 ? 1 : padding_top;
            console.error('强制缩小 tag_padding_top 直到 1', tag_padding_top)

            if(tag_padding_top != padding_top) {
              // 强制缩小 tag_margin_top 直到 1
              margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count);
              tag_margin_top = margin_top <= 1 ? 1 : margin_top;
              console.error('强制缩小 tag_margin_top 直到 1', tag_margin_top)

              if(tag_margin_top != margin_top) {
                console.error('tagConfig 我尽力了');
              }
            }
          }
        }
      } else if(height > item_height) {
        console.log('tagConfig 空间不够', {height, item_height, tag_row_count, tag_font_size, tag_margin_top})
alert('空间不够')
        // 空间不够，此时全部值都应该是最小值

        // 强制缩小 tag_padding_top 直到 1
        let padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2;
        tag_padding_top = padding_top <= 1 ? 1 : padding_top;
        console.error('强制缩小 tag_padding_top 直到 1', tag_padding_top)

        if(tag_padding_top != padding_top) {
          // 强制缩小 tag_margin_top 直到 1
          margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count);
          tag_margin_top = margin_top <= 1 ? 1 : margin_top;
          console.error('强制缩小 tag_margin_top 直到 1', tag_margin_top)

          if(tag_margin_top != margin_top) {
            console.error('tagConfig 我尽力了');
          }
        }
      } else {
        // 相等则说明找到了合适的值
        console.log('tagConfig 值完全合适', {height, item_height, tag_row_count, tag_font_size, tag_margin_top})
        // alert('值完全合适')
      }

      console.log('tagConfig 上下计算结果', tag_row_count, tag_font_size, tag_margin_top, tag_padding_top)

      // 开放给用户设置
      let tag_line_count = this.config.tag_line_count;

      let tag_margin_right = tag_margin_top;
      let tag_padding_left = tag_margin_top;

      console.log('tagConfig 最后结果', {
        tag_row_count,
        tag_line_count,

        tag_font_size,

        tag_margin_top,
        tag_margin_right,

        tag_padding_top,
        tag_padding_left,

        height: (tag_padding_top*2+tag_font_size)+'px',
        width: 'calc(100% / '+tag_line_count+' - '+(tag_padding_left*2+1*2+tag_margin_right)+'px)',
        margin: tag_margin_top+'px '
              + tag_margin_right+'px 0px 0px',
        padding: tag_padding_top+'px '
                +tag_padding_left+'px',

        item_height: tag_row_count*(tag_font_size+tag_padding_top*2+tag_margin_top+border*2)+tag_margin_top,
      })

      return {
        tag_row_count,
        tag_line_count,

        tag_font_size,

        tag_margin_top,
        tag_margin_right,

        tag_padding_top,
        tag_padding_left,
      }
    },



//     // 行数尽可能多
//     tagConfig() {
//       let item_height = this.config.item_height;
//       let border = 1; // 上下左右

//       let tag_margin_top_min = 3;
//       // let tag_margin_right_min = 3; // 和 tag_margin_top_min 相同
//       // let tag_padding_min = 3; // 和 tag_margin_top_min 相同
//       let tag_font_size_min = 12;
//       let tag_row_count_min = 1;
//       // let tag_line_count_min = 1;

//       let tag_margin_top_max = 10;
//       // let tag_margin_right_max = 10; // 同上
//       // let tag_padding_max = 3; // 同上
//       let tag_font_size_max = this.config.list_font_size;
//       // let tag_row_count_min = 0; // 不限制
//       // let tag_line_count_max = 0; // 不限制

//       // 使用从小变大的原则，以下是变化顺序
//       // tag_line_count
//       // tag_font_size
//       // tag_margin_top
//       // adjust （反计算得出）

//       // 提示
//       //item_height = tag_row_count*(tag_font_size+tag_padding_top*2+tag_margin_top+border*2)+tag_margin_top
//       //item_height = tag_row_count*(tag_font_size+tag_margin_top*3+border*2)+tag_margin_top
//       //tag_margin_top=(item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count)
//       //tag_padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2
//       //tag_margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count)

//       // tag_row_count_min
//       let tag_row_count = tag_row_count_min;
//       let row_count = Math.floor((item_height-tag_margin_top_min)/(tag_margin_top_min*3+tag_font_size_min+border*2));
//       if(row_count > tag_row_count_min) {
//         tag_row_count = row_count;
//       }
// console.log('oooooooooooo', tag_row_count, (item_height-tag_margin_top_min)/(tag_margin_top_min*3+tag_font_size_min+border*2))
// console.log('oooooooo2', 3*(tag_font_size_min+tag_margin_top_min*3+border*2)+tag_margin_top_min);
//       // tag_font_size
//       let tag_font_size = tag_font_size_min;
//       let font_size = (item_height-tag_margin_top_min)/tag_row_count-tag_margin_top_min*3-border*2;
//       if(font_size > tag_font_size_min) {
//         tag_font_size = font_size >= tag_font_size_max ? tag_font_size_max : font_size;
//       }

//       // tag_margin_top
//       let tag_margin_top = tag_margin_top_min;
//       let margin_top = (item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count);
//       if(margin_top > tag_margin_top_min) {
//         tag_margin_top = margin_top >= tag_margin_top_max ? tag_margin_top_max : margin_top;
//       }

//       let tag_padding_top = tag_margin_top;

//       // 提示
//       //item_height = tag_row_count*(tag_font_size+tag_padding_top*2+tag_margin_top+border*2)+tag_margin_top
//       //item_height = tag_row_count*(tag_font_size+tag_margin_top*3+border*2)+tag_margin_top
//       //tag_margin_top=(item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count)
//       //tag_padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2
//       //tag_margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count)

//       let height = (tag_margin_top*3+tag_font_size+border*2)*tag_row_count+tag_margin_top;
//       if(height < item_height) {
//         console.log('tagConfig 有剩余空间', {height, item_height, tag_row_count, tag_font_size, tag_margin_top})

//         // 和 字体 优先不同，这里由于是按 tag_row_count 优先计算，其它值都是最小的了，如果再强塞一个，会导致它们被强制缩小
//         // tag_row_count++;

//         // 由于没有强制添加行，所以这里其实是放大

//         // 先放大 tag_margin_top
//         margin_top = (item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count);
//         tag_margin_top = margin_top <= tag_margin_top_min ? tag_margin_top_min : margin_top;
//         tag_padding_top = tag_margin_top;

//         if(tag_margin_top != margin_top) {
//           // 再放大 tag_font_size
//           let font_size = (item_height-tag_margin_top)/tag_row_count-tag_margin_top*3-border*2;
//           tag_font_size = font_size <= tag_font_size_min ? tag_font_size_min : font_size;

//           if(tag_font_size != font_size) {
//             // 强制缩小 tag_padding_top 直到 1
//             let padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2;
//             tag_padding_top = padding_top <= 1 ? 1 : padding_top;
//             console.error('强制缩小 tag_padding_top 直到 1', tag_padding_top)

//             if(tag_padding_top != padding_top) {
//               // 强制缩小 tag_margin_top 直到 1
//               margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count);
//               tag_margin_top = margin_top <= 1 ? 1 : margin_top;
//               console.error('强制缩小 tag_margin_top 直到 1', tag_margin_top)

//               if(tag_margin_top != margin_top) {
//                 console.error('tagConfig 我尽力了');
//               }
//             }
//           }
//         }
//       } else if(height > item_height) {
//         console.log('tagConfig 空间不够', {height, item_height, tag_row_count, tag_font_size, tag_margin_top})
// alert('空间不够')
//         // 空间不够，此时全部值都应该是最小值

//         // 强制缩小 tag_padding_top 直到 1
//         let padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2;
//         tag_padding_top = padding_top <= 1 ? 1 : padding_top;
//         console.error('强制缩小 tag_padding_top 直到 1', tag_padding_top)

//         if(tag_padding_top != padding_top) {
//           // 强制缩小 tag_margin_top 直到 1
//           margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count);
//           tag_margin_top = margin_top <= 1 ? 1 : margin_top;
//           console.error('强制缩小 tag_margin_top 直到 1', tag_margin_top)

//           if(tag_margin_top != margin_top) {
//             console.error('tagConfig 我尽力了');
//           }
//         }
//       } else {
//         // 相等则说明找到了合适的值
//         console.log('tagConfig 值完全合适', {height, item_height, tag_row_count, tag_font_size, tag_margin_top})
//         // alert('值完全合适')
//       }

//       console.log('tagConfig 上下计算结果', tag_row_count, tag_font_size, tag_margin_top, tag_padding_top)

//       // 开放给用户设置
//       let tag_line_count = this.config.tag_line_count;

//       let tag_margin_right = tag_margin_top;
//       let tag_padding_left = tag_margin_top;

//       console.log('tagConfig 最后结果', {
//         tag_row_count,
//         tag_line_count,

//         tag_font_size,

//         tag_margin_top,
//         tag_margin_right,

//         tag_padding_top,
//         tag_padding_left,

//         height: (tag_padding_top*2+tag_font_size)+'px',
//         width: 'calc(100% / '+tag_line_count+' - '+(tag_padding_left*2+1*2+tag_margin_right)+'px)',
//         margin: tag_margin_top+'px '
//               + tag_margin_right+'px 0px 0px',
//         padding: tag_padding_top+'px '
//                 +tag_padding_left+'px',

//         item_height: tag_row_count*(tag_font_size+tag_padding_top*2+tag_margin_top+border*2)+tag_margin_top,
//       })

//       return {
//         tag_row_count,
//         tag_line_count,

//         tag_font_size,

//         tag_margin_top,
//         tag_margin_right,

//         tag_padding_top,
//         tag_padding_left,
//       }
//     },


// 字体尽可能大
//     tagConfig() {
//       let item_height = this.config.item_height;
//       let border = 1; // 上下左右

//       let tag_margin_top_min = 3;
//       // let tag_margin_right_min = 3; // 和 tag_margin_top_min 相同
//       // let tag_padding_min = 3; // 和 tag_margin_top_min 相同
//       let tag_font_size_min = 12;
//       let tag_row_count_min = 1;
//       // let tag_line_count_min = 1;

//       let tag_margin_top_max = 10;
//       // let tag_margin_right_max = 10; // 同上
//       // let tag_padding_max = 3; // 同上
//       let tag_font_size_max = this.config.list_font_size;
//       // let tag_row_count_min = 0; // 不限制
//       // let tag_line_count_max = 0; // 不限制

//       // 使用从小变大的原则，以下是变化顺序
//       // tag_font_size
//       // tag_margin_top
//       // tag_line_count
//       // adjust （反计算得出）

//       // 提示
//       //item_height = tag_row_count*(tag_font_size+tag_padding_top*2+tag_margin_top+border*2)+tag_margin_top
//       //item_height = tag_row_count*(tag_font_size+tag_margin_top*3+border*2)+tag_margin_top
//       //tag_margin_top=(item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count)
//       //tag_padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2
//       //tag_margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count)

//       // tag_font_size
//       let tag_font_size = tag_font_size_min;
//       let font_size = (item_height-tag_margin_top_min)/tag_row_count_min-tag_margin_top_min*3-border*2;
//       if(font_size > tag_font_size_min) {
//         tag_font_size = font_size >= tag_font_size_max ? tag_font_size_max : font_size;
//       }

//       // tag_margin_top
//       let tag_margin_top = tag_margin_top_min;
//       let margin_top = (item_height-tag_row_count_min*(tag_font_size+border*2))/(1+3*tag_row_count_min);
//       if(margin_top > tag_margin_top_min) {
//         tag_margin_top = margin_top >= tag_margin_top_max ? tag_margin_top_max : margin_top;
//       }

//       // tag_row_count_min
//       let tag_row_count = tag_row_count_min;
//       let row_count = Math.floor((item_height-tag_margin_top)/(tag_margin_top*3+tag_font_size+border*2));
//       if(row_count > tag_row_count_min) {
//         tag_row_count = row_count;
//       }

//       let tag_padding_top = tag_margin_top;

//       // 提示
//       //item_height = tag_row_count*(tag_font_size+tag_padding_top*2+tag_margin_top+border*2)+tag_margin_top
//       //item_height = tag_row_count*(tag_font_size+tag_margin_top*3+border*2)+tag_margin_top
//       //tag_margin_top=(item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count)
//       //tag_padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2
//       //tag_margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count)

//       let height = (tag_margin_top*3+tag_font_size+border*2)*tag_row_count+tag_margin_top;
//       if(height < item_height) {
//         console.log('tagConfig 有剩余空间', height, item_height, tag_row_count, tag_font_size, tag_margin_top)

//         // 有剩余空间则想办法再添加一个
//         tag_row_count++;

//         // 先缩小 tag_margin_top
//         margin_top = (item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count);
//         tag_margin_top = margin_top <= tag_margin_top_min ? tag_margin_top_min : margin_top;
//         tag_padding_top = tag_margin_top;

//         if(tag_margin_top != margin_top) {
//           // 再缩小 tag_font_size
//           let font_size = (item_height-tag_margin_top)/tag_row_count-tag_margin_top*3-border*2;
//           tag_font_size = font_size <= tag_font_size_min ? tag_font_size_min : font_size;

//           if(tag_font_size != font_size) {
//             // 强制缩小 tag_padding_top 直到 1
//             let padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2;
//             tag_padding_top = padding_top <= 1 ? 1 : padding_top;

//             if(tag_padding_top != padding_top) {
//               // 强制缩小 tag_margin_top 直到 1
//               margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count);
//               tag_margin_top = margin_top <= 1 ? 1 : margin_top;

//               if(tag_margin_top != margin_top) {
//                 console.error('tagConfig 我尽力了');
//               }
//             }
//           }
//         }
//       } else if(height > item_height) {
//         console.log('tagConfig 空间不够', height, item_height, tag_row_count, tag_font_size, tag_margin_top)
// alert('空间不够')
//         // 空间不够，此时全部值都应该是最小值

//         // 强制缩小 tag_padding_top 直到 1
//         let padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2;
//         tag_padding_top = padding_top <= 1 ? 1 : padding_top;

//         if(tag_padding_top != padding_top) {
//           // 强制缩小 tag_margin_top 直到 1
//           margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count);
//           tag_margin_top = margin_top <= 1 ? 1 : margin_top;

//           if(tag_margin_top != margin_top) {
//             console.error('tagConfig 我尽力了');
//           }
//         }
//       } else {
//         // 相等则说明找到了合适的值
//         console.log('值完全合适')
//         // alert('值完全合适')
//       }

//       console.log('tagConfig 上下计算结果', tag_row_count, tag_font_size, tag_margin_top, tag_padding_top)

//       // 开放给用户设置
//       let tag_line_count = this.config.tag_line_count;

//       let tag_margin_right = tag_margin_top;
//       let tag_padding_left = tag_margin_top;

//       console.log('tagConfig 最后结果', {
//         tag_row_count,
//         tag_line_count,

//         tag_font_size,

//         tag_margin_top,
//         tag_margin_right,

//         tag_padding_top,
//         tag_padding_left,

//         height: (tag_padding_top*2+tag_font_size)+'px',
//         width: 'calc(100% / '+tag_line_count+' - '+(tag_padding_left*2+1*2+tag_margin_right)+'px)',
//         margin: tag_margin_top+'px '
//               + tag_margin_right+'px 0px 0px',
//         padding: tag_padding_top+'px '
//                 +tag_padding_left+'px',

//         item_height: tag_row_count*(tag_font_size+tag_padding_top*2+tag_margin_top+border*2)+tag_margin_top,
//       })

//       return {
//         tag_row_count,
//         tag_line_count,

//         tag_font_size,

//         tag_margin_top,
//         tag_margin_right,

//         tag_padding_top,
//         tag_padding_left,
//       }
//     }
  },
  methods: {
    itemStyle({ index, item, isActive, isSelected }) {
      // 由于 vue 以组件为粒度进行更新，这里会被频繁调用
      if(isSelected) {
        return {
          'background-color': this.config.list_focus_background_color,
          'color': this.config.list_focus_font_color,
          '--list-highlight-color': this.config.list_focus_highlight_color,
          '--list-highlight-weight': this.config.list_focus_highlight_weight,
        }
      } else {
        return {
          'background-color': this.config.list_background_color,
          'color': this.config.list_font_color,
          '--list-highlight-color': this.config.list_highlight_color,
          '--list-highlight-weight': this.config.list_highlight_weight,
        }
      }
    },

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
      this.currentIndex = 0;
      this.scrollDisabled = this.list.length >= this.cacheList.length;

      // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
      this.isSearched = true;
    },
    load() {
      // 加载数据
      this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.config.list_page_count))
      this.scrollDisabled = this.list.length >= this.cacheList.length;
    },
    add(callback) {
      new Promise((resolve) => {
        // 获取当前窗口的所有标签
        chrome.tabs.query({
          currentWindow: true
        }, tabs => {
          let highlightCount = tabs.reduce((accumulator, tab) => {
            return accumulator+( ! tab.active && tab.highlighted ? 1 : 0);
          }, 0)

          resolve(highlightCount)
        })
      }).then((highlightCount) => {
        console.log({highlightCount})

        const h = this.$createElement;
        let message = null;
        if(highlightCount > 0) {
          message = h('p', {style: {'text-align': 'center'}}, [
            h('el-button', {attrs: {size: 'mini', type: 'info', plain: true}, on: {click: () => this._add('not-selected', callback)}}, '保存非选中标签页'),
            h('el-button', {attrs: {size: 'mini', type: 'primary', plain: true}, on: {click: () => this._add('selected', callback)}}, '保存选中标签页'),
            h('div', {style: {margin: '10px 0'}}, null),
            h('el-button', {attrs: {size: 'mini', type: 'primary'}, on: {click: () => this._add('all', callback)}}, '保存全部标签页'),
          ])
        } else {
          message = h('p', {style: {'text-align': 'center'}}, [
            h('el-button', {attrs: {size: 'mini'}, on: {click: () => this._add('left', callback)}}, '保存左侧标签页'),
            h('el-button', {attrs: {size: 'mini'}, on: {click: () => this._add('only-this', callback)}}, '仅保存此标签页'),
            h('el-button', {attrs: {size: 'mini'}, on: {click: () => this._add('right', callback)}}, '保存右侧标签页'),
            h('div', {style: {margin: '10px 0'}}, null),
            h('el-button', {attrs: {size: 'mini', type: 'info', plain: true}, on: {click: () => this._add('except-this', callback)}}, '保存除此标签页以外的标签页'),
            h('div', {style: {margin: '10px 0'}}, null),
            h('el-button', {attrs: {size: 'mini', type: 'primary'}, on: {click: () => this._add('all', callback)}}, '保存全部标签页'),
          ])
        }

        this.$msgbox({
          title: '注意：标签页保存后将被自动关闭',
          message: message,
          dangerouslyUseHTMLString: true,
          showConfirmButton: false,
          showCancelButton: false,
          closeOnClickModal: true,
          customClass: 'window-message-box',
          center: false,
          callback: (action, instance, done) => {
            console.log('callback', action, instance, done);
            // 其实只有取消会调到这里，
            if(action == 'cancel') {
              callback(false);
            }
          }
        });
      })
    },
    _add(type, callback) {
      let currentWindowId = -1;

      new Promise((resolve) => {
        // 获取当前窗口的所有标签
        chrome.tabs.query({
          currentWindow: true
        }, tabs => {
          currentWindowId = tabs[0].windowId;
          resolve(tabs)
        })
      }).then((tabs) => {
        // 提取需要保存的标签
        if(type == 'all') return tabs;

        if(type == 'only-this') return [ tabs.find((tab) => { return tab.active; }) ];
        if(type == 'except-this') return tabs.filter((tab) => { return ! tab.active; });
        if(type == 'left') return tabs.slice(0, tabs.findIndex((tab) => { return tab.active; }));
        if(type == 'right') return tabs.slice(tabs.findIndex((tab) => { return tab.active; })+1);

        if(type == 'selected') return tabs.filter((tab) => { return tab.highlighted; });
        if(type == 'not-selected') return tabs.filter((tab) => { return ! tab.highlighted; });

        return [];
      }).then((tabs) => {
        if(tabs.length <= 0) return tabs;

        // 新增数据
        this.storageList.unshift({
          id: nanoid(),
          lastVisitTime: new Date().getTime(),
          tabs: tabs.map(tab => {
            return {
              icon: tab.favIconUrl,
              url: tab.url,
              title: tab.title,
            }
          }),
        });

        // 保存数据
        return new Promise((resolve) => {
          chrome.storage.local.set({temporary: this.storageList}, () => {
            resolve(tabs);
          });
        })
      }).then((tabs) => {
        if(type == 'all') {
          // 关闭当前窗口（这样恢复时才不会出现一个标签一个标签关闭的情况）
          chrome.windows.remove(currentWindowId);
        } else if(tabs.length > 0){
          // 关闭保存的标签
          chrome.tabs.remove(tabs.map(tab => {
            return tab.id;
          }))
        }

        // 不知道为啥
        setTimeout(() => {
          // 这样列表才会被触发更新，不能为 undefined，否则会自动选择第二项
          // 不能放外面，否则会闪烁
          this.storageKeyword = ' ';

          callback(true);
        }, 100)

        this.$msgbox.close();
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
      let temporary = this.list[ this.currentIndex ];
      let urls = temporary.tabs.map(tab => tab.url);
      let index = this.getStorageIndex();
      let blankTabId = -1;

      // 打开新窗口
      new Promise(resolve => {
        // 获取当前标签信息
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          // 记录空白标签
          if(tabs[0].url == "chrome://newtab/") {
            blankTabId = tabs[0].id;
          }
          resolve();
        })
      }).then(() => {
        // 更新数据（移除该临时窗口）
        this.storageList.splice(index , 1);
        this.cacheList.splice(this.currentIndex, 1);
        this.list.splice(this.currentIndex, 1);
        return new Promise(resolve => {
          chrome.storage.local.set({temporary: this.storageList}, () => {
            resolve();
          });
        })
      }).then(() => {
        // 当前窗口打开，且不关闭
        // 不自动关闭空白标签页，有隔离作用
        if((this._device.platform == 'Mac' && event.metaKey == true)
        || (this._device.platform != '' && event.ctrlKey == true)) {
          blankTabId = -1;
          return Promise.all(urls.map((url) => {
            return new Promise((resolve) => {
              chrome.tabs.create({url: url, active: false}, (tab) => {
                resolve(tab.index);
              });
            });
          }))
        } else if(this._device.platform != '' && event.altKey == true) {
          // 当前窗口打开，且不关闭，也不进行存储更新
          // 会高亮标签
          blankTabId = -1;
          return new Promise((resolve) => {
            Promise.all(urls.map((url) => {
              return new Promise((resolve2) => {
                chrome.tabs.create({url: url, active: false}, (tab) => {
                  resolve2(tab.index);
                });
              });
            })).then((indexs) => {
              chrome.tabs.highlight({tabs: indexs})
              resolve(indexs);
            })
          })
        } else {
          // 直接回车 或 shift 方式打开（panel 只支持一个网页，没法玩）
          //let type = this._device.platform != '' && event.shiftKey ? 'panel' : 'normal';
          let type = 'normal';
          return new Promise(resolve => {
            // 新建新窗口（先不激活，否则无法存储数据）
            chrome.windows.create({ url: urls, focused: true, type: type }, window => {
              resolve(window)
            })
          })
        }
      }).then((window) => {
        // 关闭空白标签
        if(blankTabId != -1) {
          chrome.tabs.remove(blankTabId);
        }
      })
    },
    openTab(i, event) {
      // 先删除标签
      let url = this.list[ this.currentIndex ].tabs[i].url;
      let index = this.getStorageIndex();
      if(this.storageList[index].tabs.length == 1) {
        console.warn('aaaaaaaaaaaaaaaaaaaaaaaaaaa', index);
        this.storageList.splice(index, 1);
        this.cacheList.splice(this.currentIndex, 1);
        this.list.splice(this.currentIndex, 1);
      } else {
        console.warn('aaaaaaaaaaaaaaaaaaaaaaaaaaa2');
        this.storageList[index].tabs.splice(i , 1);
      }
      chrome.storage.local.set({temporary: this.storageList}, () => {
        // 再打开
        this.$open(url, event);
      });

      this.focus();
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
        this.cacheList.splice(this.currentIndex, 1);
        this.list.splice(this.currentIndex, 1);
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
    // todo
    window.t = this;

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
.list >>> .list-item {
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
.list >>> .list-item .left {
  padding: 5px;
  text-align: center;
  cursor: default;
}
.list >>> .list-item .image {
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
.list >>> .list-item .main {
  flex: 1;
  text-align: left;
  /* overflow: auto; */
  overflow-x: overlay;
  overflow-y: hidden;
  cursor: default;

  display: flex;
  align-items: flex-start; /* flex-wrap = wrap 才有效 */

  /* flex-direction: column;
  flex-wrap: nowrap;
  align-content: normal;
  justify-content: center; */

  /* flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-start; */

/*
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-start; */
}

.list >>> .list-item .main.scroll{
  overflow-x: overlay;
}
/*定义滚动条高宽及背景高宽分别对应横竖滚动条的尺寸*/
.list >>> .list-item .main.scroll::-webkit-scrollbar {
  height: 10px;
  background: transparent;
}
/*定义滑块圆角*/
.list >>> .list-item .main.scroll::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: rgb(115 115 115 / 50%);
}

.list >>> .list-item .title {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.list >>> .list-item .sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 5px;
}
.list >>> .list-item .right {
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

.list >>> .list-item .right .el-icon-copy-document {
  margin-right: 5px;padding: 5px;
}
.list >>> .list-item .right .el-icon-close {
  margin-right: 2px;
}
.list >>> .list-item .right .el-icon-close,
.list >>> .list-item .right .el-icon-copy-document {
  font-size: 20px;
  cursor:pointer;
  opacity: 0.8;
}
.list >>> .list-item .right .el-icon-close:hover,
.list >>> .list-item .right .el-icon-copy-document:hover {
  opacity: 1;
}

.el-badge {
    /* margin-right: 5px; */
    border-color: inherit !important;
}
.el-badge.refresh {
    margin-left: 10px;
}

.el-tag {
  line-height: 1;
  overflow: hidden;
  box-sizing: content-box;
  cursor: pointer;
  display:flex;
  align-items: center;
}
.el-tag .el-image{
  /* vertical-align: middle; */

}
.el-tag .tab-title {
  display: inline-block;
  vertical-align: top;
  overflow: hidden;
  /* vertical-align: middle; */

  /* display: inline-block;
  flex: 1;
  overflow: hidden; */
  /* text-overflow: ellipsis;
  white-space: nowrap; */
}
</style>
<style>
.temporary .el-tag .el-icon-close {
  top: 1px;
}
</style>