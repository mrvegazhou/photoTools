//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    size: 36,
    img_width: 115,
    img_height: 85,
    margin: 10,
    rightMargin: 10
  },
  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  },
  clickBig: function () {
    let size = this.data.size;
    this.setData({
      size: size+1
    })
  },
  clickSmall: function () {
    let size = this.data.size;
    this.setData({
      size: size - 1
    })
  },
  marginInput: function (e) {
  
    this.setData({
      margin: e.detail.value
    })
  },
  marginInput2: function (e) {

    this.setData({
      rightMargin: e.detail.value
    })
  },
  imgInputWidth: function (e) {
    this.setData({
      img_width: e.detail.value
    })
  },
  imgInputHeight: function (e) {
    this.setData({
      img_height: e.detail.value
    })
  }
})
