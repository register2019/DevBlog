---
slug: canvas-screenshot-export
title: "React + Canvas 实现图片截图预览导出"
date: 2026-09-26
category: 可视化
excerpt: "蒙层、拖拽选区配合 composite operation 实现截图预览导出。"
tags: [Canvas, 截图]
---

&nbsp;&nbsp;&nbsp;&nbsp;截图预览功能是比较常用的功能，这里使用 canvas 和 fileReader 及相关 API 完成截图预览功能。

## 1、文件上传及预览

&nbsp;&nbsp;&nbsp;&nbsp;文件上传后使用 FileReader 函数来获取上传文件的内容。因为后面要对图片进行裁切，这里需要把图片放到 canvas 中，需要使用的 drawImage 函数。
&nbsp;&nbsp;&nbsp;&nbsp;canvas 画布的宽高和图片的宽高一致，所以这里需要等图片加载完成后进行设置 canvas 的宽高。代码如下：

```js
const file = e.target.files[0];

const readFile = new FileReader();
readFile.readAsDataURL(file);
ctx.current = canvasRef.current.getContext("2d");
readFile.onload = (e) => {
	const image = new Image();
	image.src = e.target.result;
	image.onload = () => {
		canvas.width = image.width;
		canvas.height = image.height;
		ctx.current.drawImage(image, 0, 0, canvas.width, canvas.height);
	};
};
```

&nbsp;&nbsp;&nbsp;&nbsp;onload 在 readAsDataURL 之后执行是因为 readAsDataURL 启动了一个异步读取过程，而 onload 是该过程完成的回调，用来处理读取成功后的逻辑

## 2、绘制蒙层及截图区域

### 2.1、绘制蒙层

&nbsp;&nbsp;&nbsp;&nbsp;绘制蒙层比较简单，就是在原有的画布上绘制一个宽高相同且具有透明度的矩形，代码如下：

```js
ctx.fillStyle = `rgba(0,0,0,${opacity})`;
ctx.fillRect(0, 0, width, height);
```

### 2.2、绘制截图区域

&nbsp;&nbsp;&nbsp;&nbsp;绘制截图区域需要用到鼠标的三个事件，onMouseDown、onMouseMove、onMouseUp。
&nbsp;&nbsp;&nbsp;&nbsp;onMouseDown 鼠标按下时，记录鼠标的初始位置，并绘制截图区域。
&nbsp;&nbsp;&nbsp;&nbsp;onMouseMove 鼠标按下且移动时，根据鼠标的初始位置和当前位置计算出截图区域的宽高，并绘制截图区域。
&nbsp;&nbsp;&nbsp;&nbsp;onMouseUp 鼠标松开时，结束截图, 并设置鼠标按下状态为 false。
&nbsp;&nbsp;&nbsp;&nbsp;代码如下：

```js
const mouseDown = (e) => {
	setIsPress(true);
	setPoint({
		x: e.nativeEvent.offsetX,
		y: e.nativeEvent.offsetY,
	});
};
const mouseMove = (e) => {
	if (isPress) {
		const endX = e.nativeEvent.offsetX;
		const endY = e.nativeEvent.offsetY;
		const rectWidth = endX - point.x;
		const rectHeight = endY - point.y;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		drawScreenshot(rectWidth, rectHeight, canvas.width, canvas.height);
	}
};
const mouseUp = (e) => {
	setIsPress(false);
};

const drawScreenshot = (rectWidth, rectHeight, canvasWidth, canvasHeight) => {
	drawMask(canvasWidth, canvasHeight, 0.5);

	ctx.globalCompositeOperation = "destination-out";
	ctx.fillStyle = "rgba(255,255,255,1)";
	ctx.fillRect(point.x, point.y, rectWidth, rectHeight);

	ctx.globalCompositeOperation = "destination-over";
	ctx.drawImage(
		img,
		0,
		0,
		canvasWidth,
		canvasHeight,
		0,
		0,
		canvasWidth,
		canvasHeight
	);
};
```

&nbsp;&nbsp;&nbsp;&nbsp;这里用到了全局混合模式(globalCompositeOperation)，全局混合模式可以理解为在绘制图片时，会根据全局混合模式来决定绘制图片的颜色。
&nbsp;&nbsp;&nbsp;&nbsp;globalCompositeOperation 有 12 种模式，这里用到了 destination-out 和 destination-over。destination-out 模式会将绘制的图片与目标图片进行减法运算，将目标图片中与绘制的图片重叠的部分去掉。destination-over 模式会将绘制的图片与目标图片进行加法运算，将绘制的图片覆盖在目标图片上。

## 3、预览截图

&nbsp;&nbsp;&nbsp;&nbsp;鼠标抬起后，截图完成。通过 getImageData 函数获取截图区域的像素数据，然后获取图像预览的位置，图像预览位置的宽高设置为和截图区域的宽高一致。
通过 putImageData 函数将截图区域的像素数据绘制到预览区域的画布上。代码如下：

```js
const getImage = ctx.getImageData(
	point.x,
	point.y,
	e.nativeEvent.offsetX - point.x,
	e.nativeEvent.offsetY - point.y
);
const ctx2 = preview.getContext("2d");
preview.width = e.nativeEvent.offsetX - point.x;
preview.height = e.nativeEvent.offsetY - point.y;
ctx2.putImageData(getImage, 0, 0);
```

## 4、截图下载

&nbsp;&nbsp;&nbsp;&nbsp;常规的下载方法，代码如下：

```js
const dataURL = preview.toDataURL("image/png");
const link = document.createElement("a");
link.href = dataURL;
link.download = "screenshot.png";
link.click();
link.style.display = "none";
document.body.appendChild(link);
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，一个简单的截图预览功能就完成了。
## 代码地址
https://stackblitz.com/edit/vitejs-vite-belb5h?file=src%2FApp.jsx
