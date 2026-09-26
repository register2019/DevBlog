---
slug: axios-cancel-duplicate-request
title: "使用 Axios 取消重复请求"
date: 2026-09-26
category: 工程化
excerpt: "用 Map 记录请求标识，在拦截器中取消重复请求。"
tags: [Axios, 工程化]
---

&emsp;&emsp;背景：在web中或多或少会存在重复发送同一个请求的方式，这时就需要取消重复请求。使用Axios的实现方式思路如下：<br>
&emsp;&emsp;1、创建一个Map，用来存储请求信息;<br>
&emsp;&emsp;2、创建添加请求和删除请求的方法;<br>
&emsp;&emsp;3、使用Axios的请求拦截器对每个请求进行拦截，判断是否存在，若存在就取消请求，否则就添加到Map中。<br>
&emsp;&emsp;4、使用Axios的相应拦截器，删除Map中存在的请求
# 1、创建Map， 存储请求信息

````ts
    const pendingRequest = new Map();
````
# 2、创建添加和删除请求的方法
&emsp;&emsp;Map中Key的组合方式可以是请求类型+URL地址或者是请求类型+URL+参数，Key是用来后续判断请求是否存在的条件，这里使用请求类型+URL地址的形式形成Key。

```ts
    const generateReqKey = (config: AxiosRequestConfig) => {
      const { method, url } = config;
      return [method, url].join('&');
    };
```
&emsp;&emsp;添加请求的方法，这里使用Axios的CancelToken来取消重复请求，给每个Map值都添加上取消请求的方法cancel用来取消重复请求。

```ts
    const addPendingRequest = (config: AxiosRequestConfig) => {
      const requestKey = generateReqKey(config);
      config.cancelToken =
        config.cancelToken ||
        new axios.CancelToken(cancel => {
          if (!pendingRequest.has(requestKey)) {
            pendingRequest.set(requestKey, cancel);
          }
        });
    };
```
&emsp;&emsp;取消请求的方法

```ts
    const removePendingRequest = (config: AxiosRequestConfig) => {
      const requestKey = generateReqKey(config);
      if (pendingRequest.has(requestKey)) {
        const cancelToken = pendingRequest.get(requestKey);
        // 取消请求
        cancelToken(requestKey);
        // 从Map中删除对应的请求
        pendingRequest.delete(requestKey);
      }
    };
```
# 3、使用Axios的请求拦截器对请求进行处理

```ts
    axios.interceptors.request.use(
      function (config) {
        removePendingRequest(config);
        addPendingRequest(config);
        return config;
      },
      function (error) {
        return Promise.reject(error);
      }
    );
```
# 4、使用Axios的相应拦截器对请求成功或失败的请求从Map中删除

```ts
    axios.interceptors.response.use(
      function (response) {
        removePendingRequest(response.config);
        const { code } = response.data;
        // 根据返回的状态码进行页面跳转或数据返回
      },
      function (error) {
        removePendingRequest(error.config || {});
        return Promise.reject(error);
      }
    );
```

结语：以上就是使用Axios取消重复请求的方式，希望对大家有所帮助。