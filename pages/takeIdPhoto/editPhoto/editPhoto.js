const hexRgb = require('../../../utils/hex-rgb')
const { photoSizeList } = getApp().globalData
const sizeNameList = photoSizeList.map(v => v.name)
var apiRequest = require('../../../utils/api.js')
import { CONFIG } from '../../../utils/config'

let canOnePointMove = false
let onePoint = {
  x: 0,
  y: 0
}
let twoPoint = {
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canClick: true,

    imageData: {
      name: '一寸',
      height: 431,
      width: 295,
      tmpOriginImgSrc: ''
    },
    
    filePath: '',

    showScale: 480 / 295,
    
		bgc: '#ffffff',
		photoBg: '#ffffff',

    array: sizeNameList,
    
		index: 0,
		initImgWidth: 0,
		initImgHeight: 0,
		originImgWidth: 0,
    originImgHeight: 0,
		width: 0,
		height: 0,
		left: 0,
    top: 0,
    
		scale: 1,
    rotate: 0,
    
    showColorPicker: false,
    colorData: {
      transparency: 1,
      color: '#ffffff'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({ title: '生成照片' })
    wx.showLoading({ title: '图片加载中' })
    this.getImageData()
  },

  // 接受参数
  getImageData() {
    const eventChannel = this.getOpenerEventChannel && this.getOpenerEventChannel()
    eventChannel && eventChannel.on('sendImageData', (data) => {
      const {
        width,
        filePath,
      } = data

      this.setData({
        imageData: data,
        showScale: (480 / (+width)),
        filePath: filePath,
      })

      wx.hideLoading()
    })
  },

  // 切换背景
	toggleBg(e) {
    const bgc = e.currentTarget.dataset.color;
    const showColorPicker = bgc === 'custom';
		const photoBg = showColorPicker ? this.data.colorData.color : {
			red: '#ff0000',
			blue: '#438edb',
			blue2: '#00bff3',
			white: '#ffffff',
			transparent: 'transparent'
		}[bgc]
		this.setData({
			bgc,
      photoBg,
      showColorPicker
		})
  },

  //关闭拾色器
  closeColorPicker() {
    this.setData({
      showColorPicker: false
    })
  },

  //选择改色时触发（在左侧色盘触摸或者切换右侧色相条）
  onChangeColor(e) {
    console.log(e.detail.rgba, '--e.detail.rgba--')
    this.setData({
      'photoBg': e.detail.rgba,
      'colorData.color':  e.detail.rgba,
      'colorData.transparency': e.detail.alpha || 1
    })
  },
  
  bindload: function (e) {
    // wx.hideLoading({})
    const that = this
    const photoSizeObj = {
			width: this.data.imageData.width,
			height: this.data.imageData.height
    }
    const { width, height } = e.detail
		const _width = photoSizeObj.width
    const _height = _width * height / width
    const imgLoadSetData = {
			originImgWidth: width,
			originImgHeight: height,
			initImgWidth: _width,
			initImgHeight: _height,
			width: _width,
			height: _height,
			left: _width / 2,
			top: _height / 2 + photoSizeObj.height - _height + 120
    }

		that.setData(imgLoadSetData)
  },

  // 图片合成
	async composeImage () {
    const that = this
    this.setData({
      canClick: false
    })
    wx.showLoading({ title: '制作中...', })
    const { photoBg, filePath } = this.data
    const {
      width,
      height
    } = this.data.imageData

		// 将颜色转为 rgba值
    const bgc = hexRgb(photoBg, { format: 'array' })

		// 底图
		const baseImg = {bgc, width, height }
		// 人像图
		const peopleImg = {img: filePath, ...this.computedXY(baseImg, this.data) }
	
		// 组合图片顺序
    
		// 合成图片 返回url
		apiRequest.imageCompose({baseImg, peopleImg}, {
      successFn: (res)=>{
        wx.hideLoading()
        if(res.data.code==200) {
          const url = CONFIG.API_BASE_URL + res.data.data.composeImgPath
          this.downloadAndToComplate(url)
        } else {
          wx.showToast({ title: '生成照片失败', icon: 'error', duration: 2000 })
        }
      },
      failFn: (res)=>{
        wx.showToast({ title: '生成照片服务失败', icon: 'error', duration: 2000 })
        that.setData({
          canClick: true
        })
      }
    })
  },

  // 计算相对底图的 x ， y
  computedXY(baseImg, imgData) {
    const left = (imgData.left - imgData.initImgWidth / 2)
    const top = (imgData.top - imgData.initImgHeight / 2)
    const noScaleImgHeight = baseImg.width * imgData.initImgHeight / imgData.initImgWidth
    const resultImgWidth = baseImg.width * imgData.scale
    const resultImgHeight = noScaleImgHeight * imgData.scale
    const scaleChangeWidth = (resultImgWidth / 2 - baseImg.width / 2)
    const scaleChangeHeight = (resultImgHeight / 2 - noScaleImgHeight / 2)
    const x = left - scaleChangeWidth
    const y = top - scaleChangeHeight
    return {
      x,
      y,
      width: resultImgWidth,
      height: resultImgHeight
    }
  },


  // 下载并跳转
	async downloadAndToComplate (url) {
    let msg = ''
    try {
      // 下载图片到本地
			const { tempFilePath, dataLength } = await apiRequest.downloadImg(url)
      const { targetWidth, targetHeight } = this.data
      const size = (dataLength / 1024).toFixed(2)
			msg = `图片像素${targetWidth + ' * ' + targetHeight}，图片大小${size}kb`

			// 保存图片到相册
			await this.saveImage(tempFilePath)
      wx.redirectTo({ url: './complete/complete?msg=' + msg + '&tempFilePath=' + tempFilePath + '&url=' + url, })
      
    } catch (error) {	
			msg = '下载失败，点击下图预览保存图片。'
			wx.redirectTo({ url: '.ß/complete/complete?msg=' + msg + '&tempFilePath=' + url + '&url=' + url, }) 
    }
  },

  // 保存图片到相册
  saveImage(tempFilePath) {
    const that = this
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success(res) {
                that.saveTmp(tempFilePath, resolve, reject)  
              },
              fail(res) {
                errMsg: 'authorize:fail auth deny'
                wx.showModal({
                  title: '提示',
                  content: '检测到您没打开保存图片到相册功能权限，是否去设置打开？',
                  success(res) {
                    if (res.confirm) {
                      wx.openSetting({
                        success: (res) => {
                        },
                      })
                    } else if (res.cancel) {
                      console.log(22)
                    }
                    that.setData({
                      canClick: true
                    })
                  },
                })
              },
            })
          } else {
            that.saveTmp(tempFilePath, resolve, reject)
          }
        }
      })
    })
  },

  saveTmp(tempFilePath, resolve, reject){
    const that = this
    wx.getImageInfo({
      src: imgUrl,
      success: function (sres) {
          //授权ok
          wx.saveImageToPhotosAlbum({
            filePath: sres.path,
            success(res) {
              wx.showToast({
                title: '下载成功'
              })
              resolve()
              that.setData({
                canClick: true
              })
            },
            fail: (res) => {
              wx.showToast({
                title: '下载失败',
                icon: "none"
              })
              reject(new Error('错误'))
              that.setData({
                canClick: true
              })
            }
          })
      }
    })
  },

  
  touchstart: function (e) {
    if (e.touches.length < 2) {
      canOnePointMove = true
      onePoint.x = e.touches[0].pageX * 2
      onePoint.y = e.touches[0].pageY * 2
    } else {
      twoPoint.x1 = e.touches[0].pageX * 2
      twoPoint.y1 = e.touches[0].pageY * 2
      twoPoint.x2 = e.touches[1].pageX * 2
      twoPoint.y2 = e.touches[1].pageY * 2
    }
  },
  touchmove: function (e) {
    var that = this
    const thatData = that.data

    if (e.touches.length < 2 && canOnePointMove) {
      var onePointDiffX = e.touches[0].pageX * 2 - onePoint.x
      var onePointDiffY = e.touches[0].pageY * 2 - onePoint.y
      const imgSetData = {
        msg: '单点移动',
        left: thatData.left + onePointDiffX,
        top: thatData.top + onePointDiffY
      }
      that.setData(imgSetData)
      onePoint.x = e.touches[0].pageX * 2
      onePoint.y = e.touches[0].pageY * 2
    } else if (e.touches.length > 1) {
      var preTwoPoint = JSON.parse(JSON.stringify(twoPoint))
      twoPoint.x1 = e.touches[0].pageX * 2
      twoPoint.y1 = e.touches[0].pageY * 2
      twoPoint.x2 = e.touches[1].pageX * 2
      twoPoint.y2 = e.touches[1].pageY * 2
      // 计算角度，旋转(优先)
      var perAngle = Math.atan((preTwoPoint.y1 - preTwoPoint.y2) / (preTwoPoint.x1 - preTwoPoint.x2)) * 180 / Math.PI
      var curAngle = Math.atan((twoPoint.y1 - twoPoint.y2) / (twoPoint.x1 - twoPoint.x2)) * 180 / Math.PI
      if (Math.abs(perAngle - curAngle) > 1) {
        // that.setData({
        // 	msg: '旋转',
        // 	rotate: thatData.rotate + (curAngle - perAngle)
        // })
      } else {
        // 计算距离，缩放
        var preDistance = Math.sqrt(Math.pow((preTwoPoint.x1 - preTwoPoint.x2), 2) + Math.pow((preTwoPoint.y1 - preTwoPoint.y2), 2))
        var curDistance = Math.sqrt(Math.pow((twoPoint.x1 - twoPoint.x2), 2) + Math.pow((twoPoint.y1 - twoPoint.y2), 2))
        const imgSetData = {
          msg: '缩放',
          scale: thatData.scale + (curDistance - preDistance) * 0.005
        }
        that.setData(imgSetData)
      }
    }
  },
  touchend: function (e) {
    var that = this
    canOnePointMove = false
  },

})