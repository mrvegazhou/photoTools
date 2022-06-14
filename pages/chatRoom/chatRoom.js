// pages/chatRoom/chatRoom.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRefresh: false,//是否显示刷新头
    sstatus: 1,     // 1是滑动到顶部 2是滑动中中
    clientY: 0,
    scrolltop: '',
    height: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        // 获取可使用窗口宽度
        let clientHeight = res.windowHeight;
        // 获取可使用窗口高度
        let clientWidth = res.windowWidth;
        // 算出比例
        let ratio = 750 / clientWidth;
        // 算出高度(单位rpx)
        let height = clientHeight * ratio;
        // 设置高度
        that.setData({
          height: height
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  //滑动到顶端
  scrollToTop: function (e) {
    this.setData({
      sstatus: 1
    });
  },
  /**
     * 滑动中
     */
  scroll: function (e) {
    this.setData({
      sstatus: 2,
    })

  },
  /**
     * 手指按下
     */
  start: function (e) {
    console.log(e)
    var touchPoint = e.touches[0];
    var clientY = touchPoint.clientY
    this.setData({
      clientY: clientY
    })
  },
  /**
    * 抬起手指
    */
  end: function (e) {
    var that = this
    var upPoint = e.changedTouches[0];
    var endY = upPoint.clientY
    var pointTopointY = Math.abs(endY - this.data.clientY)
    var status = this.data.sstatus
    //上拉刷新
    if (status == 1 && pointTopointY > 50) {
      this.setData({
        isRefresh: true
      })
    }
    //两秒后隐藏加载条条
    setTimeout(function () {
      that.setData({
        isRefresh: false//是否显示刷新头
      })
    }, 3000)
  }
})