// pages/me/me.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    camera: false,
		userLocation: false,
		writePhotosAlbum: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAuth();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  getAuth: function () {
		wx.getSetting({
			success: res => {
				console.log(res.authSetting)
				this.setData({
					camera: res.authSetting['scope.camera'],
					writePhotosAlbum: res.authSetting['scope.writePhotosAlbum'],
					userLocation: res.authSetting['scope.userLocation']
				})
			}
		})
  },


  getCamera: function () {
		wx.authorize({
			scope: 'scope.camera',
			success: () => {
				this.getAuth();
			}
		})
	},
  
	getUserLocation: function () {
		wx.authorize({
			scope: 'scope.userLocation',
			success: () => {
				this.getAuth()
			}
		})
	},

	getWritePhotosAlbum: function () {
		wx.authorize({
			scope: 'scope.writePhotosAlbum',
			success: () => {
				this.getAuth()
			}
		})
  },
  
  jump(event) {
    var type = event.currentTarget.dataset.type;
    var url = '';
    if(type=='msg') {
      url = '/pages/message/index/index';
    } else {

    }

    wx.navigateTo({
      url: url,
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

  
  
})