// pages/autoCamera/autoCamera.js
var apiRequest = require('../../../utils/api.js')

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cameraPostion:'back',
    cameraImg:false,
    photoSrc:'',
    name:'',
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
      const {
        width,
        height,
        name,
        px,
        size,
        discription
      } = data
      this.setData({
        width: width,
        height: height,
        name: name,
        px: px,
        size: size,
        discription: discription
      })
    })
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

  goRepeat(){
    this.setData({
      cameraImg:false,
      photoSrc:''
    })

  },

  takePhoto() {
    if(this.data.photoSrc){
      this.imgUpload(this.data.photoSrc)
    }
  },

   // 上传原图， 后使用百度人像分割
	imgUpload(filePath) {
    const that = this
    const openid = wx.getStorageSync('openid')
    if (!openid) return
		wx.showLoading({ title: '正在检测图像中', })
    const flag = apiRequest.faceImgMatting(filePath, {openid: openid}, 120000, 
      // 成功
      (res) => {
        wx.hideLoading()
        const resData = JSON.parse(res.data)
        if(resData.code==200) {
          that.goEditPage(resData.data)
        }else{
          wx.showToast({ title: resData.msg, icon: 'error', duration: 2000 })
        }

      }, 
      (err) => {
        wx.showToast({
          title: '图片上传失败',
          icon: 'error'
        })
      }
    );
    if (flag===false) {
      wx.showToast({
        title: '图片上传失败',
        icon: 'error'
      })
    }
  },
  
  	/**
	 * 去编辑页面
	 */
	goEditPage (data) {
		const {
      name,
      px,
      size,
      width,
      height,
      discription
    } = this.data
		wx.navigateTo({
			url: '/pages/takeIdPhoto/editPhoto/editPhoto',
			success: function (res) {
				res.eventChannel.emit('sendImageData', {
					filePath: apiRequest.getStaticImgURL(data['mattingFaceImg']),
          tmpOriginImgSrc: apiRequest.getStaticImgURL(data['faceImg']),
          name,
          px,
          size,
          width,
          height,
          discription
				})
			}
		})
  },
  
})