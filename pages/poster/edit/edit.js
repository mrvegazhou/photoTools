const app = getApp()
var openStatus = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgCardShow: true,
    imageUrl: '../../../images/img.png',
    layerShow: true,
    mainPageShow: 'mainPage',
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

  onHandelCancel() {
    wx.hideLoading();
    this.setData({
      imgCardShow: false
    })
  },

  onSavePoster() {
    var that = this;
    // 获取用户是否开启用户授权相册
    if (!openStatus) {
      wx.openSetting({
        success: (result) => {
          if (result) {
            if (result.authSetting["scope.writePhotosAlbum"] === true) {
              openStatus = true;
              that.onSaveImageToPhotosAlbum(that.data.imageUrl);
            }
          }
        },
        fail: () => {},
        complete: () => {}
      });
    } else {
      wx.getSetting({
        success(res) {
          // 如果没有则获取授权
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success() {
                openStatus = true;
                that.onSaveImageToPhotosAlbum(that.data.imageUrl);
              },
              fail() {
                // 如果用户拒绝过或没有授权，则再次打开授权窗口
                openStatus = false
                wx.showToast({
                  title: '请设置允许访问相册',
                  icon: 'none'
                })
              }
            })
          } else {
            // 有则直接保存
            openStatus = true
            that.onSaveImageToPhotosAlbum(that.data.imageUrl);
          }
        },
        fail(err) {
          console.log(err)
        }
      })
    }
  },

  onSaveImageToPhotosAlbum: function(imageUrl){
    var that = this;
    if(imageUrl.target){
      imageUrl = imageUrl.target.dataset.imgurl || this.data.imageUrl;
    }
    wx.saveImageToPhotosAlbum({
      filePath: imageUrl,
      success() {
        wx.showToast({
          title: '图片保存成功',
          icon: 'success',
          duration: 3000
        })
      },
      fail(errMsg) {
        console.log('保存失败: ', errMsg);
      }
    })
  },

})