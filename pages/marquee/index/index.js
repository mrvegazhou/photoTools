Page({

  /**
   * 页面的初始数据
   */
  data: {
    twinkleFontInterval: '',
    bgColor: 'rgba(0, 0, 0, 1)',
    offsetLeft: 0,
    pace: 9, //滚动速度
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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.startTwinkleFont(1);
  },

  onHide() {
    this.cancelTwinkleBg();
  },

  onUnload() {
    this.cancelTwinkleBg();
  },

  startTwinkleFont(flag) {
    let that = this;
    that.cancelTwinkleBg();
    let windowWidth = wx.getSystemInfoSync().windowWidth;
    wx.createSelectorQuery().select('.roll-font').boundingClientRect(function(rect) {
      let viewWidth = rect.width;
      let twinkleBgInterval = setInterval(function() {

        if(that.data.offsetLeft >= 0) {
          that.setData({
            offsetLeft: that.data.offsetLeft - that.data.pace,
          });
        } else {
          if(that.data.offsetLeft <= -viewWidth) {
            that.setData({
              offsetLeft: windowWidth*0.9
            });
          } else {
            that.setData({
              offsetLeft: that.data.offsetLeft - that.data.pace,
            });
          }
        }
  
        if(!flag) {
          that.setData({
            bgColor: 'rgba(255, 255, 255, 0)'
          });
          flag = 1;
        } else {
          that.setData({
            bgColor: 'rgba(0, 0, 0, 1)'
          });
          flag = 0;
        }
      }, 900);
      that.setData({
        twinkleBgInterval: twinkleBgInterval
      });
    }).exec();    
  },
  cancelTwinkleBg() {
    let twinkleFontInterval = this.data.twinkleFontInterval;
    if(twinkleFontInterval) {
      clearInterval(twinkleFontInterval);
    }
  },
  //跳转
  jump(e) {
    let type = e.currentTarget.dataset['type'];
    wx.navigateTo({
      url: '/pages/marquee/show/show?type=' + type
    });
  },
  //返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index',
    });
    
  },
})