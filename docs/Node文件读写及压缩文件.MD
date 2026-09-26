---
slug: node-fs-zip
title: "Node 文件读写及压缩文件"
date: 2026-09-26
category: 工程化
excerpt: "fs 创建目录与写入文件，archiver 流式压缩打包。"
tags: [Node, 文件操作]
---

&nbsp;&nbsp;&nbsp;&nbsp;最近开发工作做的功能大多数都是相似的功能，基本的代码结构也相同，所以想着写好一套模板，通过可配置的方式生成每个模块的代码，然后生成压缩包下载下来，解压后直接放到项目目录中，能少写代码。下面介绍使用Node读写文件并生成压缩包的过程。

## 1、创建文件夹

```js
const fs = require("fs");
// 第二个参数的回调方法是必须的
fs.mkdir("url", (val) => {});
```

## 2、写文件

```js
fs.writeFile("创建文件的路径", "写入文件的内容", (val) => {});
```

## 3、压缩文件

这里使用 archiver 进行文件压缩

```js
const fs = require("fs");
const archive = require("archiver");

const filePaths = ["使用fs文件系统生成的文件夹地址"];

// 创建一个可写流 用于传入压缩包数据
const output = fs.createWriteStream("压缩包路径");
// 压缩类型为zip、tar 压缩等级为1-9（1速度最快 即不压缩 9是压缩性能最好）
const archiveZip = archive("zip", {
	zlib: { level: 9 },
});

// 监听压缩过程中的error事件
archiveZip.on("error", function (err) {
	if (err) err;
});
// 使用pipe将两个流连接起来 开始在压缩包中写入数据
archiveZip.pipe(output);
for (const url of filePaths) {
	/**
	 * directory方法是压缩目录，
	 * 第一个参数是源目录路径，第二个参数是文件在压缩包里面的路径
	 * 第二个参数为false，压缩包内不会新建目录
	 * */
	archiveZip.directory(url, false);
}

output.on("close", () => {
	// 删除生成的压缩文件
	fs.unlinkSync("压缩包地址");
});
// 最后使用finalize进行压缩
archiveZip.finalize();
```

## 4、删除文件

```js
// path为生成文件夹的地址
function deleteFolder(path) {
	let files = [];
	if (fs.existsSync(path)) {
		// 用于同步读取给定目录的内容。该方法返回一个数组，其中包含目录中的所有文件名或对象
		files = fs.readdirSync(path);
		files.forEach(function (file, index) {
			let currPath = path + "/" + file;
			// 如果是目录 进行循环遍历
			if (fs.statSync(currPath).isDirectory()) {
				deleteFolder(currPath);
			} else {
				// 删除文件
				fs.unlinkSync(currPath);
			}
		});
		// 删除目录
		fs.rmdirSync(path);
	}
}
```
&nbsp;&nbsp;&nbsp;&nbsp;至此，文件读写、删除及文件压缩都完成了。
