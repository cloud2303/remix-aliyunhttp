# 使用指南

适配remix 1.1.1

### 使用serverlessDev部署remix(推荐)

阿里云函数计算+阿里云对象存储oss

安装地址

[https://serverlessdevs.resume.net.cn/zh-cn/developer/index.html](https://serverlessdevs.resume.net.cn/zh-cn/developer/index.html)

建议安装可视化工具

配置好密钥

点击模板地址,查看教程
[https://github.com/cloud2303/serverlessDev-remix](https://github.com/cloud2303/serverlessDev-remix)



### 手动设置(不推荐)

示例 使用阿里云函数加腾讯云存储桶，阿里http函数必须要加上域名才能访问

[http://ali.jiahuiblog.com/](http://ali.jiahuiblog.com/)


在remix.config.json中指定要部署的public静态文件夹的位置，比如我这里放到了存储桶
![静态文件的位置](./md/1639054088730.jpg)
```
npm run build
```
生成public文件夹和server文件夹

将public文件夹放到存储桶中

创建阿里云http函数

将server文件夹中的build上传到阿里云函数中(选择nodejs14)

修改云函数的默认index.js为这样

```js
const {
  createRequestHandler
} = require("remix-aliyunhttp");
exports.handler = createRequestHandler({
  build: require("./build")
});
```
```
安装依赖
npm install remix-aliyunhttp
```
阿里云函数的目录结构像这样
```
---build
---node_modules
---package.json
---index.js
```
绑定自定义域名就可以访问了



