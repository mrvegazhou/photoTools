// pages/imageFix/autoCamera/autoCamera.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cameraPostion:'back',
    cameraImg:false,
    photoSrc:'',
    type: 'index'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      type: options.type
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
      this.goEditPage()
    }
  },

  /**
	 * 返回首页面
	 */
	goEditPage () {
    var photoSrc = this.data.photoSrc;
    var url;
    if(this.data.type=="index") {
      url = '/pages/imageFix/index/index'
    } else {
      url = '/pages/imageFix/imageScan/imageScan'
    }
		wx.navigateTo({
			url: url,
			success: function (res) {
				res.eventChannel.emit('sendFixedImageData', {
          photoSrc: photoSrc
				})
			}
    });
    this.setData({
      'photoSrc': true
    });
  },
})