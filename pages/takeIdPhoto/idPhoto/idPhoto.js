// pages/idPhoto/idPhoto.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    photoSizeList: app.globalData.photoSizeList,
    photoBg: '#ffffff',
    bgc: '#ffffff',
    showScale: 1
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

  	// 切换背景
	toggleBg(e) {
    const bgc = e.currentTarget.dataset.color;
		const photoBg = {
			red: '#ff0000',
			blue: '#438edb',
			blue2: '#00bff3',
			white: '#ffffff',
			transparent: 'transparent'
		}[bgc]
		this.setData({
			bgc,
			photoBg
		})
  },
  
  // 去选择照片页面
	goPreIdPhotoPage (e) {
		wx.navigateTo({
			url: '/pages/takeIdPhoto/preIdPhoto/preIdPhoto?index=' + e.currentTarget.dataset.index + '&data=' + JSON.stringify(this.data.photoSizeList[e.currentTarget.dataset.index]),
		})
	},
})