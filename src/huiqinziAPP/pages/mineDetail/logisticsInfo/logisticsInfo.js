// pages/mineDetail/logisticsInfo/logisticsInfo.js
import { http, imageUrl } from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  getTraceCompany:function(code){
    var that = this;
    http('/crmlogistics/bycode', {
      shippercode: code
    }, 'get').then(res => {
      that.setData({
        traceCompany: res.shippername
      });
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      orderuuid: options.orderuuid
    });
    http('/crmlogistics/getTrace', {
      orderuuid: options.orderuuid
    }, 'get').then(res => {
      that.getTraceCompany(res.shippercode);
      that.setData({
        logisticsInfo: res
      });
    });
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