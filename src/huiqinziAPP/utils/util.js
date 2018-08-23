const app = getApp();

// const requestUrl = 'http://192.168.0.171:3000';
// const requestUrl = 'http://192.168.0.72:4000';
// const requestUrl = 'https://huiqinzi.aefcm.com/huiqinzitest';
// const requestUrl=  'http://192.168.0.161:4000';//雪亮


const imageUrl = 'https://huiqinzi.aefcm.com/huiqinzi/image/';//线上
const requestUrl = 'https://huiqinzi.aefcm.com/huiqinzi/api';//线上

const dayArr = ['日', '一', '二', '三', '四', '五', '六'];

function http(url, data = {}, method = 'GET') {
  let header = {};
  try {
    let token = wx.getStorageSync('token');
    let uuid = wx.getStorageSync('uuid');
    if (token) {
      header = {
        token, uuid
      }
    }
  } catch (e) {
    console.log(e)
  }
  return new Promise(function (resolve, reject) {
    wx.request({
      url: requestUrl + url,
      method: method.toUpperCase(),
      data: data,
      header: header,
      success: function (res) {
        let statusCode = +res.statusCode;
        //请求成功
        if (statusCode >= 200 && statusCode < 300) {
          resolve(res.data);
        } else if (statusCode == 401) {
          wx.showModal({
            title: '客户端错误',
            showCancel: false,
            content: res.data.error,
            success: function (res) {
              if (res.confirm) {
                wx.clearStorageSync();
                wx.redirectTo({
                  url: '/pages/index/index',
                })
              }
            },
            fail: err => {
              that.getUserInfo();
            }
          });
        } else {
          let errorTitle;
          //请求错误
          if (statusCode == 400 || (statusCode > 401 && statusCode < 500)) {
            errorTitle = "客户端错误";
          } else if (statusCode >= 500) {
            errorTitle = "服务器错误";
          }
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: res.data.error,
          })
        }
      },
      fail: function (error) {
        console.log(error);
        reject("网络异常");
      }
    })
  })
}

const formatDate = (date, fmt) => {
  date = date == +date ? +date : date;
  let d = date instanceof Date ? date : new Date(date);
  if (d.valueOf() !== d.valueOf()) return 'Invalid Date';
  var o = {
    "M+": d.getMonth() + 1, //月份
    "d+": d.getDate(), //日
    "h+": d.getHours(), //小时
    "m+": d.getMinutes(), //分
    "s+": d.getSeconds(), //秒
    "q+": Math.floor((d.getMonth() + 3) / 3), //季度
    "S": d.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}

function calcAge(date, when) {
  date = date == +date ? +date : date;
  when = when == +when ? +when : when;
  let d = date instanceof Date ? date : new Date(date);
  if (d.valueOf() !== d.valueOf()) return -1;
  let now = when ? new Date(when) : new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() - d.getMonth() < 0) age--;
  return age;
}

function ageToBirth(age) {
  let d = new Date();
  return d.setFullYear(d.getFullYear() - age);
}

function calcDistance(distance) {
  distance = +distance;
  if (distance !== distance) {
    return '未知'
  }
  if (distance < 1000) {
    return distance.toFixed(0) + 'm'
  } else {
    return (distance / 1000).toFixed(1) + 'km'
  }
}

function getImgAddress(img) {
  let absPath = /^\//
  if (img instanceof Array) {
    return img.map(val => absPath.test(val) ? imageUrl + val : val)
  }
  return absPath.test(img) ? imageUrl + img : img;
}

function formatUserInfo(userInfo) {
  if (!userInfo) return {}
  let { album, attestvideo, avatar, birthday, distance, personality } = userInfo;
  userInfo.album = getImgAddress(album);
  userInfo.attestvideo = getImgAddress(attestvideo);
  userInfo.avatar = getImgAddress(avatar);
  userInfo.age = calcAge(birthday);
  userInfo.distance = calcDistance(distance);
  userInfo.personality = getImgAddress(personality);
  return userInfo;
}

function getChatTime(date) {
  date = date == +date ? +date : date;
  let d = date instanceof Date ? date : new Date(date);
  if (d.valueOf() !== d.valueOf()) return '';
  let dayBetween = Math.abs((Date.now() - d.getTime())) / (1000 * 60 * 60 * 24);
  if (dayBetween < 1) {
    return formatDate(date, 'hh:mm')
  } else if (dayBetween < 7) {
    return '星期' + dayArr[d.getDay()] + formatDate(date, ' hh:mm')
  } else if (dayBetween < 365) {
    return formatDate(date, 'MM-dd hh:mm')
  } else {
    return formatDate(date, 'yyyy-MM-dd hh:mm')
  }
}
/**
 * setParams 路由传参封装
 */
function setParams(url, obj) {
  if (obj === undefined) return url;
  let str = [];
  for (let p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(p + "=" + obj[p]);
    }
  if (url.indexOf("?") !== -1) {
    return url + "&" + str.join("&");
  } else {
    return url + "?" + str.join("&");
  }
}

/**
 * formSubmit 收集formid 以发送后台作模板消息
 */
function formSubmit(e) {
  let formId = e.detail.formId;
  dealFormIds(formId);
}
function dealFormIds(formId) {
  let formIds = wx.getStorageSync('formIds');
  if (!formIds) formIds = [];
  if (formId != "the formId is a mock one") {
    formIds.push(formId);
  }

  wx.setStorageSync('formIds', formIds);
  console.log('1135', formIds)
}

/*获取当前页url*/
function getCurrentPageUrl() {
  var pages = getCurrentPages()    //获取加载的页面
  var currentPage = pages[pages.length - 1]    //获取当前页面的对象
  var url = currentPage.route    //当前页面url
  return url
}

/*获取当前页带参数的url*/
function getCurrentPageUrlWithArgs() {
  var pages = getCurrentPages()    //获取加载的页面
  var currentPage = pages[pages.length - 1]    //获取当前页面的对象
  var url = currentPage.route    //当前页面url
  var options = currentPage.options    //如果要获取url中所带的参数可以查看options

  //拼接url的参数
  var urlWithArgs = url + '?'
  for (var key in options) {
    var value = options[key]
    urlWithArgs += key + '=' + value + '&'
  }
  urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)

  return urlWithArgs
}

function verifyPhone(phone) {
  if (!/^1[0-9]{10}$/.test(phone)) {
    return false;
  } else {
    return true;
  }
}
function verifyPrice(price) {
  if (! /^0(.\d{1,2})?$|^[1-9](\d*(.\d{1,2})?)?$/.test(price)) {
    return false;
  } else {
    return true;
  }
}

function wxPayment(orderUuid, tips) {
  http('/appwxpay/add', {
    useruuid: wx.getStorageSync("uuid"),
    orderuuid: orderUuid
  }, 'post').then(res => {
    wx.requestPayment({
      'timeStamp': res.param.timeStamp,
      'nonceStr': res.param.nonceStr,
      'package': res.param.package,
      'signType': res.param.signType,
      'paySign': res.param.paySign,
      complete: function (c) {
        console.log(c)
        if (c.errMsg == 'requestPayment:ok') {
          wx.showToast({
            title: tips,
            icon: 'none',
            duration: 1000,
            complete: function () {
              wx.redirectTo({
                url: '../../mine/orders/orders'
              })
            }
          })
        }
      }
    })
  });


}


module.exports = {
  verifyPrice,
  verifyPhone,
  ageToBirth,
  calcAge,
  calcDistance,
  formatDate,
  formatUserInfo,
  getChatTime,
  getImgAddress,
  http,
  imageUrl,
  requestUrl,
  setParams,
  formSubmit,
  wxPayment,
  getCurrentPageUrl,
  getCurrentPageUrlWithArgs
}
