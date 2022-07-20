import axios from 'axios';
import { addCancelToken, removeCancelToken } from './cancelTokenFactory';
const Store = window.require('electron-store');
const store = new Store();
axios.defaults.timeout = 30000;

axios.interceptors.request.use(
  (config) => {
    const token = store.get('token');
    const loadingConfig = store.get('loadingConfig')
    if (process.env.NODE_ENV !== 'development') {
      config.url = config.url.replace('api/', '');
    }
    // 自动置入token
    if (config.url.search('/login') === -1) {
      if (token) {
        config.headers.token = token;
      }
    }
    if (config.abortEnabled) {
      // 添加 cancelToken 并保存到 config
      const {
        latestCancelToken: {
          configInfo: { cancelTokenId: latesCancelTokenId },
        },
        cancelTokenMap,
      } = addCancelToken(config);
      const addTempLoading = JSON.parse(JSON.stringify(loadingConfig));
      addTempLoading[config.url] = true;
      store.set('loadingConfig', addTempLoading);
      if (config.debounce) {
        for (const [key, value] of Object.entries(cancelTokenMap)) {
          if (String(key) !== String(latesCancelTokenId) && value.configInfo && value.configInfo.url === config.url) {
            removeCancelToken(value.configInfo, true);
          }
        }
      }
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

axios.interceptors.response.use(
  (response) => {
    const loadingConfig = store.get('loadingConfig');
    removeCancelToken(response.config);
    const tempLoading = loadingConfig ? JSON.parse(JSON.stringify(loadingConfig)) : {};
    if (tempLoading[response.config.url]) {
      delete tempLoading[response.config.url];
    }
    store.set('loadingConfig', tempLoading)
    return response;
  },
  (error) => {
    const loadingConfig = store.get('loadingConfig')
    const tempLoading = JSON.parse(JSON.stringify(loadingConfig));
    if (axios.isCancel(error)) {
      const { abortEnabled, debounce, url } = JSON.parse(error.message);
      //ps: 取消接口 如果是防抖不帮清除loading状态 此处慎用
      if (!abortEnabled || !debounce) {
        if (tempLoading[url]) {
          delete tempLoading[url];
        }
        console.log('删除loading取消接口-------');
        store.set('loadingConfig', tempLoading)
      }
      console.log('取消接口成功');
    } else {
      if (tempLoading[error?.config?.url]) {
        delete tempLoading[error?.config?.url];
      }
      console.log('删除loading请求失败-------');
      store.set('loadingConfig', tempLoading)
      console.warn('请求失败', error?.config?.url);
      Promise.reject(error);
    }
  },
);

function apiAxios(method, url, params, postType = 'body') {
  const { abortEnabled = false, debounce = false } = params;
  params.abortEnabled && delete params.abortEnabled;
  params.debounce && delete params.debounce;
  let query = {
    method: method,
    url: url,
    data: method === 'POST' || method === 'PUT' ? params : null,
    params: method === 'GET' || method === 'DELETE' ? params : null,
    headers:
      method === 'POST' || method === 'PUT'
        ? { 'Content-Type': 'application/json;charset=UTF-8' }
        : { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    abortEnabled: abortEnabled ? abortEnabled : false,
    debounce: debounce ? debounce : false,
  };
  if (method === 'POST' && postType !== 'body') {
    query = { ...query, params };
    query.data && delete query.data;
  }
  return new Promise((resolve, reject) => {
    axios(query)
      .then(function (res) {
        resolve(res);
      })
      .then(function (err) {
        reject(err);
      });
  });
}
export const get = function (url, params) {
  return apiAxios('GET', url, params);
};
export const post = function (url, params, postType = 'body') {
  return apiAxios('POST', url, params, postType);
};
export const put = function (url, params) {
  return apiAxios('PUT', url, params);
};
export const Delete = function (url, params) {
  return apiAxios('DELETE', url, params);
};
