// pages/search/search.js
import { http } from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },
  cancleSearch: function () {
    wx.navigateBack({
      url: "../index/index"
    })
  },
  gotoHotSearchResult: function (event) {
    wx.navigateTo({
      url: '../searchResult/searchResult?search=' + event.currentTarget.dataset.k,
    })
  },
  doSearch: function (e) {
    this.setData({
      [e.currentTarget.id]: e.detail.value
    });
    wx.navigateTo({
      url: '../searchResult/searchResult?search=' + e.detail.value,
    });
    
  },
  getHotSearchs:function(){
    var that = this;
    http('/crmsystem', {}, 'get').then(res => {
      res.map((e,i)=>{
        if (e.name =="hotsearch"){
          that.setData({
            hotsearchs:e.value
          });
        }
      });
    });
  },
  getMySearchs: function () {
    var that = this;
    http('/appactivity/mysearch', {
      useruuid:wx.getStorageSync("uuid")
    }, 'get').then(res => {
      that.setData({
        mySearchs:res
      });
    });
  },
  clearMySearch:function(){
    var that = this;
    
    wx.showModal({
      title: '提示',
      content: '是否清空最近搜索记录？',
      success: function (res) {
        if (res.confirm) {
          http('/appactivity', {
            useruuid: wx.getStorageSync("uuid")
          }, 'delete').then(res => {
            wx.showToast({
              title: '最近搜索记录已清空！',
            })
            that.getMySearchs();
          });
        } else if (res.cancel) {
        }
      }
    })
    
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
    this.getHotSearchs();
    this.getMySearchs();
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