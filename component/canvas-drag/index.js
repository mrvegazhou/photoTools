const util = require("../../utils/util");

var list = new Array();
var index = 0, itemId = 0;
var MIN_WIDTH = 20;
var MIN_FONTSIZE = 10;
const SCALE_MAX = 2.5, SCALE_MIN = 0.5;      // 缩放比例范围
const MARGIN_X = 0, MARGIN_Y = 110;         // 可移动边界偏移量
const canvasPre = 1;                        // 展示的canvas占mask的百分比（用于设置图片质量）
const maxWidth = 200, maxHeight = 200; // 设置最大宽高

Component({

  options:{
    styleIsolation:'isolated'
  },

  /**
   * 组件的属性列表
  */
  properties: {
    items: {
      type: Object,
      value: [],
      observer: 'onItemsChange',
    },
    bgImg: {
      type: String,
      value: '',
    },
    bgColor: {
      type: String,
      value: '',
    },
    height: {
      type: Number,
      value: 0,
    },
    width: {
      type: Number,
      value: 0,
    },
  },

  /**
    * 组件的初始数据
    */
  data: {
    history: [],
    itemList: [],
    canvasTemImg: null,
    canvasHeight: null,
    canvasWidth: null,
    bgData: {},
    bgCenter: false,
    isScale: true,  // 是否支持缩放
    syncScale: 1,   // 同步缩放比例（同步场地与车辆图片的缩放）
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
      this.initBg(this.bgImg, this.bgColor);
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化背景
    initBg(bgImg, bgColor) {
      let data = {}
      if (bgImg!='') {
        wx.getImageInfo({
          src: bgImg,
          success: res => {
            // 初始化数据
            data.width = res.width; //宽度
            data.height = res.height; //高度
            data.bgImg = imgSrc;
            data.top = 0; //top定位
            data.left = 0; //left定位
            // 图片中心坐标
            data.x = data.left + data.width / 2;
            data.y = data.top + data.height / 2;
            data.scale = 1; //scale缩放
            // 计算最佳缩放
            let scale = 1;
            if(this.sysData.windowWidth <= data.width){
              scale = this.sysData.windowWidth / data.width;
              data.height = data.height * scale
              data.width = this.sysData.windowWidth
            }
            if(this.sysData.windowHeight <= data.height){
              scale = this.sysData.windowHeight / data.height
              data.width = data.width * scale
              data.height = this.sysData.windowHeight
            }
            data.scale = scale;
            this.setData({
              bgData: data,
              syncScale: scale
            })
          }
        })
      } else if (bgColor!='') {
        data.bgColor = bgColor;
        this.setData({
          bgData: data
        });
      }
      
    },
    // 初始化图片数据
    initItems(items) {
      for (let i = 0; i < items.length; i++) {
        let item = items[i]
        // 初始化标志，判断是否读取已有item
        let flag = Boolean(item)
        let bgData = this.data.bgData
        let data = {css:{}}
        let that = this;
        if(item.type=='image') {
          wx.getImageInfo({
            src: item.url,
            success: res => {
              // 初始化数据
              data.id = itemId++;
              data.url = item.url;
              data.css.width = res.width; //item.css.width; //宽度
              data.css.height = res.height; //item.css.height; //高度
              var newHeight = res.height, newWidth = res.width;
              if (data.css.width > maxWidth || data.css.height > maxHeight) { // 原图宽或高大于最大值就执行
                if (data.css.width / data.css.height > maxWidth / maxHeight) { // 判断比n大值的宽或高作为基数计算
                  newWidth = maxWidth;
                  newHeight = Math.round(maxWidth * (data.css.height / data.css.width));
                } else {
                  newHeight = maxHeight;
                  newWidth = Math.round(maxHeight * (data.css.width / data.css.height));
                }
              }
              data.css.width = newWidth
              data.css.height = newHeight
              // 图片中心坐标
              data.x =  (flag && JSON.stringify(bgData)!="{}") ? (bgData.x + item.relative_x * bgData.scale) : (data.css.width / 2)
              data.y =  (flag && JSON.stringify(bgData)!="{}") ? (bgData.y + item.relative_y * bgData.scale) : (data.css.height / 2)
              // 定位坐标
              data.css.left = flag ? (data.x - data.css.width / 2) : 0; //left定位
              data.css.top = flag ? (data.y - data.css.height / 2) : 0; //top定位
              // data.scale = 1; //scale缩放
              item.scale = 1;
              data.scale = flag ? item.scale * that.data.syncScale : that.data.syncScale;
              // data.oScale = 1; //控件缩放
              data.oScale = 1 / data.scale;
              data.angle = 0;
              data.active = false; //选中状态
              data.type = 'image';
              list[list.length] = data;
              that.setData({
                itemList: list
              })
              console.log(this.data.itemList, '---s---')
            }
          })
        } else if(item.type=='text') {
          if (!item.text || typeof(item.text)=='undefined' || item.text=="") {
            return
          }
          const textWidth = this.codeCtx.measureText(item.text).width;
          const textHeight = item.css.fontSize + 10;
          const x = n.left + textWidth / 2;
          const y = n.top + textHeight / 2;
          item = Object.assign(data, {
            x: x,
            y: y,
            scale: flag ? item.scale * this.data.syncScale : this.data.syncScale,
            angle: flag ? item.angle : 0,
            active: false,
            css:{
              width: textWidth,
              height: textHeight,
              // 定位坐标
              left: flag ? (data.x - data.css.width / 2) : 0,
              top: flag ? (data.y - data.css.height / 2) : 0,
            }
          })
          list[list.length] = item;
          that.setData({
            itemList: list
          })
        }
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
    onItemsChange(newItems, oldItems) {
      if (JSON.stringify(newItems) === '[]') return;

      this.initItems(newItems);
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
      for (let i = 0; i < list.length; i++) {
        if (e.currentTarget.dataset.id == list[i].id) {
          list.splice(i, 1);
          this.setData({
            "itemList": list
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
      for (let i = 0; i < list.length; i++) {
        list[i].active = false;
        if (e.currentTarget.dataset.id == list[i].id) {
          index = i;
          list[index].active = true;
        }
      }
      this.setData({
        itemList: list
      })

      // 记录触摸开始坐标
      list[index].lx = e.touches[0].clientX;
      list[index].ly = e.touches[0].clientY;
    },
    // 手指触摸移动（图片）
    WraptouchMove(e) {
      // console.log('WraptouchMove', e)
      // 记录移动时触摸的坐标
      list[index]._lx = e.touches[0].clientX;
      list[index]._ly = e.touches[0].clientY;
      // 计算图片位置及圆心坐标
      list[index].css.left += list[index]._lx - list[index].lx;
      list[index].css.top += list[index]._ly - list[index].ly;
      list[index].x += list[index]._lx - list[index].lx;
      list[index].y += list[index]._ly - list[index].ly;
      // 边界移动阻止
      this.boundaryStop(list[index]._lx - list[index].lx, list[index]._ly - list[index].ly)
      // 替换当前触摸坐标为触摸开始坐标
      list[index].lx = e.touches[0].clientX;
      list[index].ly = e.touches[0].clientY;

      this.setData({
        itemList: list
      })
    },
    // 移动到边界阻止(参数1：x轴移动的距离；参数2：y轴移动的距离)，如果图片到达边界则回退移动状态（即阻止移动）
    boundaryStop(range_x, range_y) {
      // 计算宽高受缩放所致的差值
      let diff_width =  list[index].css.width * (1 - list[index].scale) / 2
      let diff_height =  list[index].css.height * (1 - list[index].scale) / 2
      // 记录可移动边界
      let margin_left = 0 - MARGIN_X * list[index].scale
      let margin_right = this.sysData.windowWidth + MARGIN_X * list[index].scale
      let margin_up = 0 - MARGIN_Y * list[index].scale
      let margin_down = this.sysData.windowHeight + MARGIN_Y * list[index].scale
      if(list[index].css.left + diff_width < margin_left || list[index].css.left + list[index].css.width - diff_width > margin_right){
        list[index].css.left -= range_x;
        list[index].x -= range_x;
        // 横轴超出，强制移动到边缘
        if(list[index].css.left + diff_width < margin_left){
          list[index].css.left = -diff_width
          list[index].x = list[index].css.width / 2 - diff_width 
        }else if(list[index].css.left + list[index].css.width - diff_width > margin_right){
          list[index].css.left = this.sysData.windowWidth - (list[index].css.width - diff_width)
          list[index].x = this.sysData.windowWidth - (list[index].css.width / 2 - diff_width) 
        }
      }
      if(list[index].css.top + diff_height < margin_up || list[index].css.top + list[index].css.height - diff_height > margin_down){
        list[index].top -= range_y;
        list[index].y -= range_y;
        // 纵轴超出，强制移动到边缘
        if(list[index].css.top + diff_height < margin_up){
          list[index].css.top = -diff_height
          list[index].y = list[index].css.height / 2 - diff_height 
        }else if(list[index].css.top + list[index].css.height - diff_height > margin_down){

          list[index].css.top = this.sysData.windowHeight - (list[index].css.height - diff_height)
          list[index].y = this.sysData.windowHeight - (list[index].css.height / 2 - diff_height) 
        }
      }
    },
    // 手指触摸结束
    WraptouchEnd() {

    },
    // 手指触摸开始（控件）
    oTouchStart(e) {
      // 找到点击的那个图片对象，并记录
      for (let i = 0; i < list.length; i++) {
        list[i].active = false;
        if (e.currentTarget.dataset.id == list[i].id) {
          index = i;
          list[index].active = true;
        }
      }
      // 记录触摸开始坐标
      list[index].tx = e.touches[0].clientX;
      list[index].ty = e.touches[0].clientY;
      // 记录移动开始时的角度
      list[index].anglePre = this.countDeg(list[index].x, list[index].y, list[index].tx, list[index].ty)
      // 获取初始图片半径
      // list[index].r = this.getDistance(list[index].x, list[index].y, list[index].css.left, list[index].css.top);
      //获取图片半径
      if (list[index].type==='image') {
        list[index].r = this.getDistance(list[index].x, list[index].y, list[index].css.left, list[index].css.top) - 20;//20是右下角移动图片到本图边缘的估计值，因为这个获取半径的方法跟手指的位置有关
      } else {
        list[index].r = this.getDistance(list[index].x, list[index].y, list[index].tx, list[index].ty);
        if (list[index].r<150) {
          list[index].r = 90;
        }
      }
    },
    // 手指触摸移动（控件）
    oTouchMove: function(e) {
      // 记录移动后的位置
      list[index]._tx = e.touches[0].clientX;
      list[index]._ty = e.touches[0].clientY;
      // 计算移动后的点到圆心的距离
      list[index].disPtoO = this.getDistance(list[index].x, list[index].y, list[index]._tx-10, list[index]._ty-10)
      if(this.data.isScale){
        let scale = 1
        if(list[index].disPtoO / list[index].r < SCALE_MIN){
          scale = SCALE_MIN
        }else if(list[index].disPtoO / list[index].r > SCALE_MAX){
          scale = SCALE_MAX
        }else{
          scale = list[index].disPtoO / list[index].r
        }
        // 通过上面的值除以图片原始半径获得缩放比例
        list[index].scale = scale;
        // 控件反向缩放，即相对视口保持原来的大小不变
        list[index].oScale = 1 / list[index].scale;
      }
      // 计算移动后位置的角度
      list[index].angleNext = this.countDeg(list[index].x, list[index].y, list[index]._tx, list[index]._ty)
      // 计算角度差
      list[index].new_rotate = list[index].angleNext - list[index].anglePre;
      // 计算叠加的角度差
      list[index].angle += list[index].new_rotate;
      // 替换当前触摸坐标为触摸开始坐标
      list[index].tx = e.touches[0].clientX;
      list[index].ty = e.touches[0].clientY;
      // 更新移动角度
      list[index].anglePre = this.countDeg(list[index].x, list[index].y, list[index].tx, list[index].ty)
      // 渲染图片
      this.setData({
        itemList: list
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
      list[index][attr] += speed
      list[index][attr == 'left' ? 'x' : 'y'] += speed
      // 边界移动阻止
      this.boundaryStop((attr == 'left' ? speed : 0), (attr == 'top' ? speed : 0))
      this.setData({
        itemList: list
      })
    },
    // 汽车旋转
    carRotate(attr, speed) {
      list[index][attr] += speed
      this.setData({
        itemList: list
      })
    },
    
    // 点击图片以外隐藏控件
    hideControls(e) {
      this.triggerEvent('hideMenu', {});
      // 记录移动后的位置
      let x = e.touches[0].clientX;
      let y = e.touches[0].clientY;
      // 判断是否有图片被选中
      let isActive = false
      for (let i = 0; i < list.length; i++) {
        if(list[i].active){
          index = i
          isActive = true
          break
        }
      }
      // 若有图片被选中则当点击图片以外的区域取消选中状态（安全区域扩大10个像素）
      if(isActive && (x < list[index].css.left - 10 || x > list[index].css.left + list[index].css.width + 10||
      y < list[index].css.top - 10 || y > list[index].css.top + list[index].css.height + 10)){
        list[index].active = false
        this.setData({
          itemList: list
        })
      }
    }
  },

});