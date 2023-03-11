const util = require("../../../utils/util");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    width:500,
    height:661
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    const query = wx.createSelectorQuery()
    query.select(`#myCanvas1`).fields({
            node: true,
            size: true
    }).exec((res) => {

            let that = this;
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            this.ctx = ctx;
            this.canvas = canvas;
            const dpr = wx.getSystemInfoSync().pixelRatio;
            canvas.width = res[0].width * dpr;
            canvas.height = res[0].height * dpr;
            ctx.scale(dpr, dpr);
            let url = "http://h.hiphotos.baidu.com/zhidao/pic/item/6f061d950a7b02086c89030660d9f2d3562cc890.jpg";


            util.canvasHandleImg(that, ctx, canvas, url).then(resInfo => {


              that.ctx.globalCompositeOperation = 'destination-in';
              let R = Math.min(resInfo.width, resInfo.height) / 2;
              let x = resInfo.width / 2;
              let y = resInfo.height / 2;

              var r = R / 2;
              // util.drawStar(that.ctx, R, r, 20, cx, cy);
              that.ctx.beginPath();
  var angle = 360/5;
  var rotate = 20;
  for (var i = 0; i < 5; i++) {
      // 角度转弧度：角度/180*Math.PI
      var roateAngle = i * angle - rotate; // 旋转动起来
      // 外圆顶点坐标
      that.ctx.lineTo(Math.cos((18 + roateAngle) / 180 * Math.PI) * R + x, -Math.sin((18 + roateAngle) / 180 * Math.PI) * R + y);
      // 內圆顶点坐标
      that.ctx.lineTo(Math.cos((54 + roateAngle) / 180 * Math.PI) * r + x, -Math.sin((54 + roateAngle) / 180 * Math.PI) * r + y);
  }
  // closePath：关闭路径，将路径的终点与起点相连
  that.ctx.closePath();
  that.ctx.fillStyle = 'RGBA(0,0,0,1)';
  // that.ctx.strokeStyle = 'red'//"RGBA(0,0,0,0)";
  that.ctx.fill();
  // that.ctx.stroke();
              that.ctx.clip();
              
              // that.ctx.fillRect(0, 0, that.canvas.width, that.canvas.height);
              wx.canvasToTempFilePath({
                canvas: that.canvas,
                x: 0,
                y: 0,
                width: that.canvas.width,
                height: that.canvas.height,
                destWidth: that.canvas.width,
                destHeight: that.canvas.height,
                fail: err => {
                  console.log(err);
                },
                success: function (res) {
                  // that.setData({
                  //   'itemImg.url': res.tempFilePath,
                  // });
                  // itemImg.url = res.tempFilePath;
                  // CanvasDrag.replaceItem(itemImg);
                }
              }, that);

              
            }).catch(error => {
              console.log(error);
            });

    });

  },

  
})