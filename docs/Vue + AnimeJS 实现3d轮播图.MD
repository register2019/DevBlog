---
slug: vue-animejs-3d-carousel
title: "Vue + AnimeJS 实现 3D 轮播图"
date: 2026-09-26
category: 动画
excerpt: "计算 translateX、rotateY、scale 与 zIndex 实现 3D 轮播。"
tags: [Vue, 动画]
---

&nbsp;&nbsp;&nbsp;&nbsp;轮播图在开发中是经常用到的，3D轮播图是其中最常用的一种，这里使用Vue3+animejs来实现，效果如下：
![iShot_2024-01-24_21.50.57.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12dad82aa43542cabf1c3c7d610763b5~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2472&h=982&s=2642365&e=png&a=1&b=fdf8f7)
## 基础布局

&nbsp;&nbsp;&nbsp;&nbsp;首先需要设置轮播容器中的子元素位于3D容器中，这是需要设置transform-style。transform-style有两个值，flat：设置元素的子元素位于该元素的平面中、preserve-3d：设置元素的子元素位于3D空间中。<br />
&nbsp;&nbsp;&nbsp;&nbsp;与之对应的还需要设置perspective，指与z=0平面的距离
&nbsp;&nbsp;&nbsp;&nbsp;实现3d效果的轮播图主要需要动态修改transform中translateX，rotateY，scale以及每个图片的层级、透明度。<br />
![iShot_2024-01-24_21.50.57.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12dad82aa43542cabf1c3c7d610763b5~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2472&h=982&s=2642365&e=png&a=1&b=fdf8f7)
&nbsp;&nbsp;&nbsp;&nbsp;由上图可知，缩放比例、层级、透明度三个属性中间值最大，然后两边的值逐级递减。在X轴上的偏移值是以中间图片为基准向左（逐级递减）、向右偏移（逐级递增）。Y轴上的旋转以中间图片为基准左边顺时针旋转，右边逆时针旋转。<br />
&nbsp;&nbsp;&nbsp;&nbsp;这里轮播图为无限轮播效果，处理方式是在初始化的时候保存上述五个参数，因为怎么循环，固定位置对应的五个参数是相同的，在切换的时候就不需要重新计算。<br />
&nbsp;&nbsp;&nbsp;&nbsp;因为使用的是vite，获取静态文件资源的时候需要使用new URL()方法来实现资源的引用。初始化代码如下：

```html
<div style="display: flex; align-items: center; justify-content: center">
  <el-icon size="30" @click="clickArrow('left')"><ArrowLeft /></el-icon>
  <div class="carousel-wrapper" ref="carouselRef">
    <div
      v-for="(carousel, index) in carouselList"
      :key="carousel.id"
      :data-base-id="carousel.id"
      class="item"
      :style="computedStyle(index)"
    >
      <img :src="carousel.url" />
    </div>
  </div>
  <el-icon size="30" @click="clickArrow('right')"><ArrowRight /></el-icon>
</div>
```

```ts
const carouselList = ref([
  {
    id: 1,
    url: new URL('../../assets/images/1.jpg', import.meta.url).href
  },
  {
    id: 2,
    url: new URL('../../assets/images/2.jpg', import.meta.url).href
  },
  {
    id: 3,
    url: new URL('../../assets/images/3.jpg', import.meta.url).href
  },
  {
    id: 4,
    url: new URL('../../assets/images/4.jpg', import.meta.url).href
  },
  {
    id: 5,
    url: new URL('../../assets/images/5.jpg', import.meta.url).href
  }
])

const carouselRef = ref()
type CarouseInfo = {
  x: number[]
  y: number[]
  z: number[]
  opacity: number[]
}
const carouselInfo = reactive<CarouseInfo>({
  x: [],
  y: [],
  z: [],
  opacity: []
})

const baseParams = {
  x: 150,
  xOffset: -300,
  y: -25,
  yOffset: 50,
  opacity: 0.6,
  opacityOffset: 0.2
}

const computedStyle = (i: number) => {
  const { opacity, opacityOffset, xOffset, yOffset } = baseParams
  let z = 0
  let opacityNum = 0
  let x = i * baseParams.x + xOffset
  let y = i * baseParams.y + yOffset
  const centerIndex = (carouselList.value.length - 1) / 2

  if (i <= centerIndex) {
    z = i * 5
    opacityNum = i * opacityOffset + opacity
  } else {
    const baseIndex = i - centerIndex * (i - centerIndex)
    z = baseIndex * 5
    opacityNum = baseIndex * opacityOffset + opacity
  }
  carouselInfo.x.push(x)
  carouselInfo.y.push(y)
  carouselInfo.z.push(z)
  carouselInfo.opacity.push(opacityNum)
  return {
    transform: `translateX(${x}px) rotateY(${y}deg) scale(${opacityNum})`,
    zIndex: z,
    opacity: opacityNum
  }
}
```

```css
.carousel-wrapper {
  width: 900px;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  transform-style: preserve-3d;
  overflow: hidden;
  perspective: 1000px;
}
.item {
  position: absolute;
  user-select: none;
}
```

## 轮播

&nbsp;&nbsp;&nbsp;&nbsp;在项目初始化时保存了初始化参数，点击左侧按钮时，分别获取保存的五个参数中的第一个，然后放到数组中的末尾，点击右侧按钮时，分别获取五个参数中的最后一个，放到数组中的最前面，代码如下：

```ts
const switchPosition = (val: number[], type = 'right') => {
  const target = type === 'right' ? val.shift() : val.pop()
  type === 'right' ? val.push(target!) : val.unshift(target!)
  return val
}
```

&nbsp;&nbsp;&nbsp;&nbsp;为了更好的处理动画，这里使用animejs处理，根据点击之后的参数，重新遍历dom节点，修改每个dom的偏移值、旋转角度、缩放比例、透明度，因为没有在animejs中找到设置层级的属性，所以这里使用原生设置层级。代码如下：

```ts
const clickArrow = (arrowType: string) => {
  const x = switchPosition(carouselInfo.x, arrowType)

  const y = switchPosition(carouselInfo.y, arrowType)
  const z = switchPosition(carouselInfo.z, arrowType)
  const opacity = switchPosition(carouselInfo.opacity, arrowType)

  Array.from(carouselRef.value.children).forEach((item, index) => {
    ;(item as HTMLDivElement).style.zIndex = z[index].toString()
    anime({
      targets: item as HTMLDivElement,
      translateX: x[index],
      rotateY: y[index],
      scale: opacity[index],
      opacity: opacity[index],
      easing: 'linear'
    })
  })
}
```
&nbsp;&nbsp;&nbsp;&nbsp;至此，一个能够循环的3D轮播图就完成了。代码示例如下：
https://stackblitz.com/edit/vitejs-vite-1mgsdu?file=src%2Fassets%2Fimages%2F4.jpg (图片太大了 大家可以自行替换)
