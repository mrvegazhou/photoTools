function loadMore(ctx, trigger) {
  if (ctx.data.upRefresh.upRefreshLoaded) {
    ctx.setData({
      'upRefresh.loadmoreHidden': false,
      'upRefresh.loadmoreText': "已经加载完"
    })
    return;
  }
  ctx.setData({
    'upRefresh.loadmoreHidden': false,
    'upRefresh.loadmoreText': "加载中..."
  })
  setTimeout(() => {
    trigger.then(res => {
      ctx.setData({
        'upRefresh.loadmoreHidden': true,
        'upRefresh.upRefreshLoaded': true
      })
    })
  }, 500)
}


module.exports = {
  loadMore: loadMore
}
