<template>
  <div id="app">
    <el-input v-model="aa"></el-input>
    <div>ss</div>
    <!-- <el-input v-model="keyword"
              placeholder="请输入内容ss"
              @input="get()"
              @keyup="get()"
              @keydown.down.prevent="selectDown"
              @keydown.up.prevent="selectUp"
              ></el-input> -->
     <input type="text" class="form-control el-input__inner" placeholder="请输入想要搜索关键字" v-model="keyword" @keyup="get($event)" @keydown.down.prevent="selectDown"
    @keydown.up.prevent="selectUp">
    <el-button @click="save2()">保存</el-button>
    <ul>
      <li class="text-center" v-for="(value, index) in myData" :key="index">
          <span class="text-success textprimary"
                :class="{gray:index==now}">{{value}}</span>
      </li>
    </ul>
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
  }),
  methods: {
    // get: function () {
    //   this.myData = {q:"sdfds",p:false,s:["sdfds","水的沸点是多少度","三等分点是什么意思","三代飞度是哪一年出的","声带肥大是什么原因","收电费的是哪个部门","送杜府杜少府之任蜀州拼音","山东福达食品有限公司","十大防盗锁芯品牌","食道分段上中下"]};
    // },
    get:function () {
        //this.myData = ["sdfds","gg"];
        chrome.storage.sync.get({data: []}, items => {
          this.myData = items.data;
      });
    },
    selectDown:function () {
        this.now++;
        if(this.now>=this.myData.length)this.now=0;
        this.keyword=this.myData[this.now];
        console.log(this.myData.length,this.now)
    },
    selectUp:function () {
        this.now--;
        if(this.now<0)this.now=this.myData.length-1;
        this.keyword=this.myData[this.now];

        console.log(this.now)
    },
    save2: function() {
      this.myData.push('dfsdf'+this.myData.length);

      chrome.storage.sync.set({
        data: this.myData,
      }, function(){
        console.log('保存成功');
      })
      console.log('save');
    }
  }
}
</script>

<style>
#app {
  width: 600px;
  height: 300px;
}
.gray{
    background-color: #dff0d8;
}
.textprimary{
    color: #3c763d;
    text-align: center;
    font-family: "Microsoft YaHei UI";
    font-size: larger;
    font-weight: bolder;
    font-size: 30px;
}
</style>
