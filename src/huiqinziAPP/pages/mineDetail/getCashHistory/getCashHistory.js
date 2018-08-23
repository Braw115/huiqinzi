// pages/mineDetail/getCashHistory/getCashHistory.js
import { http, imageUrl, requestUrl } from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    states: {
      success: "提现成功",
      failed: "提现失败",
      handling: "处理中"
    },
    // histories: [
    //   {
    //     time: "2018-3-12",
    //     cashNum: "88",
    //     state: "success"
    //   },
    //   {
    //     time: "2018-3-12",
    //     cashNum: "88",
    //     state: "failed"
    //   },
    //   {
    //     time: "2018-3-12",
    //     cashNum: "88",
    //     state: "handling"
    //   }
    // ]
  },
  getCashHistory: function () {
    var that = this;
    http('/appwithdraw/notes', {
      useruuid: wx.getStorageSync('uuid')
    }, 'get').then(res => {
      that.setData({
        histories: res
        // wxUSer: res,
        // logo: res.storelogo,
        // storelogo: res.storelogo ? imageUrl + res.storelogo : "../../../img/mine/shop.png"
      });
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCashHistory();
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})