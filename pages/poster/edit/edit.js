// pages/poster/edit/edit.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tempCanvasWidth:0,
    tempCanvasHeight:0,
    page:'mainPage',
    imageNotChoosed:true,
    tempImageSrc:'../../../images/rrrr.png',
    imgWidth:0,
    imgHeight:0,
    imgTop:0,
    imgLeft:0,

    layerShow: true,
    current: 'item_1',
    items: {
      item_1: {
        type:'image', px:0, py:0, width: 10, height: 10, ox: 5, oy: 5, degree: 90
      }
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

  showLayerPanel() {
    var show = this.data['layerShow']
    this.setData({layerShow: !show})
  },



})