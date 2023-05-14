// pages/main/main.js
//获取应用实例
const app = getApp()
var apiRequest = require('../../utils/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //广告
    topAdvs: [],
    hasShowAddTips: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getTopAdvs();
    try {
      const hasShowAddTips = wx.getStorageSync('addMyMiniprogram')
      this.setData({
        hasShowAddTips
      })
    } catch (e) {
      console.error(e)
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  hideTips() {
    this.setData({
      hasShowAddTips: true
    });
    try {
      wx.setStorageSync('addMyMiniprogram', 1)
    } catch (e) {
      console.error(e)
    }
  },

  //广告展示
  getTopAdvs: function() {
    let that = this
    apiRequest.getTopAdvs('', {
      datas: {
        type: "topAdv"
      },
      method: "get",
      successFn: function (res) {
        that.setData({
          topAdvs: res.result.datas.data
        })
      }
    })
  },

  //广告详情页跳转
  navigateAdvDetail: function ({ detail }) {
    wx.navigateTo({
      url: '../detail/detail?id=' + detail.itemid,
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },

  //去选择照片页面
	goPages (e) {
    const name = e.currentTarget.dataset.name
    switch ( name ) {
      case "takeIdPhoto":
        wx.navigateTo({
          url: '/pages/takeIdPhoto/idPhoto/idPhoto'
        })
        break;
      case "imageFix":
        wx.navigateTo({
          url: '/pages/imageFix/index/index'
        })
        break;
      case "poster":
        wx.navigateTo({
          url: '/pages/poster/edit/edit'
        })
        break;
    }
	},
})