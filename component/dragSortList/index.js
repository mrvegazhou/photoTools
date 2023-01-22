Component({
  properties: {
    scrollHeight: {
      type: Number,
      value: 260
    },
    titleHight: {
      type: Number,
      value: 36
    },
    optionList: {
      type: Object,
      value: []
    }
  },

  options:{
    multipleSlots:true
  },
  /**
   * 页面的初始数据
   */
  data: {

    movableViewInfo: {
      y: 0,
      showClass: 'none',
      data: {}
    },
    canScroll: true,
    height: 400,
    pageInfo: {
      rowHeight: 48,
      startIndex: null,
      scrollY: true,
      readyPlaceIndex: null,
      startY: 0,
      selectedIndex: null,
    }
  },

  lifetimes: {
    // 在组件实例进入页面节点树时执行
    attached: function () {
      
    },
    ready: function(options) {
      let items = this.data.optionList;
      for (let i = 0; i < items.length; i++) {
        let item = items[i]
        if(item.type=='text') {
          let styles = '';
          if(item.css.background){
            styles += `background-color:${item.css.background};`
          }
          if(item.css.color){
            styles += `color:${item.css.color};`
          }
          if(item.css.fontFamily!='系统默认字体'){
            styles += `font-family:${item.css.fontFamily};`
          }
          if(item.css.fontWeight){
            styles += `font-weight:${item.css.fontWeight};`
          }
          if(item.css.textDecoration){
            styles += `text-decoration:${item.css.textDecoration};`
          }
          if(item.css.textStyle=="stroke"){
            styles += `color: white;-webkit-text-stroke:1rpx ${item.css.color};`
          }
          items[i].styles = styles;
        }
      }
      this.setData({
        optionList: items
      });
    }
  },

  methods: {

    dragStart: function (event) {
      var startIndex = event.currentTarget.dataset.index;

      // 初始化页面数据
      var pageInfo = this.data.pageInfo
      pageInfo.startY = event.touches[0].clientY
      pageInfo.readyPlaceIndex = startIndex
      pageInfo.selectedIndex = startIndex
      pageInfo.scrollY = false
      pageInfo.startIndex = startIndex
     
      this.setData({
        'movableViewInfo.y': pageInfo.startY - (pageInfo.rowHeight / 2)
      })
      // 初始化拖动控件数据
      var movableViewInfo = this.data.movableViewInfo
      movableViewInfo.data = this.data.optionList[startIndex]
      movableViewInfo.showClass = "inline"

      this.setData({
        movableViewInfo: movableViewInfo,
        pageInfo: pageInfo,
        canScroll: false, 
          
      })
    },
  
    dragMove: function (event) {
      var optionList = this.data.optionList
      var pageInfo = this.data.pageInfo
      // 计算拖拽距离
      var movableViewInfo = this.data.movableViewInfo
      var movedDistance = event.touches[0].clientY - pageInfo.startY
      movableViewInfo.y = pageInfo.startY - pageInfo.rowHeight + movedDistance

      // 修改预计放置位置
      var movedIndex = parseInt(movedDistance / pageInfo.rowHeight)
  
      var readyPlaceIndex = pageInfo.startIndex + movedIndex
      if (readyPlaceIndex < 0 ) {
        readyPlaceIndex = 0
      } else if (readyPlaceIndex >= optionList.length){
        readyPlaceIndex = optionList.length - 1
      }
      
      if (readyPlaceIndex != pageInfo.selectedIndex ) {
        var selectedData = optionList[pageInfo.selectedIndex]
  
        optionList.splice(pageInfo.selectedIndex, 1)
        optionList.splice(readyPlaceIndex, 0, selectedData)
        pageInfo.selectedIndex = readyPlaceIndex
      }
      // 移动movableView
      pageInfo.readyPlaceIndex = readyPlaceIndex
      // console.log('移动到了索引', readyPlaceIndex, '选项为', optionList[readyPlaceIndex])
      
      this.setData({
        movableViewInfo: movableViewInfo,
        optionList: optionList,
        pageInfo: pageInfo
      })
    },
  
    dragEnd: function (event) {
      // 重置页面数据
      var pageInfo = this.data.pageInfo
      pageInfo.readyPlaceIndex = null
      pageInfo.startY = null
      pageInfo.selectedIndex = null
      pageInfo.startIndex = null
      pageInfo.scrollY = true
      // 隐藏movableView
      var movableViewInfo = this.data.movableViewInfo
      movableViewInfo.showClass = 'none'
  
      this.setData({
        pageInfo: pageInfo,
        movableViewInfo: movableViewInfo,
      });
      let optionList = this.data.optionList;
      //id排序
      let len =  optionList.length;
      for(var i = 0; i < len; i++){
        optionList[i].id = len;
        len--;
      }
      this.triggerEvent('flushItemSort', {optionList:optionList});
    },

    hideItem: function(e) {
      let index = e.currentTarget.dataset.index;
      let optionList = this.data.optionList;
      optionList[index].css.display = optionList[index].css.display=='block' ? 'none' : 'block';
      this.setData({
        optionList: optionList
      });
      this.triggerEvent('hideItem', {index: index});
    },

    //向page返回optionList
    getOptionList(){
      return this.data.optionList;
    },
  }
})