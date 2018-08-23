// pages/typeEntrance/groupBuy/groupBuy.js
import { http, imageUrl, requestUrl } from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    timer:null,
    page: 1,
    count: 6,
    detailPage:"groupBuy/groupBuy",
    activities: [],
    detailUrl:"../../goodsDetail/groupBuy/groupBuy"
    
  },
  getSubCatogerys: function (uuid) {
    var that = this;
    http('/crmcategory/sub', {
      uuid: uuid,
      start: 0,
      length: 100
    }, 'get').then(res => {
      that.setData({
        subCatogerys: res.category,
        activeSubCatogery: res.category[0].uuid
      });
      that.getAllGoods();
    });
  },
  getAllGoods: function () {
    var that = this;
    http('/appactivity/group', {
      page: that.data.page,
      count: that.data.count,
      category: that.data.catogeryUuid,
      subcategory: that.data.activeSubCatogery,
      city: wx.getStorageSync("currentP")
    }, 'get').then(res => {
      res.activity.map((e, i) => {
        var t = e.closetime.replace(/-/g, '/');
        e.closetime = t;
        for (let i = 0, length = e.pics.length; i < length; i++) {
          if (e.pics[i].indexOf('activitybanner/') == 0) {
            e.img = e.pics[i]
            break;
          }
        }
      });
      that.setData({
        activities: that.data.activities.concat(res.activity)
      });
      that.leftTimer();
      that.timer = setInterval(function () { that.leftTimer() }, 1000);
    });
  },
  saveCurrentActivity: function (e) {
    wx.setStorageSync("currentGoods", this.data.activities[e.currentTarget.dataset.idx])
  },
  choseActionType: function (event) {
    this.setData({
      activeSubCatogery: event.currentTarget.id,
      activities: []
    });
    this.getAllGoods();
  },
  leftTimer: function () {
    var t = [];
    this.data.activities.map((e, i) => {
      var leftTime = (new Date(e.closetime)) - (new Date()); //计算剩余的毫秒数 
      if (leftTime > 999) {
        var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
        var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
        var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);//计算剩余的分钟 
        var seconds = parseInt(leftTime / 1000 % 60, 10);//计算剩余的秒数 
        // days = days==0?" ":days+"天 ";
        hours = this.checkTime(hours);
        minutes = this.checkTime(minutes);
        seconds = this.checkTime(seconds);
        // return  days + "天" + hours + "小时" + minutes + "分" + seconds + "秒";
        e.leftTime = { days, hours, minutes, seconds};//days + hours + ":" + minutes + ":" + seconds;
        t.push(e);
      }
    });
    this.setData({
      activities: t
    });
  },
  checkTime: function (i) { //将0-9的数字前面加上0，例1变为01 
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      catogeryUuid: options.uuid
    });
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('categorys')[options.uuid]
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let uuid = this.data.catogeryUuid;
    this.setData({
      activities: []
    });
    this.getSubCatogerys(uuid);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.timer);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      page: ++this.data.page
    });
    this.getAllGoods();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})