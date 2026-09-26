---
slug: element-like-date-time-picker
title: "自定义组件，仿 Element 的日期时间选择器"
date: 2026-09-26
category: 组件库
excerpt: "跨月日期计算、双面板联动与时间滚动定位，仿 Element 日期时间选择器。"
tags: [组件, Vue]
featured: true
---

&emsp;前言：日期时间选择器是工作中比较常用的一个组件，有时候会需要对日期时间选择器进行深度的定制或者有一些特殊的需求，直接在第三方UI库修改比较麻烦，就尝试自己写了一个。

![日期时间选择器组件预览](component-preview.jpg)
&emsp;上图是这个组件的整体效果：顶部的开始/结束时间输入框、下方左右联动的双月日期面板，以及右侧时/分/秒三列时间选择器；<br />

&emsp;在线地址 https://stackblitz.com/edit/vitejs-vite-kjedxz?file=src/App.vue
# 页面布局
&emsp;首先页面布局需要有一个输入框来负责选中日期的回显和用来显示日期时间选择面板；其次需要一个Popover组件来显示日期时间选择面板。
## 输入框
&emsp;这里的输入框包含三部分，选中的开始日期、结束日期和中间的分隔符。UI的主要组成及效果如下：

```html
  <div class="dc-calendar-input" ref="calendarInput">
    <input type="text" class="dc-input" v-model="startDateTime" />
    <!-- 这里可以定义为动态的 可以自定义分隔符的样式 -->
    <span>至</span>
    <input type="text" class="dc-input" v-model="endDateTime" />
  </div>
```

![输入框效果](input-preview.png)<br />
## 日期时间选择器面板
&emsp;这里使用了VueUse的onClickOutside方法来进行处理Popover组件的显示和隐藏，为了避免使用时其他盒子的定位影响看，使用Teleport传送到了body中。代码及UI效果如下：

```html
 <Teleport to="body">
    <div
      class="dc-calendar"
      :style="calendarStyle"
      v-show="calendarPanel"
      ref="calendarRef"
    >
    <div class="dc-calendar-footer">
        <button @click="cancelBtn">取消</button>
        <button @click="submitBtn">确定</button>
      </div>
    </div>
  </Teleport>
```

```ts
import { onClickOutside } from "@vueuse/core";

const calendarRef = ref();

onClickOutside(calendarRef, () => {
  calendarPanel.value = false;
});
```

![Popover 面板效果](popover-panel.png)<br />
# 获取日期面板需要显示的日期
&emsp;这里的显示是按照每页6行7列来进行显示的
1. 获取上个月需要显示的日期

```ts
export const getPrevMonthRestDays = (year: number, month: number) => {
  // 获取当前月第一天是周几
  let days = getCurrMonthFirstDay(year, month);
  // 获取上个月一共多少天
  let lastDate = getCurrMonthDayCount(year, month - 1);
  if (days === 0) {
    days = 7;
  }
  let restDays: number[] = [];
  while (restDays.length < days) {
    restDays.push(lastDate--);
  }
  return restDays.reverse();
};
```
2. 获取当前月需要显示的日期

```ts
export const getCurrMonthDayCount = (year: number, month: number) => {
  const date = new Date(year, month, 0);
  return date.getDate();
};
```
3. 获取下个月需要显示的日期

```ts
export const getNextMonthRestDays = (year: number, month: number) => {
  const prevMonthRestDayCount = getPrevMonthRestDays(year, month).length;
  const currMonthDayCount = getCurrMonthDayCount(year, month);
  // 使用总数 - 上个月的天数 - 当前月的天数
  const nextMonthRestDayCount = 42 - prevMonthRestDayCount - currMonthDayCount;
  const restDays: number[] = [];

  for (let i = 1; i <= nextMonthRestDayCount; i++) {
    restDays.push(i);
  }

  return restDays;
};
```
&emsp;这里需要对需要显示的日期进行格式化处理，添加时间戳作为key，同时在选中的开始和结束范围中处理样式。对上个月和下个月需要在当前页显示的日期添加标识符，用来设置不可选的样式。具体代码如下:

```ts
export const getCurrPageDays = (year: number, month: number) => {
  const prevDays = getPrevMonthRestDays(year, month);
  let currMonthList: number[] = [];
  const currMonthDays = getCurrMonthDayCount(year, month);
  for (let i = 1; i <= currMonthDays; i++) {
    currMonthList.push(i);
  }
  const nextDays = getNextMonthRestDays(year, month);
  const objPrevDays: IDate[] = prevDays.map((item) => {
    const date = year + "-" + (month - 1) + "-" + item;
    return {
      value: item,
      category: "prev",
      timestamp: new Date(date).getTime(),
    };
  });

  const objCurrMonthList: IDate[] = currMonthList.map((item) => {
    const date = year + "-" + month + "-" + item;
    return {
      value: item,
      category: "curr",
      timestamp: new Date(date).getTime(),
    };
  });

  const objNextDays: IDate[] = nextDays.map((item) => {
    const date = year + "-" + (month + 1) + "-" + item;
    return {
      value: item,
      category: "next",
      timestamp: new Date(date).getTime(),
    };
  });

  return [...objPrevDays, ...objCurrMonthList, ...objNextDays];
};
```
&emsp;到这一步之后，就可以在弹出层面板中显示出日期了。具体的代码及UI效果如下:

```html
<table class="dc-table">
  <thead>
    <tr>
      <th v-for="item in tableHeader" :key="item">{{ item }}</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(list, index) in leftTds" :key="index">
      <td
        v-for="td in list"
        :key="td"
        :class="[
          selectedRangeBg(td),
          selectedDateBoundary(td, 0),
          selectedDateBoundary(td, 1),
          tdStyle,
        ]"
      >
      <div :class="beforeAndAfterStyle(td, 'curr')">
        <span
          :class="[
            selectedStartDate === td.value ? 'dc-selected-date' : '',
            selectedDate(td),
          ]"
          @mouseenter="selectedRangeStyle(td)"
          @click="selectDate(td, 'left')"
       >{{ td.value }}</span>
      </div>
     </td>
    </tr>
  </tbody>
</table>
```

![日期面板渲染效果](date-table.png)
# 日期选中范围的样式处理
&emsp;对日期选择器的每一项都添加@mouseenter事件，用来处理选中的开始时间和结束之间的样式，同时添加判断，如果是上个月或者下个月，则不添加选中的样式。
# 时间选择器
&emsp;时间选择器主要有两部分组成，用于显示内容的输入框和选择的时间。同样使用vueuse的onClickOutside来处理弹窗的效果。时间选择器的关键点在于时、分、秒需要根据默认时间滚动到相应位置以及点击时、分、秒时的动态改变。交互效果类似于索引栏的实现，之前有类似的文章，小伙伴可以参考一下。关键代码如下：

```html
  <div class="dc-time-picker">
    <ul
      class="dc-ul"
      v-for="item in showUlNum"
      :key="item.count"
      :id="item.id"
    >
      <li
        class="dc-li"
        v-for="list in item.count"
        :key="list"
        :ref="item.liRef"
        @click="selectTime(item.liRef, timeFormat(list - 1), item.id)"
      >
        {{ timeFormat(list - 1) }}
      </li>
    </ul>
  </div>
```

```ts
export const selectedTime = (
  targetRefs: Ref<any>,
  targetRef: Element,
  targetTime: Ref<any>,
  category: string
) => {
  let targetList: HourList[] = [];
  targetList = getLiList(targetRefs);

  switch (category) {
    case "hour":
      const hourTop =
        targetList.find(
          (item: { val: string }) => item.val === targetTime.value
        )?.top! - 65;

      targetRef.scrollTo({
        top: hourTop,
      });
      break;
    case "minu":
      let minuTop =
        targetList.find(
          (item: { val: string }) => item.val === targetTime.value
        )?.top! - 65;

      targetRef.scrollTo({
        top: minuTop,
      });
      break;
    case "seco":
      let secoTop =
        targetList.find(
          (item: { val: string }) => item.val === targetTime.value
        )?.top! - 65;

      targetRef.scrollTo({
        top: secoTop,
      });
      break;
    default:
      break;
  }

  targetRef.addEventListener("scroll", () => {
    targetTime.value = targetList.find(
      (item: { top: number }) => item.top > targetRef.scrollTop + 65
    )?.val!;
  });
};
```

![时间选择器效果](time-picker.png)<br />
&emsp;关于时间选择器，小伙伴有不清楚的可以参考在线地址：https://stackblitz.com/edit/vitejs-vite-ohuduf?file=src/App.vue

# 日期面板之间的联动
&emsp;默认情况下，左右面板之间是联动的，这里我们添加一个判断字段unlinkPanels，如果unlinkPanels为true就取消左右面板之间的联动。关键代码如下：

```ts
const clickBefore = (category: string) => {
  unlinkLeft.value = true;
  if (unlinkRight.value) {
    unlinkRight.value = false;
  }
  if (category === "month") {
    leftDateMonth.value--;
    if (props.unlinkPanels) {
      const { month, year } = unlinkBefore(
        leftDateMonth.value,
        leftDateYear.value
      );
      leftDateMonth.value = month;
      leftDateYear.value = year;
    } else {
      rightDateMonth.value--;
      const { month: leftMonth, year: leftYear } = unlinkBefore(
        leftDateMonth.value,
        leftDateYear.value
      );
      leftDateYear.value = leftYear;
      leftDateMonth.value = leftMonth;
      const { month: rightMonth, year: rightYear } = unlinkBefore(
        rightDateMonth.value,
        rightDateYear.value
      );
      rightDateYear.value = rightYear;
      rightDateMonth.value = rightMonth;
    }
  } else if (category === "year") {
    leftDateYear.value--;
    if (!props.unlinkPanels) {
      rightDateYear.value--;
    }
  }
  initArr();
};
```
&emsp;日期时间选择器一共有四个按钮可以影响是否联动，分别是选择之前和之后的年月，这里贴出了选择之前日期的代码。<br />
# 日期选择完成后的回显
&emsp;回显的内容分为两部分，选择的日期和时间，对这两部分根据需要的格式对数据进行拼接。存储选择的时间范围是使用的数组的形式，当选择完成之后，根据选择的值对开始和结束的值进行绑定，就完成了数据的回显。

```ts
  startDateTime.value =
    dateFormat(selectedDateTimeRange.value[0].val) +
    " " +
    startTimePicker.value;
  endDateTime.value =
    dateFormat(selectedDateTimeRange.value[1].val) + " " + endTimePicker.value;
  calendarPanel.value = false;
```

&emsp;在线地址 https://stackblitz.com/edit/vitejs-vite-kjedxz?file=src/App.vue

&emsp;结语：到这里，一个基本的日期时间选择器就基本上完成了，整体来说，实现的思路比较简单，希望为有这方面业务需求的小伙伴提供帮助。
