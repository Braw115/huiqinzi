import {
  http,
  imageUrl
} from '../../../utils/util.js'
import {
  qrAPI
} from '../../../lib/qrCode/qrcode.js'
let app = getApp();
Page({
  data: {
    placeholder: 'https://huiqinzi.aefcm.com/code/goodsdetail?uuid=' + wx.getStorageSync("uuid") + "&goodsuuid=",//默认二维码生成文本,
    canvasHidden: false,
    maskHidden: true,
    imagePath: '',
    imageUrl,
},
  onLoad: function(options) {
    console.log('option', options);
    let goodsuuid = options.goodsuuid;
    let rate = options.rate;
    this.setData({
      goodsuuid,
      rate,
     placeholder: this.data.placeholder + goodsuuid
    })
    console.log('url', this.data.placeholder)
    this.getMyInviteCard();
    this.showQrCode() 
},
  getMyInviteCard: function() {
    let uuid = this.data.goodsuuid;
    console.log('goodsuuid', uuid)
    let useruuid = wx.getStorageSync("uuid");
    http('/distribution/getMyInviteCard', {
      useruuid,
      uuid
    }, 'post').then(res => {
      let wxname = res.user.wxname;
      console.log('ss', wxname)
      let headurl = res.user.headurl;
      let useruuid = res.user.uuid;
      let goodsuuid = res.goods.uuid;
      let city = res.goods.city;
      let price = res.goods.price;
      let sharenum = res.goods.sharenum;
      let title = res.goods.title;
      let pics = res.goods.pics;
      this.setData({
        wxname,
        headurl,
        useruuid,
        city,
        price,
        sharenum,
        title,
        pics,
        goodsuuid,
        price
      })
})

  },
  //二维码
  showQrCode: function() {
    var uuid = wx.getStorageSync("uuid");
    var goodsuuid = this.data.goodsuuid
    if (uuid) {
      this.setData({
        showQrCode: true,
        showMineMenus: false
      });
      var size = this.setCanvasSize(); //动态设置画布大小
      this.createQrCode(this.data.placeholder, "mycanvas", size.w, size.h);
    } else {
      this.setData({
        showModal: true
      });
    }

  },
  hideQrCode: function() {
    this.setData({
      showQrCode: false
    });
  },
  //适配不同屏幕大小的canvas
  setCanvasSize: function() {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 686; //不同屏幕下canvas的适配比例；设计稿是750宽
      var width = res.windowWidth / scale;
      var height = width; //canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  createQrCode: function(url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    qrAPI.draw(url, canvasId, cavW, cavH);
    setTimeout(() => {
      this.canvasToTempImage(canvasId);
    }, 300);

  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function(canvasId) {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: canvasId,
      success: function(res) {
        var tempFilePath = res.tempFilePath;
        console.log('pic',tempFilePath);
        that.setData({
          imagePath: tempFilePath,
          // canvasHidden:true
        });
      },
      fail: function(res) {
        console.log(res);
      }
    });
  },
  //右上角分享
  onShareAppMessage: function() {

  }


})