const util = require("../../../utils/util");
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
      ['0', '#808080'],
      ['1', '#000000'],
      ['2', '#ee0000'],
      ['3', '#ffffff'],
      ['4', '#87CEEB']
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
		showPicker: false
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

  chooseImg() {
    var that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['original'],
      success: function(e) {
        var imgUrl = e.tempFiles[0].tempFilePath;
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
            });

            let config = that.getConfig();
            that.makeWater(config);
            that.setData({
              draw: true,
            });
          }
        })
      }
    });
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
    ctx.rotate(Math.PI / 180 * config.rotate);
    ctx.globalAlpha = config.opacity;
    config.scale < 1 && ctx.scale(config.scale, config.scale);
    this.writeText(ctx, config);
    ctx.restore();
  },

  writeText(canvasContext, canvasConfig) {
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
						ctx.font = `normal ${size}px null`;
						ctx.fillStyle = that.data.color;
						ctx.textBaseline = 'bottom';

						var addr = that.data.address;
						var dateStr = that.data.date;
						var week = that.data.week;

						var metrics = ctx.measureText(addr.slice(0, 1));
						var addrH = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

						var metrics = ctx.measureText(dateStr.slice(0, 1));
						var dateStrH = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

						var metrics = ctx.measureText(week.slice(0, 1));
						var weekH = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

						var maxH = addrH + dateStrH + weekH + 5*3;

						// 绘制地址
						ctx.fillText(addr, 10, imgH - (addrH + 5));
						//绘制时间
						ctx.fillText(dateStr + ' ' + that.data.time, 10, imgH - (addrH + dateStrH + 10));
						//绘制星期
						ctx.fillText(that.data.week, 10, imgH - maxH);
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
								})
                console.log(error);
              }
            });
          }, 100)
      });

    that.setData({
      isSave: true
    })
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
  },

  chooseLocation() {
    wx.chooseLocation({
			success: res => {
				this.setData({
					address: res.address
				})
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
})