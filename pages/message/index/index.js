const util = require("../../../utils/util");
const apiRequest = require('../../../utils/api.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showUpload: true,
    uploaderList: [],
    uploaderImgsBase64: [],
    msgType: '',
    msgContent: '',
    msgContact: ''
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  clearImg(e) {
    var nowList = [];
    var uploaderList = this.data.uploaderList;
    for (let i = 0; i < uploaderList.length; i++) {
      if (i == e.currentTarget.dataset.index) {
        continue;
      } else {
        nowList.push(uploaderList[i])
        continue;
      }
    }
    this.setData({
      uploaderList: nowList,
      showUpload: true
    })
  },

  showImg(e) {
    var that = this;
    wx.previewImage({
      urls: that.data.uploaderList,
      current: that.data.uploaderList[e.currentTarget.dataset.index]
    })
  },

  upload: function(e) {
    var that = this;
    var uploadNum = that.data.uploaderList.length;
    wx.chooseMedia({
      count: 6 - uploadNum,
      sizeType: ['original', 'compressed'],
      mediaType: ['image'],
      sourceType: ['album'],
      success: async function(res) {
        let uploaderList = [];
        let uploaderImgsBase64List = [];
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        for (let i = 0; i < res.tempFiles.length; i++) {
          let item = res.tempFiles[i];
          const path = item.tempFilePath;
          uploaderList = that.data.uploaderList.concat(path);
          if (uploaderList.length == 6) {
            that.setData({
              showUpload: false
            })
          }
          await util.urlTobase64(path).then(function(resolve) {
            uploaderImgsBase64List = that.data.uploaderImgsBase64.concat(resolve);
          });
        }
        that.setData({
          uploaderList: uploaderList,
          uploaderImgsBase64: uploaderImgsBase64List
        });
      }
    })
  },

  setMsgType(e) {
    let type = e.currentTarget.dataset['type'];
    this.setData({
      msgType: type
    });
  },
  textAreaInput(e) {
    this.setData({
      'msgContent': e.detail.value
    });
  },
  textInputContact() {
    this.setData({
      'msgContact': e.detail.value
    });
  },
  submit() {
    let msgContent = this.data.msgContent;
    let msgType = this.data.msgType;
    if(msgType=='') {
      wx.showToast({
        title: '留言类型不能为空',
        icon: 'none'
      });
      return;
    }
    if(msgContent=='') {
      wx.showToast({
        title: '留言内容不能为空',
        icon: 'none'
      });
      return;
    }
    let datas = {
      type: this.data.msgType,
      content: this.data.msgContent,
      contact: this.data.msgContact,
      imgs: this.data.uploaderImgsBase64
    };
    apiRequest.saveFeedbackMsg(datas, {
      successFn: (res)=>{
        let msg = '';
        if(res.data.code==200) {
          msg = '已保存，谢谢反馈';
        } else {
          msg = '保存失败:'+res.data.msg;
        }
        wx.showToast({
          title: msg,
          icon: "none"
        });
      },
      failFn: (res)=>{
        wx.showToast({
          title: '保存失败...',
          icon: "none"
        });
      }
    });
  }
})