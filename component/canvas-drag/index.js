const util = require("../../utils/util");

var items = new Array();
var index = 0;
var MIN_WIDTH = 20;
var MIN_FONTSIZE = 10;
const SCALE_MAX = 1, SCALE_MIN = 0.5;      // 缩放比例范围
const MARGIN_X = 0, MARGIN_Y = 110;         // 可移动边界偏移量
const canvasPre = 1;                        // 展示的canvas占mask的百分比（用于设置图片质量）

Component({

  options:{
    styleIsolation:'isolated'
  },

  /**
   * 组件的属性列表
  */
  properties: {
    item: {
      type: Object,
      value: {},
      observer: 'onItemChange',
    },
    bgColor: {
      type: String,
      value: '',
    },
    bgImage: {
      type: {},
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

        that.codeCanvas = codeCanvas;
        that.codeCtx = codeCtx;
        
      })
    },
    ready: function(options) {
      // 获取系统信息计算画布宽高
      wx.getSystemInfo({
        success: sysData => {
          this.sysData = sysData
          this.setData({
            canvasWidth: this.sysData.windowWidth * canvasPre,
            canvasHeight: this.sysData.windowHeight * canvasPre,
          })
        }
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toPx(rpx) {
      return rpx * this.rpx;
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

    //------------------------------------------分割线----------------------------------------------//

    // 手指触摸开始（图片）
    WraptouchStart: function(e) {
      // 找到点击的那个图片对象，并记录
      for (let i = 0; i < items.length; i++) {
        items[i].active = false;
        if (e.currentTarget.dataset.id == items[i].id) {
          index = i;
          items[index].active = true;
        }
      }
      this.setData({
        itemList: items
      })

      // 记录触摸开始坐标
      items[index].lx = e.touches[0].clientX;
      items[index].ly = e.touches[0].clientY;
      // console.log(items[index])
    },
    // 手指触摸移动（图片）
    WraptouchMove(e) {
      // console.log('WraptouchMove', e)
      // 记录移动时触摸的坐标
      items[index]._lx = e.touches[0].clientX;
      items[index]._ly = e.touches[0].clientY;
      // 计算图片位置及圆心坐标
      items[index].left += items[index]._lx - items[index].lx;
      items[index].top += items[index]._ly - items[index].ly;
      items[index].x += items[index]._lx - items[index].lx;
      items[index].y += items[index]._ly - items[index].ly;
      // 边界移动阻止
      this.boundaryStop(items[index]._lx - items[index].lx, items[index]._ly - items[index].ly)
      // 替换当前触摸坐标为触摸开始坐标
      items[index].lx = e.touches[0].clientX;
      items[index].ly = e.touches[0].clientY;

      this.setData({
        itemList: items
      })
    },
    // 移动到边界阻止(参数1：x轴移动的距离；参数2：y轴移动的距离)，如果图片到达边界则回退移动状态（即阻止移动）
    boundaryStop(range_x, range_y) {
      // 计算宽高受缩放所致的差值
      let diff_width =  items[index].width * (1 - items[index].scale) / 2
      let diff_height =  items[index].height * (1 - items[index].scale) / 2
      // 记录可移动边界
      let margin_left = 0 - MARGIN_X * items[index].scale
      let margin_right = this.sysData.windowWidth + MARGIN_X * items[index].scale
      let margin_up = 0 - MARGIN_Y * items[index].scale
      let margin_down = this.sysData.windowHeight + MARGIN_Y * items[index].scale
      if(items[index].left + diff_width < margin_left || items[index].left + items[index].width - diff_width > margin_right){
        items[index].left -= range_x;
        items[index].x -= range_x;
        // 横轴超出，强制移动到边缘
        if(items[index].left + diff_width < margin_left){
          items[index].left = -diff_width
          items[index].x = items[index].width / 2 - diff_width 
        }else if(items[index].left + items[index].width - diff_width > margin_right){
          items[index].left = this.sysData.windowWidth - (items[index].width - diff_width)
          items[index].x = this.sysData.windowWidth - (items[index].width / 2 - diff_width) 
        }
      }
      if(items[index].top + diff_height < margin_up || items[index].top + items[index].height - diff_height > margin_down){
        items[index].top -= range_y;
        items[index].y -= range_y;
        // 纵轴超出，强制移动到边缘
        if(items[index].top + diff_height < margin_up){
          items[index].top = -diff_height
          items[index].y = items[index].height / 2 - diff_height 
        }else if(items[index].top + items[index].height - diff_height > margin_down){
          console.log(diff_height)
          items[index].top = this.sysData.windowHeight - (items[index].height - diff_height)
          items[index].y = this.sysData.windowHeight - (items[index].height / 2 - diff_height) 
        }
      }
    },
    // 手指触摸结束
    WraptouchEnd() {

    },
    // 手指触摸开始（控件）
    oTouchStart(e) {
      // 找到点击的那个图片对象，并记录
      for (let i = 0; i < items.length; i++) {
        items[i].active = false;
        if (e.currentTarget.dataset.id == items[i].id) {
          index = i;
          items[index].active = true;
        }
      }
      // 记录触摸开始坐标
      items[index].tx = e.touches[0].clientX;
      items[index].ty = e.touches[0].clientY;
      // 记录移动开始时的角度
      items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)
      // 获取初始图片半径
      items[index].r = this.getDistance(items[index].x, items[index].y, items[index].left, items[index].top);
      // console.log(items[index])
    },
    // 手指触摸移动（控件）
    oTouchMove: function(e) {
      // 记录移动后的位置
      items[index]._tx = e.touches[0].clientX;
      items[index]._ty = e.touches[0].clientY;
      // 计算移动后的点到圆心的距离
      items[index].disPtoO = this.getDistance(items[index].x, items[index].y, items[index]._tx-10, items[index]._ty - 10)
      if(this.data.isScale){
        let scale = 1
        if(items[index].disPtoO / items[index].r < SCALE_MIN){
          scale = SCALE_MIN
        }else if(items[index].disPtoO / items[index].r > SCALE_MAX){
          scale = SCALE_MAX
        }else{
          scale = items[index].disPtoO / items[index].r
        }
        // 通过上面的值除以图片原始半径获得缩放比例
        items[index].scale = scale;
        // 控件反向缩放，即相对视口保持原来的大小不变
        items[index].oScale = 1 / items[index].scale;
      }
      // 计算移动后位置的角度
      items[index].angleNext = this.countDeg(items[index].x, items[index].y, items[index]._tx, items[index]._ty)
      // 计算角度差
      items[index].new_rotate = items[index].angleNext - items[index].anglePre;
      // 计算叠加的角度差
      items[index].angle += items[index].new_rotate;
      // 替换当前触摸坐标为触摸开始坐标
      items[index].tx = e.touches[0].clientX;
      items[index].ty = e.touches[0].clientY;
      // 更新移动角度
      items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)
      // 渲染图片
      this.setData({
        itemList: items
      })
    },
    // 计算两点之间距离
    getDistance(cx, cy, pointer_x, pointer_y) {
      var ox = pointer_x - cx;
      var oy = pointer_y - cy;
      return Math.sqrt(
        ox * ox + oy * oy
      );
    },
    // 计算手指触摸点到圆心的角度
    countDeg: function(cx, cy, pointer_x, pointer_y) {
      var ox = pointer_x - cx;
      var oy = pointer_y - cy;
      var to = Math.abs(ox / oy);
      // console.log(to)
      var angle = Math.atan(to) / (2 * Math.PI) * 360;
      if (ox < 0 && oy < 0){ //相对在左上角，第4象限，按照正常坐标系来
        angle = -angle;
      } else if (ox <= 0 && oy >= 0){ //左下角，第3象限
        angle = -(180 - angle)
      } else if (ox > 0 && oy < 0){ //右上角，第1象限
        angle = angle;
      } else if (ox > 0 && oy > 0){ //右下角，第2象限
        angle = 180 - angle;
      }
      // console.log(angle)
      return angle;
    },
    /* 全局控件部分 */
    // 汽车移动
    carMove(attr, speed) {
      items[index][attr] += speed
      items[index][attr == 'left' ? 'x' : 'y'] += speed
      // 边界移动阻止
      this.boundaryStop((attr == 'left' ? speed : 0), (attr == 'top' ? speed : 0))
      this.setData({
        itemList: items
      })
    },
    // 汽车旋转
    carRotate(attr, speed) {
      items[index][attr] += speed
      this.setData({
        itemList: items
      })
    },
    
    // 点击图片以外隐藏控件
    hideControls(e) {
      // 记录移动后的位置
      let x = e.touches[0].clientX;
      let y = e.touches[0].clientY;
      // 判断是否有图片被选中
      let isActive = false
      for (let i = 0; i < items.length; i++) {
        if(items[i].active){
          index = i
          isActive = true
          break
        }
      }
      // 若有图片被选中则当点击图片以外的区域取消选中状态（安全区域扩大10个像素）
      if(isActive && (x < items[index].left - 10 || x > items[index].left + items[index].width + 10||
      y < items[index].top - 10 || y > items[index].top + items[index].height + 10)){
        items[index].active = false
        this.setData({
          itemList: items
        })
      }
    }
  },

});