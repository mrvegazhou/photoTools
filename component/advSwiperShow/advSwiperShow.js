Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgList: {
      type: null
    },
    indicatorDots: {
      type: Boolean,
      value: true
    },
    autoplay: {
      type: Boolean,
      value: true
    },
    interval: {
      type: Number,
      value: 5000
    },
    duration: {
      type: Number,
      value: 1000
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgList: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000
  },

  ready: function () {
    this.initData();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initData: function() {
      let that = this
      this.setData({
        imgList: that.properties.imgList,
        indicatorDots: that.properties.indicatorDots,
        autoplay: that.properties.autoplay,
        interval: that.properties.interval,
        duration: that.properties.duration
      })
      if (!this.data.imgList && this.data.imgList.length == 0) {
        console.log("广告banner没有图片")
        return;
      }
    },

    _navigateDetail: function(e) {
      this.triggerEvent('_navigateDetail', e.currentTarget.dataset)
    }
  }
})