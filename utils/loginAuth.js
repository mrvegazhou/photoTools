import { CONFIG } from './config'
import { showError } from './util'


//判断用户有没有授权过期，登录服务器获取服务器用户信息
function getUserInfoInServer(originURL) {
  return new Promise(function (resolve, reject) {
    if (!checkJWT()) {
      const app = getApp()
      app.globalData.originURL = originURL
      wx.navigateTo({
        url: '../login/login',
      });
    } else {
      app.globalData.originURL = originURL
      //从服务器获取用户信息 因为跳转到登录就会判断微信用户是否授权
      checkLogin().then(res => {
        resolve()
      }, err => {
        wx.navigateTo({
          url: '../login/login',
        });
      }).catch((err)=>{
        reject(err);
      });
    }
  })
  
}

// 检查登录态
// 从未登录过的返回 false
// 已经登录过，但是 session 过期的自动重新登录
function checkLogin() {
  return new Promise(function(resolve, reject) {
    if (wx.getStorageSync('jwt')) {
      checkSession().then(
      () => {
        resolve(true);
      },
      () => {
        doLogin()
        reject(false);
      }).catch((err) => {
        console.info('checkLogin:', err)
        reject(err);
      });
    } else {
      reject(false);
    }
  });
}

// 登录态检查函数，用于判定小程序端的 session 是否过期
function checkSession() {
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

function checkJWT() {
  try {
    var value = wx.getStorageSync("jwt")
    if (!value) {
      return false;
    }
  } catch (e) {
    return false;
  }
  return true;
}

function doMobile(e) {
  let code = null;
  return new Promise((resolve, reject) => { 
    checkSession().then(res=>{
      let ency = e.detail.encryptedData;
      let iv = e.detail.iv;
      let sessionKey;
      let userInfo = wx.getStorageSync('userInfo')
      sessionKey = userInfo.sessionKey
      if (e.detail.errMsg != 'getPhoneNumber:fail user deny') {
        p({
          url: CONFIG.API_URL.WECHAT_MOBILE,
          data: {
            encrypData: ency,
            ivData: iv,
            sessionKey: sessionKey
          },
          method: 'POST',
        }).then(resMobile => {
          let mobile = resMobile.data.data
          console.log(mobile);
        })
      } else {
        showError("授权手机号失败！");
      }
    }, err=>{
      login().then(res => {
        code = res.code
        p({
          url: CONFIG.API_URL.SESSION_KEY,
          data: {
            code: code
          },
          method: 'POST',
        }).then(res2 => {
        })
      })
    }).catch((err)=>{
      reject(err);
    });
  });
}

function doLogin(userInfo="") {
  return new Promise((resolve, reject) => {
    return login().then(res => {
      if(res.code) {
        p({
          url: CONFIG.API_URL.WECHAT_LOGIN,
          data: {
            platCode: res.code,
            userInfo: userInfo
          },
          method: 'POST',
        }).then(res => {
          wx.setStorageSync('jwt', res.data.data.jwt);
          wx.setStorageSync('openid', res.data.data.openid);
          resolve(res)
        }).catch((err) => {
          reject('request failed');
        });
      }
    }).catch((err) => {
      reject("wechat failed");
    });
  })
}

// login 函数，用于获取 code
function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

// getUserInfo 函数，用于获取用户信息
function getUserInfo() {
  return new Promise(function(resolve, reject) {
    wx.getUserInfo({
      withCredentials: true,
      success: function(res) {
        resolve(res);
      },
      fail: function(err) {
        reject(err);
      }
    })
  })
}

function userAuthorized() {
  //wx.getsetting是获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限
  return new Promise(function (resolve, reject) {
    wx.getSetting({
      success: data => {
        if (data.authSetting['scope.userInfo']) {
          resolve(1);
        } else {
          reject(0);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  })
}

function p({
  url,
  data = {},
  method = "GET",
  login = false
}) {
  if (login) {
    return doLogin().then(() => {
      return p({
        url,
        data,
        method
      })
    })
  } else {
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: method,
        data: data,
        header: {
          'content-type': 'application/json',
        },
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }
}

export {  doLogin, 
          checkLogin, 
          userAuthorized, 
          doMobile, 
          getUserInfoInServer,
          getUserInfo }