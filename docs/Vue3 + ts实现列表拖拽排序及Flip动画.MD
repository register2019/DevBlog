---
slug: vue3-flip-drag-sort
title: "Vue3 + TS 实现列表拖拽排序及 Flip 动画"
date: 2026-09-26
category: 动画
excerpt: "原生 drag 事件重排列表，并手写 Flip 四阶段过渡动画。"
tags: [Vue3, 动画]
featured: true
---

&nbsp;&nbsp;&nbsp;&nbsp;列表拖拽功能允许用户通过拖拽操作重新排列列表中的项目。本项目使用 Vue 3 和 TypeScript 实现了一个具有拖拽功能的列表组件，并结合 FLIP 动画技术，使得拖拽过程更加流畅和自然。

## 列表拖拽

&nbsp;&nbsp;&nbsp;&nbsp;列表拖拽主要是当前拖拽的 dom 节点，以及目标 dom 节点之间的位置关系发生交换，这里用到了 dragStart，dragEnter，dragEnd 事件。代码如下：

```typescript
const dragStart = (e: DragEvent) => {};
const dragEnter = (e: DragEvent) => {};
const dragEnd = (e: DragEvent) => {};
```

```tsx
<div class={style.wrapper}>
	<div
    id='parent'
	  class={style.inner}
	  onDragstart={(e) => dragStart(e)}
	  onDragenter={(e) => dragEnter(e)}
	  onDragend={(e) => dragEnd(e)}
	>
	  <div draggable={true}>1</div>
	  <div draggable={true}>2</div>
	  <div draggable={true}>3</div>
	  <div draggable={true}>4</div>
	  <div draggable={true}>5</div>
    <div draggable={true}>6</div>
	  <div draggable={true}>7</div>
	  <div draggable={true}>8</div>
	  <div draggable={true}>9</div>
	  <div draggable={true}>10</div>
	</div>
</div>
```

&nbsp;&nbsp;&nbsp;&nbsp;拖拽元素设置 draggable 属性为 true，否则无法拖拽。
&nbsp;&nbsp;&nbsp;&nbsp;dragStart 事件，在拖拽开始时触发，这里可以记录当前拖拽的 dom 节点。
&nbsp;&nbsp;&nbsp;&nbsp;dragEnter 事件，在拖拽元素进入目标元素时触发，这里可以记录目标 dom 节点。这里需要注意，如果当前获取的节点是父节点或者是拖拽元素本身的节点，则不进行处理。这时候需要再 dom 渲染完成时获取父节点。添加代码如下：

```typescript
import { onMounted } from "vue";

onMounted(() => {
	oParent = document.getElementById("parent");
});

...省略部分代码
```

&nbsp;&nbsp;&nbsp;&nbsp;到这里，我们可以确定目标节点与当前节点的位置关系了，然后交换位置。如果拖拽节点的索引值大于目标节点的索引值，则是从上往下拖拽，反之则是从下往上拖拽。代码如下：

```typescript
const dragEnter = (e: DragEvent) => {
	if (e.target === oParent || e.target === oTarget) return;
	const targetIndex = Array.from(oParent?.children as HTMLCollection).indexOf(
		oTarget as HTMLElement
	);
	const currIndex = Array.from(oParent?.children as HTMLCollection).indexOf(
		e.target as HTMLElement
	);

	if (targetIndex > currIndex) {
		e.target &&
			oTarget &&
			oParent?.insertBefore(
				oTarget as HTMLDivElement,
				e.target as HTMLDivElement
			);
	} else {
		e.target &&
			oTarget &&
			oParent?.insertBefore(
				oTarget as HTMLDivElement,
				(e.target as HTMLDivElement).nextElementSibling
			);
	}
};
```

&nbsp;&nbsp;&nbsp;&nbsp;因为使用 insertBefore 方法，当从上往下拖拽时，需要获取目标节点的下一个兄弟节点，反之则是获取目标节点本身。
&nbsp;&nbsp;&nbsp;&nbsp;为了使拖拽效果更加明显，这里可以设置拖拽节点的透明度，如果在刚开始拖拽就设置透明度，则看不到拖拽的节点，可以添加一个延时。代码如下：

```typescript
const dragStart = (e: DragEvent) => {
	oTarget = e.target;
	setTimeout(() => {
		(e.target as HTMLDivElement).style.opacity = "0";
	}, 100);
};
```

&nbsp;&nbsp;&nbsp;&nbsp;最后，拖拽结束，需要将透明度设置为 1，代码如下：

```typescript
const dragEnd = (e: DragEvent) => {
	(e.target as HTMLDivElement).style.opacity = "1";
};
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，简单的列表拖拽就完成了。但是这种拖拽效果有些生硬，我们可以添加 Flip 动画，让拖拽效果更加明显。

## Flip 动画

&nbsp;&nbsp;&nbsp;&nbsp;FLIP 是四个单词的首字母，First、Last、Invert、Play，这四个单词给我们提供了完成动画的具体思路。
<br />
First 表示元素初始时的具体信息，在 html 环境中，这个事情是比较容易就能做到的，我们可以利用 getBoundingClientRect 或者 getComputedStyle 来拿到元素的初始信息
<br />
Last 表示元素结束时的位置信息。此时我们可以直接改变元素的位置，把元素放到新的节点上去。这样我们就可以直接使用同样的方式拿到结束时的元素具体信息
<br />
Invert 表示倒置。虽然元素到了结束时的节点位置，但是视觉上我们并没有看到，此时要设计让元素动画从 First 通过动画的方式变换到 Last，刚好我们又记录了动画的开始和结束信息，因此我们可以利用自己熟悉的动画方式来完成 Invert
<br />
Play 表示动画开始执行。在代码上通常 Invert 表示传参，Play 表示具体的动画执行。
&nbsp;&nbsp;&nbsp;&nbsp;Flip 动画用到列表拖拽中，insertBefore 方法完成了 dom 元素的重排，在浏览器渲染之前，把需要移动的元素偏移到原来的位置，在渲染的时候通过偏移+过渡动画完成 Flip 动画。

&nbsp;&nbsp;&nbsp;&nbsp;根据 Flip 动画的原理，我们先处理元素的位置。代码如下：

```typescript
class FlipDom {
	private firstPosition: { x: number | null; y: number | null };

	constructor(element: HTMLElement) {
		this.firstPosition = {
			x: null,
			y: null,
		};
	}
	getDomPosition(): { x: number; y: number } {
		const { left, top } = this.element.getBoundingClientRect();
		return {
			x: left,
			y: top,
		};
	}

	recordFirst(firstPosition?: { x: number; y: number }): void {
		if (!firstPosition) {
			firstPosition = this.getDomPosition();
		}
		this.firstPosition.x = firstPosition.x;
		this.firstPosition.y = firstPosition.y;
	}
}
class Flip {
	constructor(elements: HTMLCollection) {}
}
```

&nbsp;&nbsp;&nbsp;&nbsp;这里只是记录了元素初始化的位置信息，还需要记录动画完成之后的位置信息，添加代码如下：

```typescript
class FlipDom {
  private readonly transitionEndHandler: () => void;

  constructor(element: HTMLElement) {
    this.transitionEndHandler = () => {
			this.isPlaying = false;
			this.recordFirst();
		};
  }
  ...省略部分代码
  *play(): Generator<string> {
    this.element.removeEventListener(
      "transitionend",
      this.transitionEndHandler
    );
    this.element.addEventListener(
      "transitionend",
      this.transitionEndHandler
    );
  }
}
```

&nbsp;&nbsp;&nbsp;&nbsp;因为是通过过渡动画来实现效果，这里还需要一个过渡时间，同时需要一个是否正在播放动画的标记。通过计算每次位置的差值，计算出需要的偏移量，代码如下：

```typescript
*play(): Generator<string> {
  if (!this.isPlaying) {
    this.element.style.transition = "none";
    const lastPosition = this.getDomPosition();
    const dis = {
      x: lastPosition.x - (this.firstPosition.x ?? 0),
      y: lastPosition.y - (this.firstPosition.y ?? 0),
    };

    if (!dis.x && !dis.y) {
      return;
    }
    this.element.style.transform = `translate(${-dis.x}px, ${-dis.y}px)`;
    yield "moveToFirst";
    this.isPlaying = true;
  }

  this.element.style.transition = this.transition;
  this.element.style.transform = "none";
}

```

&nbsp;&nbsp;&nbsp;&nbsp;在处理完节点的位置及偏移后，就可以开始处理动画部分，通过循环每个节点处理的事件，来实现动画效果。代码如下：

```typescript
play(): void {
  let gs = Array.from(this.flipElements)
    .map((it) => {
      const generator = it.play();

      return {
        generator,
        iteratorResult: generator.next(),
      };
    })
    .filter((it) => !it.iteratorResult.done);

  while (gs.length) {
    document.body.clientWidth;

    gs = gs
      .map((it) => {
        it.iteratorResult = it.generator.next();
        return it;
      })
      .filter((it) => !it.iteratorResult.done);
  }
}
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，Flip 动画的前期准备已经完成，下面我们添加到拖拽排序的方法中，代码如下：

```typescript
let flip: Flip;

const dragStart = (e: DragEvent) => {
  ...
	oParent && (flip = new Flip(oParent.children, duration));
};
const dragEnter = (e: DragEvent) => {
	...
  flip?.play();
};
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，有 Flip 动画的拖拽排序就完成了。
&nbsp;&nbsp;&nbsp;&nbsp;代码地址：https://stackblitz.com/edit/vitejs-vite-ek3sz2?file=src%2Fcomponents%2Fflip.ts
