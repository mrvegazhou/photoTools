const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//手机号
const checkMobileNum = val => {
  if (!(/^1[34578]\d{9}$/.test(val))) {
    return false;
  }
  return true;
}
//邮箱
const checkEmail = val => {
  if (!(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(val))) {
    return false;
  }
  return true;
}
//身份证验证
const checkIdentityCard = val => {
  if (!(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(val))) {
    return false;
  }
  return true;
}
//密码
const checkPassword = val => {
  var reg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}\[\]:";'<>?,.\/]).{6,}$/
  return reg.test(val)
}

const checkInteger = val => {
  return (typeof val * 1 === 'number') && (val % 1 === 0)
}
//判断你年纪
const checkAge = val => {
  if (val % 1 !== 0) {
    return false;
  }
  if (val < 0 || val > 110) {
    return false;
  }
  return true;
}

//判断字符串是否是纯数字
const isNumber = val => {
  var  regPos = /^\d+(\.\d+)?$/;  //非负浮点数
  var  regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/;  //负浮点数
  if (regPos.test(val) || regNeg.test(val)) {
    return  true;
  } else  {
    return  false;
  }
}
let tools = {
  alert(title = '提示', content = "") {
    if ('object' === typeof content) {
      content = this.isDEV && JSON.stringify(content) || config.defaultAlertMsg
    }
    wx.showModal({
      title,
      content
    })
  },
  getStorageData(key, cb) {
    let self = this
    wx.getStorage({
      key,
      success(res) {
        cb && cb(res.data)
      },
      fail(err) {
        let msg = err.errMsg || ''
        if (/getStorage:fail/.test(msg)) {
          self.setStorageData(key)
        }
      }
    })
  },
  setStorageData(key, value = '', cb) {
    wx.setStorage({
      key,
      data: value,
      success() {
        cb && cb()
      }
    })
  }
}

/*
 * 保存用户是否阅读
 */
let markRead = contentId => {
  //先从缓存中查找 visited 字段对应的所有文章 contentId 数据
  tools.getStorageData('visited', (data) => {
    let newStorage = data;
    if (data) {
      //如果当前的文章 contentId 不存在，也就是还没有阅读，就把当前的文章 contentId 拼接进去
      if (data.indexOf(contentId) === -1) {
        newStorage = `${data},${contentId}`;
      }
    }
    // 如果还没有阅读 visited 的数据，那说明当前的文章是用户阅读的第一篇，直接赋值就行了 
    else {
      newStorage = `${contentId}`;
    }

    /*
     * 处理过后，如果 data(老数据) 与 newStorage(新数据) 不一样，说明阅读记录发生了变化
     * 不一样的话，我们就需要把新的记录重新存入缓存和 globalData 中 
     */
    if (data !== newStorage) {
      tools.setStorageData('visited', newStorage);
    }
  });
}


const digestCount = (that, val, max, min) => {
  var len = parseInt(val.length);
  if (len <= min)
    that.setData({
      minTxt: "最少输入" + min + "个字"
    })
  else if (len > min)
    that.setData({
      minTxt: ""
    })
  //最多字数限制
  if (len > max) return;
  // 当输入框内容的长度大于最大长度限制（max)时，终止setData()的执行
  that.setData({
    contentCount: len
  });
}

/**
 *
 * 上传单个图片
 */
const uploadimgs = (that, url, imgfilepath, idx) => {
  wx.uploadFile({
    url: url,
    filePath: imgfilepath,
    name: 'file',
    header: {
      'content-type': 'multipart/form-data'
    }, // 设置请求的 header
    formData: {}, // HTTP 请求中其他额外的 form data
    success: function(res) {
      var data = JSON.parse(res.data);
      if (data.success) {
        that.data.images.splice(idx, 1);
      }
    },
    fail: function(res) {
      console.log('调用服务器接口失败！' + res);
    }
  })
}

// 通用指示器
const showToast = ({
  msg,
  status = 0
}) => {
  let icon = status ? 'success' : 'loading'
  wx.showToast({
    title: msg,
    icon: icon,
    duration: 1000
  })
}

const showError = (msg) => {
  wx.showToast({
    title: msg,
    duration: 1000,
    image: '/images/icon-error.png'
  })
}

const showConfirm = (msg, cb) => {

  wx.showModal({
    title: '提示',
    content: msg,
    success: function(sm) {
      if (sm.confirm) {
        cb();
      } else if (sm.cancel) {

      }
    }
  });
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

function processDate(_date) {
  var y = _date.getFullYear();
  var m = _date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = _date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = _date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = _date.getMinutes();
  minute = minute < 10 ? ('0' + minute) : minute;
  var second = _date.getSeconds();
  second = second < 10 ? ('0' + second) : second;
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
}


module.exports = {
  formatTime: formatTime,
  tools: tools,
  markRead: markRead,
  showError: showError,
  showToast: showToast,
  showConfirm: showConfirm,
  checkMobileNum: checkMobileNum,
  checkPassword: checkPassword,
  checkEmail: checkEmail,
  checkIdentityCard: checkIdentityCard,
  digestCount: digestCount,
  isNumber: isNumber,
  checkAge: checkAge,
  getCurrentPageUrl: getCurrentPageUrl,
  getCurrentPageUrlWithArgs: getCurrentPageUrlWithArgs,
  processDate: processDate
}