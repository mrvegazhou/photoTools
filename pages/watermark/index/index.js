const util = require("../../../utils/util");
import { checkLogin, doLogin } from '../../../utils/loginAuth'
var timer;
var QQMapWX = require('../../../vendor/qqmap-wx-jssdk.js');
var qqmapsdk = new QQMapWX({
	key: 'UDUBZ-OZQ3F-IGWJH-JVQLK-SI5J2-UPFAU' // 必填
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    colorMap: [
      ['0', '#ee2746'], //淡曙红
      ['1', '#1c0d1a'], //深牵牛紫
      ['2', '#5bae23'], //鹦鹉绿
      ['3', '#51c4d3'], //瀑布蓝
      ['4', '#c4d7d6'], //穹灰
      ['5', '#eed045'], //秋葵黄
      ['6', '#ffffff']
    ],
    size: 20,
    density: 50,
    currentColorIndex: -1,
    text: '点击图片上传',
    inputFocus: false,
    canvasW: 100,
    canvasH: 200,
    imgW: 0,
    imgH: 0,
    isSave: false,
    draw: false,
    opacity: .3,
    rotate: 30,
    color: '#000000',
		imgUrl: '',
		fontWaterFlag: true,
    timeAndLocFlag: false,
    date: "",
		time: '',
		week: '',
		address: '',
    showPicker: false,
    actionShow: false,
    camera: {
      showCamera: false,
      cameraPos: 'back',
      cameraHasImg: false,
      imgUrl: '',
      flush: 'off', //torch
    },
    canvasDisplay: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
		this.getTime();
		this.getLocation();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
		this.createContext();
  },

  createContext(){
    let that = this;
    const query = wx.createSelectorQuery()
    query.select('#myCanvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        that.setData({ctx: ctx, canvas: canvas});
      });
  },

  chooseImg(sourceType) {
    this.setData({
      actionShow: true,
      canvasDisplay: false
    });
  },

  chooseImage(sourceType) {
    const that = this
    this.setData({
      actionShow: true,
    });
    if(sourceType==='camera') {
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.camera']) {
            that.setData({
              'camera.showCamera': true,
              'camera.imgUrl': '',
              'camera.cameraHasImg': false,
              actionShow: false,
              canvasDisplay: true,
            }, that.pageScrollToBottom());
            
          } else {
            wx.authorize({
							scope: 'scope.camera',
							success () {
                that.setData({
                  canvasDisplay: true,
                });
							},
							fail(){
                that.openConfirm();
                that.setData({
                  canvasDisplay: true,
                });
							}
            })
          }
        },
				fail () {
          that.setData({
            canvasDisplay: true,
          });
				}
      })
    } else if(sourceType==='album') {
        //选择打开相册
        wx.chooseMedia({
          count: 1,
          mediaType: 'image',
          sourceType: ['album'],
          sizeType: 'original',
          success:(res)=> {
            that.getImgInfo(res.tempFiles[0].tempFilePath);
          },
          fail () {
            wx.showToast({ title: '取消选择', icon: 'none', duration: 2000 })
            that.setData({
              "actionShow": false,
              "canvasDisplay": true,
            })
          }
        })
    } else if(sourceType==='talk') {
      wx.chooseMessageFile({
        count: 1,
        type: 'image',
        success (res) {
          // tempFilePath可以作为 img 标签的 src 属性显示图片
          const tempFilePaths = res.tempFiles;
          that.getImgInfo(tempFilePaths[0].path);
          that.setData({
            "actionShow": false,
            "canvasDisplay": true,
          })
        }
      })
    }
  },

  getImgInfo(imgUrl) {
    let that = this;
    wx.getImageInfo({
      src: imgUrl,
      success: function(e) {
        var imgW = e.width,
          imgH = e.height,
          canvasW = wx.getSystemInfoSync().windowWidth,
          canvasH = canvasW * imgH / imgW;

        that.setData({
          canvasW: canvasW,
          canvasH: canvasH,
          imgW: imgW,
          imgH: imgH,
          imgUrl: imgUrl
        }, that.pageScrollToBottom());

        let config = that.getConfig();
        that.makeWater(config);
        that.setData({
          "draw": true,
          "actionShow": false,
          "canvasDisplay": true,
        });
      }
    })
  },

  cancel() {
    this.setData({
      "canvasDisplay": true,
    });
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
  // 拍照
  takeCameraImg() {
    var that = this;
    var context = wx.createCameraContext();
    // 照相功能
    context.takePhoto({
      quality: "high",
      success: res => {
        that.setData({
          'camera.imgUrl': res.tempImagePath,
          'camera.cameraHasImg': true
        });
      },
      fail: () => {
        wx.showToast({
          title: '出现错误',
        })
      }
    })
  },

  //控制拍照的闪光灯
  turnCameraFlush(e) {
    let flush = e.target.dataset.flush;
    this.setData({
      'camera.flush': flush
    });
  },

  //相机前后镜头转换
  changeCameraPos() {
    this.setData({
      'camera.cameraPos': this.data.camera.cameraPos == "back" ? "front" : "back"
    })
  },

  //关闭相机
  closeCamera() {
    this.setData({
      'camera.showCamera': false,
    });
    let imgUrl = this.data.camera.imgUrl;
    if(imgUrl!='') {
      this.getImgInfo(imgUrl);
    }
  },

  goCameraRepeat(){
    this.setData({
      'camera.cameraHasImg':false,
      'camera.imgUrl':'',
    });
  },

  doChooseImage(e) {
    const that = this
    const sourceType = e.target.dataset.type
    that.chooseImage(sourceType)
    return;
    checkLogin().then(res => {
      that.chooseImage(sourceType);
    }, err => {
      wx.getUserProfile({
				desc: '用于完善会员资料',
				success: (res) => {
					doLogin(res.userInfo).then(login_res => {
            that.chooseImage(sourceType)
          }, err => {
          }).catch((err) => {
          });
						
				},
				fail(){
          wx.showToast({ title: '请授权后继续', icon: 'none', duration: 2000 });
				}
			})
    })
    
  },

  getConfig() {
    let that = this;
    return {
      text: that.data.text,
      color: that.data.color,
      xStart: 0,
      yStart: -.71 * that.data.imgW,
      xSpace: that.data.density/2,
      ySpace: that.data.density,
      rotate: that.data.rotate,
      opacity: that.data.opacity,
      width: that.data.canvasW,
      height: that.data.canvasH,
      scale: that.data.canvasW / that.data.imgW,
      size: that.data.size,
      imgUrl: that.data.imgUrl
    };
  },

  imageOnLoadSync(canvas, src) {
    return new Promise((resolve) => {
      const image = canvas.createImage();
      image.onload = () => {
        resolve(image)
      }
      // 设置图片src
      image.src = src
    })
  },

  async makeWater(config) {
    const dpr = 1//wx.getSystemInfoSync().pixelRatio;
    let canvas = this.data.canvas;
    let ctx = this.data.ctx;
    canvas.width = config.width * dpr;
    canvas.height = config.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, config.width, config.height);
    ctx.save();
    ctx.scale(1, 1);
    ctx.globalAlpha = 1;
    const image = await this.imageOnLoadSync(canvas, config.imgUrl);
    ctx.drawImage(image, 0, 0, config.width, config.height)
    ctx.fillStyle = config.color;
    ctx.font = `normal ${config.size}px sans-serif`;
    ctx.globalAlpha = config.opacity;
    config.scale < 1 && ctx.scale(config.scale, config.scale);
    
    if(this.data.fontWaterFlag) {
      this.writeText(ctx, config);
    }
    
    if(this.data.timeAndLocFlag) {
      console.log(3333)
      this.writeTimeAndLoc(ctx);
    }
    
    ctx.restore();
  },

  writeText(canvasContext, canvasConfig) {
    canvasContext.save();
    canvasContext.rotate(Math.PI / 180 * canvasConfig.rotate);
    var canvasxSpace = canvasConfig.xSpace,
    canvasySpace = canvasConfig.ySpace,
    textLength = canvasConfig.text.length,
    sizeWidth = canvasConfig.size + canvasySpace,
    sizeHeight = canvasConfig.size * textLength + canvasxSpace,
    allSize = .72 * (canvasConfig.width + canvasConfig.height);
    canvasConfig.scale < 1 && (allSize /= canvasConfig.scale);
    
    for (var y = canvasConfig.yStart; y < allSize + sizeWidth; y += sizeWidth) {
      for (var x = canvasConfig.xStart; x < allSize + sizeHeight; x += sizeHeight) {
        canvasContext.fillText(canvasConfig.text, x, y);
      }
    }
    canvasContext.restore();
  },

  writeTimeAndLoc(ctx) {
    let that = this;
    var imgW = that.data.imgW,
        imgH = that.data.imgH;
    ctx.save();
    ctx.textBaseline = 'bottom';

    var addr = that.data.address;
    var dateStr = that.data.date;
    var week = that.data.week;

    var addrH = ctx.measureText(addr.slice(0, 1)).width;
    var weekStrH = ctx.measureText(week.slice(0, 1)).width;

    // 绘制地址
    var chr = addr.split("");
    var temp = "";
    var row = [];
    for (var a = 0; a < chr.length; a++) {
      if (ctx.measureText(temp).width < (imgW-25)) {
        temp += chr[a];
      } else {
        a--;
        row.push(temp);
        temp = "";
      }
    }
    row.push(temp);
    var rowLen = row.length;
    for (var b = rowLen; b > 0; b--) {
      ctx.fillText(row[rowLen-b], 10, imgH - (addrH + 5)*b);
    }
    var dateH = (addrH + 5)*rowLen + weekStrH + 10;
    var weekH = (addrH + 5)*rowLen + weekStrH + 20 + weekStrH;

    //绘制时间
    ctx.fillText(dateStr + ' ' + that.data.time, 10, imgH - dateH);
    //绘制星期
    ctx.fillText(week, 10, imgH - weekH);
    ctx.restore();
  },


  handleColorClick: function(e) {
    var id = e.target.id;
    if (id) {
      var that = this;
      this.setData({
        currentColorIndex: id
      },
      function() {
        if (that.data.color = that.data.colorMap[id][1], !that.data.draw) return false;
        that.setData({color: that.data.colorMap[id][1]});
        that.makeWater(that.getConfig());
      });
    }
  },

  handleTextBlur: function(e) {
    this.setData({
      inputFocus: false,
    });
  },

  handleTextFocus: function() {
    this.setData({
      inputFocus: true
    });
  },


  /**
   * text改变监听器
   */
  handleTextChange: function(e, debounceDelay) {
    var that, time, timeOut, n, s,
      r = function() {
        var timeDiff = new Date().getTime() - time;
        timeDiff < debounceDelay && timeDiff >= 0 ? timeOut = setTimeout(r, debounceDelay - timeDiff) : (timeOut = null, s = e.apply(that, n), timeOut || (that = n = null));
      };
    return function() {
      return that = this, n = arguments, time = new Date().getTime(), timeOut || (timeOut = setTimeout(r, debounceDelay)), s;
    };
  }(function(e) {
    this.setData({
      text: e.detail.value
    });
    this.data.draw && this.makeWater(this.getConfig());
    
  }, 200),


  /**
   * 点击密度监听器
   */
  handelDensityClick: function(e) {
    var val = e.detail.value;
    var that = this;
    this.setData({
        density: val
      },
      function() {
        if (!that.data.draw) return false;
        this.data.draw && this.makeWater(this.getConfig());
      });
  },

  handelOpacityClick: function(e) {
    var val = e.detail.value;
    val /= 100;
    var that = this;
    this.setData({
      opacity: val
      },
      function() {
        if (!that.data.draw) return false;
        this.data.draw && this.makeWater(this.getConfig());
      });
  },

  /**
   * 点击尺寸监听器
   */
  handelSizeClick: function(e) {
    var val = e.detail.value;
    var that = this;
    this.setData({
        size: val
      },
      function() {
        if (!that.data.draw) return false;
        this.data.draw && this.makeWater(this.getConfig());
      }
    );
  },

  clearText: function(){
    this.setData({
      inputFocus: false,
      text: '',
    });
    this.data.draw && this.makeWater(this.getConfig());
    this.setData({
      inputFocus: true
    })
  },

  reset() {
    let ctx = this.data.ctx;
    ctx.clearRect(0, 0, this.data.canvasW, this.data.canvasH);

    this.setData({
      size: 10,
      density: 50,
      currentColorIndex: -1,
      text: '点击图片上传',
      inputFocus: false,
      canvasW: 100,
      canvasH: 200,
      imgW: 0,
      imgH: 0,
      isSave: false,
      draw: false,
      opacity: .5,
      rotate: 30,
      color: '#000000',
      ctx: null,
			imgUrl: '',
			height:0
    });
  },

  /**
   * 保存图片
   */
  saveImg: function(e) {
    let that = this;
    if (!this.data.draw){
			wx.showToast({
				title: '请上传图片',
				icon: 'error',
			});
			return false;
		}
    wx.showLoading({
      title: '保存中'
    });
    var imgW = that.data.imgW,
        imgH = that.data.imgH;
    const query = wx.createSelectorQuery()
    query.select('#myCanvas2')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        let imgUrl = that.data.imgUrl;
        var size = that.data.size;
        
          canvas.width = imgW;
          canvas.height = imgH;
          ctx.clearRect(0, 0, imgW, imgH);

          ctx.save();
          ctx.globalAlpha = 1;
          const image = await that.imageOnLoadSync(canvas, imgUrl);
          ctx.drawImage(image, 0, 0, imgW, imgH);
					ctx.restore();


					if(that.data.fontWaterFlag) {
						ctx.save();
						ctx.globalAlpha = that.data.opacity;
						ctx.fillStyle = that.data.color;
						ctx.font = `normal ${size}px sans-serif`;
						ctx.rotate(Math.PI / 180 * that.data.rotate);
						
						let canvasySpace = that.data.density;
						let canvasxSpace = that.data.density/2;
						let txt = that.data.text;
						let textLength = txt.length;
						let sizeWidth = size + canvasySpace;
						
						let sizeHeight = size * textLength + canvasxSpace;
						let allSize = .72 * (imgW + imgH);
						let yStart = -.71 * imgW;

						for (var y = yStart; y < allSize + sizeWidth; y += sizeWidth) {
							for (var x = 0; x < allSize + sizeHeight; x += sizeHeight) {
								ctx.fillText(txt, x, y);
							}
						}
						ctx.restore();
          }
          
					if(that.data.timeAndLocFlag) {
						ctx.save();
						ctx.globalAlpha = that.data.opacity;
						ctx.font = `normal ${size}px sans-serif`;
						ctx.fillStyle = that.data.color;

            that.writeTimeAndLoc(ctx);
            
						ctx.restore();
					}
					
          setTimeout(() => {
            wx.canvasToTempFilePath({
              canvasId: 'myCanvas2',
              canvas: canvas,
              destWidth: imgW,
              destHeight: imgH,
              success: function(e) {
                wx.saveImageToPhotosAlbum({
                  filePath: e.tempFilePath,
                  success: function() {
                    wx.hideLoading(),
                    wx.showToast({
                      title: '已保存到相册',
                      icon: 'success',
                      duration: 2e3
                    })
                  }
                })
              },
              fail(error) {
                wx.showToast({
									title: '图片生成失败',
									icon: 'error',
                });
                wx.hideLoading();
                console.log(error);
              }
            });
          }, 100)
      });

    that.setData({
      isSave: true
    });
    wx.hideLoading();
  },

  checkboxChange(e) {
    let val = e.detail.value;
    if(val.length==2) {
      this.setData({
        fontWaterFlag: true,
        timeAndLocFlag: true
      });
    } else if(val.length==1) {
      if(val[0]=="1") {
        this.setData({
          fontWaterFlag: true,
          timeAndLocFlag: false,
        });
      } else if(val[0]=="2") {
        this.setData({
          timeAndLocFlag: true,
          fontWaterFlag: false,
        });
      }
    } else {
      this.setData({
        fontWaterFlag: false,
        timeAndLocFlag: false
      });
    }
    this.makeWater(this.getConfig());
  },

  chooseLocation() {
    let that = this;
    wx.chooseLocation({
			success: res => {
				this.setData({
					address: res.address
        })
        that.makeWater(that.getConfig());
			},
			fail: err => {
				console.log(err)
			}
		})
  },

  setTime: function () {
		clearInterval(timer)
		this.setData({
			showPicker: true
		})
	},
	
	getTime: function () {
		timer = setInterval(() => {
			let timeData = util.formatDateWeekTime()
			this.setData({
				date: timeData.date,
				time: timeData.time,
				week: timeData.week
			})
		}, 1000)
	},
  
	closePicker: function () {
		this.setData({
			showPicker: false
		})
	},

	/**
	 * 获取地址信息
	 */
	getLocation: function () {
		wx.getLocation({
			success: res => {
				qqmapsdk.reverseGeocoder({
					location: {
						latitude: res.latitude,
						longitude: res.longitude
					},
					success: res => {
						let address = res.result.address;
						this.setData({
							address
						})
					}
				})
			}
		})
  },
  
  // 自动到view底部
  pageScrollToBottom() {
    wx.createSelectorQuery().select('.container').boundingClientRect(function(rect) {
      if (rect){
        // 使页面滚动到底部
        console.log(rect.height);
        wx.pageScrollTo({
           scrollTop: rect.height
        })
      }
    }).exec()
  },
})