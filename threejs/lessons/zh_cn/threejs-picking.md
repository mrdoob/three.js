Title: Three.js 拾取
Description: 在Three.js中，鼠标选取对象
TOC: 鼠标选取对象

*拾取* 指代推断用户点击或触碰了哪个对象的过程。有很多方式实现拾取，但是，每一种都有相应的成本，使用时需有所取舍。下面是最常用的两种方式：

**射线追踪法**（raycasting）很可能是最常用的方法，其基本原理是：从鼠标处发射一条射线，穿透场景的视椎体，通过计算，找出视锥体中哪些对象与射线相交。

首先，获取鼠标的屏幕坐标.其次，对其应用摄像机的投影和方向的矩阵变换，得到其在世界空间的坐标。然后，计算出一条射线，从视锥体的近端平面射向远端平面。再然后，对于场景中每一个对象的每一个三角，检查其是否与射线相交。假设你的场景中有1000个对象，每个对象有1000个三角，那么就需要检查一百万个三角。

对此，可以做一些优化，先检查对象的包围球或包围盒是否与射线相交，包围球或包围盒是指包含整个对象的球体或者立方体，如果射线未相交，就不需要检查组成该对象的三角们了。

THREE.js 提供了 `RayCaster` 类来做这些事情。

接下来，让我们先创建一个包含100个对象的场景，然后试着去拾取这些对象。可以从样例[threejs-响应式](threejs-responsive.html)开始。

改动一些代码
使摄像机成为一个对象的子元素，旋转这个对象时，摄像机会像绑定在自拍杆上一样，在场景中游弋。

```js
*const fov = 60;
const aspect = 2;  // 画布默认纵横比为2
const near = 0.1;
*const far = 200;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
*camera.position.z = 30;

const scene = new THREE.Scene();
+scene.background = new THREE.Color('white');

+// 把摄像机放到自拍杆上 (把它添加为一个对象的子元素)
+// 如此，我们就能通过旋转自拍杆，来移动摄像机
+const cameraPole = new THREE.Object3D();
+scene.add(cameraPole);
+cameraPole.add(camera);
```

在 `render` 函数中旋转摄像机端点。
```js
cameraPole.rotation.y = time * .1;
```

把光源也绑定到摄像机上，这样光源就会随着摄像机移动。

```js
-scene.add(light);
+camera.add(light);
```

生成100个立方体，每个立方体的颜色，位置，朝向，缩放都随机。

```js
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

function rand(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + (max - min) * Math.random();
}

function randomColor() {
  return `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`;
}

const numObjects = 100;
for (let i = 0; i < numObjects; ++i) {
  const material = new THREE.MeshPhongMaterial({
    color: randomColor(),
  });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
  cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
  cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));
}
```

最后，让我们来完成拾取功能。
写一个简单的类来管理拾取操作
```js
class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
    // 恢复上一个被拾取对象的颜色
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    // 发出射线
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // 获取与射线相交的对象
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // 找到第一个对象，它是离鼠标最近的对象
      this.pickedObject = intersectedObjects[0].object;
      // 保存它的颜色
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // 设置它的发光为 黄色/红色闪烁
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }
  }
}
```

可以看到，我们创建了一个 `RayCaster` 实例，调用该实例的 `pick` 方法可以在场景中发出一条射线。如果，射线有撞击到场景中的物体，修改撞击到的第一个物体的颜色。

当然，也可以在用户点击鼠标时，调用这个方法，这恐怕是最常见的应用场景。但是，在本范例中，不管在鼠标下方是什么，在每一帧中都会进行拾取操作,为此，需要跟踪鼠标的位置。
```js
const pickPosition = {x: 0, y: 0};
clearPickPosition();

...

function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width  / rect.width,
    y: (event.clientY - rect.top ) * canvas.height / rect.height,
  };
}

function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
  pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
  pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
}

function clearPickPosition() { 
  // 对于触屏，不像鼠标总是能有一个位置坐标，
  // 如果用户不在触摸屏幕，我们希望停止拾取操作。
  // 因此，我们选取一个特别的值，表明什么都没选中
  pickPosition.x = -100000;
  pickPosition.y = -100000;
}

window.addEventListener('mousemove', setPickPosition);
window.addEventListener('mouseout', clearPickPosition);
window.addEventListener('mouseleave', clearPickPosition);
```

需要注意的是，我们记录了归一化的鼠标位置。无论画布的尺寸，我们需要一个从左到右，落入区间（-1，1）的值，类似的，也需要一个从下到上，落入区间（-1，1）的值。

完成以后，我们再添加对移动端的支持：
```js
window.addEventListener('touchstart', (event) => {
  // 阻止窗口滚动行为
  event.preventDefault();
  setPickPosition(event.touches[0]);
}, {passive: false});

window.addEventListener('touchmove', (event) => {
  setPickPosition(event.touches[0]);
});

window.addEventListener('touchend', clearPickPosition);
```

最终，在 `render` 方法中，我们调用了 `PickHelper` 的 `pick` 方法
```js
+const pickHelper = new PickHelper();

function render(time) {
  time *= 0.001;  //将毫秒单位转换为秒单位;

  ...

+  pickHelper.pick(pickPosition, scene, camera, time);

  renderer.render(scene, camera);

  ...
```

这是最终结果
{{{example url="../threejs-picking-raycaster.html" }}}

这种方式看起来效果不错，而且能处理很多用户场景，但是也存在几个问题：
1. 这是基于CPU运算的
  Javascript遍历每一个对象，检查其包围盒或包围球是否与射线相交，如果相交，它必须遍历组成该对象的每一个三角，检查它们是否与射线相交。   
   好处是，JavaScript能够很容易计算出射线在哪里与三角相交，并为我们提供相关数据。举个例子，如果你想要在相交的位置放置一个标记。  
   缺点是，CPU要做大量的工作,当你的对象由大量的三角组成时，这个过程会有些慢。
2. 它无法处理一些奇怪的着色器或者位移
   如果，你有一个变形或者拟态几何形状的着色器，Javascript无法理解这个变形，它会给出错误的答案。举例：据我所知，你不能对有皮肤的对象使用这种方式。
3. 无法处理透明的孔洞
举个例子，为立方体应用这个纹理
<div class="threejs_center"><img class="checkerboard" src="../resources/images/frame.png"></div>

改动代码如下：
```js
+const loader = new THREE.TextureLoader();
+const texture = loader.load('resources/images/frame.png');

const numObjects = 100;
for (let i = 0; i < numObjects; ++i) {
  const material = new THREE.MeshPhongMaterial({
    color: randomColor(),
    +map: texture,
    +transparent: true,
    +side: THREE.DoubleSide,
    +alphaTest: 0.1,
  });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  ...
```

运行后，你就能看到问题所在。
{{{example url="../threejs-picking-raycaster-transparency.html" }}}

试着透过盒子拾取一些物体，但是你无法做到
<div class="threejs_center"><img src="resources/images/picking-transparent-issue.jpg" style="width: 635px;"></div>

这是因为 JavaScript 无法通过简单的查看纹理和材质，就推测出你的对象是否存在一部分是透明的或者不透明。

对于这些问题的解决方案，就是使用基于GPU的拾取方法。可惜，该方法概念上简单，但是相比于射线追踪法，用起来就复杂了。

为了完成GPU拾取，对每一个对象使用唯一的颜色进行离屏渲染。然后，检查鼠标位置关联的像素的颜色。这个颜色就能告诉我们哪个对象被选中。

这能解决上面的问题2，3。至于问题1的速度问题，这取决于业务场景。每个对象会被绘制两次，一次用于观看，一次用于拾取。也许存在开脑洞的解决方案，可以只绘制一次就完成查看和拾取，此处我们不会尝试。

但是有一件事值得去做，因为拾取时我们只需读取1px，所以我们可以设置摄像机，只绘制1px，通过 `PerspectiveCamera.setViewOffset` 方法，可以告诉THREE.js 计算出一个摄像机 只呈现一个大矩形的一个很小的部分。这应该能节省一些运行时间。

此时，要在THREE.js中实现这种拾取方式，需要创建两个场景。一个使用正常的网格对象填充。另外一个使用“拾取材质”的网格对象填充。

因此，首先创建第二个场景，并将其清理为黑色背景。
```js
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');
const pickingScene = new THREE.Scene();
pickingScene.background = new THREE.Color(0);
```

然后，对于在主场景中的每一个立方体，在 `pickingScene` 中，在同样的位置，创建一个与原立方体相似的，相关联的“可拾取立方体”，用对象的id生成颜色值，去设置对象的材质。


```js
const idToObject = {};
+const numObjects = 100;
for (let i = 0; i < numObjects; ++i) {
+  const id = i + 1;
  const material = new THREE.MeshPhongMaterial({
    color: randomColor(),
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    alphaTest: 0.1,
  });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
+  idToObject[id] = cube;

  cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
  cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
  cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));

+  const pickingMaterial = new THREE.MeshPhongMaterial({
+    emissive: new THREE.Color(id),
+    color: new THREE.Color(0, 0, 0),
+    specular: new THREE.Color(0, 0, 0),
+    map: texture,
+    transparent: true,
+    side: THREE.DoubleSide,
+    alphaTest: 0.5,
+    blending: THREE.NoBlending,
+  });
+  const pickingCube = new THREE.Mesh(geometry, pickingMaterial);
+  pickingScene.add(pickingCube);
+  pickingCube.position.copy(cube.position);
+  pickingCube.rotation.copy(cube.rotation);
+  pickingCube.scale.copy(cube.scale);
}
```

注意到，此时，我们利用 `MeshPhongMaterial` 创建材质，使用id生成颜色，设置到它的`emissive`属性，`color` 和 `specular`属性设置为0，设置 `alphaTest` 属性，只渲染纹理的alpha值大于该属性值的部分，还需要将`blending` 设置为 `NoBlending`，这样alpha通道不会作用到id生成色

注意到，利用 `MeshPhongMaterial` 可能并不是最优的解决方案，因为，在绘制拾取场景时，仍然需要计算所有的光线，尽管我们不需要这些计算。一个更优的方案是使用自定义的着色器，只为纹理alpha值大于 `alphaTest` 属性值的部分，输出id生成色

由于我们是从像素点拾取，而不是射线追踪，只需将代码修改为使用像素拾取方式，获取拾取位置。

```js
function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
-  pickPosition.x = (pos.x / canvas.clientWidth ) *  2 - 1;
-  pickPosition.y = (pos.y / canvas.clientHeight) * -2 + 1;  // 注意，翻转了y轴
+  pickPosition.x = pos.x;
+  pickPosition.y = pos.y;
}
```

首先，我们将 `PickHelper` 修改为 `GPUPickHelper`。这里使用了 `WebGLRenderTarget`，如同我们在 [多个渲染目标](threejs-rendertargets.html)中介绍的一样，此处，我们的渲染目标只有1像素的尺寸，1×1。

```js
-class PickHelper {
+class GPUPickHelper {
  constructor() {
-    this.raycaster = new THREE.Raycaster();
+    // 创建一个1px的渲染目标
+    this.pickingTexture = new THREE.WebGLRenderTarget(1, 1);
+    this.pixelBuffer = new Uint8Array(4);
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(cssPosition, scene, camera, time) {
+    const {pickingTexture, pixelBuffer} = this;

    // 如果已经存在拾取的对象，将其颜色恢复
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

+    // 设置视野偏移来表现鼠标下的1px
+    const pixelRatio = renderer.getPixelRatio();
+    camera.setViewOffset(
+        renderer.getContext().drawingBufferWidth,   // 全宽
+        renderer.getContext().drawingBufferHeight,  // 全高
+        cssPosition.x * pixelRatio | 0,             // rect x
+        cssPosition.y * pixelRatio | 0,             // rect y
+        1,                                          // rect width
+        1,                                          // rect height
+    );
+    // 渲染场景
+    renderer.setRenderTarget(pickingTexture)
+    renderer.render(scene, camera);
+    renderer.setRenderTarget(null);
+
+    // 清理视野偏移，回归正常
+    camera.clearViewOffset();
+    // 读取像素
+    renderer.readRenderTargetPixels(
+        pickingTexture,
+        0,   // x
+        0,   // y
+        1,   // width
+        1,   // height
+        pixelBuffer);
+
+    const id =
+        (pixelBuffer[0] << 16) |
+        (pixelBuffer[1] <<  8) |
+        (pixelBuffer[2]      );

-    // 射线穿越视锥体
-    this.raycaster.setFromCamera(normalizedPosition, camera);
-    // 获取与射线相交的对象
-    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
-    if (intersectedObjects.length) {
-      // 获取第一个对象，他是离鼠标最近的一个
-      this.pickedObject = intersectedObjects[0].object;

+    const intersectedObject = idToObject[id];
+    if (intersectedObject) {
+      //获取第一个对象，他是离鼠标最近的一个
+      this.pickedObject = intersectedObject;
      // 保存颜色
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // 设置对象在黄/红两色间闪烁
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }
  }
}
```

接下来，我们就可以使用它了
```js
-const pickHelper = new PickHelper();
+const pickHelper = new GPUPickHelper();
```

这里是将 `pickScene` 传给helper,而不是`scene`。

```js
-  pickHelper.pick(pickPosition, scene, camera, time);
+  pickHelper.pick(pickPosition, pickScene, camera, time);
```

现在，你应该可以透过透明的部分进行拾取操作了

{{{example url="../threejs-picking-gpu.html" }}}

至此，对于如何实现拾取，希望此文能给你一些灵感。在后续的文章中，也许，我们可以看看如何使用鼠标操作对象。