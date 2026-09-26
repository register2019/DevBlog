---
slug: echarts-cylinder-bar
title: "【Echarts】使用象形柱状图实现圆柱形柱状图"
date: 2026-09-26
category: 可视化
excerpt: "pictorialBar 配合 barGap 重叠技巧拼出圆柱形柱状图。"
tags: [Echarts, 图表]
---

&nbsp;&nbsp;&nbsp;&nbsp;圆柱形柱状图包括五部分组成，圆柱的顶部、底部、侧面、Y 轴的背景、Y 轴背景顶部。示例图如下：

![示意图.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/775dc7f28bb04d2a8771541457e5224b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=585&h=583&s=42097&e=png&b=091d54)
## 象形柱状图

&nbsp;&nbsp;&nbsp;&nbsp;象形柱图是可以设置各种具象图形元素（如图片、SVG PathData 等）的柱状图。往往用在信息图中。用于有至少一个类目轴或时间轴的直角坐标系上。
&nbsp;&nbsp;&nbsp;&nbsp;象形柱图可以被想象为：它首先是个柱状图，但是柱状图的柱子并不显示。这些柱子我们称为『基准柱（reference bar）』，根据基准柱来定位和显示各种象形图形（包括图片）。每个象形图形根据基准柱的定位，是通过 symbolPosition、symbolOffset 来调整其于基准柱的相对位置。

## 圆柱底部

&nbsp;&nbsp;&nbsp;&nbsp;圆柱的底部是一个椭圆，类型为 pictorialBar，通过 symbolSize 设置椭圆长轴和短轴，通过 symbolOffset 设置椭圆的偏移量。代码如下：

```js
series: [
	{
		data: [150, 230, 224, 218, 135, 147, 260],
		type: "pictorialBar",
		symbolSize: [45, 25],
		symbolOffset: [0, 10],
		z: 12,
	},
];
```

## 圆柱 Y 轴高度背景

&nbsp;&nbsp;&nbsp;&nbsp;这里是正常的绘制柱状图，需要添加一个属性 barGap。

### barGap

&nbsp;&nbsp;&nbsp;&nbsp;不同系列的柱间距离，为百分比（如 '30%'，表示柱子宽度的 30%）。<br />
&nbsp;&nbsp;&nbsp;&nbsp;如果想要两个系列的柱子重叠，可以设置 barGap 为 '-100%'。这在用柱子做背景的时候有用。<br />
&nbsp;&nbsp;&nbsp;&nbsp;在同一坐标系上，此属性会被多个 'bar' 系列共享。此属性应设置于此坐标系中最后一个 'bar' 系列上才会生效，并且是对此坐标系中所有 'bar' 系列生效

&nbsp;&nbsp;&nbsp;&nbsp;这里不需要设置 symbolOffset 和 symbolSize，代码如下：

```js
series: [
	{
		data: [150, 230, 224, 218, 135, 147, 260],
		type: "bar",
		barWidth: 45,
		barGap: "-100%",
		z: 12,
	},
];
```

## 圆柱顶部

&nbsp;&nbsp;&nbsp;&nbsp;圆柱的顶部是一个椭圆，类型为 pictorialBar，通过 symbolSize 设置椭圆长轴和短轴，通过 symbolOffset 设置椭圆的偏移量，与设置圆柱底面不同的是这里需要单独设置 symbolPosition。代码如下：

```js
series: [
	{
		type: "pictorialBar",
		symbolSize: [45, 25],
		symbolOffset: [0, -10],
		z: 12,
		symbolPosition: "end",
		data: [150, 230, 224, 218, 135, 147, 260],
	},
];
```

## Y 轴背景

&nbsp;&nbsp;&nbsp;&nbsp;Y 轴的背景类型是 bar，这里需要特别注意，这里的 data 和类型为 pictorialBar 的 data 值不同，这里的值要比类型为 bar 的值中的都大，且长度保持一致，代码如下：

```js
series: [
	{
		type: "bar",
		barWidth: 45,
		barGap: "-100%",
		z: 0,
		itemStyle: {
			color: "#163F7A",
			opacity: 0.7,
		},
		data: [300, 300, 300, 300, 300, 300, 300],
	},
];
```

## Y 轴顶部

&nbsp;&nbsp;&nbsp;&nbsp;Y 轴的顶部同样是一个椭圆，通过 symbolSize 设置椭圆的长轴和短轴、symbolOffset 设置椭圆的偏移量，z 设置不同的层级，这里同样需要设置 symbolPosition，代码如下：

```js
series: [
	{
		type: "pictorialBar",
		symbolSize: [45, 25],
		symbolOffset: [0, -10],
		z: 12,
		symbolPosition: "end",
		itemStyle: {
			color: "#163F7A",
			opacity: 1,
		},
		data: [300, 300, 300, 300, 300, 300, 300],
	},
];
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，圆柱形柱状图就完成了，横向的圆柱形柱状图可以通过调整 symbolSize，symbolOffset 来完成。<br/>
&nbsp;&nbsp;&nbsp;&nbsp;圆柱形柱状图的本质是基础柱状图和象形柱状图拼接起来的，可以通过调整两者的颜色及透明度来使得圆柱更加立体。
## 代码地址
https://stackblitz.com/edit/vitejs-vite-x5tbtz?file=index.html
