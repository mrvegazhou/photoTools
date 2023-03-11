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

function findBreakPoint4Canvas(text, width, context) {
  var min = 0;
  var max = text.length - 1;
  while (min <= max) {
    var middle = Math.floor((min + max) / 2);
    var middleWidth = context.measureText(text.substr(0, middle)).width;
    var oneCharWiderThanMiddleWidth = context.measureText(text.substr(0, middle + 1)).width;
    if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
      return middle;
    }
  
    if (middleWidth < width) {
      min = middle + 1;
    } else {
      max = middle - 1;
    }
  }
  return -1;
}

function breakLines4Canvas(context, text, width, font) {
  var result = [];
  if (font) {
     context.font = font;
  }
  var textArray = text.split(/[(\r\n)\r\n]+/);
  for (let i = 0; i < textArray.length; i++) {
    let item = textArray[i];
    var breakPoint = 0;
    while ((breakPoint = findBreakPoint4Canvas(item, width, context)) !== -1) {
        result.push(item.substr(0, breakPoint));
        item = item.substr(breakPoint);
    }
    if (item) {
      result.push(item);
    }
  }
  return result;
}

function drawVerticalText4Canvas(context, text, x, y) {
  var arrText = text.split('');
  var arrWidth = arrText.map(function (letter) {
    const metrics = context.measureText(letter);
    const width = metrics.width;
    return width + 2;
  });
  
  var align = context.textAlign;
  var baseline = context.textBaseline;

  if (align == 'left') {
    x = x + Math.max.apply(null, arrWidth) / 2;
  } else if (align == 'right') {
    x = x - Math.max.apply(null, arrWidth) / 2;
  }
  if (baseline == 'bottom' || baseline == 'alphabetic' || baseline == 'ideographic') {
    y = y - arrWidth[0] / 2;
  } else if (baseline == 'top' || baseline == 'hanging') {
    y = y + arrWidth[0] / 2;
  }
  
  // context.textAlign = 'center';
  context.setTextAlign('center')
  // context.textBaseline = 'middle';
  context.setTextBaseline('middle');

  // 开始逐字绘制
  arrText.forEach(function (letter, index) {
    
    // context.save()
    // context.beginPath();
   
    // 确定下一个字符的纵坐标位置
    var letterWidth = arrWidth[index];
    // 是否需要旋转判断
    var code = letter.charCodeAt(0);

    if (code <= 256) {
      context.translate(x, y);
      // 英文字符，旋转90°
      context.rotate(90 * Math.PI / 180);
      context.translate(-x, -y);
    } else if (index > 0 && text.charCodeAt(index - 1) < 256) {
      // y修正
      y = y + arrWidth[index - 1]/2;
    }
    context.fillText(letter, x, y);

    // 旋转坐标系还原成初始态
    context.setTransform(1, 0, 0, 1, 0, 0);

    y = y + letterWidth;

    // context.closePath();
    // context.restore()    
  });
  
  // 水平垂直对齐方式还原
  context.setTextAlign(align);
  context.setTextBaseline(baseline);
  return {x, y}
}


/**
 * 计算旋转后的新坐标（相对于画布）
 * @param x
 * @param y
 * @param centerX
 * @param centerY
 * @param degrees
 * @returns {*[]}
 * @private
 */
function rotatePoint(x, y, centerX, centerY, degrees) {
  let newX = (x - centerX) * Math.cos(degrees * Math.PI / 180) - (y - centerY) * Math.sin(degrees * Math.PI / 180) + centerX;
  let newY = (x - centerX) * Math.sin(degrees * Math.PI / 180) + (y - centerY) * Math.cos(degrees * Math.PI / 180) + centerY;
  return [newX, newY];
}
/**
 * 计算旋转后矩形四个顶点的坐标（相对于画布）
 * @private
 */
function rotateSquare(x, y, w, h, centerX, centerY, rotate) {
  return [
    rotatePoint(x, y, centerX, centerY, rotate),
    rotatePoint(x + w, y, centerX, centerY, rotate),
    rotatePoint(x + w, y + h, centerX, centerY, rotate),
    rotatePoint(x, y + h, centerX, centerY, rotate),
  ];
}

function openConfirm() {
  wx.showModal({
    content: '检测到您没打开访问摄像头权限，是否打开？',
    confirmText: "确认",
    cancelText: "取消",
    success: function (res) {
    //点击“确认”时打开设置页面
    if (res.confirm) {
      console.log('用户点击确认')
      wx.openSetting({
        success: (res) => { }
      })
    } else {
      console.log('用户点击取消')
    }
    }
  });
}

function sortBy(property){
  return function(value1,value2){
      let a=value1[property]
      let b=value2[property]
      return a < b ? 1 : a > b ? -1 : 0
  }
}

function createCanvasContext(width, height) {
  const canvas = wx.createOffscreenCanvas({
    type: '2d',
    width,
    height,
  })
  const context = canvas.getContext("2d")
  return [canvas, context]
}
function createImage() {
  // 创建离屏canvas
  const canvas = wx.createOffscreenCanvas({
    type: '2d',
  })
  // 创建一个图片
  const image = canvas.createImage()
  return image
}

//在canvas上绘图
function canvasHandleImg(that, ctx, canvas, url) {
  return new Promise((resolve, reject)=>{
            wx.getImageInfo({
              src: url,
              success: resInfo => {
                let canvasWidth = resInfo.width; //宽度
                let canvasHeight = resInfo.height; //高度
                that.setData({
                  canvasWidth: canvasWidth,
                  canvasHeight: canvasHeight,
                });
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                const image = canvas.createImage();
                image.src = url;
                image.onload = () => {

                  ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
                  resolve(resInfo);
                  ctx.restore();
                  wx.hideLoading();
                };
              }
            });
  });
}

//绘制五角星
function drawStar(ctx, R, r, rotate, x, y){
  // beginPath：开始绘制一段新的路径
  ctx.beginPath();
  var angle = 360/5;
  for (var i = 0; i < 5; i++) {
      // 角度转弧度：角度/180*Math.PI
      var roateAngle = i * angle - rotate; // 旋转动起来
      // 外圆顶点坐标
      ctx.lineTo(Math.cos((18 + roateAngle) / 180 * Math.PI) * R + x, -Math.sin((18 + roateAngle) / 180 * Math.PI) * R + y);
      // 內圆顶点坐标
      ctx.lineTo(Math.cos((54 + roateAngle) / 180 * Math.PI) * r + x, -Math.sin((54 + roateAngle) / 180 * Math.PI) * r + y);
  }
  // closePath：关闭路径，将路径的终点与起点相连
  ctx.closePath();
  ctx.fillStyle = 'RGBA(0,0,0,1)';
  ctx.fill();
  // ctx.stroke();
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
  processDate: processDate,
  findBreakPoint4Canvas: findBreakPoint4Canvas,
  breakLines4Canvas: breakLines4Canvas,
  drawVerticalText4Canvas: drawVerticalText4Canvas,
  openConfirm: openConfirm,
  sortBy: sortBy,
  createCanvasContext: createCanvasContext,
  createImage: createImage,
  canvasHandleImg: canvasHandleImg,
  drawStar: drawStar
}