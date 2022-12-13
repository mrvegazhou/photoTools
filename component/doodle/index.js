const brushStroke = require('../../vendor/brush.js')
Component({
  properties: {
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
      wx.getSystemInfo({
        success: (res) => {
          this.setData({
            windowWidth:res.windowWidth,
            windowHeight:res.windowHeight*0.8
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
          this.setData({ isClear: true });//开启橡皮擦
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
        console.log(this.data.canvasHidden)
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
        isClear: false,
        isColorPicker: false,
        isRect: false,
        isCircle: false,
        isPen: false,
        brushType: '',
        // isFillCircleColor: false,
        // isFillRectColor: false
      }, obj)
      this.setData(data)
    },
    //修改橡皮透明度
    changeEraserOpacity(e){
      this.setData({ eraserOpacity: e.detail.value, isClear: true })
    },
    //设置笔刷
    setBrushType(e){
      let type = e.currentTarget.dataset.param;
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
      this.setData({
        showBrush: false
      })
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
      } else if (this.data.isClear) { //橡皮擦
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
        
      } else if (this.data.isClear) { //橡皮擦
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
      // if (this.data.isRect){//存放绘图矩形
        // let type = this.data.isFillRectColor?'fillRect':'rect';
        // let startX1 = this.data.prevX, startY1 = this.data.prevY;
        // let width = startX1 - this.startX, height = startY1 - this.startY;
        // this.changeDrawArr({x:this.startX, y:this.startY, w:width, h:height, type})
      // }
    },

    //开启圆形
    setDrawCircle() {
      this.changeDataStatus({isCircle: !this.data.isCircle})
      this.setData({ showTool: false });
      this.showCanvas();
    },

    //存储绘图数组
    changeDrawArr({ x, y, w, h, type = 'text', color = this.data.penColor, size = this.data.penSize, alpha=this.data.transparency}) {
      let _this = this
      let graph = new dragGraph(
        {
          x, y, w, h, type,
          color, size, alpha,
          drawStyle() {
            let res = {}
            switch (type) {
              case 'rect':
              case 'circle':
                _this.setLineStyle(color,size)
                break;
              case 'fillRect':
              case 'fillCircle':
                _this.setFillStyle(color,alpha)
                break;
            }
            return res
          },
          draw(x, y, w, h) {
            switch (type) {
              case 'rect':
                _this.drawRectGraph(x, y, w, h)
                break;
              case 'fillRect':
                _this.drawRectGraph(x, y, w, h, true)
                break;
              case 'circle':
                _this.drawCircleHandler(x, y)
                break;
              case 'fillCircle':
                _this.drawCircleHandler(x, y, true);
                break;
            }
          },
        },
        this.context
      )
      // this.drawArr.push(graph);
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
      if (newW < 0) {
        prevStartX += 1
      } else {
        prevStartX -= 1
      }
      if (newH < 0) {
        prevStartY += 1
      } else {
        prevStartY -= 1
      }
      let prevWidth = this.data.prevX - prevStartX, prevHeight = this.data.prevY - prevStartY;
      if (prevWidth < 0) {
        prevWidth -= 1
      } else {
        prevWidth += 1
      }
      if (prevHeight < 0) {
        prevHeight -= 1
      } else {
        prevHeight += 1
      }
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
          isClear: true
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
  },
});