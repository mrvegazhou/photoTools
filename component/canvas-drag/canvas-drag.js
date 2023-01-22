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

//
CanvasDrag.flushItemSort = (list) => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().flushItemSort(list);
  }
};

export default CanvasDrag;