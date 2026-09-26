---
slug: vue3-canvas-marquee-select
title: "Vue3 + Canvas 实现鼠标框选范围元素"
date: 2026-09-26
category: 可视化
excerpt: "按下、移动、抬起三阶段绘制选框，并判断元素是否落在框内。"
tags: [Canvas, 交互]
---

&nbsp;&nbsp;&nbsp;&nbsp;在开发中遇到一个需求，类似windows的鼠标绘制一个框选区域，在框选区域中的元素被选中并且能够设置背景颜色，同时按下shift、ctrl键能够追加选中的元素，接下来的实现用到了Canvas封装的一些方法，可以参考之前的文章，链接如下：<br />
&nbsp;&nbsp;&nbsp;&nbsp;[Canvas扩展 判断点击位置是否位于绘制图形中 - 掘金 (juejin.cn)](https://juejin.cn/post/7287020579831857186)

![iShot_2023-12-06_21.32.51.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/01c19f0272794c60965d5018e723ab0c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1216&h=954&s=36326&e=png&a=1&b=1b1b1b)
## 1、初始化

&nbsp;&nbsp;&nbsp;&nbsp;因为框选的区域是针对整个浏览器的，所以画布的宽度要与浏览器可视区域的宽高保持一致。因为在鼠标移动和鼠标左键抬起时，也需要用到画布的相关方法，这时需要吧画布对象暴露给全局。具体代码如下：

```html
<template>
  <div class="wrapper">
    <canvas id="canvas" class="canvas"></canvas>
  </div>
</template>
```

```typescript
const drawer = ref<Drawer>()

const initCanvas = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  canvas.width = window.innerWidth - 20
  canvas.height = window.innerHeight - 20
  drawer.value = new Drawer({ view: canvas })
}

onMounted(() => {
  initCanvas()
})
```

&nbsp;&nbsp;&nbsp;&nbsp;到这里画布的初始化就完成了，然后添加一些元素用于框选，因为被框选的元素在canvas的上方，所以需要调整css布局，调整代码如下：

```html
<template>
  <div class="wrapper">
    <div class="rect-wrapper">
      <div v-for="i in 8" :key="i" :data-id="i" class="rect-style"></div>
    </div>
    <canvas id="canvas" class="canvas"></canvas>
  </div>
</template>
```

```css
.wrapper {
  height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.rect-wrapper {
  height: 150px;
  width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.rect-style {
  width: 50px;
  height: 50px;
  background-color: #490eff;
  margin: 10px;
}
.canvas {
  position: absolute;
  top: 0;
  left: 0;
}
```

&nbsp;&nbsp;&nbsp;&nbsp;到这里，画布和被框选元素的准备工作完成。

## 2、绘制框选区域

&nbsp;&nbsp;&nbsp;&nbsp;鼠标左键按下时开始绘制，记录当前鼠标点击的坐标作为开始坐标，鼠标左键按下之后开始记录鼠标移动的坐标作为结束坐标，获取开始坐标和结束坐标后能够绘制鼠标框选区域，绘制之前需要先清除之前绘制的区域，当鼠标左键抬起时，清空画布。
&nbsp;&nbsp;&nbsp;&nbsp;由此可知，我们需要监听鼠标左键按下、移动、抬起三个事件，代码如下：

```typescript
type AreaPoint = {
  startX: number
  startY: number
  endX: number
  endY: number
}
const areaPoint = reactive<AreaPoint>({
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0
})

// 是否开始获取坐标
const startMove = ref(false)

const mouseDown = (e: MouseEvent) => {
  startMove.value = true
  const { x, y } = e
  areaPoint.startX = x
  areaPoint.startY = y
}
const mouseMove = (e: MouseEvent) => {
  if (startMove.value) {
    const { x, y } = e
    areaPoint.endX = x
    areaPoint.endY = y

    drawer.value?.clear()

    const { startX, startY, endX, endY } = areaPoint
    const rect = new Rect(
      { x: startX, y: startY, width: endX - startX, height: endY - startY, isFill: false },
      'rect'
    )

    drawer.value?.add(rect)
  }
}
const mouseUp = (e: MouseEvent) => {
  const { screenX, screenY } = e
  areaPoint.endX = screenX
  areaPoint.endY = screenY
  startMove.value = false
  drawer.value?.clear()
}

onMounted(() => {
  bindEvent()
  ...
})

onBeforeUnmount(() => {
  window.removeEventListener('mousedown', mouseDown)
  window.removeEventListener('mousemove', mouseMove)
  window.removeEventListener('mouseup', mouseUp)
})
```

## 3、选中框选区域中的元素

&nbsp;&nbsp;&nbsp;&nbsp;因为根据框选区域是根据坐标来计算的，所以需要在框选之前获取到所有的坐标及宽、高，代码如下：

```typescript

type RectInfo = {
  id: number
  x: number
  y: number
  width: number
  height: number
}

const rectInfoList = ref<RectInfo[]>([])

const getAllDomPoint = () => {
  const getAllDom = document.querySelector('.rect-wrapper')!.children
  for (const key of getAllDom) {
    const { x, y, width, height } = key.getBoundingClientRect()
    rectInfoList.value.push({
      id: Number((key as HTMLElement).dataset.id),
      x,
      y,
      width,
      height
    })
  }
}

onMounted(() => {
  getAllDomPoint()
  ...
})
```

&nbsp;&nbsp;&nbsp;&nbsp;根据鼠标的移动，需要判断被框选元素是否在框选区域中，鼠标框选示例如下：

![框选方向.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cad5dcf501da4cd19110513139ebabdc~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2376&h=668&s=123766&e=png&b=252c32)
&nbsp;&nbsp;&nbsp;&nbsp;由图中可以看出，框选区域主要有以上4类，为了方便处理，设置最终的开始坐标永远小于结束坐标，代码如下：

```typescript
const computedIsSelected = (areaPoint: AreaPoint, rectInfo: RectInfo) => {
  const { startX, startY, endX, endY } = areaPoint
  const { x, y, width, height } = rectInfo
  const finalStartX = startX > endX ? endX : startX
  const finalStartY = startY > endY ? endY : startY
  const finalEndX = startX > endX ? startX : endX
  const finalEndY = startY > endY ? startY : endY
}
```

&nbsp;&nbsp;&nbsp;&nbsp;示例图中的判断被框选元素是否在框选区域中需要根据框选元素的四个点的坐标，所以需要先计算四个点的坐标，代码如下：

```typescript
const { startX, startY, endX, endY } = areaPoint
const { x, y, width, height } = rectInfo
...
const rectPointTopLeft = {
  x,
  y
}
const rectPointTopRight = {
  x: x + width,
  y
}
const rectPointBottomLeft = {
  x,
  y: y + height
}
const rectPointBottomRight = {
  x: x + width,
  y: y + height
}
```

&nbsp;&nbsp;&nbsp;&nbsp;图例与判断条件的对应关系如下：

![左上角在框选范围.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4d6735488a2244d8970ee5be2cfef11a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1282&h=598&s=83097&e=png&b=212529)

![右上角在框选范围.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/050c8ce0a70448b3b1133748817802d4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1299&h=625&s=81896&e=png&b=212529)

![左下角在框选范围.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/043511e032d94361ab88f09e750dc378~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1377&h=628&s=90915&e=png&b=212529)


![右下角在框选范围.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f47a3af68eb644f7a07e6151ea753146~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1324&h=589&s=91559&e=png&b=212529)

![框选范围终点在元素内.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f89a7fae196940b78178b380f95c26b0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1341&h=426&s=74834&e=png&b=212529)

![框选范围起点在元素内.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8779a630243c4a3c81d8d0c0de8e9316~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1293&h=426&s=75564&e=png&b=212529)

![框选范围在元素内横向穿过元素.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4ab310be40bb49c18f1e1d958c0e6da5~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1544&h=450&s=105414&e=png&b=212529)

![框选范围在元素内纵向穿过元素.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/74f9d6f855bc47818e11d102c72506f4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1143&h=866&s=117257&e=png&b=212529)
&nbsp;&nbsp;&nbsp;&nbsp;至此，在框选区域中的元素能够被选中，代码如下：

```html
<template>
  <div class="wrapper">
    <div class="rect-wrapper">
      <div
        ...
        :style="{
          backgroundColor: highRectList.find((item) => item.id === i) ? 'green' : ''
        }"
      ></div>
    </div>
  </div>
</template>
```

```typescript
const mouseMove = (e: MouseEvent) => {
  if (startMove.value) {
    ...
    rectInfoList.value.forEach((item) => {
      const { id } = item
      if (computedIsSelected(areaPoint, item)) {
        !highRectList.value.find((item) => item.id === id) &&
          highRectList.value.push({
            id
          })
      }
    })
    drawer.value?.add(rect)
  }
}
```

&nbsp;&nbsp;&nbsp;&nbsp;但是在鼠标框选还未抬起鼠标左键之前，有可能会缩小框选区域，缩小之前被选中的元素应该取消选中，这里通过遍历被选中的元素，过滤出在框选区域中的元素，代码如下：

```typescript
const mouseMove = (e: MouseEvent) => {
  if (startMove.value) {
   ...
    rectInfoList.value.forEach((item) => {
      const { id } = item
      if (computedIsSelected(areaPoint, item)) {
       ...
      } else {
        highRectList.value = highRectList.value.filter((item) => item.id !== id)
      }
    })
    drawer.value?.add(rect)
  }
}
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，通过鼠标移动选中元素的功能基本完成。在系统中，按下shift然后继续框选，之前的应该也应该保留。

## 4、按下shift、ctrl继续框选

&nbsp;&nbsp;&nbsp;&nbsp;按下shift、ctrl继续框选是在第一次框选之后，所以在鼠标抬起时需要对选中的元素添加已选中的标记，修改代码如下：

```typescript
type RectInfo = {
  ...
  isSelected: boolean
}

const mouseUp = (e: MouseEvent) => {
  ...
  highRectList.value.forEach((item) => {
    item.isSelected = true
  })
```

&nbsp;&nbsp;&nbsp;&nbsp;添加键盘监听事件，判断shift、ctrl是否按下，代码如下：

```typescript
const keyIsPress = ref(false)

const keyDown = (e: KeyboardEvent) => {
  if (e.key === 'Shift') {
    keyIsPress.value = true
  }

  if (e.key === 'Control') {
    keyIsPress.value = true
  }
}
const keyUp = () => {
  keyIsPress.value = false
}

function bindEvent() {
  ...
  window.addEventListener('keydown', keyDown)
  window.addEventListener('keyup', keyUp)
}
```

&nbsp;&nbsp;&nbsp;&nbsp;修改鼠标移动时判断元素是否被框选的判断条件，如果元素中isSelected为true，说明已被选中，按下shift、ctrl再次选中时不清除，当按下shift、ctrl框选到已经选中的元素，isSelected设置为false，当缩小框选区域是能够取消选中，否则查找当前被选中的元素，修改代码如下：

```typescript
const mouseMove = (e: MouseEvent) => {
  if (startMove.value) {
    ...

    rectInfoList.value.forEach((item) => {
      const { id } = item
      if (computedIsSelected(areaPoint, item)) {
       const target = highRectList.value.find((item) => item.id === id)
        if (target) {
          target.isSelected = false
        } else {
          highRectList.value.push({
            id
          })
        }
      } else {
        const tempArr: HighRect[] = []
        highRectList.value.forEach((item) => {
          if (item.isSelected) {
            tempArr.push(item)
          } else {
            if (item.id !== id) {
              tempArr.push(item)
            }
          }
        })
        highRectList.value = [...tempArr]
      }
    })
    drawer.value?.add(rect)
  }
}
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，鼠标移动框选的功能基本完成。

## 代码地址：
https://stackblitz.com/edit/vitejs-vite-dsq2mp?file=src%2Fstyle.css
