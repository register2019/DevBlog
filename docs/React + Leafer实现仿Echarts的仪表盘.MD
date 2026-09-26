---
slug: leafer-gauge-chart
title: "React + Leafer 实现仿 Echarts 的仪表盘"
date: 2026-09-26
category: 可视化
excerpt: "用三角函数计算刻度起止坐标，Leafer 绘制仿 Echarts 仪表盘。"
tags: [Leafer, 数据可视化]
---

&nbsp;&nbsp;&nbsp;&nbsp;之前有想过用原生 Canvas 实现类似于 Echarts 的仪表盘，但是动画这块的处理有点麻烦，最近看到 Leafer 提供了动画效果，就来实现一下，这里主要记录一下绘制仪表盘的步骤。<br />

## 初始化

&nbsp;&nbsp;&nbsp;&nbsp;首先创建一个 leafer 画布，代码如下：

```tsx
useEffect(() => {
	const leafer = new Leafer({ view: "guage", type: "chart" });
	render(leafer, 100);

	return () => leafer.destroy();
}, []);

return (
	<div style={{ height: "100vh" }}>
		<div id='guage' style={{ height: "100%" }}></div>
	</div>
);
```

## 绘制圆弧背景

&nbsp;&nbsp;&nbsp;&nbsp;仪表盘是圆弧形，leafer 中提供了绘制圆弧的方法 Ellipse，整个圆弧的弧度为 280 度。代码如下：

```ts
const bg = new Ellipse({
	x: 300,
	y: 300,
	width: 400,
	height: 400,
	startAngle,
	endAngle,
	innerRadius: 1,
	stroke: "rgb(91,107,97)",
	strokeWidth: 10,
	strokeAlign: "center",
	strokeCap: "round",
});
leafer.add(bg);
```

## 绘制圆弧值

&nbsp;&nbsp;&nbsp;&nbsp;圆弧的值与圆弧相同的其他参数一致，结束角度小于等于背景的角度。<br />
&nbsp;&nbsp;&nbsp;&nbsp;仪表盘分为 10 份，圆弧的弧度为 280，每一份为 28 度，所以结束角度 = startAngle + val \* 2.8。代码如下：

```ts
val = startAngle + val * 2.8;
const num = new Ellipse({
	x: 300,
	y: 300,
	width: 400,
	height: 400,
	startAngle,
	innerRadius: 1,
	stroke: "rgb(50,205,121)",
	strokeWidth: 10,
	strokeAlign: "center",
	strokeCap: "round",
});
leafer.add(num);
```

## 绘制刻度

&nbsp;&nbsp;&nbsp;&nbsp;这里参照 Echarts 的仪表盘绘制刻度及刻度值。每一份的弧度为 28，每一份里面有 4 个刻度，所以每一个小份为 28 / 5。每一个刻度的角度为 startAngle + 28 / 5 \* i。<br />
&nbsp;&nbsp;&nbsp;&nbsp;我们知道圆心的位置、半径、开始角度，这是我们可以根据三角函数中的 sin、cos 来计算出刻度开始点和结束点的坐标。这里需要用到 Math 函数，但是 Math 函数中的 sin、cos 都是以弧度为单位，所以需要将角度转换为弧度。代码如下：

```ts
const degreesToRadians = (degrees: number): number => {
	return (degrees * Math.PI) / 180;
};
```

&nbsp;&nbsp;&nbsp;&nbsp;开始点 X 坐标 = 半径 \* Math.sin(弧度)<br>
&nbsp;&nbsp;&nbsp;&nbsp;开始点 Y 坐标 = 半径 \* Math.cos(弧度)<br>
&nbsp;&nbsp;&nbsp;&nbsp;结束点 X 坐标 = (半径 - 偏移值) \* Math.sin(弧度)<br>
&nbsp;&nbsp;&nbsp;&nbsp;结束点 Y 坐标 = (半径 - 偏移值) \* Math.cos(弧度)，代码如下：<br>

```ts
for (let i = 0; i < 51; i++) {
	const scaleAngle = -140 + i * (28 / 5);
	const radian = degreesToRadians(scaleAngle);

	const startX = 500 - 190 * Math.sin(radian);
	const startY = 500 - 190 * Math.cos(radian);
	const endX = 500 - 170 * Math.sin(radian);
	const endY = 500 - 170 * Math.cos(radian);
	const line = new Line({
		points: [startX, startY, endX, endY],
		strokeWidth: i % 5 === 0 ? 5 : 1,
		stroke: "#FFFFFF",
	});
	leafer.add(line);
}
```

## 绘制刻度值

&nbsp;&nbsp;&nbsp;&nbsp;刻度值的位置是刻度的结束坐标位置再一次进行偏移得到的。但是圆弧左右两边的文本设置有差异，坐标可是使用文本垂直居中，左对齐，右边可使用处置居中，右对齐，具体样式可以微调。代码如下：

```ts
for (let i = 0; i <= 10; i++) {
	const scaleNumAngle = 40 + i * 28;
	const radian = degreesToRadians(scaleNumAngle);

	const width = 160 * Math.sin(radian);
	const height = 160 * Math.cos(radian);
	const x = 500 - width;
	const y = 500 + height;
	const text = (i * 10).toString();
	const scale = new Text({
		x,
		y,
		textAlign: numPoint[text].textAlign,
		verticalAlign: numPoint[text].verticalAlign,
		fontSize: 14,
		fill: "#FFFFFF",
		text,
	});
	leafer.add(scale);
}
```

## 绘制指针

&nbsp;&nbsp;&nbsp;&nbsp;Echarts 仪表盘中的指针是一个类似于菱形的形状，Leafer 提供了 Polygon 绘制多边形。代码如下：

```ts
const pointer = new Polygon({
	x: 500,
	y: 500,
	points: [-10, 10, 0, -70, 10, 10, 0, 20],
	fill: "rgb(50,205,121)",
});
leafer.add(pointer);
```

## 添加动画

&nbsp;&nbsp;&nbsp;&nbsp;到这里，仪表盘的绘制已经完成，但是指针没有移动，所以需要添加动画。Leafer 提供了动画插件 @leafer-in/animate 可以实现动画效果，这里使用关键帧来实现动画效果。

### 添加圆弧值的动画效果

&nbsp;&nbsp;&nbsp;&nbsp;Echarts 中仪表盘的动画效果类似于 ease-in-out，设置两个关键帧开始角度和结束角度，圆弧值的完整代码如下：

```ts
val = startAngle + val * 2.8;
const num = new Ellipse({
	x: 300,
	y: 300,
	width: 400,
	height: 400,
	startAngle,
	animation: {
		keyframes: [{ endAngle: startAngle }, { endAngle: val }],
		easing: "ease-in-out",
		duration: 1,
	},
	innerRadius: 1,
	stroke: "rgb(50,205,121)",
	strokeWidth: 10,
	strokeAlign: "center",
	strokeCap: "round",
});
leafer.add(num);
```

### 添加指针的动画效果

&nbsp;&nbsp;&nbsp;&nbsp;和圆弧值中的动画效果类似，这里设置两个关键帧，指针的起始角度和结束角度，完整的代码如下：

```ts
val = -140 + val * 2.8;
const pointer = new Polygon({
	x: 500,
	y: 500,
	points: [-10, 10, 0, -70, 10, 10, 0, 20],
	fill: "rgb(50,205,121)",
	animation: {
		keyframes: [
			{
				rotation: -140,
			},
			{
				rotation: val,
			},
		],
		easing: "ease-in-out",
		duration: 1,
	},
});
leafer.add(pointer);
```

### 添加指针数值

&nbsp;&nbsp;&nbsp;&nbsp;指针数值的的位置 X 和圆心相同，Y 向下偏移，同样需要用到关键帧，与上面不同的是，这里需要添加一个函数，在更新的时候不断累加，直到和值相同，这里 update 函数会执行的次数超过 val 值，这里只重新绘制小于等于 val 的次数。代码如下：

```ts
let i = 0;
const text = new Text({
	x: 500,
	y: 560,
	textAlign: "center",
	verticalAlign: "middle",
	fontSize: 30,
	fill: "#FFFFFF",
	animation: {
		keyframes: [{ text: "0" }, { text: val.toString() }],
		event: {
			update: () => {
				const dynamicText = i++;
				dynamicText <= val && (text.text = dynamicText.toString());
			},
		},
		easing: "ease-in-out",
		duration: 1,
	},
});
leafer.add(text);
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，类似于 Echarts 仪表盘的代码基本完成。

## 代码地址
https://stackblitz.com/edit/vitejs-vite-x4gyh8?file=src%2Findex.css
