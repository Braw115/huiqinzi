import { http, imageUrl} from '../../../utils/util.js'
Page({
 data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getdistributionOrder();
  },
  getdistributionOrder:function(){
    http('/distribution/getDistributeOrder',{useruuid:wx.getStorageSync("uuid")},'post').then(res=>{
      console.log('简单',res)
      let income=res.income;
      let orderNum=res.orderNum;
      console.log('orderArr', res.distributeOrders)
      this.setData({ income, orderNum, orderArr: res.distributeOrders})
    })
   
  },
  onShareAppMessage: function () {
  
  }
})