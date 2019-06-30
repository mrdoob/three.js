Title: Three.js响应式设计
Description: 如何让你的three.js适应不同尺寸的显示器。
TOC: 响应式设计

这是three.js系列文章的第二篇。
第一篇是[关于基础](threejs-fundamentals.html).
如果你还没有阅读第一篇那你应该从第一篇开始。

这篇文章是关于如何让你的three.js应用能适应任何情况。
让一个网页是响应式的通常是指让网页能在从桌面到平板再到手机
不同尺寸的显示器上显示良好。

对three.js来说有更多的情况要考虑。例如，在左侧、右侧、顶部或底部
具有控件的三维编辑器是我们可能需要处理的。文档中部的在线例子
是我们要处理的另一个例子。

上一个例子中我们使用了一个没有设置css和尺寸的canvas。

```html
<canvas id="c"></canvas>
```

那个canvas默认300x150像素。

在web平台推荐使用css来设置物体的尺寸。

我们通过添加CSS来让canvas填充整个页面。

```html
<style>
html, body {
   margin: 0;
   height: 100%;
}
#c {
   width: 100%;
   height: 100%;
   display: block;
}
</style>
```

HTML中的body默认有5个像素的margin值所以设置margin为0来移除margin值。
设置html和body的高度为100%让他们充满整个窗口。不然的话他们的大小只会
和填充他们的内容一样。

然后我们让`id=c`的元素的尺寸是容器的100%这里是body标签。  

最后我们设置它的`display`为`block`。canvas的display默认为
`inline`。行内元素的末尾会有空格。
通过设置canvas为块级元素就能消除这个空格。

这里是结果。

{{{example url="../threejs-responsive-no-resize.html" }}}

你可以看到canvas充满了整个页面但是有两个问题。
第一是我们的立方体被拉伸了。他们不是立方体了更像是个盒子
太高或者太宽。 在新标签中打开它然后改变尺寸你就能看到立方体
是怎么在宽高上被拉伸的。

<img src="resources/images/resize-incorrect-aspect.png" width="407" class="threejs_center nobg">

另一个问题是立方体看起来分辨率太低或者说块状化或者有点模糊。
将窗口拉伸的非常大你就能看到问题。

<img src="resources/images/resize-low-res.png" class="threejs_center nobg">

我们先解决拉伸的问题。为此我们要将相机的aspect设置为canvas的宽高比。
我们可以通过canvas的`clientWidth`和`clientHeight`属性来实现。

我们需要将渲染循环变成这样。

```js
function render(time) {
  time *= 0.001;

+  const canvas = renderer.domElement;
+  camera.aspect = canvas.clientWidth / canvas.clientHeight;
+  camera.updateProjectionMatrix();

  ...
```

现在立方体应该不会变形了。

{{{example url="../threejs-responsive-update-camera.html" }}}

在新标签页中打开例子你应该能看到立方体的宽高不会再被拉伸了。
他们都会保持正确的比例不管窗口的尺寸如何。

<img src="resources/images/resize-correct-aspect.png" width="407" class="threejs_center nobg">

我们现在来解决块状化的问题。

canvas元素有两个尺寸。一个是canvas在页面上的显示尺寸，
是我们用CSS来设置的。另一个尺寸是
canvas本身像素的数量。这和图片一样。
比如我们有一个128x64像素的图片然后我们可以通过CSS让它显示为
400x200像素。

```html
<img src="some128x64image.jpg" style="width:400px; height:200px">
```

一个canvas的内部尺寸，它的分辨率，通常被叫做drawingbuffer尺寸。
在three.js中我们可以通过调用`renderer.setSize`来设置canvas的drawingbuffer。
我们应该选择什么尺寸? 最显而易见的是"和canvas的显示尺寸一样"。
再一次，我们可以使用canvas的`clientWidth`和`clientHeight`属性。

我们写一个函数来检查渲染器的canvas尺寸是不是和canvas的显示尺寸不一样
如果不一样就设置它。

```js
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
```

注意我们检查了canvas是否真的需要调整大小。 
调整画布大小是canvas规范的一个有趣部分，如果它已经是我们想要的大小，最好不要设置相同的大小.
 
一旦我们知道了是否需要调整大小我们就调用`renderer.setSize`然后
传入新的宽高。在末尾传入`false`很重要。
`render.setSize`默认会设置canvas的CSS尺寸但这并不是我们想要的。
我们希望浏览器能继续工作就像其他使用CSS来定义尺寸的其他元素。我们不希望
three.js使用canvas和其他元素不一样。

注意如果我们的canvas大小被调整了那函数会返回true。我们可以利用
这个来检查是否有其他的东西应该更新。我们修改渲染循环
来使用我们的新函数。

```js
function render(time) {
  time *= 0.001;

+  if (resizeRendererToDisplaySize(renderer)) {
+    const canvas = renderer.domElement;
+    camera.aspect = canvas.clientWidth / canvas.clientHeight;
+    camera.updateProjectionMatrix();
+  }

  ...
```

因为只有canvas的显示尺寸变化时aspect值才变化所以我们
只在`resizeRendererToDisplaySize`函数返回`true`时才设置摄像机的aspect。

{{{example url="../threejs-responsive.html" }}}

现在渲染的分辨率应该是和canvas的显示尺寸一样的。

为了说清楚让CSS处理调整尺寸我们将代码
放进[separate `.js` file](../threejs-responsive.js)。
这里还有一些例子我们让CSS决定尺寸的大小并且注意我们并没有改变任何
代码来让他们工作。

我们将立方体放在文字段落的中间。

{{{example url="../threejs-responsive-paragraph.html" startPane="html" }}}

这是我们在编辑器样式布局中使用的相同代码，右侧的控制区域可以调整大小。

{{{example url="../threejs-responsive-editor.html" startPane="html" }}}

重点注意我们的代码并没有改变，只有我们的HTML和CSS变了。

## 应对HD-DPI显示器

HD-DPI代表每英寸高密度点显示器(视网膜显示器)。它指的是当今大多数的Mac和windows机器以及几乎所有的智能手机。

浏览器中的工作方式是不管屏幕的分辨率有多高使用CSS像素设置尺寸会被认为是一样的。
同样的物理尺寸浏览器会渲染出字体的更多细节。

使用three.js有多种方法来应对HD-DPI。

第一种就是不做任何特别的事情。这可以说是最常见的。
渲染三维图形需要大量的GPU处理能力。移动端的GPU能力比桌面端的要弱。至少截止到2018年,
手机都有非常高的分辨率显示器。
目前最好的手机的HD-DPI比例为3x，意思是非高密度点显示器上的一个像素在高密度显示器上是9个像素。 
意味着需要9倍的渲染。

计算9倍的像素是个大工程所以如果保持代码不变我们将计算一个像素然后浏览器将以三倍大小绘制(3x3=9像素)。

对于大型的three.js应用来说上面就是你想要的否侧你的帧速率会很低。

尽管如此如果你确实想用设备的分辨率来渲染，three.js中有两种方法来实现。

一种是使用renderer.setPixelRatio来告诉three.js分辨率的倍数。
访问浏览器从CSS像素到设备像素的倍数然后传给three.js。

     renderer.setPixelRatio(window.devicePixelRatio);

之后任何对`renderer.setSize`的调用都会神奇地使用您请求的大小乘以您传入的像素比例.
**强烈不建议这样**。 看下面。

另一种方法是在调整canvas的大小时自己处理。

```js
    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const pixelRatio = window.devicePixelRatio;
      const width = canvas.clientWidth * pixelRatio;
      const height = canvas.clientHeight * pixelRatio;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }
```

第二章方法从客观上来说更好。为什么？因为我拿到了我想要的。
在使用three.js时有很多种情况下我们需要知道canvas的drawingBuffer的确切尺寸。
比如制作后期处理滤镜或者我们在操作着色器需要访问gl_FragCoord变量，如果我们截屏或者给GPU
读取像素，绘制到二维的canvas等等。
通过我们自己处理我们会一直知道使用的尺寸是不是我们需要的。
幕后并没有什么特殊的魔法发生。

这是一个使用上面代码的例子。

{{{example url="../threejs-responsive-hd-dpi.html" }}}

可能很难看出区别但是如果你有一个HD-DPI显示器
和上面的例子做对比你就能发现边角更清晰。

这篇文章涵盖了一个非常基础但是很有必要的主题。接下来我们快速
[过一遍three.js提供的基本的东西 ](threejs-primitives.html).

