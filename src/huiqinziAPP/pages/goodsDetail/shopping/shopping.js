// pages/goodsDetail/shopping/shopping.js
import { http, imageUrl } from '../../../utils/util.js'
import WxParse from '../../../lib/wxParse/wxParse.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    normIdxs: [],
    showDetail: false,
    imageUrl: imageUrl,
    goodsBuyUrl: "../../goodsBuy/shopping/shopping",
    buyNum: 1,
    choseNorm: "blue"
  },
  choseBuyNum: function (event) {
    var num = this.data.buyNum;
    if (event.target.id == "reduce") {
      num > 1 ? num-- : "";
    } else {
      num++;
    }
    this.setData({
      buyNum: num
    })
  },
  loadContent: function () {
    console.log('circle 下一页');
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
      normIdxs: [idx],
      pricetag: tempPricetag
    });
  },
  gotoBuy: function () {
    if (this.data.normIdxs.length == 0) {
      wx.showToast({
        title: '请选定商品规格！',
        icon: "none",
        duration: 1000
      })
    } else {
      wx.setStorageSync("normIdxs", this.data.normIdxs);
      wx.navigateTo({
        url: '../../goodsBuy/shopping/shopping?buyNum=' + this.data.buyNum
      })
    }
  },
  leftTimer: function () {
    var leftTime = (new Date(this.data.goods.closetime)) - (new Date()); //计算剩余的毫秒数 
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
    var that = this,
      goods = wx.getStorageSync("currentGoods");
    that.setData({
      goods: goods,
      pricetag: goods.pricetag
    });
    WxParse.wxParse('goodsDetail', 'html', goods.detail, that, 5);
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('categorys')[goods.category]
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
      showDetail: true
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})