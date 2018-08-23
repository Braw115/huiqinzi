import {
  http,
  imageUrl,
  setParams
} from '../../utils/util.js'
import {
  qrAPI
} from '../../lib/qrCode/qrcode.js'
let app = getApp();

Page({
  data: {
    // showModal: false,
    showQrCode: false,
    imageUrl: imageUrl,
    showMineMenus: false,
    storeLogo: "../../img/mine/shop.png",
    currentAddr: "广东",
    showAddrs: false,
    cancel:false,
    code:'',
    businessAddrs: ["广东"],
    catogeryEntrances: {
      "rushBuy": "rushBuy",
      "groupBuy": "groupBuy",
      "shopping": "shopping",
      "paradise": "paradise",
      "earlyTeach": "paradise",
      "takePhoto": "paradise",
      "education": "paradise",
      "parentingTourism": "paradise",
      "parentingRestaurant": "paradise",
      "outDoor": "paradise"
    },
    mineMenus: [{
        img: "orders",
        name: "我的订单",
        link: "showMineMenus"
      },
      {
        img: "receiveAddress",
        name: "我的地址",
        link: "showMineMenus"
      },
      {
        img: "distributionLogin",
        name: "分销后台",
        link: "showMineMenus"
      },
      {
        img: "QRCode",
        name: "我的二维码",
        link: "showQrCode"
      }
    ],
    placeholder: 'https://huiqinzi.aefcm.com/code/minprogram?uuid=' + wx.getStorageSync("uuid"), //默认二维码生成文本,
    canvasHidden: false,
    maskHidden: true,
    imagePath: '',

  },
  gotoSearchPage: function() {
    wx.navigateTo({
      url: '../search/searching/searching',
    })
  },
  choseHotSell: function(e) {
    // wx.setStorageSync("currentGoods", this.data.hotSells[e.currentTarget.dataset.idx]);
  },
  showMineMenus: function() {
    this.setData({
      showMineMenus: (!this.data.showMineMenus)
    });
  },
  showAddrs: function(event) {
    var that = this;
    that.setData({
      showAddrs: (!that.data.showAddrs)
    })
  },
  chooseAddr: function(event) {
    this.setData({
      currentAddr: event.currentTarget.dataset.addr,
      showAddrs: (!this.data.showAddrs)
    });
    wx.setStorageSync("currentP", event.currentTarget.dataset.addr);
  },
  getBanner: function() {
    var that = this;
    http('/crmbanner', {}, 'get').then(res => {
      res.map((e, i) => {
        if (e.pic.indexOf("activity") == 0) {
          if (e.groupbyprice) {
            e.nav = "groupBuy/groupBuy";
          } else {
            e.nav = "paradise/paradise";
          }
        } else {
          e.nav = "shopping/shopping";
        }
      });
      that.setData({
        banners: res
      });
    });
  },
  getCatogerys: function() {
    var that = this;
    http('/crmcategory', {
      start: 0,
      length: 100
    }, 'get').then(res => {
      let category = {};
      let categorys = {};
      res.category.map((e, i) => {
        let nav = that.data.catogeryEntrances[e.key];
        category[e.uuid] = nav + '/' + nav;
        categorys[e.uuid] = e.name;
      })
      wx.setStorageSync('categoryToDetail', category)
      wx.setStorageSync('categorys', categorys)
      that.setData({
        catogerys: res.category,
        categoryToDetail: category
      });
      that.getBanner();
      that.getHotSell();
    });
  },
  getHotSell: function() {
    var that = this;
    http('/appactivity/hot', {}, 'get').then(res => {
      res.res.map((e, i) => {
        var t = e.closetime.replace(/-/g, '/');
        e.closetime = t;
        e.nav = that.data.categoryToDetail[e.category];
        for (let i = 0, length = e.pics.length; i < length; i++) {
          if (e.pics[i].indexOf('activitybanner/') == 0) {
            e.img = e.pics[i]
            break;
          }
        }
      });
      that.setData({
        hotSells: res.res.slice(0, 10)
      });
    });
  },
  showQrCode: function() {
    var uuid = wx.getStorageSync("uuid");
    if (uuid) {
      this.setData({
        showQrCode: true,
        showMineMenus: false
      });
      var size = this.setCanvasSize(); //动态设置画布大小
      this.createQrCode('https://huiqinzi.aefcm.com/code/minprogram?uuid=' + uuid, "mycanvas", size.w, size.h);
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
      this.canvasToTempImage();
    }, 300);

  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function() {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function(res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
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
  gotoActDetail: function(e) {
    wx.navigateTo({
      url: '../goodsDetail/groupBuy/groupBuy?goodsuuid=' + e.currentTarget.dataset.goodsuuid
    })
  },
  onLoad: function(option) {
    console.log('index',option)
    var p = decodeURIComponent(option.q),
      that = this;
    that.setData({
      parent: option.uuid || p.split("=")[1] || 'noparent',
      goodsuuid: option.goodsuuid || null
    });
    this.triggleModal();
    wx.login({
      success: res => {
        that.setData({
          jsCode: res.code
        });
      }
    })
  },
  getUserInfo: function(info) {
    console.log(info)
    if (info.detail.userInfo) {
      this.setData({
        username: info.detail.userInfo.nickName,
        userHeader: info.detail.userInfo.avatarUrl
      });
      this.login();
    }

  },
  onShow: function() {
    this.getCatogerys();
    this.triggleModal();
  },
  triggleModal: function() {
    this.setData({
      showModal: !(wx.getStorageSync("token") && wx.getStorageSync("uuid"))
    });
  },
  // 登录
  login: function() {
    var that = this;
    var obj = {
      jscode: that.data.jsCode,
      headurl: that.data.userHeader,
      wxname: that.data.username
    };
    this.setData(obj)
    if (that.data.parent != 'noparent') {
      obj.upuseruuid = that.data.parent
    }
    http('/appwxusers/login', obj, 'post').then(res => {
      wx.setStorageSync("token", res.token);
      wx.setStorageSync('uuid', res.uuid);
      that.setData({
        storeName: res.store.name ? res.store.name : "暂未设定店名",
        storeLogo: res.store.logo ? that.data.imageUrl + res.store.logo : "../../img/mine/shop.png",
      });
      wx.setStorageSync("currentP", that.data.currentAddr);
      wx.showToast({
        title: '登陆成功！',
        icon: 'success',
        duration: 1000,
        complete: function(res) {
        let goodsuuid = that.data.goodsuuid
          console.log(goodsuuid)
          if (goodsuuid) {
            wx.navigateTo({
              url: '/pages/goodsDetail/groupBuy/groupBuy?goodsuuid=' + goodsuuid,
            })
          }
        }
      });
    }, err => {
      wx.showToast({
        title: err + '！',
        icon: 'none',
        duration: 1000
      })
    });

  },
  //去商品详情
  gotogoodsdetail:function(){
    var hotgoods=this.data.hotSells;
    console.log(hotgoods)
    for(var i=0;i<hotgoods.length;i++)
    {
      let goodsuuid = hotgoods[i].uuid
      console.log(goodsuuid)
      wx.navigateTo({
        url: setParams('../goodsDetail/groupBuy/groupBuy?goodsuuid',{goodsuuid}),
     })
    }
  },
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      path: "pages/index/index?uuid=" + wx.getStorageSync("uuid"),
      success: function(res) {
        wx.showToast({
          title: '已成功分享！',
          icon: 'success',
          duration: 500
        })
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function() {},
  /**
   * 隐藏模态对话框
   */
  hideModal: function() {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function() {
    this.hideModal();
  },
  onConfim: function() {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onHide: function() {

  },
  cancel: function () {
    this.setData({
      showMineMenus:false,
      cancel: !this.data.cancel,
    })
  },
  code:function(e){
   this.setData({
     code: e.detail.value
   })  
  },
  submitcode:function(){
   if(this.data.code.length>6)
   {
     wx.showModal({
       content: '邀请码为六位数',
     })
     return
   }
   var obj={
     invitecode:this.data.code,
     uuid: wx.getStorageSync('uuid')
    }
   http('/distribution/writeInviteCode',obj,'post').then(res=>{
     wx.showToast({
       title: '填写成功',
       
     }); this.cancel();
     
   },err=>{
     });
  }
  
})