let currentEventNews = {
  data: [{
      "id": "1",
      "title": "芳草紫荆社区开展“七彩紫荆 诗韵天府”向日葵花束制作活动",
      "date": "2019-10-21 18:42",
      "category": "国内",
      "authorName": "美丽芳草",
      "url": "http://mini.eastday.com/mobile/191021184240846.html",
      "thumbnailPics": ["http://02imgmini.eastday.com/mobile/20191021/20191021184240_17eba80ba60b453ceaf6cc8c81a22b7c_1_mwpm_03200403.jpg"]
    }, {
      "id": "2",
      "title": "芳草紫荆社区开展“七彩紫荆 诗韵天府”向日葵花束制作活动",
      "date": "2019-10-21 18:42",
      "category": "国内",
      "authorName": "美丽芳草",
      "url": "http://mini.eastday.com/mobile/191021184240846.html",
      "thumbnailPics": ["http://02imgmini.eastday.com/mobile/20191021/20191021184240_17eba80ba60b453ceaf6cc8c81a22b7c_1_mwpm_03200403.jpg"]
    },
    {
      "id": "3",
      "title": "芳草紫荆社区开展“七彩紫荆 诗韵天府”向日葵花束制作活动",
      "date": "2019-10-21 18:42",
      "category": "国内",
      "authorName": "美丽芳草",
      "url": "http://mini.eastday.com/mobile/191021184240846.html",
      "thumbnailPics": ["http://02imgmini.eastday.com/mobile/20191021/20191021184240_17eba80ba60b453ceaf6cc8c81a22b7c_1_mwpm_03200403.jpg"]
    }, {
      "id": "4",
      "title": "广饶县育英幼儿园开展中班级部“叠被子小能手”比赛活动",
      "date": "2019-10-21 18:41",
      "category": "国内",
      "authorName": "大众网东营",
      "url": "http://mini.eastday.com/mobile/191021184102549.html",
      "thumbnailPics": ["http://01imgmini.eastday.com/mobile/20191021/20191021184102_298205f428530274d42b7e91255c82da_1_mwpm_03200403.jpg", "http://01imgmini.eastday.com/mobile/20191021/20191021184102_298205f428530274d42b7e91255c82da_2_mwpm_03200403.jpg", "http://01imgmini.eastday.com/mobile/20191021/20191021184102_298205f428530274d42b7e91255c82da_3_mwpm_03200403.jpg"]
    }, {
      "id": "5",
      "title": "广饶县育英幼儿园开展中班级部“叠被子小能手”比赛活动",
      "date": "2019-10-21 18:41",
      "category": "国内",
      "authorName": "大众网东营",
      "url": "http://mini.eastday.com/mobile/191021184102549.html",
      "thumbnailPics": ["http://01imgmini.eastday.com/mobile/20191021/20191021184102_298205f428530274d42b7e91255c82da_1_mwpm_03200403.jpg", "http://01imgmini.eastday.com/mobile/20191021/20191021184102_298205f428530274d42b7e91255c82da_2_mwpm_03200403.jpg", "http://01imgmini.eastday.com/mobile/20191021/20191021184102_298205f428530274d42b7e91255c82da_3_mwpm_03200403.jpg"]
    }
  ],
  lastId: 5,
  firstId: 1
};

let westNews = {
  data: [{
    "id": "1",
    "title": "先把经济搞上去”！峄城给出了答卷",
    "date": "2019-10-24 00:11",
    "category": "国内",
    "authorName": "大众网东营",
    "url": "http://mini.eastday.com/mobile/191021184102549.html",
    "thumbnailPics": ["http://07imgmini.eastday.com/mobile/20191024/20191024001126_dba535087010f068f7efb761b26b26e1_11_mwpm_03200403.jpg", "http://07imgmini.eastday.com/mobile/20191024/20191024001126_dba535087010f068f7efb761b26b26e1_18_mwpm_03200403.jpg", "http://03imgmini.eastday.com/mobile/20191024/20191024001805_21f1cc7179379f1d3acc721d761c5f35_4_mwpm_03200403.jpg"]
  }],
  lastId: 1,
  firstId: 1
};


let advList = {
  data: [{
    'id': "05941fb62a73cd6a70f7767dea64cad8",
    'url': "https://img-blog.csdnimg.cn/20200710095315856.jpg",
    'date': "2019-10-24 00:12",
    "title": "仙营街道开展“全国高血压日”宣传活动"
  }, {
    'id': "dd0494e7a7a5615048a8871e6e7c1688",
    'url': "https://img-blog.csdnimg.cn/20200710095417447.jpg",
    'date': "2019-10-24 00:12",
    "title": "镜头对准死角"
  }]
};

let exportReadNews = {
  data: [{
    "id": "1",
    "title": "小区提档升级，居民生活舒心",
    "date": "2019-10-24 00:07",
    "category": "国内",
    "authorName": "星沙时报",
    "url": "http://mini.eastday.com/mobile/191024000739932.html",
    "thumbnailPics": ["http://02imgmini.eastday.com/mobile/20191024/20191024000739_d9ed9d311cd886195dd550c0dbfc4cf0_1_mwpm_03200403.jpg"]
  }],
  lastId: 1,
  firstId: 1
};

let indexAllNews = {
  data: { 0: currentEventNews.data, 1: westNews.data, 2: exportReadNews.data}
}

module.exports = {
  advList: advList,
  westNews: westNews,
  exportReadNews: exportReadNews,
  currentEventNews: currentEventNews,
  indexAllNews: indexAllNews
}