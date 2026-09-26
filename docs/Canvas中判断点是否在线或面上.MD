---
slug: canvas-point-in-path
title: "Canvas 中判断点是否在线或面上"
date: 2026-09-26
category: 可视化
excerpt: "用 isPointInPath 判断点击点是否落在 Canvas 路径内。"
tags: [Canvas, 命中检测]
---

&emsp;&emsp;在使用Canvas绘图是时，有时会用到判断一个点是否在一条线或者一个面中，这里介绍Canvas中的两个方法，isPointInPath和isPointInStroke，用来解决这两个问题。<br />
## isPointInPath
&emsp;&emsp;该方法是用来解决判断一个点是否在一个区域中，示例如下：
```html
  <canvas id="rect"></canvas>
```
```javascript
  const rectCanvas = document.getElementById("rect");
  const rectCtx = rectCanvas.getContext('2d');

  rectCtx.rect(10, 10, 100, 100);
  rectCtx.stroke();
  console.log(rectCtx.isPointInPath(30, 30)); // 结果为 true
```

## isPointInStroke
&emsp;&emsp;该方法是用来解决判断一个点是否在一条线中，示例如下：
```html
  <canvas id="line"></canvas>
```
```javascript
  const lineCanvas = document.getElementById("line");
  const lineCtx = lineCanvas.getContext('2d');
  
  lineCtx.beginPath();
  lineCtx.moveTo(150, 150);
  lineCtx.lineTo(300, 300);
  lineCtx.stroke();
  console.log(lineCtx.isPointInStroke(200, 200)); // 结果为true
```