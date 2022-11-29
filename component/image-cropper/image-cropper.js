// components/yeyouzi-cropper/yeyouzi-cropper.js
let success;
let fail;
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    canvas: '',
    ctx: '',
    dpr: '',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    cutMove: false,
    img: {
      path: '',
      width: 0,
      height: 0,
      type: 1    // 1:横向 2:纵向
    },
    imageWidth: 0,
    imageHeight: 0,
    imageLeft: 0,
    imageTop: 0,
    imgRotate: 0,
    imgMirror: 0,
    imgMove: false,
    imgStart: {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      distance: 0,
      width: 0,
      height: 0,
      cutImg: ''
    },
    imgScale: false,

    cutImg: {
      path: '',
      x: 0,
      y: 0,
      width: 0,
      height: 0
    },
    // 截图选择框
    selectPosi: {
      x: 0,
      y: 0,
      w: 0,
      h: 0
    },

    imgpath:''

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 公有方法
     */

    //初始化
    init(param){
      success = param.success
      fail = param.fail
      var that = this;
      this.setData({
        img: {
          path: param.imgPath
        }
      })
      const query = wx.createSelectorQuery().in(this)
      query.select('#cutCanvas')
          .fields({node: true, size: true})
          .exec((res) => {
            const canvas = res[0].node
            const ctx = canvas.getContext('2d')
            const dpr = wx.getSystemInfoSync().pixelRatio
            canvas.width = res[0].width * dpr
            canvas.height = res[0].height * dpr
            ctx.scale(dpr,dpr)

            var x1 = canvas.width * 0.15 / dpr;
            var y1 = (canvas.height - canvas.width * 0.7) / 2 / dpr;
            var x2 = x1 + canvas.width * 0.7 / dpr;
            var y2 = y1 + canvas.width * 0.7 / dpr;

            that.setData({
              canvas: canvas,
              ctx: ctx,
              dpr: dpr,
              x1: x1,
              y1: y1,
              x2: x2,
              y2: y2
            })
            let selectPosi = this.data.selectPosi;
            selectPosi.x = x1;
            selectPosi.y = y1;
            selectPosi.w = x2 - x1;
            selectPosi.h = y2 - y1;
            this.setData({selectPosi: selectPosi});
            this._drawSelect(
              this.data.selectPosi.x,
              this.data.selectPosi.y,
              this.data.selectPosi.w,
              this.data.selectPosi.h);
            wx.getImageInfo({
              src: param.imgPath,
              success(img){
                var width = '';
                var height = '';
                var type = 0;
                var x = '';
                var y = '';
                var d = '';
                if(img.width > img.height){
                  height = that.data.y2 - that.data.y1;
                  width = (img.width * height) / img.height
                  type = 1
                  d = img.height
                  x = (img.width - d) / 2
                  y = 0
                }else{
                  width = that.data.x2 - that.data.x1;
                  height = (img.height * width) / img.width
                  type = 2
                  d = img.width
                  x = 0
                  y = (img.height - d) / 2
                }
                that.setData({
                  img: {
                    path: param.imgPath,
                    width: img.width,
                    height: img.height,
                    type: type
                  },
                  cutImg: {
                    x: x,
                    y: y,
                    width: d,
                    height: d
                  },
                  imageWidth: ((x2 - x1) / d) * img.width,
                  imageHeight: ((y2 - y1) / d) * img.height,
                  imageLeft: x1 - ((x2 - x1) / d) * x,
                  imageTop: y1 - ((y2 - y1) / d) * y,
                  imgRotate: 0
                })
              }
            })
          })
          
    },

//---------------------begin---------------------//
    _drawSelect(x, y, w, h) {
      var ctx = this.data.ctx;
      var canvas = this.data.canvas;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 画遮罩
      // this._drawCover();
      // 画矩形
      ctx.save();
      ctx.strokeStyle = '#5696f8';
      ctx.lineWidth = 1;
      ctx.clearRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      // 画八个操作点
      this.operatePoint = this._getOperatePoint(x, y, w, h);
      this.operatePoint.map((item) => {
        ctx.save();
        ctx.fillStyle = '#5696f8';
        ctx.fillRect(...item);
        ctx.restore();
      })
      ctx.restore();

      this.setData({ mousePosi: this._getMousePosi(x, y, w, h) });
    },
    _drawCover() {
      var ctx = this.data.ctx;
      ctx.save();
      ctx.fillStyle = 'rgba(80, 80, 80, .6)';
      var canvas = this.data.canvas;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-atop';
      ctx.restore();
    },
    _getOperatePoint(x, y, w, h) {
      return [
        [ x, y, 8, 8 ], // 0
        [ x + w - 8, y, 8, 8 ], // 1
        [ x + w - 8, y + h - 8, 8, 8 ], // 2
        [ x, y + h - 8, 8, 8 ], // 3
        [ x + w / 2 - 8, y, 8, 8 ], // 4
        [ x + w - 8, y + h / 2 - 4, 8, 8 ], // 5
        [ x + w / 2 - 8, y + h - 8, 8, 8 ], // 6
        [ x, y + h / 2 - 4, 8, 8 ] // 7
       ]
    },

    _getMousePosi(x, y, w, h) {
      // 四个点 四条边
      return [
        [ x, y, 15, 15 ],
        [ x + w - 15, y, 15, 15 ],
        [ x + w - 15, y + h - 15, 15, 15 ],
        [ x, y + h - 15, 15, 15 ],
        [ x + 15, y, w - 15, 15 ],
        [ x + w - 15, y + 15, 15, h - 15 ],
        [ x + 15, y + h - 15, w - 15, 15 ],
        [ x, y + 15, 15, h - 15 ],
        [ x + 15, y + 15, w - 15, h - 15 ]
       ]
    },
    _checkPath(x, y, rect) {
      let ctx = this.data.ctx;
      ctx.beginPath();
      ctx.rect(...rect);
      let status = ctx.isPointInPath(x, y);
      ctx.closePath();
      return status;
    },
    _getInitCursorIndex(pathX, pathY) {
      let { mousePosi } = this.data;
      for(let i = 0; i < mousePosi.length; i++) {
        if (this._checkPath(pathX, pathY, mousePosi[i])) {
          return i;
        }
      }
    },
    _getNewSelectPosi(i, select, distance) {
      let _select = { ...select };
      let { x: distanceX, y: distanceY } = distance;
      switch(i) {
        case 0:
          _select.x += distanceX;
          _select.y += distanceY;
          _select.w -= distanceX;
          _select.h -= distanceY;
          break;
        case 1:
          _select.y += distanceY;
          _select.w += distanceX;
          _select.h -= distanceY;
          break;
        case 2:
          _select.w += distanceX;
          _select.h += distanceY;
          break;
        case 3:
          _select.x += distanceX;
          _select.w -= distanceX;
          _select.h += distanceY;
          break;
        case 4:
          _select.y += distanceY;
          _select.h -= distanceY;
          break;
        case 5:
          _select.w += distanceX;
          break;
        case 6:
          _select.h += distanceY;
          break;
        case 7:
          _select.x += distanceX;
          _select.w -= distanceX;
          break;
        case 8:
          _select.x += distanceX;
          _select.y += distanceY;
          break;
        default:
          break;
      }
      return _select;
    },
    _checkBoundarySize(_select) {
      let canvas = this.data.canvas;
      _select.x < 0 && (_select.x = 0);
      _select.y < 0 && (_select.y = 0);
      _select.w < 50 && (_select.w = 50);
      _select.h < 50 && (_select.h = 50);
      _select.x + _select.w >= canvas.width && (_select.w -=  (_select.x + _select.w - canvas.width));
      _select.y + _select.h >= canvas.height && (_select.h -= (_select.y + _select.h - canvas.height));
      return _select;
    },
//---------------------end---------------------//

    _touchStart(e){
      //图片是否移动
      const flag = (e.touches[0].x < this.data.selectPosi.x || (this.data.selectPosi.x+this.data.selectPosi.w) < e.touches[0].x) || (e.touches[0].y < this.data.selectPosi.y || (this.data.selectPosi.y+this.data.selectPosi.h) < e.touches[0].y);
      if(flag) {
          if(e.touches.length == 1){
            this.setData({
              imgMove: true,
              imgStart: {
                x: e.touches[0].x,
                y: e.touches[0].y,
                left: this.data.imageLeft,
                top: this.data.imageTop
              },
              imgScale: false
            })
          }else if(e.touches.length == 2){
            this.setData({
              imgMove: false,
              imgStart: {
                distance: Math.sqrt(Math.pow(e.touches[1].x - e.touches[0].x, 2) + Math.pow(e.touches[1].y - e.touches[0].y, 2)),
                width: this.data.imageWidth,
                height: this.data.imageHeight,
                cutImg: this.data.cutImg
              },
              imgScale: true
            })
          }
      } else {
        //裁剪框是否移动
        let clientX = e.touches[0].x;
        let clientY = e.touches[0].y;
        let { offsetLeft, offsetTop } = e.target;
        let { dpr } = this.data;
        this.setData({ origin: { x: offsetLeft, y: offsetTop } });
        let startPointX = (clientX - offsetLeft);
        let startPointY = (clientY - offsetTop);
        let pathX = startPointX * dpr;
        let pathY = startPointY * dpr;
        let canvas = this.data.canvas;
        let initPosi = {
          x: startPointX < 0 ? 0 : startPointX >= canvas.width ? canvas.width : startPointX,
          y: startPointY < 0 ? 0 : startPointY >= canvas.height ? canvas.height : startPointY
        }
        // 开始范围
        this.setData({ initPosi, touchStart: true, cursorIndex: this._getInitCursorIndex(pathX, pathY) });
        this.setData({
          cutMove: true
        })
      }
    },

    _touchMove(e){
      if(this.data.cutMove){
        let clientX = e.touches[0].x;
        let clientY = e.touches[0].y;
        let { offsetLeft, offsetTop } = e.target;
        let { canvas, touchStart, selectPosi, initPosi } = this.data;
        if (!touchStart) return;
        let movePointX = (clientX - offsetLeft);
        let movePointY = (clientY - offsetTop);
        movePointX = movePointX < 0 ? 0 : movePointX >= canvas.width ? canvas.width - 4 : movePointX;
        movePointY = movePointY < 0 ? 0 : movePointY >= canvas.height ? canvas.height : movePointY;
        let distanceX = movePointX - initPosi.x;
        let distanceY = movePointY - initPosi.y;
        selectPosi = this._getNewSelectPosi(
          this.data.cursorIndex,
          selectPosi,
          { x: distanceX, y: distanceY }
        );
        selectPosi = this._checkBoundarySize(selectPosi);
        this.setData({ 
          initPosi: { x: movePointX, y: movePointY }, 
          selectPosi: selectPosi
        });
        this._drawSelect(selectPosi.x, selectPosi.y, selectPosi.w, selectPosi.h);
        
      }else if(this.data.imgMove){
        var dx = this.data.imgStart.x - e.touches[0].x
        var dy = this.data.imgStart.y - e.touches[0].y
        var rotate = this.data.imgRotate
        var left = this.data.imgStart.left - dx
        var top = this.data.imgStart.top - dy
        if(this.data.imgMirror == 180){
          dx = -dx
          rotate = -rotate
        }
        var tx = dx * Math.cos(rotate * Math.PI / 180) + dy * Math.sin(rotate * Math.PI / 180)
        var ty = dy * Math.cos(rotate * Math.PI / 180) - dx * Math.sin(rotate * Math.PI / 180)
        var x = (tx + 0.5* this.data.imageWidth) / this.data.imageWidth * this.data.img.width - this.data.cutImg.width / 2;
        var y = (ty + 0.5 * this.data.imageHeight) / this.data.imageHeight * this.data.img.height - this.data.cutImg.height / 2;
        this.setData({
          cutImg: {
            width: this.data.cutImg.width,
            height: this.data.cutImg.height,
            x: x,
            y: y
          },
          imageLeft: left,
          imageTop: top,
        })
      }else if(this.data.imgScale){
        var nowDistance = Math.sqrt(Math.pow(e.touches[1].x - e.touches[0].x, 2) + Math.pow(e.touches[1].y - e.touches[0].y, 2))
        var m = nowDistance / this.data.imgStart.distance
        var width = this.data.imgStart.width * m
        var height = this.data.imgStart.height * m
        if(this.data.img.type == 1){
          height = height < this.data.y2 - this.data.y1 ? this.data.y2 - this.data.y1 : height
          height = height > (this.data.y2 - this.data.y1)*10 ? (this.data.y2 - this.data.y1)*10 : height
          width = (height * this.data.img.width) / this.data.img.height
        }else{
          width = width < this.data.x2 - this.data.x1 ? this.data.x2 - this.data.x1 : width
          width = width > (this.data.x2 - this.data.x1)*10 ? (this.data.x2 - this.data.x1)*10 : width
          height = (width * this.data.img.height) / this.data.img.width
        }
        var n = width / this.data.imgStart.width
        var cut = {
          x: this.data.imgStart.cutImg.x + ((n - 1) / (2 * n)) * this.data.imgStart.cutImg.width,
          y: this.data.imgStart.cutImg.y + ((n - 1) / (2 * n)) * this.data.imgStart.cutImg.height,
          width: this.data.imgStart.cutImg.width / n,
          height: this.data.imgStart.cutImg.height / n
        }
        var left = this.data.x1 - ((this.data.x2 - this.data.x1) / cut.width) * cut.x
        left = left > this.data.x1 ? this.data.x1 : left
        left = left < this.data.x2 - this.data.imageWidth ? this.data.x2 - this.data.imageWidth :left
        var top = this.data.y1 - ((this.data.y2 - this.data.y1) / cut.height) * cut.y
        top = top > this.data.y1 ? this.data.y1 : top
        top = top < this.data.y2 - this.data.imageHeight ? this.data.y2 - this.data.imageHeight : top
        this.setData({
          imageLeft: left,
          imageTop: top,
          imageWidth: width,
          imageHeight: height,
          cutImg: {
            x: cut.x,
            y: cut.y,
            width: cut.width,
            height: cut.height
          },
        })
      }
    },

    _touchEnd(e){
      if (this.data.touchStart) {
        this.setData({ touchStart: false, getUrl: true });
      }
      if(this.data.imgMove){
        var left = this.data.x1 - ((this.data.x2 - this.data.x1) / this.data.cutImg.width) * this.data.cutImg.x
        var top = this.data.y1 - ((this.data.y2 - this.data.y1) / this.data.cutImg.height) * this.data.cutImg.y
        this.setData({
          imageLeft: left,
          imageTop: top,
        })
      }
      this.setData({
        cutMove: false,
        imgMove: false,
        imgScale: false
      })
    },

    _rotateChange(e){
      this.setData({
        imgRotate: e.detail.value
      })
    },

    _rotateNinety(){
      var r = this.data.imgRotate + 90 > 180 ? this.data.imgRotate - 270 : this.data.imgRotate + 90
      this.setData({
        imgRotate: r
      })
    },

    _imageMirror(){
      var m = this.data.imgMirror == 180 ? 0 : 180
      this.setData({
        imgMirror: m,
      })
    },

    _imgRestore(){
      this.setData({
        canvas: '',
        ctx: '',
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        cutMove: false,
        imageWidth: 0,
        imageHeight: 0,
        imageLeft: 0,
        imageTop: 0,
        imgRotate: 0,
        imgMirror: 0,
        imgMove: false,
        imgStart: {
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          distance: 0,
          width: 0,
          height: 0,
          cutx: 0,
          cuty: 0
        },
        imgScale: false,

        cutImg: {
          path: '',
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }
      })
      this.init(this.data.img.path)
    },

    _cancelCut(){
      this._restoreData()
      if(fail){
        fail('cancel')
      }
    },

    _confirmCut(){
      wx.showLoading({
        title: '裁剪中...',
        mask: true
      })
      var that = this
      const query = wx.createSelectorQuery().in(this)
      query.select('#imgCanvas')
          .fields({node: true, size: true})
          .exec((res) => {
            const canvas = res[0].node
            const ctx = canvas.getContext('2d')
            canvas.width = that.data.cutImg.width
            canvas.height = that.data.cutImg.height
            ctx.translate(canvas.width / 2, canvas.height / 2)
            ctx.rotate((that.data.imgRotate >= 0 ? that.data.imgRotate : that.data.imgRotate + 360) * Math.PI / 180)
            if(that.data.imgMirror == 180){
              ctx.scale(-1, 1); //左右镜像翻转
            }
            const img = canvas.createImage()
            img.src = that.data.img.path
            img.onload = () => {
              ctx.drawImage(img, 0, 0, that.data.img.width, that.data.img.height, -(that.data.cutImg.x+canvas.width/2), -(that.data.cutImg.y+canvas.height/2), that.data.img.width, that.data.img.height)
              wx.canvasToTempFilePath({
                canvas: canvas,
                success(img){
                  success(img.tempFilePath)
                  // that._restoreData()
                  wx.hideLoading({
                    success: (res) => {},
                  })
                  that.setData({imgpath: img.tempFilePath});
                },
                fail(){
                  wx.hideLoading({
                    success: (res) => {
                      wx.showToast({
                        title: '裁剪失败',
                        icon: 'error'
                      })
                      if(fail){
                        fail('fail')
                      }
                    },
                  })
                }
              })
              
            }
          })
      
    },
    
    _restoreData(){
      this.setData({
        canvas: '',
        ctx: '',
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        cutMove: false,
        img: {
          path: '',
          width: 0,
          height: 0,
          type: 1    // 1:横向 2:纵向
        },
        imageWidth: 0,
        imageHeight: 0,
        imageLeft: 0,
        imageTop: 0,
        imgRotate: 0,
        imgMirror: 0,
        imgMove: false,
        imgStart: {
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          distance: 0,
          width: 0,
          height: 0,
          cutx: 0,
          cuty: 0
        },
        imgScale: false,

        cutImg: {
          path: '',
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }
      })
    },
  }
})
