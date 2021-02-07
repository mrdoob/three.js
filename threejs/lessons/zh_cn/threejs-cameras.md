Title: Three.js 摄像机
Description: 设置摄像机
TOC: 摄像机

本文是关于 three.js 系列文章的一部分。第一篇文章是 [three.js 基础](threejs-fundamentals.html)。如果你还没看过而且对three.js 还不熟悉，那应该从那里开始，并且了解如何[设置开发环境](threejs-setup.html)。上一篇文章介绍了 three.js 中的 [纹理](threejs-textures.html)。

我们开始谈谈three.js中的摄像机. 我们已经在[第一篇文章](threejs-fundamentals.html) 中涉及到了摄像机的一些知识, 这里我们要更深入一些. 

在three.js中最常用的摄像机并且之前我们一直用的摄像机是`透视摄像机 PerspectiveCamera`, 它可以提供一个近大远小的3D视觉效果. 

`PerspectiveCamera` 定义了一个 *视锥frustum*. [*frustum* 是一个切掉顶的三角锥或者说实心金字塔型](https://en.wikipedia.org/wiki/Frustum).
说到*实心体solid*, 在这里通常是指一个立方体, 一个圆锥, 一个球, 一个圆柱或锥台.

<div class="spread">
  <div><div data-diagram="shapeCube"></div><div>立方体</div></div>
  <div><div data-diagram="shapeCone"></div><div>圆锥</div></div>
  <div><div data-diagram="shapeSphere"></div><div>球</div></div>
  <div><div data-diagram="shapeCylinder"></div><div>圆柱</div></div>
  <div><div data-diagram="shapeFrustum"></div><div>锥台</div></div>
</div>

重新讲一遍这些东西是因为我好久没有在意过了. 很多书或者文章提到*锥台*这个东西的时候我扫一眼就过去了. 再了解一下不同几何体会让下面的一些表述变得更为感性...吧&#128517;

`PerspectiveCamera`通过四个属性来定义一个视锥. `near`定义了视锥的前端, `far`定义了后端, `fov`是视野, 通过计算正确的高度来从摄像机的位置获得指定的以`near`为单位的视野, 定义的是视锥的前端和后端的高度. `aspect`间接地定义了视锥前端和后端的宽度, 实际上视锥的宽度是通过高度乘以aspect来得到的. 

<img src="resources/frustum-3d.svg" width="500" class="threejs_center"/>

我们借用[上一篇文章](threejs-lights.html)的场景. 其中包含一个地平面, 一个球和一个立方体, 我们可以在其中调整摄像机的设置. 
·
我们通过`MinMaxGUIHelper`来调整`near`, `far`的设置. 显然`near`应该总是比`far`要小. dat.GUI有`min`和`max`两个属性可调, 然后这两个属性将决定摄像机的设置. 


```js
class MinMaxGUIHelper {
  constructor(obj, minProp, maxProp, minDif) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
    this.minDif = minDif;
  }
  get min() {
    return this.obj[this.minProp];
  }
  set min(v) {
    this.obj[this.minProp] = v;
    this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
  }
  get max() {
    return this.obj[this.maxProp];
  }
  set max(v) {
    this.obj[this.maxProp] = v;
    this.min = this.min;  // 这将调用min的setter
  }
}
```

现在我们可以将GUI设置为

```js
function updateCamera() {
  camera.updateProjectionMatrix();
}

const gui = new GUI();
gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
```

任何时候摄像机的设置变动, 我们需要调用摄像机的[`updateProjectionMatrix`](PerspectiveCamera.updateProjectionMatrix)来更新设置. 我们写一个函数`updataCamera`, 当dat.GUI改变了属性的时候会调用它来更新参数. 

{{{example url="../threejs-cameras-perspective.html" }}}

现在可以调整这些数值来观察这些参数是如何影响摄像机的. 注意我们并没有改变`aspect`, 因为这个参数来自于窗口的大小. 如果想调整`aspect`, 只需要开个新窗口然后调整窗口大小就可以了. 

即便是这样, 观察参数对视野的影响还是挺麻烦的. 所以我们来设置两台摄像机吧! 一台是跟上面一样展现出摄像机中看到的实际场景, 另一个则是用来观察这个实际工作的摄像机, 然后画出摄像机的视锥. 

我们需要用到three.js的剪函数(scissor function)来画两个场景和两个摄像机. 

首先让我们用HTML和CSS来定义两个肩并肩的元素. 这也将帮助我们将两个摄像机赋予不同的`OrbitControls`. 


```html
<body>
  <canvas id="c"></canvas>
+  <div class="split">
+     <div id="view1" tabindex="1"></div>
+     <div id="view2" tabindex="2"></div>
+  </div>
</body>
```

CSS将控制两个视窗并排显示在canvas中

```css
.split {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
}
.split>div {
  width: 100%;
  height: 100%;
}
```

接下来将添加一个`CameraHelper`, 它可以把摄像机的视锥画出来

```js
const cameraHelper = new THREE.CameraHelper(camera);

...

scene.add(cameraHelper);
```

我们现在需要查找到刚刚定义的两个元素

```js
const view1Elem = document.querySelector('#view1');
const view2Elem = document.querySelector('#view2');
```

现在只给第一个视窗中的摄像机分配`OrbitControls`

```js
-const controls = new OrbitControls(camera, canvas);
+const controls = new OrbitControls(camera, view1Elem);
```

我们定义第二个`PerspectiveCamera`和`OrbitControls`. 


```js
const camera2 = new THREE.PerspectiveCamera(
  60,  // fov
  2,   // aspect
  0.1, // near
  500, // far
);
camera2.position.set(40, 10, 30);
camera2.lookAt(0, 5, 0);

const controls2 = new OrbitControls(camera2, view2Elem);
controls2.target.set(0, 5, 0);
controls2.update();
```

最后我们需要

最后，我们需要使用剪刀功能从每个摄影机的视角渲染场景，以仅渲染画布的一部分。
这个函数接受一个元素, 计算这个元素在canvas上的重叠面积, 这将设置剪刀函数和视角长宽并返回aspect

```js
function setScissorForElement(elem) {
  const canvasRect = canvas.getBoundingClientRect();
  const elemRect = elem.getBoundingClientRect();

  // 计算canvas的尺寸
  const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
  const left = Math.max(0, elemRect.left - canvasRect.left);
  const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
  const top = Math.max(0, elemRect.top - canvasRect.top);

  const width = Math.min(canvasRect.width, right - left);
  const height = Math.min(canvasRect.height, bottom - top);

  // 设置剪函数以仅渲染一部分场景
  const positiveYUpBottom = canvasRect.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);

  // 返回aspect
  return width / height;
}
```

我们用这个函数在`render`中绘制两遍场景

```js
  function render() {

-    if (resizeRendererToDisplaySize(renderer)) {
-      const canvas = renderer.domElement;
-      camera.aspect = canvas.clientWidth / canvas.clientHeight;
-      camera.updateProjectionMatrix();
-    }

+    resizeRendererToDisplaySize(renderer);
+
+    // 启用剪刀函数
+    renderer.setScissorTest(true);
+
+    // 渲染主视野
+    {
+      const aspect = setScissorForElement(view1Elem);
+
+      // 用计算出的aspect修改摄像机参数
+      camera.aspect = aspect;
+      camera.updateProjectionMatrix();
+      cameraHelper.update();
+
+      // 来原视野中不要绘制cameraHelper
+      cameraHelper.visible = false;
+
+      scene.background.set(0x000000);
+
+      // 渲染
+      renderer.render(scene, camera);
+    }
+
+    // 渲染第二台摄像机
+    {
+      const aspect = setScissorForElement(view2Elem);
+
+      // 调整aspect
+      camera2.aspect = aspect;
+      camera2.updateProjectionMatrix();
+
+      // 在第二台摄像机中绘制cameraHelper
+      cameraHelper.visible = true;
+
+      scene.background.set(0x000040);
+
+      renderer.render(scene, camera2);
+    }

-    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
```

上面的代码还将主辅摄像机的背景色区分开以利观察. 

我们可以移除`updateCamera`了, 因为所有的东西在`render`中更新过了.


```js
-function updateCamera() {
-  camera.updateProjectionMatrix();
-}

const gui = new GUI();
-gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
+gui.add(camera, 'fov', 1, 180);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
-gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
-gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
+gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near');
+gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far');
```

现在我们就可以在辅摄像机中观察到主摄像机的视锥轮廓了. 

{{{example url="../threejs-cameras-perspective-2-scenes.html" }}}

左侧可以看到主摄像机的视角, 右侧则是辅摄像机观察主摄像机和主摄像机的视锥轮廓. 可以调整`near`, `far`, `fov`和用鼠标移动摄像机来观察视锥轮廓和场景之间的关系. 

将`near`调整到大概20左右, 前景就会在视锥中消失. `far`低于35时, 远景也不复存在. 

这带来一个问题, 为什么不把`near`设置到0.0000000001然后将`far`设置成100000000, 使得一切都可以尽收眼底? 原因是你的GPU 8太行, 没有足够的精度来决定什么在前什么在后. 更糟的是, 在默认情况下, 离摄像机近的将会更清晰, 远的模糊, 从`near`到`far`逐渐过渡. 

从上面的例子出发, 我们向场景中添加20个球

```js
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const numSpheres = 20;
  for (let i = 0; i < numSpheres; ++i) {
    const sphereMat = new THREE.MeshPhongMaterial();
    sphereMat.color.setHSL(i * .73, 1, 0.5);
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, i * sphereRadius * -2.2);
    scene.add(mesh);
  }
}
```

把 `near` 设置成0.00001

```js
const fov = 45;
const aspect = 2;  // canvas 默认
-const near = 0.1;
+const near = 0.00001;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
```

调整一下GUI使得能设置到0.00001

```js
-gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
+gui.add(minMaxGUIHelper, 'min', 0.00001, 50, 0.00001).name('near').onChange(updateCamera);
```

你觉得会发生什么?

{{{example url="../threejs-cameras-z-fighting.html" }}}

这就是一个典型的*z冲突*的例子. GPU没有足够的精度来决定哪个像素在前哪个在后. 

以防你的机器太好出现不了我说的情况, 我把我看到的截图放在这

<div class="threejs_center"><img src="resources/images/z-fighting.png" style="width: 570px;"></div>

解决的方法之一是告诉three.js使用不同的方法计算像素的前后关系. 我们可以在创建`WebGLRenderer`时开启`logarithmicDepthBuffer`

```js
-const renderer = new THREE.WebGLRenderer({canvas});
+const renderer = new THREE.WebGLRenderer({
+  canvas,
+  logarithmicDepthBuffer: true,
+});
```

这看起来就行了

{{{example url="../threejs-cameras-logarithmic-depth-buffer.html" }}}

如果这不行的话, 那你就遇到了*为什么不能无脑使用这种解决方案*的情况了. 到2018年9月, 绝大多数台式机可以但是几乎没有移动设备支持这个功能. 

另一个最好别用这种解决方案的原因是这会大大降低运行速度. 

即便是现在跑得好好地, 选择太小的`near`和太大的`far`最终也会遇到同样的问题. 

所以说你需要选择好好抉择`near`和`far`的设置, 来和你的场景配合. 既不丢失重要的近景, 也不让远处的东西消失不见. 如果你想渲染一个巨大的场景, 不但能看清面前的人的眼睫毛又想看到50公里以外的玩意, 你得自己想一个*厉害的*方案, 这里就不涉及了. 现在, 好好地选个需要的参数就行. 

第二种常见的摄像机是`正交摄像机 OrthographicCamera`, 和指定一个视锥不同的是, 它需要设置`left`, `right`
`top`, `bottom`, `near`, 和`far`指定一个长方体, 使得视野是平行的而不是透视的. 

我们来把上面的例子改成`OrthographicCamera`, 首先来设置摄像机


```js
const left = -1;
const right = 1;
const top = 1;
const bottom = -1;
const near = 5;
const far = 50;
const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
camera.zoom = 0.2;
```

我们将`left`和`bottom`设置成 -1 `right` 和 `top`设成 1, 这样就使盒子宽为两个单位, 高两个单位. 我们接下来通过调整`left`和`top`来选择其aspect. 我们将用`zoom`属性来调整相机到底展现多少的单位大小. 


给GUI添加`zoom`设置

```js
const gui = new GUI();
+gui.add(camera, 'zoom', 0.01, 1, 0.01).listen();
```

`listen`调用告诉dat.GUI去监视属性的变化. 写在这里是因为`OrbitControls`同样可以控制缩放. 在这个例子中, 鼠标滚轮将会通过`OrbitControls`控件来控制缩放. 

最后更改aspect然后更新摄像机

```js
{
  const aspect = setScissorForElement(view1Elem);

  // 使用aspect更新摄像机
-  camera.aspect = aspect;
+  camera.left   = -aspect;
+  camera.right  =  aspect;
  camera.updateProjectionMatrix();
  cameraHelper.update();

  // 在主摄像机中不绘制视野辅助线
  cameraHelper.visible = false;

  scene.background.set(0x000000);
  renderer.render(scene, camera);
}
```

现在就可以看到`OrthographicCamera`工作了. 

{{{example url="../threejs-cameras-orthographic-2-scenes.html" }}}

大多数情况下, 绘制2D图像的时候会用到`OrthographicCamera`. 你可以自己决定摄像机的视野大小. 比如说你想让canvas的一个像素匹配摄像机的一个单位, 你可以这么做

将原点置于中心, 令一个像素等于一个单位

```js
camera.left = -canvas.width / 2;
camera.right = canvas.width / 2;
camera.top = canvas.height / 2;
camera.bottom = -canvas.height / 2;
camera.near = -1;
camera.far = 1;
camera.zoom = 1;
```

或者如果我们想让原点在左上, 就像是2D canvas

```js
camera.left = 0;
camera.right = canvas.width;
camera.top = 0;
camera.bottom = canvas.height;
camera.near = -1;
camera.far = 1;
camera.zoom = 1;
```

这样左上角就成了0,0

试试, 这样设置摄像机

```js
const left = 0;
const right = 300;  // 默认的canvas大小
const top = 0;
const bottom = 150;  // 默认的canvas大小
const near = -1;
const far = 1;
const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
camera.zoom = 1;
```

然后我们载入六个材质, 生成六个平面, 一一对应. 把每一个平面绑定到父对象`THREE.Object3D`上, 以便调整每个平面和左上角原点的相对关系

```js
const loader = new THREE.TextureLoader();
const textures = [
  loader.load('resources/images/flower-1.jpg'),
  loader.load('resources/images/flower-2.jpg'),
  loader.load('resources/images/flower-3.jpg'),
  loader.load('resources/images/flower-4.jpg'),
  loader.load('resources/images/flower-5.jpg'),
  loader.load('resources/images/flower-6.jpg'),
];
const planeSize = 256;
const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
const planes = textures.map((texture) => {
  const planePivot = new THREE.Object3D();
  scene.add(planePivot);
  texture.magFilter = THREE.NearestFilter;
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  planePivot.add(mesh);
  // 调整平面使得左上角为原点
  mesh.position.set(planeSize / 2, planeSize / 2, 0);
  return planePivot;
});
```

然后当canvas更新后我们更新摄像机设置

```js
function render() {

  if (resizeRendererToDisplaySize(renderer)) {
    camera.right = canvas.width;
    camera.bottom = canvas.height;
    camera.updateProjectionMatrix();
  }

  ...
```

`planes` 是`THREE.Mesh`的数组, 每一个对应一个平面. 
现在让它随着时间移动


```js
function render(time) {
  time *= 0.001;  // 转换为秒;

  ...

  const distAcross = Math.max(20, canvas.width - planeSize);
  const distDown = Math.max(20, canvas.height - planeSize);

  // 来回运动的总距离
  const xRange = distAcross * 2;
  const yRange = distDown * 2;
  const speed = 180;

  planes.forEach((plane, ndx) => {
    // 为每个平面单独计算时间
    const t = time * speed + ndx * 300;

    // 在0到最远距离之间获取一个值
    const xt = t % xRange;
    const yt = t % yRange;

    // 0到距离的一半, 向前运动
    // 另一半的时候往回运动
    const x = xt < distAcross ? xt : xRange - xt;
    const y = yt < distDown   ? yt : yRange - yt;

    plane.position.set(x, y, 0);
  });

  renderer.render(scene, camera);
```

你可以看到图片在其中弹跳, 和边际完美契合, 就是2D canvas的效果一样

{{{example url="../threejs-cameras-orthographic-canvas-top-left-origin.html" }}}

另一个常见的用途是用`OrthographicCamera`来展示模型的三视图.

<div class="threejs_center"><img src="resources/images/quad-viewport.png" style="width: 574px;"></div>

上面的截图展示了一个透视图和三个正交视角.

这就是摄像机的基础. 我们在其他的文章中会介绍另外的一些摄像机用法. 现在, 我们移步到[阴影](threejs-shadows.html).


<canvas id="c"></canvas>
<script type="module" src="resources/threejs-cameras.js"></script>
