// component/action-sheet.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    actionShow: Boolean,
    sheetHeight: {
      type: String,
      value: '30%'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    animation: "",
    maskAnimation: '',
    height: '30%'
  },

  ready: function () {
    this.initData();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    cancelAction() {
      this.setData({
        animation: 'hide-action-sheet',
        maskAnimation: 'hide-mask-animation'
      })

      setTimeout(() => {
        this.setData({
          show: false
        })
      }, 300);

      this.triggerEvent('cancel');
    },

    initData: function() {
      let that = this
      this.setData({
        height: that.properties.sheetHeight
      })
    }
  },

  observers: {
    'actionShow': function(newValue) {
      this.setData({
        show: newValue,
        animation: newValue === true ? 'show-action-sheet' : 'hide-action-sheet',
        maskAnimation: newValue === true ? 'show-mask-animation': 'hide-mask-animation'
      })

    }
  }
})
