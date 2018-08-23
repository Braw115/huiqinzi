import { http, imageUrl, requestUrl } from '../../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageUrl,
    count: 6
  },
  getHotSell: function () {
    var that = this;
    http('/appactivity/hot', {}, 'get').then(res => {
      res.res.map((e, i) => {
        var t = e.closetime.replace(/-/g, '/');
        e.closetime = t;
        e.nav = that.data.categoryToDetail[e.category]
        for (let i = 0, length = e.pics.length; i < length; i++) {
          if (e.pics[i].indexOf('activitybanner/') == 0) {
            e.img = e.pics[i]
            break;
          }
        }
      });
      that.setData({
        hotSells: res.res
      });
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      categoryToDetail: wx.getStorageSync('categoryToDetail')
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
    this.getHotSell()
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