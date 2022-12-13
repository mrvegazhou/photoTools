import ImageCropper from '../../../component/image-cropper/cropper';
import MyDoodleCpt from '../../../component/doodle/doodle';
const app = getApp()
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
      rpxRatio: 1, //此值为你的屏幕CSS像素宽度/750，单位rpx实际像素
      colorData: {
        //基础色相，即左侧色盘右上顶点的颜色，由右侧的色相条控制
        hueData: {
          colorStopRed: 255,
          colorStopGreen: 0,
          colorStopBlue: 0,
        },
        //选择点的信息（左侧色盘上的小圆点，即你选择的颜色）
        pickerData: {
          x: 0, //选择点x轴偏移量
          y: 480, //选择点y轴偏移量
          red: 0,
          green: 0,
          blue: 0,
          hex: '#000000'
        },
        //色相控制条的位置
        barY: 0,
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
      fontFamilySelect: ['最新发布', '推荐排序', '租金由低到高', '租金由高到低', '面积由小到大', '面积由大到小'],
      fontFamilyIndex: 0,
      fontFamilyShow: false,
      fontFamilyShowVal: '',
      sliderFontSize: 0,
    },
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
        fontSize: 0,
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
        width: "",
        height: "",
      }
    },
    items: {
      item_1: {
        type:'image', px:0, py:0, width: 10, height: 10, ox: 5, oy: 5, degree: 90
      }
    },

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
    var menu = this.data.menu
    menu.secondMenu = type
    this.setData({menu: menu})
    switch(type) {
      case 'img.album':

        break;
    }
  },
  // 编辑文字...
  closeTxtEdit() {
    var menu = this.data.menu
    menu.menuShow = ''
    this.setData({menu: menu})
  },
  // 编辑文字确认
  editTxtOk(e) {
    let item = this.data.itemText
    item.text = ''
  },
  // 编辑文字取消
  editTxtCancel(e) {
    let item = this.data.itemText
    item.text = ''
    this.setData({
      item: item
    })
    this.closeTxtEdit()
  },
  textAreaBlur(e){
    let item = this.data.itemText
    item.text = e.detail.value
    this.setData({
      item: item
    })
  },
  //选择改色时触发（在左侧色盘触摸或者切换右侧色相条）
  onChangeColor(e) {
    //返回的信息在e.detail.colorData中
    var menu = this.data.menu
    var item = this.data.itemText
    menu.colorData = e.detail.colorData
    item.css.color = e.detail.colorData.pickerData.hex
    this.setData({
      menu: menu,
      itemText: item
    })
  },
  //关闭拾色器
  closeColorPicker() {
    var menu = this.data.menu
    menu.showColorPicker = false
    this.setData({
      menu: menu
    })
  },
  // 设置屏幕宽度比例
	setRpxRatio () {
		const _this = this
		wx.getSystemInfo({
			success(res) {
				_this.setData({ rpxRatio: res.screenWidth / 750 })
			}
		})
  },
  // 编辑文字样式
  editText(e) {
    const type = e.currentTarget.dataset['type'];
    var menu = this.data.menu
    switch (type) {
      case 'txt.edit':
        menu.secondMenu = 'txt.edit'
        break;
      case 'txt.color':
        menu.showColorPicker = true
        menu.secondMenu = 'txt.color'
        break;
      case 'txt.css':
        menu.secondMenu = 'txt.css'
        break;
      case 'txt.opacity':
        menu.secondMenu = 'txt.opacity'
        break;
    }
    this.setData({menu: menu})
  },
  // 选择字体
  selectFontFamily() {

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
    let menu = this.data.menu
    menu.fontFamilyShow = !menu.fontFamilyShow
    this.setData({
      menu:menu
    })
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
  
})