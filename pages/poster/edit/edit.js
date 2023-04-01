import ImageCropper from '../../../component/image-cropper/cropper';
import MyDoodleCpt from '../../../component/doodle/doodle';
import CanvasDrag from '../../../component/canvas-drag/canvas-drag';
import AlloyImage from "../../../component/alloyimage/alloyImage.js"
import { CONFIG } from '../../../utils/config'
const util = require("../../../utils/util");
var apiRequest = require('../../../utils/api.js')
var screenWidth;
var appInstance = getApp();
const families = appInstance.globalData.fontFaceList;

var openStatus = true;
const OFFSET = 10;
let canvasWidth = 1239;
let canvasHeight = 696;
let dictShapes = {
  'circle':'圆形', 'star':'五角星', 'triangle': '三角形'
};
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
      dictShapes: dictShapes,
      showColorPicker: false, // 颜色选择器
      colorData: {
        transparency: 1,
        color: '#333333',
        done: false,
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
      fontFamilyDone: false, //判断是否点击过选择动作

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

      txtPopHeight: '480rpx', //文字编辑层高度
      isBg: 'bg.img', //背景选择
      editMenu: '', //编辑item的菜单选项
      addImg: 'img.img', //添加图片选择
      //滤镜展示菜单
      filterTitles:[
        '原图', '美肤', '素描', '自然增强', '紫调', '柔焦', '黑白', 'lomo', '暖秋', '木雕'
      ],
      imgTrans: 100, //图片透明化
      txtEditType: 'add',
      
      broadwise:false, //是否图片横向生成

      secondMenuImgH: '55vh', //加图弹层的高度设置
    },
    searchImgs: {
      imgList: [],
      //分列
      colLeft: [],
      colRight: [],
      //两列高度
      colHeightLeft :0,
      colHeightRight :0,
      fullScreen: false,
      imgWidth: 0,
      loadTime: '',
      hidden: true,
      height: '450rpx',
      //数据是否正在加载中，避免用户瞬间多次下滑到底部
      loadingData: false,
      page: 1,
      inputVal: '',
      info: '加载数据中...'
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
      text:'',
      id: null,
      active: null,
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
      originalImgUrl: '',
      originalImgUrl2: '',
      id: null,
      active: null,
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
    this.getFontFamilySelect();
    screenWidth = wx.getSystemInfoSync().screenWidth;
    this.setData({
      'searchImgs.imgWidth': 0.495 * screenWidth
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.createSelectorQuery().select('#canvas').node((res) => {
      this.canvas = res.node;
      this.canvas.width = canvasWidth
      this.canvas.height = canvasHeight
      this.ctx = this.canvas.getContext("2d")
    }).exec();
    this.getFonts();
  },

  onShow() {
  },

  getFonts() {
    for(let i=0; i<families.length; i++) {
      let obj = families[i];
      if(obj.family!='系统默认字体' && obj.url!='') {
        wx.loadFontFace({
          global:true,
          scopes: ['webview', 'native'],
          family: `${obj.family}`,
          source: `url("${obj.url}")`,
          success(res) {
            console.log(res.status)
          }
        });
      }
    }
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
      util.userPermission('scope.writePhotosAlbum', '检测到您没打开保存图片到相册功能权限，是否去设置打开？').then(
        ()=>{
          openStatus = true;
          that.onSaveImageToPhotosAlbum(that.data.imageUrl);
        }, 
        ()=>{
          // 如果用户拒绝过或没有授权，则再次打开授权窗口
          openStatus = false
          wx.showToast({
            title: '请设置允许访问相册',
            icon: 'none'
          });
        }
      ).catch(()=>{
        // 拒绝、取消授权的操作
      });
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
  //文字和图片初始值
  initItem() {
    let itemText = {
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
    };
    let itemImg = {
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
    };
    this.setData({
      itemText: itemText,
      itemImg: itemImg
    });
  },
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
        this.initItem();
        menu.secondMenu = 'txt.edit'
        menu.txtPopHeight = '480rpx'
        menu.showColorPicker = false
        break;
      case 'img':
        this.initItem();
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
        // CanvasDrag.downloadImg();
        break;
      case 'sysClear':
        wx.showModal({
          content: '是否确定清空画布内容？',
          confirmText: "确认",
          cancelText: "取消",
          success: function (res) {
            if (res.confirm) {
              that.setData({'items':[]});
              CanvasDrag.clearCanvas();
              that.hideMenu();
            }
          }
        });
        break;
      default:
        menu.secondMenu = ''
    }
    menu.menuShow = menuShow
    this.setData({menu: menu})
    if(type=='sysScale' || type=='sysClear'){
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
  //保存画板操作
  cancelCanvasSave(){
    this.setData({
      'menu.menuShow': ''
    });
  },
  confirmCanvasSave(){
    if(this.data.menu.broadwise) {
      CanvasDrag.setOverturn();
    }
    CanvasDrag.downloadImg();
    this.setData({
      'menu.menuShow': '',
      'menu.broadwise': false
    });
  },
  setBroadwise() {
    this.setData({
      'menu.broadwise': !this.data.menu.broadwise
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
  //保存涂鸦图片到画板
  saveImg2Canvas(event) {
    if(typeof(event.detail.imgPath) == "undefined") return;
    let itemImg = this.data.itemImg;
    itemImg.url = event.detail.imgPath;
    this.setData({
      'items': [itemImg],
      'menu.mainPageShow': 'mainPage',
      'menu.menuShow': ''
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
  editTxtAdd() {
    this.editTxtCommon('add');
  },
  editTxtUpdate() {
    this.editTxtCommon('update');
  },
  editTxtCommon(op) {
    let item = JSON.parse(JSON.stringify(this.data.itemText));
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
    if(op=='add') {
      this.setData({
        items: [item]
      });
    } else {
      let oldItem = CanvasDrag.getItem();
      if(typeof(oldItem) == "undefined" || oldItem==null) {
        this.setData({
          items: [item]
        });
      } else {
        item.id = oldItem.id;
        item.css.left = oldItem.css.left;
        item.css.top = oldItem.css.top;
        item.active = oldItem.active;
        item.css.color = this.data.menu.colorData.done==false ? oldItem.css.color : this.data.menu.colorData.color;
        item.css.fontFamily = this.data.menu.fontFamilyDone==false ? oldItem.css.fontFamily : this.data.menu.fontFamilyShowVal;
        CanvasDrag.replaceItem(item);
      }
      
    }
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
      'menu.colorData.done': true,
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
      'menu.fontFamilyShowVal': families[index]['family'],
      'menu.fontFamilyIndex': index,
      'menu.fontFamilyDone': true,
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
    this.setData({
      'menu.fontFamilyShowVal': fontFamilySelect[fontFamilyIndex]['family']
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
      'menu.colorData.color': '#333333',
      'menu.colorData.done': false,
      'menu.fontFamilyDone': false,
      'menu.txtEditType': 'add'
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
      page = 'editTextPage';
      newItem = this.data.itemText;
      newItem.active = item.active;
      newItem.id = item.id;
      newItem.scale = item.scale;
      let css = Object.assign({}, item.css);
      newItem.css = css;
      this.setData({itemText: newItem});
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
  copyItem(type) {
    let item = CanvasDrag.getItem();
    let newItem = {css:{}}
    newItem.active = false;
    newItem.css.top = OFFSET + item.css.top;
    newItem.css.left = OFFSET + item.css.left;
    newItem.type = type;
    if(type == 'image') {
      newItem.url = item.url;
    } else {
      let css = Object.assign({}, item.css);
      newItem.css = css;
      newItem.text = item.text;
    }
    
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
    let that = this;
    if(type==this.data.menu.menuShow) {
      this.setData({
        'menu.mainPageShow': mainPage,
        'menu.menuShow': ''
      });
      return;
    }
    switch(type){
      case "toMainPage":
        mainPage = 'mainPage';
        break;
      case "copeImg":
        this.copyItem('image');
        setTimeout(()=>{that.setData({
          'menu.menuShow=': ''
        });}, 2000);
        break;
      case "replaceImg":
        this.setData({
          'menu.editMenu': 'ri.localImgs'
        });
        break;
      case "recoverSize":
        CanvasDrag.recoverSize();
        setTimeout(()=>{that.setData({
          'menu.menuShow=': ''
        });}, 2000);
        break;
      case "cropper": //截图功能
        let itemImg = CanvasDrag.getItem();
        this.setData({
          'menu.cropper.src': itemImg.url,
          'menu.cropper.img_width': itemImg.css.width,
          'menu.cropper.width': itemImg.css.height,
          'menu.cropper.height': itemImg.css.height
        });
        break;
      case "matting":

        break;
      case "shape":

        break;
      case 'upFlip':
        this.flip('up');
        break;
      case 'inverseFlip':
        this.flip('inverse');
        break;
      case "transparent":
        this.transImg(0.3);
        break;
      case "adjust":
        break;
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
        that.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
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
      quality: 1,
      fail: err => {
      },
      success: function (res) {
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

  //图片透明化
  transImg(alpha) {
    let that = this;
    let itemImg = CanvasDrag.getItem();
    let url = itemImg.url;
    wx.showLoading({
      title: '处理中',
      mask: true
    });
    wx.getImageInfo({
      src: url,
      success: resInfo => {
        canvasWidth = resInfo.width; //宽度
        canvasHeight = resInfo.height; //高度
        that.setData({
          canvasWidth: canvasWidth,
          canvasHeight: canvasHeight,
        });
        that.canvas.width = canvasWidth;
        that.canvas.height = canvasHeight;
        that.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        const image = that.canvas.createImage();
        image.src = url;
        image.onload = () => {
          that.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          that.ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
          var imgData = that.ctx.getImageData(0, 0, canvasWidth, canvasHeight);
          for(var i = 0 , len = imgData.data.length ; i < len ; i += 4 ) {
            // 改变每个像素的透明度
            imgData.data[i + 3] = imgData.data[i + 3] * alpha;
          }
          that.ctx.putImageData(imgData, 0, 0);
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
              that.setData({
                'itemImg.url': res.tempFilePath,
              });
              itemImg.url = res.tempFilePath;
              CanvasDrag.replaceItem(itemImg);
            }
          }, that);
          wx.hideLoading();
        };
      }
    });
  },
  //图片透明度设置滑动
  changeImgTrans(e) {
    let alpha = e.detail.value;
    this.setData({
      'menu.imgTrans': alpha
    })
  },
  //确定透明化图片
  imgTransOk() {
    let alpha = this.data.menu.imgTrans;
    this.transImg(alpha/100);
  },
  imgTransCancel() {
    this.setData({
      'menu.menuShow': '',
      'menu.imgTrans': 100,
    });
  },

  flip(type) {
    let item = CanvasDrag.getItem();
    if(type=='up') {
      item.angle += 10;
    } else {
      item.angle -= 10;
    }
    item.active = true;
    CanvasDrag.replaceItem(item);
  },

  shapeImg(e) {
    let shapeType = e.currentTarget.dataset.type;
    switch(shapeType) {
      case "circle":
        this.circleImg(shapeType);
        break;
      case "triangle":
        this.triangleImg(shapeType);
        break;
      case "star":
        this.startImg(shapeType);
        break;
      default:
        break;
    }
  },
  // 图片裁剪为圆形
  circleImg(type) {
    let that = this;
    let itemImg = CanvasDrag.getItem();
    let url = itemImg.url;
    if(dictShapes.hasOwnProperty(itemImg.filterOp)) {
      url = itemImg.originalImgUrl2;
    } else {
      itemImg.originalImgUrl2 = url;
    }
    itemImg.filterOp = type;
    
    util.canvasHandleImg(that, url, function(path){
      that.setData({
        'itemImg.url': path,
      });
      itemImg.url = path;
      CanvasDrag.replaceItem(itemImg);
    }).then(resInfo => {
      let radius = Math.min(resInfo.width, resInfo.height) / 2;
      let cx = resInfo.width / 2;
      let cy = resInfo.height / 2;
      that.ctx.beginPath()
      that.ctx.arc(cx, cy, radius, 0, 2 * Math.PI, false);
      that.ctx.clip();
    }).catch(error => {
      console.log(error);
    });
  },
  //五角星裁剪图片
  startImg(type) {
    let that = this;
    let itemImg = CanvasDrag.getItem();
    let url = itemImg.url;
    if(dictShapes.hasOwnProperty(itemImg.filterOp)) {
      url = itemImg.originalImgUrl2;
    } else {
      itemImg.originalImgUrl2 = url;
    }
    itemImg.filterOp = type;
    wx.showLoading({
      title: '处理中',
      mask: true
    });
    util.canvasHandleImg(that, url, function(path){
      that.setData({
        'itemImg.url': path,
      });
      itemImg.url = path;
      CanvasDrag.replaceItem(itemImg);
    }).then(resInfo => {
      let R = Math.min(resInfo.width, resInfo.height) / 2;
      let cx = resInfo.width / 2;
      let cy = resInfo.height / 2;
      var r = R / 2;
      util.drawStar(that.ctx, R, r, 20, cx, cy);
      that.ctx.clip();
    }).catch(error => {
      console.log(error);
    });
  },
  //三角形裁剪图片
  triangleImg(type) {
    let that = this;
    let itemImg = CanvasDrag.getItem();
    let url = itemImg.url;
    if(dictShapes.hasOwnProperty(itemImg.filterOp)) {
      url = itemImg.originalImgUrl2;
    } else {
      itemImg.originalImgUrl2 = url;
    }
    itemImg.filterOp = type;
    wx.showLoading({
      title: '处理中',
      mask: true
    });
    util.canvasHandleImg(that, url, function(path){
      that.setData({
        'itemImg.url': path,
      });
      itemImg.url = path;
      CanvasDrag.replaceItem(itemImg);
    }).then(resInfo => {
      let cx = resInfo.width;
      let cy = resInfo.height;
      that.ctx.beginPath(); 
      that.ctx.moveTo(cx, 0); 
      that.ctx.lineTo(0, cy);
      that.ctx.lineTo(0, 0); 
      that.ctx.clip();
    }).catch(error => {
      console.log(error);
    });
  },

  //-----------------------------------点击图片操作 end------------------------------------------------//
  //-----------------------------------点击文字操作 start----------------------------------------------//
  showEditTypeMenu(e) {
    let type = e.currentTarget.dataset['type'];
    let mainPage = 'editTextPage';
    switch(type) {
      case "toMainPage":
        mainPage = 'mainPage';
        break;
      case 'recoverText': //取消文字样式
        CanvasDrag.recoverText();
        break;
      case 'copeText': //cope文字
        this.copyItem('text');
        break;
      case 'editExistedText': //编辑文字
        this.editExistedText('txt.edit');
        break;
      case 'editExistedTextColor':
        this.editExistedText('txt.color');
        break;
      case 'editExistedTextCss':
        this.editExistedText('txt.css');
        break;
      case 'editExistedTextBgColor':
        this.editExistedText('txt.background');
        break;
      case 'editExistedTextShadow':
        this.editExistedText('txt.shadow');
        break;
      case 'editExistedTextAdjust':
        this.setData({
          'menu.menuShow': 'adjust'
        });
        break;
      case 'upFlip':
        this.flip('up');
        break;
      case 'inverseFlip':
        this.flip('inverse');
        break;
      default:
        break;
    }
    this.setData({
      'menu.mainPageShow': mainPage
    });
  },
  editExistedText(editType) {
    let itemText = CanvasDrag.getItem();
    if(!itemText || typeof itemText==='undefined') {
      return;
    }
    if(editType=='txt.color') {
      this.setData({
        'menu.txtPopHeight':'650rpx',
        'menu.menuShow': 'txt',
        'menu.showColorPicker': true,
        'itemText': itemText
      });
    } else if(editType=='txt.background') {
      this.setData({
        'menu.txtPopHeight':'795rpx',
        'menu.menuShow': 'txt',
        'menu.secondMenu': editType,
        'itemText': itemText,
        'menu.txtEditType': 'update'
      });
    } else {
      this.setData({
        'menu.txtPopHeight': '550rpx',
        'menu.menuShow': 'txt',
        'menu.secondMenu': editType,
        'itemText': itemText,
        'menu.txtEditType': 'update'
      }); 
    }
  },
  //微调动作
  adjustPos(e) {
    let item = CanvasDrag.getItem();
    let type = e.currentTarget.dataset['type'];
    if(!item || typeof item==='undefined') {
      return;
    }
    switch(type) {
      case 'top':
        if(item.css.top>0) {
          item.css.top -= 1;
        }
        break;
      case 'down':
        item.css.top += 1;
        break;
      case 'left':
        if(item.css.left>0) {
          item.css.left -= 1;
        }
        break;
      case 'right':
        let size = CanvasDrag.getCanvasSize();
        if(item.css.left<size.width) {
          item.css.left += 1;
        }
        break;
    }
    item.active = true;
    CanvasDrag.replaceItem(item);
  },
  //-----------------------------------点击文字操作 end------------------------------------------------//
  //-----------------------------------图片搜索功能 begin----------------------------------------------//
  searchFullScreen() {
    if(this.data.searchImgs.fullScreen) {
      this.setData({
        'menu.secondMenuImgH': '55vh',
        'searchImgs.fullScreen': false
      });
    } else {
      this.setData({
        'menu.secondMenuImgH': '90%',
        'searchImgs.fullScreen': true,
        'searchImgs.height': '90%'
      });
    }
  },
  //获取input内容
  getSearchTags(e) {
    this.setData({
      'searchImgs.inputVal': e.detail.value
    });
  },
  searchImgs() {
    this.setData({
      'searchImgs.page': 1
    });
    this.searchList(1);
  },
  //搜索动作
  searchList(page) {
    let that = this;
    this.setData({
      'searchImgs.loadingData': true
    });
    //加载提示
    wx.showLoading({
      title: '正在加载...',
    });
    if(page === 1){
      that.setData({
        //设置加载时间
        'searchImgs.loadTime': new Date().getTime()
      });
    }
    let datas = {
      tags: that.data.searchImgs.inputVal,
      page: page,
      time: that.data.searchImgs.loadTime
    };
    apiRequest.searchImgs(datas, {
      successFn: (res)=>{
        //隐藏加载提示
        wx.hideLoading();
        var status = res.data.code;
        if(status == 200) {
          //判断当前页page是否是第一页，如果是第一页，那么设置List为空
          if(page === 1) {
            that.setData({
              'searchImgs.colLeft': [],
              'searchImgs.colRight': [],
              'searchImgs.imgList': []
            });
          }
          var imgList = res.data.data.list;
          var info = '加载数据中...';
          if() {
            info = '没有数据'; 
          }
          var newImgList = that.data.searchImgs.imgList;
          var allImgList = newImgList.concat(imgList)
          //判断视频放在哪一列
          var colLeft = that.data.searchImgs.colLeft;
          var colRight = that.data.searchImgs.colRight;
          for (var i = 0; i < imgList.length; i++) {
            //返回1放左列,0放右列
            var result = that.imageLoad(imgList[i])
            imgList[i].url = CONFIG.API_URL.WECHAT_STATIC_IMG+'/'+imgList[i].url;
            if(1==result) {
              colRight.push(imgList[i]);
            } else {
              colLeft.push(imgList[i]);
            }
          }
          that.setData({
            'searchImgs.imgList': allImgList,
            'searchImgs.colLeft': colLeft,
            'searchImgs.colRight': colRight,
            'searchImgs.page': page,
            'searchImgs.loadingData': false,
            'searchImgs.hidden': true,
            'searchImgs.info': info
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      },
      failFn: (res)=>{
        wx.showToast({
          title: '连接超时...',
          icon: "none"
        });
        that.setData({
          'searchImgs.hidden': true,
          'searchImgs.loadingData': false
        });
      }
    });
  },

  imageLoad(imgInfo) {
    let colHeightLeft = this.data.searchImgs.colHeightLeft;
    let colHeightRight = this.data.searchImgs.colHeightRight;
    let imgHeight = imgInfo.height ? imgInfo.height : 0; //图片原始高度
    if(colHeightLeft <= colHeightRight) {
      //放左列
      colHeightLeft = colHeightLeft + imgHeight;
      this.setData({
        'searchImgs.colHeightLeft': colHeightLeft
      });
      return 1;
    } else {
      //放右列
      colHeightRight = colHeightRight + imgHeight;
      this.setData({
        'searchImgs.colHeightRight': colHeightRight
      });
      return 2;
    }
  },
  
  searchMoreImgs(e) {
    let that = this;
    let hidden = this.data.searchImgs.hidden,
    loadingData = this.data.searchImgs.loadingData;
    if(hidden) {
      this.setData({
        'searchImgs.hidden': false
      });
    }
    if(loadingData) {
      return;
    }
    this.setData({
      'searchImgs.loadingData': true
    });
    wx.showLoading({
      title: '数据加载中...',
    });
    setTimeout(function() {
      let page = that.data.searchImgs.page + 1;
      that.setData({
        'searchImgs.page':  page
      });
      that.searchList(page);
      wx.hideLoading();
    }, 1000);
  },
  //-----------------------------------图片搜索功能 end------------------------------------------------//
})