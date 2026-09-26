---
slug: canvas-big-data-table
title: "React 使用 Canvas 绘制大数据表格"
date: 2026-09-26
category: 可视化
excerpt: "从零绘制表头表体、自定义滚动条与拖拽联动，并处理滚动边界。"
tags: [Canvas, 大数据]
featured: true
---

&nbsp;&nbsp;&nbsp;&nbsp;之前一直想用Canvas做表格渲染的，最近发现了一个很不错的Canvas绘图框架Leafer，api很友好就试着写了一下。<br />
&nbsp;&nbsp;&nbsp;&nbsp;表格渲染主要分为四个部分，1、表头渲染，2、表格渲染，3、滚动条渲染，4、滚动条与表格的联动。
## 1、表头渲染

&nbsp;&nbsp;&nbsp;&nbsp;表头的通过 JSON 格式来设置的，主要包括每列的名称、对应的数据的键值、宽度、是否需要对数据进行二次渲染。<br />
&nbsp;&nbsp;&nbsp;&nbsp;首先需要解决的是表头的正确渲染，这里分为两种情况：<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1、表格列都没有设置宽度<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2、表格列有设置宽度

### 1.1、表格列都没有设置宽度

#### 1.1.1、计算表格每列的宽度

&nbsp;&nbsp;&nbsp;&nbsp;这里已知的是表格的宽度，表格的列数及表格列的名称，解决方案如下：<br />
&nbsp;&nbsp;&nbsp;&nbsp;文本与表格宽度比率 = 表格宽度 / 表格列文本总宽度<br />
&nbsp;&nbsp;&nbsp;&nbsp;每列宽度 = 每列表格文本宽度 \* 文本与表格宽度比率<br />
&nbsp;&nbsp;&nbsp;&nbsp;获取文本宽度方法：

```ts
const getTextWidth = (leafer: Leafer, text: string) => {
	return leafer.canvas.measureText(text).width;
};
```

#### 1.1.2、计算表格每列的开始坐标

&nbsp;&nbsp;&nbsp;&nbsp;初始化表格列数据结构，给表格列添加 width 字符

```ts
const thList = columns.map((item) => {
    return {
      ...item,
      width: item.width
        ? item.width
        : Math.floor(getTextWidth(leafer, item.title) * widthRatio),
    };
});
```

&nbsp;&nbsp;&nbsp;&nbsp;循环遍历表格列 渲染表头

```ts
const group = new Group({ x, y, id: "tableHeader" });

thList.forEach((th, index) => {
	const midLength = thList.slice(0, index).reduce((acc, cur) => {
		return acc + cur.width;
	}, 0);
	const x = index === 0 ? 0 : midLength - index;

	const rect = new Rect({
		x,
		y: 0,
		width: th.width,
		height: initParams.headerHeight,
		fill: "#417A77",
		stroke: "#b4c9fb",
	});
	group.add(rect);
	const text = new Text({
		x,
		y,
		width: th.width,
		textAlign: "center",
		height: headerHeight,
		verticalAlign: "middle",
		fill: "#000000",
		text: th.title,
		fontSize,
	});
	group.add(text);
});
```

&nbsp;&nbsp;&nbsp;&nbsp;到这里为止 表头就可以正常渲染出来了

### 1.2、表格列有设置宽度

&nbsp;&nbsp;&nbsp;&nbsp;与没有设置表格列的渲染类似<br />
&nbsp;&nbsp;&nbsp;&nbsp;文本与表格宽度比率 = (表格宽度 - 表格设置列的总宽度) / 表格列文本总宽度<br />
&nbsp;&nbsp;&nbsp;&nbsp;没有设置宽度的列宽度 = 每列表格文本宽度 \* 文本与表格宽度比率<br />

```ts
const noSetWidthColWidth = columns.reduce((acc, cur) => {
    if (cur.width) {
      return "";
    }
    return acc + cur.title;
}, "");
const textWidth = getTextWidth(leafer, noSetWidthColWidth);
const setColWidthSum = columns.reduce((acc, cur) => {
    if (cur.width) {
      return acc + cur.width;
    }
    return acc;
}, 0);

const widthRatio = (width - setColWidthSum) / textWidth;
```

&nbsp;&nbsp;&nbsp;&nbsp;渲染方式同上，最后挂载到 leafer 中完成渲染

## 2、滚动条渲染

&nbsp;&nbsp;&nbsp;&nbsp;在表格渲染之前要先解决表格滚动条和表格联动的问题，根据滚动条滚动的距离计算表格显示的内容，因为是自绘制表格，所以滚动条部分不能利用浏览器的滚动条。

### 2.1、创建滚动条

&nbsp;&nbsp;&nbsp;&nbsp;滚动条的本质还是一个 Rect，使 Rect 模拟滚动条的行为。

```ts
const rect = new Rect({
	x: width - scrollBar.width,
	y: initParams.headerHeight,
	width: scrollBar.width - scrollBar.margin * 2,
	height: scrollBar.height,
	fill: "rgba(133,117,85, 0.8)",
	cornerRadius: 10,
	id: "scrollBar",
	zIndex: scrollBar.zIndex,
});
```

### 2.2、计算滚动条的高度、位置、样式

#### 2.2.1、计算滚动条的高度

&nbsp;&nbsp;&nbsp;&nbsp;根据数据量的大小，需要调整滚动条渲染的高度，计算方式如下：<br />
&nbsp;&nbsp;&nbsp;&nbsp;每条数据对应滚动条高度 = (表格总高度 - 表头高度) / 数据长度 <br />
&nbsp;&nbsp;&nbsp;&nbsp;滚动条高度 = 滚动条最小高度 + 视图内显示行数 \* 每条数据对应滚动条高度

```ts
const computedScrollBarHeight = (
	leafer: Leafer,
	dataSource: Record<string, string>[],
	jumpIndex = 0
) => {
	const { height } = leafer;
	const { viewHeight, viewCapacity } = getViewInfo(leafer);
	const unitLength = (height - initParams.headerHeight) / dataSource.length;
	if (jumpIndex) {
      return initParams.scrollBar.height;
	}

	const targetHeight = initParams.scrollBar.height + viewCapacity * unitLength;
	// 小数据量做临时处理
	return targetHeight < viewHeight ? Math.ceil(targetHeight) : viewHeight - 10;
};
```

#### 2.2.2、滚动条的位置

&nbsp;&nbsp;&nbsp;&nbsp;滚动条的 X 轴位置 = 表格的宽度 - 滚动条区域的宽度<br />
&nbsp;&nbsp;&nbsp;&nbsp;滚动条的 Y 轴滚动需要添加鼠标滚轮和拖拽事件的监听，对滚动条拖拽事件的监听是通过监听滚动条本身，鼠标滚轮的监听需要对表格本身添加监听事件

```ts
leafer.on(MoveEvent.MOVE, function (e) {
	setScroll(leafer, rect, e, dataSource, -0.1, scrollParams);
});

rect.on(DragEvent.DRAG, function (e) {
	setScroll(leafer, rect, e, dataSource, 1, scrollParams);
});
```

&nbsp;&nbsp;&nbsp;&nbsp;滚动条的最大滚动高度 = 表格的高度 - 滚动条高度<br />
&nbsp;&nbsp;&nbsp;&nbsp;滚动条的渲染是从设置的坐标点开始 + 滚动条的高度，保证滚动条在可视区域内，需要减去滚动条的高度。<br />
&nbsp;&nbsp;&nbsp;&nbsp;当滚动或拖拽计算值超过最大高度时，为最大高度；当滚动或拖拽计算值小于表头高度时，为表头高度，其他情况为滚动条在 Y 轴方向的偏移值 + 鼠标滚轮滚动的距离或拖拽的距离

```ts
const setScroll = (
	leafer: Leafer,
	rect: Rect,
	e: MoveEvent | DragEvent,
	dataSource: Record<string, string>[],
	val = 1,
	scrollInfo: ScrollInfo
) => {
	const {
		scrollMaxHeight,
		headerHeight,
		height,
		scrollBar,
		viewCapacity,
		unitLength,
	} = scrollInfo;
	leafer.children = leafer.children.filter((item) =>
		fixedGroup.includes(item.id ?? "")
	);
	/**
	 * 鼠标滚轮的滚动向上滚动是正值，向下是负值
	 * 这与滚动条位置是相反的，需要在获取滚动距离时 * -1
	 *  */
	rect.y =
		rect.y + e.moveY * val >= scrollMaxHeight
			? scrollMaxHeight
			: rect.y + e.moveY * val < headerHeight
			? headerHeight
			: rect.y + e.moveY * val;
};
```

#### 2.2.3、滚动条的样式

&nbsp;&nbsp;&nbsp;&nbsp;滚动条 = 滚动条本身 + 左右边距<br />
&nbsp;&nbsp;&nbsp;&nbsp;滚动条本身宽度 = 滚动条宽度 - 边距 \* 2<br />
&nbsp;&nbsp;&nbsp;&nbsp;鼠标移入移出滚动条时会有显隐效果，通过对 Rect 添加移入移出事件来修改透明度

```ts
rect.on(PointerEvent.ENTER, (e) => {
	e.target.fill = "rgba(133,117,85, 1)";
});
rect.on(PointerEvent.LEAVE, (e) => {
	e.target.fill = "rgba(133,117,85, 0.8)";
});
```

### 2.3、滚动条是否显示

&nbsp;&nbsp;&nbsp;&nbsp;当数据长度小于可视区域内的行数时，此时不需要出滚动条，在初始化表格调用滚动条方法添加判断。

```ts
export const drawCanvasTable = (
	leafer: Leafer,
	columns: Column[],
	dataSource: Record<string, string>[],
	jumpIndex = 0
) => {
	// ...
	dataSource.length > viewCapacity &&
		initScrollBar(leafer, dataSource, jumpIndex);
};
```

## 3、表格渲染

### 3.1、初始化渲染

&nbsp;&nbsp;&nbsp;&nbsp;表格的渲染类似于表头的渲染，表格的渲染是按照行来渲染，每行的列坐标、宽度是和表头一样的，可以在表格渲染的部分保存一份。

```ts
thList.forEach((th, index) => {
	const midLength = thList.slice(0, index).reduce((acc, cur) => {
		return acc + cur.width;
	}, 0);
	const x = index === 0 ? 0 : midLength - index;
	tableHeaderInfo[th.dataIndex] = {
		x,
		width: th.width,
	};
	// ...省略渲染部分...
});
```

### 3.2、获取渲染的范围

&nbsp;&nbsp;&nbsp;&nbsp;表格渲染内容的起始位置是通过滚动条位置来计算的，并通过滚动条位置的变化来重新渲染表格。<br />
&nbsp;&nbsp;&nbsp;&nbsp;滚动距离等于最大滚动距离时，渲染的起始位置为数据总长度 - 视图可显示的行数。<br />
&nbsp;&nbsp;&nbsp;&nbsp;滚动距离小于最大滚动距离时：<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;滚动条偏移范围内需要渲染的数据单位长度 = (表格高度 - 表格头高度 - 滚动条高度) / (数据长度 - 视图可显示行数)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;渲染的起始位置 = (滚动条位置 - 表格头高度) / 滚动条偏移范围内需要渲染的数据单位长度

```ts
const setScroll = (
	leafer: Leafer,
	rect: Rect,
	e: MoveEvent | DragEvent,
	dataSource: Record<string, string>[],
	val = 1,
	scrollInfo: ScrollInfo
) => {
	// ...计算滚动条位置代码...

	from =
     rect.y === scrollMaxHeight
       ? dataSource.length - viewCapacity
       : Math.ceil((rect.y - headerHeight) / unitLength);

	initTableBody();
};
```

&nbsp;&nbsp;&nbsp;&nbsp;当数据大于表格视图行数时，表格结束范围 = 起始位置 + 表格视图可以显示的最大行数，如果计算值大于数据最大长度，则为数据长度，否则表格的结束范围 = 数据长度

```ts
const computedViewBoundary = (
	i: number,
	start: number,
	viewCapacity: number,
	dataSource: Record<string, string>[]
) => {
	if (dataSource.length > viewCapacity) {
     return (i < start + viewCapacity && start + viewCapacity <= dataSource.length);
	} else {
     return i < dataSource.length;
	}
};
```

### 3.3、计算表格 Y 轴方向的偏移

&nbsp;&nbsp;&nbsp;&nbsp;因为计算视图内可以显示的表格行时，会有小数的存在，这里是采用向下取整，这样显示的行数总高度会超过表格的可视区域高度，这时候需要对表格进行部分偏移，使其在滚动到底部时能够正常显示<br />
&nbsp;&nbsp;&nbsp;&nbsp;1、数据长度小于可视区域行数时，不需要偏移<br />
&nbsp;&nbsp;&nbsp;&nbsp;2、数据长度大于可视区域行数时<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.1 开始位置小于需要随滚动条渲染的数据长度时，不需要偏移<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.2 开始位置大于等于需要随滚动条渲染的数据长度时: <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.2.1 如果表格行高可以被视图高度整除，不需要偏移<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.2.2 如果表格行高不可以被视图高度整除，偏移值 = 表格头高度 - (表格行高 - 视图高度 % 行高)

```ts
const computedTableOffset = (
	viewCapacity: number,
	headerHeight: number,
	viewHeight: number,
	rowHeight: number
) => {
	return globalDataSource.length > viewCapacity
     ? from < Math.floor(globalDataSource.length - viewCapacity)
	     ? headerHeight
		: headerHeight -
	         (viewHeight % rowHeight ? rowHeight - (viewHeight % rowHeight) : 0)
	     : headerHeight;
};
```

## 4、跳转到指定位置

&nbsp;&nbsp;&nbsp;&nbsp;当表格数据量大时，需要能够快速定位到某条数据，当接收到需要跳转到的行时，该数据为起始位置，重新执行渲染表格一系列方法，因为在滚动条初始化时修改了滚动条的初始高度，所以在跳转操作时不应该修改表格行的高度

```tsx
useEffect(() => {
	if (canvasDom.current) {
		const leafer = new Leafer({
			view: canvasDom.current,
			width: 500,
			height: 800,
			move: { dragOut: false },
			type: "user",
		});

		drawCanvasTable(leafer, columns, dataSource, jumpIndex);
	}
}, [columns, dataSource, jumpIndex]);
```

```ts
if (jumpIndex) {
	return initParams.scrollBar.height;
}
```
## 代码地址：
&nbsp;&nbsp;&nbsp;&nbsp;https://stackblitz.com/edit/vitejs-vite-emryft?file=src%2FApp.tsx
