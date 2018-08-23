// pages/goodsDeatil/groupBuy/groupBuy.js
import {
  http,
  imageUrl
} from '../../../utils/util.js'
import WxParse from '../../../lib/wxParse/wxParse.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    normIdx: 'null',
    imageUrl: imageUrl,
    showService: false,
    servicePhone: "027-85241679",
    groupingNum: 85
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    var scence = decodeURIComponent(options.q)
    let params = {}
    if (options.goodsuuid) {
      params.goodsuuid = options.goodsuuid
    } else {
      let paramArr = scence.split('&')
       paramArr.forEach(v => {
      let parm = v.split('=')
         params[parm[0]] = parm[1]
      })
    }

    this.setData(params);
  //  if (!wx.getStorageSync("uuid")) {
  //     wx.showModal({
  //       title: '提示',
  //       content: '请登陆后再查看该商品详情！',
  //       showCancel: false,
  //       complete: function(res) {
  //         wx.clearStorageSync();
  //         wx.redirectTo({
  //           url: '/pages/index/index?uuid=' + params.uuid + "&goodsuuid=" + params.goodsuuid,
  //         })
  //       },
  //     })
  //     return;
  //   }
  },
  showService: function() {
    this.setData({
      showService: !this.data.showService
    });
  },
  getGroups: function(uuid) {
    var that = this;
    console.log('uuidaa', uuid)
    http('/appactivity/act', {
      activityuuid: uuid
    }, 'get').then(res => {
      var groups = [],
        banners = [];
      res.groups.map((e, i) => {
        if (e.state != 'success') {
          groups.push(e);
        };
      });
      res.act.pics.map((e, i) => {
        if (e.indexOf('activitybanner') == 0) {
          banners.push(e)
        }
      })
      res.act.closetime = res.act.closetime.replace(/-/g, '/');
      that.setData({
        currentGoods: res.act,
        pricetag: res.act.pricetag,
        banners: banners.length > 0 ? banners : res.act.pics.splice(0, 3),
        buyPage: res.act.substance ? 'shopping/shopping' : 'paradise/paradise',
        groups: groups
      })
      that.leftTimer()
      WxParse.wxParse('activityDetail', 'html', res.act.detail, that, 5);
      wx.setNavigationBarTitle({
        title: wx.getStorageSync('categorys')[res.act.category]
      })
    });
  },
  leftTimer: function() {
    var that = this,
      leftTime = (new Date(that.data.currentGoods.closetime)) - (new Date()); //计算剩余的毫秒数 
    if (leftTime > 999) {
      var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
      var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
      var minutes = parseInt(leftTime / 1000 / 60 % 60, 10); //计算剩余的分钟 
      var seconds = parseInt(leftTime / 1000 % 60, 10); //计算剩余的秒数 
      hours = that.checkTime(hours);
      minutes = that.checkTime(minutes);
      seconds = that.checkTime(seconds);
      that.setData({
        leftTime: {
          days,
          hours,
          minutes,
          seconds
        }
      });
      if (!that.timer) {
        that.timer = setInterval(function() {
          that.leftTimer()
        }, 1000);
      }
    } else {
      if (that.timer) {
        clearInterval(that.timer)
      }
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '该商品或活动已结束！',
        complete: function() {
          wx.navigateBack({
            delta: 1
          })
        }
      })
    }
  },
  checkTime: function(i) { //将0-9的数字前面加上0，例1变为01 
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  },
  choseNorm: function(e) {
    var idx = Number(e.currentTarget.dataset.idx),
      // i = this.data.normIdxs.indexOf(idx),
      // bool = i == -1,
      // tempNormIdxs = this.data.normIdxs,
      tempPricetag = this.data.pricetag;
    tempPricetag.map((e, i) => {
      e.checked = false;
    })

    tempPricetag[idx].checked = true;
    // bool ? tempNormIdxs.push(idx) : tempNormIdxs.splice(i, 1);
    this.setData({
      normIdx: idx,
      normIdxs: [idx],
      pricetag: tempPricetag
    });
  },
  gotoBuy: function(e) {
    var data = this.data,
      group = e.currentTarget.dataset.group;
    if (data.pricetag.length > 0 && data.normIdx == 'null') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '请选择商品规格再购买！',
      })
      return;
    }
    if (data.currentGoods.reservation && !(data.startDate && data.endDate)) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '该商品需要预约，请选定预约起始日期！',
      })
      return;
    }
    var date = JSON.stringify({
      start: data.startDate,
      end: data.endDate
    }); // year:data.year,month:data.month,
    wx.navigateTo({
      url: "../../goodsBuy/" + data.buyPage + "?uuid=" +
        data.currentGoods.uuid + "&groupuuid=" + group + "&normIdx=" + (data.normIdx || 0) +
        "&date=" + date
    })
  },
  getDates: function(y, m) {
    var arr = [],
      arrT = [],
      temp,
      d = new Date(y, m, 0).getDate(),
      e = new Date(Date.UTC(y, m - 1, 1)).getDay();
    for (var i = 0; i < 42; i++) {
      if (i < e || i > d + e - 1) {
        temp = "";
      } else {
        temp = i - e + 1;
      }
      arrT.push(temp);

      if (i % 7 == 6) {
        arr.push(arrT);
        arrT = [];
      }
    }
    this.setData({
      datesArr: arr
    });
  },
  nextMonth: function() {
    var y = this.data.year,
      m = this.data.month + 1;
    if (m == 13) {
      m = 1;
      y++;
    }
    this.getDates(y, m);
    this.setData({
      year: y,
      month: m
    });
  },
  preMonth: function() {
    var y = this.data.year,
      m = this.data.month - 1;
    if (m == 0) {
      m = 12;
      y--;
    }
    this.getDates(y, m);
    this.setData({
      year: y,
      month: m
    });
  },
  choseDate: function(e) {
    var data = this.data,
      cDate = e.currentTarget.dataset.date;
    if (!data.startDate) {
      this.setData({
        startDate: cDate
      });
    } else {
      if (data.startDate > cDate) {
        this.setData({
          endDate: data.startDate,
          startDate: cDate
        });
      } else {
        this.setData({
          endDate: cDate
        });
      }
    }
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this,
      y = new Date().getFullYear(),
      m = new Date().getMonth() + 1;
    that.getDates(y, m);
    that.setData({
      normIdx: 'null',
      year: y,
      month: m
    });
    that.getGroups(that.data.goodsuuid);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(this.timer)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
    }
    return {
      path: "pages/index/index?goodsuuid=" + this.data.currentGoods.uuid + "&uuid=" + wx.getStorageSync("uuid"),
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
})