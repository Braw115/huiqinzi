// pages/goodsBuy/goods/goods.js
import { http, imageUrl, wxPayment } from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageUrl: imageUrl,
    chosePayWay: "weChat",
    hasAddr: false,
    amount: 1,
    choseNorm: "blue",
    totalPrice: "600",
    totalExpress: "0.0",
    payWays: [
      { way: "weChat", name: "微信支付", img: "../../../img/goodsBuy/payWay1.png" }
    ]
  },
  getAllAddr: function () {
    var that = this;
    http('/appaddress', {
      useruuid: wx.getStorageSync("uuid")
    }, 'get').then(res => {
      var temp = false;
      if (res.length == 0) {
        wx.showModal({
          title: '提示',
          content: '您尚未添加任何收货地址，是否马上前往地址管理页面添加？',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../../mineDetail/address/address'
              })
            }
          }
        })
      } else {
        res.map((e, i) => {
          if (e.defaul == "yes") {
            temp = e;
            return;
          }
        });

      }
      that.setData({
        defAddr: temp
      });
    });
  },
  goodsBuy: function () {
    var data = this.data;
    if (!data.defAddr) {
      wx.showModal({
        title: '提示',
        content: '您尚未添加任何收货地址，是否马上前往地址管理页面添加？',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../../mineDetail/address/address'
            })
          }
        }
      })
      return;
    }

    var address = JSON.stringify(
      {
        contact: data.defAddr.contact,
        phone: data.defAddr.phone,
        address: data.defAddr.address
      }),
      useruuid = wx.getStorageSync("uuid"),
      specification = [
        {
          'name': data.currentGoods.pricetag[data.normIdx].name,
          'type': data.currentGoods.pricetag[data.normIdx].type
        }
      ],
      params = {
        activityuuid: data.currentGoods.uuid,
        useruuid: useruuid,
        name: data.defAddr.contact,
        phone: data.defAddr.phone,
        address: address,
        remark:''
      };
    switch (data.groupuuid) {
      case 'notGroup':
        http('/apporders/goods', {
          useruuid: useruuid,
          activityuuid: data.currentGoods.uuid,
          specification: JSON.stringify(specification),
          amount: Number(data.amount),
          address: address
        }, 'post').then(res => {
          wxPayment(res.order.uuid, '已成功购买改商品!')
        });
        break;
      case 'openGroup':
        http('/appactivity/open', params, 'post').then(res => {
          wxPayment(res.order.uuid, '已成功开团！')
        });
        break;
      default:
        params.groupuuid = data.groupuuid;
        http('/appactivity/join', params, 'post').then(res => {
          wxPayment(res.order.uuid, '已成功参团!')
        });
        break;
    }
  },
  reduceNum: function () {
    var t = --this.data.amount;
    this.setData({
      amount: t == 0 ? 1 : t
    });
    this.getTotalCash();
  },
  addNum: function () {
    this.setData({
      amount: ++this.data.amount
    });
    this.getTotalCash();
  },
  listenInput: function (e) {
    this.setData({
      [e.currentTarget.id]: e.detail.value
    });
  },
  getTotalCash: function () {
    this.setData({
      totalCash: this.data.amount * this.data.price
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var goods = wx.getStorageSync("currentGoods"),
      normIdx = options.normIdx,
      price = options.groupuuid != 'noGroup' ? goods.groupbyprice : goods.price;
    this.setData({
      goodsUuid: goods.uuid,
      currentGoods: goods,
      normIdx: normIdx,
      groupuuid: options.groupuuid,
      price: price,
      totalCash: price
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
    this.getAllAddr();

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