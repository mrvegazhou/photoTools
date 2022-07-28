'use strict';
const API_BASE_URL = "http://192.168.3.3:5000";
const CONFIG = {
  API_BASE_URL: API_BASE_URL,
  API_URL: {
    WECHAT_LOGIN: API_BASE_URL + "/wechat/auth/login",
    WECHAT_CHECK_OPENID: API_BASE_URL + "/wechat/auth/check",
    WECHAT_FWECHAT_FACE_IMG_MATTING: API_BASE_URL + "/idCardPhoto/photo/faceImgMatting",
    WECHAT_IMAGE_COMPOSE: API_BASE_URL + "/idCardPhoto/photo/imageCompose",
    WECHAT_STATIC_IMG: API_BASE_URL + '/static/page/img'
  },
  MSG: {
  },
  CACHE: {
  }
}
module.exports = {
  CONFIG: CONFIG
};