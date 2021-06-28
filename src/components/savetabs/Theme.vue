<template>
  <el-dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"

    :modal="false"
    :append-to-body="true"
    :close-on-click-modal="false"
    :destroy-on-close="false"
    width="250px"
    class="theme"
    @mousedown.native.prevent>
    <div slot="title" style="font-size: 16px;position: relative;">
      <svg-icon
        :name="localConfig.popup ? 'fly-brands' : 'ship-solid'"
        class="hover"
        style="width: 16px;height: 16px;color: gray;position: relative;top: 2px;margin-right: 10px;cursor: pointer;"
        @click.native="popupChange"
      ></svg-icon>
      <span>选择主题</span>
      <i
        class="el-icon-s-tools hover"
        style="color: #b8b8b9;position: absolute;top: 3px;right: -5px;cursor: pointer;"
        @click="$open('./options.html?type=themes', getKeyType($event))"></i>
    </div>
    <SelectX
      :currentIndex="currentThemeIndex"
      @change="$emit('change', $event)"

      :list="currentThemeList"
      :itemHeight="65"
      :itemShowCount="3"
      style="width:250px">
      <template #default="{ index, item, isSelected }">
        <div
          class="theme-item"
          :class="{ selected: isSelected }">
          <span
            style="display:inline-block;border-width: 5px;border-style: solid; padding: 6px;"
            :style="{ borderColor: item.config.border_color,
                      backgroundColor: item.config.background_color }"><span
              style="display:inline-block;padding:0;margin:0;width: 8px;height:34px;"
              :style="{
                backgroundColor: item.config.list_background_color,
                color: item.config.list_background_color,
              }">.</span><span
              style="display:inline-block;padding:0;margin:0;width: 8px;height:34px;"
              :style="{
                backgroundColor: item.config.list_font_color,
                color: item.config.list_font_color,
              }">.</span><span
              style="display:inline-block;padding:0;margin:0;width: 8px;height:34px;"
              :style="{
                backgroundColor: item.config.list_focus_background_color,
                color: item.config.list_focus_background_color,
              }">.</span><span
              style="display:inline-block;padding:0;margin:0;width: 8px;height:34px;"
              :style="{
                backgroundColor: item.config.list_focus_font_color,
                color: item.config.list_focus_font_color,
              }">.</span></span>
          <span
            class="title"
            :style="{ color: item.id == currentThemeId ? currentThemeConfig.list_focus_background_color : 'black' }">{{ item.name }}</span>
          <i
            v-show="isSelected"
            class="el-icon-check"
            style="font-weight: 700"
            :style="{ color:  item.id == currentThemeId ? currentThemeConfig.list_focus_background_color : 'black' }"></i>
        </div>
      </template>
    </SelectX>
  </el-dialog>
</template>

<script>
import SelectX from '../common/SelectX.vue'

export default {
  name: 'theme',
  inject: ['statusTip', 'popupChange'],
  model: {
      prop: 'currentThemeIndex',
      event: 'change'
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    localConfig: {
      type: Object,
      required: require,
    },
    currentThemeIndex: {
      type: Number,
      required: require,
    },
    currentThemeId: {
      type: String,
      required: require,
    },
    currentThemeConfig: {
      type: Object,
      required: require,
    },
    currentThemeList: {
      type: Array,
      required: require,
    },
  },
  computed: {
  },
  components: {
    SelectX,
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

<style>

</style>