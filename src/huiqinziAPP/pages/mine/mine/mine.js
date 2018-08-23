import { http, imageUrl, setParams } from '../../../utils/util.js'
Page({
 data: {
    choseTab: "mine", 
  },
  onLoad: function (options) {
    this.getIncome();
  
  },
getIncome:function(){
    http('/distribution/getGoods', { uuid: wx.getStorageSync("uuid") }, 'post').then(res => {
      let rate = res.rate;
      let totalincom = res.wxuser.totalincom;
      let todayIncome = res.wxuser.todayIncome;
      let balance=res.wxuser.balance;
      console.log('累积收益',totalincom)
      this.setData({ rate, totalincom, balance, todayIncome})
    })
},
withdraw:function(){
 wx.navigateTo({
   url: setParams('../../mine/withdraw/withdraw', {
     balance: this.data.balance})
 })
},
customService: function () {
    wx.makePhoneCall({
      phoneNumber: '027-85241678',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }

})