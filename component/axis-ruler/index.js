const defaultStyles = {
  line: '#dbdbdb',   // 刻度颜色
  bginner: '#fbfbfb',  // 前景色颜色
  bgoutside: '#dbdbdb',  // 背景色颜色
  lineSelect: '#6643e7',  // 选中线颜色
  fontColor: '#404040',   // 刻度数字颜色
  fontSize: 4 //字体大小
}
Component({
  options:{
    styleIsolation:'isolated'
  },

  /**
   * 组件的属性列表
   */
  properties: {
    // 最小值
    min: {
      type: Number,
      value: 0
    },
    //最大值
    max: {
      type: Number,
      value: 100
    },
    // 是否开启整数模式
    int: {
      type: Boolean,
      value: false
    },
    // 每个格子的实际行度 （单位px ，相对默认值）
    single: {
      type: Number,
      value: 10
    },
    // 高度
    h: {
      type: Number,
      value: 10
    },
    scroll: { //是否禁止滚动
      type: Boolean,
      value: true
    },
    direction: { //方向
      type: String,
      value: 'horizontal'
    },
    // 当前选中 
    active: {
      type: null,
      value: '0',
    },
    styles: {
      type: Object,
      value: defaultStyles
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    rul: {},
    windowHeight: 0
  },

  ready() {
    const min = parseInt(this.data.min) || 0;
    const max = parseInt(this.data.max) || 100;
    this.setData({ min, max });
    this.init();
  },

  methods: {
    init() {
      // 设置默认值
      const min = this.data.min || 0;
      const max = this.data.max || 0;
      const grid = (max - min) / 10;
      const styles = Object.assign(defaultStyles, this.data.styles);
      this.setData({ grid, styles });

      //  获取节点信息，获取节点宽度
      var query = this.createSelectorQuery().in(this)
      query.select('#scale-wrapper').boundingClientRect((res) => {
        res.top // 这个组件内 #the-id 节点的上边界坐标
      }).exec((e) => {
        this.setData({ windowWidth: e[0].width });
        this.setData({ windowHeight: e[0].height });
      })

    },
  }
})