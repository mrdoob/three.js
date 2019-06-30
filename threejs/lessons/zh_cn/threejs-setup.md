Title: Three.js设置
Description: 如何为你的three.js设置开发环境
TOC: 设置

这是three.js系列文章的其中之一。
第一篇是[关于three.js基础](threejs-fundamentals.html)。
如果你还没有阅读那你应该从那开始。

在我们深入之前我们需要讨论一下设置你的电脑来开发。
尤其是，因为安全的原因，
WebGL不能直接从你的硬件使用图片。意思是说
为了能开发你需要使用web服务。幸运的是
web服务很容易设置和使用。

首先如果你喜欢你可以从[这个链接](https://github.com/gfxfundamentals/threejsfundamentals/archive/gh-pages.zip)
下载整个网站。
一旦下载完成双击文件来解压。

下一步下载一个简单的web服务。

如果你更喜欢有用户界面的web服务，这有一个
[Servez](https://greggman.github.io/servez)

{{{image url="resources/servez.gif" className="border" }}}

只要将他指向你解压的文件夹，点击"Start"，然后
打开你的浏览器的[`http://localhost:8080/`](http://localhost:8080/)或者
你想浏览例子打开[`http://localhost:8080/threejs`](http://localhost:8080/threejs)。

点击stop或者推出Servez来停止服务。
如果你更喜欢命令行(我就是)，另一种方法是使用[node.js](https://nodejs.org)。
下载，安装，然后打开一个command prompt / console / terminal窗口。 如果你是在Windows上安装程序会添加一个特别的"Node Command Prompt"所以使用它。

然后安装[`http-server`](https://github.com/indexzero/http-server)通过输入

    npm -g install http-server

如果你是OSX使用

    sudo npm -g install http-server

一旦你输入完成

    http-server path/to/folder/where/you/unzipped/files

它会打印像这样的东西

{{{image url="resources/http-server-response.png" }}}

然后在你的浏览器中打开[`http://localhost:8080/`](http://localhost:8080/)。

如果你没有指定路径那么http-server会使用当前的文件夹。

如果这些都不是你的选择
[这里有很多其他的服务可供选择](https://stackoverflow.com/questions/12905426/what-is-a-faster-alternative-to-pythons-http-server-or-simplehttpserver)。

现在你有了服务我们可以移步到[纹理](threejs-textures.html).
