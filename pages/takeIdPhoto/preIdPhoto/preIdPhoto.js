// pages/preIdPhoto/preIdPhoto.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    photoSizeList: app.globalData.photoSizeList,
    width: '',
    height: '',
    px: '',
    size: '自定义',
		photoName: '自定义尺寸',
    discription: '',
		authSatus:false,
		preImgInfoList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({ title: this.data.photoName })
		this.getUserAuthSatus()
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

  getUserAuthSatus(){
    const that = this
    const openid = app.globalData.openid
    if (!openid) return

  },

  /**
	 * 选择照片
	 */
	chooseImagePre (e) {
    const that = this
    if(!this.data.authSatus) {
      wx.getUserProfile({
				desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
				success: (res) => {
					
					// that.setUserInfo(res.userInfo)
					that.chooseImage(e.target.dataset.type)	
				},
				fail(){
					wx.showToast({ title: '请授权后继续', icon: 'none', duration: 2000 })
				}
			})
    } else {
			that.chooseImage(e.target.dataset.type)	
		}
  },

  chooseImage(sourceType){
    const that = this
    wx.showLoading({title: '选择照片'})
    setTimeout(function () {
			wx.hideLoading()
    }, 1000)
    if(sourceType==='camera') {
      const { width, height, photoName} = this.data
      //选择相机拍照
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.camera']) {
            wx.navigateTo({
							url: '/pages/autoCamera/autoCamera',
							success: function (res) {
								res.eventChannel.emit('toAutoCamera', {
                  width,
                  height,
                  photoName
								})
							}
						})
          } else {
            wx.authorize({
							scope: 'scope.camera',
							success () {
							},
							fail(){
								that.openConfirm()	
							}
            })
          }
        },
				fail () {
					
				}
      })

    } else {
      //选择打开相册
			wx.chooseMedia({
        count: 1,
				mediaType: 'image',
				sourceType: [sourceType],
				sizeType: 'original',
				camera: 'back',
				success:(res)=> {
          this.imgUpload(res.tempFiles[0].tempFilePath)
        },
        fail () {
          wx.showToast({ title: '取消选择', icon: 'none', duration: 2000 })
        }
      })
    }  
  },

  // 上传原图， 后使用百度人像分割
	imgUpload(filePath) {
    const openId = app.globalData.openId
    if (!openId) return
    wx.showLoading({ title: '正在检测图像中', })
    const fileName = filePath.split('tmp/')[1] || filePath.split('tmp_')[1];

    // wx.cloud.uploadFile({
		// 	cloudPath: `tmp/originfile/${openid}/${new Date().Format('yyyy-MM-dd')}/${fileName}`,
		// 	filePath
		// })
		// .then(res => {
		// 	 this.imageDivision(res.fileID)
		// })
		// .catch(error => {
		// 	console.log(error)
		// 	wx.showToast({ title: '失败,请重试', icon: 'loading' })
		// })
  },

  openConfirm() {
		wx.showModal({
		  content: '检测到您没打开访问摄像头权限，是否打开？',
		  confirmText: "确认",
		  cancelText: "取消",
		  success: function (res) {
			//点击“确认”时打开设置页面
			if (res.confirm) {
			  console.log('用户点击确认')
			  wx.openSetting({
				success: (res) => { }
			  })
			} else {
			  console.log('用户点击取消')
			}
		  }
		});
  },
})