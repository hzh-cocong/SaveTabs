<template>
  <div class="export-theme">
    <el-row :gutter="20">
      <el-col :xl="12">
        <el-card
          class="box-card"
          :header="lang('theme')"
          :body-style="{ paddingBottom: '10px' }">
          <el-button
            icon="el-icon-upload2"
            style="margin-bottom: 10px;margin-right: 10px;"
            @click="leadIn('upload')">{{ lang('themeImportTip') }}</el-button>
          <el-button
            icon="el-icon-download"
            style="margin-bottom: 10px;margin-left: 0;margin-right: 10px;"
            @click="leadOut">{{ lang('themeExportTip') }}</el-button>
        </el-card>
      </el-col>
      <el-col :xl="12">
        <el-card
          class="box-card"
          :header="lang('oldVersionImportTip')"
          :body-style="{ paddingBottom: '10px' }">
          <el-button
            icon="el-icon-upload2"
            style="margin-bottom: 10px;margin-right: 10px;"
            @click="leadIn('upload2')">{{ lang('import') }}</el-button>
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
        let data = this.$validate.cleanAttributes(items.theme, this.themeAttributes);

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

        // 保存数据
        let total = 0;
        chrome.storage.local.get({ theme: {}}, items => {
          if(Object.keys(items.theme).length != 0) {
            delete items.theme.system_theme_list;
            items.theme.user_theme_list.push(...data.user_theme_list);
          } else {
            items.theme = data;
          }
          total += data.user_theme_list.length;

          chrome.storage.local.set(items, () => {
            this.changeTheme(items.theme);
            this.$message({
              type: 'success',
              message: this.lang('importSuccessTip').replace('[total]', total),
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

        data = {
          "id": nanoid(),
          "name": this.lang("oldVersionImport"),
          "type": 1,
          "config": Object.assign({}, this.theme.system_theme_list[0].config, data),
        }

        // 保存数据
        let total = 1;
        chrome.storage.local.get({ theme: {}}, items => {
          if(Array.isArray(items.theme.user_theme_list)) {
            items.theme.user_theme_list.push(data);
          } else {
            items.theme.user_theme_list = [ data ];
          }

          chrome.storage.local.set(items, () => {
            this.changeTheme(items.theme);
            this.$message({
              type: 'success',
              message: this.lang('importSuccessTip').replace('[total]', total),
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