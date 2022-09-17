import CanvasRuler from '../../../vendor/canvas-ruler';
Page({
  data: {
    weight: 70,
    height: 180,
    styles: {
      line: '#dbdbdb',
      bginner: '#fbfbfb',
      bgoutside: '#ffffff',
      font: '#404040',
      fontColor: '#404040',
      fontSize: 8
    }
  },
  //  刻度部分
  onReady() {
    // var ctxNode;
    // var ctx;
    // wx.createSelectorQuery().select('#canvas').fields({
    //   node: true,
    //   size: true
    // }).exec((res) => {
    //   const codeCanvas = res[0].node
    //   const codeCtx = codeCanvas.getContext('2d')

    //   ctxNode = codeCanvas;
    //   ctx = codeCtx;

    //   var width = wx.getSystemInfoSync().windowWidth
    //   var height = wx.getSystemInfoSync().windowHeight
    //   this.setData({
    //     width: width,
    //     height: height
    //   })
      

    //   var canvasRuler = new CanvasRuler({
    //     axisWidth: 0.4,
    //     lineColor: 'green',
    //     gridWidth: 100,
    //     gridHeight: 20,
    //     width: width,
    //     height: height
    //   }, codeCtx);
  
    //   canvasRuler.init(canvasRuler.getDrawType().ALL);
    // });


    

  },
  //  刻度部分
  drawRule(n) {
    let context = this.context;
    my.getSystemInfo({
      success: function (res) {
        context.width = res.windowWidth - 63
        _this.setData({ width: res.windowWidth - 63 });
      }
    })
    context.height = 200;
    // 短刻度线的长度
    n += context.width / 2 - 5 * spacing
    //   // 绘制基准线
    context.beginPath();
    context.setStrokeStyle('#ff8a00');
    context.setLineWidth(2);
    context.moveTo(context.width / 2, context.height / 2);
    context.lineTo(context.width / 2, context.height / 2 - centerLine);
    context.stroke();
    context.closePath();
    context.beginPath();
    context.setStrokeStyle('#aaa');
    context.setLineWidth(1);
    context.moveTo(0, context.height / 2);
    context.lineTo(context.width, context.height / 2);
    context.closePath();
    context.stroke();

    // 绘制刻度线
    context.beginPath();
    for (var i = 0; i <= max / unit * spacing / 10; i++) {
      if (i % 5 == 0) {
        context.moveTo(spacing * i + n, context.height / 2);
        context.lineTo(spacing * i + n, context.height / 2 - longUnitLine);
        context.setFillStyle("#aaa");
        context.setFontSize(10)
        let sum = i * unit + 5000 + '';
        context.fillText(sum, 10 * i + 2 + n - sum.length / 2 * 7, context.height / 2 - longUnitLine - 5);
      } else {
        context.moveTo(spacing * i + n, context.height / 2);
        context.lineTo(spacing * i + n, context.height / 2 - unitLine);
      }
      if (Math.abs(spacing * i + n - context.width / 2) < 5) {
        context.setFillStyle("#ff8a00");
        context.setFontSize(22)
        sum = i * unit + 5000 + '';
        context.fillText(sum, context.width / 2 - sum.split().length / 2 * 45, 40);
      }
      context.stroke();
    }
    context.closePath();
    context.draw();
  },
  // 刻度开始移动事件
  start(e) {
    e = e || window.event
    _this._x = e.changedTouches[0].x
    // 拖动时，让尺子跟着移动
  },
  // 刻度正在移动事件
  move(e) {
    let offsetX = e.changedTouches[0].x;
    my.createCanvasContext('canvas').clearRect(0, 0, 300, 200);
    _this.a = offsetX - _this._x + _this.x;
    // 不让0刻度在中间线右边
    if (_this.a > 5 * spacing) {
      _this.a = 5 * spacing;
    }
    else if (_this.a < -max / unit * spacing + 5 * spacing) {
      _this.a = -max / unit * spacing + 5 * spacing;
    }
    _this.drawRule(_this.a);
  },
  // 刻度停止移动事件
  end() {
    _this.x = _this.a;
    // 松手时让中间线吸附距离最近的刻度线
    _this.context.clearRect(0, 0, _this.context.width, _this.context.height);
    _this.drawRule(Math.floor(_this.x / 10) * 10);
    // 目前工资等于canvas的值
    _this.setData({ currentSum: sum })

  },

});