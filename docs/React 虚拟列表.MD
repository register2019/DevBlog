---
slug: react-virtual-list
title: "React 虚拟列表"
date: 2026-09-26
category: 性能优化
excerpt: "可视区容量、加载区间与容器高度计算，实现长列表虚拟滚动。"
tags: [React, 性能优化]
---

&nbsp;&nbsp;&nbsp;&nbsp;最近看了vueuse的useVirtualList的实现方式，发现虚拟滚动效果不错，就尝试着同样的写法改成react版本。 <br />
&nbsp;&nbsp;&nbsp;&nbsp;虚拟列表主要包含三部分组成，示意图如下：

![iShot_2023-08-26_14.32.18.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/181164a459c14fbc82db9af1d89d4120~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1302&h=1334&e=png&a=1&b=ffffff)
&nbsp;&nbsp;&nbsp;&nbsp;定义一个 useVirtualList 的 hook 需要接收两个参数，一是接收所有的数据，二是定义一些配置参数；需要返回的四个参数，一是当前加载的列表，二是获取容器的 ref 和容器滚动事件，三是快速定位的方法，四是内层容器的样式。基本的代码结构如下：

```ts
export type UseVirtualListOptions = {
	// 如果是每条数据的高度相同为number 否则通过方法计算高度
	itemHeight: number | ((index: number) => number);
	overscan?: number;
};

export const useVirtualList = (
	list: AllItems[],
	options: UseVirtualListOptions
): UseVirtualListReturn => {
	const containerRef = useRef(null);
	const [currentList, setCurrentList] = useState<CurrentList[]>([]);
	const [wrapperStyle, setWrapperStyle] = useState({
		width: "100%",
		height: "0px",
		marginTop: "0px",
	});

	return {
		list: currentList,
		containerProps: {
			ref: containerRef,
			onScroll: () => {},
		},
		scrollTop,
		wrapperStyle,
	};
};
```

&nbsp;&nbsp;&nbsp;&nbsp;因为需要容器的高度和滚动距离来计算加载的内容，因此需要在 dom 挂载完成后执行。

### 1、计算容器的的高度能显示的数据

&nbsp;&nbsp;&nbsp;&nbsp;如果 itemHeight 类型为 number，则可以通过容器高度 / itemHeight 来计算容器能显示多少条数据，否则需要把上一次开始索引作为起始值，预估滚动之后能够在可视区域显示多少数据。
```ts
const getViewCapacity = (containerHeight: number) => {
	if (typeof itemHeight === "number") {
		return Math.ceil(containerHeight / itemHeight);
	}
	let sum = 0;
	let capacity = 0;
	const { start = 0 } = state;
	console.log(start);

	for (let i = start; i < list.length; i++) {
		const height = itemHeight(i);
		sum += height;
		if (sum >= containerHeight) {
			capacity = i;
			break;
		}
	}
	return capacity - start;
};
```

### 2、计算滚动偏移的数据量

&nbsp;&nbsp;&nbsp;&nbsp;如果 itemHeight 类型为 number，则可以通过容器高度 / itemHeight 来计算滚动偏移的数据量，否则需要对滚动偏移的 dom 高度进行累加，计算出偏移的数据量。

```ts
const getOffset = (scrollTop: number) => {
	if (typeof itemHeight === "number") {
		return Math.floor(scrollTop / itemHeight) + 1;
	}

	let sum = 0;
	let offset = 0;
	for (let i = 0; i < list.length; i++) {
		const height = itemHeight(i);
		sum += height;
		if (sum >= scrollTop) {
			offset = i;
			break;
		}
	}
	return offset + 1;
};
```

### 3、计算滚动时需要加载的数据

&nbsp;&nbsp;&nbsp;&nbsp;需要加载的数据开始位置 = 滚动偏移量 - 预加载的数量 <br />
&nbsp;&nbsp;&nbsp;&nbsp;需要加载的数据结束位置 = 滚动偏移量 + 可视区域显示数据量 + 预加载数据量 <br />
&nbsp;&nbsp;&nbsp;&nbsp;如果开始位置 < 0 则从 0 开始，结束位置大于总数组长度，则结束位置为总数据的长度

```ts
const from = offset - overscan;
const to = offset + viewCapacity + overscan;
state.start = from < 0 ? 0 : from;
state.end = to > list.length ? list.length : to;

setCurrentList(() => {
	return list.slice(state.start, state.end).map((ele, index) => ({
		data: ele,
		index: index + state.start,
	}));
});
```

### 4、计算列表容器的高度和滚动的高度

&nbsp;&nbsp;&nbsp;&nbsp;列表容器的高度 = 数据长度 \* 预估每条数据的高度 - 滚动偏移的高度<br />
&nbsp;&nbsp;&nbsp;&nbsp;因为加载的数据不是每次都从 0 开始，但每次渲染是从顶部开始的，所以滚动到高度大于数据的高度时，数据位于可视区域的上方，此时需要设置 marginTop，让加载的数据显示在可视区域的顶部，但如果总高度不变，数据全部加载完成后，底部会有大面积留白。

```ts
const computedWrapperStype = () => {
	const offsetTop = getDistanceTop(state.start);

	setWrapperStyle({
		width: "100%",
		height: `${totalHeight() - offsetTop}px`,
		marginTop: `${offsetTop}px`,
	});
};
```

### 5、添加快速定位功能

&nbsp;&nbsp;&nbsp;&nbsp;当在输入框数据要定位的索引值时，可以根据索引值计算出可视区域上方需要偏移的高度，然后重新调用计算需要加载数据开始、结束位置的方法，即可实现快速定位。

```ts
const scrollTop = (index: number) => {
	if (containerRef.current) {
		(containerRef.current as HTMLDivElement).scrollTop = getDistanceTop(index);
		calculateRange();
	}
};
```

### 6、源码地址
https://stackblitz.com/edit/vitejs-vite-oy7obm?file=src%2FApp.tsx
