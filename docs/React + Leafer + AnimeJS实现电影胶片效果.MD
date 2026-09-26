---
slug: leafer-film-strip
title: "React + Leafer + AnimeJS 实现电影胶片效果"
date: 2026-09-26
category: 动画
excerpt: "Leafer 绘制底版，AnimeJS 驱动电影胶片帧动画。"
tags: [Leafer, 动画]
---

![iShot_2024-03-08_21.11.09.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5561db0c1b134008bc142e124895a829~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1866&h=684&s=1134461&e=png&a=1&b=1a1a1a)
&nbsp;&nbsp;&nbsp;&nbsp;起初是想做个视频有电影胶片的效果，本来计划这用PR来做，但是PR不太会，所以用自己的专业来搞一个好了。<br />
&nbsp;&nbsp;&nbsp;&nbsp;电影胶片效果主要分为三部分: 1、胶片的边框，2、展示的内容，3、电影胶片的播放。因为需要绘制的元素比较多，这里使用 Leafer（一个不错的 Canvas 库） 来进行绘制，播放效果使用 animejs 动画库来进行处理。

## 绘制底版

&nbsp;&nbsp;&nbsp;&nbsp;底版的绘制就是一个黑色的长方形矩形，矩形的宽高 = 图片的宽高 + 边框的宽高。然后通过在上面绘制白色的方格使其达到胶片效果。代码示例如下：

```ts
const leafer = new Leafer({
	view: document.getElementById("video"),
	type: "user",
});

const border = new Rect({
	x: 0,
	y: 0,
	width: canvasWidth,
	height: 400,
	fill: "#000000",
});
leafer.add(border);
```

## 绘制边框
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd1554624d94496ea6b4c3343e4fe519~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1359&h=803&s=58253&e=png&b=010101)
### 1、绘制顶部边框

&nbsp;&nbsp;&nbsp;&nbsp;根据图例可以得出顶部边框的起点坐标：<br />
&nbsp;&nbsp;&nbsp;&nbsp;x = 边距 + 单元格宽度 + 边距 ; y = 边距 + 单元格高度 + 边距 <br />
&nbsp;&nbsp;&nbsp;&nbsp;顶部需要绘制多少个方块由需要展示的图片数量来决定的。<br />
&nbsp;&nbsp;&nbsp;&nbsp;顶部方格数量 = 图片数量 \* 每张图片宽度需要的方格 <br />
&nbsp;&nbsp;&nbsp;&nbsp;每张图片宽度需要的方格 = (图片宽度 + 边距) / (方格宽度 + 边距)<br />
&nbsp;&nbsp;&nbsp;&nbsp;因为是在顶部，所以只需要计算方格横向的偏移量。<br />
&nbsp;&nbsp;&nbsp;&nbsp;代码示例如下：

```ts
for (let i = 0; i < num * singleImgHorizontalCellNum; i++) {
	const x = margin + (width + margin) * (i + 1);
	const y = margin;
	const topCell = new Rect({
		x,
		y,
		width,
		height,
		fill: "#ffffff",
	});

	leafer.add(topCell);
}
```

### 2、绘制底部边框

&nbsp;&nbsp;&nbsp;&nbsp;底部边框与顶部边框的纵向坐标不同，其他的保持一致。<br />
&nbsp;&nbsp;&nbsp;&nbsp;纵向坐标 = 顶部边框高度 + 图片高度 + 边距。<br />
&nbsp;&nbsp;&nbsp;&nbsp;代码示例如下：

```ts
for (let i = 0; i < num * singleImgHorizontalCellNum; i++) {
	const x = margin + (width + margin) * (i + 1);
	const y = margin + height + margin + imgHeight + margin;
	const topCell = new Rect({
		x,
		y,
		width,
		height,
		fill: "#ffffff",
	});

	leafer.add(topCell);
}
```

### 3、绘制左侧边框

&nbsp;&nbsp;&nbsp;&nbsp;根据图例可知，左侧边框的起点坐标 X = margin; y = margin<br />
&nbsp;&nbsp;&nbsp;&nbsp;左侧边框需要绘制的单元格 = (顶部边框的高度 + 图片的高度 + 底部边框的高度) / (方格的高度 + 边距) <br />
&nbsp;&nbsp;&nbsp;&nbsp;因为是纵向绘制，所以横向坐标都是相同的，代码示例如下：

```ts
const verticalCellNum =
	(margin + height + margin + imgHeight + margin + height) / (height + margin);
for (let i = 0; i < verticalCellNum; i++) {
	const x = margin;
	const y = margin + (height + margin) * i;
	const topCell = new Rect({
		x,
		y,
		width,
		height,
		fill: "#ffffff",
	});
	leafer.add(topCell);
}
```

### 4、绘制右侧边框

&nbsp;&nbsp;&nbsp;&nbsp;右侧边框的绘制与左侧是基本相同，需要修改左侧横向的坐标。<br />
&nbsp;&nbsp;&nbsp;&nbsp;右侧横向的坐标 = 左侧边框的宽度 + (图片的宽度 + 边距) \* 图片的数量 <br />
&nbsp;&nbsp;&nbsp;&nbsp;代码示例如下：

```ts
for (let i = 0; i < verticalCellNum; i++) {
	const x =
		margin +
		width +
		margin +
		singleImgHorizontalCellNum * (width + margin) * num;
	const y = margin + (height + margin) * i;
	const topCell = new Rect({
		x,
		y,
		width,
		height,
		fill: "#ffffff",
	});
	leafer.add(topCell);
}
```

## 内容填充

### 1、使用 Rect 进行占位

&nbsp;&nbsp;&nbsp;&nbsp;由图例可知，Rect 的开始坐标：X = 顶部边框的高度 Y = 左侧边框的宽度 <br />
&nbsp;&nbsp;&nbsp;&nbsp;代码示例如下：

```ts
for (let i = 0; i < num; i++) {
	const x = margin + width + margin + (imgWidth + margin) * i;
	const y = margin + height + margin;
	const topCell = new Rect({
		x,
		y,
		width: imgWidth,
		height: imgHeight,
	});

	leafer.add(topCell);
}
```

### 2、使用图片进行填充

&nbsp;&nbsp;&nbsp;&nbsp;leafer 支持 rect 使用图片进行填充，为了简化代码，这里把图片的名称修改为数字，上述代码修改如下：

```ts
for (let i = 0; i < num; i++) {
	const x = margin + width + margin + (imgWidth + margin) * i;
	const y = margin + height + margin;

	const topCell = new Rect({
		x,
		y,
		width: imgWidth,
		height: imgHeight,
		fill: {
			type: "image",
			url: `/src/assets/images/${i + 1}.jpg`,
		},
	});

	leafer.add(topCell);
}
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，静态的电影胶片效果就完成了。接下来需要让胶片能够动起来。

## 胶片播放

&nbsp;&nbsp;&nbsp;&nbsp;这里使用 animejs 来处理胶片的移动，让画布的左侧向左移动直至移动整个画布的宽度。代码示例如下：

```ts
anime({
	targets: "#video",
	translateX: -canvasWidth,
	duration: 60 * 1000,
	easing: "easeInOutQuad",
});
```

&nbsp;&nbsp;&nbsp;&nbsp;通过 duration 可以设置移动完成的时间，easing 可以设置移动的动画，这里使用的是先缓慢移动，后加速，快结束时减速的动画效果。

&nbsp;&nbsp;&nbsp;&nbsp;至此，电影胶片播放效果就完成了。

## 代码地址
https://stackblitz.com/edit/vitejs-vite-scss5s?file=src%2Fcommon.ts