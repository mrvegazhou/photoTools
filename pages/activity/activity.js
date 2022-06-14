// pages/activity/activity.js
const titles = ['论坛', '俱乐部']
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeIndex: 0,
    loadingModalHide: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
      title: "活动-" + titles[this.data.activeIndex]
    })
  }
})