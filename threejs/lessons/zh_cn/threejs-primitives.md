Title: Three.js 图元
Description: 关于 Three.js 图元
TOC: 图元

这篇文章是关于 Three.js 系列文章中的一篇。第一篇是 [基础](threejs-fundamentals.html)。
如果你还没有阅读，建议从那里开始。

Three.js 有很多图元。图元就是一些 3D 的形状，在运行时根据大量参数生成。

使用图元是种很常见的做法，像使用球体作为地球，或者使用大量盒子来绘制 3D 图形。
尤其是用来试验或者刚开始学习 3D。
对大多数 3D 应用来说，更常见的做法是让美术在 3D 建模软件中创建 3D 模型，
像 [Blender](https://blender.org)，[Maya](https://www.autodesk.com/products/maya/)
或者 [Cinema 4D](https://www.maxon.net/en-us/products/cinema-4d/)。
之后在这个系列中，我们会涵盖到创建和加载来自 3D 建模软件的模型。
现在，让我们仅使用可以获得的图元。

下面的很多图元都有默认的部分或者全部参数，所以可以根据你的需要选择使用。


<div id="Diagram-BoxGeometry" data-primitive="BoxGeometry">盒子</div>
<div id="Diagram-CircleGeometry" data-primitive="CircleGeometry">平面圆</div>
<div id="Diagram-ConeGeometry" data-primitive="ConeGeometry">锥形</div>
<div id="Diagram-CylinderGeometry" data-primitive="CylinderGeometry">圆柱</div>
<div id="Diagram-DodecahedronGeometry" data-primitive="DodecahedronGeometry">十二面体</div>
<div id="Diagram-ExtrudeGeometry" data-primitive="ExtrudeGeometry">受挤压的 2D 形状，及可选的斜切。
这里我们挤压了一个心型。注意，这分别是 <code>TextGeometry</code> 和 <code>TextGeometry</code> 的基础。<div>
<div id="Diagram-IcosahedronGeometry" data-primitive="IcosahedronGeometry">二十面体</div>
<div id="Diagram-LatheGeometry" data-primitive="LatheGeometry">绕着一条线旋转形成的形状。例如：灯泡、保龄球瓶、蜡烛、蜡烛台、酒瓶、玻璃杯等。你提供一系列点作为 2D 轮廓，并告诉 Three.js 沿着某条轴旋转时需要将侧面分成多少块。</div>
<div id="Diagram-OctahedronGeometry" data-primitive="OctahedronGeometry">八面体</div>
<div id="Diagram-ParametricGeometry" data-primitive="ParametricGeometry">通过提供一个函数（将网格中 2D 的点转成对应的 3D 点）生成的表面。</div>
<div id="Diagram-PlaneGeometry" data-primitive="PlaneGeometry">2D 平面</div>
<div id="Diagram-PolyhedronGeometry" data-primitive="PolyhedronGeometry">将一些环绕着中心点的三角形投影到球体上</div>
<div id="Diagram-RingGeometry" data-primitive="RingGeometry">中间有洞的 2D 圆盘</div>
<div id="Diagram-ShapeGeometry" data-primitive="ShapeGeometry">2D 的三角轮廓</div>
<div id="Diagram-SphereGeometry" data-primitive="SphereGeometry">球体</div>
<div id="Diagram-TetrahedronGeometry" data-primitive="TetrahedronGeometry">四面体</div>
<div id="Diagram-TextGeometry" data-primitive="TextGeometry">根据 3D 字体和字符串生成的 3D 文字</div>
<div id="Diagram-TorusGeometry" data-primitive="TorusGeometry">圆环体（甜甜圈）</div>
<div id="Diagram-TorusKnotGeometry" data-primitive="TorusKnotGeometry">环形节</div>
<div id="Diagram-TubeGeometry" data-primitive="TubeGeometry">圆环沿着路径</div>
<div id="Diagram-EdgesGeometry" data-primitive="EdgesGeometry">一个工具对象，将一个几何体作为输入，生成面夹角大于某个阈值的那条边。例如，你从顶上看一个盒子，你会看到有一条线穿过这个面，因为每个组成这个盒子的三角形都显示出来了。而如果使用 <code>EdgesGeometry</code> 中间的线就会被移除。调整下面的 thresholdAngle，你就会看到夹角小于这个值的边消失了。</div>
<div id="Diagram-WireframeGeometry" data-primitive="WireframeGeometry">对于给定的几何体，生成每个边包含一个线段（2 个点）的几何体。如果不这样，通常缺边或者多边，因为 WebGL 中每条边通常需要 2 个点。例如，如果你只有一个三角形，就只有 3 个点 。如果你用 <code>wireframe: true</code> 的材质来绘制它，你只能得到一条线。将这个三角形几何体传给 <code>WireframeGeometry</code> 就能生成一个新的几何体，这个几何体用 6 个点组成 3 条线段。</div>

你可能发现上面的大部分中，`Geometry` 和 `BufferGeometry` 是成对出现的。
这两种类型的区别是高效灵活 vs 性能。

基于 `BufferGeometry` 的图元是面向性能的类型。
几何体的顶点是直接生成为一个高效的类型数组形式，可以被上传到 GPU 进行渲染。
这意味着它们能更快的启动，占用更少的内存。但如果想修改数据，就需要复杂的编程。

基于 `Geometry` 的图元更灵活、更易修改。
它们根据 JavaScript 的类而来，像 `Vector3` 是 3D 的点，`Face3` 是三角形。
它们需要更多的内存，在能够被渲染前，Three.js 会将它们转换成相应的 `BufferGeometry` 表现形式。

如果你知道你不会操作图元，或者你擅长使用数学来操作它们，那么最好使用基于 `BufferGeometry` 的图元。
但如果你想在渲染前修改一些东西，那么 `Geometry` 的图元会更好操作。

举个简单的例子，`BufferGeometry` 不能轻松的添加新的顶点。
使用顶点的数量在创建时就定好了，相应的创建存储，填充顶点数据。
但用 `Geometry` 你就能随时添加顶点。

我们会在 [另一篇文章](threejs-custom-buffergeometry.html) 中来讲创建自定义几何体。
现在，我们来为创建每一个图元作为例子。
我们从 [上一篇文章的例子](threejs-responsive.html) 开始。

在接近顶部的地方，先设置背景颜色:

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color(0xAAAAAA);
```

这告诉 Three.js 清除并设置成略浅的灰色。

需要改变摄像机的位置，这样我们能看到所有物体。

```js
-const fov = 75;
+const fov = 40;
const aspect = 2;  // canvas 默认
const near = 0.1;
-const far = 5;
+const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 2;
+camera.position.z = 120;
```

添加一个函数，`addObject`，传入位置 x、y 和一个 `Object3D`，将物体添加到场景中:

```js
const objects = [];
const spread = 15;

function addObject(x, y, obj) {
  obj.position.x = x * spread;
  obj.position.y = y * spread;

  scene.add(obj);
  objects.push(obj);
}
```

同时，也创建一个函数，用于生成随机颜色的材质。
我们会使用 `Color` 的一个特性，让你可以基于色调、饱和度、亮度来设置颜色。

在色轮上，`hue` 值从 0 到 1，红色在 0 的位置，绿色在 .33 的位置，蓝色在 .66 的位置。
`saturation` 值从 0 到 1，0 表示没有颜色，1 表示饱和度最高。
`luminance` 值从 0 到 1，0 表示黑色，1 表示白色，0.5 表示最大数量的颜色。
换句说话，`luminance` 从 0 到 0.5 表示颜色从黑到 `hue`，从 0.5 到 1.0 表示颜色从 `hue` 到白。

```js
function createMaterial() {
  const material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
  });

  const hue = Math.random();
  const saturation = 1;
  const luminance = .5;
  material.color.setHSL(hue, saturation, luminance);

  return material;
}
```

同时，我们将 `side: THREE.DoubleSide` 传给材质。这告诉 Three.js 绘制组成形状的三角形的两个面。
对于实心的形状，像球体或立方体，通常不需要绘制三角形的背面，因为它们全部朝向内部。
对于我们的情况，我们会绘制一些像 `PlaneGeometry` 和 `ShapeGeometry` 这样的二维图形，没有内部,
如果不设置 `side: THREE.DoubleSide`，当从反面看时它们会消失。

需要注意的是，如果 **不** 设置 `side: THREE.DoubleSide` 绘制会更快，所以最好只在需要的时候设置它。
但现在我们不会绘制很多图形，所以没有必要太担心。

接着，创建一个函数，`addSolidGeometry`，我们传入一个几何体，
它通过 `createMaterial` 创建一个随机颜色的材质，通过 `addObject` 添加到场景中。

```js
function addSolidGeometry(x, y, geometry) {
  const mesh = new THREE.Mesh(geometry, createMaterial());
  addObject(x, y, mesh);
}
```

现在，我们可以对我们创建的大多数图元使用它。
比如创建一个盒子：

```js
{
  const width = 8;
  const height = 8;
  const depth = 8;
  addSolidGeometry(-2, -2, new THREE.BoxGeometry(width, height, depth));
}
```

如果你查看下面的代码，你会看到每个类型的几何体有相似的部分。

这是结果：

{{{example url="../threejs-primitives.html" }}}

上面的模式有一些值得注意的例外。最大的可能就是 `TextGeometry`。在为文字生成网格前需要先加载 3D 字体数据。
数据的加载是异步的，所以在尝试创建几何体前需要等待。通过将字体加载 Promise 化，我们可以让这个过程更简单。
我们创建一个 `FontLoader`，然后 `loadFont` 函数返回一个 `promise`，`promise` 的 `resolve` 会给我们字体。
接着我们创建一个 `async` 函数 `doit`，使用 `await` 加载字体。最后创建几何体，调用 `addOjbect` 将它添加到场景中。

```js
{
  const loader = new THREE.FontLoader();
  // 将字体加载过程 promise 化
  function loadFont(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  async function doit() {
    const font = await loadFont('resources/threejs/fonts/helvetiker_regular.typeface.json');  /* threejsfundamentals: url */
    const geometry = new THREE.TextGeometry('three.js', {
      font: font,
      size: 3.0,
      height: .2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: .3,
      bevelSegments: 5,
    });
    const mesh = new THREE.Mesh(geometry, createMaterial());
    geometry.computeBoundingBox();
    geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

    const parent = new THREE.Object3D();
    parent.add(mesh);

    addObject(-1, -1, parent);
  }
  doit();
}
```

还有一个其它的区别。我们想让文字绕着它的中心旋转，但默认的，Three.js 创建的文字的旋转中心在左边。
变通的方法是要求 Three.js 计算几何体的边界框。然后我们可以对边界框调用 `getCenter`，将网格位置对象传给它。
`getCenter` 将盒子的中心值复制进位置对象。
同时它也返回位置对象，这样我们就可以调用 `multiplyScalar(-1)` 来放置整个对象，这样对象的旋转中心就是对象的中心了。

如果我们像之前的例子一样接着调用 `addSolidGeometry`，它又会设置位置，这是不对的。
在我们的例子中，我们创建了一个 `Object3D` 是 Three.js 场景图中的标准节点。
`Mesh` 也是继承自 `Object3D` 的。我们会在 [另一篇文章中涉及场景图是如何工作的](threejs-scenegraph.html)。
现在知道它们像 DOM 的节点就行了，子节点是相对与父节点绘制的。
创建一个 `Object3D`，并将网格设置成它的子节点，我们就能将 `Object3D` 放置在任何位置，并保持我们之前设置的中心。

如果不这么做，文字会偏离中心。

{{{example url="../threejs-primitives-text.html" }}}

注意，左边的没有绕着中心旋转，而右边的绕着中心旋转。

其它的异常情况是，有 2 个线的例子，`EdgesGeometry` 和 `WireframeGeometry`。
它们调用 `addLineGeometry` 而不是 `addSolidGeometry`，看起来像这样:

```js
function addLineGeometry(x, y, geometry) {
  const material = new THREE.LineBasicMaterial({color: 0x000000});
  const mesh = new THREE.LineSegments(geometry, material);
  addObject(x, y, mesh);
}
```

上面代码创建了一个黑色的 `LineBasicMaterial`，然后创建了一个 `LineSegments` 对象，它封装了 `Mesh`，
好让 Three.js 知道你在渲染一个线段（每个段 2 个点）。

每个图元都有多个参数可以在创建时传入，最好 [看文档](https://threejs.org/docs) 而不是在这里重复它们。
你也可以点击上面每个形状边上的链接，查看对应的文档。

有一对类并不和上面的模式匹配。它们是 `PointsMaterial` 和 `Points`。
`Points` 和 `LineSegments` 类似，它需要一个 `Geometry` 或者 `BufferGeometry`，但每个顶点都绘制一次，而不是每条线。
要使用，你需要传入 `PointsMaterial`，它需要一个代表点多大的 [`size`](PointsMaterial.size)。

```js
const radius = 7;
const widthSegments = 12;
const heightSegments = 8;
const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
const material = new THREE.PointsMaterial({
    color: 'red',
    size: 0.2,     // in world units
});
const points = new THREE.Points(geometry, material);
scene.add(points);
```

<div class="spread">
<div data-diagram="Points"></div>
</div>

如果你想让点无视和摄像机的距离，始终保持相同大小，可以通过将 [`sizeAttenuation`](PointsMaterial.sizeAttenuation) 设置成 `false` 将其关闭。

```js
const material = new THREE.PointsMaterial({
    color: 'red',
+    sizeAttenuation: false,
+    size: 3,       // in pixels
-    size: 0.2,     // in world units
});
...
```

<div class="spread">
<div data-diagram="PointsUniformSize"></div>
</div>

还有一个重要的东西，就是所有形状都有多个设置来设置它们的细化程度。
一个很好的例子就是球形几何体。它可以这些参数：一圈组成的片数、从上到下的数量等。例如：

<div class="spread">
<div data-diagram="SphereGeometryLow"></div>
<div data-diagram="SphereGeometryMedium"></div>
<div data-diagram="SphereGeometryHigh"></div>
</div>

第一个球体一圈有 5 分片，高度为 3，一共 15 片，或者 30 个三角形。
第二个球体一圈有 24 分片，高度为 10，一共 240 片，或者 480 个三角形。
第三个球体一圈有 50 分片，高度为 50，一共 2500 片，或者 5000 个三角形。

由你决定需要细分成多少。看起来你可能需要较多数量的分片，但去除线，设置平面着色，我们就得到了：

<div class="spread">
<div data-diagram="SphereGeometryLowSmooth"></div>
<div data-diagram="SphereGeometryMediumSmooth"></div>
<div data-diagram="SphereGeometryHighSmooth"></div>
</div>

现在并不明显是否右边有 5000 个三角形的比中间只有 480 个三角形的好更多。
如果你只是绘制少量球体，比如一个地球地图的球体，那么单个 10000 个三角形的球体就是个不错的选择。
但如果你要画 1000 个球体，那么 1000 个球体 x 10000 个三角形就是一千万个三角形。
想要动画流畅，你需要浏览器每秒绘制 60 帧，那么上面的场景就需要每秒绘制 6 亿个三角形。那是巨大的运算量。

有时候很容易选择。例如你可以选择将平面细分。

<div class="spread">
<div data-diagram="PlaneGeometryLow"></div>
<div data-diagram="PlaneGeometryHigh"></div>
</div>

左边的平面有 2 个三角形，右边的平面有 200 个三角形。不像球体，在多数平面的应用场景中，并没有什么折中的方法。
你可能只在你想要修改或者在某些方面封装一下的时候才将平面细分。对于盒子也是一样。

所以，选择适合你情况的方案。细分的越少，运行的越流畅，使用的内存也会更少。
你需要根据你的具体情况选择合适的方案。

如果上面的形状不符合你的使用需求，你可以从 [.obj 文件](threejs-load-obj.html) 或 [.gltf 文件](threejs-load-gltf.html) 加载几何体。
你也可以创建 [自定义 Geometry](threejs-custom-buffergeometry.html)。

接下来是 [Three.js 的场景图是如何工作的及如何使用它](threejs-scenegraph.html)。

<link rel="stylesheet" href="resources/threejs-primitives.css">
<script type="module" src="resources/threejs-primitives.js"></script>

