import CanvasDrag from '../../../component/canvas-drag/canvas-drag';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    canvasTemImg: '',
    canvasWidth: 300,
    canvasHeight: 300,
    codeCanvas: null,
    codeCtx: null,

    graph: {},
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.text()
  },

  getNetworkImage: function(imagePath) {
    wx.getImageInfo({
      src: imagePath,
      success(res) {
        return res.path
      },
      fail() {
        return null
      }
    })
  },


  createImage(canvas, ctx, imagePath) {
    
  },



  text() {
      
    const crx1 = wx.createCanvasContext("#canvas")
    crx1.draw()
      let ctx = wx.createSelectorQuery().select('#canvas').fields({
        node: true,
        size: true
      }).exec((res) => {
        const codeCanvas = res[0].node
        const codeCtx = codeCanvas.getContext('2d')
        var dpr = wx.getSystemInfoSync().pixelRatio
        // codeCanvas.width = res[0].width * dpr
        // codeCanvas.height = res[0].height * dpr
        // codeCtx.scale(dpr, dpr)

        var size = 30;

        

        // codeCtx.fontSize = size;
        codeCtx.textBaseline = 'middle';
        codeCtx.textAlign = 'center';
        codeCtx.fillStyle = 'red';
        // codeCtx.font = `normal ${size}px sans-serif`;
        var txt = 'helloword我是大爷'
        var textWidth = codeCtx.measureText(txt).width;
        var textHeight = size + 10;

        var top = 10;
        var right = 10;


        // codeCtx.translate(centerX, centerY);
        // codeCtx.rotate(rotate * Math.PI / 180);
        // codeCtx.translate(-centerX, -centerY);

        codeCtx.fillText(txt, right, top)
        
        
        
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          canvas: codeCanvas,
          success: res => {
            this.setData({
              canvasTemImg: res.tempFilePath
            })
          }
        }, this)
      });

      
  },


  /**
     * 添加文本
     */
  onAddText() {
    this.setData({
        graph: {
            type: 'text',
            mode: 'vertical',
            text: '我是大爷hello world 22erer454',
        }
    });
  },

   /**
     * 导出图片
     */
  onExport() {
    CanvasDrag.export()
        .then((filePath) => {
            console.log(filePath);
            wx.previewImage({
                urls: [filePath]
            })
        })
        .catch((e) => {
            console.error(e);
        })
  },

  setVerticalText() {
    CanvasDrag.setVerticalText()
  },


})