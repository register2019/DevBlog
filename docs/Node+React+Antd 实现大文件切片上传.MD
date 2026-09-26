---
slug: chunked-file-upload
title: "Node + React + Antd 实现大文件切片上传"
date: 2026-09-26
category: 工程化
excerpt: "文件切片、FormData 组装与 Axios 上传，并用 Web Worker 卸载计算。"
tags: [Node, 上传]
---

&nbsp;&nbsp;&nbsp;&nbsp;文件切片上传是文件上传中常用的需求之一，网上有很多的优秀第三方库，比如 WebUploader 等，这里按照自己的思路来实现切片上传，没有做类型限制，可以是文档、表格、图片等，在实际项目中可根据需求进行限制。

# 项目初始化

## 客户端

&nbsp;&nbsp;&nbsp;&nbsp;项目技术栈为：Vite + React + Antd，Antd 提供的上传不支持切片，所以这里使用提供的 customRequest 方法来自定义上传方法，基本代码结构如下：

```ts
function SliceUpload() {
	let sliceResult: Blob = new Blob();
	const props: UploadProps = {
      name: "file",
      multiple: false,
      async customRequest(info) {},
	};
	return (
	   <div className='wrapper'>
	      <Card title='切片上传' style={{ width: "500px" }}>
		 <Dragger {...props}>
		   <p className='ant-upload-drag-icon'>
		     <InboxOutlined />
		   </p>
		   <p className='ant-upload-text'>
		      Click or drag file to this area to upload
		   </p>
		   <p className='ant-upload-hint'>
		      Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.
		   </p>
		</Dragger>
	      </Card>
	   </div>
	);
}
```

## 服务端

&nbsp;&nbsp;&nbsp;&nbsp;项目技术栈为：express + express-fileupload，基本代码结构如下：

```js
const express = require("express");
const bodyParser = require("body-parser");
const uploader = require("express-fileupload");

const app = express();

app.use(bodyParser.json());
app.use(uploader());

app.all("*", (req, res, next) => {
	res.header("Access-Control-Allow-origin", "*");
	res.header("Access-Control-Allow-Methods", "Get, Post");
	next();
});

app.listen(3000, () => {
	console.log("success");
});
```

# 文件切片上传

## 客户端

&nbsp;&nbsp;&nbsp;&nbsp;这里先通过正常的思路实现切片上传，然后通过 WebWorker 进行优化。

### 切片上传

&nbsp;&nbsp;&nbsp;&nbsp;设定文件切片的大小：

```ts
const SLICE_SIZE = 10 * 1024;
```

&nbsp;&nbsp;&nbsp;&nbsp;从 File 类型中获取上传文件的大小，通过 for 循环进行遍历，切片起点为从 0 开始，终点为文件的大小，每次遍历递增设定的文件切片大小，当递增结果大于文件大小时，切片结束位置为文件大小。通过每次上传累积的和与文件总大小的比较可以计算出上传的进度，这里不做处理。对于每次上传的文件及相关信息使用 formData 来进行处理。<br />
&nbsp;&nbsp;&nbsp;&nbsp;如果显示上传文件列表，则文件上传成功后还是处于加载状态，这时需要调用 onSuccess 方法来确认上传成功。代码如下：

```ts
type Params = {
	size: string;
	name: string;
	type: string;
	uploadSize: string;
	file: Blob;
	isDone: string;
};
export const createFormData = (params: Params) => {
	const { size, name, type, uploadSize, file, isDone } = params;

	const fd = new FormData();
	fd.append("size", size);
	fd.append("name", name);
	fd.append("type", type);
	fd.append("uploadSize", uploadSize);
	fd.append("file", file);
	fd.append("isDone", isDone);

	return fd;
};
```

```ts
const props: UploadProps = {
	...,
	async customRequest(info) {
	  const { size, name, type } = info.file as File;
	    if (size) {
	      for (let i = 0; i < size; i += SLICE_SIZE) {
		if (i >= size) {
		    sliceResult = info.file.slice(i, size) as Blob;
		} else {
		    sliceResult = info.file.slice(i, i + SLICE_SIZE) as Blob;
	        }
	       const formData = createFormData({
		    size: size.toString(),
		    name,
		    type: type ?? "",
		    uploadSize: SLICE_SIZE.toString(),
		    file: sliceResult ?? new Blob(),
		});
		const res = await axios.post("/api/upload", formData);
		if (i + SLICE_SIZE > size && info.onSuccess && res.status === 200) {
		   info.onSuccess(res);
		   message.success("上传成功");
		   }
	        }
	    }
	},
};
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，文件切片上传客户端功能基本完成，但还可以继续优化。

### 使用 WebWorker 优化

&nbsp;&nbsp;&nbsp;&nbsp;需要切片上传的文件一般是比较大的文件，文件切片会需要很多次的计算，JS 是单线程的模型，这时可以使用 WebWorker 来开辟一个单独的线程用来处理文件切片的计算，主线程和文件切片线程相互不影响。代码如下：

```ts
import axios from "axios";
import { createFormData } from "./upload";

const SLICE_SIZE = 10 * 1024;
let sliceResult: Blob = new Blob();
// 接收需要切片的文件
onmessage = async (e) => {
	const file = e.data.file;
	const { size, name, type } = file;
	if (size) {
	    for (let i = 0; i < size; i += SLICE_SIZE) {
		if (i >= size) {
		    sliceResult = file.slice(i, size) as Blob;
		} else {
		    sliceResult = file.slice(i, i + SLICE_SIZE) as Blob;
		}
		const formData = createFormData({
		    size: size.toString(),
		    name,
		    type: type ?? "",
		    uploadSize: SLICE_SIZE.toString(),
		    file: sliceResult ?? new Blob(),
		    isDone: i + SLICE_SIZE > size ? "1" : "0",
		});
		const res = await axios.post("/api/upload", formData);

		if (i + SLICE_SIZE > size && res.status === 200) {
		    // 切片完成后发送通知消息
		    postMessage("success");
		}
	    }
	}
};
```

```ts
import Worker from "./upload-webworker?worker";
const props: UploadProps = {
	...,
	async customRequest(info) {
	    const worker = new Worker();
	    worker.postMessage({
		file: info.file,
	    });
    // 接收切片完成的信息，修改文件上传状态
	    worker.onmessage = (e) => {
	        info.onSuccess && info.onSuccess(e.data);
		message.success("上传成功");
	    };
	},
};
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，文件切片上传客户端功能完成。

## 服务端

&nbsp;&nbsp;&nbsp;&nbsp;客户端上传的文件需要在服务端的某个位置内，这时需要先判断存储位置是否存在，然后进行文件处理。

### 存储位置

&nbsp;&nbsp;&nbsp;&nbsp;首先需要确定好文件上传位置路径，然后通过 nodejs 的文件系统提供的 stat 方法判断文件夹是否存在。因为后续的文件处理需要在存储位置存在的情况下执行，这里需要使用异步方法阻断线程，等待判断存储位置是否存在及如果不存在则创建存储位置，使用 nodejs 的文件系统提供的 mkdir 方法创建文件夹。代码如下：

```js
// 判断文件夹是否存在
exports.getStat = (path, stat) => {
	return new Promise((resolve) => {
	    stat(path, (err, stats) => {
		if (err) {
		    resolve(false);
		} else {
		    resolve(stats);
		}
	    });
	});
};
// 创建文件夹
exports.setMkdir = (path, mkdir) => {
	return new Promise((resolve) => {
	   mkdir(path, (err) => {
	        if (err) {
		    resolve(false);
		} else {
		    resolve(true);
		}
	    });
	});
};
```

### 文件处理

&nbsp;&nbsp;&nbsp;&nbsp;这里使用 nodejs 文件系统中的 appendFileSync 来接收客户端上传的文件，在切片上传时，相同文件的文件名称相同，使用 appendFileSync 接收后合并成一个完整的文件，并存储到指定路径中。代码如下：

```js
...
const { resolve } = require("path");
const { appendFileSync, readdirSync, mkdir, stat } = require("fs");
const { getStat, setMkdir } = require("./util");

const app = express();

...

app.post("/upload", async (req, res) => {
	const { uploadSize, name: fileName } = req.body;
	const { file } = req.files;
	const filePath = resolve(__dirname, "./video/" + fileName);
	let isExist = await getStat("./video", stat);
	if (!isExist) {
	    await setMkdir("./video", mkdir);
	}
	if (uploadSize !== "0") {
	    appendFileSync(filePath, file.data);
	    res.send({
		msg: "upload success",
	    });
	    return;
	}
});
```

# 秒传

&nbsp;&nbsp;&nbsp;&nbsp;秒传的本质是根据某个值查询在存储位置中是否已存在正在上传的文件，如果存在，服务端不进行处理，直接返回上传成功。实现秒传，客户端不需要进行修改，这里的修改主要涉及服务端。<br />

## 判断文件是否存在

&nbsp;&nbsp;&nbsp;&nbsp;这里使用 node 文件系统的 readdirSync 来获取指定路径下的所有文件，通过判断文件名称来判断文件是否存在，存在则直接返回。修改代码如下：

```js
...
app.post("/upload", async (req, res) => {
	const { uploadSize, name: fileName } = req.body;
	const { file } = req.files;
	const filePath = resolve(__dirname, "./video/" + fileName);
	...
	const files = readdirSync("./video");
	if (files.find((name) => name === fileName)) {
	    res.send({
		msg: "upload success",
	    });
	    return;
	}
	...
});
```

## 文件处理时间修改

&nbsp;&nbsp;&nbsp;&nbsp;文件切片后，每次上传的文件名称都是一样的，所以这时不能够在每次请求的时候直接做文件处理，可以先把文件存储起来，等最后一个分片请求后统一进行文件处理。<br />
&nbsp;&nbsp;&nbsp;&nbsp;这时需要在客户端添加一个参数，标识是否是最后一个切片上传的请求，服务端根据参数值判断请求是否完成。修改代码如下：

```ts
const formData = createFormData({
	size: size.toString(),
	name,
	type: type ?? "",
	uploadSize: SLICE_SIZE.toString(),
	file: sliceResult ?? new Blob(),
	isDone: i + SLICE_SIZE > size ? "1" : "0", // 是否最后一个切片请求
});
```

```js
let fileMap = [];
app.post("/upload", async (req, res) => {
	...
	if (uploadSize !== "0") {
	   fileMap.push({
	      filePath,
	      fileData: file.data,
	      isDone,
	   });
	   if (isDone === "1") {
	        fileMap.forEach((item) => {
		    appendFileSync(item.filePath, item.fileData);
		    if (item.isDone === "1") {
		        fileMap = [];
		    }
		});
	    }
		...
	}
});
```

&nbsp;&nbsp;&nbsp;&nbsp;至此，文件切片上传、秒传功能完成。
# 代码地址
https://stackblitz.com/edit/vitejs-vite-sgdzzg
