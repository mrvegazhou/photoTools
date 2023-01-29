Page({

  /**
   * 页面的初始数据
   */
  data: {
    width:0,
    height:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    const query = wx.createSelectorQuery()
        query.select(`#myCanvas1`).fields({
            node: true,
            size: true
        }).exec((res) => {
            let that = this;
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            const dpr = wx.getSystemInfoSync().pixelRatio;
            canvas.width = res[0].width * dpr;
            canvas.height = res[0].height * dpr;
            ctx.scale(dpr, dpr);
            // ctx.beginPath()
            // ctx.rect(20,20,200,200)
            // ctx.rect(100,250,100,100)
            // ctx.rect(250,100,100,200)
            // ctx.fillStyle="#999"
            // ctx.fill()
            const img = canvas.createImage();
            img.src = 'https://cdn.shopifycdn.net/s/files/1/0343/0275/4948/files/png_7261d2f1-9f99-4972-8e2f-7a00535a9f34.png?v=1634027745';
            img.crossOrigin="anonymous";
            img.onload = () => {
              canvas.width = img.width;
               canvas.height = img.height;
              that.setData({
                width: canvas.width,
                height: canvas.height
              });
              ctx.drawImage(img,0,0,canvas.width, canvas.height);
              var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
              const { data, width, height } = imageData;
              let startX = width,
                  startY = height,
                  endX = 0,
                  endY = 0;
                  for (let col = 0; col < width; col++) {
                    for (let row = 0; row < height; row++) {
                      // 网格索引
                      const pxStartIndex = (row * width + col) * 4;
            
                      // 网格的实际像素RGBA
                      const pxData = {
                        r: data[pxStartIndex],
                        g: data[pxStartIndex + 1],
                        b: data[pxStartIndex + 2],
                        a: data[pxStartIndex + 3]
                      };
            
                      // 存在色彩：不透明
                      const colorExist = pxData.a !== 0;
            
                      /*
                      如果当前像素点有色彩
                      startX坐标取当前col和startX的最小值
                      endX坐标取当前col和endX的最大值
                      startY坐标取当前row和startY的最小值
                      endY坐标取当前row和endY的最大值
                      */
                      if (colorExist) {
                        startX = Math.min(col, startX);
                        endX = Math.max(col, startX);
                        startY = Math.min(row, startY);
                        endY = Math.max(row, endY);
                      }
                    }
                  }
                  // 右下坐标需要扩展1px,才能完整的截取到图像
                  endX += 1;
                  endY += 1;
                  let padding = 1;
                  // 加上padding
                  startX -= padding;
                  startY -= padding;
                  endX += padding;
                  endY += padding;

                  // 根据计算的起点终点进行裁剪
                  const query = wx.createSelectorQuery()
                  query.select(`#myCanvas2`).fields({
                      node: true,
                      size: true
                  }).exec((res2) => {
                    const cropCanvas = res2[0].node;
                    const cropCtx = cropCanvas.getContext('2d');
                    cropCanvas.width = endX - startX;
                    cropCanvas.height = endY - startY;
                    that.setData({
                      width2: cropCanvas.width ,
                      height2: cropCanvas.height
                    });

                    cropCtx.drawImage(
                      img,
                      startX,
                      startY,
                      cropCanvas.width,
                      cropCanvas.height,
                      0,
                      0,
                      cropCanvas.width,
                      cropCanvas.height
                    );
  
                  });
                  
            };

            // ctx.beginPath();
            //         ctx.strokeStyle="green";
            //         // ctx.fillStyle = '#fff';
            //         // ctx.rect(minX,minY,winW,winH)    //绘制图像内容区域
            //         console.log(minX,minY,winW,winH, '---s---')
            //         ctx.rect(10,10,50,50)
            //         // ctx.fillRect(123 * dpr,890 * dpr,454 * dpr,0 * dpr)
            //         ctx.stroke();


        })

  },

  
})