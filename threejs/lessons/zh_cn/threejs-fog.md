Title: Three.js 雾
Description: Three.js中的雾
TOC: 雾

本文是three.js系列文章的一部分。第一篇文章是[three.js 基础](threejs-fundamentals.html)。如果你是个新手，还没读过，请从那里开始。如果你还没读过有关摄像机的章节，请从[这篇文章](threejs-cameras.html)开始。

在3D引擎里，雾通常是基于离摄像机的距离褪色至某种特定颜色的方式。在three.js中添加雾是通过创建 `Fog` 或者 `FogExp2` 实例并设定scene的[`fog`](Scene.fog) 属性。

`Fog` 让你设定 `near` 和 `far` 属性，代表距离摄像机的距离。任何物体比 `near` 近不会受到影响，任何物体比 `far` 远则完全是雾的颜色。在 `near` 和 `far` 中间的物体，会从它们自身材料的颜色褪色到雾的颜色。

`FogExp2` 会根据离摄像机的距离呈指数增长。

选择其中一个类型，创建雾并设定到场景中如下：

```js
const scene = new THREE.Scene();
{
  const color = 0xFFFFFF;  // white
  const near = 10;
  const far = 100;
  scene.fog = new THREE.Fog(color, near, far);
}
```

或者对于 `FogExp2` 会是：

```js
const scene = new THREE.Scene();
{
  const color = 0xFFFFFF;
  const density = 0.1;
  scene.fog = new THREE.FogExp2(color, density);
}
```

`FogExp2` 比较接近现实效果，但是 `Fog` 使用的更加普遍，因为它支持设定影响区域，所以你可以设定一定距离内显示清晰的场景，过了这段距离再褪色到某种颜色。

<div class="spread">
  <div>
    <div data-diagram="fog" style="height: 300px;"></div>
    <div class="code">THREE.Fog</div>
  </div>
  <div>
    <div data-diagram="fogExp2" style="height: 300px;"></div>
    <div class="code">THREE.FogExp2</div>
  </div>
</div>

需要注意的是雾是作用在 *渲染的物体* 上的，是物体颜色中每个像素计算的一部分。这意味着如果你想让你的场景褪色到某种颜色，你需要设定雾 **和** 场景的背景颜色为同一种颜色。背景颜色通过[`scene.background`](Scene.background)属性设置。你可以通过 `THREE.Color` 选择背景颜色设置。例如：

```js
scene.background = new THREE.Color('#F00');  // red
```

<div class="spread">
  <div>
    <div data-diagram="fogBlueBackgroundRed" style="height: 300px;" class="border"></div>
    <div class="code">fog blue, background red</div>
  </div>
  <div>
    <div data-diagram="fogBlueBackgroundBlue" style="height: 300px;" class="border"></div>
    <div class="code">fog blue, background blue</div>
  </div>
</div>

这是我们之前添加雾的例子。唯一的改动是在添加雾之后，我们设置了场景的背景颜色。

```js
const scene = new THREE.Scene();

+{
+  const near = 1;
+  const far = 2;
+  const color = 'lightblue';
+  scene.fog = new THREE.Fog(color, near, far);
+  scene.background = new THREE.Color(color);
+}
```

在下面的例子，摄像机的 `near` 是0.1， `far` 是5，位于 `z = 2`的位置。方块为单位大小，位于Z=0的位置。这意味着将雾设置为 `near = 1` 和 `far = 2` ，方块会在它的中间位置淡出。

{{{example url="../threejs-fog.html" }}}

让我们添加界面来调整雾。我们将再次使用[dat.GUI](https://github.com/dataarts/dat.gui)。dat.GUI接收对象和属性参数，并自动为其创建界面。我们能够简单地操纵雾的 `near` 和 `far` 属性，但是 `near` 数值大于 `far` 是无效的，所以我们创建助手（helper）来确保 `near` 和 `far` 属性，让 `near` 小于或等于  `far` ， `far` 大于或等于 `near`。

```js
// We use this class to pass to dat.gui
// so when it manipulates near or far
// near is never > far and far is never < near
class FogGUIHelper {
  constructor(fog) {
    this.fog = fog;
  }
  get near() {
    return this.fog.near;
  }
  set near(v) {
    this.fog.near = v;
    this.fog.far = Math.max(this.fog.far, v);
  }
  get far() {
    return this.fog.far;
  }
  set far(v) {
    this.fog.far = v;
    this.fog.near = Math.min(this.fog.near, v);
  }
}
```

之后我们可以像这样添加

```js
{
  const near = 1;
  const far = 2;
  const color = 'lightblue';
  scene.fog = new THREE.Fog(color, near, far);
  scene.background = new THREE.Color(color);
+
+  const fogGUIHelper = new FogGUIHelper(scene.fog);
+  gui.add(fogGUIHelper, 'near', near, far).listen();
+  gui.add(fogGUIHelper, 'far', near, far).listen();
}
```

当我们设置摄像机的时候，设置（助手的 `near` 和 `far` 以调节雾的最小值和最大值。

最后两行调用 `.listen()` 告诉dat.GUI *监听* 变化。当我们编辑 `far` 改变了 `near` 或者编辑 `near` 改变了 `far` ，dat.GUI将会为我们更新其他属性的UI。

或许能够改变雾的颜色是个不错的主意，但是如上面提到的，我们需要保持雾的颜色和背景颜色一致。所以，让我们在助手上添加另一个 *虚拟* 属性，当dat.GUI改变它时会设置这两个颜色。

dat.GUI能够通过4种方式设置颜色。分别是6位hex字符串 (如: `#112233`)，色相、饱和度、明度的对象 (如: `{h: 60, s: 1, v: }`)，RGB数组 (如: `[255, 128, 64]`)，或者RGBA数组 (如: `[127, 200, 75, 0.3]`)。

对于我们的目的而言，最简单的是用hex字符串的方式，因为dat.GUI只修改单个数值。幸运的是通过 `THREE.Color` 的 [`getHexString`](Color.getHexString) 方法我们能轻松地获得这个字符串，只需要在其前面添加 '#' 。

```js
// We use this class to pass to dat.gui
// so when it manipulates near or far
// near is never > far and far is never < near
+// Also when dat.gui manipulates color we'll
+// update both the fog and background colors.
class FogGUIHelper {
*  constructor(fog, backgroundColor) {
    this.fog = fog;
+    this.backgroundColor = backgroundColor;
  }
  get near() {
    return this.fog.near;
  }
  set near(v) {
    this.fog.near = v;
    this.fog.far = Math.max(this.fog.far, v);
  }
  get far() {
    return this.fog.far;
  }
  set far(v) {
    this.fog.far = v;
    this.fog.near = Math.min(this.fog.near, v);
  }
+  get color() {
+    return `#${this.fog.color.getHexString()}`;
+  }
+  set color(hexString) {
+    this.fog.color.set(hexString);
+    this.backgroundColor.set(hexString);
+  }
}
```

然后我们调用 `gui.addColor` 来为我们的助手虚拟属性添加颜色界面。

```js
{
  const near = 1;
  const far = 2;
  const color = 'lightblue';
  scene.fog = new THREE.Fog(color, near, far);
  scene.background = new THREE.Color(color);

*  const fogGUIHelper = new FogGUIHelper(scene.fog, scene.background);
  gui.add(fogGUIHelper, 'near', near, far).listen();
  gui.add(fogGUIHelper, 'far', near, far).listen();
+  gui.addColor(fogGUIHelper, 'color');
}
```

{{{example url="../threejs-fog-gui.html" }}}

你可以观察到，设置 `near` 如1.9， `far` 为2.0能在未雾化和完全雾化之间获得锐利的变化效果，而设置 `near` = 1.1， `far` = 2.9 会让我们旋转的方块在距离摄像机2个单位距离的位置获得最平滑的变化效果。

最后， [`fog`](Material.fog) 在材料上有个布尔属性，用来设置渲染物体的材料是否会受到雾的影响。对于大多数材料而言默认设置为 `true` ，作为你可能想关掉雾生效的例子，设想下你正在制作一个3D车辆模拟器并处于驾驶员座位或座舱的视角，你很可能为了看清车内的物体将它们的是否受雾影响属性关闭。

一个更好的例子会是一个外面弥漫浓雾的房子。让我们假设将雾设置在2米外 (near = 2) 并且在4米的地方完全进入雾中 (far = 4)。房间大于2米并且很可能大于4米，那么你需要将房子内的材质设置为不受雾的影响，否则当站在房子内尽头往墙壁外看会觉得房子是在雾里。

<div class="spread">
  <div>
    <div data-diagram="fogHouseAll" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, all</div>
  </div>
</div>

注意房间尽头的墙壁和天花板正受到雾的影响，当我们把房子材料上的是否受雾影响属性关闭可以解决这个问题。

<div class="spread">
  <div>
    <div data-diagram="fogHouseInsideNoFog" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, only outside materials</div>
  </div>
</div>

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-fog.js"></script>
