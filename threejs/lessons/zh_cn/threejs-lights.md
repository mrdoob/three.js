Title: Three.js 光照
Description: 设置光照
TOC: 光照

本文是关于 three.js 系列文章的一部分。第一篇文章是 [three.js 基础](threejs-fundamentals.html)。如果你还没看过而且对three.js 还不熟悉，那应该从那里开始，并且了解如何[设置开发环境](threejs-setup.html)。上一篇文章介绍了 three.js 中的 [纹理](threejs-textures.html)。

接下来我们学习如何在 three.js 中使用各种不同类型的光照。

在一个基本场景的基础上，我们调整一下相机的设置。将 fov 设置为 45， far 设置为 100，然后移动相机位置到 (0, 10, 20)。

```js
*const fov = 45;
const aspect = 2;  // canvas 的默认宽高 300:150
const near = 0.1;
*const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
+camera.position.set(0, 10, 20);
```

然后我们添加一个 `OrbitControls`。`OrbitControls` 让我们可以围绕某一个点旋转控制相机。`OrbitControls` 是 three.js 的可选模块，所以我们首先需要引入这个模块。

```js
import * as THREE from './resources/three/r122/build/three.module.js';
+import {OrbitControls} from './resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
```

然后我们就可以使用了。创建 `OrbitControls` 时传入两个参数，一个是要控制的相机对象，第二个是检测事件的 DOM 元素。

```js
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();
```

我们还将 `OrbitControls` 的观察点设置为 (0, 5, 0) 的位置，设置完需要调用一下 `controls.update`，这样才真正更新观察点位置。

下面我们创建一些东西来打光。首先，创建一个地平面，并用下方展示的 2x2 像素的黑白格图片来作为纹理。

<div class="threejs_center">
  <img src="../resources/images/checker.png" class="border" style="
    image-rendering: pixelated;
    width: 128px;
  ">
</div>

首先加载这个纹理，设置重复模式（[`wrapS`](Texture.wrapS), [`wrapT`](Texture.wrapT)），采样模式（[`magFilter`](Texture.magFilter)）以及重复的次数。因为贴图是 2x2 大小，通过设置成平铺模式，并且重复次数是边长的一半，就可以让每个格子正好是1个单位的大小。

```js
const planeSize = 40;

const loader = new THREE.TextureLoader();
const texture = loader.load('resources/images/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);
```

接着我们创建一个平面几何体，一个材质，再用这两个作为参数，创建一个 `Mesh` 对象并且添加到场景中。因为创建的平面默认是在 XY 平面上（竖直平面），我们希望得到一个 XZ 平面（水平平面），所以我们将他旋转 90°。

```js
const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -.5;
scene.add(mesh);
```

接着再添加一个立方体和一个球体，这样我们就有三个物体可以打光。

```js
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

一切准备就绪，我们开始添加光源。

## 环境光（`AmbientLight`）

首先创建一个 `AmbientLight`

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);
```

我们添加一些控制代码，使我们可以动态地改变光照的参数，还是使用 [dat.GUI](https://github.com/dataarts/dat.gui) 来实现。为了可以通过 `dat.GUI` 调节颜色，我们创建一个辅助对象。对象内有一个 `getter` 和 `setter`，当 `dat.GUI` 从对象内获取 `value` 值的时候，触发了 `getter`，会根据创建对象实例时传入的 `object` 和 `prop`，返回一个十六进制色值的字符串，当通过 `dat.GUI` 控制改变这个 `value` 的时候，就触发了 `setter`，会用十六进制的色值字符串作为参数调用 `object.prop.set`。

以下是 helper 类的代码：

```js
class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}
```

以及创建 dat.GUI 的代码：

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
```

结果如下所示：

{{{example url="../threejs-lights-ambient.html" }}}

可以在场景内点击和拖拽鼠标来改变相机的位置，观察场景。

可以看到场景内的物体看起来没有立体感。环境光 （`AmbientLight`）只是简单地将材质的颜色与光照颜色进行叠加（PhotoShop 里的正片叠底模式），再乘以光照强度。

    // 这里的颜色计算是 RBG 通道上的值分别对应相乘
    // 例: rgb(0.64,0.64,0.64) = rgb(0.8,0.8,0.8) * rgb(0.8,0.8,0.8) * 1
    color = materialColor * light.color * light.intensity;

这就是环境光，它没有方向，无法产生阴影，场景内任何一点受到的光照强度都是相同的，除了改变场景内所有物体的颜色以外，不会使物体产生明暗的变化，看起来并不像真正意义上的光照。通常的作用是提亮场景，让暗部不要太暗。

## 半球光（`HemisphereLight`）

接下来介绍半球光（`HemisphereLight`）。半球光（`HemisphereLight`）的颜色是从天空到地面两个颜色之间的渐变，与物体材质的颜色作叠加后得到最终的颜色效果。一个点受到的光照颜色是由所在平面的朝向（法向量）决定的 —— 面向正上方就受到天空的光照颜色，面向正下方就受到地面的光照颜色，其他角度则是两个颜色渐变区间的颜色。

下面是修改后的代码：

```js
-const color = 0xFFFFFF;
+const skyColor = 0xB1E1FF;  // light blue
+const groundColor = 0xB97A20;  // brownish orange
const intensity = 1;
-const light = new THREE.AmbientLight(color, intensity);
+const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);
```

同时修改一下 `dat.GUI` 部分，使得可以控制两种颜色：

```js
const gui = new GUI();
-gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
+gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
+gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
gui.add(light, 'intensity', 0, 2, 0.01);
```

结果如下：

{{{example url="../threejs-lights-hemisphere.html" }}}

场景基本上也没有太大的立体感。半球光 （`HemisphereLight`） 与其他类型光照结合使用，可以很好地表现天空和地面颜色照射到物体上时的效果。所以最好的使用场景就是与其他光照结合使用，或者作为环境光（`AmbientLight`）的一种替代方案。

## 方向光（`DirectionalLight`）

下面介绍方向光（`DirectionalLight`）。
方向光（`DirectionalLight`）常常用来表现太阳光照的效果。

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 10, 0);
light.target.position.set(-5, 0, 0);
scene.add(light);
scene.add(light.target);
```

注意，不仅 `light` ，我们还把 [`light.target`](DirectionalLight.target) 也添加到了场景中。方向光（`DirectionalLight`）的方向是从它的位置照向目标点的位置。

下面代码是将目标点坐标属性添加到 `dat.GUI`，使得我们可以控制目标位置

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
gui.add(light.target.position, 'x', -10, 10);
gui.add(light.target.position, 'z', -10, 10);
gui.add(light.target.position, 'y', 0, 10);
```

{{{example url="../threejs-lights-directional.html" }}}

目前有点难以观察。Three.js 提供了一些辅助对象，添加到场景中之后就可以显示出场景中的不可见对象（例如光照、相机等）。在这里我们使用 `DirectionalLightHelper`，它会绘制一个方形的小平面代表方向光的位置，一条连接光源与目标点的直线，代表了光的方向。创建对象时，传入光源对象作为参数，然后添加到场景中，就可以呈现。

```js
const helper = new THREE.DirectionalLightHelper(light);
scene.add(helper);
```

我们顺便实现一下对光源位置和目标点位置的控制逻辑。我们创建一个辅助函数，使得可以通过 `dat.GUI` 改变传入的 `Vector3` 类型对象的 `x`，`y`，和 `z` 的值。

```js
function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
  folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
  folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  folder.open();
}
```

注意，当辅助对象所表示的不可见对象有所改变的时候，我们必须调用辅助对象的 `update` 方法来更新辅助对象本身的状态。因此我们传入一个 `onChangeFn` 函数，每当 `dat.GUI` 改变了某个值的时候，就会被调用。

应用到光照位置与目标点位置的控制，就如下所示：

```js
+function updateLight() {
+  light.target.updateMatrixWorld();
+  helper.update();
+}
+updateLight();

const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);

+makeXYZGUI(gui, light.position, 'position', updateLight);
+makeXYZGUI(gui, light.target.position, 'target', updateLight);
```

现在我们可以控制光源以及目标点位置了。

{{{example url="../threejs-lights-directional-w-helper.html" }}}

旋转相机可以看得更清楚。方形的小平面代表了一个方向光（`DirectionalLight`），方向光表示的是来自一个方向上的光，并不是从某个点发射出来的，而是从一个无限大的平面内，发射出全部相互平行的光线。

## 点光源（`PointLight`）

点光源（`PointLight`）表示的是从一个点朝各个方向发射出光线的一种光照效果。我们修改一下代码：

```js
const color = 0xFFFFFF;
const intensity = 1;
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.PointLight(color, intensity);
light.position.set(0, 10, 0);
-light.target.position.set(-5, 0, 0);
scene.add(light);
-scene.add(light.target);
```

同时添加一个 `PointLightHelper`

```js
-const helper = new THREE.DirectionalLightHelper(light);
+const helper = new THREE.PointLightHelper(light);
scene.add(helper);
```

因为点光源没有 `target` 属性，所以 `onChange` 函数可以简化。

```js
function updateLight() {
-  light.target.updateMatrixWorld();
  helper.update();
}
-updateLight();
```

`PointLightHelper` 不是一个点，而是在光源的位置绘制了一个小小的线框宝石体来代表点光源。也可以使用其他形状来表示点光源，只要给点光源添加一个自定义的 `Mesh` 子节点即可。

点光源（`PointLight`）有额外的一个范围（[`distance`](PointLight.distance)）属性。
如果 `distance` 设为 0，则光线可以照射到无限远处。如果大于 0，则只可以照射到指定的范围，光照强度在这个过程中逐渐衰减，在光源位置时，`intensity` 是设定的大小，在距离光源 `distance` 位置的时候，`intensity` 为 0。

下面是添加对 distance 参数控制的代码：

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
+gui.add(light, 'distance', 0, 40).onChange(updateLight);

makeXYZGUI(gui, light.position, 'position', updateLight);
-makeXYZGUI(gui, light.target.position, 'target', updateLight);
```

效果如下：

{{{example url="../threejs-lights-point.html" }}}

注意 `distance` > 0 时光照强度的衰减现象。

## 聚光灯（`SpotLight`）

聚光灯可以看成是一个点光源被一个圆锥体限制住了光照的范围。实际上有两个圆锥，内圆锥和外圆锥。光照强度在两个锥体之间从设定的强度递减到 0（具体可以看下方 [`penumbra`](SpotLight.penumbra) 参数）。

聚光灯（`SpotLight`）类似方向光（`DirectionalLight`）一样需要一个目标点，光源的位置是圆锥的顶点，目标点处于圆锥的中轴线上。

修改上面 `DirectionalLight` 的代码如下：

```js
const color = 0xFFFFFF;
const intensity = 1;
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.SpotLight(color, intensity);
scene.add(light);
scene.add(light.target);

-const helper = new THREE.DirectionalLightHelper(light);
+const helper = new THREE.SpotLightHelper(light);
scene.add(helper);
```

聚光灯的圆锥顶部角度大小通过 [`angle`](SpotLight.angle) 属性设置，以弧度作单位。所以我们用介绍 [纹理](threejs-textures.html) 时用到的 `DegRadHelper` 来控制。

```js
gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
```

内圆锥是通过设置 [`penumbra`](SpotLight.penumbra) 属性来定义的，属性值代表了内圆锥相对外圆锥大小变化的百分比。当 `penumbra` 为 0 时，内圆锥大小与外圆锥大小一致；当 `penumbra` 为 1 时，内圆锥大小为 0，光照强度从中轴线就开始往外递减；当 `penumbra` 为 0.5 时，光照强度从外圆锥半径的中点处开始往外递减。

```js
gui.add(light, 'penumbra', 0, 1, 0.01);
```

{{{example url="../threejs-lights-spot-w-helper.html" }}}

注意观察，当 `penumbra` 为默认值 0 的时候，聚光灯会有非常清晰的边缘，而当把 `penumbra` 向 1 调节的时候，边缘会开始模糊。

示例中有点难以看到聚光灯的整个圆锥体，因为圆锥底部在平面下方。将 `distance` 减小到 5 左右，就可以看到圆锥的底部。

## 矩形区域光（`RectAreaLight`）

Three.js 中还有一种类型的光照，矩形区域光（`RectAreaLight`）, 顾名思义，表示一个矩形区域的发射出来的光照，例如长条的日光灯或者天花板上磨砂玻璃透进来的自然光。

`RectAreaLight` 只能影响 `MeshStandardMaterial` 和 `MeshPhysicalMaterial`，所以我们把所有的材质都改为 `MeshStandardMaterial`。

```js
  ...

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
-  const planeMat = new THREE.MeshPhongMaterial({
+  const planeMat = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);
}
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
- const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
+ const cubeMat = new THREE.MeshStandardMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
-  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
+ const sphereMat = new THREE.MeshStandardMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

为了使用 `RectAreaLight`，我们需要引入 three.js 的`RectAreaLightUniformsLib` 模块，同时使用 `RectAreaLightHelper` 来辅助查看灯光对象。

```js
import * as THREE from './resources/three/r122/build/three.module.js';
+import {RectAreaLightUniformsLib} from './resources/threejs/r122/examples/jsm/lights/RectAreaLightUniformsLib.js';
+import {RectAreaLightHelper} from './resources/threejs/r122/examples/jsm/helpers/RectAreaLightHelper.js';
```

我们需要先调用 `RectAreaLightUniformsLib.init`

```js
function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
+  RectAreaLightUniformsLib.init();
```

如果忘了引入和使用 `RectAreaLightUniformsLib`，光照还是可以显示，但是会看起来很奇怪（译者注：在示例的简单场景中没有发现区别），所以要确保有使用。

然后我们可以创建光照了

```js
const color = 0xFFFFFF;
*const intensity = 5;
+const width = 12;
+const height = 4;
*const light = new THREE.RectAreaLight(color, intensity, width, height);
light.position.set(0, 10, 0);
+light.rotation.x = THREE.MathUtils.degToRad(-90);
scene.add(light);

*const helper = new RectAreaLightHelper(light);
*light.add(helper);
```

需要注意的是，与方向光（`DirectionalLight`）和聚光灯（`SpotLight`）不同，矩形光不是使用目标点（`target`），而是使用自身的旋转角度来确定光照方向。另外，矩形光的辅助对象（`RectAreaLightHelper`）应该添加为光照的子节点，而不是添加为场景的子节点。

同时我们修改一下 GUI 代码，使我们可以旋转光源，调整 `width` 和 `height` 属性。

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 10, 0.01);
gui.add(light, 'width', 0, 20).onChange(updateLight);
gui.add(light, 'height', 0, 20).onChange(updateLight);
gui.add(new DegRadHelper(light.rotation, 'x'), 'value', -180, 180).name('x rotation').onChange(updateLight);
gui.add(new DegRadHelper(light.rotation, 'y'), 'value', -180, 180).name('y rotation').onChange(updateLight);
gui.add(new DegRadHelper(light.rotation, 'z'), 'value', -180, 180).name('z rotation').onChange(updateLight);

makeXYZGUI(gui, light.position, 'position', updateLight);
```

场景如下所示：

{{{example url="../threejs-lights-rectarea.html" }}}

关于光照，我们尚未提及的是 `WebGLRenderer` 中有一个设置项 `physicallyCorrectLights`。这个设置会影响（随着离光源的距离增加）光照如何减弱。这个设置会影响点光源（`PointLight`）和聚光灯（`SpotLight`），矩形区域光（`RectAreaLight`）会自动应用这个特性。

在设置光照时，基本思路是不要设置 `distance` 来表现光照的衰减，也不要设置 `intensity`。而是设置光照的 [`power`](PointLight.power) 属性，以流明为单位，three.js 会进行物理计算，从而表现出接近真实的光照效果。在这种情况下 three.js 参与计算的长度单位是米，一个 60瓦 的灯泡大概是 800 流明强度。并且光源有一个 [`decay`](PointLight.decay) 属性，为了模拟真实效果，应该被设置为 `2`。

下面让我们测试看看。

首先开启 `physicallyCorrectLights` 模式

```js
const renderer = new THREE.WebGLRenderer({canvas});
+renderer.physicallyCorrectLights = true;
```

然后我们设置光照的参数，`power` 设置为 800 流明，`decay` 设置为 2，`distance` 设置为 `Infinity`。

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.PointLight(color, intensity);
light.power = 800;
light.decay = 2;
light.distance = Infinity;
```

并且添加 gui 控制 `power` 和 `decay`

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'decay', 0, 4, 0.01);
gui.add(light, 'power', 0, 2000);
```

{{{example url="../threejs-lights-point-physically-correct.html" }}}

需要注意，每添加一个光源到场景中，都会降低 three.js 渲染场景的速度，所以应该尽量使用最少的资源来实现想要的效果。

接下来我们学习 three.js 中的 [相机](threejs-cameras.html)。

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-lights.js"></script>
