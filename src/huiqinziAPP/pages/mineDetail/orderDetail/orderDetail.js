// pages/mineDetail/orderDetail/orderDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status:"waitUse",
    statuses:
    {
      waitUse: "待使用",
      waitPay: "待付款",
      waitSend: "待发货",
      waitReceived: "待收货",
      fished: "已完成"
    },
    order:{
      title: "[南山]两人抢深圳顽雪ColorSnow~1对1专业滑雪课程+蹦床+ 50元代金券~免费滑雪装备~有效期到6.30",
      norms:"39.9元/两人(大小同价)",
      begin:"2018-03-10",
      end:"2018-03-11",
      price:"88",
      verifyCode:"dsf45ygd54rstds",
      num:"1",
      identifier:"106 9002 3359 3935",
      orderTime:"2018-02-24 16:15:34",
      payWay:"微信支付"
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      order: wx.getStorageSync('currentGoods')
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