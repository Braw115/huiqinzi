import { http } from './utils/util.js'
App({
  globalData: {
    userInfo: null
  },
  onLaunch: function (options) {
    console.log(options)
    wx.getSystemInfo({
      success: (res) => {
        //将移动区域视为井字，可视区域为中间的格子
        let { windowWidth, windowHeight } = res;
        let px2rpx = 750 / windowWidth;
        this.globalData.windowWidth = windowWidth;
        this.globalData.windowHeight = windowHeight;
        this.globalData.px2rpx = px2rpx;
      }
    })
  },
  onShow:function(){
    // wx.redirectTo({
    //   url: './pages/index/index',
    //   success: function(res) {},
    //   fail: function(res) {},
    //   complete: function(res) {},
    // })
    
  },
  onHide:function(){
    // wx.clearStorageSync();
  }
})