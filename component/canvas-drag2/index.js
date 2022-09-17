
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
    textWriteMode: 'horizontal-tb',
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

        that.codeCanvas = codeCanvas;
        that.codeCtx = codeCtx;

        that.initDraw();
      })

    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toPx(rpx) {
      return rpx * this.factor;
    },
    initBg() {
      this.data.bgColor = '';
      this.data.bgSourceId = '';
      this.data.bgImage = '';
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

    onItemChange(n, o) {
      if (JSON.stringify(n) === '{}') return;
      if (!n.top || !n.left) {
        n.top = 30;
        n.left = 30;
      }
      
      if (n.type==='image') {
        var maxWidth = 200, maxHeight = 200; // 设置最大宽高
        var newHeight = n.height, newWidth = n.width;
        if (n.width > maxWidth || n.height > maxHeight) { // 原图宽或高大于最大值就执行
          if (n.width / n.height > maxWidth / maxHeight) { // 判断比n大值的宽或高作为基数计算
            newWidth = maxWidth;
            newHeight = Math.round(maxWidth * (n.height / n.width));
          } else {
            newHeight = maxHeight;
            newWidth = Math.round(maxHeight * (n.width / n.height));
          }
        }
        var item;
        item = Object.assign(n, {
          x: n.left + newWidth / 2,
          y: n.top + newHeight /2,
          scale: 1,
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
        const textWidth = this.codeCtx.measureText(n.text).width;
        const textHeight = n.fontSize + 10;
        const x = n.left + textWidth / 2;
        const y = n.top + textHeight / 2;
        item = Object.assign(n, {
          x: x,
          y: y,
          scale: 1,
          angle: 0,
          active: false
        })
      }
      
      items.push(item);
      this.setData({ itemList: items });
      // 参数有变化时记录历史
      this.recordHistory();
    },

    initDraw() {
      if (this.data.bgImage !== '') {
        let codeBgImage = this.codeCanvas.createImage();
        codeBgImage.src = this.data.bgImage;
        codeBgImage.onload = () => {
          this.codeCtx.drawImage(this.data.bgImage, 0, 0, this.toPx(this.data.width), this.toPx(this.data.height));
        }
      }
      if (this.data.bgColor !== '') {
        this.codeCtx.save()
        this.codeCtx.fillStyle = this.data.bgColor;
        this.codeCtx.fillRect(0, 0, this.toPx(this.data.width), this.toPx(this.data.height))
        this.codeCtx.restore();
      }

      // 设置画布大小
      const query = wx.createSelectorQuery().in(this)
      query.select('.opt-container').boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec((res) => {
        this.setData({
          canvasWidth: res[0].width,
          canvasHeight: res[0].height
        })
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
        difX = 0;
      }
      // 移动到最左边的判断
      if (items[index]._lx<=qX && difX<0) {
        difX = 0;
      }
      
      //追加改动值
      items[index].left += difX  // x方向
      items[index].x += difX;
      
      var difY = items[index]._ly - items[index].ly;
      var qY = parseInt(items[index].height/4);
      // 移动最底部的判断
      if (windowHeight <= (items[index].top+items[index].height) && difY>0) {
        difY = 0;
      }
      // 移动最顶部的判断
      if (items[index]._ly<qY && difY<0) {
        difY = 0;
      }
      
      items[index].top += difY;
      items[index].y += difY;

      //把新的值赋给老的值
      items[index].lx = e.touches[0].clientX;
      items[index].ly = e.touches[0].clientY;
      this.setData({//赋值就移动了
        itemList: items
      })
    },

    // 放开图片
    wraptouchEnd() {
      // this.synthesis(); // 调用合成图方法
    },

    // 合成图片
    synthesis() {
      var that = this;
      var itemList = this.data.itemList;
      itemList.forEach((currentValue, index) => {
        this.codeCtx.save();

        var new_w = currentValue.width * currentValue.scale;
        var new_h = currentValue.height * currentValue.scale;

        if (currentValue.type === 'text') {
          var fontSize = currentValue.fontSize * currentValue.scale;
          fontSize = fontSize <= currentValue.MIN_FONTSIZE ? currentValue.MIN_FONTSIZE : fontSize;

          this.codeCtx.fontSize = fontSize;
          this.codeCtx.textBaseline = 'middle';
          this.codeCtx.textAlign = 'center';
          this.codeCtx.fillStyle = currentValue.color;
          var textWidth = this.codeCtx.measureText(currentValue.text).width;
          var textHeight = currentValue.fontSize + 10;
          // 字体区域中心点不变，左上角位移
          currentValue.left = currentValue.x - textWidth / 2;
          currentValue.top = currentValue.y - textHeight / 2;
        } else {

          if (currentValue.width < currentValue.height && new_w < currentValue.MIN_WIDTH) {
            new_w = currentValue.MIN_WIDTH;
            new_h = currentValue.MIN_WIDTH * currentValue.height / currentValue.width;
          } else if (currentValue.height < currentValue.width && new_h < currentValue.MIN_WIDTH) {
            new_h = currentValue.MIN_WIDTH;
            new_w = currentValue.MIN_WIDTH * currentValue.width / currentValue.height;
          }
        }
        this.codeCtx.translate(0, 0);
        this.codeCtx.translate(currentValue.x, currentValue.y); // 圆心坐标
        this.codeCtx.translate(-(currentValue.width * currentValue.scale / 2), -(currentValue.height * currentValue.scale / 2));
        if (currentValue.type === 'text') {
          if (this.data.) {

          }
          this.codeCtx.fillText(currentValue.text, currentValue.x, currentValue.y);
        } else if (currentValue.type === 'image') {
          this._drawImageItem(currentValue.image, currentValue.left, currentValue.top, new_w, new_h);
        }

        this.codeCtx.restore();
      });

      wx.canvasToTempFilePath({
        canvas: this.codeCanvas,
        success: res => {
          this.setData({
            canvasTemImg: res.tempFilePath
          })
        }
      }, this);

    },

    _drawImageItem(src, x, y, wx, wy) {
      const img = this.codeCanvas.createImage()
      img.src = src
      img.onload = () => {
        this.codeCtx.drawImage(img, x, y, wx, wy)
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
          console.log('e.currentTarget.dataset.id', e.currentTarget.dataset.id)
          index = i;
          console.log(items[index])
          items[index].active = true;
        }
      }
      //获取作为移动前角度的坐标
      items[index].tx = e.touches[0].clientX;
      items[index].ty = e.touches[0].clientY;
      //移动前的角度
      items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)
      console.log("移动前的角度", items[index].x, items[index].y, items[index].tx, items[index].ty, items[index].anglePre)
      //获取图片半径
      if (items[index].type==='image') {
        items[index].r = this.getDistancs(items[index].x, items[index].y, items[index].left, items[index].top) - 20;//20是右下角移动图片到本图边缘的估计值，因为这个获取半径的方法跟手指的位置有关
      } else {
        items[index].r = this.getDistancs(items[index].x, items[index].y, items[index].tx, items[index].ty);
        if (items[index].r<150) {
          items[index].r = 90;
        }
      }
      console.log("半径", items[index].r);
    },

    touchMove: function (e) {
      //记录移动后的位置
      items[index]._tx = e.touches[0].clientX;
      items[index]._ty = e.touches[0].clientY;

      //移动的点到圆心的距离
      
      items[index].disPtoO = this.getDistancs(items[index].x, items[index].y, items[index]._tx - windowWidth * 0.125, items[index]._ty - 10)

      items[index].scale = items[index].disPtoO / items[index].r; //手指滑动的点到圆心的距离与半径的比值作为图片的放大比例

      items[index].oScale = 1 / items[index].scale;//图片放大响应的右下角按钮同比缩小

      //移动后位置的角度
      items[index].angleNext = this.countDeg(items[index].x, items[index].y, items[index]._tx, items[index]._ty)
      //角度差
      items[index].new_rotate = items[index].angleNext - items[index].anglePre;

      //叠加的角度差
      items[index].rotate += items[index].new_rotate;
      items[index].angle = items[index].rotate; //赋值

      var item = items[index];
      if (item.type==='image') {
        var new_w = item.w * item.scale;
        var new_h = item.h * item.scale;
        if (item.w < item.h && new_w < item.MIN_WIDTH) {
          new_w = item.MIN_WIDTH;
          new_h = item.MIN_WIDTH * item.h / item.w;
        } else if (item.h < item.w && new_h < item.MIN_WIDTH) {
            new_h = item.MIN_WIDTH;
            new_w = item.MIN_WIDTH * item.w / item.h;
        }
      } else {
        var fontSize = item.fontSize * item.scale;
        fontSize = fontSize <= item.MIN_FONTSIZE ? item.MIN_FONTSIZE : fontSize;
        items[index].fontSize = fontSize;
      }


      //用过移动后的坐标赋值为移动前坐标
      items[index].tx = e.touches[0].clientX;
      items[index].ty = e.touches[0].clientY;
      items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)
      items[index].angle = items[index].anglePre - 135;

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
      this.setData({
        'textWriteMode': 'vertical-lr'
      })
    },

    drawVerticalText(context, text, x, y) {
      var arrText = text.split('');
      var arrWidth = arrText.map(function (letter) {
        return 26;
        // 这里为了找到那个空格的 bug 做了许多努力，不过似乎是白费力了
        // const metrics = context.measureText(letter);
        // console.log(metrics);
        // const width = metrics.width;
        // return width;
      });
      
      var align = context.textAlign;
      var baseline = context.textBaseline;
     
      if (align == 'left') {
        x = x + Math.max.apply(null, arrWidth) / 2;
      } else if (align == 'right') {
        x = x - Math.max.apply(null, arrWidth) / 2;
      }
      if (baseline == 'bottom' || baseline == 'alphabetic' || baseline == 'ideographic') {
        y = y - arrWidth[0] / 2;
      } else if (baseline == 'top' || baseline == 'hanging') {
        y = y + arrWidth[0] / 2;
      }
     
      context.textAlign = 'center';
      context.textBaseline = 'middle';
     
      // 开始逐字绘制
      arrText.forEach(function (letter, index) {
        // 确定下一个字符的纵坐标位置
        var letterWidth = arrWidth[index];
        // 是否需要旋转判断
        var code = letter.charCodeAt(0);
        if (code <= 256) {
          context.translate(x, y);
          // 英文字符，旋转90°
          context.rotate(90 * Math.PI / 180);
          context.translate(-x, -y);
        } else if (index > 0 && text.charCodeAt(index - 1) < 256) {
          // y修正
          y = y + arrWidth[index - 1] / 2;
        }
        context.fillText(letter, x, y);
        // 旋转坐标系还原成初始态
        context.setTransform(1, 0, 0, 1, 0, 0);
        // 确定下一个字符的纵坐标位置
        var letterWidth = arrWidth[index];
        y = y + letterWidth;
      });
      // 水平垂直对齐方式还原
      context.textAlign = align;
      context.textBaseline = baseline;
    },    


    // 显示画布
    openMask() {
      this.synthesis();
      this.setData({
        showCanvas: true
      })
    }
  }

});