---
slug: react-web-worker
title: "React 中使用 Web Worker"
date: 2026-09-26
category: 工程化
excerpt: "React 中专用 Worker 与 SharedWorker 的创建、通信与销毁。"
tags: [Web Worker, 性能优化]
---

&nbsp;&nbsp;&nbsp;&nbsp;Web Worker 能够开启一个单独的子线程，可以优化程序中计算量大的部分，但开启单独的子线程也会增加 CPU 的消耗，在使用时需要做好两者之间的平衡。

## 专用 worker

&nbsp;&nbsp;&nbsp;&nbsp;专用 worker 仅能被生成它的脚本所使用

### 生成专用 worker

```ts
import Worker from "./exclusive?worker";
const exclusiveWorker = new Worker();
```

### 发送和接收 worker 消息

&nbsp;&nbsp;&nbsp;&nbsp;发送消息通过 postMessage，接收消息使用 onmessage

```ts
import Worker from "./exclusive?worker";
function Exclusive() {
	const [message, setMessage] = useState("");
	const exclusiveWorker = new Worker();

	exclusiveWorker.onmessage = (event) => {
	  setMessage(event.data);
	};

	exclusiveWorker.postMessage({
	  id: 1,
	  t: new Blob(),
	});
	return <div>{message}</div>;
}
```

### 终止专用 worker

```ts
exclusiveWorker.terminate();
```

## 共享 worker

&nbsp;&nbsp;&nbsp;&nbsp;共享 worker 可以被多个脚本使用——即使这些脚本正在被不同的 window、iframe 或者 worker 访问，但是使用的上下文必须是同源（相同的协议，主机和端口号）。<br />
&nbsp;&nbsp;&nbsp;&nbsp;共享 worker 类似于一个公共函数，与专用 worker 非常大的区别在于，共享 worker 通信必须通过 port 对象——一个确切的打开的端口供脚本与 worker 通信（在专用 worker 中这一部分是隐式进行的）。

### 生成共享 worker

```ts
import SharedWorker from "./share?sharedworker";
const sharedWorker = new SharedWorker();
```

### 发送和接收 worker 信息

&nbsp;&nbsp;&nbsp;&nbsp;与专用 worker 类似，使用 postMessage 发送消息，使用 onmessage 接收消息，但是发送和接收是在 port 下进行的。
```ts
self.addEventListener('connect', (e) => {
  const port = (e as MessageEvent).ports[0];
  port.onmessage = function (e) {
    port.postMessage(...);
  };
});
```
```ts
// 接收消息
sharedWorker.port.postMessage(...);
// 发送消息
sharedWorker.port.onmessage = (e) => {}
```
## 代码示例
&nbsp;&nbsp;&nbsp;&nbsp;代码地址：https://stackblitz.com/edit/vitejs-vite-rhjp8y?file=src%2Fmain.tsx
