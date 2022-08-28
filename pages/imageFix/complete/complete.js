// pages/imageFix/complete/complete.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msg: '',
		url: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
			msg: options.msg,
			url: decodeURIComponent(options.url)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  preView () {
		wx.previewImage({
			urls: [this.data.url],
			current: this.data.url
		})
  },
  
  contineu() {
		wx.navigateBack({
			delta: 1
		})
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
			title: '好用的图片处理工具！',
			path: '/pages/main/main',
			imageUrl: this.data.tempFilePath
		}
  }
})