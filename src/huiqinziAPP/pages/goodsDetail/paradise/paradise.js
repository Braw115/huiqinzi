// pages/goodsDeatil/paradise/paradise.js
import { http, imageUrl } from '../../../utils/util.js'
import WxParse from '../../../lib/wxParse/wxParse.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    normIdxs: [],
    imageUrl: imageUrl,
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    weeks: ["日", "一", "二", "三", "四", "五", "六"],
    showService: false,
    servicePhone: "027-85241679"
  },
  showService: function () {
    this.setData({ showService: !this.data.showService });
    // wx.makePhoneCall({
    //   phoneNumber: '18825216402' //仅为示例，并非真实的电话号码
    // })
  },
  choseNorm: function (e) {
    var idx = Number(e.currentTarget.dataset.idx),
      // i = this.data.normIdxs.indexOf(idx),
      // bool = i == -1,
      // tempNormIdxs = this.data.normIdxs,
      tempPricetag = this.data.pricetag;
    tempPricetag.map((e, i) => {
      e.checked = false;
    })

    tempPricetag[idx].checked = true;
    // bool ? tempNormIdxs.push(idx) : tempNormIdxs.splice(i, 1);
    this.setData({
      normIdx:idx,
      normIdxs: [idx],
      pricetag: tempPricetag
    });
  },
  leftTimer: function () {
    var leftTime = (new Date(this.data.currentGoods.closetime)) - (new Date()); //计算剩余的毫秒数 
    if (leftTime > 999) {
      var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
      var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
      var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);//计算剩余的分钟 
      var seconds = parseInt(leftTime / 1000 % 60, 10);//计算剩余的秒数 
      hours = this.checkTime(hours);
      minutes = this.checkTime(minutes);
      seconds = this.checkTime(seconds);
      this.setData({
        leftTime: { days, hours, minutes, seconds }
      });
    }
  },
  checkTime: function (i) { //将0-9的数字前面加上0，例1变为01 
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  },
  gotoBuy: function () {
    if (this.data.pricetag.length > 0 && this.data.normIdxs.length == 0) {
      wx.showToast({
        title: '请选定商品规格！',
        icon: "none",
        duration: 1000
      })
    } else if (this.data.currentGoods.reservation && (!this.data.startDate || !this.data.endDate)) {
      wx.showToast({
        title: '请选定预约时间！',
        icon: "none",
        duration: 1000
      })
    } else {
      wx.setStorageSync("normIdxs", this.data.normIdxs);
      wx.navigateTo({
        url: '../../goodsBuy/paradise/paradise?start=' + this.data.startDate + "&end=" + this.data.endDate
      })
    }
  },
  getDates: function (y, m) {
    var arr = [], arrT = [], temp,
      d = new Date(y, m, 0).getDate(),
      e = new Date(Date.UTC(y, m - 1, 1)).getDay();
    for (var i = 0; i < 42; i++) {
      if (i < e || i > d + e - 1) {
        temp = "";
      } else {
        temp = i - e + 1;
      }
      arrT.push(temp);

      if (i % 7 == 6) {
        arr.push(arrT);
        arrT = [];
      }
    }
    this.setData({
      datesArr: arr
    });
  },
  nextMonth: function () {
    var y = this.data.year,
      m = this.data.month + 1;
    if (m == 13) {
      m = 1;
      y++;
    }
    this.getDates(y, m);
    this.setData({
      year: y,
      month: m
    });
  },
  preMonth: function () {
    var y = this.data.year,
      m = this.data.month - 1;
    if (m == 0) {
      m = 12;
      y--;
    }
    this.getDates(y, m);
    this.setData({
      year: y,
      month: m
    });
  },

  choseDate: function (e) {
    var data = this.data,
      cDate = e.currentTarget.dataset.date;
    if (!data.startDate) {
      this.setData({
        startDate: cDate
      });
    } else {
      if (data.startDate > cDate) {
        this.setData({
          endDate: data.startDate,
          startDate: cDate
        });
      } else {
        this.setData({
          endDate: cDate
        });
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    var y = new Date().getFullYear(),
      m = new Date().getMonth() + 1,
      that = this,
      goods = wx.getStorageSync("currentGoods");

    that.getDates(y, m);
    that.setData({
      currentGoods: goods,
      pricetag: goods.pricetag,
      banners: goods.pics,
      year: y,
      month: m
    });
    WxParse.wxParse('activityDetail', 'html', wx.getStorageSync("currentGoods").detail, that, 5);

    that.timer = setInterval(function () { that.leftTimer() }, 1000);
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('categorys')[that.data.currentGoods.category]
    })
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
    clearInterval(this.timer)
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})