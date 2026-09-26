---
slug: echarts-battery-progress
title: "【Echarts】电池状进度条"
date: 2026-09-26
category: 可视化
excerpt: "symbolRepeat 与 symbolClip 实现电池状进度条。"
tags: [Echarts, 图表]
---

&nbsp;&nbsp;&nbsp;&nbsp;使用象形柱状图能够实现很多有意思的效果，这里用象形柱状图实现进度条效果，实现效果如下：

![示例-3.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f82e0e7c632745989b2938947ffba7d7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=855&h=584&s=20848&e=png&b=06164a)
## 前置知识

### 基准柱

&nbsp;&nbsp;&nbsp;&nbsp;象形柱图可以被想象为：它首先是个柱状图，但是柱状图的柱子并不显示。这些柱子我们称为<a href="https://echarts.apache.org/zh/option.html#series-pictorialBar">『基准柱（reference bar）』</a>，根据基准柱来定位和显示各种象形图形（包括图片）。<br />
&nbsp;&nbsp;&nbsp;&nbsp;每个象形图形根据基准柱的定位，是通过 symbolPosition、symbolOffset 来调整其于基准柱的相对位置。

### symbolSize

&nbsp;&nbsp;&nbsp;&nbsp;symbolSize 表示图形的大小。<br />
&nbsp;&nbsp;&nbsp;&nbsp;可以用数组分开表示宽和高，例如 [20, 10] 表示标记宽为 20，高为 10，也可以设置成诸如 10 这样单一的数字，表示 [10, 10]。<br />
&nbsp;&nbsp;&nbsp;&nbsp;可以设置成绝对值（如 10），也可以设置成百分比（如 '120%'、['55%', 23]）。<br />
&nbsp;&nbsp;&nbsp;&nbsp;当设置为百分比时，图形的大小是基于基准柱的尺寸计算出来的。<br />
&nbsp;&nbsp;&nbsp;&nbsp;例如，当基准柱基于 x 轴（即柱子是纵向的），symbolSize 设置为 ['30%', '50%']，那么最终图形的尺寸是：<br />
宽度：基准柱的宽度 _ 30%。<br />
高度：<br />
&nbsp;&nbsp;&nbsp;&nbsp;如果 symbolRepeat 为 false：基准柱的高度 _ 50%。<br />
&nbsp;&nbsp;&nbsp;&nbsp;如果 symbolRepeat 为 true：基准柱的宽度 \* 50%。<br />
基准柱基于 y 轴（即柱子是横向的）的情况类似对调可得出<br />
此属性可以被设置在系列的 根部，表示对此系列中所有数据都生效；也可以被设置在 data 中的 每个数据项中，表示只对此数据项生效。代码示例如下：<br />

```js
series: [{
  symbolSize: ... // 对 data 中所有数据项生效。
  data: [23, 56]
}]
或者
series: [{
  data: [{
    value: 23
    symbolSize: ... // 只对此数据项生效
    }, {
    value: 56
    symbolSize: ... // 只对此数据项生效
  }]
}]
```

### symbolClip

symbolClip 表示是否剪裁图形，可选值如下：<br />
&nbsp;&nbsp;&nbsp;&nbsp;false/null/undefined：图形本身表示数值大小。<br />
&nbsp;&nbsp;&nbsp;&nbsp;true：图形被剪裁后剩余的部分表示数值大小。<br />
&nbsp;&nbsp;&nbsp;&nbsp;symbolClip 常用在以下场景：同时表达『总值』和『当前数值』。在这种场景下，可以使用两个系列，一个系列是完整的图形，当做『背景』来表达总数值，另一个系列是使用 symbolClip 进行剪裁过的图形，表达当前数值。<br />
『当前值系列』设置了比『背景系列』更高的 z，使得其覆盖在『背景系列』上。<br />
此属性可以被设置在系列的 根部，表示对此系列中所有数据都生效；也可以被设置在 data 中的 每个数据项中，表示只对此数据项生效。代码示例如下：

```js
series: [{
  symbolClip: ... // 对 data 中所有数据项生效。
  data: [23, 56]
}]
或者
series: [{
  data: [{
    value: 23
    symbolClip: ... // 只对此数据项生效
    }, {
    value: 56
    symbolClip: ... // 只对此数据项生效
  }]
}]
```

### symbolRepeat

symbolRepeat 用来设置图形元素是否重复。值可为：<br />

false/null/undefined：不重复，即每个数据值用一个图形元素表示。<br />
true：使图形元素重复，即每个数据值用一组重复的图形元素表示。重复的次数依据 data 计算得到。<br />
a number：使图形元素重复，即每个数据值用一组重复的图形元素表示。重复的次数是给定的定值。<br />
'fixed'：使图形元素重复，即每个数据值用一组重复的图形元素表示。重复的次数依据 symbolBoundingData 计算得到，即与 data 无关。这在此图形被用于做背景时有用，symbolBoundingData 没有设置时按照基准柱的值来设置。
此属性可以被设置在系列的 根部，表示对此系列中所有数据都生效；也可以被设置在 data 中的 每个数据项中，表示只对此数据项生效。代码示例如下：

```js
series: [{
    symbolRepeat: ... // 对 data 中所有数据项生效。
    data: [23, 56]
}]
或者
series: [{
    data: [{
        value: 23
        symbolRepeat: ... // 只对此数据项生效
    }, {
        value: 56
        symbolRepeat: ... // 只对此数据项生效
    }]
}]
```

## 实现

### 设置背景

&nbsp;&nbsp;&nbsp;&nbsp;首先设置基础参数，因为是设置背景，种类需要设置的 z 为一个相对较小的值，代码示例及效果如下：

![示例-1.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8390359520d64e038009d2bdb2763daf~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=809&h=743&s=8084&e=png&b=06164a)
```js
series: [
    {
        type: "pictorialBar",
        animationDuration: 0,
        symbol: "rect",
        itemStyle: {
            normal: {
                color: "#EFEFEF",
            },
        },
        label: {
            normal: {
                show: true,
                position: "right",
                offset: [0, 2],
                distance: 30,
                textStyle: {
                    color: "#409EFF",
                    fontSize: 14,
                },
                formatter: function (a) {
                    return `${a.value}%`;
                },
            },
        },
        data: [90, 70, 80],
        z: 0,
        animationEasing: "elasticOut",
    },
];
```

&nbsp;&nbsp;&nbsp;&nbsp;此时的柱状图的宽度是均分的，可以通过设置 symbolSize 来调整大小，这里设置为[10, 20]；通过设置 symbolRepeat 来设置图形元素是否重复及重复的类型，因为效果是类似电池的进度条，所以这里需要通过 symbolMargin 设置间隔，修改后的代码及效果如下：

![示例-2.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9658829364e349ba9d8d7350bbbabce6~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=865&h=630&s=8096&e=png&b=06164a)
```js
{
  // 背景
  type: "pictorialBar",
  animationDuration: 0,
  symbolRepeat: "fixed",
  symbolMargin: 2, // 背景间隔
  symbol: "rect",
  symbolSize: [10, 20],
  itemStyle: {
    normal: {
      color: "#EFEFEF",
    },
  },
  label: {
    normal: {
      show: true,
      position: "right",
      offset: [0, 2],
      distance: 30,
      textStyle: {
        color: "#409EFF",
        fontSize: 14,
      },
      formatter: function (a) {
        return `${a.value}%`;
      },
    },
  },
  data: [90, 70, 80],
  z: 0,
  animationEasing: "elasticOut",
},
```

### 设置真实值

&nbsp;&nbsp;&nbsp;&nbsp;真实值与设置背景基本类似，这里需要多设置一个 symbolClip，根据真实值来进行裁切，如果不设置 symbolClip，则会填满整个柱状图。代码示例及效果如下：

![示例-3.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9ecc9f3cf1e848e0abed25eeb85adb7d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=855&h=584&s=20848&e=png&b=06164a)
```js
{
  type: "pictorialBar",
  itemStyle: {
    color: {
      type: "linear",
      x: 0,
      y: 0,
      x2: 1,
      y2: 0,
      colorStops: [
        {
          offset: 0,
          color: "#1577FF", // 0% 处的颜色
        },
        {
          offset: 1,
          color: "#409EFF", // 100% 处的颜色
        },
      ],
    },
  },
  symbolRepeat: "fixed",
  symbolMargin: 2, // 背景间隔
  symbol: "rect",
  symbolSize: [10, 20],
  symbolClip: true,
  data: [90, 70, 80],
  z: 2,
  animationEasing: "elasticOut",
},
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，电池进度柱状图完成。
## 代码地址：
https://stackblitz.com/edit/vitejs-vite-qpltws?file=index.html
