<template>
  <div
    class="other-advertising">

    <el-alert
      type="info"
      style="margin-bottom: 20px">
      <div slot="title">
        <p>这些是我自己从各大平台上精心挑选的商品，全部都是热销产品，质量有保证，价格和大家自己网上搜索的一样，不会说在这里买就会变贵，都是一样的，不一样的是我可以额外获得佣金，算是导购的报酬。</p>
        <p>本插件后面将会增加一些更高级的功能，不过这需要额外购买服务器，希望大家多多支持。</p>
        <p>因商家促销或其它原因，价格可能会有变化，请以实际购买价格为准。</p>
      </div>
    </el-alert>
    <el-card
      v-if="country == 'zh_CN'"
      class="box-card"
      header="京东搜索">
      <div style="min-width: 335px;">
        <div style="float: left; width: 131px;">
          <img src="@/assets/images/shops/search-logo.png">
        </div>
            <div>
          <div style="overflow: hidden; zoom: 1; padding-top: 10px;">
            <div style="z-index: 11; height: 30px; margin-bottom: 3px; border: 3px solid #E4393C">
              <div style="height: 30px; overflow: hidden">
                <div style="width: 78px; float: right;">
                  <input type="button" value="搜索" @click="JDSearch(JDSearchValue)" style="width: 100%; margin: 0; padding: 0; height: 30px; border: 0; width: 78px; background: #E4393C; font-size: 14px; font-weight: 700; color: #fff; cursor: pointer;">
                </div>
                <div style="overflow: hidden; zoom: 1; height: 30px;">
                  &nbsp; <input type="text" v-model="JDSearchValue" autocomplete="off" @keydown="$event.keyCode==13 && JDSearch(JDSearchValue)" accesskey="s" id="key" style="display:inline-block; margin: 0; height: 30px;padding:0 2px; line-height:30px; border: 0; width: 90%; background-position: 0 -360px; background-color: #fff; background-repeat: repeat-x; color: #999; font-family: arial, '\5b8b\4f53'; font-size: 14px;outline:none;">&nbsp;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    <el-card
      v-if="country != 'zh_CN'"
      class="box-card"
      header="Amazon Search"
      :body-style="{ display: 'flex', backgroundColor: '#232f3e', alignItems: 'center' }">
      <div style="width: 100px;margin-right: 20px;">
        <img src="@/assets/images/shops/amazon.jpg" style="width: 100%;">
      </div>
      <div style="flex: 1;">
        <el-input
          class="amazon-search"
          spellcheck="false"
          v-model="amazonSearchValue"
          @keydown.native="$event.keyCode==13 && amazonSearch(amazonSearchValue)">
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="amazonSearch(amazonSearchValue)"></el-button>
        </el-input>
      </div>
    </el-card>
    <!-- maxHeight: '457px' -->
    <el-card
      class="box-card"
      header="商品推荐"
      :body-style="{ overflow: 'auto' }">
      <div
        v-for="(goods, index) in allGoods"
        :key="index"
        class="good-box"
        @mousedown.prevent>
        <span>
          <img
            :src="'./img/'+goods.pic"
            style="width: 120px; height: 120px;cursor: pointer;"
            title="点击可查看更多商品信息"
            @click="$open(goods.url, getKeyType($event))" />
        </span>
        <span style="flex: 1;margin-left: 10px;padding: 10px;height: 100%;display: flex;flex-direction: column;">
          <div
            class="goods-name"
            title="点击可直接购买商品，谢谢支持！"
            @click="$open(goods.url, getKeyType($event))" >{{ goods.name }}</div>
          <div
            class="goods-description"
            v-html="goods.description"
            ref="goods_description"></div>
          <div style="color:red;margin-top: 5px;margin-bottom: 5px;">
            <span title="因商家促销或其它原因，价格可能会有变化，请以实际购买价格为准。">{{ goods.unit+goods.price }}</span>
            <el-tooltip
              placement="top"
              effect="light"
              transition="">
              <svg-icon
                name="qrcode-solid"
                class="hover2"
                style="width:17px;height: 17px;color: #606266;float:right;cursor: default;"
                @mouseenter.native="getQrcode(index)"></svg-icon>
              <div
                slot="content"
                class="qrcode-box">
                <!-- <div
                  class="goods-qrcode"
                  :id="'goods-qrcode-'+index"
                  style="width: 200px; height: 200px;margin-bottom: 10px;cursor: pointer"
                  @click="$open(goods.url, getKeyType($event))"></div> -->
                <img
                  class="goods-qrcode"
                  :src="qrcodeImgUrls[index]"
                  @click="$open(goods.url, getKeyType($event))" />
                <div>谢谢支持！</div>
                <div>使用 京东APP “扫一扫” 即可购买。</div>
              </div>
            </el-tooltip>
            <span
              title="来自京东平台"
              class="hover2"
              style="border-radius: 2px;font-size:12px;padding:1px 4px;float:right;margin-right: 10px;"
              :style="{ backgroundColor: goods.platform.background_color,
                        color: goods.platform.color }"
              @click="openPlatform(goods.platform.text, goods.name)">{{ goods.platform.text }}</span>
          </div>
        </span>
      </div>
    </el-card>

    <el-backtop target=".el-main" :bottom="100">
    </el-backtop>

  </div>
</template>
<script>

import QRCode from 'qrcode'
import advertising_config from "@/config/advertising_config.json"

const COUNTRY = {
  CHINA: 1,
  OTHER: 2,
}

export default {
  name: 'OtherAdvertising',
  data() {
    return {
      country: this.lang('@@ui_locale'), // 'zh_CN',
      amazonSearchValue: 'mobile',
      JDSearchValue: '',
      qrcodeImgUrls: {},
    }
  },
  computed: {
    allGoods() {
      let country = this.country == 'zh_CN' ? COUNTRY.CHINA : COUNTRY.OTHER;
      return advertising_config.filter(item => item.country == country);
    }
  },
  methods: {
    getQrcode(index) {
      if(this.qrcodeImgUrls[index]) return;
      console.log('gggggggg')

      let goods  = this.allGoods[index];
      QRCode.toDataURL(goods.url, {
        errorCorrectionLevel: 'L',
        quality: 1,
        margin: 0,
        width: 200,
      },(error, url)=>{
        console.log(error, url);

        if(error) return;

        // this.qrcodeImgUrls[index] = url;
        this.$set(this.qrcodeImgUrls, index, url);
      })
    },

    openPlatform(platform, name) {
      if(platform == 'Amazon') {
        this.amazonSearch(name);
      } else if(platform == '京东') {
        this.JDSearch(name);
      }
    },
    JDSearch(value) {
      let url = 'https://union-click.jd.com/jdc?type=union&p=JF8BAGoKGloXWwIKUlZeOE8nAl8JKx9KBVhdDxxtUQ5SQmQWBR1TGxlZAUEPVhcnV20AE14RDQZXBwtVDU1HVGYAGwwRWAYDBwkPCh5CAjg4RB9IADYBVV5ZCE0XBm4PK2sVXDYyZG5tOEonM184&t=W1dCFBBFC0RUQUpADgpQTFs=&e=&tu='+encodeURIComponent('http://search.jd.com/Search?keyword='+value+'&enc=utf-8');
      window.open(url);
    },
    amazonSearch(value) {
      let url = 'https://www.amazon.com/gp/search?ie=UTF8&tag=cocong-20&linkCode=ur2&linkId=17322288f8b3f551908623e03d8f3638&camp=1789&creative=9325&index=aps&keywords='+encodeURIComponent(value);
      window.open(url);
    }
  },
  mounted() {
    // todo
    window.oa = this;

    if(this.allGoods.length > 0) {
      let index = Math.floor(Math.random()*this.allGoods.length);
      this.JDSearchValue = this.allGoods[index].name;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.other-advertising {
  padding:20px;
}

.box-card {
  margin-bottom: 20px;
}

.good-box {
  display: flex;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  align-items: center;
  height: 125px;
  cursor: default;
  padding: 20px 0;
  border-bottom: 1px solid #ddd;
}
.good-box:first-child {
  padding-top: 0;
}
.good-box:last-child {
  padding-bottom: 0;
  border: 0;
}
.qrcode-box {
  text-align: center;
  font-size: 12px;
  color: #666666;
  cursor: default;
}
.goods-name {
  font-weight: 300;
  font-size: 18px;
  color: #333333;
  text-align: left;
  margin-bottom: 10px;
  cursor: pointer;
}
.goods-name:hover {
  color: #E1251B;
}
.goods-description {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
}
.goods-qrcode {
  width: 200px;
  height: 200px;
  margin-bottom: 10px;
  cursor: pointer;
}

.amazon-search >>> .el-input-group__append{
  background-color: #febd69;
  color: black;
  border: 0;
}
.amazon-search >>> .el-input__inner {
  font-size: 15px;
}
.amazon-search >>> .el-input__inner:focus {
  border-color: #febd69;
  border-width: 3px;
}
.amazon-search >>> .el-icon-search {
  font-weight: 900;
}
</style>

<style>

</style>