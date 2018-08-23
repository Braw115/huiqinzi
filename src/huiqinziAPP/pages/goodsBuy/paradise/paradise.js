// pages/goodsBuy/paradise/paradise.js
import { http, imageUrl, verifyPhone, wxPayment } from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageUrl: imageUrl,
    amount: 1,
    groupuuid: "",
    name: '不不不',
    phone: '18845231689',
    remark: '发的后果'
  },
  changeBuyNum: function () {
    this.setData({
      totalCash: this.data.price * 100 * this.data.amount / 100
    });
  },
  gotoPay: function () {
    var that = this;
    if (that.data.groupuuid =='notGroup') {
      that.generalBuy();
    } else {
      that.doGroupBuy();
    }
  },
  doGroupBuy: function (join) {
    if (!verifyPhone(this.data.phone)) {
      return;
    }
    var that = this,
      data = that.data,
      groupuuid = data.groupuuid,
      params = {
        useruuid: wx.getStorageSync("uuid"),
        name: data.name,
        phone: data.phone,
        remark: data.remark,
        ext: data.reservationDate
      };
    switch (groupuuid) {
      case 'notGroup':
        that.generalBuy();
        break;
      case 'openGroup':
        params.activityuuid = data.currentGoods.uuid;
        http('/appactivity/open', params, 'post').then(res => {
          wxPayment(res.order.uuid, '已成功开团！')
        });
        break;
      default:
        params.activityuuid = data.currentGoods.uuid;
        params.groupuuid = data.groupuuid;
        http('/appactivity/join', params, 'post').then(res => {
          wxPayment(res.order.uuid, '已成功参团!')
        });
        break;
    }
  },
  generalBuy: function () {
    var data = this.data,
      specification = [{
        'name': data.currentGoods.pricetag[data.normIdx].name,
        'type': data.currentGoods.pricetag[data.normIdx].type
      }];
   
    http('/apporders/act', {
      useruuid: wx.getStorageSync("uuid"),
      activityuuid: data.currentGoods.uuid,
      specification: JSON.stringify(specification),
      amount: data.amount,
      contact: data.name,
      phone: data.phone,
      remark: data.remark,
      ext: data.reservationDate
    }, 'post').then(res => {
      wxPayment(res.order.uuid, '已成功购买该活动!')
    });
  },
  reduceNum: function () {
    var t = --this.data.amount;
    this.setData({
      amount: t == 0 ? 1 : t
    });
    this.changeBuyNum();
  },
  addNum: function () {
    this.setData({
      amount: ++this.data.amount
    });
    this.changeBuyNum();
  },
  listenInput: function (e) {
    this.setData({
      [e.currentTarget.id]: e.detail.value
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var goods = wx.getStorageSync("currentGoods"),
      normIdx = options.normIdx,
      price = options.groupuuid ?  goods.groupbyprice : goods.price;
    this.setData({
      start: options.start || "",
      end: options.end || "",
      activityUuid: goods.uuid,
      groupuuid: options.groupuuid ,
      currentGoods: goods,
      price: price,
      totalCash: price,
      normIdx: normIdx,
      reservationDate:options.date
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