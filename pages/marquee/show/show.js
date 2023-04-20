var appInstance = getApp();
const families = appInstance.globalData.fontFaceList;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLandscape: true,
    text: '点击屏幕显示设置按钮',
    background: '',
    fontSize: 25,
    interval: null,
    sec: 20, //时间间隔
    offsetLeft: 0,
    pace: 1, //滚动速度
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
    fontVal: '',
    type: '',  //flickering、roll
    fontColor: 'black',
    showFontColorPicker: false,
    opacity: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    wx.onAccelerometerChange(function(e){
      //当监听到大于1可执行方法
      if(e.x> 1){
        that.resetFont();
      }
    });

    this.setData({
      'type': options.type 
    });
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
    this.getFonts();

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
    let type = this.data.type;
    let flag = 1;
    switch(type) {
      case 'flickering':
        let slide = that.data.slide;
        let sec = 18000/slide;
        sec = Number(sec.toFixed(2));
        that.setData({'sec': sec});
        let interval = setInterval(function() {
          if(!flag) {
            that.setData({
              opacity: '0'
            });
            flag = 1;
          } else {
            that.setData({
              opacity: '1'
            });
            flag = 0;
          }
        }, that.data.sec);
        that.setData({
          interval: interval
        });
        break;
      case 'roll':
        that.queryViewWidth('text').then(function(resolve) {
          that.data.fontLen = resolve;
          that.excuseAnimation();
        });
        break;
    }
    
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
    this.setData({
      'background': rgba,
      'fontSelect': false,
      'showFontColorPicker': false
    });
  },

  onChangeFontColor(e) {
    let rgba = e.detail.rgba;
    this.setData({
      'fontColor': rgba,
      'fontSelect': false,
      'showColorPicker': false
    });
  },

  showColorPicker() {
    this.setData({
      'showColorPicker': !this.data.showColorPicker
    });
  },

  showFontColorPicker() {
    this.setData({
      'showFontColorPicker': !this.data.showFontColorPicker
    });
  },

  showFontSel() {
    let that = this;
    this.setData({
      'fontSelect': !that.data.fontSelect,
      'showColorPicker': false,
      'showFontColorPicker': false
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

  cancelFontColor() {
    this.setData({
      fontColor: 'black'
    });
  },

  changePace(e) {
    let pace = e.detail.value;
    if(this.data.type=='flickering') {
      let sec = pace==0 ? 0 : 18000/pace;
      sec = Number(sec.toFixed(2));
      this.setData({'slide': pace, 'sec': sec});
      if(sec!=0) {
        this.stopMarquee();
        this.startMarquee();
      } else {
        this.setData({'opacity':1});
        this.stopMarquee();
      }
    } else {
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
      if(newPace!=0) {
        this.stopMarquee();
        this.startMarquee();
      } else {
        this.stopMarquee();
      }
    }
  },

  changeFontSize(e) {
    let that = this;
    let fontSize = e.detail.value;
    this.setData({'fontSize': fontSize});
    that.queryViewWidth('text').then(function(resolve) {
      that.setData({fontLen: resolve});
    });
  },

  resetFont() {
    let that = this;
    that.setData({'offsetLeft': 0});
    let bgColor = that.data.background;
    for(let i = 0; i<5; i++) {
      let tmp = '#ffffff';
      that.setData({'background': tmp});
      setTimeout(() => {
        that.setData({'background': bgColor});
      }, 200);
    }
    that.setData({'background': bgColor});
    this.stopMarquee();
    that.startMarquee();
  },

  goHome() {
    this.stopMarquee();
    wx.navigateTo({
      url: '/pages/marquee/index/index'
    });
  },
})