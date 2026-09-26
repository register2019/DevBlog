---
slug: index-bar-implementation
title: "一道面试题，IndexBar 索引栏的实现"
date: 2026-09-26
category: 组件库
excerpt: "滚动距离与索引高度匹配，点击索引定位到对应分组。"
tags: [面试题, 组件]
---

&emsp;&emsp;背景：最近面试的时候，被面试官问到类似于手机联系人中的样式怎么实现，当是只是具体的回答了一下大概的思路，今天花了些时间给实现了一下，这里使用Vue3.0。<br />
&emsp;&emsp;主要包括两个方面：<br />
&emsp;&emsp;&emsp;1、当滚动条向下的时候，滚动到哪个索引，对应的索引高亮；<br />
&emsp;&emsp;&emsp;2、当点击索引的时候，把对应的索引内容置顶，当前的索引高亮；<br />
## 第一种情况
### 获取每个索引距离顶部的高度


```html
<div v-for="item in citys" :key="item.key">
    <div ref="keyBar" class="stickyTop">
      {{ item.key }}
    </div>
    <div v-for="list in item.city" :key="list.id">
      {{ list.name }}
    </div>
</div>
```
```ts
onMounted(() => {
  keyBar.value.forEach((item: any) => {
    midArr.push({
      key: item.innerText,
      top: item.offsetTop,
    });
  });
});
```
### 监听滚动条滚动的距离 并查找当前滚动距离对应的索引
```ts
window.addEventListener('scroll', () => {
  let scrollY = document.documentElement.scrollTop || document.body.scrollTop;
  // 获取第一个大于滚动距离的高度 使用result-1获取对应索引到顶部高度
  let result = midArr.findIndex((item) => item.top > scrollY);
});
```
### 对应的索引栏中的项高亮
```html
<ul>
    <li
      v-for="(item, index) in 26"
      :key="index"
      :style="dynamicSelect(item)"
      @click="clickIndex(String.fromCharCode(64 + item))"
    >
      {{ String.fromCharCode(64 + item) }}
    </li>
</ul>
```
## 第二种情况
### 获取索引栏点击的项
```html
<ul>
   <li
     v-for="(item, index) in 26"
     :key="index"
     :style="dynamicSelect(item)"
     @click="clickIndex(String.fromCharCode(64 + item))"
   >
     {{ String.fromCharCode(64 + item) }}
   </li>
</ul>
```
```ts
const clickIndex = (params: string) => {
  emit('selectedIndexBar', params);
};
```
### 滚动条滚动到指定位置

```ts
watch(
  () => props.selectedBar,
  (newVal, oldVal) => {
    let targetTop = midArr.find((item) => item.key === newVal)?.top;
    window.scrollTo({
      top: targetTop,
      // behavior: 'smooth',
    });
  }
);
```
小结：以上就是IndexBar的实现的一种思路，下面是完整代码<br />

原生JS版本：https://stackblitz.com/edit/web-platform-gs7foe?file=index.html<br />
Vue版本：https://stackblitz.com/edit/vitejs-vite-qsquuz?file=src/components/Content.vue <br />
React版本： https://stackblitz.com/edit/vitejs-vite-qrmrub?file=package.json<br />