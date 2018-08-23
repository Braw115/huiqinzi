// pages/mine/orders/orders.js
import { http, imageUrl, wxPayment } from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageUrl: imageUrl,
    imgDef: "../../../img/mine/shop.png",
    activeType: "",
    types: [
      {
        aType: "",
        aName: "全部"
      }, {
        aType: "wait-pay",
        aName: "待支付"
      }, {
        aType: "wait-use",
        aName: "待使用"
      }, {
        aType: "wait-send",
        aName: "待发货"
      }, {
        aType: "shipped",
        aName: "已发货"
      }, {
        aType: "used",
        aName: "已使用"
      }, {
        aType: "wait-join",
        aName: "待组团"
      }
    ],
    status:
    {
      'wait-pay': '待支付',
      'wait-use': '待使用',
      'wait-send': '待发货',
      'shipped': '已发货',
      'used': '已使用',
      'wait-join': '待组团'
    }

  },
  choseActionType: function (event) {
    this.setData({
      activeType: event.currentTarget.id
    });
    this.getAllOrders();
  },
  getAllOrders: function () {
    var that = this;
    http('/apporders/self', {
      useruuid: wx.getStorageSync("uuid"),
      state: this.data.activeType
    }, 'get').then(res => {
      that.setData({
        orders: res
      });
    });
  },
  orderDetail: function (event) {

    var state = event.currentTarget.dataset.state,
      idx = Number(event.currentTarget.dataset.idx),
      uuid = event.currentTarget.dataset.uuid;
  },
  gotoLogisticsInfo: function (event){
    var uuid = event.currentTarget.dataset.uuid;
    wx.navigateTo({
      url: '../../mineDetail/logisticsInfo/logisticsInfo?orderuuid=' + uuid,
    })
  },
  gotoPay: function (event){
    var uuid = event.currentTarget.dataset.uuid;
    wxPayment(uuid, '该订单已成功付款!');
  },
  gotoUse: function (event) {
    var index = event.currentTarget.dataset.idx;
    wx.navigateTo({
      url: '../../mineDetail/orderDetail/orderDetail',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
    wx.setStorageSync('currentGoods', this.data.orders[index])
  },
  deleteOrder: function (event) {
    var uuid = event.currentTarget.dataset.uuid;
    var that = this;
    http('/apporders', {
      orderuuid: uuid
    }, 'delete').then(res => {
      that.getAllOrders()
      wx.showModal({
        title: '提示',
        content: '成功删除订单！',
        showCancel: false,
        complete: function(res) {
        },
      })
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAllOrders()
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