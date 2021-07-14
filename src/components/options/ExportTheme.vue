<template>
  <div class="export-theme">
    <el-row :gutter="20">
      <el-col :xl="12">
        <el-card
          class="box-card"
          header="主题"
          :body-style="{ paddingBottom: '10px' }">
          <el-button
            icon="el-icon-upload2"
            style="margin-bottom: 10px;margin-right: 10px;"
            @click="leadIn('upload')">导入（单个或多个主题）</el-button>
          <el-button
            icon="el-icon-download"
            style="margin-bottom: 10px;margin-left: 0;margin-right: 10px;"
            @click="leadOut">导出所有用户主题（不含系统自带主题）</el-button>
        </el-card>
      </el-col>
      <el-col :xl="12">
        <el-card
          class="box-card"
          header="旧版（来自颜色分享）"
          :body-style="{ paddingBottom: '10px' }">
          <el-button
            icon="el-icon-upload2"
            style="margin-bottom: 10px;margin-right: 10px;"
            @click="leadIn('upload2')">导入</el-button>
        </el-card>
      </el-col>
    </el-row>

    <input type="file" id="upload" style="display:none">
    <input type="file" id="upload2" style="display:none">

  </div>
</template>

<script>

import { nanoid } from 'nanoid'
import projectConfig from '@/config/project_config.json'

export default {
  name: 'ExportTheme',
  inject: [
    'changeTheme',
    'download',
  ],
  props: {
    theme: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      themeAttributes: projectConfig.themeAttributes,
      colorAttributes: projectConfig.colorAttributes,
    }
  },
  methods: {
    leadOut() {
      chrome.storage.local.get({ theme: []}, items => {
console.log('leadOut.items', items)

        let data = this.$validate.cleanAttributes(items.theme, this.themeAttributes);

console.log('leadOut.data', JSON.parse(JSON.stringify(data)))

        // let attributesArray = this.themeAttributes.user_theme_list.array;
        // let attributes = Object.keys(attributesArray).reduce((accumulator, key) => {
        //   accumulator[ key ] = true;
        //   return accumulator;
        // }, {});
        if(data.user_theme_list != undefined) {
          data.user_theme_list = data.user_theme_list.map(theme => {
            return this.$validate.cleanAttributes(theme, this.themeAttributes.user_theme_list.array)
          })
        }

console.log('leadOut.data2', data)

        this.download('SaveTabsThemes.json', JSON.stringify(data));
      })
    },
    leadIn(id) {
      let uploadNode = document.getElementById(id);
      uploadNode.click();
    },
  },
  mounted() {
    let fileInput = document.getElementById('upload');
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length === 0) {
        return;
      }

      const reader = new FileReader();
      reader.readAsText(fileInput.files[0]);
      reader.onload = () => {
        fileInput.value = "";

        let data = reader.result;
        try {
          data = JSON.parse(data);
        } catch(e) {
          this.$message({
            type: 'warning',
            message: this.lang('invalidFileFormat')
          });
          return;
        }
console.log('validate33', data,this.themeAttributes,' | ',this.$validate(data, this.themeAttributes))
        if(this.$validate(data, this.themeAttributes) != undefined) {
          this.$message({
            type: 'warning',
            message: this.lang('invalidFileFormat')
          });
          return;
        }

        data = this.$validate.cleanAttributes(data, this.themeAttributes);
        data.user_theme_list = data.user_theme_list == undefined ? [] : data.user_theme_list.map(theme => {
          theme = this.$validate.cleanAttributes(theme, this.themeAttributes.user_theme_list.array)

          // 补充数据
          theme.id = nanoid();
          theme.config = Object.assign({}, this.theme.system_theme_list[0].config, theme.config);

          return theme;
        })
console.log('export-theme', data);

        // 保存数据
        let total = 0;
        chrome.storage.local.get({ theme: {}}, items => {
          console.log('export-theme2', JSON.parse(JSON.stringify(items.theme)))

          if(Object.keys(items.theme).length != 0) {
            console.log('export-theme21')
            delete items.theme.system_theme_list;
            items.theme.user_theme_list.push(...data.user_theme_list);
          } else {
            console.log('export-theme22')
            items.theme = data;
          }
          total += data.user_theme_list.length;

console.log('export-theme3', items.theme)
          chrome.storage.local.set(items, () => {
            this.changeTheme(items.theme);
            this.$message({
              type: 'success',
              message: `共导入 ${total} 个主题`,
            });
          });
        });
      };
    });

    let fileInput2 = document.getElementById('upload2');
    fileInput2.addEventListener('change', () => {
      if (fileInput2.files.length === 0) {
        return;
      }

      const reader = new FileReader();
      reader.readAsText(fileInput2.files[0]);
      reader.onload = () => {
        fileInput2.value = "";

        let data = reader.result;
        try {
          data = JSON.parse(data);
        } catch(e) {
          this.$message({
            type: 'warning',
            message: this.lang('invalidFileFormat')
          });
          return;
        }

        if(this.$validate(data, this.colorAttributes) != undefined) {
          this.$message({
            type: 'warning',
            message: this.lang('invalidFileFormat')
          });
          return;
        }

        data = this.$validate.cleanAttributes(data, this.colorAttributes);
        if(Object.keys(data) == 0) {
          this.$message({
            type: 'info',
            message: this.lang('noDataImport')
          });
          return;
        }

console.log('export-theme', data);

        data = {
          "id": nanoid(),
          "name": "Old Version Import",
          "type": 1,
          "config": Object.assign({}, this.theme.system_theme_list[0].config, data),
        }
console.log('export-theme1', data);

        // 保存数据
        let total = 0;
        chrome.storage.local.get({ theme: {}}, items => {
          console.log('export-theme2', JSON.parse(JSON.stringify(items.theme)))

          if(Array.isArray(items.theme.user_theme_list)) {
            items.theme.user_theme_list.push(data);
          } else {
            items.theme.user_theme_list = [ data ];
          }

console.log('export-theme3', items.theme)
          chrome.storage.local.set(items, () => {
            this.changeTheme(items.theme);
            this.$message({
              type: 'success',
              message: `共导入 1 个主题`,
            });
          });
        });
      };
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.export-theme {
  padding:20px;
}
.box-card {
  margin-bottom: 20px;
}
</style>

<style>

</style>