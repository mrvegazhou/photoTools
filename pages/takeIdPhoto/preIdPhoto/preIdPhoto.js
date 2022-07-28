// pages/preIdPhoto/preIdPhoto.js

import { checkLogin, doLogin } from '../../../utils/loginAuth'
var apiRequest = require('../../../utils/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    width: '',
    height: '',
    px: '',
    size: '自定义',
		name: '自定义尺寸',
    discription: '',
    canClick: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({ title: this.data.name })
    const sizeDetail = JSON.parse(decodeURIComponent(options.data))
    this.setData({
      ...sizeDetail
    })
  },


  /**
	 * 选择照片
	 */
	chooseImagePre (e) {
    this.setData({
      canClick: false
    })
    const that = this
    checkLogin().then(res => {

      that.chooseImage(e.target.dataset.type)	
      
    }, err => {

      wx.getUserProfile({
				desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
				success: (res) => {
          
					doLogin().then(login_res => {

            that.chooseImage(e.target.dataset.type)
          }, err => {
            
          }).catch((err) => {
            console.log(err)
          });
						
				},
				fail(){
          wx.showToast({ title: '请授权后继续', icon: 'none', duration: 2000 })
          that.setData({
            canClick: true
          })
				}
			})
    });
  },

  chooseImage(sourceType){
    const that = this
    wx.showLoading({title: '选择照片'})
    setTimeout(function () {
			wx.hideLoading()
    }, 1000)
    if(sourceType==='camera') {
      const { 
        width,
        height,
        name,
        px,
        size,
        discription
      } = this.data
      //选择相机拍照
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.camera']) {
            wx.navigateTo({
							url: '/pages/takeIdPhoto/autoCamera/autoCamera',
							success: function (res) {
								res.eventChannel.emit('toAutoCamera', {
                  width,
                  height,
                  name,
                  px,
                  size,
                  discription
								})
							}
						})
          } else {
            wx.authorize({
							scope: 'scope.camera',
							success () {
                that.setData({
                  canClick: true
                })
							},
							fail(){
                that.openConfirm()	
                that.setData({
                  canClick: true
                })
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
          that.imgUpload(res.tempFiles[0].tempFilePath)
        },
        fail () {
          wx.showToast({ title: '取消选择', icon: 'none', duration: 2000 })
          that.setData({
            canClick: true
          })
        }
      })
    }  
  },

  // 上传原图， 后使用人像分割处理
	imgUpload(filePath) {
    const that = this
    const openid = wx.getStorageSync('openid')
    if (!openid) return
    wx.showLoading({ title: '正在检测图像中' })
    const flag = apiRequest.faceImgMatting(filePath, {openid: openid}, 
      // 成功
      (res) => {
        wx.hideLoading()
        const resData = JSON.parse(res.data)
        if(resData.code==200) {
          that.goEditPage(resData.data)
        }else{
          wx.showToast({ title: resData.msg, icon: 'error', duration: 2000 })
        }
        that.setData({
          canClick: true
        })
      }, 
      (err) => {
        wx.showToast({
          title: '图片上传失败',
          icon: 'error'
        })
        that.setData({
          canClick: true
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

  // 编辑图片
  goEditPage(data) {
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
  }
})