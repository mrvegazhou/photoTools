const defaultOptions = {
  selector: '#canvas-drag'
};
function CanvasDrag(options = {}) {
  options = {
      ...defaultOptions,
      ...options,
  };

  const pages = getCurrentPages();
  const ctx = pages[pages.length - 1];

  const canvasDrag = ctx.selectComponent(options.selector);
  delete options.selector;

  return canvasDrag;
}

CanvasDrag.undo = () => {
    const canvasDrag = CanvasDrag();
    if (!canvasDrag) {
        console.error('请设置组件的id="canvas-drag"!!!');
    } else {
        return CanvasDrag().undo();
    }
};

CanvasDrag.hideItem = (index) => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
    return CanvasDrag().hideItem(index);
  }
};

CanvasDrag.clearCanvas = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().clearCanvas();
  }
};

//下载画板图片
CanvasDrag.downloadImg = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().downloadImg();
  }
};

//返回items
CanvasDrag.getitemList = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().getitemList();
  }
};

//刷新画板元素
CanvasDrag.flushItemSort = (list) => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().flushItemSort(list);
  }
};

//点击画板单个元素操作
CanvasDrag.clickItem = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().clickItem();
  }
};

//获取选中的item
CanvasDrag.getItem = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().getItem();
  }
};

//替换图片
CanvasDrag.replaceItem = (item) => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().replaceItem(item);
  }
};

//恢复图片尺寸
CanvasDrag.recoverSize = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().recoverSize();
  }
};

//获取画板尺寸
CanvasDrag.getCanvasSize = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
    console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().getCanvasSize();
  }
};

//恢复文本
CanvasDrag.recoverText = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
    console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().recoverText();
  }
};

//改变背景色透明度
CanvasDrag.setBgOpacity = (alpha) => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
    console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().setBgOpacity(alpha);
  }
};

CanvasDrag.setOverturn = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
    console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().setOverturn();
  }
};

export default CanvasDrag;