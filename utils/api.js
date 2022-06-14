import { CONFIG } from './config'
import Promise from './es6-promise'
import { getCurrentPageUrl } from './util.js'

let DEBUG = true;// 切换数据入口
// var Mock = require('mock.js')
// var demoDatas = require('datas.js')
var app = getApp()
function request(urlStr, method, datas, header, successFn, failFn, completeFn) {
  if (datas) {

  } else {
    datas = {};
  }
  return wx.request({
    url: urlStr,
    method: method ? method : 'get',
    data: datas,
    header: header ? header : { "Content-Type": "application/json" },
    success: function (res) {
      var url = getCurrentPageUrl()
      if (res.data.code === 401 && url != "pages/login/login") {
        app.globalData.originURL = url
        wx.reLaunch({
          url: '/pages/login/login'
        })
      }
      successFn(res);
    },
    fail: function () {
      if (failFn != void 0) {
        failFn();
      }
    },
    complete: function () {
      if (completeFn!=void 0) {
        completeFn();
      }
    }
  }).onHeadersReceived((res) => {
    let jwt = res.header
    if (jwt.Authorization) {
      let token = jwt.Authorization
      token = token.replace("Bearer ", "")
      wx.setStorageSync("jwt", token)
    }
  });
}

// 获取用户信息
function easyRequest(method, url, datas, jwt) {
  let header = { 
    "Content-Type": "application/x-www-form-urlencoded",
    'Audience': "wechat"
    }

  if (jwt!=void 0 && jwt!=null && jwt!="") {
    header = {
      "Content-Type": "application/x-www-form-urlencoded",
      'Authorization': "Bearer " + jwt,
      'Audience': "wechat"
    }
  }
  return new Promise((resolve, reject) => {
    request(
      url, 
      method, 
      datas, 
      header, 
      resolve, 
      reject);
  })
}

function easyRequestJwt(method, url, datas) {
  let jwt = wx.getStorageSync("jwt").replace(/\s+/g, "")
  if (jwt == void 0 || jwt == null || jwt == "") {
    return new Promise((resolve, reject) => {
      var url = getCurrentPageUrl()
      app.globalData.originURL = url
      wx.reLaunch({
        url: '/pages/login/login'
      })
    })
  }
  return easyRequest(method, url, datas, jwt);
}

//服务器获取行业数据，并缓存到本地
function getIndustryData() {
  let industryList = wx.getStorageSync(CONFIG.CACHE.INDUSTRY)
  if (!industryList) {
    easyRequest("POST", CONFIG.API_URL.INDUSTRY, {}).then(res=>{
      wx.setStorageSync(CONFIG.CACHE.INDUSTRY, res.data.data)
    });
  }
  return industryList;
}


module.exports = {
  easyRequest: easyRequest,
  easyRequestJwt: easyRequestJwt,
  getIndustryData: getIndustryData
}