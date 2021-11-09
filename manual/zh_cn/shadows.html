Title: Three.js 阴影
Description: Three.js 的阴影
TOC: 阴影

本文是 three.js 系列文章中的一部分。第一篇文章为 [three.js 基础](threejs-fundamentals.html)。如果你是个新手，还没读过，请从那里开始。
[前一篇文章关于相机](threejs-cameras.html)，[再前一遍文章关于灯光](threejs-lights.html)，这些文章都很重要。

电脑中的阴影可以是一个很复杂的话题。有各种各样的解决方案，所有这些都有权衡，包括 three.js 中可用的解决方案。

Three.js 默认使用*shadow maps（阴影贴图）*，阴影贴图的工作方式就是具有投射阴影的光能对所有能被投射阴影的物体从光源渲染阴影。**请再读一遍，试着去理解并记住**

换句话说，如果你有 20 个物体对象、5 个灯光，并且所有的物体都能被投射阴影，所有的光都能投射阴影，那么这个场景这个场景将会绘制 6 次。第一个灯光将会为所有的物体投影阴影，绘制场景。然后是第二个灯光绘制场景，然后是第三个灯光，以此类推。最后一次（即第六次）将通过前五个灯光渲染的数据，渲染出最终的实际场景。

糟糕的是，如果你有一个能投射阴影点光源再这个场景中，那个这个场景将会为这个点光源再绘制 6 次。

由于这些原因，除了寻找其他根本上的解决方案去解决一堆光源都能投射阴影的性能问题。一般还有常见的解决方案，就是允许多个光源，但只让一个光源能投射阴影。

另一个解决方案就是使用光照贴图或者环境光贴图，预先计算离线照明的效果。这将导致静态光照，但是至少该方案渲染的非常快。再另一篇文章中将涵盖这两个解决方案。

其他的解决方案是使用假的阴影。举个例子，做一个飞机模型，将它的平面纹理做灰值处理，将其绘制再模型的下面的地面上。

这个例子我们将使用假阴影

<div class="threejs_center"><img src="../resources/images/roundshadow.png"></div>

我们使用 [前一篇文章](threejs-cameras.html)的代码.

首先让我们将场景的背景颜色设置为白色

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color("white");
```

然后我们将使用相同的棋盘格地面，因为这一次我们使用的是`MeshBasicMaterial`，所有我们不需要地面照明

```js
+const loader = new THREE.TextureLoader();

{
  const planeSize = 40;

-  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/images/checker.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
+  planeMat.color.setRGB(1.5, 1.5, 1.5);
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);
}
```

注意我们将颜色设置为`1.5, 1.5, 1.5`，这将是棋盘纹理的颜色倍增 1.5，1.5，1.5。
也就是说纹理原本的颜色是 0x808080 和 0xC0C0C0，是灰色和浅灰色，现在灰色和浅灰色乘以 1.5 将得到白色和浅灰色的棋盘。

现在让我们加载阴影贴图

```js
const shadowTexture = loader.load("resources/images/roundshadow.png");
```

and make an array to remember each sphere and associated objects.
并且创建一个数组来存放每个球体和它相关的对象

```js
const sphereShadowBases = [];
```

现在我们创建一个球体

```js
const sphereRadius = 1;
const sphereWidthDivisions = 32;
const sphereHeightDivisions = 16;
const sphereGeo = new THREE.SphereGeometry(
  sphereRadius,
  sphereWidthDivisions,
  sphereHeightDivisions
);
```

然后创建一个假阴影的平面网格

```js
const planeSize = 1;
const shadowGeo = new THREE.PlaneGeometry(planeSize, planeSize);
```

现在我们将创建一堆球体，对于每个球体都将创建一个`基础`的`THREE.Object3D`，并且我们将同时创建阴影平面网格和球体网格。这样，如果我们同时移动球体，阴影也一并移动，我们只需要将阴影稍微放置再地面上，防止 Z 轴阴影和地面重叠。
我们将`depthWrite`属性设置为 false，这样使阴影之间不会彼此混淆。
我们将在[另一篇文章](threejs-transparency.html)中讨论这两个问题。
因为阴影的材质是`MeshBasicMaterial`，所以它并不需要照明

我们将每个球体使用不同的色相，然后保存每个球体的基础、球体网格、阴影网格和初始 y 位置。

```js
const numSpheres = 15;
for (let i = 0; i < numSpheres; ++i) {
  // make a base for the shadow and the sphere
  // so they move together.
  const base = new THREE.Object3D();
  scene.add(base);

  // add the shadow to the base
  // note: we make a new material for each sphere
  // so we can set that sphere's material transparency
  // separately.
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true, // so we can see the ground
    depthWrite: false, // so we don't have to sort
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.001; // so we're above the ground slightly
  shadowMesh.rotation.x = Math.PI * -0.5;
  const shadowSize = sphereRadius * 4;
  shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
  base.add(shadowMesh);

  // add the sphere to the base
  const u = i / numSpheres; // goes from 0 to 1 as we iterate the spheres.
  const sphereMat = new THREE.MeshPhongMaterial();
  sphereMat.color.setHSL(u, 1, 0.75);
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  sphereMesh.position.set(0, sphereRadius + 2, 0);
  base.add(sphereMesh);

  // remember all 3 plus the y position
  sphereShadowBases.push({
    base,
    sphereMesh,
    shadowMesh,
    y: sphereMesh.position.y,
  });
}
```

我们设置两个光源，一个是`HemisphereLight`，将其光照强度设置为 2，让场景比较明亮。

```js
{
  const skyColor = 0xb1e1ff; // light blue
  const groundColor = 0xb97a20; // brownish orange
  const intensity = 2;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);
}
```

The other is a `DirectionalLight` so the spheres get some definition
另一个是 `DirectionalLight` ，这将让球体看起来有些视觉的区别

```js
{
  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 5);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);
}
```

现在我们设置球体动画并将其渲染。
对于每个球体，阴影以及 base，让它们在 XZ 平面上移动。使用`Math.abs(Math.sin(time))`将球体上下移动，这样会带来一个类似弹性的动画。并且我们还设置了阴影材质的不透明度，与球体的高度相关。高度越高，阴影越模糊。

```js
function render(time) {
  time *= 0.001;  // convert to seconds

  ...

  sphereShadowBases.forEach((sphereShadowBase, ndx) => {
    const {base, sphereMesh, shadowMesh, y} = sphereShadowBase;

    // u is a value that goes from 0 to 1 as we iterate the spheres
    const u = ndx / sphereShadowBases.length;

    // compute a position for the base. This will move
    // both the sphere and its shadow
    const speed = time * .2;
    const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1);
    const radius = Math.sin(speed - ndx) * 10;
    base.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

    // yOff is a value that goes from 0 to 1
    const yOff = Math.abs(Math.sin(time * 2 + ndx));
    // move the sphere up and down
    sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 2, yOff);
    // fade the shadow as the sphere goes up
    shadowMesh.material.opacity = THREE.MathUtils.lerp(1, .25, yOff);
  });

  ...
```

这里有 15 种弹跳球

{{{example url="../threejs-shadows-fake.html" }}}

在某些应用程序中使用圆形或者椭圆的阴影也是很常见的。当然也可以使用不同形状的阴影纹理，也可以将阴影的边缘锐化。使用这种类型的阴影的例子是 [Animal Crossing Pocket Camp](https://www.google.com/search?tbm=isch&q=animal+crossing+pocket+camp+screenshots)，在其中你可以看到每个字符都有一个简单的原型阴影。这种方式很有效，也很方便。[Monument Valley 纪念碑谷](https://www.google.com/search?q=monument+valley+screenshots&tbm=isch)看起来似乎也使用这种阴影。

因此，移动阴影贴图，有三种光可以投射阴影，分别为`DirectionalLight 定向光`、 `PointLight 点光源`、`SpotLight 聚光灯`，

让我们从 `DirectionalLight 定向光` 开始。这里我们使用[关于灯光的文章](threejs-lights.html)作为基础

第一件事是设置渲染器中的阴影属性

```js
const renderer = new THREE.WebGLRenderer({ canvas });
+renderer.shadowMap.enabled = true;
```

我们还需要设置光能投射阴影

```js
const light = new THREE.DirectionalLight(color, intensity);
+light.castShadow = true;
```

在场景中的每个网格，我们都能设置它是否能投射阴影或被投射阴影。
这里我们只设置地面能被投射阴影，这样我们不需要关心地面投射阴影的问题。

```js
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.receiveShadow = true;
```

对于球体和立方体，我们需要设置他们都能投射阴影或者被投射阴影

```js
const mesh = new THREE.Mesh(cubeGeo, cubeMat);
mesh.castShadow = true;
mesh.receiveShadow = true;

...

const mesh = new THREE.Mesh(sphereGeo, sphereMat);
mesh.castShadow = true;
mesh.receiveShadow = true;
```

然后我们运行它

{{{example url="../threejs-shadows-directional-light.html" }}}

发生了什么？为什么阴影的一部分不见了

原因是阴影是通过光线的角度渲染场景之后生成的。在这种情况下，现在只有一个`DirectionalLight 定向光`在照射这个球体，就像我们之前的文章[关于相机](threejs-cameras.html)，光源的阴影相机决定了阴影投射的区域。在上面的例子中，该区域太小了。

为了可视化该区域，我们可以通过`CameraHelper 相机帮助类` 来获取光源的阴影相机。

```js
const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(cameraHelper);
```

你现在可以看到光源的阴影相机可以投射的区域。

{{{example url="../threejs-shadows-directional-light-with-camera-helper.html" }}}

我们来回调整相机的 x 坐标值。这样我们可以很清楚的看到：光源的阴影相机所包围的 box 才是能投射阴影的区域。

我们可以通过调整光源的阴影相机来调整该盒子的大小。

现在我们添加一些可以调整光源相关属性的 GUI 设置。
由于`DirectionalLight 定向光`表现形式是光照一直都是平行方向移动的，所以我们在`DirectionalLight 定向光`中使用`OrthographicCamera 正交相机`为了观察阴影相机。
我们在 [关于相机的文章](threejs-cameras.html)介绍了`OrthographicCamera 正交相机`是如何工作的。

回忆`OrthographicCamera 正交相机`的定义和其视图的用法，以及其属性：`left`, `right`, `top`, `bottom`, `near`, `far`,`zoom`

我们再次为 dat.GUI 创建一个`DimensionGUIHelper`类。这个类的作用是响应式的通过一个属性来设置两个相关的属性。然后将其加入到 dat.GUI 选项中。
我们根据`width`的值设置 `left`和`right`，根据`height`的值设置`up` 和 `down`

```js
class DimensionGUIHelper {
  constructor(obj, minProp, maxProp) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
  }
  get value() {
    return this.obj[this.maxProp] * 2;
  }
  set value(v) {
    this.obj[this.maxProp] = v / 2;
    this.obj[this.minProp] = v / -2;
  }
}
```

我们也会使用在[关于相机的文中](threejs-cameras.html)中创建的`MinMaxGUIHelper`，他将负责`near` and `far`的变化

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
+{
+  const folder = gui.addFolder('Shadow Camera');
+  folder.open();
+  folder.add(new DimensionGUIHelper(light.shadow.camera, 'left', 'right'), 'value', 1, 100)
+    .name('width')
+    .onChange(updateCamera);
+  folder.add(new DimensionGUIHelper(light.shadow.camera, 'bottom', 'top'), 'value', 1, 100)
+    .name('height')
+    .onChange(updateCamera);
+  const minMaxGUIHelper = new MinMaxGUIHelper(light.shadow.camera, 'near', 'far', 0.1);
+  folder.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
+  folder.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
+  folder.add(light.shadow.camera, 'zoom', 0.01, 1.5, 0.01).onChange(updateCamera);
+}
```

我们需要让 GUI 在我们改变数据的时候调用`updateCamera`方法
这个方法将更新光源，光源的帮助类以及光源的阴影相机和像是光的阴影相机的帮助类。

```js
function updateCamera() {
  // update the light target's matrixWorld because it's needed by the helper
  light.target.updateMatrixWorld();
  helper.update();
  // update the light's shadow camera's projection matrix
  light.shadow.camera.updateProjectionMatrix();
  // and now update the camera helper we're using to show the light's shadow camera
  cameraHelper.update();
}
updateCamera();
```

现在我们给了光的阴影相机一个 GUI，我们可以尝试随意更改其中的值。

{{{example url="../threejs-shadows-directional-light-with-camera-gui.html" }}}

将`width` 和 `height`的值设置在 30 附近，我们将看到阴影是正常渲染的，因为这个区域都在阴影相机的投影范围内。

这也带来一个疑问。为什么我们不将`width` 和 `height`设置成一个非常大的值，这样不就可以投影一切了？我们将它设置成 100 来看看会发生什么。

<div class="threejs_center"><img src="resources/images/low-res-shadow-map.png" style="width: 369px"></div>

我们将看到一些块状的阴影！

这个问题是另一个需要注意的阴影相关设置。被投射产生的阴影也是有纹理的，这些阴影的纹理也是有单位大小的。如果阴影相机的属性设置的越大，就意味着它能投射的区域也变得很大，就意味着投射的阴影会越来越块状。

你可以设置`light.shadow.mapSize.width`和 `light.shadow.mapSize.height`来设置阴影的纹理分辨率。他们默认为 512X512。如果设置的很大，他们在计算时将占用更多的内存，并且变得很慢。为了获得更真实的阴影，应该尽量将值设置的最小。请注意在渲染器中该属性[`renderer.capabilities.maxTextureSize`](WebGLRenderer.capabilities)对于每个用户都有最大纹理的上限值。

当我们切换到 `SpotLight 聚光灯`时，光源的阴影相机就变成了`PerspectiveCamera透视相机` ，与`DirectionalLight 定向光`的阴影相机不同，`SpotLight 聚光灯`的阴影相机有其本身所控制，我们也可以手动设置大部分设置。`SpotLight聚光灯`阴影相机的的`fov`跟`SpotLight聚光灯`的`angle` 关联。`aspect`属性是根据阴影映射自动设置大小的。

```js
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.SpotLight(color, intensity);
```

我们在[关于灯光的文章](threejs-lights.html)中添加了`penumbra` 和 `angle`的相关介绍

{{{example url="../threejs-shadows-spot-light-with-camera-gui.html" }}}

最后，我们介绍 `PointLight 聚光灯`的阴影投射。
`PointLight 聚光灯`是向四面八方发散的，所以唯一的设置只有`near` 和 `far`。实际上`PointLight 聚光灯` 相当于 6 个面的`SpotLight 点光源`组合而成。这意味着它的渲染速度要慢得多，相当于整个场景的阴影和渲染 6 次，每个方向(面)都需要渲染一次。

我们将在场景中放置一个盒子，这样我们可以看到墙壁和天花板的阴影效果。我们设置材质的属性，只让它在盒子的内部渲染，就像地板一样。我们还设置它可以被投射阴影，并且将它的高度设置的比地板稍微低一点，防止 Z 轴渲染重合。

```js
{
  const cubeSize = 30;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({
    color: "#CCC",
    side: THREE.BackSide,
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.receiveShadow = true;
  mesh.position.set(0, cubeSize / 2 - 0.1, 0);
  scene.add(mesh);
}
```

当然我们也需要把光源切换成`PointLight 聚光灯`

```js
-const light = new THREE.SpotLight(color, intensity);
+const light = new THREE.PointLight(color, intensity);

....

// so we can easily see where the point light is
+const helper = new THREE.PointLightHelper(light);
+scene.add(helper);
```

{{{example url="../threejs-shadows-point-light.html" }}}

使用 GUI 的`position`来移动光源的位置，你就可以看到墙上阴影强度的改变。你还可以调整其他的设置，比如`near` 和 `far` ，`near`代表最小的渲染阴影的距离，这只会渲染物体的距离大于其值的物体的阴影。 `far` 这代表渲染比其值距离小的物体的阴影。
