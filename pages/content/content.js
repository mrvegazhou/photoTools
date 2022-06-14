const app = getApp()

Page({
  data: {
    imgList: [
      "https://cdn.bigquant.com/community/letter_avatar_proxy/v2/letter/h/b38774/240.png",
      "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3139953554,3011511497&fm=26&gp=0.jpg",
      "https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1022109268,3759531978&fm=26&gp=0.jpg"
    ]
  },
  onLoad(options) {
    console.log(options.navTitle)
    wx.setNavigationBarTitle({
      title: "资讯-" + options.navTitle
    })

    // let txt = "为啥测试<img1>在这里顶顶顶顶<img2><img3><img4>";
    // var reg = /\<img[0-9]\>/mg
    // // var result = txt.replace(reg, '<image></image>')
    // var result = txt.replace(reg, function (a, b, c) {
    //   console.log(a, b, c); 
    //   return 'ok';
    // })
    // console.log(result, "----")
  },

  //预览图片，放大预览
  preview(event) {
    console.log(event.currentTarget.dataset.src)
    let currentUrl = event.currentTarget.dataset.src
    wx.previewImage({
      current: currentUrl, // 当前显示图片的http链接
      urls: this.data.imgList // 需要预览的图片http链接列表
    })
  }
})
