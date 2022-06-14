var apiRequest = require('../../utils/api.js')
const titles = ['信息', '人脉']
var upRefreshVal = {
  loadmoreHidden: true,
  loadmoreText: "加载中...",
  isNeedLoadmore: true,
  upRefreshLoading: false,
  upRefreshLoaded: false,
  isEmpty: false
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //下拉刷新
    refreshing: false,
    refreshed: false,
    dataArr: {
      0: [], 1: []
    },
    activeIndex: 0,
    loadingModalHide: true,
    height: wx.getSystemInfoSync().windowHeight,
    pageFirstId: {
      0: 1, 1: 1
    },
    pageLastId: {
      0: 2, 1: 2
    },
    scrollTopNums: {
      0: 0, 1: 0
    },
    //上拉刷新属性
    upRefresh: {
      0: upRefreshVal, 1: upRefreshVal
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //修改title
    wx.setNavigationBarTitle({
      title: "动态-" + titles[this.data.activeIndex]
    })
    this.setData({
      loadingModalHide: false
    })
    this.setData({
      loadingModalHide: true
    })
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  onTapNavbar: function (e) {
    this.setData({
      loadingModalHide: false
    });
    this.switchChannel(parseInt(e.target.dataset.index));
    this.setData({
      loadingModalHide: true
    });

  },

  switchChannel: function (targetChannelIndex) {
    this.setData({
      activeIndex: targetChannelIndex
    });
    //修改title
    wx.setNavigationBarTitle({
      title: "动态-" + titles[this.data.activeIndex]
    })
  },

  onTouchstartArticles: function (e) {
    let that = this
    this.setData({
      'startTouchs.x': e.changedTouches[0].clientX,
      'startTouchs.y': e.changedTouches[0].clientY
    });
    let idx = this.data.activeIndex
    var query = wx.createSelectorQuery()
    query.select('#article').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      that.setData({
        ['scrollTopNums.' + idx]: res[1].scrollTop
      })
    })
  },

  onTouchendArticles: function (e) {
    let deltaX = e.changedTouches[0].clientX - this.data.startTouchs.x;
    let deltaY = e.changedTouches[0].clientY - this.data.startTouchs.y;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      let deltaNavbarIndex = deltaX > 0 ? -1 : 1;
      let currentChannelIndex = this.data.activeIndex;
      let navbarShowIndexArray = [0, 1, 2];
      let targetChannelIndexOfNavbarShowIndexArray = navbarShowIndexArray.indexOf(currentChannelIndex) + deltaNavbarIndex;
      if (targetChannelIndexOfNavbarShowIndexArray >= 0 && targetChannelIndexOfNavbarShowIndexArray <= 2) {
        let targetChannelIndex = navbarShowIndexArray[targetChannelIndexOfNavbarShowIndexArray];
        this.switchChannel(targetChannelIndex);
        wx.pageScrollTo({
          scrollTop: this.data.scrollTopNums[targetChannelIndexOfNavbarShowIndexArray],
          duration: 0
        })
      }
    }
  }

})