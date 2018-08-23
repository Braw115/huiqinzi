import { http, imageUrl, requestUrl, verifyPrice } from '../../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },
  onLoad: function (options) {
    let balance = options.balance;
    console.log('可提现金额', balance)
    this.setData({ balance})
  
  },
  listenInput: function (e) {
    this.setData({
      [e.currentTarget.id]: e.detail.value
    });
  },

  submitGetCash: function () {
    console.log('提交')
    var that = this;
    if (!verifyPrice(that.data.amount)) {
      wx.showToast({
        title: '提现金额填写有误！',
        icon: "none",
        duration: 1000,
        complete: () => {
        }
      });
      return;
    }
    if (that.data.amount > that.data.balance || !(that.data.amount > 0)) {
      wx.showToast({
        title: '提现金额必须大于0且不能大于可提现金额！',
        icon: 'none',
        duration: 1000
      })
    } else {
      http('/appwithdraw/apply', {
        useruuid: wx.getStorageSync('uuid'),
        amount: Number(that.data.amount),
        remark: that.data.remark
      }, 'post').then(res => {
        wx.showToast({
          title: '提现申请提交成功！',
          icon: 'success',
          duration: 5000,
          complete: () => {
            wx.navigateTo({
              url: '../../mineDetail/getCashHistory/getCashHistory',
            })
          }
        })
      });
    }

  },

})