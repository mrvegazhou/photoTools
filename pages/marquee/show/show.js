var appInstance = getApp();
const families = appInstance.globalData.fontFaceList;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLandscape: true,
    text: '测试实弹发射',
    background: '',
    fontSize: 25,
    interval: null,
    sec: 20, //时间间隔
    offsetLeft: 0,
    pace: 0.5, //滚动速度
    slide: 20,
    fontLen: 0, //字体宽度
    windowWidth: 0,
    windowHeight: 0,
    showSetting: false,
    showSettingPanel: false,
    showColorPicker: false,
    lock: false,
    families: families,
    fontSelect: false,
    fontVal: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setPageOrientation({ orientation: 'landscape' });

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this;
    wx.onWindowResize(function(res) {
      if(res.deviceOrientation === 'landscape') {
        that.setData({
          'isLandscape': true
        });
      } else {
        that.setData({
          'isLandscape': false
        });
      }
    });
    //保持常亮
    wx.setKeepScreenOn({
      keepScreenOn: true,
       fail() {//如果失败 再进行调用
         wx.setKeepScreenOn({
             keepScreenOn: true
         });
       }
    });
    //获取屏幕长宽
    wx.getSystemInfo({
      success:function(res) {
        that.setData({
          windowHeight: res.windowWidth,
          windowWidth: res.windowHeight
        });
      }
    });
    //加载字体
    // this.getFonts();

    this.startMarquee();
  },

  getFonts() {
    for(let i=0; i<families.length; i++) {
      let obj = families[i];
      if(obj.family!='系统默认字体' && obj.url!='') {
        wx.loadFontFace({
          global:true,
          scopes: ['webview', 'native'],
          family: `${obj.family}`,
          source: `url("${obj.url}")`,
          success(res) {
            console.log(res.status)
          }
        });
      }
    }
  },

  //查询view的宽度
  queryViewWidth: function(viewId) {
    //创建节点选择器
    return new Promise(function(resolve) {
      var query = wx.createSelectorQuery();
      //选择id
      query.select('.' + viewId).boundingClientRect(function(rect) {
        resolve(rect.width);
      }).exec();
    });
  },

  //停止跑马灯
  stopMarquee: function() {
    var that = this;
    //清除旧的定时器
    if(that.data.interval != null) {
      clearInterval(that.data.interval);
    }
  },

  //执行跑马灯动画
  excuseAnimation: function() {
    var that = this;
    //设置循环
    let interval = setInterval(function() {
      if(that.data.offsetLeft <= 0) {
        that.setData({
          offsetLeft: that.data.offsetLeft + that.data.pace,
        });
      } else {
        if(that.data.offsetLeft >= that.data.windowWidth) {
          that.setData({
            offsetLeft: -that.data.fontLen,
          });
        } else {
          that.setData({
            offsetLeft: that.data.offsetLeft + that.data.pace,
          });
        }
      }
    }, that.data.sec);
    
    that.setData({
      interval: interval
    });
  },

  //开始跑马灯
  startMarquee: function() {
    var that = this;
    that.stopMarquee();
    //初始化数据
    that.queryViewWidth('text').then(function(resolve) {
      that.data.fontLen = resolve;
      that.excuseAnimation();
    });
  },

  showSetting() {
    let that = this;
    this.setData({
      showSetting: !that.data.showSetting,
      showSettingPanel: false
    });
  },

  lock() {
    let that = this;
    this.setData({
      lock: !that.data.lock
    });
  },

  setting() {
    let that = this;
    this.setData({
      showSettingPanel: !that.data.showSettingPanel
    })
  },

  getTxtValue(e) {
    this.setData({
      text: e.detail.value,
    })
  },

  onChangeBackColor(e) {
    let rgba = e.detail.rgba;
    console.log(rgba)
    this.setData({
      'background': rgba,
      'fontSelect': false,
    });
  },

  showColorPicker() {
    let that = this;
    this.setData({
      'showColorPicker': !that.data.showColorPicker
    });
  },

  showFontSel() {
    let that = this;
    this.setData({
      'fontSelect': !that.data.fontSelect,
      'showColorPicker': false,
    });
  },

  setSel(e) {
    let name = e.currentTarget.dataset['name'];
    this.setData({
      'fontVal': name,
      'fontSelect': false,
      'showColorPicker': false,
    });
  },

  cancelColor() {
    this.setData({
      'background': ''
    });
  },

  changePace(e) {
    let pace = e.detail.value;
    let newPace = 0.5;
    if(pace==100) {
      newPace = 2;
    } else if(pace==0) {
      newPace = 0;
    } else {
      newPace += pace/100;
    }
    newPace = Number(newPace.toFixed(2));
    this.setData({'slide': pace, 'pace': newPace});
  },

  changeFontSize(e) {
    let that = this;
    let fontSize = e.detail.value;
    this.setData({'fontSize': fontSize});
    that.queryViewWidth('text').then(function(resolve) {
      that.setData({fontLen: resolve});
    });
  }
})