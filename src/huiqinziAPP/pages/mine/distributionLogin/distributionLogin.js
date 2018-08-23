import { http,imageUrl} from '../../../utils/util.js'
let app = getApp();
Page({
 data: {
   imageUrl,
   active:false,
   
  },
 onLoad: function (options) {
   this.getInviteCode();
   this.getdistribution();
   },
  onShow:function(){
    // this.getdistribution();
    // clearInterval(avatar);
    // avatar=setInterval(this.getdistribution, 1000);
    let avatar;
    // this.getdistribution();
    //设置消息巡回的时间
    // clearInterval(avatar);
    // avatar = setInterval(this.getdistribution, 2000);
    // // this.onLoad();
  },
  onHide: function () {
    // clearInterval(avatar)
  },
  onUnload: function () {
    // clearInterval(avatar)
  },
  getInviteCode:function(){
    console.log('useruuid', wx.getStorageSync("uuid"))
    http('/distribution/getInviteCode', { uuid: wx.getStorageSync("uuid") }, 'post').then(res => {
      this.setData({ inviteCode: res.inviteCode})
    })
  
  },
  getdistribution:function(){
    http('/distribution/open', { useruuid: wx.getStorageSync("uuid") },'post').then(res=>{
      console.log('人数',res.length)
      if(res.length>2)
      {
        this.setData({active:true})
      }
      this.setData({person:res,})
  })
 },
  gotodistribution:function(){
    if(this.data.active){
    wx.navigateTo({
      url: '../../mine/minedistribution/minedistribution',
    })
    }
  }


})