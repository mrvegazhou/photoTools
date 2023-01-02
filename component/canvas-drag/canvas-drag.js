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

CanvasDrag.export = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
        console.error('请设置组件的id="canvas-drag"!!!');
    } else {
    return CanvasDrag().export();
    }
};

CanvasDrag.initByArr = (arr) => {
    const canvasDrag = CanvasDrag();
    if (!canvasDrag) {
        console.error('请设置组件的id="canvas-drag"!!!');
    } else {
        return CanvasDrag().initByArr(arr);
    }
};

CanvasDrag.exportJson = () => {
    const canvasDrag = CanvasDrag();
    if (!canvasDrag) {
        console.error('请设置组件的id="canvas-drag"!!!');
    } else {
        return CanvasDrag().exportJson();
    }
};

CanvasDrag.changFontColor = (color) => {
    const canvasDrag = CanvasDrag();
    if (!canvasDrag) {
        console.error('请设置组件的id="canvas-drag"!!!');
    } else {
        return CanvasDrag().changColor(color);
    }
};

CanvasDrag.changeBgColor = (color) => {
    const canvasDrag = CanvasDrag();
    if (!canvasDrag) {
        console.error('请设置组件的id="canvas-drag"!!!');
    } else {
        return CanvasDrag().changeBgColor(color);
    }
};

CanvasDrag.changeBgImage = (bgImage) => {
    const canvasDrag = CanvasDrag();
    if (!canvasDrag) {
        console.error('请设置组件的id="canvas-drag"!!!');
    } else {
        return CanvasDrag().changeBgImage(bgImage);
    }
};

CanvasDrag.undo = () => {
    const canvasDrag = CanvasDrag();
    if (!canvasDrag) {
        console.error('请设置组件的id="canvas-drag"!!!');
    } else {
        return CanvasDrag().undo();
    }
};

CanvasDrag.setVerticalText = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().setVerticalText();
  }
};

CanvasDrag.openMask = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().openMask();
  }
};

CanvasDrag.download = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().download();
  }
};

CanvasDrag.changeTextColor = (color) => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().changeTextColor(color);
  }
};

CanvasDrag.addItems = (items) => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().addItems(items);
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

//保存画板
CanvasDrag.saveCanvas = () => {
  const canvasDrag = CanvasDrag();
  if (!canvasDrag) {
      console.error('请设置组件的id="canvas-drag"!!!');
  } else {
      return CanvasDrag().saveCanvas();
  }
};

export default CanvasDrag;