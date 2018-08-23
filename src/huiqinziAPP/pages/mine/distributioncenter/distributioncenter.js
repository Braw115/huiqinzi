import { http, imageUrl, setParams } from '../../../utils/util.js'
Page({
  data: {
    choseTab: "sp2@2x",
    cancel: false,
    goodsArr: [],
    imageUrl: imageUrl,
    price: '',
    choseTab: "mine",

  },
  onLoad: function (options) {
    this.getGoods();

  },
  choseTab: function (e) {
    this.setData({
      choseTab: e.currentTarget.id
    });

    switch (e.currentTarget.id) {
      case "mine":
        this.getGoods();
        break;
      case "order":
        this.getGoods();
        break;
      case "withdraw":
        // submitGetCash();
        break;

    }

  },
  //热销商品
  getGoods: function () {
    http('/distribution/getGoods', { useruuid: wx.getStorageSync('uuid') }, 'get').then(res => {
      let rate = res.rate;
      this.setData({ goodsArr: res.goodss.res.slice(0, 10), rate })
    })


  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '分销商品',
      path: '/page/user?id=123',
      success: function (res) {
        wx.showToast({
          title: '转发成功',
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '转发失败',
        })
      }
    }

  },
  cancel: function () {
    this.setData({
      cancel: !this.data.cancel,
    })
  },
  getInvitecard: function () {
    console.log('跳转邀请卡')
    wx.navigateTo({
      url: setParams('../../mine/share/share', {
        goodsArr: this.data.goodsArr

      }),
    })
  }



})