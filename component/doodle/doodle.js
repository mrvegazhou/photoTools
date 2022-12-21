const defaultOptions = {
  selector: '#myDoodleCpt'
};
function MyDoodleCpt(options = {}) {
  options = {
      ...defaultOptions,
      ...options,
  };
  const pages = getCurrentPages();
  const ctx = pages[pages.length - 1];

  const myDoodleCpt = ctx.selectComponent(options.selector);
  delete options.selector;
  return myDoodleCpt;
}
MyDoodleCpt.initDoodle = () => {
  const myDoodleCpt = MyDoodleCpt();
  if (!myDoodleCpt) {
        console.error('请设置组件的id="myDoodleCpt"!!!');
  } else {
    return MyDoodleCpt().initDoodle();
  }
};
MyDoodleCpt.move2Post = () => {
  const myDoodleCpt = MyDoodleCpt();
  if (!myDoodleCpt) {
        console.error('请设置组件的id="myDoodleCpt"!!!');
  } else {
    return MyDoodleCpt().move2Post();
  }
};
export default MyDoodleCpt;

