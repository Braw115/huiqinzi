// pages/mine/receiveAddress/receiveAddress.js
import { http } from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    defUuid: "dhgf4dh45dsfg45ds",
    addres: [
      // {
      //   username: "小鱼儿",
      //   addr: "广东省深圳市南山区XX村",
      //   phone: "13560481068",
      //   uuid: "dhgfdh45dsfg425ds"
      // },
      // {
      //   username: "花无缺",
      //   addr: "广东省深圳市南山区XX村",
      //   phone: "13560481068",
      //   uuid: "dhgfdh45d4sfg45ds"
      // },
      // {
      //   username: "东方不败",
      //   addr: "广东省深圳市南山区XX村",
      //   phone: "13560481068",
      //   uuid: "dhgf4dh45dsfg45ds"
      // }
    ]
  },
  delAddr: function (e) {
    var that = this;
    wx.showModal({
      content: '确认删除地址么？',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          http('/appaddress/delete', {
            addressuuid: e.currentTarget.dataset.uuid
          }, 'delete').then(res => {
            that.getAllAddr();
            wx.showToast({
              title: '删除成功！',
              icon: 'success',
              duration: 0
            })
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  defAddr: function (e) {
    var that = this;
    http('/appaddress/updateDefault', {
      useruuid: wx.getStorageSync("uuid"),
      addressuuid: e.currentTarget.dataset.uuid
    }, 'put').then(res => {
      that.getAllAddr();
      wx.showToast({
        title: '修改成功！',
        icon: 'success',
        duration: 0
      })
    });
  },
  editAddr: function (e) {
    var addr = this.data.addres[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: '../../mineDetail/address/address?addressuuid=' + addr.uuid + '&address=' + addr.address + '&contact=' + addr.contact + '&phone=' + addr.phone + '&defaul=' + addr.defaul
    })
  },

  getAllAddr:function(){
    var that = this;
    http('/appaddress', {
      useruuid: wx.getStorageSync("uuid")
    }, 'get').then(res => {
      that.setData({
        addres: res
      });
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