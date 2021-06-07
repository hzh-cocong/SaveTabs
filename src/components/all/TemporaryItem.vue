<template>
  <li
    class="item"
    :style="{
      backgroundColor: isSelected
                      ? config.list_focus_background_color
                      : config.list_background_color,
      color: isSelected
            ? config.list_focus_font_color
            : config.list_font_color,

      '--list-highlight-color': isSelected
                              ? config.list_focus_highlight_color
                              : config.list_highlight_color,
      '--list-highlight-weight': isSelected
                                ? config.list_focus_highlight_weight
                                : config.list_highlight_weight,
    }">
    <span
      class="left"
      style="position: relative"
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
      <svg-icon
        name="paperclip-solid"
        style=" position: absolute;
                right: 0;
                bottom: 0;
                padding: 2px;
                border-width: 2px 0px 0px 2px;
                border-style: solid;
                border-radius: 2px 0 0 0;
                margin-right: 2px;"
        :style="{ backgroundColor: isSelected
                                  ? config.list_focus_background_color
                                  : config.list_background_color,
                  borderColor: isSelected
                              ? config.list_focus_background_color
                              : config.list_background_color,
                  color: isSelected
                        ? config.list_focus_icon_color
                        : config.list_icon_color,
                  width: config.item_height/4+'px',
                  height: config.item_height/4+'px', }"></svg-icon>
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
          type='info'
          :effect="'light'"
          :closable="false"
          :disable-transitions="true"
          :hit="false">
          <el-image
            v-if="isLoad"
            :src="getIcon(tab.icon, tab.url, tagConfig.tag_font_size)"
            :style="{ width: tagConfig.tag_font_size+'px',
                      height: tagConfig.tag_font_size+'px',
                      marginRight: tagConfig.tag_padding_left+'px' }"
            fit="cover"
            :lazy="false">
            <div slot="error" class="image-slot">
              <img src="../../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
            <div slot="placeholder" class="image-slot"></div>
          </el-image>
          <div
            class="title"
            :style="{ fontSize: tagConfig.tag_font_size+'px',
                      width: 'calc(100% - '
                            +( tagConfig.tag_font_size+tagConfig.tag_padding_left*1
                              + (isActive ? 20 : 0) )
                            +'px' }"
            v-html="highlight(tab.title, storageKeyword, '<strong>', '</strong>')
                  || highlight(tab.url, storageKeyword, '<strong>', '</strong>')"></div>
        </el-tag>
      </template>
      <template v-else>
        <div
        class="title"
        style="display:flex; overflow: hidden; align-items: center;"
        :style="{ fontSize: config.list_font_size+'px' }">
          <el-image
            v-if="isLoad"
            :src="getIcon(item.tabs[0].icon, item.tabs[0].url, config.list_font_size)"
            fit="cover"
            :style="{ width: config.list_font_size+'px',
                      height: config.list_font_size+'px' }"
            lazy>
            <div slot="error" class="image-slot">
              <img src="../../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
            <div slot="placeholder" class="image-slot"></div>
          </el-image>
          <span
            style="margin-left: 5px;flex: 1; overflow: hidden; text-overflow: ellipsis;"
            v-html="highlight(item.tabs[0].title, storageKeyword, '<strong>', '</strong>')
                  || highlight(item.tabs[0].url, storageKeyword, '<strong>', '</strong>')"></span>
        </div>
        <div
          class="sub-title"
          :style="{
            fontSize: config.list_explain_font_size+'px',
            color: isSelected
                  ? config.list_explain_focus_font_color
                  : config.list_explain_font_color,
            marginLeft: (config.list_font_size+5)+'px' }"
            v-html="highlight(getDomain(item.tabs[0].url), storageKeyword, '<strong>', '</strong>')"></div>
      </template>
    </div>

    <div
      class="right"
      :style="{ marginLeft: isActive ? '5px' : '10px' }">
      <!-- <div v-if="isActive">
        <i
          class="el-icon-copy-document hover"
          :style="{
            color:config.list_focus_font_color}"></i>
        <i
          class="el-icon-close hover"
          @click.stop="deleteTemporary"
          :style="{
            color:config.list_focus_font_color}"></i>
      </div> -->
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
          v-else-if="showIndex > 0"
          :style="{
            fontSize: item.isOpened || (storageKeyword != ''  && item.lastVisitTime != undefined)
                ? config.list_state_size+'px'
                : config.list_keymap_size+'px',
            color: item.isOpened
                ? config.list_state_color
                : config.list_keymap_color }">{{ (_device.platform == 'Mac' ? '⌘' : 'Alt+') + showIndex}}</span>
      </template>
    </div>
  </li>
</template>

<script>
export default {
  name: 'TemporaryItem',
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
    item: {
      type: Object,
      required: require,
    },
    showIndex: {
      type: Number,
      required: require,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    isSelected: {
      type: Boolean,
      required: true,
    },
    storageKeyword: {
      type: String,
      required: false,
      default: '',
    }
  },
  data() {
    return {
    }
  },
  computed: {
    // 行数尽可能多，字体尽可能大
    tagConfig() {
      console.log('temporaryItem:computed:tagConfig')

      let item_height = this.config.item_height;
      let border = 1; // 上下左右

      let tag_margin_top_min = 3;
      let tag_font_size_min = 12;
      let tag_row_count_min = 1;

      let tag_margin_top_max = 10;
      let tag_font_size_max = this.config.list_font_size;

      let tag_row_count = tag_row_count_min;
      let row_count = Math.floor((item_height-tag_margin_top_min)/(tag_margin_top_min*3+tag_font_size_min+border*2));
      if(row_count > tag_row_count_min) {
        tag_row_count = row_count;
      }

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

      let height = (tag_margin_top*3+tag_font_size+border*2)*tag_row_count+tag_margin_top;
      if(height < item_height) {
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
            if(tag_padding_top != padding_top) {
              // 强制缩小 tag_margin_top 直到 1
              margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count);
              tag_margin_top = margin_top <= 1 ? 1 : margin_top;
            }
          }
        }
      } else if(height > item_height) {
        // 空间不够，此时全部值都应该是最小值

        // 强制缩小 tag_padding_top 直到 1
        let padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2;
        tag_padding_top = padding_top <= 1 ? 1 : padding_top;

        if(tag_padding_top != padding_top) {
          // 强制缩小 tag_margin_top 直到 1
          margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count);
          tag_margin_top = margin_top <= 1 ? 1 : margin_top;
        }
      }

      // 开放给用户设置
      let tag_line_count = this.config.tag_line_count;

      let tag_margin_right = tag_margin_top;
      let tag_padding_left = tag_margin_top;

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
  }
}
</script>

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
  overflow: hidden;
  cursor: default;

  display: flex;
  align-items: flex-start; /* flex-wrap = wrap 才有效 */
}

.item .main.scroll{
  overflow-x: overlay;
}
/*定义滚动条高宽及背景高宽分别对应横竖滚动条的尺寸*/
.item .main.scroll::-webkit-scrollbar {
  height: 10px;
  background: transparent;
}
/*定义滑块圆角*/
.item .main.scroll::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: rgb(115 115 115 / 50%);
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

.el-tag {
  line-height: 1;
  overflow: hidden;
  box-sizing: content-box;
  cursor: default;
  display:flex;
  align-items: center;
}
.el-tag .tab-title {
  display: inline-block;
  vertical-align: top;
  overflow: hidden;
}
</style>
<style>
.all .item strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>