const DELETE_ICON = '/component/canvas-drag/icon/close.png'; // 删除按钮
const DRAG_ICON = '/component/canvas-drag/icon/scale.png'; // 缩放按钮
const STROKE_COLOR = 'green';
const ROTATE_ENABLED = true;
let isMove = false; // 标识触摸后是否有移动，用来判断是否需要增加操作历史

const dragGraph = function ({x = 30, y = 30, w, h, type, text, fontSize = 20, color = 'red', url = null, rotate = 0, sourceId = null, selected = true}, canvasNode, canvasCtx, factor) {
  if (type === 'text') {
    canvasCtx.fontSize = fontSize;
    const textWidth = canvasCtx.measureText(text).width;
    const textHeight = fontSize + 10;
    this.centerX = x + textWidth / 2;
    this.centerY = y + textHeight / 2;
    this.w = textWidth;
    this.h = textHeight;
  } else {
      this.centerX = x + w / 2;
      this.centerY = y + h / 2;
      this.w = w;
      this.h = h;
  }
  this.x = x;
  this.y = y;

  // 4个顶点坐标
  this.square = [
      [this.x, this.y],
      [this.x + this.w, this.y],
      [this.x + this.w, this.y + this.h],
      [this.x, this.y + this.h]
  ];
  this.fileUrl = url;
  this.text = text;
  this.fontSize = fontSize;
  this.color = color;
  this.ctx = canvasCtx;
  this.node = canvasNode;
  this.rotate = rotate;
  this.type = type;
  this.selected = selected;
  this.factor = factor;
  this.sourceId = sourceId;
  this.MIN_WIDTH = 20;
  this.MIN_FONTSIZE = 10;
};

dragGraph.prototype = {
  drawImageItem(src, x, y, wx, wy) {
    const img = this.node.createImage()
    img.src = src
    img.onload = () => {
      this.ctx.drawImage(img, x, y, wx, wy)
    }
  },
  /**
   * 绘制元素
   */
  paint() {
    // 由于measureText获取文字宽度依赖于样式，所以如果是文字元素需要先设置样式
    let textWidth = 0;
    let textHeight = 0;

    this.ctx.save();
    if (this.type === 'text') {
      this.ctx.fontSize = this.fontSize;
      this.ctx.textBaseline = 'middle';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = this.color;
      textWidth = this.ctx.measureText(this.text).width;
      textHeight = this.fontSize + 10;
      // 字体区域中心点不变，左上角位移
      this.x = this.centerX - textWidth / 2;
      this.y = this.centerY - textHeight / 2;
    }
    // 旋转元素
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.rotate * Math.PI / 180);
    this.ctx.translate(-this.centerX, -this.centerY);
    // 渲染元素
    if (this.type === 'text') {
      this.ctx.fillText(this.text, this.centerX, this.centerY);
    } else if (this.type === 'image') {
      let codeImage = this.node.createImage();
        codeImage.src = this.fileUrl;
        codeImage.onload = () => {
          this.ctx.drawImage(codeImage, this.x, this.y, this.w, this.h);
          // 如果是选中状态，绘制选择虚线框，和缩放图标、删除图标
          if (this.selected) {
            this.ctx.lineDash = [2, 5];
            this.ctx.LineWidth = 2;
            this.ctx.strokeStyle = STROKE_COLOR;
            this.ctx.lineDashOffset = 6;
            if (this.type === 'text') {
              this.ctx.strokeRect(this.x, this.y, textWidth, textHeight);
              this.drawImageItem(DELETE_ICON, this.x - 15, this.y - 15, 30, 30);
              this.drawImageItem(DRAG_ICON, this.x + textWidth - 15, this.y + textHeight - 15, 30, 30);
            } else {
              this.ctx.strokeRect(this.x, this.y, this.w, this.h);
              this.drawImageItem(DELETE_ICON, this.x - 15, this.y - 15, 30, 30);
              this.drawImageItem(DRAG_ICON, this.x + this.w - 15, this.y + this.h - 15, 30, 30);
            }
          }
        }
    }
    this.ctx.restore();
  },

  /**
   * 计算旋转后矩形四个顶点的坐标（相对于画布）
   * @private
   */
  _rotateSquare() {
    this.square = [
        this._rotatePoint(this.x, this.y, this.centerX, this.centerY, this.rotate),
        this._rotatePoint(this.x + this.w, this.y, this.centerX, this.centerY, this.rotate),
        this._rotatePoint(this.x + this.w, this.y + this.h, this.centerX, this.centerY, this.rotate),
        this._rotatePoint(this.x, this.y + this.h, this.centerX, this.centerY, this.rotate),
    ];
  },

  /**
   * 判断点击的坐标落在哪个区域
   * @param {*} x 点击的坐标
   * @param {*} y 点击的坐标
   */
  isInGraph(x, y) {
    // 删除区域左上角的坐标和区域的高度宽度
    const delW = 30;
    const delH = 30;

    // 旋转后的删除区域坐标
    const transformedDelCenter = this._rotatePoint(this.x, this.y, this.centerX, this.centerY, this.rotate);
    const transformDelX = transformedDelCenter[0] - delW / 2;
    const transformDelY = transformedDelCenter[1] - delH / 2;

    // 变换区域左上角的坐标和区域的高度宽度
    const scaleW = 30;
    const scaleH = 30;
    const transformedScaleCenter = this._rotatePoint(this.x + this.w, this.y + this.h, this.centerX, this.centerY, this.rotate);

    // 旋转后的变换区域坐标
    const transformScaleX = transformedScaleCenter[0] - scaleW / 2;
    const transformScaleY = transformedScaleCenter[1] - scaleH / 2;

    if (x - transformScaleX >= 0 && y - transformScaleY >= 0 &&
      transformScaleX + scaleW - x >= 0 && transformScaleY + scaleH - y >= 0) {
      // 缩放区域
      return 'transform';
    } else if (x - transformDelX >= 0 && y - transformDelY >= 0 &&
        transformDelX + delW - x >= 0 && transformDelY + delH - y >= 0) {
        // 删除区域
        return 'del';
    } else if (this.insidePolygon(this.square, [x, y])) {
        return 'move';
    }
    // 不在选择区域里面
    return false;
  },

  /**
   *  判断一个点是否在多边形内部
   *  @param points 多边形坐标集合
   *  @param testPoint 测试点坐标
   *  返回true为真，false为假
   *  */
  insidePolygon(points, testPoint) {
    let x = testPoint[0], y = testPoint[1];
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        let xi = points[i][0], yi = points[i][1];
        let xj = points[j][0], yj = points[j][1];

        let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
  },

  /**
   * 计算旋转后的新坐标（相对于画布）
   * @param x
   * @param y
   * @param centerX
   * @param centerY
   * @param degrees
   * @returns {*[]}
   * @private
   */
  _rotatePoint(x, y, centerX, centerY, degrees) {
    let newX = (x - centerX) * Math.cos(degrees * Math.PI / 180) - (y - centerY) * Math.sin(degrees * Math.PI / 180) + centerX;
    let newY = (x - centerX) * Math.sin(degrees * Math.PI / 180) + (y - centerY) * Math.cos(degrees * Math.PI / 180) + centerY;
    return [newX, newY];
  },

  /**
     *
     * @param {*} px 手指按下去的坐标
     * @param {*} py 手指按下去的坐标
     * @param {*} x 手指移动到的坐标
     * @param {*} y 手指移动到的坐标
     * @param {*} currentGraph 当前图层的信息
     */
    transform(px, py, x, y, currentGraph) {
      // 获取选择区域的宽度高度
      if (this.type === 'text') {
        this.ctx.exec(res => {
          const canvas = res[0].node
          const codeCtx = canvas.getContext('2d')
          codeCtx.fontSize = this.fontSize;
          const textWidth = codeCtx.measureText(this.text).width;
          const textHeight = this.fontSize + 10;
          this.w = textWidth;
          this.h = textHeight;
          // 字体区域中心点不变，左上角位移
          this.x = this.centerX - textWidth / 2;
          this.y = this.centerY - textHeight / 2;
        });
      } else {
        this.centerX = this.x + this.w / 2;
        this.centerY = this.y + this.h / 2;
      }
      const diffXBefore = px - this.centerX;
      const diffYBefore = py - this.centerY;
      const diffXAfter = x - this.centerX;
      const diffYAfter = y - this.centerY;

      const angleBefore = Math.atan2(diffYBefore, diffXBefore) / Math.PI * 180;
      const angleAfter = Math.atan2(diffYAfter, diffXAfter) / Math.PI * 180;

      // 旋转的角度
      if (ROTATE_ENABLED) {
        this.rotate = currentGraph.rotate + angleAfter - angleBefore;
      }

      const lineA = Math.sqrt(Math.pow((this.centerX - px), 2) + Math.pow((this.centerY - py), 2));
      const lineB = Math.sqrt(Math.pow((this.centerX - x), 2) + Math.pow((this.centerY - y), 2));
      if (this.type === 'image') {
          let resize_rito = lineB / lineA;
          let new_w = currentGraph.w * resize_rito;
          let new_h = currentGraph.h * resize_rito;

          if (currentGraph.w < currentGraph.h && new_w < this.MIN_WIDTH) {
              new_w = this.MIN_WIDTH;
              new_h = this.MIN_WIDTH * currentGraph.h / currentGraph.w;
          } else if (currentGraph.h < currentGraph.w && new_h < this.MIN_WIDTH) {
              new_h = this.MIN_WIDTH;
              new_w = this.MIN_WIDTH * currentGraph.w / currentGraph.h;
          }

          this.w = new_w;
          this.h = new_h;
          this.x = currentGraph.x - (new_w - currentGraph.w) / 2;
          this.y = currentGraph.y - (new_h - currentGraph.h) / 2;

      } else if (this.type === 'text') {
          const fontSize = currentGraph.fontSize * ((lineB - lineA) / lineA + 1);
          this.fontSize = fontSize <= this.MIN_FONTSIZE ? this.MIN_FONTSIZE : fontSize;

          // 旋转位移后重新计算坐标
          this.ctx.setFontSize(this.fontSize);
          const textWidth = this.ctx.measureText(this.text).width;
          const textHeight = this.fontSize + 10;
          this.w = textWidth;
          this.h = textHeight;
          // 字体区域中心点不变，左上角位移
          this.x = this.centerX - textWidth / 2;
          this.y = this.centerY - textHeight / 2;
      }

    },
};

Component({
    /**
     * 组件的属性列表
    */
   properties: {
    graph: {
      type: Object,
      value: {},
      observer: 'onGraphChange',
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
    width: {
        type: Number,
        value: 750,
    },
    height: {
        type: Number,
        value: 750,
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
      history:[]
    },

    lifetimes: {
      attached: function() {
        this.ctx = wx.createSelectorQuery().in(this).select('#canvas-label').fields({
          node: true,
          size: true
        });
        this.ctx.exec((res) => {
          const codeCanvas = res[0].node
          const codeCtx = codeCanvas.getContext('2d')
  
          this.codeCanvas = codeCanvas;
          this.codeCtx = codeCtx;
  
          const dpr = wx.getSystemInfoSync().pixelRatio
          codeCanvas.width = res[0].width * dpr
          codeCanvas.height = res[0].height * dpr
          codeCtx.scale(dpr, dpr)

          const sysInfo = wx.getSystemInfoSync();
          const screenWidth = sysInfo.screenWidth;
          this.factor = screenWidth / 750;
    
          if (typeof this.drawArr === 'undefined') {
              this.drawArr = [];
          }
          
          this.draw();
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
      initBg(){
        this.data.bgColor = '';
        this.data.bgSourceId = '';
        this.data.bgImage = '';
      },
      initHistory(){
        this.data.history = [];
      },
      recordHistory(){
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
      onGraphChange(n, o) {
        if (JSON.stringify(n) === '{}') return;
        this.drawArr.push(new dragGraph(Object.assign({
          x: 30,
          y: 30,
        }, n), this.codeCanvas, this.codeCtx, this.factor));
        this.draw();
        // 参数有变化时记录历史
        this.recordHistory();
      },

      draw() {
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
        this.drawArr.forEach((item) => {
          item.paint();
        });

        return new Promise((resolve) => {
          this.codeCtx.draw(false, () => {
              resolve();
          });
        });
      },

      start(e) {
        isMove = false; // 重置移动标识
        const {x, y} = e.touches[0];
        this.tempGraphArr = [];
        let lastDelIndex = null; // 记录最后一个需要删除的索引
        this.drawArr && this.drawArr.forEach((item, index) => {
          const action = item.isInGraph(x, y);
          if (action) {
            item.action = action;
            this.tempGraphArr.push(item);
            // 保存点击时的坐标
            this.currentTouch = {x, y};
            if (action === 'del') {
                lastDelIndex = index;// 标记需要删除的元素
            }
          } else {
            item.action = false;
            item.selected = false;
          }
        });

        // 保存点击时元素的信息
        if (this.tempGraphArr.length > 0) {
          let lastIndex = this.tempGraphArr.length - 1;
          for (let i = 0; i < this.tempGraphArr.length; i++) {
            // 对最后一个元素做操作
            if (i === lastIndex) {
              // 未选中的元素，不执行删除和缩放操作
              if (lastDelIndex !== null && this.tempGraphArr[i].selected) {
                if (this.drawArr[lastDelIndex].action === 'del') {
                  this.drawArr.splice(lastDelIndex, 1);
                  this.codeCtx.clearRect(0, 0, this.toPx(this.data.width), this.toPx(this.data.height));
                }
              } else {
                this.tempGraphArr[lastIndex].selected = true;
                this.currentGraph = Object.assign({}, this.tempGraphArr[lastIndex]);
              }
            } else {
              // 不是最后一个元素，不需要选中，也不记录状态
              this.tempGraphArr[i].action = false;
              this.tempGraphArr[i].selected = false;
            }
          }
        }
        this.draw();
      },

      end(e) {
        this.tempGraphArr = [];
        if(isMove){
            isMove = false; // 重置移动标识
            // 用户操作结束时记录历史
            this.recordHistory();
        }
      },

      move(e) {
        const {x, y} = e.touches[0];
        if (this.tempGraphArr && this.tempGraphArr.length > 0) {
          isMove = true; // 有选中元素，并且有移动时，设置移动标识
          const currentGraph = this.tempGraphArr[this.tempGraphArr.length - 1];
          if (currentGraph.action === 'move') {
            currentGraph.centerX = this.currentGraph.centerX + (x - this.currentTouch.x);
            currentGraph.centerY = this.currentGraph.centerY + (y - this.currentTouch.y);
            // 使用中心点坐标计算位移，不使用 x,y 坐标，因为会受旋转影响。
            if (currentGraph.type !== 'text') {
              currentGraph.x = currentGraph.centerX - this.currentGraph.w / 2;
              currentGraph.y = currentGraph.centerY - this.currentGraph.h / 2;
            }
          } else if (currentGraph.action === 'transform') {
            currentGraph.transform(this.currentTouch.x, this.currentTouch.y, x, y, this.currentGraph);
          }
          // 更新4个坐标点（相对于画布的坐标系）
          currentGraph._rotateSquare();

          
        }
      },

      exportJson() {
        return new Promise((resolve, reject) => {
          let exportArr = this.drawArr.map((item) => {
            // item.selected = false;
            switch (item.type) {
              case 'image':
                return {
                  type: 'image',
                  url: item.fileUrl,
                  y: item.y,
                  x: item.x,
                  w: item.w,
                  h: item.h,
                  rotate: item.rotate,
                  sourceId: item.sourceId,
                };
                break;
              case 'text':
                return {
                  type: 'text',
                  text: item.text,
                  color: item.color,
                  fontSize: item.fontSize,
                  y: item.y,
                  x: item.x,
                  w: item.w,
                  h: item.h,
                  rotate: item.rotate,
                };
                break;
            }
          });
          if (this.data.bgImage) {
            let tmp_img_config = {
              type: 'bgImage',
              url: this.data.bgImage,
            };
            if (this.data.bgSourceId) {
              tmp_img_config['sourceId'] = this.data.bgSourceId;
            }
            exportArr.unshift(tmp_img_config);
          } else if (this.data.bgColor) {
            exportArr.unshift({
              type: 'bgColor',
              color: this.data.bgColor
            });
          }

          resolve(exportArr);
        })
      },
    }

});