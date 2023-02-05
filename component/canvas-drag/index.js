var list = new Array();
var index = 0, itemId = 0;
var MIN_WIDTH = 20;
var MIN_HEIGHT = 20;
var MIN_FONTSIZE = 10;
var platform = '';
const SCALE_MAX = 2.5, SCALE_MIN = 0.5;      // 缩放比例范围
const MARGIN_X = 0, MARGIN_Y = 50;         // 可移动边界偏移量
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
      observer: 'onBgImgChange',
    },
    bgColor: {
      type: String,
      value: '',
      observer: 'onBgColorChange',
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
    template: [],
    canvasTemImg: null,
    canvasHeight: null,
    canvasWidth: null,
    bgData: {},
    bgCenter: false,
    isScale: true,  // 是否支持缩放
    syncScale: 1,   // 同步缩放比例（同步场地与车辆图片的缩放）
    tmpLeft:0,
    tmpTop:0
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
      let that =  this;
      wx.createSelectorQuery().in(this).select('.contentWarp').boundingClientRect(function (res) {
        that.setData({
          canvasHeight: res.height * canvasPre,
          canvasWidth: res.width * canvasPre
        });
      }).exec()
      // 获取系统信息计算画布宽高
      wx.getSystemInfo({
        success: sysData => {
          this.sysData = sysData
          platform = sysData.platform;
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
      let item = {}
      if (bgImg!='') {
        wx.getImageInfo({
          src: bgImg,
          success: res => {

            // 初始化数据
            item.width = res.width; //宽度
            item.height = res.height; //高度
            item.bgImg = bgImg;
            item.top = 0; //top定位
            item.left = 0; //left定位
            // 图片中心坐标
            item.x = item.left + item.width / 2;
            item.y = item.top + item.height / 2;
            item.scale = 1; //scale缩放
            // 计算最佳缩放
            let scale = 1;
            if(this.sysData.windowWidth <= item.width){
              scale = this.sysData.windowWidth / item.width;
              item.height = item.height * scale
              item.width = this.sysData.windowWidth
            }
            if(this.sysData.windowHeight <= item.height){
              scale = this.sysData.windowHeight / item.height
              item.width = item.width * scale
              item.height = this.sysData.windowHeight
            }
            item.scale = scale;
            this.setData({
              bgData: item,
              syncScale: scale
            })
          }
        })
      } else if (bgColor!='') {
        item.bgColor = bgColor;
        item.x = 0;
        item.y = 0;
        item.scale = 1;
        this.setData({
          bgData: item
        });
      } else {
        this.setData({
          bgData: {}
        });
      }
      
    },

    //当垂直的时候测量文字高度
    measureTextHeight(text) {
      text = String(text);
      var text = text.split('');
      var height = 0;
      var that = this;
      text.forEach(function(item) {
          if (/[a-zA-Z]/.test(item)) {
            height += that.codeCtx.measureText(item).width;
          } else if (/[0-9]/.test(item)) {
            height += that.codeCtx.measureText(item).width;
          } else if (/[\u4e00-\u9fa5]/.test(item)) {  //中文匹配
            let metrics = that.codeCtx.measureText(item);
            height += metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent; //metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent; 
          } else {
            height += that.codeCtx.measureText(item).width;
          }
      });
      return height;
    },

    //处理上传的图片
    _setImgItem(item, op='add') {
      let that = this;
      let flag = Boolean(item)
      let data = {css:{}};
      wx.getImageInfo({
        src: item.url,
        success: resInfo => {
          data.id = itemId++;
          data.url = item.url;

          if(op=='add') {
            data.css.width = resInfo.width; //宽度
            data.css.height = resInfo.height; //高度
            var newHeight = resInfo.height, newWidth = resInfo.width;
            if (data.css.width > maxWidth || data.css.height > maxHeight) { // 原图宽或高大于最大值就执行
              if (data.css.width / data.css.height > maxWidth / maxHeight) { // 判断比n大值的宽或高作为基数计算
                newWidth = maxWidth;
                newHeight = Math.round(maxWidth * (data.css.height / data.css.width));
              } else {
                newHeight = maxHeight;
                newWidth = Math.round(maxHeight * (data.css.width / data.css.height));
              }
            }
            data.css.width = newWidth;
            data.css.height = newHeight;
            //scale缩放
            item.scale = 1;
            data.scale = flag ? item.scale * that.data.syncScale : that.data.syncScale;
            data.angle = 0;
          } else {
            data.css.width = item.css.width;
            data.css.height = item.css.height;
            data.scale = item.scale;
            data.angle = item.angle;
          }
          // 控件缩放
          data.oScale = 1 / data.scale;
          
          // 图片中心坐标
          data.x = data.css.width / 2;
          data.y = data.css.height / 2;
          // 定位坐标
          data.css.left = flag ? item.css.left : 0; //left定位
          data.css.top = flag ? item.css.top : 0; //top定位
          
          if(typeof item.active==='undefined') {
            data.active = false; //选中状态
          } else {
            data.active = item.active;
          }
          data.type = 'image';
          data.css.display = 'block';
          data.filterOp = item.filterOp;
          data.originalImgUrl = item.originalImgUrl ? item.originalImgUrl : item.url;
          if(op=='add') {
            list[list.length] = data;
          } else if(op=='update') {
            list[index] = data;
          }
          that.setData({
            itemList: list
          });
        }
      })
    },
    
    //处理上传的文字
    _setTextItem(item, op='add') {
      let that = this;
      let data = {css:{}};
      data.type = 'text';
      data.id = itemId++;
      data.text = item.text;
      this.codeCtx.font = `normal ${item.css.fontSize}px arial`;
      //判断是否有换行符
      let contentArr = data.text.split(/[(\r\n)\r\n]+/);

      var textWidth = 0, textHeight = 0;
      if(contentArr.length==1) {
        textWidth = this.codeCtx.measureText(item.text).width;
        textHeight = item.css.fontSize + 10;
      } else if(contentArr.length>1) {
        contentArr.forEach((elem) => {
          textWidth = Math.max(textWidth, that.codeCtx.measureText(elem).width);
        });
        textHeight = (item.css.fontSize + 10)*contentArr.length;
      }

      const x = item.css.left + textWidth / 2;
      const y = item.css.top + textHeight / 2;
      data.x = x;
      data.y = y;
      data.css = item.css;
      data.css.width = textWidth;
      data.css.height = textHeight;
      
      data.scale = 1;
      data.styles = ''
      if(item.css.textVertical){
        let maxHeightStr = 0;
        data.styles += "writing-mode:vertical-lr;text-orientation: upright;";
        data.css.width = (item.css.fontSize + 10) * contentArr.length;
        contentArr.forEach((elem) => {
          maxHeightStr = Math.max(maxHeightStr, that.measureTextHeight(elem));
        });
        data.css.height = maxHeightStr;
      }

      if((data.css.width-this.data.canvasWidth)>50) {
        wx.showToast({
          title: '文字长度过大于画布宽度,换行显示更佳',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      if((data.css.height-this.data.canvasHeight)>50) {
        wx.showToast({
          title: '文字高度过大于画布高度',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      if(item.css.fontSize) {
        data.styles += `font-size:${item.css.fontSize}px !important;`
      }
      if(item.css.background){
        data.styles += `background-color:${item.css.background};`
      }
      if(item.css.color){
        data.styles += `color:${item.css.color};`
      }
      if(item.css.fontFamily!='系统默认字体'){
        data.styles += `font-family:${item.css.fontFamily};`
      }
      if(item.css.fontWeight){
        data.styles += `font-weight:${item.css.fontWeight};`
      }
      if(item.css.padding){
        data.styles += `padding:${item.css.padding}rpx;`
        data.css.width = data.css.width + item.css.padding*2;
        data.css.height = data.css.height + item.css.padding;
      }
      if(item.css.textAlign){
        data.styles += `text-align:'${item.css.textAlign}';`
      }
      if(item.css.textDecoration){
        data.styles += `text-decoration:${item.css.textDecoration};`
      }
      if(item.css.textStyle=="stroke"){
        data.styles += `color:white;-webkit-text-stroke:1rpx ${item.css.color};`
      }
      item.scale = item.scale ? item.scale : 1;
      data.scale = flag ? item.scale * this.data.syncScale : this.data.syncScale;
      data.angle = item.angle ? item.angle : 0;
      data.active = false;
      data.css.left = flag ? (x - textWidth / 2) : 0;
      data.css.top = flag ? (y - textHeight / 2) : 0;
      data.css.display = 'block';
      
      if(op=='add') {
        list[list.length] = data;
      } else if(op=='update') {
        list[index] = data;
      }
      that.setData({
        itemList: list
      });
    },

    // 初始化图片数据
    initItems(items) {
      for (let i = 0; i < items.length; i++) {
        let item = items[i]

        if(item.type=='image') {

          this._setImgItem(item);

        } else if(item.type=='text') {
          if (!item.text || typeof(item.text)=='undefined' || item.text=="") {
            return
          }
          this._setTextItem(item);
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
    // 触发背景图片
    onBgImgChange(newItem, oldItem){
      this.initBg(newItem, '');
    },
    // 触发背景色
    onBgColorChange(newItem, oldItem){
      this.initBg('', newItem);
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
          this.triggerEvent('hideMenu', {});
          this.setData({
            "itemList": list
          })
        }
      }
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
      // 记录移动时触摸的坐标
      list[index]._lx = e.touches[0].clientX;
      list[index]._ly = e.touches[0].clientY;
      // 计算图片位置及圆心坐标
      let xDis = list[index]._lx - list[index].lx;
      let yDis = list[index]._ly - list[index].ly;
      list[index].css.left += xDis;
      list[index].css.top += yDis;
      list[index].x += xDis;
      list[index].y += yDis;
      // 边界移动阻止
      this.boundaryStop(xDis, yDis)
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
      let margin_right = this.data.canvasWidth + MARGIN_X * list[index].scale
      let margin_up = 0 - MARGIN_Y * list[index].scale
      let margin_down = this.data.canvasHeight + MARGIN_Y * list[index].scale
      let padding = list[index].css.padding ? list[index].css.padding : 0;

      if(list[index].css.left + padding + diff_width < margin_left || list[index].css.left - padding*2 + list[index].css.width - diff_width > margin_right){
        list[index].css.left -= range_x;
        list[index].x -= range_x;
        // 横轴超出，强制移动到边缘
        if(list[index].css.left + padding + diff_width < margin_left){
          list[index].css.left = -diff_width
          list[index].x = list[index].css.width / 2 - diff_width 
        }else if(list[index].css.left - padding*2 + list[index].css.width - diff_width > margin_right){
          list[index].css.left = this.data.canvasWidth - (list[index].css.width - diff_width)
          list[index].x = this.data.canvasWidth - (list[index].css.width / 2 - diff_width) 
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

          list[index].css.top = this.data.canvasHeight - (list[index].css.height - diff_height)
          list[index].y = this.data.canvasHeight - (list[index].css.height / 2 - diff_height) 
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

      //获取图片半径
      if (list[index].type==='image') {
        list[index].r = this.getDistance(list[index].x, list[index].y, list[index].css.left, list[index].css.top);
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
      list[index].disPtoO = this.getDistance(list[index].x, list[index].y, list[index]._tx, list[index]._ty);
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
      let newRotate = list[index].angleNext - list[index].anglePre;
      // 计算叠加的角度差
      list[index].angle += newRotate;
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

    dragYStart(e){
      var self = this
      self.dragStartY = e.touches[0].clientY
    },

    dragYMove(e){
      var self = this
      var item = list[index]
      var dragLengthY = (e.touches[0].clientY - self.dragStartY) * 0.03
      var moveDis = dragLengthY + item.css.height
      if(moveDis>=MIN_HEIGHT && this.data.canvasHeight>moveDis) {
        list[index].y = moveDis/2
        list[index].css.height = moveDis
        self.setData({
          itemList: list
        })
      } else {
        return
      }
    },

    dragXStart(e){
      var self = this
      self.dragStartX = e.touches[0].clientX
    },

    dragXMove(e){
      var self = this
      var item = list[index]
      var dragLengthX = (e.touches[0].clientX - self.dragStartX) * 0.03
      var moveDis = dragLengthX + item.css.width
      if(moveDis>=MIN_WIDTH && this.data.canvasWidth>moveDis) {
        list[index].css.width = moveDis
        list[index].x = moveDis / 2
        self.setData({
          itemList: list
        })
      } else {
        return
      }
    },
    
    // 点击图片以外隐藏控件
    hideControls(e) {
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
      let flag = (x < list[index].css.left - 10 || x > list[index].css.left + list[index].css.width + 10||
        y < list[index].css.top - 10 || y > list[index].css.top + list[index].css.height + 10);
      if(isActive && flag){
        list[index].active = false;
        this.setData({
          itemList: list
        })
      }
      if(flag) {
        this.triggerEvent('hideMenu', {});
      }
    },

    //隐藏item
    hideItem(index) {
      for (let i = 0; i < list.length; i++) {
        if(i==index){
          list[index].css.display = list[index].css.display=='block' ? 'none' : 'block';
          break
        }
      }
      this.setData({
        itemList: list
      })
    },

    //清空画布
    clearCanvas() {
      this.setData({itemList: []});
    },

    //获取画板模板
    async setPaintPallette(){
      let tempItems = await this.filterItemsAttr();
      let bg = this.data.bgImg!='' ? this.data.bgImg : (this.data.bgColor!='' ? this.data.bgColor : '');
      let template = {
        width: this.data.canvasWidth+"px",
        height: this.data.canvasHeight+"px",
        background: bg+"",
        views: tempItems,
      };
      this.setData({template: template});
    },

    // painter保存图片
    onImgSave(e){
      let path = e.detail.path;
      let tempItemList = this.data.itemList;
      for (let i = 0; i < tempItemList.length; i++) {
        if(tempItemList[i].active){
          tempItemList[i].active = false
          break
        }
      }
      this.setData({itemList: tempItemList})
      this.saveCanvasImg(path)
    },
    onImgErr(err) {
      wx.hideLoading();
    },

    getRectInfo(id) {
      return new Promise((resolve, reject)=>{
        wx.createSelectorQuery().in(this).select(id).boundingClientRect(function(rect){
          return resolve(rect);
        }).exec()
      });
    },

    // 清理元素无用属性
    async filterItemsAttr(){
      let temp = JSON.parse(JSON.stringify(this.data.itemList));
      let newTemp = []
      let that = this;
      for (let i = 0; i < temp.length; i++) {

        delete temp[i].active;
        delete temp[i].oScale;

        let scale = temp[i].scale;
        let width = temp[i].css.width*scale;
        let height = temp[i].css.height*scale;

        await this.getRectInfo('#img-'+temp[i].id).then(rect => {
          let rectT = rect.top;
          let rectL = rect.left;
          let rectW = rect.width;
          let rectH = rect.height;
          let tmpLeft = rectL+(rectW - width)/2;
          let tmpTop = rectT+(rectH - height)/2;
          temp[i].css.top = Number(tmpTop.toFixed(2))+"px";
          temp[i].css.left = Number(tmpLeft.toFixed(2))+"px";
        });

        temp[i].css.width = Number(width.toFixed(2)) + "px";
        temp[i].css.height = Number(height.toFixed(2)) + "px";
       
        delete temp[i].scale;
        delete temp[i].x;
        delete temp[i].y;

        temp[i].css.rotate =  Math.round(temp[i].angle);

        delete temp[i].angle;
        delete temp[i].angleNext;
        delete temp[i].anglePre;
        delete temp[i].disPtoO;
        delete temp[i].lx;
        delete temp[i].ly;
        delete temp[i].r;
        delete temp[i].tx;
        delete temp[i].ty;
        delete temp[i]._lx;
        delete temp[i]._ly;
        delete temp[i].display;

        if(temp[i].background=='rgba(NaN,NaN,NaN,1)') {
          temp[i].background = '';
        }

        if(temp[i].type=='text') {
          delete temp[i].styles;
          delete temp[i].css.width;
          delete temp[i].css.height;
          if(temp[i].css.fontFamily=='系统默认字体') delete temp[i].css.fontFamily;
          temp[i].css.textDecoration = temp[i].css.textDecoration.trim();
          temp[i].css.padding += "px";
          temp[i].css.fontSize += "px";
          if(temp[i].css.shadow==''){
            delete temp[i].css.shadow;
          }
          if(temp[i].css.textAlign==''){
            delete temp[i].css.textAlign;
          }
          if(platform=='devtools') {
            delete temp[i].css.textStyle;
          }
          if(temp[i].css.textVertical) {
            let contentArr = temp[i].text.split(/[(\r\n)\r\n]+/);
            let tmpText = "";
            let idx = 0;
            for (let j = 0; j < contentArr.length; j++) {
              if(contentArr[j]=='') continue
              let fStrWidth = this.codeCtx.measureText(contentArr[j][0]).width+5;
              let strLen = contentArr[j].length;
              for (let a = 0; a < contentArr[j].length; a++) {
                tmpText = `${tmpText}${contentArr[j][a]}\n`;
                if(a==strLen-1) {
                  let css = Object.assign({}, temp[i].css);
                  let item = {
                    type: "text", 
                    text: tmpText,
                    css: css
                  };
                  tmpText = "";
                  item.css.left = `${left + idx}px`;
                  idx += fStrWidth;
                  item.css.textAlign = 'center';
                  newTemp.push(item);
                }
              }
            }
          } else {
            newTemp.push(temp[i]);
          }
        } else {
          newTemp.push(temp[i]);
        }
      }
      return newTemp;
    },

    // 下载画板图片
    saveCanvasImg(imgurl) {
      this.setData({
        canvasTemImg: imgurl
      });
      wx.getSetting({
        success: (set) => {
            wx.saveImageToPhotosAlbum({
                filePath: imgurl,
                success: (res) => {
                    if(res.errMsg == "saveImageToPhotosAlbum:ok") {
                      wx.showToast({
                        title: '保存成功',
                        icon: 'success',
                        duration: 2000
                      });
                    }
                }
            })
            if(set.authSetting['scope.writePhotosAlbum'] == false) {
                wx.openSetting()
            }
        }
      })
    },
  
    downloadImg: function () {
      this.setPaintPallette()
    },

    //返回items
    getitemList() {
      return this.data.itemList;
    },

    //更新items
    flushItemSort(tempList) {
      list = tempList;
      this.setData({
        itemList: tempList
      })
    },

    //------------------------------------单击item编辑 begin------------------------------------//
    //单击单个元素动作
    clickItem() {
      this.triggerEvent('clickItem', {item: list[index]});
    },
    getItem() {
      return list[index];
    },
    replaceItem(item) {
      if(item.type=='image') {
        this._setImgItem(item, 'update');
      } else if(item.type=='text') {
        this._setTextItem(item, 'update');
      }
    },
    //恢复尺寸
    recoverSize() {
      let item = list[index];
      let that = this;
      wx.getImageInfo({
        src: item.url,
        success: async resInfo => {

          await that.getRectInfo('#img-'+item.id).then(rect => {
            let rectTop = rect.top;
            let rectLeft = rect.left;
            if(rectTop<0) {
              rectTop = 10;
            }
            if(rectLeft<0) {
              rectLeft = 10;
            }
            item.css.top = rectTop;
            item.css.left = rectLeft;
          });

          item.css.width = resInfo.width; //宽度
          item.css.height = resInfo.height; //高度
          
          var newHeight = resInfo.height, newWidth = resInfo.width;
          if (item.css.width > maxWidth || item.css.height > maxHeight) { // 原图宽或高大于最大值就执行
            if (item.css.width / item.css.height > maxWidth / maxHeight) { // 判断比n大值的宽或高作为基数计算
              newWidth = maxWidth;
              newHeight = Math.round(maxWidth * (item.css.height / item.css.width));
            } else {
              newHeight = maxHeight;
              newWidth = Math.round(maxHeight * (item.css.width / item.css.height));
            }
          }
          item.css.width = newWidth;
          item.css.height = newHeight;

          item.scale = 1;
          item.angle = 0;
          item.oScale = 1 / item.scale;
          item.x = item.css.width / 2;
          item.y = item.css.height / 2;
          list[index] = item;
          this.setData({itemList: list});
        }
      })
    },
    //------------------------------------单击item编辑 end------------------------------------//
  },
});