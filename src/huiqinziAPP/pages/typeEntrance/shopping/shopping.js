// pages/shopping/shopping.js
import { http, imageUrl, requestUrl } from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    count: 6,
    imageUrl: imageUrl,
    showAddrs: false,
    addresses: ["广东", "湖南", "湖北", "江西", "云南", "四川", "北京", "上海", "重庆"],
    shoppingDetail: "../../goodsDetail/groupBuy/groupBuy",
    goodsListSP: []
  },
  choseActionType: function (event) {
    this.setData({
      activeSubCatogery: event.currentTarget.id,
      goodsListSP: []
    });
    this.getAllGoods();
  },
  showAddrs: function (event) {
    var that = this;
    that.setData({
      showAddrs: (!that.data.showAddrs)
    })
  },
  getSubCatogerys: function (uuid) {
    var that = this;
    http('/crmcategory/sub', {
      uuid: uuid,
      start: 0,
      length: 100
    }, 'get').then(res => {
      that.setData({
        subCatogerys: res.category,
        activeSubCatogery: res.category[0].uuid
      });
      that.getAllGoods();
    });
  },
  
  getAllGoods: function () {
    var that = this;
    http('/appactivity/ordinary', {
      page: that.data.page,
      count: that.data.count,
      category: that.data.catogeryUuid,
      subcategory: that.data.activeSubCatogery,
      city: wx.getStorageSync("currentP")
    }, 'get').then(res => {
      res.activity.map((e, i) => {
        e.closetime = e.closetime.replace(/-/g, '/');
        for (let i = 0, length = e.pics.length; i < length; i++) {
          if (e.pics[i].indexOf('activitybanner/') == 0) {
            e.img = e.pics[i]
            break;
          }
        }
      })
      that.setData({
        goodsListSP: that.data.goodsListSP.concat(res.activity)
      })
    });
    
  },
  saveCurrentGoods: function (e) {
    wx.setStorageSync("currentGoods", this.data.goodsListSP[e.currentTarget.dataset.idx])
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      catogeryUuid: options.uuid
    });

    wx.setNavigationBarTitle({
      title: wx.getStorageSync('categorys')[options.uuid]
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
    let uuid = this.data.catogeryUuid;
    this.setData({
      goodsListSP: []
    });
    this.getSubCatogerys(uuid);
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
      page: ++this.data.page,
    });
    this.getAllGoods();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})