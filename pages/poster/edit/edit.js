import ImageCropper from '../../../component/image-cropper/cropper';
import MyDoodleCpt from '../../../component/doodle/doodle';
import CanvasDrag from '../../../component/canvas-drag/canvas-drag';
const util = require("../../../utils/util");
const app = getApp()
const families =
  [ "系统默认字体",
    "Courier New", "Courier", "monospace", "Franklin Gothic Medium", "Arial Narrow", "Arial", "Gill Sans", "Gill Sans MT",
    "Calibri", "Trebuchet MS", "Lucida Sans", "Lucida Sans Regular", "Lucida Sans Unicode", "Lucida Grande", "Geneva",
    "Verdana", "sans-serif", "Segoe UI", "Tahoma", "Times", "Times New Roman", "serif", "-apple-system", "BlinkMacSystemFont", 
    "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Open Sans", "Helvetica", "Helvetica Neue", "Cambria", "Cochin", "Georgia", "cursive", 
    "fantasy", "Impact", "Haettenschweiler"
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
      backgroundColor: {
        transparency: 1,
        color: '',
      },
      shadowColor:{
        transparency: 1,
        color: '',
        hShadow: 0,
        vShadow: 0,
        blur: 0,
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
        use: 'img'
      },

      //文字编辑层高度
      txtPopHeight: '470rpx',
      isBg: 'img',
    },
    //画布标尺
    scaleStyles: {
      line: '#dbdbdb',
      bginner: '#fbfbfb',
      bgoutside: '',
      font: '#404040',
      fontColor: '#404040',
      fontSize: 8,
      display: 'block'
    },

    imgCardShow: false,
    imageUrl: '../../../images/img.png',
    itemText: {
      css:{
        top: 50,
        left: 50,
        fontSize: 20,
        fontFamily: '',
        color: '',
        fontWeight: 'normal',
        background: '',
        padding: 10,
        textAlign: '',
        textStyle: '',
        textDecoration: '',
        textVertical: false,
        shadow: '',
        display: 'block'
      }, 
      type:'text', 
      text:''
    },
    itemImg: {
      type: 'image',
      url:'',
      css: {
        top: 50,
        left: 50,
        display: 'block'
      }
    },
    items: [
    ],
    bg: {
      img: '',
      color: '',
      tmpColor: ''
    },
    //图层展示列表
    optSortList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // this.setRpxRatio()
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
    const type = e.currentTarget.dataset['type'];
    var menuShow = type
    if (type==this.data.menu.menuShow) {
      this.setData({'menu.menuShow': ''})
      return
    }
    var menu = this.data.menu
    switch(type) {
      case 'txt':
        menu.secondMenu = 'txt.edit'
        menu.txtPopHeight = '470rpx'
        break;
      case 'cropper':
        this.chooseImage()
        break;
      case 'img':
        var left = e.target.offsetLeft
        menu.menuShowLeft = left+5;
      case 'sys':
        break;
      case 'doodle':
        // MyDoodleCpt.initDoodle();
      case 'layer':
        this.getSortList();
      default:
        menu.secondMenu = ''
    }
    menu.menuShow = menuShow
    this.setData({menu: menu})
  },
  //基础方法 不同方式获取图片
  baseGetPhoto(type){
    return new Promise((resolve, reject) => {
      if(type=='camera'){
        wx.getSetting({
          success(res) {
            if (res.authSetting['scope.camera']) {
              resolve();
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
      } else if(type=='album'){
        wx.chooseMedia({
          count: 1,
          mediaType: 'image',
          sourceType: ['album'],
          sizeType: 'original',
          camera: 'back',
          success:(res)=> {
            resolve(res.tempFiles[0].tempFilePath);
          },
          fail () {
            wx.showToast({ title: '取消选择', icon: 'none', duration: 2000 });
          }
        })
      } else if(type=='talk'){
        wx.chooseMessageFile({
          count: 1,
          type: 'image',
          success (res) {
            // tempFilePath可以作为 img 标签的 src 属性显示图片
            const tempFilePaths = res.tempFiles
            resolve(tempFilePaths[0].path);
          }
        })
      }
    });
  },
  // 加图...
  getPhotos(e) {
    let type = e.currentTarget.dataset['type'];
    this.setData({'menu.secondMenu': type})
    if(type==='img.camera')
      this.setData({'menu.camera.use': 'img'});
    let typeArr = type.split(".");
    type = typeArr[1];
    const that = this
    this.baseGetPhoto(type).then((url)=>{
      switch(type){
        case 'camera':
          that.setData({'menu.carema.showCamera': true, 'menu.menuShow': '', 'menu.secondMenu':''});
          break;
        case 'album':
          that.addItemImg(url);
          that.setData({'menu.menuShow': '', 'menu.secondMenu':''});
          break;
        case 'talk':
          that.addItemImg(url);
          that.setData({'menu.menuShow': '', 'menu.secondMenu':''});
          break;
      }
    });
  },
  // 在海报组件中调用隐藏主菜单
  hideMenu() {
    this.setData({
      'menu.menuShow': '',
      'menu.secondMenu':''
    });
  },

  //-----------------------------------系统设置 begin----------------------------------------------------//
  sysSetting(e){
    let type = e.currentTarget.dataset['type'];
    this.setData({'menu.secondMenu': type});
    switch(type) {
      case 'sys.scale':
        this.setData({'scaleStyles.display': this.data.scaleStyles.display=='block'?'none':'block'});
        break;
      case 'sys.clear':
        wx.showModal({
          content: '是否确定清空画布内容？',
          confirmText: "确认",
          cancelText: "取消",
          success: function (res) {
            CanvasDrag.clearCanvas();
          }
        });
        break;
      case 'sys.save':
        CanvasDrag.downloadImg();
        break;
    }
    this.hideMenu();
  },
  //-----------------------------------系统设置 end----------------------------------------------------//

  //-----------------------------------背景设置 begin----------------------------------------------------//
  editBgOk(){
    if( this.data.bg.tmpColor=='') {
      this.hideMenu()
      return
    }
    this.setData({
      'bg.color': this.data.bg.tmpColor,
    })
    this.hideMenu()
  },
  editBgCancel(){
    this.setData({
      'bg.color': '',
    })
    this.hideMenu()
  },
  //更改背景颜色
  onChangeBgColor(e){
    let rgba = e.detail.rgba;
    this.setData({
      'bg.tmpColor': rgba
    })
  },
  changeBg(e){
    let type = e.currentTarget.dataset['type'];
    if(type=='img'){
      this.setData({'menu.isBg': 'img'})
    } else {
      this.setData({'menu.isBg': 'color'})
    }
  },
  //背景选照片
  getBgPhoto(e){
    let type = e.currentTarget.dataset['type'];
    let that = this;
    if(type=='camera')
      that.setData({'menu.camera.use': 'bg'});
    else if(type=='cancel'){
      that.setData({'menu.menuShow': '', 'menu.secondMenu':''});
      return;
    }
    this.baseGetPhoto(type).then((url)=>{
      switch(type){
        case 'camera':
          that.setData({'menu.carema.showCamera': true, 'menu.menuShow': '', 'menu.secondMenu':''});
          break;
        case 'album':
          that.setData({'bg.img': url});
          that.setData({'menu.menuShow': '', 'menu.secondMenu':''});
          break;
        case 'talk':
          that.setData({'bg.img': url});
          that.setData({'menu.menuShow': '', 'menu.secondMenu':''});
          break;
      }
    });
  },
  //-----------------------------------背景设置 end----------------------------------------------------//

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
  takeCameraImg(e) {
    var use = e.currentTarget.dataset['use'];
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
        if(use=='img'){
          this.addItemImg(res.tempImagePath);
        } else if(use=='bg'){
          this.setData({'bg.img': res.tempImagePath});
        }
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
  // 编辑文字...
  closeTxtEdit() {
    this.setData({'menu.menuShow': ''})
  },
  // 编辑文字确认
  editTxtOk() {
    let item = this.data.itemText;
    let content = item.text;
    let type = item.type;
    if(type!='text')
      return;
    if(content.trim()=='') {
      wx.showToast({
        title: '文字内容不能为空',
        icon: 'none',
        duration: 3000
      })
      return
    }
    item.css.fontFamily = this.data.menu.fontFamilyShowVal;
    item.css.color = this.data.menu.colorData.color;
    item.css.background = this.data.menu.backgroundColor.color;
    //阴影设置
    if(this.data.menu.shadowColor.color!='' && this.data.menu.shadowColor.blur!=0) {
      item.css.shadow = `${this.data.menu.shadowColor.hShadow} ${this.data.menu.shadowColor.vShadow} ${this.data.menu.shadowColor.blur} ${this.data.menu.shadowColor.color}`;
    }
    let items = this.data.items;
    items = [item]
    this.setData({
      items: items
    });
    this.closeTxtEdit()
    //清除样式
    this.initTextData();
  },
  //设置字号
  changeFontSize(e) {
    this.setData({'itemText.css.fontSize': e.detail.value})
  },
  //设置样式
  selectFontStyle(e){
    let type = e.currentTarget.dataset['type'];
    let typeNames = type.split('#');
    switch(typeNames[0]){
      case "direction":
        this.setData({"itemText.css.textVertical": !this.data.itemText.css.textVertical})
        break;
      case "textAlign":
        this.setData({"itemText.css.textAlign": (this.data.itemText.css.textAlign=='' || this.data.itemText.css.textAlign!=typeNames[1]) ? typeNames[1] : ''})
        break;
      case "fontWeight":
        this.setData({"itemText.css.fontWeight": this.data.itemText.css.fontWeight=='' ? typeNames[1] : ''})
        break;
      case "textDecoration":
        let textDec = this.data.itemText.css.textDecoration
        if(textDec.indexOf(typeNames[1])!=-1) {
          textDec = textDec.replace(typeNames[1], "");
          this.setData({"itemText.css.textDecoration": textDec.trim()});
        } else {
          this.setData({"itemText.css.textDecoration": textDec+" "+typeNames[1]});
        }
        break;
      case "textStyle":
        this.setData({"itemText.css.textStyle": (this.data.itemText.css.textStyle=='' || this.data.itemText.css.textStyle!=typeNames[1]) ? typeNames[1] : ''})
        break;
      case "cancel":
        this.setData({
          'itemText.css.fontFamily': '',
          'itemText.css.fontWeight': 'normal',
          'itemText.css.background': '',
          'itemText.css.padding': 10,
          'itemText.css.textAlign': '',
          'itemText.css.textStyle': 'fill',
          'itemText.css.textDecoration': '',
          'itemText.css.textVertical': false,
        })
        break;
    }
  },
  // 编辑文字取消
  editTxtCancel() {
    this.setData({
      'itemText.text': ''
    })
    this.closeTxtEdit()
    this.initTextData()
  },
  textAreaInput(e){
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
      'itemText.css.color': rgba,
      'menu.secondMenu': 'txt.edit'
    })
  },
  //关闭拾色器
  closeColorPicker() {
    this.setData({
      'menu.showColorPicker': false,
      'menu.txtPopHeight':'470rpx'
    })
  },
  // 编辑文字样式
  editText(e) {
    const type = e.currentTarget.dataset['type'];
    switch (type) {
      case 'txt.color':
        this.setData({'menu.showColorPicker': true, 'menu.txtPopHeight':'55vh'});
        break;
      case 'txt.background':
        this.setData({'menu.txtPopHeight':'70vh'});
        break;
      case 'txt.shadow':
        this.setData({'menu.txtPopHeight':'77vh'});
        break;
      default:
        this.setData({'menu.txtPopHeight':'470rpx'});
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
    this.showFontFamilySelect()
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
  //更改背景色
  onChangeBackColor(e) {
    let rgba = e.detail.rgba;
    this.setData({
      'menu.backgroundColor.color': rgba,
      'menu.backgroundColor.transparency': e.detail.alpha || 1,
      'itemText.css.background': rgba
    })
  },
  paddingInput(e){
    this.setData({'itemText.css.padding': e.detail.value});
  },
  //更改阴影色
  onChangeShadowColor(e) {
    let rgba = e.detail.rgba;
    this.setData({
      'menu.shadowColor.color': rgba,
      'menu.shadowColor.transparency': e.detail.alpha || 1,
      'itemText.css.shadow': rgba
    })
  },
  textShadowInput(e){
    let type = e.currentTarget.dataset['type'];
    let val = e.detail.value;
    switch(type){
      case 'blur':
        this.setData({'menu.shadowColor.blur': val})
        break;
      case 'hShadow':
        this.setData({'menu.shadowColor.hShadow': val})
        break;
      case 'vShadow':
        this.setData({'menu.shadowColor.vShadow': val})
        break;
    }
    this.setData({
      'menu.shadowColor.color': rgba,
      'menu.shadowColor.transparency': e.detail.alpha || 1,
      'itemText.css.shadow': rgba
    })
  },
  initTextData() {
    this.setData({
      'itemText.css.top': 0,
      'itemText.css.left': 0,
      'itemText.css.fontSize': 20,
      'itemText.css.color': '#000000',
      'itemText.css.fontFamily': '',
      'itemText.css.fontWeight': 'normal',
      'itemText.css.background': '',
      'itemText.css.padding': 10,
      'itemText.css.textAlign': '',
      // 'itemText.css.textStyle': 'fill',
      'itemText.css.textDecoration': '',
      'itemText.css.textVertical': false,
      'menu.colorData.transparency': 1,
      'menu.colorData.color': '#333333'
    })
  },
  //-----------------------------------文字编辑 end---------------------------------------------------//

  //-----------------------------------图层管理 start---------------------------------------------------//
  dragSortListHideItem(event) {
    if(typeof(event.detail.index) == "undefined") return;
    // 调用画板组件的隐藏item方法
    CanvasDrag.hideItem(event.detail.index);
  },
  //item排序
  getSortList(){
    let itemList = CanvasDrag.getitemList();
    this.setData({optSortList: itemList});
  },
  //更新items
  flushItemSort(event){
    if(typeof(event.detail.optionList)=="undefined") return;
    CanvasDrag.flushItemSort(event.detail.optionList);
  },
  //-----------------------------------图层管理 end---------------------------------------------------//

  //-----------------------------------点击图片操作 start----------------------------------------------//
  editItem(){

  }
  //-----------------------------------点击图片操作 end------------------------------------------------//
})