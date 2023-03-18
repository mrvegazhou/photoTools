const util = require("../../../utils/util");
var appInstance = getApp();
const families = appInstance.globalData.fontFaceList;
var apiRequest = require('../../../utils/api.js') 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    width:500,
    height:661,
    template:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    // for(let i=0; i<families.length; i++) {
    //   let obj = families[i];
    //   apiRequest.setFontFace(obj.family, obj.url);
    // }
    // 

    wx.loadFontFace({
      global:true,
      scopes: ['webview', 'native'],
      family: '阿里妈妈东方大楷 Regular',
      source:`url("http://192.168.3.3:5000/static/page/font/Alimama_DongFangDaKai_Regular.woff2")`,
   
      success(res) {
        console.log(res.status)
      }
    });

    this.setData({
      template:{
        width: '654rpx',
        height: '600rpx',
        background: '#fff',
        views: [
          {
            type: 'text',
            text: "在多行的情况下，align 会影响内部 text 的对齐，比如这边设置 align: 'center'",
            css: {
              top: '480rpx',
              right: '327rpx',
              width: '400rpx',
              align: 'center',
              fontSize: '30rpx',
              fontFamily: '阿里妈妈东方大楷 Regular'
            },
          },
        ],
      }
    });
    

    // const query = wx.createSelectorQuery()
    // query.select(`#myCanvas1`).fields({
    //         node: true,
    //         size: true
    // }).exec((res) => {

    //         let that = this;
    //         const canvas = res[0].node;
    //         const ctx = canvas.getContext('2d');
    //         this.ctx = ctx;
    //         this.canvas = canvas;
    //         const dpr = wx.getSystemInfoSync().pixelRatio;
    //         canvas.width = res[0].width * dpr;
    //         canvas.height = res[0].height * dpr;
    //         ctx.scale(dpr, dpr);
    

    //         let fm = 'Helvetica';

    //           that.ctx.font = "normal 40px " + fm;;
    //               const sss = '自定义字体';
    //               that.ctx.fillStyle = '#000';
    //               that.ctx.fillText(sss, 50, 50);

    //           wx.canvasToTempFilePath({
    //             canvas: that.canvas,
    //             x: 0,
    //             y: 0,
    //             width: that.canvas.width,
    //             height: that.canvas.height,
    //             destWidth: that.canvas.width,
    //             destHeight: that.canvas.height,
    //             fail: err => {
    //               console.log(err);
    //             },
    //             success: function (res) {
    //             }
    //           }, that);

    // });

  },

  onImgOK(e) {
    console.log(e.detail.path)
    wx.saveImageToPhotosAlbum({
      filePath: e.detail.path,
      success: (res) => {
          if(res.errMsg == "saveImageToPhotosAlbum:ok") {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            });
            wx.hideLoading();
          }
      }
  })
  },
})