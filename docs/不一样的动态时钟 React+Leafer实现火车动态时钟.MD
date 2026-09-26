---
slug: leafer-train-clock
title: "不一样的动态时钟，React + Leafer 实现火车动态时钟"
date: 2026-09-26
category: 动画
excerpt: "绘制表盘、枕木与指针，按角度计算火车沿轨道的运动路径。"
tags: [Leafer, 动画]
---

之前在 codepen 上看到了一个火车时钟，跟常规的动画时钟不太一样，是通过 svg 来实现的，这里通过 canvas 来实现一下，赶在年末之前，总算是完成了。

## 绘制时、分、秒表盘

    表盘分为三部分，轨道、枕木、运行轨迹。

### 绘制轨道

    轨道的绘制这次使用 Path 方法中的 drawArc 方法。绘制两个半径不同的同心圆。因为 180 度是水平方向，但是指针是从垂直方向顺时针方向转动的，所以这里进行旋转 90 度的操作。代码如下：

```ts
const minutesWrapper = new Path({
	stroke: "#fff",
	strokeWidth: 5,
});
group.add(minutesWrapper);
minutesWrapper.rotateOf({ x: 300, y: 300 }, 90);
minutesWrapper.pen.drawArc(300, 300, radius);

const innerWrapper = new Path({
	stroke: "#fff",
	strokeWidth: 5,
});
group.add(innerWrapper);
innerWrapper.rotateOf({ x: 300, y: 300 }, 90);
innerWrapper.pen.drawArc(300, 300, radius - 30);
```

    这里添加一个圆心相同，storkeWidth 宽度大于两个圆半径的圆环，使轨道更加清晰。代码如下：

```ts
const minutesBg = new Path({
	stroke: "rgb(102, 102, 102)",
	strokeWidth: 30,
});
minutesBg.pen.drawArc(300, 300, radius - 15);
group.add(minutesBg);
```

### 绘制枕木

    枕木的绘制使用 Polygon 方法，因为运行轨迹是圆形，每个枕木之间用一定的间距，所以枕木的形状应该是梯形。

#### 计算梯形的坐标

    计算梯形的坐标，需要知道绘制该梯形的开始角度和结束角度以及梯形在轨道上的内外半径（内半径应该小于运行轨迹的内半径，外边经应该大于运行轨迹的外半径），还有基于那个点进行计算。通过半径 \* cos 获取 X 坐标，通过半径 \* sin 获取 Y 坐标。<br />
    Math 中获取的是弧度，这里需要进行转换。(angle \* Math.PI) / 180。代码如下：

```ts
const computedPoint = (
	startAngle: number,
	endAngle: number,
	startRadius: number,
	endRadius: number,
	baseX: number,
	baseY: number
) => {
	const startRadian = (startAngle * Math.PI) / 180;
	const endRadian = (endAngle * Math.PI) / 180;
	return [
		baseX + startRadius * Math.cos(startRadian),
		baseY + startRadius * Math.sin(startRadian),
		baseX + startRadius * Math.cos(endRadian),
		baseY + startRadius * Math.sin(endRadian),

		baseX + endRadius * Math.cos(endRadian),
		baseY + endRadius * Math.sin(endRadian),
		baseX + endRadius * Math.cos(startRadian),
		baseY + endRadius * Math.sin(startRadian),
	];
};
```

#### 绘制梯形

    这里把梯形分为 120 份，每一份的角度就是 360 / 120 = 3 度。这里梯形有一定的间距，所以绘制的时候只绘制为偶数的梯形。代码如下：

```ts
const renderSeconds = (group: Group) => {
	renderBase(group, 250, -180 - 18, 180 - 18);

	for (let i = 0; i < 120; i++) {
		if (i % 2 === 0) {
			const result = computedPoint(
				i * 3 - 1.5,
				(i + 1) * 3 - 1.5,
				205,
				265,
				300,
				300
			);
			const polygon = new Polygon({
				points: result,
				fill: "#d2b48c",
			});
			group.add(polygon);
		}
	}
};
```

#### 目前效果如下：

![1.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/584379ccccdb40f0b0078de68da05ef5~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgS2FrYXJvdHRv:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTQ2MDU4MjU2OTczODI2NCJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1791005998&x-orig-sign=UnvbI5JKJV8VTl4lfrmhYjVMjLE%3D)

## 绘制指针

    这里的指针的样式是火车的样式，因为火车头的部分是通过多个矩形和圆形重叠以前绘制而成的，这里使用 Group 方法。车厢的部分是一个矩形，通过设置 strokeWidth 和 fill 来实现效果。这里为了区分时、分、秒，通过绘制不同数量的车厢来实现。代码如下：

```ts
const renderSecondsPointer = (group: Group) => {
	const wrapperGroup = new Group();
	group.add(wrapperGroup);
	const oneGroup = new Group();
	wrapperGroup.add(oneGroup);
	const path1 = new Path({
		path: "X 0 0 45 33 7",
		fill: "rgb(254, 50, 66)",
	});
	oneGroup.add(path1);
	const path2 = new Path({
		path: "X 5 30 38 30 7",
		fill: "rgb(254, 50, 66)",
	});
	oneGroup.add(path2);
	const path4 = new Path({
		path: "P 23 52 17",
		fill: "rgb(254, 50, 66)",
	});
	oneGroup.add(path4);
	const path3 = new Path({
		path: "X 7.5 35 30 25 7",
		fill: "rgb(255, 239, 50)",
	});
	oneGroup.add(path3);
	const path5 = new Path({
		path: "P 23 55 12",
		fill: "rgb(168, 168, 168)",
	});
	oneGroup.add(path5);
	const path6 = new Path({
		path: "P 23 55 7",
		fill: "rgb(85, 85, 85)",
	});
	oneGroup.add(path6);
	const pointer = new Rect({
		x: -18,
		y: -60,
		width: 40,
		height: 60,
		stroke: "rgb(254, 105, 50)",
		strokeWidth: 10,
		fill: "rgb(204, 86, 40)",
		rotation: -18,
	});
	wrapperGroup.add(pointer);
	const pointer1 = new Rect({
		x: -50,
		y: -115,
		width: 40,
		height: 60,
		stroke: "rgb(254, 105, 50)",
		strokeWidth: 10,
		fill: "rgb(204, 86, 40)",
		rotation: -32,
	});
	wrapperGroup.add(pointer1);
	const pointer2 = new Rect({
		x: -95,
		y: -160,
		width: 40,
		height: 60,
		stroke: "rgb(254, 105, 50)",
		strokeWidth: 10,
		fill: "rgb(204, 86, 40)",
		rotation: -47,
	});
	wrapperGroup.add(pointer2);
};
```

    因为轨道是圆形的，指针是通过多个矩形组合起来的，所以需要对指针的部分进行适当大便宜旋转来贴合到轨道上。这里主要通过 group 的 motationRotation 以及 Rect 的 rotation、x、y 等属性来控制。<br />
    目前效果如下：

![2.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/5bc8bf17bf5949aebe16d32826f226c0~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgS2FrYXJvdHRv:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTQ2MDU4MjU2OTczODI2NCJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1791005998&x-orig-sign=F7Ow34AIP%2Fvl5QborSaf%2Bo3GOAU%3D)

## 绘制运动路径

    因为火车指针的宽度应该大于轨道的宽度在 UI 上更加合理，所以这里的运动路径应该小于轨道最内层的半径，这里需要设置圆环的颜色为透明色，因为需要延轨迹运动，这里需要添加 motionPath 属性，代码如下：

```ts
const animateLine = new Path({
	stroke: "rgba(0,0,0,0)",
	strokeWidth: 5,
	motionPath: true,
});
group.add(animateLine);

animateLine.rotateOf({ x: 300, y: 300 }, 90);
animateLine.pen.drawArc(300, 300, radius - 35, startAngle, endAngle);
```

## 给指针添加动画效果

    目前静态内容已经绘制完毕，这里需要给指针添加动画效果，这里使用 animation 属性，这里主要用到了 style、duration、loop 三个属性。除 duration 外，其他的基本相同。<br />
    duration 表示动画的持续时间，秒针是 60 秒，分针是 60 \* 60 秒，时针是 12 \* 60 \* 60 秒。但是不总是从 0 时 0 分 0 秒开始，所以需要设置一个偏移量。这里的偏移量可以通过设置开始角度来完成。<br />
    秒针 = (360 \* 当前秒 / 60) + 起始角度;
    分针 = (360 \* (当前分 \* 60 + 当前秒) / 60 \* 60) + 起始角度;
    时针 = (360 \* (当前时 \* 60 \* 60 + 当前分 \* 60 + 当前秒 + 当前秒) / 12 \* 60 \* 60) + 起始角度;<br />
代码如下：

```ts
// 秒针
const secondsGroup = new Group({
	motionRotation: 6,
	animation: {
		// 沿 path 运动至 100%
		style: { motion: { type: "percent", value: 1 } },
		duration: 60,
		easing: "linear",
		loop: true,
	},
});

// 分针
const minutesGroup = new Group({
	motionRotation: 12,
	animation: {
		// 沿 path 运动至 100%
		style: { motion: { type: "percent", value: 1 } },
		duration: 3600,
		easing: "linear",
		loop: true,
	},
});

// 时针
const hoursGroup = new Group({
	motionRotation: 25,
	animation: {
		// 沿 path 运动至 100%
		style: { motion: { type: "percent", value: 1 } },
		duration: 3600 * 12,
		easing: "linear",
		loop: true,
	},
});
```

## 添加背景色

    目前整个表盘没有背景色，这里添加一个背景色，代码如下：

```ts
const renderBg = (leafer: Leafer) => {
	const bg = new Ellipse({
		x: 25,
		y: 25,
		width: 550,
		height: 550,
		innerRadius: 1,
		fill: {
			type: "radial",
			stops: [
				{ offset: 0, color: "rgb(0, 255, 0)" },
				{ offset: 0.2, color: "rgb(0, 255, 0)" },
				{ offset: 1, color: "rgb(0, 0, 0)" },
			],
		},
	});
	leafer.add(bg);
};
```

    目前效果如下：

![3.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/3437ccbe73db460bb3047f39f41c95ea~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgS2FrYXJvdHRv:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTQ2MDU4MjU2OTczODI2NCJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1791005998&x-orig-sign=zvSCjUNanCEt07clYPJydBhRStQ%3D)
    至此，火车时钟的绘制完成。详细代码地址：
<https://stackblitz.com/edit/vitejs-vite-giapsqls?file=index.html>
