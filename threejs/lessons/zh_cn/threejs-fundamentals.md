Title: Three.js基础
Description: 学习Three.js的第一篇文章
TOC: 基础

这是Three.js系列文章的第一篇。
[Three.js](http://threejs.org)是一个尽可能简化在网页端获取3D
内容的库。

Three.js经常会和WebGL混淆，
但也并不总是,three.js其实是使用WebGL来绘制三维效果的。
[WebGL是一个只能画点、线和三角形的非常底层的系统](https://webglfundamentals.org). 
想要用WebGL来做一些实用的东西通常需要大量的代码，
这就是Three.js的用武之地。它帮我们处理了像场景、灯光、阴影、材质、贴图、空间运算、几乎所有你需要自己通过WebGL来实现的东西。

这套教程假设你已经了解了JavaScript,因为大部分内容我们将会
用到ES6的语法。[点击这里查看你需要提前掌握的东西](threejs-prerequisites.html)。 
大部分支持Three.js的浏览器都会自动更新，所以部分用户应该都能运行本套教程的代码。
如果你想在非常老的浏览器上运行此代码，
你需要一个像[Babel](http://babeljs.io)一样的语法编译器 。
当然使用非常老的浏览器的用户可能根本不能运行Three.js。

人们在学习大多数编程语言的时候第一件事就是让电脑打印`"Hello World!"`。
对于三维来说第一件事往往是创建一个三维的立方体。
所以我们从"Hello Cube!"开始。

在我们开始前，让我们试着让你了解一下three.js应用的结构。一个three.js应用要求你创建很多的对象，并且将他们联系在一起。这有一个图例来表示一个小的three.js的应用。

<div class="threejs_center"><img src="resources/images/threejs-structure.svg" style="width: 768px;"></div>

上图需要注意的事项。

* 有一个`Renderer`。这可以说是three.js的主要对象。你传入了一个`Scene`和一个`Camera`到`Renderer`里面，然后他来渲染 （画）出在相机视椎体中的3D场景，作为一个2D的图片在画布上。

* 有一个[场景图](threejs-scenegraph.html) 它是一个类似结构的树，由很多对象组成，比如一个`Scene`对象 ，多个`Mesh`对象，`Light`对象，`Group`，`Object3D`，和`Camera`对象。一个`Scene`对象定义了场景图最基本的要素，并包含背景色和雾等属性。这些对象定义了一个分层的父/子树的结构，并且展现出对象出现的地方和他们的方向。子对象的位置和方向是相对于父对象而言的。比如说汽车的轮子是汽车的子对象，这样移动和定位汽车就会自动移动轮子。你可以了解更多在[场景图的文章](threejs-scenegraph.html)中。

  注意图中`Camera`是一半在场景图中，一半在场景图外的。这表示在three.js中，不像其他的对象一样，一个`Camera`不一定要在场景图中起作用。就像其他的对象一样，一个`Camera`，作为一些其他对象的子对象，将会跟随他的父对象移动和朝向。这有一个例子，放置多个`Camera`对象在一个场景图中在[场景图的文章](threejs-scenegraph.html)的结尾部分。

* `Mesh`对象代表用一个特定的`Material`绘制一个特定的`Geometry`。`Material`对象和`Geometry`对象可以被多个`Mesh`对象使用。比如在不同的位置画两个蓝色立方体，我们会需要两个`Mesh`对象来代表每一个立方体的位置和方向。我们只需要一个`Geometry`来存放立方体的顶点数据，和一个`Material`来定义蓝色就可以了。两个`Mesh`对象都涉及到相同的`Geometry`对象和`Material`对象。

* `Geometry`对象代表一些几何体，比如说球体、立方体、平面、狗、猫、人、树、建筑等的顶点信息。Three.js提供了多种内置的[基本元素](threejs-primitives.html) 。你也可以[创建自定义几何体](threejs-custom-geometry.html)并且[从文件中加载几何体](threejs-load-obj.html)。

* `Material`对象代表[绘制几何体的表面属性](threejs-materials.html)，包括使用的颜色，和光亮程度。一个`Material`可以引用一个或多个`Texture`对象，这些对象可以用来，例如，将图像包裹到几何体的表面。

* `Texture`对象通常代表图片要么[从图像文件中加载](threejs-textures.html)，[在画布上形成](threejs-canvas-textures.html)，要么 [由另一个场景渲染出](threejs-rendertargets.html)。

* `Light`对象代表[不同种类的光](threejs-lights.html)。

考虑以上所有注意事项，我们接下来要做一个最小的*"Hello Cube"* 设置，像下面这样

<div class="threejs_center"><img src="resources/images/threejs-1cube-no-light-scene.svg" style="width: 500px;"></div>

首先让我们先来加载three.js

```html
<script type="module">
import * as THREE from './resources/threejs/r119/build/three.module.js';
</script>
```

把`type="module"`放到script标签中很重要。这可以让我们使用`import`关键字加载three.js。还有其他的方法可以加载three.js，但是r106开始，推荐使用模块的方式。模块的优点是可以很方便地导入需要的其他模块。这样我们就不用再手动加载它们所依赖的额外脚本了。

下一步我们需要一个`<canvas>`标签。

```html
<body>
  <canvas id="c"></canvas>
</body>
```

Three.js将会使用这个canvas标签所以我们要先获取它然后传给three.js。

```html
<script type="module">
import * as THREE from './resources/threejs/r119/build/three.module.js';

+function main() {
+  const canvas = document.querySelector('#c');
+  const renderer = new THREE.WebGLRenderer({canvas});
+  ...
</script>
```

注意这里有一些细节。如果你没有给three.js传canvas，three.js会自己创建一个
，但是你必须手动把它添加到文档中。在哪里添加可能会不一样这取决你怎么使用，
我发现给three.js传一个canvas会更灵活一些。我可以将canvas放到任何地方，
代码都会找到它，假如我有一段代码是将canvas插入到文档中，那么当需求变化时，
我很可能必须去修改这段代码。

在查找到canvas之后我们创建一个`WebGLRenderer`。渲染器负责拿到你提供的所有数据，
然后将它渲染到canvas上。之前还有其他渲染器，比如`CSSRenderer`、`CanvasRenderer`。
在将来可能还会有`WebGL2Renderer` 或者 `WebGPURenderer`。目前的话是 `WebGLRenderer`使用WebGL将三维渲染到canvas上。

接下来我们需要一个摄像机。

```js
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
```

`fov`是`field of view`的缩写。 当前的情况是垂直方向为75度。
注意three.js中大多数的角用弧度表示，但是因为某些原因透视摄像机使用角度表示。

`aspect`指canvas的显示比例。我们将在别的文章详细讨论，但是在默认情况下
canvas是300x150像素，所以aspect为300/150或者说2.。

`near`和`far`代表摄像机前方将要被渲染的空间。
任何在这个范围前面或者后面的物体都将被裁剪(不绘制)。

这四个参数定义了一个 *"frustum"*（译者注：视椎体）。 *frustum*是指一个像被削去顶部
的金字塔形状。换句话说，可以把"frustum"想象成其他形状比如球体、立方体、棱柱体、截椎体。 

<img src="resources/frustum-3d.svg" width="500" class="threejs_center"/>

近平面和远平面的高度由fov决定。
两个平面的宽度由fov和aspect决定。

截椎体内部的物体将被绘制，截椎体外的东西将不会被绘制。

摄像机默认指向Z轴负方向，上方向朝向Y轴正方向。我们将会把立方体
放置在坐标原点，所以我们需要往后移动摄像机才能看到物体。

```js
camera.position.z = 2;
```

下面是我们想要达到的效果。

<img src="resources/scene-down.svg" width="500" class="threejs_center"/>

上面的示意图中我们能看到摄像机的位置在`z = 2`。它朝向Z轴负方向。我们的截椎体从摄像机前方的0.1到5。因为这张图是俯视图,fov会受到aspect的影响。canvas的宽度是高度的两倍，所以水平视角会比我们设置的垂直视角75度要大。

然后我们创建一个`Scene`(场景)。`Scene`是three.js最基本的组成.
需要three.js绘制的东西都需要加入到scene中。 我们将会
在[scene是如何工作的](threejs-scenegraph.html)中详细讨论。

```js
const scene = new THREE.Scene();
```

然后我们创建一个包含盒子信息的`BoxGeometry`。
几乎所有的希望在three.js中显示的物体都需要一个定义了组成三维物体的顶点的几何体。

```js
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
```

然后我们创建一个基本的材质并设置它的颜色. Colors的值可以
用css方式和十六进制来表示。

```js
const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
```

然后创建一个`Mesh`。一个`Mesh`代表了三件事情的合集

1. `Geometry`(物体的形状)
2. `Material` (怎么绘制物体, 光滑还是平整, 什么颜色, 什么贴图等等)的组合
3. 对象在场景中相对于他父对象的位置、朝向、和缩放。下面的代码父对象是场景。

```js
const cube = new THREE.Mesh(geometry, material);
```

最后我们将mesh添加到场景中。

```js
scene.add(cube);
```

然后我们通过scene和camera传递给renderer的render方法来渲染整个场景。

```js
renderer.render(scene, camera);
```

这里有一个实例。

{{{example url="../threejs-fundamentals.html" }}}

很难看出来这是一个三维的立方体，因为我们
直视Z轴的负方向并且立方体和坐标轴是对齐的，
所以我们只能看到一个面。

我们来让立方体旋转起来，希望
能看出是三维的。为了让它动起来我们需要在渲染循环函数中使用
[`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).

这是我们的渲染循环函数。

```js
function render(time) {
  time *= 0.001;  // convert time to seconds

  cube.rotation.x = time;
  cube.rotation.y = time;

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

`requestAnimationFrame`会告诉浏览器你有那些东西想要做动画。
传入一个函数作为回调函数。我们这里的函数是`render`。浏览器
会调用你的函数然后如果你更新了跟页面显示有关的东西，
浏览器就会重新渲染页面。我们这里是调用three.js的
`renderer.render`函数来绘制我们的场景。

`requestAnimationFrame` 会传入从页面加载到
我们函数的时间. 传入的时间是毫秒数。我发现
用秒会更简单所以我们把它转换成秒。

然后我们把立方体的X轴和Y轴方向的旋转角度设置成当前时间。这些旋转角度
是[弧度制](https://en.wikipedia.org/wiki/Radian)。一圈的弧度
为2Π所以我们的立方体在每个方向旋转一周的时间为6.28
秒。

然后渲染我们的场景并且调用另一帧动画来继续我们的循环。

在循环的未免我们调用一次`requestAnimationFrame`来开始循环渲染.

{{{example url="../threejs-fundamentals-with-animation.html" }}}

效果好了一些但还是很难看出是三维的。添加灯光会有帮助，
所以我们来添加一盏灯光。three.js中有很多种类型的灯光，
我们将在[后期文章](threejs-lights.html)中详细讨论。现在我们先创建一盏平行光。

```js
{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
}
```

平行光有一个位置和目标点。默认值都为 0, 0, 0。 我们这里
设置灯光的位置为 -1, 2, 4 所以它位于摄像机前面的
稍微左上方一点。目标点还是 0, 0, 0 所以它朝向
坐标原点。

我们还需要改变材质。`MeshBasicMaterial`材质不会受到灯光的
影响。我们将他改成会受灯光影响的`MeshPhongMaterial`材质。

```js
-const material = new THREE.MeshBasicMaterial({color: 0x44aa88});  // greenish blue
+const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // greenish blue
```

这是我们新的项目结构

<div class="threejs_center"><img src="resources/images/threejs-1cube-with-directionallight.svg" style="width: 500px;"></div>

下面开始生效了。

{{{example url="../threejs-fundamentals-with-light.html" }}}

现在应该可以很清楚的看出是三维的。

为了更有乐趣我们再添加两个立方体。

每个立方体将会使用同一个几何体但是不同的材质，
这样每个立方体将会是不同的颜色。

首先我们创建一个根据指定的颜色生成新材质的函数。
然后函数会根据指定的几何体生成一个mesh，
最后将他添加进场景并设置X轴的位置。

```js
function makeInstance(geometry, color, x) {
  const material = new THREE.MeshPhongMaterial({color});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;

  return cube;
}
```

然后我们将使用三种不同的颜色和X轴位置调用三次函数，
将生成的网格实例存在一个数组中。

```js
const cubes = [
  makeInstance(geometry, 0x44aa88,  0),
  makeInstance(geometry, 0x8844aa, -2),
  makeInstance(geometry, 0xaa8844,  2),
];
```

最后我们将在渲染函数中旋转三个立方体。我们
给每个立方体设置了稍微不同的旋转角度。

```js
function render(time) {
  time *= 0.001;  // convert time to seconds

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  ...
```

这里是结果.

{{{example url="../threejs-fundamentals-3-cubes.html" }}}

如果你对比上面的示意图可以看到
效果符合我们的预想。位置为X = -2 和 X = +2
的立方体有一部分在我们的截椎体外面。他们大部分是被
包裹的，因为水平方向的视角非常大。

我们的项目现在有了这样的结构

<div class="threejs_center"><img src="resources/images/threejs-3cubes-scene.svg" style="width: 610px;"></div>

正如你看见的那样，我们有三个`Mesh`引用了相同的`BoxGeometry`。每个`Mesh`引用了一个单独的
`MeshPhongMaterial`来显示不同的颜色。

希望这个简短的介绍能帮助你起步。[接下来我们将介绍如何使我们的代码具有响应性，从而使其能够适应多种情况](threejs-responsive.html).

<div id="es6" class="threejs_bottombar">
<h3>es6模块，three.js，和文件夹结构</h3>
<p>从r106版本开始，使用three.js的首选方式是通过<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import">es6模块</a>。</p>
<p>
在一个脚本中，es6模块可以通过<code>import</code>关键字加载或者通过<code>&lt;script type="module"&gt;</code>行内标签。这有一个两种方法都用的例子。
</p>
<pre class=prettyprint>
&lt;script type="module"&gt;
import * as THREE from './resources/threejs/r119/build/three.module.js';

...

&lt;/script&gt;
</pre>
<p>
路径必须是绝对或相对的。相对路径通常由<code>./</code>或者<code>../</code>开头，和其他标签不同如<code>&lt;img&gt;</code>和<code>&lt;a&gt;</code>.
</p>
<p>
只要它们的绝对路径完全相同，对同一脚本的引用将只被加载一次。对于three.js这意味着它需要你把所有的实例的库放在正确的文件夹结构中。
</p>
<pre class="dos">
someFolder
 |
 ├-build
 | |
 | +-three.module.js
 |
 +-examples
   |
   +-jsm
     |
     +-controls
     | |
     | +-OrbitControls.js
     | +-TrackballControls.js
     | +-...
     |
     +-loaders
     | |
     | +-GLTFLoader.js
     | +-...
     |
     ...
</pre>
<p>
之所以需要这种文件夹结构，是因为像<a href="https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js"><code>OrbitControls.js</code></a>这样的示例中的脚本有一个复杂的相对路径，像下面这样
</p>
<pre class="prettyprint">
import * as THREE from '../../../build/three.module.js';
</pre>
<p>
使用相同的结构保证了当你导入three和任一示例库时，它们都会引用同一个three.module.js文件。
</p>
<pre class="prettyprint">
import * as THREE from './someFolder/build/three.module.js';
import {OrbitControls} from './someFolder/examples/jsm/controls/OrbitControls.js';
</pre>
<p>在使用CDN时，是同样的道理。确保<code>three.modules.js</code>的路径以
<code>/build/three.modules.js</code>结尾，比如</p>
<pre class="prettyprint">
import * as THREE from 'https://unpkg.com/three@0.108.0/<b>build/three.module.js</b>';
import {OrbitControls} from 'https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js';
</pre>
<p>如果你偏向于旧式的<code>&lt;script src="path/to/three.js"&gt;&lt;/script&gt;</code>样式，你可以查看<a href="https://r105.threejsfundamentals.org">这个网站的旧版本</a>。
Three.js的政策是不担心向后的兼容性。他们希望你使用特定的版本，就像希望你下载代码并把它放在你的项目中一样。当升级到较新的版本时，你可以阅读 <a href="https://github.com/mrdoob/three.js/wiki/Migration-Guide">迁移指南</a> 看看你需要改变什么。如果要同时维护一个es6模块和一个类脚本版本的网站，那工作量就太大了，所以今后本网站将只显示es6模块样式。正如其他地方说过的那样，为了支持旧版浏览器，请考虑使用<a href="https://babeljs.io">转换器</a>。</p>
</div>