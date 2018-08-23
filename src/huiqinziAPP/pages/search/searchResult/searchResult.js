// pages/search/searchResult/searchResult.js
import { http } from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },
  doSearch:function(e){
    this.doSearching(e.detail.value);
  },
  doSearching:function(kw){
    var that = this,
    result = [];
    http('/appactivity/search', {
      useruuid:wx.getStorageSync("uuid"),
      search: kw,
      city: wx.getStorageSync("currentP")
    }, 'get').then(res => {
        res.goods.map((e,i)=>{
          var t = e.closetime.replace(/-/g, '/');
          e.closetime = t;
          e.nav = "shopping/shopping";
          for (let i = 0, length = e.pics.length; i < length; i++) {
            if (e.pics[i].indexOf('activitybanner/') == 0) {
              e.img = e.pics[i]
              break;
            }
          }
          result.push(e);
        });
        res.act.map((e, i) => {
          e.nav = e.groupbyprice ? "groupBuy/groupBuy" :"paradise/paradise";
          result.push(e);
        });
        that.setData({
          activityList:result
        });
    });
  },
  saveCurrentActivity: function (e) {
    wx.setStorageSync("currentGoods", this.data.activityList[e.currentTarget.dataset.idx])
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    this.setData({
      search: option.search      
    });
    this.doSearching(option.search);
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