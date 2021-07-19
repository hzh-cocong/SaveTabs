<template>
  <div
    class="help-keymap">
    <el-card
      class="box-card"
      header="常用快捷键">
      <el-table
        :data="usualKeymapTableData"
        :span-method="usualKeymapSpanMethod"
        stripe
        border>
        <el-table-column label="类型" fixed prop="type"></el-table-column>
        <el-table-column label="快捷键" fixed width="200">
          <template slot-scope="scope">
            <span
              v-for="(data, index) in scope.row.keymaps"
              :key="index"
              :class="[ data[1] ]">{{ data[0] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Link Button" width="200"></el-table-column>
        <el-table-column label="列表" align="center">
          <el-table-column label="Tab" width="200">
          </el-table-column>
          <el-table-column label="Window" width="200">
          </el-table-column>
          <el-table-column label="Note" width="200">
          </el-table-column>
          <el-table-column label="Temporary" width="200">
          </el-table-column>
          <el-table-column label="Bookmark" width="200">
          </el-table-column>
          <el-table-column label="History" width="200">
          </el-table-column>
          <el-table-column label="Toggle" width="200">
          </el-table-column>
          <el-table-column label="Search" width="200">
          </el-table-column>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card
      class="box-card"
      header="列表选择">
      <el-table
        :data="listChoiceKeymapTableData"
        stripe
        border>
        <el-table-column label="快捷键" fixed width="200">
          <template slot-scope="scope">
            <span
              v-for="(data, index) in scope.row.keymaps"
              :key="index"
              :class="[ data[1] ]">{{ data[0] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="opetation"></el-table-column>
      </el-table>
    </el-card>
    <el-card
      class="box-card"
      header="工作区切换">
      <el-table
        :data="workspaceToggleKeymapTableData"
        stripe
        border>
        <el-table-column label="快捷键" fixed width="200">
          <template slot-scope="scope">
            <span
              v-for="(data, index) in scope.row.keymaps"
              :key="index"
              :class="[ data[1] ]">{{ data[0] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="opetation"></el-table-column>
      </el-table>
    </el-card>
    <el-card
      class="box-card"
      header="特殊操作">
      <el-table
        :data="specialKeymapTableData"
        stripe
        border>
        <el-table-column label="快捷键" fixed width="200">
          <template slot-scope="scope">
            <span
              v-for="(data, index) in scope.row.keymaps"
              :key="index"
              :class="[ data[1] ]">
              <template v-if="data[1] == 'keymap-box'">{{ data[0] }}</template>
              <template v-else-if="data[1] == 'button-box'">
                <i :class="[ data[0] ]"></i>
              </template>
              <template v-else-if="data[1] == 'input-box'">
                <el-input
                  size="mini"
                  style="width: 50px;"
                  :value="syncConfig.workspace_change_word"
                  @input="workspaceChangeWordSync"
                  @change="setWorkspaceChangeWord"
                  @focus="$event.target.select()"></el-input>
              </template>
              <template v-else>{{ data[0] }}</template>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="opetation"></el-table-column>
      </el-table>
    </el-card>
    <el-card
      class="box-card"
      header="用户自定义快捷键">
      <el-table
        :data="commands"
        stripe
        border>
        <el-table-column label="快捷键" fixed width="200">
          <template slot-scope="scope">
            <template v-if="scope.row.shortcut == ''">
              <el-link
                target="_blank"
                :underline="false"
                @click="$open('chrome://extensions/shortcuts', getKeyType($event))">点此设置快捷键</el-link>
            </template>
            <template v-for="(data, index) in scope.row.shortcut.replace(/space/i, ' ').split('')">
              <span :key="index">
                <span class="keymap-box">{{ data == ' ' ? 'Space' : data }}</span>
                <span v-if="index < scope.row.shortcut.replace(/space/i, ' ').split('').length-1">+</span>
              </span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="description"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'HelpKeymap',
  inject: [
    'workspaceChangeWordSync',
    'setWorkspaceChangeWord',
  ],
  props: {
    syncConfig: {
      type: Object,
      required: true,
    },
    commands: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      usualKeymapTableData: [{
        type: '打开',
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['↩', 'keymap-box'], '/', ['Click', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['↩', 'keymap-box'], '/', ['Click', 'keymap-box']]
      }, {
        type: '打开',
        keymaps: this._device.platform == 'Mac'
                ? [['⌥', 'keymap-box'], '+', ['↩', 'keymap-box'], '/', ['Click', 'keymap-box']]
                : [['Alt', 'keymap-box'], '+', ['↩', 'keymap-box'], '/', ['Click', 'keymap-box']]
      }, {
        type: '打开',
        keymaps: this._device.platform == 'Mac'
                ? [['⇧', 'keymap-box'], '+', ['↩', 'keymap-box'], '/', ['Click', 'keymap-box']]
                : [['Shift', 'keymap-box'], '+', ['↩', 'keymap-box'], '/', ['Click', 'keymap-box']]
      }, {
        type: '打开',
        keymaps: this._device.platform == 'Mac'
                ? [['↩', 'keymap-box'], '/', ['Click', 'keymap-box']]
                : [['↩', 'keymap-box'], '/', ['Click', 'keymap-box']]
      }, {
        type: '打开',
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['↓', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['↓', 'keymap-box']]
      }, {
        type: '收起或跳跃',
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['↑', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['↑', 'keymap-box']]
      }, {
        type: '复制',
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['C', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['C', 'keymap-box']]
      }],

      listChoiceKeymapTableData: [{
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['1', 'keymap-box'], '~', ['9', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['1', 'keymap-box'], '~', ['9', 'keymap-box']],
        opetation: '打开对应的行'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['⌥', 'keymap-box'], '+', ['1', 'keymap-box'], '~', ['9', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['Alt', 'keymap-box'], '+', ['1', 'keymap-box'], '~', ['9', 'keymap-box']],
        opetation: '移动到对应的行'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['↑', 'keymap-box']]
                : [['↑', 'keymap-box']],
        opetation: '向上移动一行'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['↓', 'keymap-box']]
                : [['↓', 'keymap-box']],
        opetation: '向下移动一行'
      }],

      workspaceToggleKeymapTableData: [{
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['[', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['[', 'keymap-box']],
        opetation: '向左切换'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', [']', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', [']', 'keymap-box']],
        opetation: '向右切换'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⇥', 'keymap-box'], '+', ['⇧', 'keymap-box']]
                : [['tab', 'keymap-box'], '+', ['shift', 'keymap-box']],
        opetation: '向左切换'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⇥', 'keymap-box']]
                : [['tab', 'keymap-box']],
        opetation: '向右切换'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['←', 'keymap-box']]
                : [['←', 'keymap-box']],
        opetation: '向左切换'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['→', 'keymap-box']]
                : [['→', 'keymap-box']],
        opetation: '向右切换'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['←', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['←', 'keymap-box']],
        opetation: '切换到最左，即第一个工作区'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['→', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['→', 'keymap-box']],
        opetation: '切换到最右，即最后一个工作区'
      }],

      specialKeymapTableData: [{
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['el-icon-download', 'button-box']]
                : [['Ctrl', 'keymap-box'], '+', ['el-icon-download', 'button-box']],
        opetation: '切换到 窗口 工作区'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['el-icon-collection-tag', 'button-box']]
                : [['Ctrl', 'keymap-box'], '+', ['el-icon-collection-tag', 'button-box']],
        opetation: '切换到 便签 工作区'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['el-icon-paperclip', 'button-box']]
                : [['Ctrl', 'keymap-box'], '+', ['el-icon-paperclip', 'button-box']],
        opetation: '切换到 临时 工作区'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['>', 'input-box']]
                : [['>', 'input-box']],
        opetation: '切换到指定的工作区'
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['esc', 'keymap-box']]
                : [['esc', 'keymap-box']],
        opetation: '关闭弹窗'
      }]
    }
  },
  computed: {
    // keymap() {
    //   if( ! Array.isArray(this.commands)) return {};

    //   let keymap = {};
    //   this.commands.forEach((command) => {
    //     keymap[command.name] = command.shortcut;
    //   })

    //   return keymap;
    // },
  },
  methods: {
    usualKeymapSpanMethod({ rowIndex, columnIndex }) {
      if(columnIndex == 0 && rowIndex <= 4) {
        if(rowIndex == 0) {
          return [5, 1]
        } else {
          return [0, 0]
        }
      }
    }
  },
  mounted() {
    // todo
    window.hk = this;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.help-keymap {
  padding:20px;
}

.box-card {
  margin-bottom: 20px;
}

.keymap-box {
  display: inline-block;
  height: 18px;
  min-width: 18px;
  line-height: 19px;
  font-size: 14px;
  margin: 5px;
  padding: 4px;
  text-align: center;
  border-radius: 2px;
  box-shadow: inset 0 -2px 0 0 #cdcde6,inset 0 0 1px 1px #fff,0 1px 2px 1px rgba(30,35,90,0.4);
  background: linear-gradient(-225deg,#d5dbe4,#f8f8f8);
}
.button-box {
  display: inline-block;
  height: 18px;
  min-width: 18px;
  line-height: 19px;
  font-size: 14px;
  margin: 5px;
  padding: 4px 10px;
  text-align: center;
  color: rgba(96, 98, 102, 1);
  border: 1px solid rgb(228, 228, 228);
  box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1)
}
.input-box {
}
</style>

<style>

</style>