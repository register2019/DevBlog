---
slug: element-like-popover
title: "自定义组件，仿 Element 的 Popover 组件"
date: 2026-09-26
category: 组件库
excerpt: "Teleport 挂载配合全局点击隐藏，封装 Popover 弹出层。"
tags: [组件, Vue]
---

&ensp;&ensp;前言：本来是计划自定义一个类似于日期选择器的组件，但是需要一个弹出框组件作为容器来存放日期选择器，就先封装了一个。<br />
## 弹出框布局
&ensp;&ensp;主要有两部分组成，分别是弹出框的标题和弹出框的内容，为了使弹出框的位置不受影响，这里使用Teleport传送门挂载到body节点中。代码如下：

```vue
  <div @click="showContent" ref="triggerRef">
    <slot></slot>
  </div>
  <Teleport to="#tooltip-list">
    <div
      ref="contentRef"
      :style="tooltipStyle"
      class="tooltipStyle"
      @click="clickContent"
    >
      <slot name="content"> </slot>
    </div>
  </Teleport>
```
## 弹出框挂载
&ensp;&ensp;需要将节点挂载到body中，然后多次复用的情况下只显示一个，需要在body中创建一个弹出框的根节点，用来挂载全部的弹出框。代码如下：
```ts
// 需要判断一下，避免重复挂载
if (!document.getElementById("tooltip-list")) {
  const oContainer = document.createElement("div");
  oContainer.id = "tooltip-list";
  document.body.appendChild(oContainer);
}
```
## 弹出框显示和隐藏
&ensp;&ensp;点击标题后，根据弹出框绑定的contentRef来获取当前标题对应的弹出框是none还是block，这里的显示和隐藏式通过display属性来控制。代码如下：
```ts
const showContent = (e: any) => {
  if (contentRef.value.style.display === "none") {
    contentRef.value.style.display = "block";
  } else {
    contentRef.value.style.display = "none";
  }
};
```
&ensp;&ensp;因为有需求是点击空白区域会隐藏对应的弹出框，所用会使用全局监听点击事件，获取body下的所有弹出框，把里面display不为none的设置为none。但是如果点击了Popover的标题，就会先执行showContent然后执行全局的点击事件，因为全局的点击事件只做隐藏提示框，所以需要使用stopPropagation()来阻止冒泡。代码如下：
```ts
document.addEventListener("click", () => {
  toolTipNone();
  if (tooltipStyle.value.display === "block") {
    tooltipStyle.value = {
      display: "none",
    };
  }
});

const showContent = (e: any) => {
  e.stopPropagation();
  
  if (contentRef.value.style.display === "none") {
    toolTipNone();
    contentRef.value.style.display = "block";
  } else {
    contentRef.value.style.display = "none";
  }
};
```
## 提示框的位置
&ensp;&ensp;此时提示框位于body中，需要把提示框放到对应标题的周围，这里只做了显示在下方的处理。计算方式是，获取标题的位置的top和height，另外加上标题和弹出框的距离。代码如下：
```ts
const tooltipPosition = (e: any) => {
  let top = e.getBoundingClientRect().top;
  let height = e.clientHeight;

  return {
    position: top + 10 + height,
  };
};
const showContent = (e: any) => {
  e.stopPropagation();

  const { position } = tooltipPosition(triggerRef.value);

  if (contentRef.value.style.display === "none") {
    toolTipNone();
    contentRef.value.style.display = "block";
    tooltipStyle.value = {
      position: "absolute",
      top: position + "px",
      backgroundColor: "#fff",
    };
  } else {
    contentRef.value.style.display = "none";
  }
};
```
## 完整代码
[代码片段](https://code.juejin.cn/pen/7129064865016053790)

&ensp;&ensp;结语：至此，Popover的点击显示的功能已经实现了，下一步会把标题部分和内容部分给抽离成单独的组件，方便后期的扩展，后续也会加上focus效果，完善该组件的功能。