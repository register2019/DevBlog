---
slug: leafer-mini-game
title: "React + Leafer 实现一个小游戏"
date: 2026-09-26
category: 可视化
excerpt: "按象限推导小球运行路径，Leafer 实现碰撞类小游戏。"
tags: [Leafer, 游戏]
---

&nbsp;&nbsp;&nbsp;&nbsp;上次做了一个火车时钟，感觉可以进一步尝试做一个稍微简单的小游戏，由于游戏一般需要做碰撞检测，但是碰撞检测还比较复杂，这里选择圆形来进行展示，因为圆形的碰撞检测比较简单。

## 绘制中心点圆球及小球运行路径

### 绘制中心点圆球

&nbsp;&nbsp;&nbsp;&nbsp;这里圆球绘制在屏幕的中间，这里需要注意，绘制时需要设置 around 属性，around 为 center，能够保证圆心正好在可视区域的中心，否则需要设置偏移值来保证圆心在可视区域的中心。代码如下：

```ts
const x = window.innerWidth / 2;
const y = window.innerHeight / 2;
const ellipse = new Ellipse({
	x,
	y,
	width: 100,
	height: 100,
	fill: "rgb(50,205,121)",
	around: "center",
});

leafer.add(ellipse);
```

### 绘制运行路径

&nbsp;&nbsp;&nbsp;&nbsp;在点击中心点圆球的时候，能够获取到点击的坐标，点击的坐标与圆心的坐标形成一条直线，这里的直线并不是小球的完整运行路径。可以通过这条直线获取路径的斜率，通过三角函数与圆球中心点的坐标计算出小球的运行路径。代码如下：

```ts
ellipse.on("click", (e: PointerEvent) => {
	const { x: clickX, y: clickY } = e;
	const { startX, startY, endX, endY } = getPoint(clickX, clickY);
	const group = new Group();

	leafer.add(group);

	const line = new Line({
		points: [startX, startY, endX, endY],
		stroke: "rgba(255,255,255,0)",
		strokeWidth: 2,
		motionPath: true,
	});
	group.add(line);
});

const getPoint = (clickX: number, clickY: number) => {
	const { x, y, radians } = getRadians(clickX, clickY);
	let height = window.innerHeight / 2;
	let width = height / Math.tan(radians);

	if (x < width) {
		width = x;
		height = width * Math.tan(radians);
	}
	const point = {
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0,
	};
	if (clickX > x && clickY > y) {
		point.startX = x + 50 * Math.cos(radians);
		point.startY = y + 50 * Math.sin(radians);
		point.endX = x + width;
		point.endY = y + height;
	} else if (clickX > x && clickY < y) {
		point.startX = x + 50 * Math.cos(radians);
		point.startY = y - 50 * Math.sin(radians);
		point.endX = x + width;
		point.endY = y - height;
	} else if (clickX < x && clickY > y) {
		point.startX = x - 50 * Math.cos(radians);
		point.startY = y + 50 * Math.sin(radians);
		point.endX = x - width;
		point.endY = y + height;
	} else {
		point.startX = x - 50 * Math.cos(radians);
		point.startY = y - 50 * Math.sin(radians);
		point.endX = x - width;
		point.endY = y - height;
	}

	return {
		...point,
	};
};
```

&nbsp;&nbsp;&nbsp;&nbsp;这里需要注意，起点坐标与终点坐标的计算方式略有不同，这里可以根据四个象限的不同来计算起点坐标与终点坐标。<br />
&nbsp;&nbsp;&nbsp;&nbsp;终点在第一象限，终点的横坐标 > 圆心的横坐标，终点的纵坐标 < 圆心的纵坐标。
&nbsp;&nbsp;&nbsp;&nbsp;终点在第二象限，终点的横坐标 < 圆心的横坐标，终点的纵坐标 < 圆心的纵坐标。
&nbsp;&nbsp;&nbsp;&nbsp;终点在第三象限，终点的横坐标 < 圆心的横坐标，终点的纵坐标 > 圆心的纵坐标。
&nbsp;&nbsp;&nbsp;&nbsp;终点在第四象限，终点的横坐标 > 圆心的横坐标，终点的纵坐标 > 圆心的纵坐标。<br />
&nbsp;&nbsp;&nbsp;&nbsp;为了减少小球的运动路径，这里的起始坐标偏移到圆的边缘，起点坐标的计算方式与终点坐标的计算方式相同。

### 绘制小球延路径运行

&nbsp;&nbsp;&nbsp;&nbsp;小球的中心点是运动路径的起点，需要对运动路径设置 motionPath 属性为 true。对小球需要设置 animation 属性，设置小球的运行规律及时长。修改代码如下：

```ts
const ellipse1 = new Ellipse({
	x: clickX,
	y: clickY,
	width: 20,
	height: 20,
	fill: getRandomColor(),
	around: "center",
	animation: {
		// 沿 path 运动至 100%
		style: { motion: { type: "percent", value: 1 } },
		duration: 3,
		easing: "linear",
		event: {
			completed() {
				group.destroy();
			},
		},
	},
});
```

&nbsp;&nbsp;&nbsp;&nbsp;当小球运动到终点时，需要把小球及运动路径同时销毁，这里需要设置 event 属性，当运动完成时，销毁小球及运动路径。event 中可以通过 completed 方法来设置。

## 绘制随机小球及运行路径

### 绘制随机小球

&nbsp;&nbsp;&nbsp;&nbsp;随机小球出现的位置不能距离可视区域的边缘太近，这里可以需要设置一个边界，小球的位置只能在边界外生成。代码如下：

```ts
const randomChoiceX = Math.random();
const randomChoiceY = Math.random();

let x: number;
let y: number;

if (randomChoiceX < 0.2) {
	// X > 0 && X < boundary.x
	x = Math.random() * boundary.x;
} else if (randomChoiceX < 0.4) {
	// X > window.innerWidth - boundary.x * 2 && X < window.innerWidth - boundary.x
	x = window.innerWidth - boundary.x * 2 + Math.random() * boundary.x;
} else if (randomChoiceX < 0.6) {
	// X > boundary.x && X < window.innerWidth - boundary.x * 2
	x = boundary.x + Math.random() * (window.innerWidth - boundary.x * 3);
} else if (randomChoiceX < 0.8) {
	// X > window.innerWidth - boundary.x * 3 && X < window.innerWidth - boundary.x * 2
	x = window.innerWidth - boundary.x * 3 + Math.random() * boundary.x;
} else {
	// X > window.innerWidth - boundary.x && X < window.innerWidth
	x = window.innerWidth - boundary.x + Math.random() * boundary.x;
}

if (randomChoiceY < 0.2) {
	// Y > 0 && Y < boundary.y
	y = Math.random() * boundary.y;
} else if (randomChoiceY < 0.4) {
	// Y > window.innerHeight - boundary.y * 2 && Y < window.innerHeight - boundary.y
	y = window.innerHeight - boundary.y * 2 + Math.random() * boundary.y;
} else if (randomChoiceY < 0.6) {
	// Y > boundary.y && Y < window.innerHeight - boundary.y * 2
	y = boundary.y + Math.random() * (window.innerHeight - boundary.y * 3);
} else if (randomChoiceY < 0.8) {
	// Y > window.innerHeight - boundary.y * 3 && Y < window.innerHeight - boundary.y * 2
	y = window.innerHeight - boundary.y * 3 + Math.random() * boundary.y;
} else {
	// Y > window.innerHeight - boundary.y && Y < window.innerHeight
	y = window.innerHeight - boundary.y + Math.random() * boundary.y;
}

return { x, y };
```

&nbsp;&nbsp;&nbsp;&nbsp;这段代码的功能是生成一个随机的坐标点 { x: number, y: number }，其中 x 和 y 的值根据不同的概率分布在窗口的不同区域内。具体来说：

X 坐标：
&nbsp;&nbsp;&nbsp;&nbsp;根据 randomChoiceX 的值，x 会在窗口的五个不同区域中随机选择。
这些区域分别是：靠近左边、靠近右边、中间偏左、中间偏右和靠近右边边缘。
Y 坐标：
&nbsp;&nbsp;&nbsp;&nbsp;同样根据 randomChoiceY 的值，y 会在窗口的五个不同区域中随机选择。
这些区域分别是：靠近上边、靠近下边、中间偏上、中间偏下和靠近下边边缘。
最终返回一个包含随机 x 和 y 坐标的对象。

&nbsp;&nbsp;&nbsp;&nbsp;这样生成的小球位置相对分散

### 绘制运动路径

&nbsp;&nbsp;&nbsp;&nbsp;与中心点小球出发的路径绘制方式相同，也需要根据小球的坐标的象限位置和三角函数来计算终点坐标。代码如下：

```ts
const { x: startX, y: startY } = getRandomCoordinate();
const { x, y, radians } = getRadians(startX, startY);

const distanceCenter =
	Math.sqrt(
	   Math.abs(x - startX) * Math.abs(x - startX) +
	   Math.abs(y - startY) * Math.abs(y - startY)
	) - 50;
let endX = 0;
let endY = 0;
if (startX < x && startY < y) {
	endX = startX + distanceCenter * Math.cos(radians);
	endY = startY + distanceCenter * Math.sin(radians);
} else if (startX < x && startY > y) {
	endX = startX + distanceCenter * Math.cos(radians);
	endY = startY - distanceCenter * Math.sin(radians);
} else if (startX > x && startY < y) {
	endX = startX - distanceCenter * Math.cos(radians);
	endY = startY + distanceCenter * Math.sin(radians);
} else {
	endX = startX - distanceCenter * Math.cos(radians);
	endY = startY - distanceCenter * Math.sin(radians);
}
const id = uuid();
const group = new Group();
leafer.add(group);
const line = new Line({
	id,
	points: [startX, startY, endX, endY],
	stroke: "rgba(255,255,255,0)",
	strokeWidth: 2,
	motionPath: true,
});
group.add(line);
```

&nbsp;&nbsp;&nbsp;&nbsp;接下来是需要让随机生成的小球朝中心球运动，这里同样需要给小球运行路径设置 animation 属性，设置小球的运行规律及时长。代码如下：

```ts
const ball = new Ellipse({
	id,
	x: startX,
	y: startY,
	width: 20,
	height: 20,
	fill: getRandomColor(),
	around: "center",
	animation: {
		// 沿 path 运动至 100%
		style: { motion: { type: "percent", value: 1 } },
		duration: 3,
		easing: "linear",
		event: {
			completed() {
				line.destroy();
				ball.destroy();
			},
		},
	},
});
group.add(ball);
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，所有小球的运行路径及小球运动已经完成。

## 小球碰撞检测及销毁小球

&nbsp;&nbsp;&nbsp;&nbsp;小球的碰撞检测相对来说比较简单，只需要实时检测两个小球的中心位置，如果小球中心距离小于两个小球的半径，说明发生了碰撞。<br />
&nbsp;&nbsp;&nbsp;&nbsp;这里把碰撞检测的判断放到中心的出发小球中，event 属性中有 update 方法，用来实时显示坐标位置。同时需要记录随机小球的实时位置，这里使用 Map 来记录，在检测到碰撞后销毁小球并从 Map 中删除。代码如下：

```ts
const id = uuid();
const group = new Group();
leafer.add(group);
const line = new Line({
	id,
	points: [startX, startY, endX, endY],
	stroke: "rgba(255,255,255,0)",
	strokeWidth: 2,
	motionPath: true,
});
group.add(line);

const ball = new Ellipse({
	id,
	x: startX,
	y: startY,
	width: 20,
	height: 20,
	fill: getRandomColor(),
	around: "center",
	animation: {
		// 沿 path 运动至 100%
		style: { motion: { type: "percent", value: 1 } },
		duration: 3,
		easing: "linear",
		event: {
			completed() {
				line.destroy();
				ball.destroy();
			},
		},
	},
});
group.add(ball);
ballMap.set(id, ball);
```

```ts
update(val) {
	if (val) {
		const targetX = val.target.x;
		const targetY = val.target.y;
		if (targetX && targetY) {
			ballMap.forEach((ball, key) => {
				if (
					Math.sqrt(
						(targetX - ball.x) * (targetX - ball.x) +
							(targetY - ball.y) * (targetY - ball.y)
					) < 20
				) {
					ball.destroy();
					group.destroy();
					ballMap.delete(key);
				}
			});
		}
	}
}
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，小球碰撞检测及销毁小球已经完成。

## 代码地址
https://stackblitz.com/edit/vitejs-vite-fi8wnbct?file=README.md
