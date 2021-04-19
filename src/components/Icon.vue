<template>
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
</template>


<script>
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
    },
    icon: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
    }
  },
  method: {
    getIconSize: function(size) {
      if(size <= 16) return 16;
      if(size >= 256) return 256;

      return (2**Math.ceil(Math.log(size/16)/Math.log(2)))*16;
    },
    getIcon(url, size) {
      if(url == '') return '';

      size = this.getIconSize(size);
      let res = url.match(/([a-zA-z-]+):\/\/[^/]+/);
      let icon = '';
      if(res != null) {
        if(res[1] == 'http' || res[1] == 'https') {
          icon = "https://s2.googleusercontent.com/s2/favicons?sz="+size+"&domain="+res[0];
        } else {
          icon = "chrome://favicon/size/"+size+"/"+res[0];
        }
      }
      return icon;
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>