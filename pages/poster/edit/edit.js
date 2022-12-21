import ImageCropper from '../../../component/image-cropper/cropper';
import MyDoodleCpt from '../../../component/doodle/doodle';
import CanvasDrag from '../../../component/canvas-drag/canvas-drag';
const util = require("../../../utils/util");
const app = getApp()
const families =
  [ "系统默认字体",
    "'Courier New', Courier, monospace", 
    "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif",
    "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
    "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    "'Times New Roman', Times, serif",
    "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif",
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    "Arial, Helvetica, sans-serif",
    "Cambria, Cochin, Georgia, Times, 'Times New Roman', serif",
    "cursive",
    "fantasy",
    "Georgia, 'Times New Roman', Times, serif",
    "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
  ]
var openStatus = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menu: {
      mainPageShow: 'mainPage',
      menuShow: '', // img.加图 txt.加字 clip.裁剪 doodle.涂鸦 layer.图层
      menuShowLeft: 0,
      secondMenu:'',
      showColorPicker: false, // 颜色选择器
      colorData: {
        transparency: 1,
        color: '#333333',
      },
      // 裁剪
      cropper: {
        src: '',
        width: 250, //宽度
        height: 250, //高度
        max_width: 300,
        max_height: 300,
        disable_rotate: true, //是否禁用旋转
        disable_ratio: false, //锁定比例
        limit_move: true, //是否限制移动
      },
      //字体菜单下拉框
      fontFamilySelect: families,
      fontFamilyIndex: 0,
      fontFamilyShow: false,
      fontFamilyShowVal: '',

      //照相
      camera: {
        showCamera: false,
        cameraPos: 'back',
        cameraHasImg: false,
        imgUrl: '',
        imgWidth: 0,
        imgHeight: 0,
      },
    },
    //画布标尺
    styles: {
      line: '#dbdbdb',
      bginner: '#fbfbfb',
      bgoutside: '',
      font: '#404040',
      fontColor: '#404040',
      fontSize: 8
    },

    imgCardShow: false,
    imageUrl: '../../../images/img.png',
    itemText: {
      css:{
        top: 0,
        left: 0,
        fontSize: 20,
        fontFamily: '',
        color: '',
        fontWeight: 'normal',
        background: '',
        textAlign: 'center',
        textStyle: 'normal',
        textDecoration: '',
        textVertical: false,
      }, 
      type:'text', 
      text:''
    },
    itemImg: {
      type: 'image',
      url:'',
      css: {
      }
    },
    items: [
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
    this.setRpxRatio()
    this.getFontFamilySelect()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
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

  //-----------------------------------菜单动作----------------------------------------------------//
  showSecondMenu(e) {
    var left = e.target.offsetLeft
    const type = e.currentTarget.dataset['type'];
    var menuShow = type
    if (type==this.data.menu.menuShow) {
      menuShow = ''
    }
    var menu = this.data.menu
    switch(type) {
      case 'txt':
        menu.secondMenu = 'txt.edit'
        break;
      case 'cropper':
        this.chooseImage()
        break;
      case 'img':
        menu.menuShowLeft = left+5
      case 'doodle':
        // MyDoodleCpt.initDoodle();
      default:
        menu.secondMenu = ''
    }
    menu.menuShow = menuShow
    this.setData({menu: menu})
  },

  // 加图...
  getPhotos(e) {
    const type = e.currentTarget.dataset['type'];
    const that = this
    this.setData({'menu.secondMenu': type})
    if(type==='img.camera') {
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.camera']) {
            that.setData({'menu.carema.showCamera': true, 'menu.menuShow': '', 'menu.secondMenu':''});
          } else {
            wx.authorize({
							scope: 'scope.camera',
							success () {
                wx.showToast({ title: '获取拍照权限成功', icon: 'none', duration: 2000 });
							},
							fail(){
                util.openConfirm();
							}
            })
          }
        },
				fail () {
					wx.showToast({ title: '获取拍照权限失败', icon: 'none', duration: 2000 });
				}
      })
    } else if(type==='img.album') {
        //选择打开相册
        wx.chooseMedia({
          count: 1,
          mediaType: 'image',
          sourceType: ['album'],
          sizeType: 'original',
          camera: 'back',
          success:(res)=> {
            that.addItemImg(res.tempFiles[0].tempFilePath);
            that.setData({'menu.menuShow': '', 'menu.secondMenu':''});
          },
          fail () {
            wx.showToast({ title: '取消选择', icon: 'none', duration: 2000 });
          }
        })
    } else if(type==='img.talk') {
      wx.chooseMessageFile({
        count: 1,
        type: 'image',
        success (res) {
          // tempFilePath可以作为 img 标签的 src 属性显示图片
          const tempFilePaths = res.tempFiles
          that.addItemImg(tempFilePaths[0].path);
          that.setData({'menu.menuShow': '', 'menu.secondMenu':''});
        }
      })
    } else {
      wx.showToast({ title: '敬请期待', icon: 'none', duration: 2000 })
    }
  },
  // 在海报组件中调用隐藏主菜单
  hideMenu() {
    this.setData({
      'menu.menuShow': ''
    });
  },

  //-----------------------------------裁剪动作----------------------------------------------------//
  chooseImage() {
    let _self = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];
        let temp = _self.data.menu;
        temp.cropper.src = tempFilePaths;
        _self.setData({
          menu: temp
        })
      }
    })
  },
  cropTop() {
    ImageCropper.setTransform({y: -3});
  },
  cropBottom() {
    ImageCropper.setTransform({y: 3});
  },
  cropLeft() {
    ImageCropper.setTransform({x: -3});
  },
  cropRight() {
    ImageCropper.setTransform({x: 3});
  },
  cropNarrow() {
    ImageCropper.setTransform({scale: -0.02});
  },
  cropEnlarge() {
    ImageCropper.setTransform({scale: 0.02});
  },
  cropRotateLeft() {
    //在用户旋转的基础上旋转90°
    ImageCropper.setAngle(90);
  },
  cropRotateRight() {
    //在用户旋转的基础上旋转90°
    ImageCropper.setAngle(-90);
  },
  cropImg() {
    ImageCropper.getImg((res)=>{
      
    });
    
  },
  cropRecover() {
    const src = this.data.menu.cropper.src;
    ImageCropper.pushImg(src);
  },

  //-----------------------------------涂鸦动作----------------------------------------------------//

  //-----------------------------------照相 begin-------------------------------------------------//
  //相机前后镜头转换
  changeCameraPos() {
    this.setData({
      'menu.camera.cameraPos': this.data.menu.camera.cameraPos == "back" ? "front" : "back"
    })
  },
  //关闭相机
  closeCamera() {
    this.setData({
      'menu.carema.showCamera': false,
    })
  },
  // 照相
  takeCameraImg() {
    var context = wx.createCameraContext()
    // 照相功能
    context.takePhoto({
      quality: "high",
      success: res => {
        this.setData({
          'menu.camera.imgUrl': res.tempImagePath,
          'menu.camera.imgWidth': res.width,
          'menu.camera.imgHeight': res.height,
          'menu.camera.cameraHasImg': true
        })
        this.addItemImg(res.tempImagePath);
      },
      fail: () => {
        wx.showToast({
          title: '出现错误',
        })
      }
    })
  },
  goCameraRepeat(){
    this.setData({
      'menu.camera.cameraHasImg':false,
      'menu.camera.imgUrl':''
    })
  },
  //-----------------------------------照相 end---------------------------------------------------//
  //-----------------------------------画布 begin-------------------------------------------------//
  addItemImg(imgUrl) {
    if(imgUrl=='') return;
    this.setData({ 'itemImg.url': imgUrl })
    this.setData({
      items: [this.data.itemImg]
    });
  },
  //-----------------------------------画布 end---------------------------------------------------//
  //-----------------------------------文字编辑 begin-------------------------------------------------//
  addTextItem() {

  },
  // 编辑文字...
  closeTxtEdit() {
    this.setData({'menu.menuShow': ''})
  },
  // 编辑文字确认
  editTxtOk(e) {
    let item = this.data.itemText
    item.text = ''
  },
  // 编辑文字取消
  editTxtCancel(e) {
    this.setData({
      'itemText.text': ''
    })
    this.closeTxtEdit()
  },
  textAreaBlur(e){
    this.setData({
      'itemText.text': e.detail.value
    })
  },
  //选择改色时触发
  onChangeColor(e) {
    let rgba = e.detail.rgba;
    this.setData({
      'menu.colorData.color': rgba,
      'menu.colorData.transparency': e.detail.alpha || 1,
      'itemText.css.color': rgba
    })
  },
  //关闭拾色器
  closeColorPicker() {
    this.setData({
      'menu.showColorPicker': false
    })
  },
  // 编辑文字样式
  editText(e) {
    const type = e.currentTarget.dataset['type'];
    switch (type) {
      case 'txt.color':
        this.setData({'menu.showColorPicker': true})
        break;
    }
    this.setData({'menu.secondMenu': type})
  },
  // 选择字体
  selectFontFamily(e) {
    let index = e.currentTarget.dataset['index'];
    this.setData({
      'menu.fontFamilyShowVal': families[index],
      'menu.fontFamilyIndex': index,
      
    });
    if(index>0) {
      this.setData({'itemText.css.fontFamily': families[index]})
    }
  },
  // 获取选中的字体
  getFontFamilySelect() {
    let menu = this.data.menu
    let fontFamilySelect = menu.fontFamilySelect
    let fontFamilyIndex = menu.fontFamilyIndex
    menu.fontFamilyShowVal = fontFamilySelect[fontFamilyIndex]
    this.setData({
      menu:menu
    })
  },
  // 显示下拉框
  showFontFamilySelect() {
    this.setData({
      'menu.fontFamilyShow': !this.data.menu.fontFamilyShow
    })
  },
  //-----------------------------------文字编辑 end---------------------------------------------------//
})