import { checkLogin, doLogin } from '../../../utils/loginAuth'
var apiRequest = require('../../../utils/api.js')
import { CONFIG } from '../../../utils/config'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    min: 0,  // 最小限制 
    max: 100,   // 最大限制
    value:50, // 当前value
    canClick: true,
    actionShow: false,
    before: '../../../images/bgcolor.png',
    // before: 'http://192.168.3.3:5000/static/page/img/b1be63b3a251413a980ed1cb7cb27c3b_fixed.png',
    after: '../../../images/bgcolor.png'
    // after: 'http://192.168.3.3:5000/static/page/img/8289146e65d44b678a48ad8828bbc136_fixed.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getPhotoData()
  },


  // 拖动过程中触发的事件
  sliderchanging(e){
      var value = e.detail.value;
      this.setData({ value: value })
  },
  // 完成一次拖动后触发的事件
  sliderchange(e){
      var value = e.detail.value;
      this.setData({ value: value })
  },

  chooseImage(sourceType) {
    const that = this
    this.setData({
      actionShow: true,
      canClick: false
    })
    if(sourceType==='camera') {
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.camera']) {
            wx.navigateTo({
							url: '/pages/imageFix/autoCamera/autoCamera?type=imageScan',
							success: function (res) {
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
    } else if(sourceType==='album') {
        //选择打开相册
        wx.chooseMedia({
          count: 1,
          mediaType: 'image',
          sourceType: [sourceType],
          sizeType: 'original',
          camera: 'back',
          success:(res)=> {
            console.log(res.tempFiles[0].tempFilePath)
            that.setData({
              "before": res.tempFiles[0].tempFilePath,
              "actionShow": false,
              "canClick": true
            })
            
          },
          fail () {
            wx.showToast({ title: '取消选择', icon: 'none', duration: 2000 })
            that.setData({
              "canClick": true,
              "actionShow": false
            })
          }
        })
    } else if(sourceType==='talk') {
      wx.chooseMessageFile({
        count: 1,
        type: 'image',
        success (res) {
          // tempFilePath可以作为 img 标签的 src 属性显示图片
          const tempFilePaths = res.tempFiles
          that.setData({
            "canClick": true,
            "actionShow": false,
            "before": tempFilePaths[0].path
          })
        }
      })
    } else {
      this.setData({
        canClick: true
      })
    }
  },

  doChooseImage(e) {
    const that = this
    const sourceType = e.target.dataset.type

    checkLogin().then(res => {
      that.chooseImage(sourceType)

    }, err => {
      wx.getUserProfile({
				desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
				success: (res) => {
					doLogin(res.userInfo).then(login_res => {
            that.chooseImage(sourceType)
            
          }, err => {
            that.setData({
              canClick: true
            })
          }).catch((err) => {
            that.setData({
              canClick: true
            })
          });
						
				},
				fail(){
          wx.showToast({ title: '请授权后继续', icon: 'none', duration: 2000 })
          that.setData({
            canClick: true
          })
				}
			})
    })
    
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

  handleImage() {
    const openid = wx.getStorageSync('openid')
    if(!openid) {
      wx.showToast({
        title: '请重新登录',
        icon: 'none'
      })
      return
    }
    this.setData({
      canClick: false
    })
    const that = this
    const beforeImgUrl = this.data.before
    if(beforeImgUrl.startsWith('http://tmp') || beforeImgUrl.startsWith('wxfile://tmp')) {
      wx.showLoading({ title: '正在处理图像中' })
      apiRequest.scanImg(beforeImgUrl, {'openid':openid}).then(res => {
        const resData = JSON.parse(res.data)
        if(resData.code==200) {
          const beforeImg = CONFIG.API_URL.WECHAT_STATIC_IMG+"/"+resData.data.oldImg
          const afterImg = CONFIG.API_URL.WECHAT_STATIC_IMG+"/"+resData.data.scannedImg
          that.setData({
            'before': beforeImg,
            'after': afterImg
          })
          wx.hideLoading()
          this.setData({
            canClick: true
          })
          that.showSaveWindows()
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '处理失败:'+resData.msg,
            icon: 'none'
          })
          this.setData({
            canClick: true
          })
        }
      }, err => {
        if(err.errMsg && err.errMsg.indexOf("uploadFile:fail timeout")==0) {
          wx.showToast({
            title: '处理超时',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '处理失败~',
            icon: 'none'
          })
        }
        this.setData({
          canClick: true
        })
        
      }).catch((err) => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
        this.setData({
          canClick: true
        })
      })

    } else {
      wx.showToast({
        title: '图片不存在',
        icon: 'none'
      })
      this.setData({
        canClick: true
      })
    }
  },

  // 预览图片
  showImg(e) {
    const imgUrl = e.target.dataset.url
    wx.previewImage({
      urls: [imgUrl]
    })
  },

  // 接受参数
  getPhotoData() {
    const eventChannel = this.getOpenerEventChannel && this.getOpenerEventChannel()
    eventChannel && eventChannel.on('sendFixedImageData', (data) => {
      const {
        photoSrc
      } = data
      this.setData({
        before: photoSrc
      })
    })
  },

  // 是否保存扫描照片
  showSaveWindows: function() {
    const that = this
    wx.showModal({
      title: '提示',
      content: '已经处理完成,是否保存处理后的照片到手机相册?',
      success (res) {
        if (res.confirm) {
          that.saveImg()
        } else if (res.cancel) {
          return
        }
      }
    })
  },

  // 保存图片到相册
  saveImg() {
    const url = this.data.after
    let that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(res) {
              that.saveImgInfo(url)  
            },
            fail(res) {
              errMsg: 'authorize:fail auth deny'
              wx.showModal({
                title: '提示',
                content: '检测到您没打开保存图片到相册功能权限，是否去设置打开？',
                success(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                    wx.openSetting({
                      success: (res) => {
                        console.log(res)
                      },
                    })
                  } else if (res.cancel) {

                  }
                },
              })
            },
          })
        } else {
          that.saveImgInfo(url)
        }
      }
    })
  },

  // 保存图片
  saveImgInfo(imgUrl) {
    wx.getImageInfo({
      src: imgUrl,
      success: function (sres) {
        wx.saveImageToPhotosAlbum({
          filePath: sres.path,
          success: function (fres) {
            let msg = ""
            wx.redirectTo({ url: '/pages/imageFix/complete/complete?msg=' + msg + '&url=' + imgUrl})
          }
        })
      }
    })
  }
})