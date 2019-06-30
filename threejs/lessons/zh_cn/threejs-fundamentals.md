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
你需要一个像[Babel](http://babel.io)一样的语法编译器 。
当然使用非常老的浏览器的用户可能根本不能运行Three.js。

人们在学习大多数编程语言的时候第一件事就是让电脑打印`"Hello World!"`。
对于三维来说第一件事往往是创建一个三维的立方体。
所以我们从"Hello Cube!"开始。

首先我们需要一个canvas标签。

```html
<body>
  <canvas id="c"></canvas>
</body>
```

Three.js将会使用这个canvas标签所以我们要先获取它然后传给three.js。

```html
<script>
'use strict';

/* global THREE */

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
  ...
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

这四个参数定义了一个*"frustum"*。一个*frustum*是指一个像被削去顶部
的金字塔形状。换句话说把*"frustum"*想象成其他形状比如球体、
立方体、棱柱体、截椎体。 

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

上面的示意图中我们能看到摄像机的位置在`z = 2`。它朝向
Z轴负方向。我们的截椎体从摄像机前方的0.1到5。因为这张图是俯视图,
fov会受到aspect的影响。canvas的宽度是高度的两倍，
所以水平视角会比我们设置的垂直视角75要大。

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

然后创建一个`Mesh`. `Mesh`代表了`Geometry`(物体的形状)和`Material` (怎么
绘制物体, 光滑还是平整, 什么颜色, 什么贴图等等)的组合，
以及物体在场景中的位置、朝向、和缩放。

```js
const cube = new THREE.Mesh(geometry, material);
```

最后我们将mesh添加到场景中。

```js
scene.add(cube);
```

然后我们通过将scene和camera传递给renderer的render方法
来渲染整个场景。

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

希望这个简短的介绍能帮助你起步。 [Next up we'll cover
making our code responsive so it is adaptable to multiple situations](threejs-responsive.html).

