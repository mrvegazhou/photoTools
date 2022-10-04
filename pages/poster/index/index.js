import CanvasDrag from '../../../component/canvas-drag2/canvas-drag';
let index = 0;

Page({
  itemId: 0,  // 图片id，用于识别点击图片
  /**
   * 页面的初始数据
   */
  data: {
    path: "",
    item: {},
    weight: 70,
    height: 180,
    styles: {
      line: '#dbdbdb',
      bginner: '#fbfbfb',
      bgoutside: '',
      font: '#404040',
      fontColor: '#404040',
      fontSize: 8
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    
  },


  goEditPage(e) {
    wx.navigateTo({
			url: '/pages/poster/edit/edit?index=' + e.currentTarget.dataset.index,
		})
  },


  /**
   * 添加图片
   */
  uploadImg() {
    var that = this

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success(res) {
        var path = res.tempFiles[0].tempFilePath;
        wx.getImageInfo({
          src:path,
          success: function (res) {
            console.log(res)
            that.setDropItem(res, path);
          }
        })
        
      }
    })
  },

  addText() {
    index += 1
    this.setData({
      item: {
          type: 'text',
          text: '我是司法鉴定快王赚大钱\r\n要赚钱我要赚钱\r\n上档次的赚大钱'+index,
          id: index,
          fontSize: 20,
          top:100,
          left:100
      }
    });
  },

  setDropItem(info, path) {
    index += 1;
    var temDic = {
      id: index,
      image: path,//图片地址
      top: 100,//初始图片的位置 
      left: 100,
      x: 150, //初始圆心位置，可再downImg之后又宽高和初始的图片位置得出
      y: 150,
      scale: 1,//缩放比例  1为不缩放
      angle: 0,//旋转角度
      active: false, //判定点击状态
      width: info.width,
      height: info.height,
      type: 'image'
    }

    this.setData({
      "item": temDic
    })
  },


  // 查看canvas画板
  openMask() {
    CanvasDrag.openMask()
  },

  setVerticalText() {
    CanvasDrag.setVerticalText()
  },

  changeTextColor() {
    CanvasDrag.changeTextColor('purple')
  }


})