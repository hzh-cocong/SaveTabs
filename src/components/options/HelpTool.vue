<template>
  <div
    class="help-tool"
    @click="focus">
    <el-card
      class="box-card"
      :header="lang('openBulkLinks')">
      <el-input
        type="textarea"
        autofocus
        :autosize="{ minRows: 10, maxRows: 20 }"
        :placeholder="'https://www.baidu.com\nhttps://www.google.com'"
        v-model="urls"
        ref="textarea">
      </el-input>
      <div style="text-align: right;margin-top: 20px;" @mousedown.prevent>
        <el-button
          :disabled="urls.length <= 0"
          @click="open(true)">{{ lang('openCurrentWindowAndSelect') }}</el-button>
        <el-button
          type="primary"
          :disabled="urls.length <= 0"
          @click="open(false)">{{ lang('openNewWindow') }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'HelpTool',
  data() {
    return {
      urls: '',
    }
  },
  methods: {
    open(isCurrent) {
      let urls = this.urls.split("\n").filter(url => url.length > 0).map(url => url.trim() );
      this.urls = urls.join("\n");
      if(this.urls.length <= 0) return;

      if( ! isCurrent) {
        // 新建新窗口
        new Promise(resolve => {
          chrome.windows.create({ url: urls, focused: false }, window => {
            resolve(window);
          })
        }).then(window => {
          // 捕获错误，这样插件就不会显示错误
          const error = chrome.runtime.lastError;
          if(error && error.message) {
            this.$message({
              type: 'warning',
              message: this.lang('addressFormatError'),
              customClass: 'window-message-box',
              offset: 69,
              duration: 3000,
            });
            return;
          }

          // 激活窗口
          chrome.windows.update(window.id, { focused: true});
        })
        return;
      }

      // 会高亮标签
      Promise.all(urls.map((url) => {
        return new Promise((resolve) => {
          chrome.tabs.create({url: url, active: false}, (tab) => {
            resolve(tab);
          });
        });
      })).then((tab) => {
        // 捕获错误，这样插件就不会显示错误
        const error = chrome.runtime.lastError;
        if(error && error.message) {
          this.$message({
            type: 'warning',
            message: this.lang('addressFormatError'),
            customClass: 'window-message-box',
            offset: 69,
            duration: 3000,
          });
          return;
        }

        chrome.tabs.highlight({
          windowId: tab[0].windowId,
          tabs: tab.map(tab => tab.index)
        })
      })
    },

    focus() {
      this.$refs.textarea.focus();
    }
  },
  mounted() {
    this.focus();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.help-tool {
  padding:20px;
  height: 100%;
  box-sizing: border-box;
}

.box-card {
  margin-bottom: 20px;
}
</style>

<style>

</style>