<template>
  <div
    class="help-keymap">
    <el-card
      class="box-card"
      :header="lang('commonKeymap')">
      <el-table
        :data="usualKeymapTableData"
        :span-method="usualKeymapSpanMethod"
        stripe
        border>
        <el-table-column :label="lang('type')" fixed prop="type" width="100"></el-table-column>
        <el-table-column :label="lang('keymap')" fixed width="160">
          <template slot-scope="scope">
            <span
              v-for="(data, index) in scope.row.keymaps"
              :key="index"
              :class="[ data[1] ]">{{ data[0] }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="lang('linkButton')" width="270" prop="linkButton"></el-table-column>
        <el-table-column :label="lang('list')" align="center">
          <el-table-column :label="lang('tab')" width="270" prop="tab">
          </el-table-column>
          <el-table-column :label="lang('window')" width="270" prop="window">
          </el-table-column>
          <el-table-column :label="lang('note')" width="270" prop="note">
          </el-table-column>
          <el-table-column :label="lang('temporary')" width="270" prop="temporary">
          </el-table-column>
          <el-table-column :label="lang('bookmark')" width="270" prop="bookmark">
          </el-table-column>
          <el-table-column :label="lang('history')" width="270" prop="history">
          </el-table-column>
          <el-table-column :label="lang('toggle')" width="270" prop="toggle">
          </el-table-column>
          <el-table-column :label="lang('search')" width="270" prop="search">
          </el-table-column>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card
      class="box-card"
      :header="lang('listSelection')">
      <el-table
        :data="listChoiceKeymapTableData"
        stripe
        border>
        <el-table-column :label="lang('keymap')" fixed width="200">
          <template slot-scope="scope">
            <span
              v-for="(data, index) in scope.row.keymaps"
              :key="index"
              :class="[ data[1] ]">{{ data[0] }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="lang('operate')" prop="opetation"></el-table-column>
      </el-table>
    </el-card>
    <el-card
      class="box-card"
      :header="lang('workspaceSwitching')">
      <el-table
        :data="workspaceToggleKeymapTableData"
        stripe
        border>
        <el-table-column :label="lang('keymap')" fixed width="200">
          <template slot-scope="scope">
            <span
              v-for="(data, index) in scope.row.keymaps"
              :key="index"
              :class="[ data[1] ]">{{ data[0] }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="lang('operate')" prop="opetation"></el-table-column>
      </el-table>
    </el-card>
    <el-card
      class="box-card"
      :header="lang('specialOperation')">
      <el-table
        :data="specialKeymapTableData"
        stripe
        border>
        <el-table-column :label="lang('keymap')" fixed width="200">
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
        <el-table-column :label="lang('operate')" prop="opetation"></el-table-column>
      </el-table>
    </el-card>
    <el-card
      class="box-card"
      :header="lang('customKeymap')">
      <el-table
        :data="commands"
        stripe
        border>
        <el-table-column :label="lang('keymap')" fixed width="200">
          <template slot-scope="scope">
            <template v-if="scope.row.shortcut == ''">
              <el-link
                target="_blank"
                :underline="false"
                @click="$open('chrome://extensions/shortcuts', getKeyType($event))">{{ lang('setKeymap') }}</el-link>
            </template>
            <template v-for="(data, index) in scope.row.shortcut.indexOf('+') == -1
                                            ? scope.row.shortcut.split(/(⇧|⌘|⌥)/i).filter(s => s != '')
                                            : scope.row.shortcut.split('+')">
              <span :key="index">
                <span class="keymap-box">{{ data }}</span>
                <span v-if="index < (scope.row.shortcut.indexOf('+') == -1
                                  ? scope.row.shortcut.split(/(⇧|⌘|⌥)/i).filter(s => s != '').length
                                  : scope.row.shortcut.split('+').length) - 1">+</span>
              </span>
            </template>
          </template>
        </el-table-column>
        <!-- <el-table-column :label="lang('operate')" prop="description"> -->
        <el-table-column :label="lang('operate')">
          <template slot-scope="scope">
            {{ scope.row.name == '_execute_browser_action' ? lang('open_extension') : scope.row.description }}
          </template>
        </el-table-column>
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
        type: this.lang('open'),
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['↩', 'keymap-box'], '/', ['Click', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['↩', 'keymap-box'], '/', ['Click', 'keymap-box']],
        linkButton: this.lang('openTabWithoutSwitch'),
        tab: this.lang('moveToRight'),
        window: this.lang('openCurrentWindowButNotSelect'),
        note: this.lang('openTabWithoutSwitch'),
        temporary: this.lang('openCurrentWindowButNotSelect'),
        bookmark: this.lang('openTabWithoutSwitch'),
        history: this.lang('openTabWithoutSwitch'),
        toggle: this.lang('switchToSpecifiedWorkspace'),
        search: this.lang('openTabWithoutSwitch'),
      }, {
        type: this.lang('open'),
        keymaps: this._device.platform == 'Mac'
                ? [['⌥', 'keymap-box'], '+', ['↩', 'keymap-box'], '/', ['Click', 'keymap-box']]
                : [['Alt', 'keymap-box'], '+', ['↩', 'keymap-box'], '/', ['Click', 'keymap-box']],
        linkButton: this.lang('overwriteCurrentTab'),
        tab: this.lang('swapWithCurrentTab'),
        window: this.lang('openCurrentWindowAndSelect'),
        note: this.lang('overwriteCurrentTab'),
        temporary: this.lang('openCurrentWindowAndSelect'),
        bookmark: this.lang('overwriteCurrentTab'),
        history: this.lang('overwriteCurrentTab'),
        toggle: this.lang('switchToSpecifiedWorkspace'),
        search: this.lang('overwriteCurrentTab'),
      }, {
        type: this.lang('open'),
        keymaps: this._device.platform == 'Mac'
                ? [['⇧', 'keymap-box'], '+', ['↩', 'keymap-box'], '/', ['Click', 'keymap-box']]
                : [['Shift', 'keymap-box'], '+', ['↩', 'keymap-box'], '/', ['Click', 'keymap-box']],
        linkButton: this.lang('openNewWindow'),
        tab: this.lang('moveToNewWindow'),
        window: this.lang('openNewWindow'),
        note: this.lang('openNewWindow'),
        temporary: this.lang('openNewWindow'),
        bookmark: this.lang('openNewWindow'),
        history: this.lang('openNewWindow'),
        toggle: this.lang('switchToSpecifiedWorkspace'),
        search: this.lang('openNewWindow'),
      }, {
        type: this.lang('open'),
        keymaps: this._device.platform == 'Mac'
                ? [['↩', 'keymap-box'], '/', ['Click', 'keymap-box']]
                : [['↩', 'keymap-box'], '/', ['Click', 'keymap-box']],
        linkButton: this.lang('openTabAndSwitch'),
        tab: this.lang('switchTab'),
        window: this.lang('openNewWindow'),
        note: this.lang('openTabAndSwitch'),
        temporary: this.lang('openNewWindow'),
        bookmark: this.lang('openTabAndSwitch'),
        history: this.lang('openTabAndSwitch'),
        toggle: this.lang('switchToSpecifiedWorkspace'),
        search: this.lang('openTabAndSwitch'),
      }, {
        type: this.lang('open'),
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['↓', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['↓', 'keymap-box']],
        linkButton: '-',
        tab: this.lang('switchTab'),
        window: this.lang('openNewWindow'),
        note: this.lang('openTabAndSwitch'),
        temporary: this.lang('openNewWindow'),
        bookmark: this.lang('openTabAndSwitch'),
        history: this.lang('openTabAndSwitch'),
        toggle: this.lang('switchToSpecifiedWorkspace'),
        search: this.lang('openTabAndSwitch'),
      }, {
        type: this.lang('putAwayOrJump'),
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['↑', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['↑', 'keymap-box']],
        linkButton: '-',
        tab: '-',
        window: '-',
        note: '-',
        temporary: '-',
        bookmark: this.lang('moveToParentFolder'),
        history: this.lang('collapseFolder'),
        toggle: '-',
        search: '-',
      }, {
        type: this.lang('copy'),
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['C', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['C', 'keymap-box']],
        linkButton: '-',
        tab: this.lang('copyLink'),
        window: this.lang('copyAllLink'),
        note: this.lang('copyLink'),
        temporary: this.lang('copyAllLink'),
        bookmark: this.lang('copyAllLink'),
        history: this.lang('copyAllLink'),
        toggle: '-',
        search: this.lang('copyLink'),
      }],

      listChoiceKeymapTableData: [{
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['1', 'keymap-box'], '~', ['9', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['1', 'keymap-box'], '~', ['9', 'keymap-box']],
        opetation: this.lang('openLine'),
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['⌥', 'keymap-box'], '+', ['1', 'keymap-box'], '~', ['9', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['Alt', 'keymap-box'], '+', ['1', 'keymap-box'], '~', ['9', 'keymap-box']],
        opetation: this.lang('moveTo'),
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['↑', 'keymap-box']]
                : [['↑', 'keymap-box']],
        opetation: this.lang('moveUp'),
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['↓', 'keymap-box']]
                : [['↓', 'keymap-box']],
        opetation: this.lang('moveDown'),
      }],

      workspaceToggleKeymapTableData: [{
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['[', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['[', 'keymap-box']],
        opetation: this.lang('switchLeft'),
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', [']', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', [']', 'keymap-box']],
        opetation: this.lang('switchRight'),
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⇥', 'keymap-box'], '+', ['⇧', 'keymap-box']]
                : [['tab', 'keymap-box'], '+', ['shift', 'keymap-box']],
        opetation: this.lang('switchLeft'),
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⇥', 'keymap-box']]
                : [['tab', 'keymap-box']],
        opetation: this.lang('switchRight'),
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['←', 'keymap-box']]
                : [['←', 'keymap-box']],
        opetation: this.lang('switchLeft'),
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['→', 'keymap-box']]
                : [['→', 'keymap-box']],
        opetation: this.lang('switchRight'),
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['←', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['←', 'keymap-box']],
        opetation: this.lang('switchToFarLeft'),
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['→', 'keymap-box']]
                : [['Ctrl', 'keymap-box'], '+', ['→', 'keymap-box']],
        opetation: this.lang('switchToFarRight'),
      }],

      specialKeymapTableData: [{
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['el-icon-download', 'button-box']]
                : [['Ctrl', 'keymap-box'], '+', ['el-icon-download', 'button-box']],
        opetation: this.lang('switchWorkspace').replace('[workspace]', this.lang('window'))
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['el-icon-collection-tag', 'button-box']]
                : [['Ctrl', 'keymap-box'], '+', ['el-icon-collection-tag', 'button-box']],
        opetation: this.lang('switchWorkspace').replace('[workspace]', this.lang('note'))
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['⌘', 'keymap-box'], '+', ['el-icon-paperclip', 'button-box']]
                : [['Ctrl', 'keymap-box'], '+', ['el-icon-paperclip', 'button-box']],
        opetation: this.lang('switchWorkspace').replace('[workspace]', this.lang('temporary'))
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['>', 'input-box']]
                : [['>', 'input-box']],
        opetation: this.lang('switchToSpecifiedWorkspace'),
      }, {
        keymaps: this._device.platform == 'Mac'
                ? [['esc', 'keymap-box']]
                : [['esc', 'keymap-box']],
        opetation: this.lang('closePopupWindow'),
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