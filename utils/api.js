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
  const header_ = {
    'Authorization': 'Bearer ' + wx.getStorageSync("jwt"),
    'Audience': 'wechat',
    "Content-Type": "application/json" //"application/x-www-form-urlencoded"
  }
  return wx.request({
    url: urlStr,
    method: method ? method : 'get',
    data: datas,
    header: header ? header : header_,
    success: function (res) {
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

// 上传图片
function uploadFile(url, jwt, datas, filePath, successFn, failFn) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: url,
      filePath: filePath,
      name: 'imgFile',
      formData: datas,
      header: {
        'Authorization': 'Bearer ' + jwt,
        'Audience': 'wechat'
      },
      success: function (res) {
        successFn(res)
        resolve(res)
      },
      fail: function (err) {
        failFn(err);
        console.log(err)
        reject(err)
      }
    })
  })
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


function getTopAdvs() {
  return 1;
}


// 检查openid
function checkOpenid(successFn = () => {}, failFn = () => {}, completeFn = ()=> {}, header = {}) {
  let jwt = wx.getStorageSync("jwt").replace(/\s+/g, "")
  if (jwt == void 0 || jwt == null || jwt == "") {
    return false;
  }
  request(CONFIG.API_URL.WECHAT_CHECK_OPENID, "POST", {'openid': wx.getStorageSync("openid")}, header, successFn, failFn, completeFn);
}

// 上传图片 检查证件照头像是否正常 并抠图
function faceImgMatting(filePath, datas = {}, successFn = () => {}, failFn = () => {}) {
  let jwt = wx.getStorageSync("jwt").replace(/\s+/g, "")
  if (jwt == void 0 || jwt == null || jwt == "") {
    return false;
  }
  uploadFile(CONFIG.API_URL.WECHAT_FWECHAT_FACE_IMG_MATTING, jwt, datas, filePath, successFn, failFn);
}

function getStaticImgURL(name) {
  return CONFIG.API_BASE_URL + name
}

// 合成图片
function imageCompose(datas, {successFn=() => {}, failFn=() => {}, completeFn=()=> {}, header=null}) {
  console.log(wx.getStorageSync("jwt"))
  request(CONFIG.API_URL.WECHAT_IMAGE_COMPOSE, "POST", datas, header, successFn, failFn, completeFn);
}

// 将远端图片，下载到本地
function downloadImg (url) {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: url, //仅为示例，并非真实的资源
      success (res) {
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {
          console.log(res)
          resolve(res)
        } else {
          reject(res)
        }
      },
      fail (error) {
        reject(error)
      }
    })
  })
}

module.exports = {
  easyRequest: easyRequest,
  easyRequestJwt: easyRequestJwt,
  getTopAdvs: getTopAdvs,
  checkOpenid: checkOpenid,
  faceImgMatting: faceImgMatting,
  getStaticImgURL: getStaticImgURL,
  imageCompose: imageCompose,
  downloadImg: downloadImg
}