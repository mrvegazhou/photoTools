//index.js
//获取应用实例
const app = getApp()
var apiRequest = require('../../utils/api.js')
var upRefreshFunction = require('../../template/pullUpRefresh/pullUpRefresh.js')
const titles = ['时事新闻', '西部时报', '专家解读']
var upRefreshVal = {
  loadmoreHidden: true,
  loadmoreText: "加载中...",
  isNeedLoadmore: true,
  upRefreshLoading: false,
  upRefreshLoaded: false,
  isEmpty: false
}
Page({
  data: {
    //下拉刷新
    refreshing: false,
    refreshed: false,
    dataArr: {
      0: [], 1: [], 2:[]
    },
    activeIndex: 0,
    loadingModalHide: true,
    height: wx.getSystemInfoSync().windowHeight,
    pageFirstId: {
      0: 1, 1: 1, 2: 1
    },
    pageLastId: {
      0: 2, 1: 2, 2: 2
    },
    scrollTopNums: {
      0: 0, 1: 0, 2: 0
    },
    
    //上拉刷新属性
    upRefresh: {
      0: upRefreshVal, 1: upRefreshVal, 2: upRefreshVal
    },
    //广告
    topAdvs: [],
    navTitle: ""
  },

  onLoad: function () {
    //修改title
    wx.setNavigationBarTitle({
      title: "资讯-" + titles[this.data.activeIndex]
    })
    this.setData({
      loadingModalHide: false,
      navTitle: titles[this.data.activeIndex]
    })
    this.getAllNewListDatas()
    this.setData({
      loadingModalHide: true
    })
    this.getTopAdvs()
  },

  // 加载更多
  getUpRefreshList() {
    return new Promise((resolve, reject) => {
      
      let that = this
      let idx = this.data.activeIndex

      if (that.data.upRefresh.upRefreshLoading || that.data.upRefresh[that.data.activeIndex].upRefreshLoaded) {
        resolve();
        return;
      }
      
      this.setData({
        ['upRefresh.' + idx + '.upRefreshLoading']: true
      })
      
      setTimeout(() => {
        //加载新闻数据
        apiRequest.getIndexNews('', {
          datas: {
            type: idx,
            "pageLastId": that.data.pageLastId[idx],
            "pageSize": app.globalData.pageSize
          },
          method: "get",
          successFn: function (res) {
            var arrList = that.data.dataArr[idx]
            var arrNew = res.result.datas.data
            arrList = arrList.concat(arrNew); //合并数组
            that.setData({
              ['upRefresh.' + idx + '.upRefreshLoading']: false,
              ['dataArr.' + idx]: arrList
            })
            //判断后台是否还有数据
            // if (addList.length < this.data.size) {
            //   this.setData({
            //     upRefreshLoaded: true
            //   })
            // }
          }
        })
        resolve();
      }, 500)
    })
  },

  pullDownRefresh: function() {
    let typeId = this.data.activeIndex;
    this.getNewListDatas(typeId, true)
  },
  
  //初次进入获取所有类别的资讯
  getAllNewListDatas: function () {
    this.setData({
      refreshing: false,
      loadingModalHide: false,
    })
    let that = this
    apiRequest.getAllNewListDatas('', {
      datas: {
      },
      method: "post",
      successFn: function (res) {
        var allNews = res.result.datas.data
        that.setData({
          loadingModalHide: true,
          refreshed: true,
          dataArr: allNews
        })
      }
    })
  },

  //获取单项类别的新闻资讯
  getNewListDatas: function (typeId, refreshing) {
    this.setData({
      refreshing: refreshing,
      loadingModalHide: false,
    });
    let that = this;
    
    //加载新闻数据
    apiRequest.getIndexNews('', {
      datas: {
        type: typeId,
        "pageFirstId": that.data.pageFirstId[typeId],
        "pageSize": app.globalData.pageSize
      },
      method: "post",
      successFn: function (res) {
        var arrList = that.data.dataArr[typeId];
        var arrNew = res.result.datas.data; //从此次请求返回的数据中获取新数组
        arrList = arrList.concat(arrNew); //合并数组
        that.setData({
          loadingModalHide: true,
          refreshed: true,
          ['dataArr.' + typeId]: arrList
        })
      }
    })
  },

  onTapNavbar: function (e) {
    this.setData({
      loadingModalHide: false
    });
    this.switchChannel(parseInt(e.target.dataset.index));
    this.setData({
      loadingModalHide: true
    });
    
  },

  switchChannel: function (targetChannelIndex) {
    this.setData({
      activeIndex: targetChannelIndex
    });
    //修改title
    wx.setNavigationBarTitle({
      title: "资讯-" + titles[this.data.activeIndex]
    })
  },

  onTouchstartArticles: function (e) {
    let that = this
    this.setData({
      'startTouchs.x': e.changedTouches[0].clientX,
      'startTouchs.y': e.changedTouches[0].clientY
    });
    let idx = this.data.activeIndex
    var query = wx.createSelectorQuery()
    query.select('#article').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      that.setData({
        ['scrollTopNums.'+idx]: res[1].scrollTop
      })
    })
  },

  onTouchendArticles: function (e) {
    let deltaX = e.changedTouches[0].clientX - this.data.startTouchs.x;
    let deltaY = e.changedTouches[0].clientY - this.data.startTouchs.y;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      let deltaNavbarIndex = deltaX > 0 ? -1 : 1;
      let currentChannelIndex = this.data.activeIndex;
      let navbarShowIndexArray = [0, 1, 2];
      let targetChannelIndexOfNavbarShowIndexArray = navbarShowIndexArray.indexOf(currentChannelIndex) + deltaNavbarIndex;
      if (targetChannelIndexOfNavbarShowIndexArray >= 0 && targetChannelIndexOfNavbarShowIndexArray <= 2) {
        let targetChannelIndex = navbarShowIndexArray[targetChannelIndexOfNavbarShowIndexArray];
        this.switchChannel(targetChannelIndex);
        wx.pageScrollTo({
          scrollTop: this.data.scrollTopNums[targetChannelIndexOfNavbarShowIndexArray],
          duration: 0
        })
      }
    }
  },

  onReachBottom() {
    var that = this;
    let idx = this.data.activeIndex
    if (this.data.upRefresh[idx].isNeedLoadmore==true) {
      upRefreshFunction.loadMore(that, that.getUpRefreshList())
    }
  },

  //广告展示
  getTopAdvs: function() {
    let that = this
    apiRequest.getTopAdvs('', {
      datas: {
        type: "topAdv"
      },
      method: "get",
      successFn: function (res) {
        that.setData({
          topAdvs: res.result.datas.data
        })
      }
    })
  },
  //广告详情页跳转
  navigateAdvDetail: function ({ detail }) {
    wx.navigateTo({
      url: '../detail/detail?id=' + detail.itemid,
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
});
