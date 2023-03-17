const brushStroke = require('../../vendor/brush.js')
Component({
  properties: {
    navHeight: {
      type: Number,
      value: 60
    },
  },

  data: {
    name: '',
    penSize: 2,
    penColor: "#333333",
    eraserSize: 5,
    eraserOpacity: 1,
    //色盘颜色值
    rgbaData: {
      r: 0,
      g: 0,
      b: 0,
      a: 1
    },
    colorPlateTabs:['调色板', '滑块'],
    colorPlateSelect: 0,
    transparency:1,//全局透明度
    brushList:{
      'star': '星星',
      'colorstar': '彩色星星',
      'pixel': '像素点',
      'stave': '五线谱',
    },
    brushType:'',
    canvasHidden:false,
    imgCanvas:'',
    //窗口
    windowHeight:0,
    windowWidth:0,
    //填充
    isFillColor: false,
    //是否填充矩形颜色
    isFillRectColor: false,
    //是否填充圆形颜色
    isFillCircleColor: false,

    //记录矩形上次的点
    prevX:0,
    prevY:0,
    //是否显示工具栏
    showTool: false,

    isCircle: false,
    isRect: false,

    //圆半径
    radius: 50,

    isEraser: false, //是否是橡皮擦
    canvasAlpha: 1,  //画布透明度

    detectBorder: true, //检测边框
  },

  lifetimes: {
    // 在组件实例进入页面节点树时执行
    attached: function () {
      
    },
    ready: function(options) {
      this.initDoodle();
    }
  },

  methods: {
    initDoodle(){
      //保存绘图数组
      // this.drawArr = [];
      //获取宽高
      let that = this;
      wx.getSystemInfo({
        success: (res) => {
          this.setData({
            windowWidth: res.windowWidth,
            windowHeight: res.windowHeight - that.data.navHeight
          });
        }
      })
      const query = wx.createSelectorQuery().in(this)
      query.select('#doodle-canvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node
          this.context = canvas.getContext('2d')
          const dpr = wx.getSystemInfoSync().pixelRatio;
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          this.context.scale(dpr, dpr)
          this.canvas = canvas
        });
    },
    doodleEidt(e) {
      const type = e.currentTarget.dataset['type'];
      switch(type) {
        case "pen":
          this.changeDataStatus()
          break;
        case "eraser":
          this.changeDataStatus()
          this.setData({ isEraser: true });//开启橡皮擦
          break;
        case "color":
          break;
        case "rectangle":
          this.changeDataStatus()
          this.setData({ isRect: true });
          break;
        case "circle":
          this.setDrawCircle()
          break;
        case "brush":
          this.changeDataStatus();
          this.setData({ isPen: true })
          // 默认笔刷是 星星
          let type = 'star';
          this.setBrush(type)
          break;
        case "colorPicker":
          this.changeDataStatus({ isColorPicker: !this.data.isColorPicker })
          break;
        case "back":
          this.triggerEvent('goBack', {});
          break;
        default:
          break;
      }
      this.setData({showTool: true})
      if (type != this.data.name) {
        this.setData({ name: type });
        this.hiddenCanvas();
      } else {
        this.setData({ name: '' });
        this.showCanvas();
      }
    },
    //重新显示canvas
    showCanvas(){
      if (!this.data.canvasHidden) return;
      this.setData({ canvasHidden: false });
      this.context.restore();
    },
    //隐藏canvas
    hiddenCanvas(){
      if (this.data.canvasHidden) return;
      this.context.save();
      this.saveCanvas().then(()=>{
        this.setData({ canvasHidden: true})
      })
    },
    //点击canvas图片
    clickImg(){
      //隐藏框框
      this.setData({ showTool: false, name: '' });
      this.showCanvas();
    },
    //保存canvas
    saveCanvas() {
      return new Promise((resolve) => {
        wx.canvasToTempFilePath({
          canvas: this.canvas,
          success: (res) => {
            let img = res.tempFilePath
            this.setData({ imgCanvas: img });
            resolve()
          },
          fail: (err) => {
            console.error('error', err);
          }
        })
      });
      
    },
    //改变色盘
    changeColorPlate(e){
      let index = e.currentTarget.dataset.param
      this.setData({
        colorPlateSelect:index
      })
    },
    //改变笔颜色
    changePenColor(e){
      this.setData({
        penColor: e.detail.rgba,
        transparency: e.detail.alpha || 1
      })
    },
    //初始化状态值
    changeDataStatus(obj={}){
      let data = Object.assign({
        isEraser: false,
        isColorPicker: false,
        isRect: false,
        isCircle: false,
        isPen: false,
        brushType: ''
      }, obj)
      this.setData(data)
    },
    //修改橡皮透明度
    changeEraserOpacity(e){
      this.setData({ eraserOpacity: e.detail.value, isEraser: true })
    },
    //设置笔刷
    setBrushType(e){
      let type = e.currentTarget.dataset.param;
      this.setBrush(type)
    },
    setBrush(type){
      if (type=="") {
        return;
      }
      let param = {}
      if (type != "colorstar"){
        param = Object.assign({},param,{
          color: this.data.penColor,
          width: 10,
          opacity: this.data.transparency,
          scale: 1,
        })
      }
      this.setData({
        brushType: type
      });
      let brush = new brushStroke(Object.assign({},param,{type}), this.context)
      this.brushStroke = brush
    },
    setFillStyle(color = this.data.penColor){
      this.context.fillStyle = color
    },
    //绘图线条样式
    setLineStyle(color = this.data.penColor, size = this.data.penSize, alpha = this.data.transparency){
      this.context.globalAlpha = alpha;
      this.context.strokeStyle = color;
      this.context.lineWidth = size;//设置线条宽度
      this.context.lineCap = this.context.lineJoin = 'round';//设置线条端点的样式 设置两线相交处的样式
      this.context.shadowBlur = 1;
      this.context.shadowColor = color;
    },
    //设置绘图样式
    setDrawStyle(){
      if(this.data.isFillRectColor || this.data.isFillCircleColor){
        this.setFillStyle()
      }else{
        this.setLineStyle()
      }
      this.context.save();
    },
    //重置笔触样式
    refreshBrushStyle(){
      if (!this.brushStroke) return
      this.brushStroke.changeColor(this.data.penColor)
    },
    //手指触摸动作开始
    doodleTouchStart(e) {
      if(e.touches.length > 1) return;
      //得到触摸点的坐标
      this.startX = e.changedTouches[0].x
      this.startY = e.changedTouches[0].y
      //判断绘图类型
      if (this.data.isColorPicker) {//取色器

      } else if (this.data.isRect || this.data.isCircle) {//矩形
        this.setDrawStyle()
        //保存之前的位置
        this.setData({ prevX: this.startX, prevY: this.startY });
        if(this.data.isCircle) {
          let startX1 = e.changedTouches[0].x,
          startY1 = e.changedTouches[0].y;
          this.drawCircleHandler(startX1, startY1)
          this.context.save();
        }
      } else if (this.data.isEraser) { //橡皮擦
        let color = 'rgba(255,255,255,' + this.data.eraserOpacity + ')'
        this.setLineStyle(color, this.data.eraserSize)
        this.context.save();  //保存当前坐标轴的缩放、旋转、平移信息
        this.context.beginPath() //开始一个路径 
        this.context.restore();  //恢复之前保存过的坐标轴的缩放、旋转、平移信息

      } else if (this.data.brushType) {
        let type = this.data.brushType
        this.refreshBrushStyle()
        if (type == 'star' || type == 'colorstar'||type == 'stave' ){
          this.brushStroke.addRandomPoint(this.startX, this.startY)
        }
      } else { //画笔
        this.setDrawStyle()
        this.context.beginPath();
      }
    },
    //手指触摸后移动
    doodleTouchMove(e) {
      let startX1 = e.changedTouches[0].x,
          startY1 = e.changedTouches[0].y;
      if (this.data.isColorPicker) {

      } else if (this.data.isRect) {//矩形 
        this.drawRectHandler(startX1, startY1)
      } else if (this.data.isCircle) {//圆形
        
      } else if (this.data.isEraser) { //橡皮擦
        this.context.save();  //保存当前坐标轴的缩放、旋转、平移信息
        this.context.moveTo(this.startX, this.startY);  //把路径移动到画布中的指定点，但不创建线条
        this.context.lineTo(startX1, startY1);  //添加一个新点，然后在画布中创建从该点到最后指定点的线条
        this.context.stroke();  //对当前路径进行描边
        this.context.restore();  //恢复之前保存过的坐标轴的缩放、旋转、平移信息
        this.startX = startX1;
        this.startY = startY1;
      } else if (this.data.brushType) {
        this.drawBrushHandler(startX1, startY1)
      } else {//画笔
        this.context.moveTo(this.startX, this.startY);
        //曲线
        let point = this.midPointBtw({ x: this.startX, y: this.startY }, { x: startX1, y: startY1})
        this.context.quadraticCurveTo(this.startX, this.startY, point.x, point.y)
        this.context.lineTo(startX1, startY1);
      
        this.context.stroke();//画线
        this.startX = startX1;
        this.startY = startY1;
      }
    },
    doodleTouchEnd(e) {
      if(this.data.isCircle) {
        return
      }
      this.context.save();
    },

    //开启圆形
    setDrawCircle() {
      this.changeDataStatus({isCircle: !this.data.isCircle})
      this.setData({ showTool: false });
      this.showCanvas();
    },
    
    //画圆形
    drawCircleHandler(startX1, startY1, isFill = this.data.isFillCircleColor){
      this.context.beginPath()
      this.context.arc(this.startX, this.startY, this.data.radius, 0, 2 * Math.PI)
      if (isFill){
        this.context.fill();
      }else{
        this.context.stroke();
      }
      this.context.closePath();
    },
    //画矩形
    drawRectHandler(startX1, startY1){
      this.context.save()
      let newW = startX1 - this.startX, newH = startY1 - this.startY;
      let prevStartX = this.startX, prevStartY = this.startY
      let prevWidth = this.data.prevX - prevStartX, prevHeight = this.data.prevY - prevStartY;
      this.context.clearRect(prevStartX, prevStartY, prevWidth, prevHeight)//清除之前的矩形
      this.drawRectGraph(this.startX, this.startY, newW, newH)
      this.context.restore()
      //保存之前的位置
      this.setData({ prevX: startX1, prevY: startY1 });
    },
    drawRectGraph(x = this.startX, y = this.startY, newW, newH, isFill = this.data.isFillRectColor){
      if (isFill) {
        this.context.fillRect(x, y, newW, newH)
      } else {
        this.context.strokeRect(x, y, newW, newH);//画新的矩形
      }
    },
     //获取凡赛尔曲线点
    midPointBtw(p1,p2){
      return {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2
      };
    },
    //笔刷绘图
    drawBrushHandler(startX1, startY1){
      let type = this.data.brushType
      if (type == 'star' || type == 'colorstar' || type == 'stave') {
        this.brushStroke.addRandomPoint(startX1, startY1)
      }
      this.brushStroke.paint(startX1, startY1, this.startX, this.startY)
      this.startX = startX1;
      this.startY = startY1;
    },
    //滑块修改笔触大小
    sliderPenchange(e) {
      if (this.data.name == 'eraser') {
        //改变橡皮大小
        this.setData({
          eraserSize: e.detail.value,
          isEraser: true
        })
      } else if (this.data.name == 'pen') {
        //改变画笔大小
        this.setData({
          penSize: e.detail.value,
          isPen: true
        })
      }
    },
    doodleGetCanvas() {
      this.setData({showTool: false, name: ''})

      if (!this.data.isColorPicker) return;
      var startX = e.detail.x;
      var startY = e.detail.y;
      let imgData = this.context.getImageData(startX, startY, 3, 3)
      if (imgData) {
        let data = imgData.data
        let rgba = "rgba(" + data[0] + "," + data[1] + "," + data[2] + ",1)";
        this.changeDataStatus({ isPen: true })
        this.setData({penColor: rgba, transparency: 1})
      }
    },
    //圆形 是否填充颜色
    changeFillColor(e){
      const type = e.currentTarget.dataset.type;
      if (type=='rectangle') {
        this.setData({isFillRectColor: true, isRect: true, isCircle: false});
      } else if (type=='circle') {
        this.setData({isFillCircleColor: true, isCircle: true, isRect: false});
      }
    },
    //圆形 半径
    changeCircleRadius(e) {
      this.setData({ radius: e.detail.value, isCircle: true, isRect: false })
    },

    //改变画板透明度
    changeCanvasAlpha(e){
      this.setData({ canvasAlpha: e.detail.value })
    },
    //保存提示
    confirmSave(){
      this.saveAsImg();
      this.setData({showTool: false, name:'', canvasHidden: false})
    },
    cancelSave(){
      this.changeDataStatus()
      this.setData({showTool: false, name:'', canvasHidden: false})
    },
    //保存图片
    saveAsImg() {
      let that = this;
      wx.showLoading({
        title: '生成图片中',
        mask: true
      })
      if(this.data.detectBorder) {
        this.autoDetectBorder(1)
      } else {
        this.saveCanvas().then(()=>{
          //保存到海报画布
          let imgPath = this.data.imgCanvas;
          that.triggerEvent('saveImg2Canvas', {imgPath: imgPath});
          wx.saveImageToPhotosAlbum({
            filePath: imgPath,
            success: (res) => {
              wx.hideLoading()
              wx.showToast({
                title: '已保存到相册和海报中',
                icon: 'success',
                duration: 1500
              })
            },
            fail: (err) => {
              wx.hideLoading()
              console.error(err)
            }
          })
        })
      }
    },
    // 移动到海报窗口
    move2Post() {
      return this.data.imgCanvas;
    },
    confirmClear() {
      this.changeDataStatus()
      this.context.clearRect(0, 0, this.data.windowWidth, this.data.windowHeight);
      this.setData({showTool: false, name:'', canvasHidden: false})
    },
    cancelClear(){
      this.changeDataStatus()
      this.setData({showTool: false, name:'', canvasHidden: false})
    },

    //自动检测画笔边框
    checkDetectBorder() {
      this.setData({ 'detectBorder': !this.data.detectBorder });
    },
    //自动裁剪空白边缘
    autoDetectBorder(padding) {
      let that = this;
      var imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const { data, width, height } = imageData;
      let startX = width,
          startY = height,
            endX = 0,
            endY = 0;
      for (let col = 0; col < width; col++) {
        for (let row = 0; row < height; row++) {
          // 网格索引
          const pxStartIndex = (row * width + col) * 4;
          // 网格的实际像素RGBA
          const pxData = {
            r: data[pxStartIndex],
            g: data[pxStartIndex + 1],
            b: data[pxStartIndex + 2],
            a: data[pxStartIndex + 3]
          };
          // 存在色彩：不透明
          const colorExist = pxData.a !== 0;
          /*
          如果当前像素点有色彩
          startX坐标取当前col和startX的最小值
          endX坐标取当前col和endX的最大值
          startY坐标取当前row和startY的最小值
          endY坐标取当前row和endY的最大值
          */
          if (colorExist) {
            startX = Math.min(col, startX);
            endX = Math.max(col, startX);
            startY = Math.min(row, startY);
            endY = Math.max(row, endY);
          }
        }
      }
      // 右下坐标需要扩展1px,才能完整的截取到图像
      endX += 1;
      endY += 1;
      // 加上padding
      startX -= padding;
      startY -= padding;
      endX += padding;
      endY += padding;

      // 根据计算的起点终点进行裁剪
      const query = wx.createSelectorQuery().in(this)
      query.select(`#otherCanvas`).fields({
          node: true,
          size: true
      }).exec( (res2) => {
        const cropCanvas = res2[0].node;
        const cropCtx = cropCanvas.getContext('2d');
        cropCanvas.width = endX - startX;
        cropCanvas.height = endY - startY;
        const img = cropCanvas.createImage();
        img.src = that.data.imgCanvas;
        img.onload = () => {
          cropCtx.drawImage(
            img,
            startX,
            startY,
            cropCanvas.width,
            cropCanvas.height,
            0,
            0,
            cropCanvas.width,
            cropCanvas.height
          );
          wx.canvasToTempFilePath({
            canvas: cropCanvas,
            success: (res) => {
              let imgPath = res.tempFilePath;
              that.setData({ imgCanvas: imgPath });
              //保存到海报画布
              that.triggerEvent('saveImg2Canvas', {imgPath: imgPath});
              that.saveCanvas().then(()=>{
                wx.saveImageToPhotosAlbum({
                  filePath: imgPath,
                  success: (res) => {
                    wx.hideLoading()
                    wx.showToast({
                      title: '已保存到相册和海报中',
                      icon: 'success',
                      duration: 1500
                    })
                  },
                  fail: (err) => {
                    wx.hideLoading()
                    console.error(err)
                  }
                })
              })
            },
            fail: (err) => {
              console.error('error', err);
            }
          })
        };
      });
    }
  },
});