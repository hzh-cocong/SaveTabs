<template>
  <div
    class="help-tool"
    @click="focus">
    <el-card
      class="box-card"
      header="批量打开链接">
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
          @click="open(true)">当前窗口打开</el-button>
        <el-button
          type="primary"
          :disabled="urls.length <= 0"
          @click="open(false)">新窗口打开</el-button>
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
      console.log(this.urls.split("\n"))
      let urls = this.urls.split("\n").filter(url => url.length > 0).map(url => url.trim() );
      this.urls = urls.join("\n");
      if(this.urls.length <= 0) return;
      console.log(urls)

      if( ! isCurrent) {
        // 新建新窗口
        new Promise(resolve => {
          chrome.windows.create({ url: urls, focused: false }, window => {
            resolve(window);
          })
        }).then(window => {
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
        chrome.tabs.highlight({
          windowId: tab[0].windowId,
          tabs: tab.map(tab => tab.index)
        })
      })
    },

    focus() {
      this.$refs.textarea.focus();
    }
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