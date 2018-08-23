import { http, imageUrl, setParams } from '../../../utils/util.js'
Page({
  data: {
    choseTab: "sp2@2x",
    cancel:false,
    goodsArr:[],
    imageUrl: imageUrl,
    price:'',
  
  },
  onLoad: function (options) {
    this.getGoods();
  
  }, 
  //热销商品
  getGoods:function(){
    http('/distribution/getGoods', { uuid: wx.getStorageSync("uuid") },'post').then(res=>{
      console.log(res)
      let rate=res.rate;
      let goodss = res.goodss;
      for (var i = 0; i < goodss.length;i++)
      {
        let goodsuuid = goodss[i].uuid;
        this.setData({goodsuuid})
      } 
      
       this.setData({ goodsArr: res.goodss.slice(0, 10), rate})
    })
  },
  onShareAppMessage:function(res){
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
 cancel:function(){
    this.setData({
      cancel: !this.data.cancel,      
    })
  },
 getInvitecard:function(){
   console.log('跳转邀请卡')
//    http('/distribution/getMyInviteCard', {
//      useruuid:wx.getStorageSync("uuid"),
//      uuid: this.data.goodsuuid,
//    }, 'post').then(res => {
//      let wxname = res.user.wxname;
//      console.log('ss', wxname)
//      let headurl = res.user.headurl;
//      let useruuid = res.user.uuid;
//      let goodsuuid = res.goods.uuid;
//      let city = res.goods.city;
//      let price = res.goods.price;
//      let sharenum = res.goods.sharenum;
//      let title = res.goods.title;
//      let pics = res.goods.pics;
//      console.log('ssss', title)
//      this.setData({
//        wxname,
//        headurl,
//        useruuid,
//        city,
//        price,
//        sharenum,
//        title,
//        pics,
//        goodsuuid,
//      })
//  })
   wx.navigateTo({
   url: setParams('../../mine/share/share', {
     goodsuuid: this.data.goodsuuid,
     rate: this.data.rate,
    //  wxname: this.data.wxname,
    //  headurl: this.data.headurl,
    //  useruuid:  this.data.useruuid,
    //  city: this.data.city,
    //  price:  this.data.price,
    //  sharenum:  this.data.sharenum,
    //  title: this.data.title,
    //  pics:  this.data.pics
  }),
   })
 }
  
  


})
