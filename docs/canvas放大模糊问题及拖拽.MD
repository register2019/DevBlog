---
slug: canvas-zoom-blur-drag
title: "Canvas 放大模糊问题及拖拽"
date: 2026-09-26
category: 可视化
excerpt: "解决缩放导致的模糊问题，并用 translate 实现画布拖拽。"
tags: [Canvas, 性能优化]
---

最近在使用Canvas绘图，里面有一个功能点是实现随鼠标滚轮滚动放大和缩小的功能，但放大之后的会出现字体模糊的情况，之前查了好多方法也都不太好用，经过翻看文档，终于找到了解决方法。

# 放大模糊
&nbsp;&nbsp;&nbsp;&nbsp;通过修改CSS可以实现canvas的放大和缩小，但是放大后的canvas会模糊。也有通过devicePixelRatio来实现的，但是devicePixcelRatio是用来获取屏幕像素比，用于在不同像素比的屏幕切换是可行的，但不适用于像素比不变的屏幕的中做放大模糊处理。
<br />

解决方案

```html
<canvas id="canvas"></canvas>
```

```javascript
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

let zoomNum = 1;

const init = () => {
  canvas.width = 800;
  canvas.height = 800;
  ctx.scale(zoomNum, zoomNum);
  ctx.translate(x, y);
  const text = '字体放大模糊';
  drawText(ctx, text, { x: 30, y: 30 });
};

const wheelEvent = (e) => {
  if (e.deltaY < 0) {
    zoomNum += 0.3;
  } else {
    zoomNum -= 0.3;
  }
};

const bindEvent = () => {
  canvas.addEventListener("wheel", wheelEvent, false);
}

init()
bindEvent()
```
&nbsp;&nbsp;&nbsp;&nbsp;使用canvas本身的的scale来实现内容的缩放并能保持清晰度，不会修改canvas本身的大小，只是对canvas的内容进行放大。随着内容的放大，内容的宽高会超过canvas本身的大小，这时就需要通过拖拽来查看超出的显示区域的内容。<br />

# 拖拽
&nbsp;&nbsp;&nbsp;&nbsp;这里的拖拽是根据鼠标的移动，然后对canvas进行偏移来实现的，代码如下：

```javascript
const bindEvent = () => {
  canvas.addEventListener("mousedown", mouseDownEvent, false);
  canvas.addEventListener("mousemove", mouseMoveEvent, false);
  canvas.addEventListener("mouseup", mouseUpEvent, false);
};

let x = 0;
let y = 0;
let lastClickPoint = {
  x: 0,
  y: 0
};

let diff = {
  x: 0,
  y: 0
};
let isDragging = false;

const mouseDownEvent = (e) => {
  isDragging = true;
  lastClickPoint.x = e.clientX;
  lastClickPoint.y = e.clientY;
};
const mouseMoveEvent = (e) => {
  if (isDragging) {
    const currentX = e.clientX;
    const currentY = e.clientY;
    diff.x = currentX - lastClickPoint.x;
    diff.y = currentY - lastClickPoint.y;
    lastClickPoint.x = currentX
    lastClickPoint.y = currentY
    x += diff.x / zoomNum
    y += diff.y / zoomNum
  }
};
const mouseUpEvent = (e) => {
  isDragging = false;
};
```
&nbsp;&nbsp;&nbsp;&nbsp;鼠标按下即作为开始拖拽的标志，同时记录开始拖拽的坐标，通过计算鼠标移动的坐标差值就能得到canvas偏移的多少，然后调用canvas的translate方法就可以实现拖拽功能了。

&nbsp;&nbsp;&nbsp;&nbsp;无论是缩放还是拖拽，都需要清空canvas的画布进行重绘，所以需要添加一个重绘的方法。
# 重绘
&nbsp;&nbsp;&nbsp;&nbsp;重绘其实就是清空现有画布之后然后重新调用初始化的方法。代码如下：
```javascript
const reRenderCanvas = () => {
  clearCanvas();
  init();
};

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};
```
&nbsp;&nbsp;&nbsp;&nbsp;至此，canvas的放大模糊问题就解决了。
<br />
&nbsp;&nbsp;&nbsp;&nbsp;完整代码如下：
[jcode](https://code.juejin.cn/pen/7235518996995375104)
