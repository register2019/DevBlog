---
slug: excel-like-row-select
title: "仿 Excel 操作，鼠标拖动 + Ctrl 选中多个表格行"
date: 2026-09-26
category: 组件库
excerpt: "自定义指令实现拖动选区与 Ctrl 跨平台多选表格行。"
tags: [组件, 交互]
---

&nbsp;&nbsp;&nbsp;&nbsp;之前项目有一个需求，在表格中，鼠标左键按下，拖动鼠标能够选中多个表格行，按下Ctrl键能够在之前选中的基础上继续添加行。这里使用vue + ant design vue来实现上述效果。
# 需求分析
1、鼠标按下在表格中拖动 能够多选表格行<br />
2、按住Ctrl键 点击未选中的表格行 能够在选中的基础上添加选中行 点击已选中的行 取消当前行选中<br />
3、Ctrl键没有按下 点击表格行 点击行为选中状态 其他行为未选中状态<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;因为想做一个通用的效果，这里使用自定义指令的方式进行处理。
## 鼠标拖动选中效果
&nbsp;&nbsp;表格选中效果只存在于table的body部分，所以首先获取表格tbody部分的dom。然后为tbody中的tr绑定mouseenter事件。
```javascript
    const tableBody = el.querySelector('.ant-table-tbody')
    const trList = Array.from(tableBody.children)
    
    trList.forEach(tr => {
        tr.addEventListener('mouseenter', handleMouseEnter)
    })
```
&nbsp;&nbsp;&nbsp;&nbsp;在handleMouseEnter中判断如果鼠标按下，鼠标移动到表格行中，未选中的表格变为选中状态，已选中的表格变为未选中状态。<br />
&nbsp;&nbsp;&nbsp;&nbsp;首先需要声明一个数组，用来记录当前选中行以及选中行的key，然后对数组进行判断。<br />
&nbsp;&nbsp;&nbsp;&nbsp;1、数组中能否找到当前元素，如果找不到，则添加到数组中。<br />
&nbsp;&nbsp;&nbsp;&nbsp;2、如果找得到，判断目标元素的状态是否为选中状态，如果为未选中状态，则设置为已选中，如果为选中状态，则设置为未选中。<br />
&nbsp;&nbsp;&nbsp;&nbsp;选中状态设置为未选中状态时，有两种情况。一种是从上往下选择，然后反方向取消选中，另外一种是从下往上选择，然后反方向取消选中。这里我们需要判断一下鼠标移动的顺序。关键代码如下：
```javascript  
  if (target) {
    if (target.status === 'show') {
      if (selectedRowList.length >= 2) {
        const firstKey = selectedRowList[0].key;
        const secondKey = selectedRowList[1].key;
        sort = firstKey < secondKey ? 'positiveOrder' : 'reverseOrder';
      }

      selectedRowList = selectedRowList.map(item => {
        if (sort === 'positiveOrder' ? item.key <= Number(key) : item.key >= Number(key)) {
          return item;
        } else {
          return {
            ...item,
            status: 'disable',
          };
        }
      });
    } else {
      target.status = 'show';
    }
  } else {
    selectedRowList.push({
      key: Number(key),
      status: 'show',
      dom: selectedRow,
    });
  }
 ```
&nbsp;&nbsp;&nbsp;&nbsp;因为是通过在表格行中绑定鼠标移入事件来进行判断的，此时会出现一个边界问题，当鼠标开始拖动时，鼠标已经在表格行中了，所以开始选中时的表格行需要获取鼠标按下时的表格行。但是鼠标按下获取的是单元格，此时需要获取单元格的父级元素tr。<br />
&nbsp;&nbsp;&nbsp;&nbsp;在selectedRowList中存储的就是选中的表格行，然后根据存储数组进行设置表格行的背景颜色就可以实现选中的效果。因为是取消选中并没有删除而是修改的状态，所以需要对show和disable两种状态进行处理。关键代码如下：
```javascript
function removeAttribute(item: SelectedRowList) {
  item.dom.removeAttribute('style');
  item.dom.removeAttribute('rowType');
}
selectedRowList.forEach(row => {
  if (row.status === 'show') {
    row.dom.style.backgroundColor = '#1577FF';
    row.dom.style.userSelect = 'none';
    row.dom.setAttribute('rowType', 'selected');
  } else {
    removeAttribute(row);
  }
});
```
&nbsp;&nbsp;&nbsp;&nbsp;经过以上步骤，就实现了鼠标拖动选中表格行的效果。接下来就需要实现按下Ctrl键来添加选中的效果。
## 按下Ctrl键的选中效果
&nbsp;&nbsp;&nbsp;&nbsp;因为Mac和Windows按下Ctrl得到的code不同，Mac为MetaLeft、Windows为ControlLeft，所以在mounted中需要判断当前系统，并且监听Ctrl键是否按下。
```javascript
function handleKeyDown(e: KeyboardEvent) {
  currCode = e.code;
}
function handleKeyUp() {
  currCode = '';
}
mounted() {
  currSystem = navigator.userAgent.includes('Mac OS') ? 'Mac' : 'Window';
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
},
```
1、按下Ctrl键 点击未选中的行 添加选中数量<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;在当前未选中的判断条件中，添加Ctrl键是否按下判断条件。代码如下：
```javascript
  if (target) {
    if (target.status === 'show') {
      if (selectedRowList.length >= 2) {
        const firstKey = selectedRowList[0].key;
        const secondKey = selectedRowList[1].key;
        sort = firstKey < secondKey ? 'positiveOrder' : 'reverseOrder';
      }

      selectedRowList = selectedRowList.map(item => {
        if (sort === 'positiveOrder' ? item.key <= Number(key) : item.key >= Number(key)) {
          // ...
        } else {
          // 添加Ctrl键按下事件
          if (currCode === ctrlKey[currSystem]) {
            return item;
          }
          // ...
        }
      });
    } else {
      // ...
    }
  } else {
    // ...
  }
```
2、按下Ctrl键 点击已选中的表格行 取消表格行选中<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;在当前选中的判断条件中，添加Ctrl键是否按下判断条件。代码如下：
```javascript
  if (target) {
    if (target.status === 'show') {
      if (selectedRowList.length >= 2) {
        const firstKey = selectedRowList[0].key;
        const secondKey = selectedRowList[1].key;
        sort = firstKey < secondKey ? 'positiveOrder' : 'reverseOrder';
      }

      selectedRowList = selectedRowList.map(item => {
        if (sort === 'positiveOrder' ? item.key <= Number(key) : item.key >= Number(key)) {
          if (currCode === ctrlKey[currSystem] && item.key === Number(key)) {
            return {
              ...item,
              status: 'disable',
            };
          }
          return item;
        } else {
          // ...
        }
      });
    } else {
      // ...
    }
  } else {
    // ...
  }
```
&nbsp;&nbsp;&nbsp;&nbsp;到这里为止，就实现了鼠标拖动选中表格行以及按下Ctrl键的追加和取消表格行的效果。接下来实现当Ctrl键没有按下时，表格行的选中效果。
## Ctrl键没有按下时的选中效果
&nbsp;&nbsp;&nbsp;&nbsp;Ctrl键没有按下时，点击表格行，当前的表格行选中，其他的表格行为未选中的状态。代码如下：
```javascript
  const td = e.target;
  const tr = td.parentNode
  const currClickKey = tr.dataset.rowKey;
  setTableRowAttribute(selectedRowList);
  selectedRowList = [];
  tr.style.backgroundColor = '#1577FF';
  tr.setAttribute('rowType', 'selected');
  selectedRowList.push({
    status: 'show',
    key: Number(currClickKey),
    dom: tr,
  });
```
&nbsp;&nbsp;&nbsp;&nbsp;到这里，我们就实现了仿excel选中效果的全部效果了。
## 在组件中获取选中的数据
&nbsp;&nbsp;&nbsp;&nbsp;如果在vue文件中获取选中的数据，就需要在自定义指令中传递两个参数，一个是表格的数据，另一个是vue文件中的一个回调函数，代码如下：
```html
   <a-table v-selected-table-row="{ dataSource, getSelectedRow }" />
```
```javascript
function getSelectedRow(val) {
   console.log('选中的表格行'，val)
}
```
```javascript
// 在自定义指令中结构出数据和回调函数
const { dataSource, getSelectedRow } = binding.value;
callBack = getSelectedRow;
dataList = dataSource;

// 在鼠标抬起时赋值
selectedRowList = selectedRowList.filter(row => row.status !== 'disable');
const selectedRowRecords = selectedRowList
  .map(item => {
    if (dataList.find(data => Number(data.key) === item.key)) {
      return dataList[item.key];
    }
  })
  .filter(item => item) as DataItem[];
callBack(selectedRowRecords);
```
&nbsp;&nbsp;&nbsp;&nbsp;到这里，整个的操作就完成了。<br />
&nbsp;&nbsp;&nbsp;&nbsp;完整代码：https://stackblitz.com/edit/vitejs-vite-58ddfu

