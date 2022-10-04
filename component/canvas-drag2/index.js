const util = require("../../utils/util");

var items = new Array();
var index = 0;
var MIN_WIDTH = 20;
var MIN_FONTSIZE = 10;
var windowWidth = wx.getSystemInfoSync().windowWidth;
var windowHeight = wx.getSystemInfoSync().windowHeight;

Component({
  /**
   * 组件的属性列表
  */
  properties: {
    item: {
      type: Object,
      value: {},
      observer: 'onItemChange',
    },
    fliter: {
      type: String,
      value: 'init',
    },
    shape: {
      type: String,
      value: 'init',
    },
    bgColor: {
      type: String,
      value: '',
    },
    bgImage: {
      type: String,
      value: '',
    },
    bgSourceId: {
      type: String,
      value: '',
    },
    enableUndo: {
      type: Boolean,
      value: false,
    },
    height: {
      type: Number,
      value: 0,
    },
    width: {
      type: Number,
      value: 0,
    }
  },

  /**
    * 组件的初始数据
    */
  data: {
    history: [],
    itemList: [],
    showCanvas: false,
    canvasTemImg: null,
    canvasHeight: null,
    canvasWidth: null,
  },

  lifetimes: {
    // 在组件实例进入页面节点树时执行
    attached: function () {
      this.ctx = wx.createSelectorQuery().in(this).select('#myCanvas').fields({
        node: true,
        size: true
      });
      var that = this;
      this.ctx.exec((res) => {
        const codeCanvas = res[0].node
        const codeCtx = codeCanvas.getContext('2d')

        var dpr = wx.getSystemInfoSync().pixelRatio
        that.canvasWidth = res[0].width
        that.canvasHeight = res[0].height
        codeCanvas.width = res[0].width * dpr
	      codeCanvas.height = res[0].height * dpr
        codeCtx.scale(0.8, 0.8)
        
        that.codeCanvas = codeCanvas;
        that.codeCtx = codeCtx;
        that.dpr = dpr;

        that.initDraw();
        
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toPx(rpx) {
      return rpx * this.rpx;
    },
    initBg() {
      if (this.data.bgImage !== '') {
        let codeBgImage = this.codeCanvas.createImage();
        codeBgImage.src = this.data.bgImage;
        codeBgImage.onload = () => {
          this.codeCtx.drawImage(this.data.bgImage, 0, 0, this.toPx(this.data.width), this.toPx(this.data.height));
        }
      }

      if (this.data.bgColor !== '') {
        this.codeCtx.fillStyle = this.data.bgColor;
        this.codeCtx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
      }
    },
    initHistory() {
      this.data.history = [];
    },
    recordHistory() {
      if (!this.data.enableUndo) {
        return;
      }
      this.exportJson()
        .then((imgArr) => {
          this.data.history.push(JSON.stringify(imgArr));
        })
        .catch((e) => {
          console.error(e);
        });
    },

    // 使用组件的page触发data后执行
    onItemChange(n, o) {
      if (JSON.stringify(n) === '{}') return;
      if (!n.top || !n.left) {
        n.top = 30;
        n.left = 30;
      }
      if (n.type==='image') {
        var maxWidth = windowWidth, maxHeight = windowWidth; // 设置最大宽高
        var newHeight = n.height, newWidth = n.width;
        var F = 0.6
        if (n.width > maxWidth || n.height > maxHeight) { // 原图宽或高大于最大值就执行
          if (n.width / n.height > maxWidth / maxHeight) { // 判断比n大值的宽或高作为基数计算
            newWidth = Math.round(maxWidth * F);
            newHeight = Math.round(maxWidth * (n.height / n.width) * F);
          } else {
            newHeight = Math.round(maxHeight * F);
            newWidth = Math.round(maxHeight * (n.width / n.height) * F);
          }
        } else if (n.width < MIN_WIDTH) {
          newHeight = Math.round(newHeight * (MIN_WIDTH/newWidth))
          newWidth = MIN_WIDTH;
        } else {
          newHeight = Math.round(newHeight * F)
          newWidth = Math.round(newWidth * F)
        }

        var item;
        item = Object.assign(n, {
          x: Math.round(n.left + newWidth / 2),
          y: Math.round(n.top + newHeight /2),
          scale: 0,
          angle: 0,
          active: false,
          width: newWidth,
          height: newHeight
        })
      } else {
        if (!n.text || typeof(n.text)=='undefined' || n.text=="") {
          return
        }
        if (!n.fontSize) {
          n.fontSize = 20;
        }
        this.codeCtx.fontSize = n.fontSize;
        const textWidth = this.codeCtx.measureText(n.text+'').width;
        const textHeight = n.fontSize;
        const x = n.left + textWidth / 2;
        const y = n.top + textHeight / 2;
        item = Object.assign(n, {
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(textWidth),
          height: Math.round(textHeight),
          scale: 0,
          angle: 0,
          active: false,
          color: "#000",
          textWriteMode: 'horizontal-tb',
          textAlign: 'left'
        })
      }
      items.push(item);

      this.setData({ itemList: items });
      // 参数有变化时记录历史
      this.recordHistory();
    },

    initDraw() {

      // 设置画布大小
      var width = this.data.width!=0 ? this.data.width : windowWidth;
      var height = this.data.height!=0 ? this.data.height : windowHeight;

      this.codeCanvas.width = width
      this.codeCanvas.height = height

      this.setData({
        canvasWidth: width,
        canvasHeight: height
      })
      
    },

    // 点击图片
    wraptouchStart(e) {
      for (let i = 0; i < items.length; i++) {  //旋转数据找到点击的
        items[i].active = false;
        if (e.currentTarget.dataset.id == items[i].id) {
          index = i;   //记录下标
          items[index].active = true;  //开启点击属性
        }
      }

      items[index].lx = e.touches[0].clientX;  // 记录点击时的坐标值
      items[index].ly = e.touches[0].clientY;
      this.setData({   //赋值 
        itemList: items
      })
    },

    // 拖动图片
    wraptouchMove(e) {
      //移动时的坐标值也写图片的属性里
      items[index]._lx = e.touches[0].clientX;
      items[index]._ly = e.touches[0].clientY;
      
      var difX = items[index]._lx - items[index].lx;
      var qX = parseInt(items[index].width/4);
      // 移动到最右边的判断
      if ((windowWidth-qX) <= items[index]._lx && difX>0) {
        items[index].left += 0  // x方向
        items[index].x += 0
      } else if (items[index]._lx<=qX && difX<0) { // 移动到最左边的判断
        items[index].left += 0  // x方向
        items[index].x += 0
      } else {
        //追加改动值
        items[index].left += difX  // x方向
        items[index].x += difX
      }

      
      var difY = items[index]._ly - items[index].ly;
      var qY = parseInt(items[index].height/4);
      // 移动最底部的判断
      if (windowHeight <= (items[index].top+items[index].height) && difY>0) {
        items[index].top += 0;
        items[index].y += 0;
      } else if (items[index]._ly<qY && difY<0) { // 移动最顶部的判断
        items[index].top += 0;
        items[index].y += 0;
      } else {
        items[index].top += difY;
        items[index].y += difY;
      }
      
      //把新的值赋给老的值
      items[index].lx = e.touches[0].clientX;
      items[index].ly = e.touches[0].clientY;

      this.setData({//赋值就移动了
        itemList: items
      })
    },

    // 放开图片
    wraptouchEnd() {
    },

    // 合成图片
    async synthesis(resolve=null, reject=null) {

        var that = this;
        var itemList = this.data.itemList;
        this.codeCtx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
        this.initBg();
        itemList.sort(function(a, b){
          return a.id - b.id
        });

        for(var i = 0;i<itemList.length;i++) {
          let currentValue = itemList[i];
          that.codeCtx.save()

          that.codeCtx.translate(currentValue.x, currentValue.y); // 圆心坐标
          that.codeCtx.rotate(Math.round(currentValue.angle) * Math.PI / 180)
          that.codeCtx.translate(-currentValue.x, -currentValue.y);

          if (currentValue.type === 'text') {
             that._drawTextItem(currentValue)

          } else {
            await that._drawImageItem(currentValue);
          }

          that.codeCtx.restore()
        }
        that.codeCtx.save()
        that.codeCtx.lineWidth = 5;
        that.codeCtx.beginPath();
        that.codeCtx.moveTo(0, 0)
        that.codeCtx.lineTo(200, 200)
        that.codeCtx.stroke();
        that.codeCtx.closePath();
        that.codeCtx.restore()
        
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          canvas: this.codeCanvas,
          success: res => {
            if (res && res.tempFilePath) {
              this.setData({
                canvasTemImg: res.tempFilePath
              })
              resolve(res.tempFilePath);
            } else {
              reject('画板异常');
            }
          }
        }, that);

    },

    // 生成图片
    async _drawImageItem(currentValue) {
      var that = this;
      
      var new_w = currentValue.scale!=0 ? currentValue.width * currentValue.scale : currentValue.width;
      var new_h = currentValue.scale!=0 ? currentValue.height * currentValue.scale : currentValue.height;

      if (currentValue.width < currentValue.height && new_w < currentValue.MIN_WIDTH) {
        new_w = currentValue.MIN_WIDTH;
        new_h = currentValue.MIN_WIDTH * currentValue.height / currentValue.width;
      } else if (currentValue.height < currentValue.width && new_h < currentValue.MIN_WIDTH) {
        new_h = currentValue.MIN_WIDTH;
        new_w = currentValue.MIN_WIDTH * currentValue.width / currentValue.height;
      }
      currentValue.new_w = new_w
      currentValue.new_h = new_h

      let img = await that._drawImageOnload(currentValue)
      if (img) {
        that.codeCtx.drawImage(img, currentValue.left, currentValue.top, new_w, new_h)
      }
    },

    // 异步加载图片
    _drawImageOnload(currentValue) {
      var that = this;
      return new Promise((resolve, reject) => {
        const img = that.codeCanvas.createImage()
        img.src = currentValue.image
        img.onload = () => {
          resolve(img)
        }
        img.onerror = () => {
          reject(false)
        }
      });
    },

    // 生成文字
    _drawTextItem(currentValue) {
      var that = this;
      var fontSize = currentValue.scale!=0 ? currentValue.fontSize * currentValue.scale : currentValue.fontSize;
      fontSize = fontSize < MIN_FONTSIZE ? MIN_FONTSIZE : fontSize;
      that.codeCtx.font = `${fontSize}px Arial`; //Arial
      // this.codeCtx.font = '10px sans-serif'
      that.codeCtx.fontSize = fontSize;
      that.codeCtx.textBaseline = 'middle';
      that.codeCtx.textAlign = 'center';
      that.codeCtx.fillStyle = currentValue.color;

      let strArr = (currentValue.text).split(/[(\r\n)\r\n]+/)
      let maxW = 0, maxLw = 0;
      for(var i = 0; i<strArr.length; i++) {
        maxW = Math.max(maxW, that.codeCtx.measureText(strArr[i]).width)
        maxLw = Math.max(maxLw, that.codeCtx.measureText(strArr[i][0]).width) + 2
      }

      if (currentValue.textWriteMode=='vertical-lr') {
        that.codeCtx.save()
        let cx = currentValue.left + maxLw*3/2
        let cy = currentValue.top + maxW/2
        console.log(cx, cy, currentValue.x, currentValue.y)
        // that.codeCtx.translate(cx, cx); // 圆心坐标
        // that.codeCtx.rotate(Math.round(currentValue.angle) * Math.PI / 180)
        // that.codeCtx.translate(-cx, -cy);
        let leftStep = 0
        for(var i = 0; i<strArr.length; i++) {
          let left = currentValue.left + leftStep
          let top = currentValue.top
          util.drawVerticalText4Canvas(that.codeCtx, strArr[i], left, top, currentValue)
          leftStep += maxLw
        }
        that.codeCtx.restore()
      } else {
        let result = util.breakLines4Canvas(that.codeCtx, currentValue.text||'无内容', maxW, that.codeCtx.font)
        var currentLineHeight = 0
        that.codeCtx.textAlign = currentValue.textAlign
        result.forEach(function (line, index) {
          currentLineHeight += maxLw
          that.codeCtx.fillText(line, currentValue.left, parseInt(currentValue.top + currentLineHeight))  // currentLineHeight 表示文字在整个页面的位置：currentLineHeight + 300 表示整体下移 300px
        });
      }
    },

    changeTextColor(color) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].active==true) {
          items[i].color = color
          this.setData({
            "itemList": items
          })
        }
      }
    },

    deleteItem(e) {
      for (let i = 0; i < items.length; i++) {
        if (e.currentTarget.dataset.id == items[i].id) {
          items.splice(i, 1);
          this.setData({
            "itemList": items
          })
        }
      }
    },

    // 点击伸缩图标
    touchStart(e) {
      //找到点击的那个图片对象，并记录
      for (let i = 0; i < items.length; i++) {
        items[i].active = false;

        if (e.currentTarget.dataset.id == items[i].id) {
          index = i;
          items[index].active = true;
        }
      }
      //获取作为移动前角度的坐标
      items[index].tx = e.touches[0].clientX;
      items[index].ty = e.touches[0].clientY;

      let item = items[index]
      items[index].anglePre = this.countDeg(item.x, item.y, item.tx, item.ty)
      items[index].beforeLine = Math.sqrt(Math.pow((item.x - item.left), 2) + Math.pow((item.y - item.top), 2));
    },

    touchMove: function (e) {
      //记录移动后的位置
      items[index]._tx = e.touches[0].clientX;
      items[index]._ty = e.touches[0].clientY;

      let item = items[index]

      const beforeLine = item.beforeLine;
      const afterLine = Math.sqrt(Math.pow((item.x - item._tx), 2) + Math.pow((item.y - item._ty), 2));

      if (items[index].type=='text') {
        items[index].scale = (afterLine - beforeLine) / beforeLine + 1
      } else {
        items[index].scale = afterLine / beforeLine
      }
      items[index].oScale = 1 / items[index].scale;//图片放大响应的右下角按钮同比缩小

      //移动后位置的角度
      items[index].angleNext = this.countDeg(item.x, item.y, item._tx, item._ty)
      //角度差
      let newAngle = item.angleNext - item.anglePre;
      newAngle = Math.round(newAngle * 100) / 100;
      
      //叠加的角度差
      let angle = item.angle + newAngle;
      items[index].angle = Math.round(angle * 100) / 100;

      //用过移动后的坐标赋值为移动前坐标
      items[index].tx = e.touches[0].clientX;
      items[index].ty = e.touches[0].clientY;
      items[index].anglePre = this.countDeg(item.x, item.y, item.tx, item.ty)

      //赋值setData渲染
      this.setData({
        "itemList": items
      })
    },

    touchEnd: function(e) {

    },

    /*
     *参数1和2为图片圆心坐标
     *参数3和4为手点击的坐标
     *返回值为手点击的坐标到圆心的角度
     */
    countDeg: function (cx, cy, pointer_x, pointer_y) {
      var ox = pointer_x - cx;
      var oy = pointer_y - cy;
      var to = Math.abs(ox / oy);
      var angle = Math.atan(to) / (2 * Math.PI) * 360;//鼠标相对于旋转中心的角度

      if (ox < 0 && oy < 0)//相对在左上角，第四象限，js中坐标系是从左上角开始的，这里的象限是正常坐标系  
      {
        angle = -angle;
      } else if (ox <= 0 && oy >= 0)//左下角,3象限  
      {
        angle = -(180 - angle)
      } else if (ox > 0 && oy < 0)//右上角，1象限  
      {
        angle = angle;
      } else if (ox > 0 && oy > 0)//右下角，2象限  
      {
        angle = 180 - angle;
      }

      return angle;
    },

    //计算触摸点到圆心的距离
    getDistancs(cx, cy, pointer_x, pointer_y) {
      var ox = pointer_x - cx;
      var oy = pointer_y - cy;
      return Math.sqrt(
        ox * ox + oy * oy
      );
    },

    // 设置文字为竖排
    setVerticalText() {
      
      items.forEach((val, idx) => {
        if (val.active==true) {
          val.textWriteMode = 'vertical-lr'//'sideways-rl'
          let arr = (val.text).split(/[(\r\n)\r\n]+/)
          let max_height = 0;
          let max_width = 0;
          arr.forEach((v, i) => {
            let len = this.codeCtx.measureText(v+'').width;
            max_height = Math.max(max_height, len)
            max_width += this.codeCtx.measureText(v[0]+'').width;
          });
          val.height = Math.round(max_height + max_height/2 + 8)
          val.width = Math.round(max_width + max_width/2 + max_width + 4)

          return
        }
      });
      this.setData({
        "itemList": items
      })
    },

    // 显示画布
    openMask() {
      wx.showLoading({
        title: '正在生成图片',
        mask: true
      });
      return new Promise(async (resolve, reject) => {
        this.synthesis(resolve, reject);
        this.setData({
          showCanvas: true
        })
        wx.hideLoading();
      });
    },

    closseMask() {
      this.setData({
        showCanvas: false
      })
    },

    downloadFile(imgurl) {
      wx.saveImageToPhotosAlbum({
          filePath: imgurl,         
          success: (res) => {
              console.log(res);
              wx.showToast({
                  title: '保存成功',
                  icon: 'success',
                  duration: 2000
              })
          }
      })
    },
  
    downloadImg: function () {
      var that = this;
      wx.getSetting({
          success(res) {
              if (!res.authSetting['scope.writePhotosAlbum']) {
                  wx.authorize({
                      scope: 'scope.writePhotosAlbum',
                      success() { //这里是用户同意授权后的回调
                          that.downloadFile(that.data.canvasTemImg)
                      },
                      fail() { //这里是用户拒绝授权后的回调
                          wx.showModal({
                              title: '警告',
                              content: '授权失败，请打开相册的授权',
                              success: (res) => {
                                  if (res.confirm) { //去授权相册
                                      that.toOpenSetting();
                                  } else if (res.cancel) {
                                      console.log('用户点击取消')
                                  }
                              }
                          })
                      }
                  })
              } else { //用户已经授权过了
                  console.log("已经授权啦");
                  // that.genCanvas();
                  that.downloadFile(that.data.canvasTemImg)
              }
          }
      })
    },
  },

});