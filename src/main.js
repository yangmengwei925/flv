import Vue from 'vue'
import App from './App.vue'
import http from "./http"
import ls from "./utils/ls"

import iView from "iview";
import 'iview/dist/styles/iview.css';

window._ = require("lodash");


const isProd = process.env.NODE_ENV === "production";
ls.install(Vue);

http.install(Vue, {
  baseURL: "/api/",
  timeout: 30 * 1000,
  noToken: false, // 是否传token
  showSpin: true, // 是否呈现loading效果
  showMsg: false, // 是否弹出成功/失败消息
  showOkMsg: false, // 是否弹出成功消息
  showFailMsg: !isProd, // 是否弹出失败消息
  okMsg: "", // 自定义成功消息
  failMsg: "", // 自定义失败消息
})

Vue.use(iView)
Vue.prototype.$config = {
  "projectKey": "tiande",
  "isProd": isProd,
  "enableAuth": true,
  "url": "https://ibms.tiandecentre.com.cn:443",
  "port": 443,
  "useSideMenu": false,
  "sysFlag": "ivmp",
  "projectName": "天德广场视频管理系统"
}
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')