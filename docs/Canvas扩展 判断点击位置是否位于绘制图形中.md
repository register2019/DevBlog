---
slug: canvas-hit-test-shape
title: "Canvas 扩展，判断点击位置是否位于绘制图形中"
date: 2026-09-26
category: 可视化
excerpt: "矩形四顶点坐标计算与包含关系判断，实现图形命中检测。"
tags: [Canvas, 几何计算]
---

&nbsp;&nbsp;&nbsp;&nbsp;之前一篇文章介绍了如何判断一个点是否位于Canvas内，但不能够判断某个点是否位于某个区域内，现在对其进行补充，然后对常用的绘制图形、线段、文本的方法进行封装。<br />
&nbsp;&nbsp;&nbsp;&nbsp;首先，创建一个容器，用来接收后续创建的图形、线段、文本。使用方式如下：

```ts
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const drawer = new Drawer({ view: canvas })
const rect = new Rect({ x: 0, y: 0, width: 100, height: 100 }, 'rect')
const line = new Line({ x1: 100, y1: 100, x2: 200, y2: 200, lineWidth: 10 }, 'line')
const text = new Text({ x: 200, y: 200, text: 'Canvas', font: '50px' }, 'Canvas')
rect.on('click', (val) => {
  console.log('--rect--', val)
})
line.on('click', (val) => {
  console.log('--line--', val)
})
text.on('click', (val) => {
  console.log('--text--', val)
})

drawer.add(rect)
drawer.add(line)
drawer.add(text)
```

## 1、创建容器

&nbsp;&nbsp;&nbsp;&nbsp;为了以后容器扩展，这里使用object类型来作为参数，必须的参数是绘制canvas的dom元素，以及添加到容器的方法，代码如下：

```ts
class Drawer {
  view: HTMLCanvasElement
  constructor(params: Params) {
    this.view = params.view
  }

  add(info: Info) {}
}
```

&nbsp;&nbsp;&nbsp;&nbsp;因为后面需要处理绘制图形、线段、文本的点击事件，这里使用addPath方法来添加绘制的路径进行绘制，由于Path2D中没有绘制文本路径的方法，所以绘制文本不需要path参数，代码如下：

```ts
class Drawer {
  view: HTMLCanvasElement
  path?: Path2D
  constructor(params: Params) {
    this.view = params.view
    this.path = new Path2D()
  }

  add(info: Info) {
    const { path, isFill } = info
    this.path.addPath(path)
    // 这里以绘制图形为例
    if (isFill) {
      this.ctx.fill(this.path)
    } else {
      this.ctx.stroke(this.path)
    }
  }
}
```

## 2、绘制图形、线段、文本

&nbsp;&nbsp;&nbsp;&nbsp;这里需要绘制图形、线段、文本的基本参数以及UI的各种参数，代码如下：

```ts
export default class Rect {
  options: Options
  path: Path2D
  constructor(options: Options, params: any) {
    this.options = options
    this.path = new Path2D()
    this.init()
  }

  init() {
    this.path = this.draw()
  }

  draw() {
    const { x, y, width, height } = this.options
    const path = new Path2D()
    path.rect(x, y, width, height)
    return path
  }
}

export default class Line {
  options: Options
  path: Path2D
  constructor(options: Options, params: any) {
    this.options = options
    this.path = new Path2D()
    this.init()
  }

  init() {
    this.path = this.draw()
  }

  draw() {
    const { x1, y1, x2, y2 } = this.options
    const path = new Path2D()
    path.moveTo(x1, y1)
    path.lineTo(x2, y2)
    return path
  }
}

class Drawer {
  view: HTMLCanvasElement
  path?: Path2D
  constructor(params: Params) {
    this.view = params.view
    this.path = new Path2D()
  }

  drawRect(info: Info) {
    const {
      options: { isFill = true },
      path = new Path2D(),
      tag,
      params,
      clickCallBack
    } = info
    this.path.addPath(path)
    if (isFill) {
      this.ctx.fillStyle = '#32cd79'
      this.ctx.fill(this.path)
    } else {
      this.ctx.strokeStyle = '#32cd79'
      this.ctx.stroke(this.path)
    }
  }

  drawLine(info: Info) {
    const {
      options: { color = '#32cd79', lineWidth = 1, lineJoin = 'round' },
      path = new Path2D(),
      tag,
      params,
      clickCallBack
    } = info
    this.ctx.lineWidth = lineWidth
    this.ctx.lineJoin = lineJoin
    this.ctx.strokeStyle = color
    this.ctx.stroke(path)
  }

  drawText(info: Info) {
    const {
      options: { x, y, text, font = '16px serif', isFill = true, color = '#32cd79' },
      tag,
      params,
      clickCallBack
    } = info

    this.ctx.textBaseline = 'middle'
    if (isFill) {
      this.ctx.fillStyle = color
      this.ctx.fillText(text, x, y)
    } else {
      this.ctx.strokeStyle = color
      this.ctx.strokeText(text, x, y)
    }
  }

  add(info: Info) {
    switch (info.tag) {
      case DRAWER_UI.TEXT:
        this.drawText(info)
        break
      case DRAWER_UI.RECT:
        this.drawRect(info)
        break
      default:
        this.drawLine(info)
        break
    }
  }
}
```

## 3、添加点击事件

&nbsp;&nbsp;&nbsp;&nbsp;在添加点击事件之前，需要了解isPointInPath、isPointInStroke这两个api，这里有四个参数，x，y，fullPath，path。<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1、第三个参数是用来决定点在路径内还是在路径外的算法，一般用不到；<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2、如果只是判断一个点是否在canvas容器内，第四个参数也用不到；<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3、如果需要判断某个点是否在某个区域内，就需要使用到第四参数，使用new Path2D()创建出来的路径添加到isPointInPath、isPointInStroke中就可以判断某个点是否在某个区域内。
&nbsp;&nbsp;&nbsp;&nbsp;由于文本没有Path2D的方法，需要对绘制文本方法进行改造，在文本范围内绘制Rect路径用来判断是否点击到某个文本区域内，代码如下：

```ts
  drawText(info: Info) {
    const {
      options: { x, y, text, font = '16px serif' },
    } = info
    const path = new Path2D()
    const { width } = this.ctx.measureText(text)
    const height = Number(font.split(' ')[0].replace('px', ''))
    path.rect(x, y - height / 2, width, height)
    ...
  }
```

&nbsp;&nbsp;&nbsp;&nbsp;由于在canvas容器中会绘制多个图形、线段、文本，所以需要把每个图形、线段、文本的路径、类型、点击的回调函数等参数临时存起来，修改代码如下：

```ts
class Drawer {
  ...
  ceilList: CeilList[]
  constructor(params: Params) {
    ...
    this.ceilList = []
  }

  drawRect(info: Info) {
    ...
    this.ceilList.push({
      path,
      tag,
      params,
      clickCallBack
    })
  }

  drawLine(info: Info) {
    ...
    this.ctx.stroke(path)
    this.ceilList.push({
      path,
      tag,
      params,
      clickCallBack
    })
  }

  drawText(info: Info) {
    ...
    this.ceilList.push({
      path,
      tag,
      params,
      clickCallBack
    })
  }

  ...
}

```

&nbsp;&nbsp;&nbsp;&nbsp;对canvas容器添加点击事件，每次点击后，从临时存储的数组中查找点击位置是否在绘制的某个图形、线段、文本内，如果存在，则调用图形、线段、文本的回调方法执行相关操作，修改代码如下:

```ts
export default class Rect {
  ...
  tag: string
  params: any
  clickCallBack: ((val: any) => void) | undefined
  constructor(options: Options, params: any) {
    this.tag = DRAWER_UI.RECT
    this.params = params
    ...
  }

  ...

  on(category: string, clickCallBack: (val: any) => void) {
    if (category === 'click') {
      this.clickCallBack = clickCallBack
    }
  }
}

export default class Line {
  ...
  tag: string
  params: any
  clickCallBack: ((val: any) => void) | undefined
  constructor(options: Options, params: any) {
    ...
    this.tag = DRAWER_UI.LINE
    this.params = params
  }

  ...

  on(category: string, clickCallBack: (val: any) => void) {
    if (category === 'click') {
      this.clickCallBack = clickCallBack
    }
  }
}

export default class Text {
  options: Options
  tag: string
  params: any
  clickCallBack: ((val: any) => void) | undefined
  constructor(options: Options, params: any) {
    this.options = options
    this.tag = DRAWER_UI.TEXT
    this.params = params
  }

  on(category: string, clickCallBack: (val: any) => void) {
    if (category === 'click') {
      this.clickCallBack = clickCallBack
    }
  }
}

class Drawer {
  ...
  constructor(params: Params) {
   ...
    this.ceilList = []
    this.init()
  }

  init() {
    this.bindEvent()
  }

  clickEvent(e: MouseEvent) {
    const { ctx } = this
    const target = this.ceilList.find((ceil) =>
      ceil.tag === DRAWER_UI.RECT || ceil.tag === DRAWER_UI.TEXT
        ? ctx.isPointInPath(ceil.path, e.x, e.y)
        : ctx.isPointInStroke(ceil.path, e.x, e.y)
    )

    if (target && target.clickCallBack) {
      target.clickCallBack(target.params)
    }
  }

  bindEvent() {
    this.view.addEventListener('click', (e) => this.clickEvent(e))
  }

  ...

}
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，就可以通过鼠标点击找到所点击的图形、线段、文本。
## 4、完整代码
&nbsp;&nbsp;&nbsp;&nbsp;完整代码如下：https://stackblitz.com/edit/vitejs-vite-kdn3go?file=src%2FApp.vue
