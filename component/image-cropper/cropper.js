const defaultOptions = {
  selector: '#image-cropper'
};
function ImageCropper(options = {}) {
  options = {
      ...defaultOptions,
      ...options,
  };
  const pages = getCurrentPages();
  const ctx = pages[pages.length - 1];

  const imageCropper = ctx.selectComponent(options.selector);
  delete options.selector;
  return imageCropper;
}
ImageCropper.setTransform = (xy) => {
  const imageCropper = ImageCropper();
  if (!imageCropper) {
        console.error('请设置组件的id="image-cropper"!!!');
  } else {
  return ImageCropper().setTransform(xy);
  }
};
ImageCropper.setAngle = (a) => {
  const imageCropper = ImageCropper();
  if (!imageCropper) {
        console.error('请设置组件的id="image-cropper"!!!');
  } else {
  return ImageCropper().setAngle(ImageCropper().data.angle += a);
  }
};
ImageCropper.getImg = (callback) => {
  return ImageCropper().getImg((obj) => {
    callback(obj.url);
  });
};
ImageCropper.pushImg = (src) => {
  const imageCropper = ImageCropper();
  if (!imageCropper) {
        console.error('请设置组件的id="image-cropper"!!!');
  } else {
  return ImageCropper().pushImg(src);
  }
};
//重置
ImageCropper.imgReset = () => {
  ImageCropper.imgReset();
};
export default ImageCropper;
