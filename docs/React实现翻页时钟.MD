---
slug: react-flip-clock
title: "React 实现翻页时钟"
date: 2026-09-26
category: 动画
excerpt: "perspective 与 transform-origin 实现 3D 翻页动画，时分秒联动。"
tags: [React, CSS动画]
---

## 1. 布局、样式、翻页动画

&nbsp;&nbsp;&nbsp;&nbsp;翻页时钟把数字分为上下两部分，翻页效果的实现需要通过设置 position 把所有的数组放在同一个位置叠加起来。<br />
&nbsp;&nbsp;&nbsp;&nbsp;翻页时钟的动画是当前显示时间的 up 部分向下翻转至于屏幕垂直的位置，在这个位置需要显示的下一个时间的 down 部分向下翻转，这样就实现了翻页时钟的完整动画。

HTML 结构如下所示：

```html
<div class="container">
    <ul class="flip">
        <li>
            <div class="up">
                <div class="content">0</div>
            </div>
            <div class="down">
                <div class="content">0</div>
            </div>
        </li>
        <li>
            <div class="up">
                <div class="content">1</div>
            </div>
            <div class="down">
                <div class="content">1</div>
            </div>
        </li>
    </ul>
</div>
```

CSS 样式

```css
.container {
	height: 90px;
}
.container .flip {
	position: relative;
	float: left;
	width: 60px;
	height: 100%;
	margin: 0 5px;
}

.flip li {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	font-size: 80px;
	text-align: center;
	line-height: 90px;
	font-weight: bold;
	border-radius: 6px;
	perspective: 200px;
	transform-style: preserve-3d;
}

.flip li:first-child {
	z-index: 2;
}
// 设置class为up和down的高度为父元素容器的一半高度
.flip li > div {
	position: absolute;
	left: 0;
	height: 50%;
	width: 100%;
	overflow: hidden;
}

.flip .up {
	/* 改变选中轴的位置 使翻转轴位于up、down部分的中间*/
	transform-origin: 0 100%;
	top: 0;
	border-radius: 4px;
}

.flip .down {
	/* 改变选中轴的位置 使翻转轴位于up、down部分的中间 */
	transform-origin: 0 0;
	bottom: 0;
	border-radius: 4px;
}

.flip .content {
	position: absolute;
	width: 100%;
	border-radius: 6px;
	color: #ccc;
	background-color: #333;
	text-shadow: 0 1px 2px #000;
}

.flip .up .content {
	top: 0;
}
.flip .down .content {
	bottom: 0;
}
// 设置翻页折痕
.flip .up::after {
	content: "";
	position: absolute;
	top: 43px;
	left: 0;
	width: 100%;
	height: 4px;
	background-color: rgba(0, 0, 0, 0.4);
}
```
&nbsp;&nbsp;&nbsp;&nbsp;实现的3D效果如下：
![iShot_2023-08-26_10.44.52.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97eda53621bc4e0ab81c07973a85db6e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1016&h=738&e=png&a=1&b=272727)

## 2. 使用 JS 使动画持续翻页

&nbsp;&nbsp;&nbsp;&nbsp;完整的翻页时钟为 00:00:00，需要翻页的有 6 个部分，可以先把翻页部分提取出单独的组件。

### 1、准备数据

&nbsp;&nbsp;&nbsp;&nbsp;因为需要时分秒各个翻页部分显示的数字范围不同，所以这里先把数据准备好。

![code.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3d12038b03c94deb985d725158d64e59~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1834&h=916&e=png&b=0f111a)

### 2、封装翻页组件

&nbsp;&nbsp;&nbsp;&nbsp;组件接收两个参数：1、当前翻页类型(时、分、秒); 2、当前类型时间。<br />
&nbsp;&nbsp;&nbsp;&nbsp;index 与当前类型时间相同时，当前元素的 class 为 active，上一个元素的 class 为 before；如果当前元素为第一个元素，最后一个元素的class为before。
![code.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a961353c93d4ed89369ac1860522475~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1508&h=2740&e=png&b=0f111a)

### 3、各个翻页组件间的联动

&nbsp;&nbsp;&nbsp;&nbsp;这里还需要定义一个对象，用于翻页组件间的联动关系的对应。
![code.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b4c7b8d2338a49ec8fd0a38858ec943a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1414&h=628&e=png&b=0f111a)

&nbsp;&nbsp;&nbsp;&nbsp;秒钟的个位转完一周后，秒钟的十位需要进行一次翻页，以此类推，直到时钟的十位进行翻转。实现方式如下：
![code.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/673f3a9b192e40b098c37240dccc5cd3~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1868&h=5572&e=png&b=0f111a)
&nbsp;&nbsp;&nbsp;&nbsp;

### 源码地址
https://stackblitz.com/edit/vitejs-vite-ehlf3y?file=src%2FTimeCard.tsx
