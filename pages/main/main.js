// pages/main/main.js
//获取应用实例
const app = getApp()
var apiRequest = require('../../utils/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //广告
    topAdvs: []

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getTopAdvs()
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  //广告展示
  getTopAdvs: function() {
    let that = this
    apiRequest.getTopAdvs('', {
      datas: {
        type: "topAdv"
      },
      method: "get",
      successFn: function (res) {
        that.setData({
          topAdvs: res.result.datas.data
        })
      }
    })
  },

  //广告详情页跳转
  navigateAdvDetail: function ({ detail }) {
    wx.navigateTo({
      url: '../detail/detail?id=' + detail.itemid,
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },

  //去选择照片页面
	goIDPhotoPage (e) {
		wx.navigateTo({
			url: '/pages/takeIdPhoto/idPhoto/idPhoto'
		})
	},
})