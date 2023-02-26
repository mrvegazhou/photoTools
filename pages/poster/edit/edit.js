import ImageCropper from '../../../component/image-cropper/cropper';
import MyDoodleCpt from '../../../component/doodle/doodle';
import CanvasDrag from '../../../component/canvas-drag/canvas-drag';
import AlloyImage from "../../../component/alloyimage/alloyImage.js"
const util = require("../../../utils/util");
const families =
  [ "系统默认字体",
    "Courier New", "Courier", "monospace", "Franklin Gothic Medium", "Arial Narrow", "Arial", "Gill Sans", "Gill Sans MT",
    "Calibri", "Trebuchet MS", "Lucida Sans", "Lucida Sans Regular", "Lucida Sans Unicode", "Lucida Grande", "Geneva",
    "Verdana", "sans-serif", "Segoe UI", "Tahoma", "Times", "Times New Roman", "serif", "-apple-system", "BlinkMacSystemFont", 
    "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Open Sans", "Helvetica", "Helvetica Neue", "Cambria", "Cochin", "Georgia", "cursive", 
    "fantasy", "Impact", "Haettenschweiler"
]
var openStatus = true;
const OFFSET = 10;
let canvasWidth = 1239;
let canvasHeight = 696;

Page({
  canvas: null, // 画布
  ctx: null,
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
        img_width: 0,
        img_height: 0,
        disable_rotate: false, //是否禁用旋转
        disable_ratio: false, //锁定比例
        limit_move: false, //是否限制移动
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

      txtPopHeight: '470rpx', //文字编辑层高度
      isBg: 'bg.img', //背景选择
      editMenu: '', //编辑item的菜单选项
      addImg: 'img.img', //添加图片选择
      //滤镜展示菜单
      filterTitles:[
        '原图', '美肤', '素描', '自然增强', '紫调', '柔焦', '黑白', 'lomo', '暖秋', '木雕'
      ],
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

    imgCardShow: false, //是否开启保存画板照片的标识
    imageUrl: '', //需要下载的画板生成的图片路径

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
        top: 10,
        left: 10,
        display: 'block',
        width: 0,
        height: 0,
      },
      filterOp: '原图',
      originalImgUrl: ''
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

    canvasWidth,
    canvasHeight,
    handleResults:{},
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

  onShow() {
    wx.createSelectorQuery().select('#canvas').node((res) => {
      this.canvas = res.node;
      this.canvas.width = canvasWidth
      this.canvas.height = canvasHeight
      this.ctx = this.canvas.getContext("2d")
    }).exec();
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
    let that = this;
    const type = e.currentTarget.dataset['type'];
    var menuShow = type
    if(type!='sysScale' && type!='sysSave' && type!='sysClear'){
      if (type==this.data.menu.menuShow) {
        this.setData({'menu.menuShow': ''})
        return
      }
    }
    
    var menu = this.data.menu
    switch(type) {
      case 'txt':
        menu.secondMenu = 'txt.edit'
        menu.txtPopHeight = '480rpx'
        menu.showColorPicker = false
        break;
      case 'img':
        var left = e.target.offsetLeft
        menu.menuShowLeft = left+5;
      case 'sys':
        break;
      case 'doodle':
        menu.mainPageShow = 'doodle';
      case 'layer':
        this.getSortList();
      case 'sysScale':
        this.setData({'scaleStyles.display': this.data.scaleStyles.display=='block'?'none':'block'});
        break;
      case 'sysSave':
        CanvasDrag.downloadImg();
        break;
      case 'sysClear':
        wx.showModal({
          content: '是否确定清空画布内容？',
          confirmText: "确认",
          cancelText: "取消",
          success: function (res) {
            CanvasDrag.clearCanvas();
            that.hideMenu();
          }
        });
        break;
      default:
        menu.secondMenu = ''
    }
    menu.menuShow = menuShow
    this.setData({menu: menu})
    if(type=='sysScale' || type=='sysSave' || type=='sysClear'){
      setTimeout(()=>{that.hideMenu();}, 1000);
    }
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
      } else if(type=='cancel') {
        resolve();
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
        case 'cancel':
          setTimeout(()=>{that.setData({'menu.secondMenu':''});}, 1000);
          that.setData({'menu.menuShow': ''});
          break;
      }
    });
  },
  // 在海报组件中调用隐藏主菜单
  hideMenu() {
    this._initMenu();
  },
  //初始化菜单
  _initMenu(name='mainPage') {
    this.setData({
      'menu.menuShow': '',
      'menu.secondMenu':'',
      'menu.mainPageShow': name
    });
  },
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
  changeTab(e){
    let type = e.currentTarget.dataset['type'];
    let typeName = type.split(".")[0];
    if(typeName=='ri') {
      //替换操作
      this.setData({'menu.editMenu': type});
    } else if(typeName=='bg') {
      //更换画板背景图操作
      this.setData({'menu.isBg': type});
    } else if(typeName=='img') {
      this.setData({'menu.addImg': type});
    }
  },
  //背景选照片
  getBgPhoto(e){
    let type = e.currentTarget.dataset['type'];
    let that = this;
    if(type=='bg.camera')
      that.setData({'menu.camera.use': 'bg'});
    else if(type=='bg.cancel'){
      that.setData({'menu.menuShow': '', 'menu.secondMenu':type});
      setTimeout(()=>{that.setData({'menu.secondMenu':''});}, 1000);
      return;
    }
    let typeName = type.split('.')[1];
    this.baseGetPhoto(typeName).then((url)=>{
      switch(typeName){
        case 'camera':
          that.setData({'menu.carema.showCamera': true, 'menu.menuShow': '', 'menu.secondMenu':type});
          break;
        case 'album':
          that.setData({'bg.img': url});
          that.setData({'menu.menuShow': '', 'menu.secondMenu':type});
          break;
        case 'talk':
          that.setData({'bg.img': url});
          that.setData({'menu.menuShow': '', 'menu.secondMenu':type});
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
    wx.showToast({
      title: '截图成功',
    })
    let that = this;
    ImageCropper.getImg((newUrl)=>{
      that.replaceItem(newUrl);
      that.setData({'menu.menuShow': ''});
    });
  },
  cropRecover() {
    ImageCropper.imgReset();
  },
  clickcut(e) {
    //点击裁剪框阅览图片
    wx.previewImage({
        current: e.detail.url, // 当前显示图片的http链接
        urls: [e.detail.url] // 需要预览的图片http链接列表
    })
  },

  //-----------------------------------涂鸦动作 begin---------------------------------------------------//
  goBackFromDoodle() {
    this.setData({
      'menu.menuShow': '',
      'menu.mainPageShow': 'mainPage' 
    });
  },
  //-----------------------------------涂鸦动作 end---------------------------------------------------//

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
        } else if(use=='ri'){
          //图片替换功能
          this.replaceItem(res.tempImagePath);
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
  closePopEdit() {
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
    this.closePopEdit()
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
    this.closePopEdit()
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
        this.setData({'menu.showColorPicker': true, 'menu.txtPopHeight':'650rpx'});
        break;
      case 'txt.background':
        this.setData({'menu.txtPopHeight':'795rpx'});
        break;
      case 'txt.shadow':
        this.setData({'menu.txtPopHeight':'935rpx'});
        break;
      default:
        this.setData({'menu.txtPopHeight':'550rpx'});
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
    if(typeof(event.detail.id) == "undefined") return;
    // 调用画板组件的隐藏item方法
    CanvasDrag.hideItem(event.detail.id);
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
  clickItem(e){
    let page = 'editImgPage';
    let item = e.detail.item;
    let newItem;
    if(item.type=='text') {
      page = 'editTxtPage';
    } else {
      newItem = this.data.itemImg;
      newItem.css.width = item.css.width;
      newItem.css.height = item.css.height;
      newItem.css.top = item.css.top;
      newItem.css.left = item.css.left;
      newItem.scale = item.scale;
      newItem.originalImgUrl = item.url;
      this.setData({itemImg: newItem});
    }

    this.setData({
      'menu.mainPageShow': page,
      'menu.menuShow': '',
    });
  },
  //复制
  copyItem() {
    let item = CanvasDrag.getItem();
    let newItem = {css:{}}
    newItem.active = false;
    newItem.css.top = OFFSET + item.css.top;
    newItem.css.left = OFFSET + item.css.left;
    newItem.type = 'image';
    newItem.url = item.url;
    this.setData({
      items: [newItem]
    });
  },
  //替换
  replaceItem(url) {
    let oldItem = CanvasDrag.getItem();
    let newItem = {css:{}}
    newItem.css.top = OFFSET + oldItem.css.top;
    newItem.css.left = OFFSET + oldItem.css.left;
    newItem.type = 'image';
    newItem.url = url;
    newItem.id = oldItem.id;
    newItem.active = true;
    CanvasDrag.replaceItem(newItem);
  },
  //替换图片编辑
  replaceImg(e){
    let type = e.currentTarget.dataset['type'];
    let that = this;
    that.setData({'menu.secondMenu':type});
    if(type=='ri.camera')
      that.setData({'menu.camera.use': 'ri'});
    let typeName = type.split('.')[1];
    this.baseGetPhoto(typeName).then((url)=>{
      switch(typeName){
        case 'camera':
          that.setData({'menu.carema.showCamera':true, 'menu.menuShow':'', 'menu.secondMenu':type});
          break;
        case 'album':
          that.replaceItem(url);
          break;
        case 'talk':
          that.replaceItem(url);
          break;
      }
    });
    setTimeout(()=>{that._initMenu('editImgPage');}, 2000);
  },
  //编辑菜单
  showEditMenu(e){
    let type = e.currentTarget.dataset['type'];
    let mainPage = 'editImgPage';
    switch(type){
      case "toMainPage":
        mainPage = 'mainPage';
        break;
      case "copeImg":
        this.copyItem();
        break;
      case "replaceImg":
        this.setData({
          'menu.editMenu': 'ri.localImgs'
        });
        break;
      case "recoverSize":
        CanvasDrag.recoverSize();
      case "cropper":
        let itemImg = CanvasDrag.getItem();
        this.setData({
          'menu.cropper.src': itemImg.url,
          'menu.cropper.img_width': itemImg.css.width,
          'menu.cropper.width': itemImg.css.height,
          'menu.cropper.height': itemImg.css.height,
        });
      default:
        break;
    }
    this.setData({
      'menu.mainPageShow': mainPage,
      'menu.menuShow': type
    });
  },
  //滤镜
  filterImg(e) {
    let that = this;
    let itemImg = CanvasDrag.getItem();
    let originalImgUrl = itemImg.originalImgUrl=='' ? itemImg.url : itemImg.originalImgUrl;
    itemImg.originalImgUrl = itemImg.url;
    let filter = e.currentTarget.dataset.type;
    that.setData({'itemImg.filterOp': filter});

    if(filter=='原图') {
      itemImg.url = originalImgUrl;
      CanvasDrag.replaceItem(itemImg);
      that.setData({'itemImg.url': originalImgUrl});
      return;
    }

    if(that.data.handleResults.hasOwnProperty(filter)) {
      that.setData({
        'itemImg.url': that.data.handleResults[filter+"-"+itemImg.id]
      });
      return;
    }

    wx.getImageInfo({
      src: originalImgUrl,
      success: resInfo => {
        canvasWidth = resInfo.width; //宽度
        canvasHeight = resInfo.height; //高度
        that.setData({
          canvasWidth: canvasWidth,
          canvasHeight: canvasHeight,
        });
        that.canvas.width = canvasWidth;
        that.canvas.height = canvasHeight;
        const image = that.canvas.createImage();
        image.src = originalImgUrl;
        image.onload = () => {
          that.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          that.ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
          that._handleFilter(itemImg, that, canvasWidth, canvasHeight, filter);
        };
      }
    })
    
  },

  _handleFilter(itemImg, that, canvasWidth, canvasHeight, filter) {
    const imageData = that.ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let alloyImage = new AlloyImage(imageData);
    wx.showLoading({
      title: '处理中',
      mask: true
    })
    let result = alloyImage.reflect(filter);
    wx.hideLoading();
    that.ctx.putImageData(result, 0, 0);

    wx.canvasToTempFilePath({
      canvas: that.canvas,
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      destWidth: canvasWidth,
      destHeight: canvasHeight,
      fail: err => {
      },
      success: function (res) {
        // console.log("res: " + JSON.stringify(res), res);
        that.setData({
          'itemImg.url': res.tempFilePath,
        });
        // 缓存
        that.data.handleResults[filter+"-"+that.data.itemImg.id] = res.tempFilePath;
        itemImg.url = res.tempFilePath;
        CanvasDrag.replaceItem(itemImg);
      }
    }, that);
    
  },

  //-----------------------------------点击图片操作 end------------------------------------------------//
})