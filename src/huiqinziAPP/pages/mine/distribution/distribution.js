// pages/mine/distribution.js
import { http, imageUrl, requestUrl, verifyPrice } from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgDef: "../../../img/mine/shop.png",
    imageUrl: imageUrl,
    storelogo: "../../../img/mine/shop.png",
    choseTab: "mine",
    tips: "提现操作是人工操作，管理人员收到申请将金额提现到你提供的账户中，没填写"
  },
  switchChange: function (e) {
    http('/appwxusers/switch', {
      uuid: wx.getStorageSync('uuid')
    }, 'put').then(res => {
      this.getDistribution();
      that.setData({
        wxUSer: res,
        logo: res.storelogo,
        storelogo: res.storelogo ? imageUrl + res.storelogo : "../../../img/mine/shop.png"
      });
    });
  },
  choseTab: function (e) {
    this.setData({
      choseTab: e.currentTarget.id
    });

    switch (e.currentTarget.id) {
      case "mine":
        this.getDistribution();
        break;
      case "order":
        this.getRebateOrders();
        break;
      case "withdraw":
        // submitGetCash();
        break;

    }

  },

  getRebateOrders: function () {
    var that = this;
    http('/apporders/rebate', {
      useruuid: wx.getStorageSync('uuid')
    }, 'get').then(res => {
      that.setData({
        rebateOrders: res
      });
    });
  },
  imageLoad: function (e) {
    var that = this;
    //获取图片的原始宽度和高度  
    let originalWidth = e.detail.width;
    let originalHeight = e.detail.height;
    var scale = originalWidth / originalHeight;
    var height = 40 * originalHeight / originalWidth;
    const ctx = wx.createCanvasContext('attendCanvasId');
    ctx.drawImage(that.data.tempFilePath, 0, 0, 40, height);
    ctx.draw(true, function (result) {
      wx.canvasToTempFilePath({
        width: 40,
        height: height,
        canvasId: 'attendCanvasId',
        success: function success(res) {
          that.setData({
            canvasImgUrl: res.tempFilePath
          });
          wx.uploadFile({
            url: requestUrl + '/uploads/pics',
            filePath: that.data.canvasImgUrl,
            name: 'pic',
            header: {
              uuid: wx.getStorageSync("uuid"),
              token: wx.getStorageSync("token"),
              'content-type': "multipart/form - data"
            },
            formData: {
              fileType: "logo"
            },
            success: function (res) {
              that.setData({ storelogo: imageUrl + JSON.parse(res.data)[0], logo: JSON.parse(res.data)[0] });
              that.changeShopName();
              if (that.data.wxUser.storelogo) {
                http('/uploads/pics', {
                  url: that.data.wxUser.storelogo
                }, 'delete').then(res => {
                  wx.showToast({
                    title: '店铺logo已经更换成功！',
                    icon: 'success',
                    duration: 1000
                  });
                });
              } else {
                wx.showToast({
                  title: '店铺logo已经成功上传！',
                  icon: 'success',
                  duration: 1000
                });
              }

            }
          })
        },
        complete: function complete(e) {
        }
      });
    });



  },
  choseLogo: function () {
    var that = this;
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        that.setData({
          tempFilePath: tempFilePaths[0]
        });
      }
    })
  },
  changeShopName: function () {
    http('/appwxusers/update', {
      useruuid: wx.getStorageSync("uuid"),
      storename: this.data.wxUSer.storename,
      logo: this.data.logo
    }, 'put').then(res => {
      wx.showToast({
        title: '店名与logo修改成功！',
        icon: 'success',
        duration: 1000
      });
    });
  },
  getDistribution: function () {
    var that = this;
    http('/appwxusers', {
      useruuid: wx.getStorageSync('uuid')
    }, 'get').then(res => {
      that.setData({
        wxUSer: res,
        logo: res.storelogo,
        storelogo: res.storelogo ? imageUrl + res.storelogo : "../../../img/mine/shop.png"
      });
    });
  },
  submitGetCash: function () {
    var that = this;
    if (!verifyPrice(that.data.amount)) {
      wx.showToast({
        title: '提现金额填写有误！',
        icon: "none",
        duration: 1000,
        complete:()=>{
        }
      });
      return;
    }
    if (that.data.amount > that.data.wxUSer.balance || !(that.data.amount>0)) {
      wx.showToast({
        title: '提现金额必须大于0且不能大于可提现金额！',
        icon: 'none',
        duration: 1000
      })
    } else {
      http('/appwithdraw/goods', {
        useruuid: wx.getStorageSync('uuid'),
        amount: Number(that.data.amount),
        remark: that.data.remark
      }, 'post').then(res => {
        wx.showToast({
          title: '提现申请提交成功！',
          icon: 'success',
          duration: 1000,
          complete: () => {
            wx.navigateTo({
              url: '../../mineDetail/getCashHistory/getCashHistory',
            })
          }
        })
      });
    }

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
    this.getDistribution();
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