<template>
  <div id="app">
    <div style="display:flex;margin-bottom: 10px;">
          <input type="text" class="el-input__inner" placeholder="请输入分组名" v-model="keyword" @keydown.down.prevent="selectDown2"
          @keydown.up.prevent="selectUp"
          @keydown.enter="open"
                @input="filter"
          autofocus="autofocus"
          style="flex:1;margin-right:10px"
          >
          <!-- <el-button>打开<i>↩</i></el-button>
          <el-button @click="save2()">保存⌘↩</el-button> -->
          <!-- <el-button @click="save2()">新增</el-button> -->
          <el-button type="default" icon="el-icon-plus" circle  @click="save2()"></el-button>
    </div>
          <!-- <ul class="infinite-list" v-infinite-scroll="load"> -->
          <ul class="infinite-list" >
            <li class=" infinite-list-item"
                      :class="{gray:index==now}"
                      v-for="(value, index) in myData" :key="index"
                @mouseover="now=index,operate=true"
                @mouseleave="operate=false"
                >
                <el-avatar shape="square" :size="30" :src="value.group[0].icon" style="background:none"><img src="./assets/fallback.png"/></el-avatar>


                <span class="text-success textprimary" v-html="value.name"></span>
<!--
                <span class="text-success textprimary">{{value.name+" "+value.group.length}}</span> -->
<!--
                 <el-popover
                  placement="right-start"
                  :title="value.name"
                  width="500"
                  trigger="hover"
                   v-show="operate && now==index">
                  <ul class="infinite-list">
                    <li class=" infinite-list-item"
                      v-for="(group, i) in value.group" :key="i">
                      <el-avatar shape="square" :size="45" :src="group.icon" style="background:none"><img src="./assets/fallback.png"/></el-avatar>
                      <span class="text-success textprimary">{{group.title}}</span>
                    </li>
                  </ul>
                  <el-button slot="reference">hover 激活</el-button>
                </el-popover> -->
                <!-- <el-button v-show="operate && now==index">重命名</el-button>
                <el-button v-show="operate  && now==index">删除</el-button> -->
                <div v-show="operate  && now==index">
                <el-button type="info" icon="el-icon-folder-opened" circle  @click="openInfo"></el-button>
                <el-button type="primary" icon="el-icon-edit" circle></el-button>
                <el-button type="danger" icon="el-icon-delete" circle></el-button>
                <el-button type="warning" icon="el-icon-refresh" circle></el-button>
                </div>

                <div v-show=" !(operate && now==index)" :style="{color: now==index ? '#33FF66' : '#339966' }">
                  <span style="margin-right: 5px;">已打开</span>
                  <span v-if="now==index">↩</span>
                </div>
            </li>
          </ul>

    <el-dialog
      :title="group.name"
      :visible.sync="detailVisible"
      width="300px" style="padding:0;">

       <ul class="info-list">
          <li class=" info-list-item" v-for="(tab, index) in group.group" :key="index">
        <el-avatar shape="square" :size="20" :src="tab.icon" style="background:none"><img src="./assets/fallback.png"/></el-avatar>
        <span csss="text-success textprimary " style="font-size:15px;margin-left:10px;
        cursor: pointer;
        flex: 1;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;" type="default" @click="openTab(tab.url)">{{ tab.title }}</span>
      </li>
       </ul>
    </el-dialog>

  </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  data: () => ({
      aa: "",
      keyword: '',
      myData: [],
      now: 0,
      operate: false,
      scrollIndex: 0,
      detailVisible: false,
      group: {},
  }),
  methods: {
    openTab: function(url) {
      alert(url)
    },
    openInfo: function() {
      this.group = this.myData[this.now];
      console.log(this.group)
      this.detailVisible = true;
    },
    selectDown2: function() {
        let self = this;


        if(window.lock == false) {
            return;
        }//*/

        window.t = setTimeout(function(){
          self.selectDown.call(self);
          window.lock = true;
        }, 1);
        window.lock=false;
    },
    selectDown:function () {
      console.info("============================================")
        this.now++;
        if(this.now>=this.myData.length) {
          this.now=0;

          this.scrollIndex = 0;
          let list = document.querySelector('.infinite-list');
          list.scrollTop = 0;
          console.log(list);
        }
        if(this.now >= this.scrollIndex+7) {
          this.scrollIndex++;
          let list = document.querySelector('.infinite-list');
          list.scrollTop = list.scrollTop+54;
          console.log(list);
        }
    },
    selectUp:function () {
        this.now--;
        if(this.now<0) {
          this.now=this.myData.length-1;

          this.scrollIndex = this.myData.length-7;
          let list = document.querySelector('.infinite-list');
          list.scrollTop =this.scrollIndex*54;
          console.log(list);
        }
        if(this.now < this.scrollIndex) {
          this.scrollIndex--;
          let list = document.querySelector('.infinite-list');
          list.scrollTop = list.scrollTop-54;
          console.log(list);
        }
    },
    load: function()  {
      console.log('ssssssssssss')
      this.myData.push(...this.myData)
    },
    save2: function() {
      chrome.tabs.query({
          currentWindow: true
      }, tabs => {
        let group = [];
        tabs.forEach(tab => {
          let icon = tab.favIconUrl;
          console.log(tab)
          if(icon == '' || icon == undefined || icon.indexOf("chrome-extension://") > -1) {
            let res = tab.url.match(/[a-zA-z-]+:\/\/[^/]+/);
            icon = res ? "chrome://favicon/size/16@2x/"+res[0] : '';
          }

          group.push({
            url: tab.url,
            title: tab.title,
            icon: icon,
          });
        })
        this.myData.push({
          name: this.keyword,
          group: group
        });
        localStorage.setItem('groups', JSON.stringify(this.myData));
      })
    },
    open: function() {console.log('ss')
      let group = this.myData[this.now].group;
      console.log(group)
      let urls = group.map(value => value['url']);
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
      {
        //if(callback) callback(tabs.length ? tabs[0].id: null);
        chrome.windows.create({
          url: urls,
          //tabId: tabs[0].id
        }, function(w){
          console.log(w)
          //alert(tabs[0].url);
          //alert(JSON.stringify(tabs));
        })
        if(tabs[0].url == "chrome://newtab/") {
          //chrome.windows.remove(tabs[0].windowId);
          chrome.tabs.remove(tabs[0].id);
        }
      });
    },
    filter: function() {
      let s = '[{"name":"ae流口水的积分收到了加快速度flkjkljlkjlkjl;kj;lkj;jlsdf  是的是神盾神盾是否   sd lkj 尽快了解昆仑决 eaa","group":[{"url":"chrome://extensions/","title":"扩展程序","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"},{"url":"chrome://newtab/","title":"新标签页"},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":""},{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"}]},{"name":"ff","group":[{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"chrome://newtab/","title":"新标签页"},{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"},{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"}]},{"name":"","group":[{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"},{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"chrome://newtab/","title":"新标签页"},{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"}]},{"name":"3z","group":[{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"https://mp.toutiao.com/auth/page/login/?redirect_url=JTJG","title":"头条号 - 你创作的，就是头条","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"},{"url":"chrome://newtab/","title":"新标签页"},{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"},{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"}]},{"name":"","group":[{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"https://mp.toutiao.com/auth/page/login/?redirect_url=JTJG","title":"头条号 - 你创作的，就是头条","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"},{"url":"chrome://newtab/","title":"新标签页"},{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"},{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"}]},{"name":"","group":[{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"},{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"https://mp.toutiao.com/auth/page/login/?redirect_url=JTJG","title":"头条号 - 你创作的，就是头条","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"},{"url":"chrome://newtab/","title":"新标签页"},{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"}]},{"name":"","group":[{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"},{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"https://mp.toutiao.com/auth/page/login/?redirect_url=JTJG","title":"头条号 - 你创作的，就是头条","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"},{"url":"chrome://newtab/","title":"新标签页"},{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"}]},{"name":"","group":[{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"},{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"},{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"https://mp.toutiao.com/auth/page/login/?redirect_url=JTJG","title":"头条号 - 你创作的，就是头条","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"},{"url":"chrome://newtab/","title":"新标签页"}]},{"name":"fffff","group":[{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"},{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"},{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"https://mp.toutiao.com/auth/page/login/?redirect_url=JTJG","title":"头条号 - 你创作的，就是头条","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"},{"url":"chrome://newtab/","title":"新标签页"}]},{"name":"","group":[{"url":"chrome://sync-internals/","title":"Sync Internals","icon":"chrome://favicon/size/16@2x/chrome://sync-internals"}]},{"name":"eeeeeeeeee","group":[{"url":"chrome://sync-internals/","title":"Sync Internals","icon":"chrome://favicon/size/16@2x/chrome://sync-internals"}]}]';
    //s = '[{"name":"ae流口水的积分收到了加快速度flkjkljlkjlkjl;kj;lkj;jl sd lkj 尽快了解昆仑决 eaa","group":[{"url":"chrome://extensions/","title":"扩展程序","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"}]}]';
    // var s =window.localStorage.getItem('groups');console.log(s)
    let find = JSON.parse(s || '[]');
    // find.push(...this.myData)
console.log('7', find)
      // let data = [];
      this.myData = find.filter(group => {
        let name="";
        for(let keyword of this.keyword.trim().toUpperCase().split(/\s+/)) {
          let index = group.name.toUpperCase().indexOf(keyword);
          if(index == -1) {
            return false;
          }

          let start = group.name.substr(0, index);
          let middle = group.name.substr(index, keyword.length);
          let end = group.name.substring(index+keyword.length);
          name = start+"<font color='red'>"+middle+"</font>"+end;
        }
        console.log(name)
        //group.name=name;
        return true;
      })
      this.now = 0;
      // this.myData = find.filter(group => {
      //   this.keyword.trim().toUpperCase().split(/\s+/).map( keyword => {
      //     group.name.toUpperCase().indexOf(keyword)
      //   }
      // })
      // this.keyword.trim().toUpperCase().split(/\s+/).map(function(a){
      //   find.
      // })
    },
  },
  mounted: function() {
    let s = '[{"name":"ae流口水的积分收到了加快速度flkjkljlkjlkjl;kj;lkj;jlsdf  是的是神盾神盾是否   sd lkj 尽快了解昆仑决 eaa","group":[{"url":"chrome://extensions/","title":"扩展程序","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"},{"url":"chrome://newtab/","title":"新标签页"},{"url":"chrome://history/","title":"历史地方是打发士大夫是否史蒂芬史蒂芬史蒂芬史蒂芬史蒂芬是否记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome://history/","title":"历史记录","icon":""},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":""},{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"}]},{"name":"ff3史蒂芬","group":[{"url":"chrome://newtab/","title":"新标签页"},{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"}]},{"name":"","group":[{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"},{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"chrome://newtab/","title":"新标签页"},{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"}]},{"name":"fff","group":[{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"}]},{"name":"","group":[{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"https://mp.toutiao.com/auth/page/login/?redirect_url=JTJG","title":"头条号 - 你创作的，就是头条","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"},{"url":"chrome://newtab/","title":"新标签页"},{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"},{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"}]},{"name":"","group":[{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"},{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"https://mp.toutiao.com/auth/page/login/?redirect_url=JTJG","title":"头条号 - 你创作的，就是头条","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"},{"url":"chrome://newtab/","title":"新标签页"},{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"}]},{"name":"","group":[{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"},{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"https://mp.toutiao.com/auth/page/login/?redirect_url=JTJG","title":"头条号 - 你创作的，就是头条","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"},{"url":"chrome://newtab/","title":"新标签页"},{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"}]},{"name":"","group":[{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"},{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"},{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"https://mp.toutiao.com/auth/page/login/?redirect_url=JTJG","title":"头条号 - 你创作的，就是头条","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"},{"url":"chrome://newtab/","title":"新标签页"}]},{"name":"fffff","group":[{"url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html","title":"OneTab","icon":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/images/extension-icon32.png"},{"url":"chrome://history/","title":"历史记录","icon":"chrome://favicon/size/16@2x/chrome://history"},{"url":"chrome-extension://gjldcdngmdknpinoemndlidpcabkggco/option.html","title":"Extension Manager","icon":"chrome://favicon/size/16@2x/chrome-extension://gjldcdngmdknpinoemndlidpcabkggco"},{"url":"chrome://extensions/","title":"扩展程序","icon":"chrome://favicon/size/16@2x/chrome://extensions"},{"url":"https://mp.toutiao.com/auth/page/login/?redirect_url=JTJG","title":"头条号 - 你创作的，就是头条","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"},{"url":"chrome://newtab/","title":"新标签页"}]},{"name":"","group":[{"url":"chrome://sync-internals/","title":"Sync Internals","icon":"chrome://favicon/size/16@2x/chrome://sync-internals"}]},{"name":"eeeeeeeeee","group":[{"url":"chrome://sync-internals/","title":"Sync Internals","icon":"chrome://favicon/size/16@2x/chrome://sync-internals"}]}]';
    //s = '[{"name":"ae流口水的积分收到了加快速度flkjkljlkjlkjl;kj;lkj;jl sd lkj 尽快了解昆仑决 eaa","group":[{"url":"chrome://extensions/","title":"扩展程序","icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png"}]}]';
    // var s =window.localStorage.getItem('groups');console.log(s)
    this.myData = JSON.parse(s || '[]');
    this.myData.push(...this.myData)
    // this.myData.push(...this.myData)


    window.aa=0;
    window.i =0;
    window.timer = null
    window.t2 = window.t1=0;
    window.flag=true;let self=this;
    window.speed=100;
    document.querySelector('.infinite-list').addEventListener("scroll", function (e) {
      clearTimeout(window.timer);
      //self.operate=false;
        window.timer = setTimeout(function() {
          window.t2 = e.target.scrollTop;
          console.log('dingshi')

          if(window.t2 == window.t1){
            console.log('调整')
            if(e.target.scrollTop%54 != 0) {
              console.log('加成')
              window.speed=1;
              console.log(e.target.scrollTop%54, window.speed)
              if(window.flag) { // 向下滚动
                //window.speed = e.target.scrollTop%54/3;
                e.target.scrollTop += 1;
                //e.target.scrollTop = Math.ceil(e.target.scrollTop/54)*54;
              } else {
                //window.speed = (54-e.target.scrollTop%54)/3;
                e.target.scrollTop -= 1;
                //e.target.scrollTop = Math.floor(e.target.scrollTop/54)*54;
              }
            } else {
              console.log('滚动结束了')
              //self.operate=true;
              window.speed=100;
              self.scrollIndex=e.target.scrollTop/54;
              if(self.now < self.scrollIndex) self.now = self.scrollIndex;
              else if(self.now >= self.scrollIndex+7) self.now = self.scrollIndex+7-1;
              console.log(self.now+" "+self.scrollIndex)
            }
          }
        }, window.speed);

        window.flag = window.t1 < e.target.scrollTop
        window.t1 = e.target.scrollTop;

      console.log(e)
    })


  }
}
</script>

<style>
#app {
  width: 500px;
  border: 1px solid red;
  padding:10px;
}
.gray{
    background: #82848a;
    color: white !important;
}
.textprimary{
    text-align: left;
    font-family: "Microsoft YaHei UI";
    font-size: 20px;
    margin-left:5px;
    flex: 1;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
}
.infinite-list {
    padding: 0;
    margin: 0;
    max-height: 376px;
    min-height: 376px;
    overflow: scroll;
}
.infinite-list-item {
    padding: 2px 5px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: left;
    height: 50px;
    color: black;
    list-style: none;
    display: flex;
}
.info-list {
    padding: 0;
    margin: 0;
    font-size: 15px;
}
.info-list-item {
    padding: 5px;
    align-items: center;
    justify-content: left;
    color: black;
    list-style: none;
    display: flex;
}
.info-list-item span:hover {
  color: #409eff;
  text-decoration: underline;
}
.el-dialog__header {
  padding: 10px 53px 0 16px !important;
  text-align: center;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
}
.el-dialog__body{
  padding: 10px 10px 10px 10px !important;
  min-height: 90px;
  max-height: 210px;
  overflow: auto;
}
</style>
