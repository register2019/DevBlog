---
slug: redux-toolkit-basics
title: "Redux Toolkit 的入门"
date: 2026-09-26
category: React
excerpt: "createSlice、AsyncThunk 与 useSelector 的最小可用结构。"
tags: [React, 状态管理]
---

前言：本来看视频学习Redux来着，等到使用vscode练习的时候，各种提示弃用，翻看官方文档，推荐了Redux Toolkit，体验下来确实简单了不少。

-   创建Store

```
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

-   创建Slice

1.  同步方法

```
import { createSlice } from "@reduxjs/toolkit";

interface ThemeState {
  color: string;
}

const initialState: ThemeState = {
  color: "white",
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    switchColor: (state: ThemeState, action: any) => {
      // action是接收的参数
      state.color = "blue";
    },
  },
});
export const { switchColor } = themeSlice.actions;
export default themeSlice.reducer;
```

2.  异步方法

```
import { createSlice } from "@reduxjs/toolkit";

interface ToDoState {
  todoData: ITodoList[];
}

const initialState: ToDoState = {
  todoData: [],
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getTodoData.fulfilled, (state, { payload }) => {
      state.todoData = [...payload];
    });
  },
});

export const getTodoData = createAsyncThunk("getToDoDataAsync", async () => {
  const data = await useReadFile("url地址");
  return data;
});

export const { switchColor } = themeSlice.actions;
export default themeSlice.reducer;
```

-   使用Redux Toolkit

1.  在main.tsx中引用

```
import { Provider } from "react-redux";
import { store } from "./store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
```

2.  在文件中使用\
    获取store中的值

```
  const themeColor = useSelector((state: RootState) => state.theme.color);
```

使用store中的同步方法

```
  const dispatch = useDispatch();
  dispatch(switchColor()); // 该方法为同步方法
```

使用store中的异步方法

```
  // 注意 使用异步方法的时候一定要添加AppDispatch 否则编译器会报错 从store文件中引入
  const dispatch: AppDispatch = useDispatch();
  dispatch(getTodoData());
```

结语：整体体验下来，Redux Toolkit的使用起来比Redux方便多了，跟Pinia有些类似，等下一篇可以和Pinia对比一下。