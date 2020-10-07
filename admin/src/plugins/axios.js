"use strict";

import Vue from 'vue';
import axios from "axios";
//页面加载进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let config = {
  baseURL: 'https://www.liulongbin.top:8888/api/private/v1'
  // baseURL: process.env.baseURL || process.env.apiUrl || ""
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
};

const _axios = axios.create(config);

_axios.interceptors.request.use(
  function(config) {
    // 在request 拦截器中, 展示进度条 NProgress.start()
    NProgress.start()
    //通过axios请求拦截器添加token,拥有获取API数据的权限。
    config.headers.Authorization = window.sessionStorage.getItem('token');
    console.log('config');
    return config;
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
_axios.interceptors.response.use(
  function(response) {
    // 通过axios响应拦截器隐藏进度条NProgress.done()
    NProgress.done()
    // Do something with response data
    return response;
  },
  function(error) {
    // Do something with response error
    return Promise.reject(error);
  }
);

Plugin.install = function(Vue, options) {
  Vue.axios = _axios;
  window.axios = _axios;
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios;
      }
    },
    $axios: {
      get() {
        return _axios;
      }
    },
  });
};

Vue.use(Plugin)

export default Plugin;
