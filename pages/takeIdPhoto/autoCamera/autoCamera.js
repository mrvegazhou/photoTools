// pages/autoCamera/autoCamera.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cameraPostion:'back',
    cameraImg:false,
    photoSrc:'',
    photoName:'',
    width:'',
    height:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.recevingData()
  },

  recevingData(){
    const eventChannel = this.getOpenerEventChannel && this.getOpenerEventChannel()
    eventChannel && eventChannel.on('toAutoCamera', (data) => {
      const {width, height,photoName} = data
      this.setData({
        width: width,
        height: height,
        photoName: photoName
      })
    })
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

  turnCameraBtn(){
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          photoSrc: res.tempImagePath,
          cameraImg:true,
        })
      }
    })
  },

  turnCameraPostion(){
    
    if(this.data.cameraPostion==='back'){
      this.setData({
        cameraPostion:'front'
      })
      return
    }
    if(this.data.cameraPostion==='front'){
      this.setData({
        cameraPostion:'back'
      })
      return
    }
  },
})