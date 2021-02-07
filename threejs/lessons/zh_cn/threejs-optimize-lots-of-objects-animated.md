Title: Three.js 优化对象的同时保持动画效果
Description: 使用morphtarget优化
TOC: 优化对象的同时保持动画效果

本文是关于 three.js 系列文章的一部分. 第一篇文章是 [three.js 基础](threejs-fundamentals.html). 如果你还没看过而且对three.js 还不熟悉，那应该从那里开始.

在上一章中, 我们合并了19000个对象到一个几何体中. 这带来的好处是优化掉19000次绘制操作但是缺点是没有办法再单独操作某一个了. 

根据我们想达成的目标的不同, 有不同的解决方案可选. 本例中我们绘制大量的数据, 然后还能在这些数据集间设置动画

第一件事是获取数据集. 理想中我们可能需要预处理这些数据, 但是我们现在只需要载入两个数据集然后产生更多的. 

这是我们之前的载入代码

```js
loadFile('resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc')
  .then(parseData)
  .then(addBoxes)
  .then(render);
```

稍微改成这样

```js
async function loadData(info) {
  const text = await loadFile(info.url);
  info.file = parseData(text);
}

async function loadAll() {
  const fileInfos = [
    {name: 'men',   hueRange: [0.7, 0.3], url: 'resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc' },
    {name: 'women', hueRange: [0.9, 1.1], url: 'resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014ft_2010_cntm_1_deg.asc' },
  ];

  await Promise.all(fileInfos.map(loadData));

  ...
}
loadAll();
```

上面的代码将会加载`fileInfos`中的所有文件, 加载完成后每一个`fileInfos`中的对象都会有一个带着载入文件的`file`属性. 我们稍后使用`name`和`hueRange`. `name`是显示在界面上的字段, `hueRange`是色调. 

上面的两个文件显然是每个地区2010年男人和女人的数量. 注意了, 我不知道这些数据对不对, 但是不影响好吧. 重要的是如何去展示这些不同的数据. 

让我们再产生两组数据. 一组是男人数量比女人多的, 另一组反过来. 

首先，让我们编写一个函数，在给定一个二维数组的情况下，像以前一样映射生成一个新的二维数组

```js
function mapValues(data, fn) {
  return data.map((row, rowNdx) => {
    return row.map((value, colNdx) => {
      return fn(value, rowNdx, colNdx);
    });
  });
}
```

就像普通的`Array.map`函数, `mapValues`函数对数组的数组每一个值调用了`fn`. 这将会将每个值和它的索引传进去. 

现在让我们编写一些代码来生成一个新文件，它是两个文件之间的比较

```js
function makeDiffFile(baseFile, otherFile, compareFn) {
  let min;
  let max;
  const baseData = baseFile.data;
  const otherData = otherFile.data;
  const data = mapValues(baseData, (base, rowNdx, colNdx) => {
    const other = otherData[rowNdx][colNdx];
      if (base === undefined || other === undefined) {
        return undefined;
      }
      const value = compareFn(base, other);
      min = Math.min(min === undefined ? value : min, value);
      max = Math.max(max === undefined ? value : max, value);
      return value;
  });
  // 生成baseFile的一个副本, 然后用新文件的min max 和 data替代原来的
  return {...baseFile, min, max, data};
}
```

上面的代码基于传入的`compareFn`用`mapValues`生成一个新的数据集. 这同样追踪`min`和`max`的比较结果. 最后这将会生成一个新文件, 除了`min`, `max`和`data`所有的属性都和`baseFile`一样. 

然后我们用上面的代码生成两个新数据集

```js
{
  const menInfo = fileInfos[0];
  const womenInfo = fileInfos[1];
  const menFile = menInfo.file;
  const womenFile = womenInfo.file;

  function amountGreaterThan(a, b) {
    return Math.max(a - b, 0);
  }
  fileInfos.push({
    name: '>50%men',
    hueRange: [0.6, 1.1],
    file: makeDiffFile(menFile, womenFile, (men, women) => {
      return amountGreaterThan(men, women);
    }),
  });
  fileInfos.push({
    name: '>50% women', 
    hueRange: [0.0, 0.4],
    file: makeDiffFile(womenFile, menFile, (women, men) => {
      return amountGreaterThan(women, men);
    }),
  });
}
```

现在我们写一个UI来选择数据集. 首先是html部分

```html
<body>
  <canvas id="c"></canvas>
+  <div id="ui"></div>
</body>
```

CSS部分, 让其显示在左侧

```css
#ui {
  position: absolute;
  left: 1em;
  top: 1em;
}
#ui>div {
  font-size: 20pt;
  padding: 1em;
  display: inline-block;
}
#ui>div.selected {
  color: red;
}
```

我们遍历整个文件, 对于每一个数据集都生成了合并了的box, 

然后我们可以遍历每个文件, 并为每组数据生成合并了的box和一个元素, 当鼠标悬停在上面时, 该元素将显示该集合并隐藏所有其他元素

```js
// 展示选中的元素, 隐藏其他的
function showFileInfo(fileInfos, fileInfo) {
  fileInfos.forEach((info) => {
    const visible = fileInfo === info;
    info.root.visible = visible;
    info.elem.className = visible ? 'selected' : '';
  });
  requestRenderIfNotRequested();
}

const uiElem = document.querySelector('#ui');
fileInfos.forEach((info) => {
  const boxes = addBoxes(info.file, info.hueRange);
  info.root = boxes;
  const div = document.createElement('div');
  info.elem = div;
  div.textContent = info.name;
  uiElem.appendChild(div);
  div.addEventListener('mouseover', () => {
    showFileInfo(fileInfos, info);
  });
});
// 起始展示第一组数据
showFileInfo(fileInfos, fileInfos[0]);
```

和之前例子有所不同的是, 我们还需要让`addBoxes`获取`hueRange`

```js
-function addBoxes(file) {
+function addBoxes(file, hueRange) {

  ...

    // compute a color
-    const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
+    const hue = THREE.MathUtils.lerp(...hueRange, amount);

  ...
```

把鼠标放到标签上可以在四组不同的数据集之间切换. 


{{{example url="../threejs-lots-of-objects-multiple-data-sets.html" }}}

咋回事, 怎么还有一些点非常突出??!! 而且切换得很生硬也没有动画啊

有这么一些想法

*  通过使用`Material.opacity`做消失过渡

  这个解决方案的问题是立方体完全重叠了, 意思是在Z轴方向冲突. 我们可以通过改变depth函数和使用blending来修复. 我们应该试一试

*  放大我们想看到的集合，缩小其他集合

  因为所有盒子的原点都在地球的中心, 如果我们把它们缩小到1.0以下, 它们就会沉入地球. 这听起来是个好主意, 但问题是所有的较低的盒子几乎会立即消失，直到新的数据集扩展到1.0才被替换. 这使得过渡非常不漂亮. 我们可以用一个神奇的自定义着色器来解决这个问题. 

*  使用Morphtargets

   所谓*变形目标morphtargets*是一种给每个顶点提供多个值, 以及使他们进行变形或者说lerp(线性插值)的方法. morphtargets通常用于3D角色的面部动画, 但这并不是唯一的用途. 

我们试试morphtargets

我们还是给每一个数据集做一个几何体, 但这次我们提取`position`属性, 把他们作为morphtargets.

首先我们改动一下`addBoxes`来生成并返回一个合并的几何体. 


```js
-function addBoxes(file, hueRange) {
+function makeBoxes(file, hueRange) {
  const {min, max, data} = file;
  const range = max - min;
  
  ...

-  const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
-      geometries, false);
-  const material = new THREE.MeshBasicMaterial({
-    vertexColors: true,
-  });
-  const mesh = new THREE.Mesh(mergedGeometry, material);
-  scene.add(mesh);
-  return mesh;
+  return BufferGeometryUtils.mergeBufferGeometries(
+     geometries, false);
}
```

不过, 我们还有一件事要做. 变形目标的顶点数必须完全相同. 一个目标中的顶点#123需要在所有其他目标中有一个对应的顶点#123. 但是, 由于现在不同的数据集可能有一些没有数据的数据点, 因此不会为该点生成几何体, 这意味着另一个数据集没有相应的顶点. 所以, 我们需要检查所有的数据集，如果任何一个数据集中有数据, 就总是生成一些东西; 或者如果任何一个数据集中缺少数据, 就什么也不生成. 让我们以后者为准. 

```js
+function dataMissingInAnySet(fileInfos, latNdx, lonNdx) {
+  for (const fileInfo of fileInfos) {
+    if (fileInfo.file.data[latNdx][lonNdx] === undefined) {
+      return true;
+    }
+  }
+  return false;
+}

-function makeBoxes(file, hueRange) {
+function makeBoxes(file, hueRange, fileInfos) {
  const {min, max, data} = file;
  const range = max - min;

  ...

  const geometries = [];
  data.forEach((row, latNdx) => {
    row.forEach((value, lonNdx) => {
+      if (dataMissingInAnySet(fileInfos, latNdx, lonNdx)) {
+        return;
+      }
      const amount = (value - min) / range;

  ...
```

现在我们改动一下代码, 把调用`addBoxes`的改成使用`makeBoxes`生成变形目标.

```js
+// 对每一个数据集生成几何体
+const geometries = fileInfos.map((info) => {
+  return makeBoxes(info.file, info.hueRange, fileInfos);
+});
+
+// 以第一个几何体作为基准, 将其他的作为变形目标
+const baseGeometry = geometries[0];
+baseGeometry.morphAttributes.position = geometries.map((geometry, ndx) => {
+  const attribute = geometry.getAttribute('position');
+  const name = `target${ndx}`;
+  attribute.name = name;
+  return attribute;
+});
+const material = new THREE.MeshBasicMaterial({
+  vertexColors: true,
+  morphTargets: true,
+});
+const mesh = new THREE.Mesh(baseGeometry, material);
+scene.add(mesh);

const uiElem = document.querySelector('#ui');
fileInfos.forEach((info) => {
-  const boxes = addBoxes(info.file, info.hueRange);
-  info.root = boxes;
  const div = document.createElement('div');
  info.elem = div;
  div.textContent = info.name;
  uiElem.appendChild(div);
  function show() {
    showFileInfo(fileInfos, info);
  }
  div.addEventListener('mouseover', show);
  div.addEventListener('touchstart', show);
});
// 展示第一组数据集
showFileInfo(fileInfos, fileInfos[0]);
```

以上我们为每一组数据集创建了几何体, 以第一个作为基准, 获取了`position`属性, 将其他的几何体作为其变形目标

现在我们需要改变显示和隐藏各种数据集的方式. 我们需要改动变形目标的influence, 而不是简单地显示和隐藏mesh. 对于我们我们想看到的数据集, influence应该是1, 不想看到的是0. 但是我们又不能直接将他们设置成1和0, 这将会显示开与闭的两种情况, 和现在这种没有区别. 我们也可以写一段自定义的动画效果, 听起来不难. 但是我们模仿的WebGL globe用了一个[动画库](https://github.com/tweenjs/tween.js/), 我们也用这一个. 

我们这里首先引入它

```js
import * as THREE from './resources/three/r125/build/three.module.js';
import {BufferGeometryUtils} from './resources/threejs/r125/examples/jsm/utils/BufferGeometryUtils.js';
import {OrbitControls} from './resources/threejs/r125/examples/jsm/controls/OrbitControls.js';
+import {TWEEN} from './resources/threejs/r125/examples/jsm/libs/tween.min.js';
```

然后创建一个`Tween`来使influence变化

```js
// show the selected data, hide the rest
function showFileInfo(fileInfos, fileInfo) {
  fileInfos.forEach((info) => {
    const visible = fileInfo === info;
-    info.root.visible = visible;
    info.elem.className = visible ? 'selected' : '';
+    const targets = {};
+    fileInfos.forEach((info, i) => {
+      targets[i] = info === fileInfo ? 1 : 0;
+    });
+    const durationInMs = 1000;
+    new TWEEN.Tween(mesh.morphTargetInfluences)
+      .to(targets, durationInMs)
+      .start();
  });
  requestRenderIfNotRequested();
}
```

我们也可以在每一帧的render函数中调用`TWEEN.update`, 但这会带来一个问题. "tween.js"是为了连续渲染而设计的, 但是我们采用的是[按需渲染](threejs-rendering-on-demand.html). 我们可以再切换回连续渲染的方式, 但是为了省电和省资源起见, 还是按需渲染比较好. 所以我们看看是否能让它在按需渲染下工作. 

我们需要`TweenManaget`来完成这件事. 我们将用它来创建`Tween`并追踪他们. 这里会有一个`update`方法, 如果我们二次调用它的时候返回`true`, 如果所有动画结束后则会返回`false`.

```js
class TweenManger {
  constructor() {
    this.numTweensRunning = 0;
  }
  _handleComplete() {
    --this.numTweensRunning;
    console.assert(this.numTweensRunning >= 0);
  }
  createTween(targetObject) {
    const self = this;
    ++this.numTweensRunning;
    let userCompleteFn = () => {};
    // 创建一个新的Tween, 并应用我们自己的回调函数
    const tween = new TWEEN.Tween(targetObject).onComplete(function(...args) {
      self._handleComplete();
      userCompleteFn.call(this, ...args);
    });
    // 用我们自己的onComplete代替它的, 
    // 因此, 如果用户提供回调, 我们可以调用用户的回调
    tween.onComplete = (fn) => {
      userCompleteFn = fn;
      return tween;
    };
    return tween;
  }
  update() {
    TWEEN.update();
    return this.numTweensRunning > 0;
  }
}
```

我们需要以下代码来使用

```js
function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
+  const tweenManager = new TweenManger();

  ...
```

这是如何创建Tween

```js
// show the selected data, hide the rest
function showFileInfo(fileInfos, fileInfo) {
  fileInfos.forEach((info) => {
    const visible = fileInfo === info;
    info.elem.className = visible ? 'selected' : '';
    const targets = {};
    fileInfos.forEach((info, i) => {
      targets[i] = info === fileInfo ? 1 : 0;
    });
    const durationInMs = 1000;
-    new TWEEN.Tween(mesh.morphTargetInfluences)
+    tweenManager.createTween(mesh.morphTargetInfluences)
      .to(targets, durationInMs)
      .start();
  });
  requestRenderIfNotRequested();
}
```
我们需要改动render函数来更新tween, 让动画还在跑的时候保持渲染


```js
function render() {
  renderRequested = false;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

+  if (tweenManager.update()) {
+    requestRenderIfNotRequested();
+  }

  controls.update();
  renderer.render(scene, camera);
}
render();
```

这样我们就可以在数据集中以动画的方式过渡了

{{{example url="../threejs-lots-of-objects-morphtargets.html" }}}

看起来挺好的, 但是失去了色彩.

Three.js不支持颜色的变形, 但事实上这是[webgl globe](https://github.com/dataarts/webgl-globe)下的一个issue. 基本上它只为第一个数据集生成颜色, 任何其他数据集使用相同的颜色. 即使它们有很大的不同. 

让我们看看是否可以做到让颜色也随之变化. 这个操作方法可能鲁棒性不足. 最好的方式是自己写着色器, 但是我觉得在这里还是讲一下如何修改内置的着色器为好

我们需要做的第一件事是让代码从每个数据集的几何体中提取颜色. 

```js

const baseGeometry = geometries[0];
baseGeometry.morphAttributes.position = geometries.map((geometry, ndx) => {
  const attribute = geometry.getAttribute('position');
  const name = `target${ndx}`;
  attribute.name = name;
  return attribute;
});
+const colorAttributes = geometries.map((geometry, ndx) => {
+  const attribute = geometry.getAttribute('color');
+  const name = `morphColor${ndx}`;
+  attribute.name = `color${ndx}`;  // debug需要
+  return {name, attribute};
+});
const material = new THREE.MeshBasicMaterial({
  vertexColors: true,
  morphTargets: true,
});
```

We then need to modify the three.js shader. Three.js materials have an
`Material.onBeforeCompile` property we can assign a function. It gives us a
chance to modify the material's shader before it is passed to WebGL. In fact the
shader that is provided is actually a special three.js only syntax of shader
that lists a bunch of shader *chunks* that three.js will substitute with the
actual GLSL code for each chunk. Here is what the unmodified vertex shader code
looks like as passed to `onBeforeCompile`.

我们需要改动three.js的着色器. Three.js的材质有一个`Material.onBeforeCompile`属性, 我们可以为其赋一个函数. 这给了我们一个在传递给WebGL之前修改材质着色器的机会. 实际上, 提供的着色器就是一个特殊语法的three.js, 然后将会被GLSL替换. 以下是未修改的顶点着色器代码, 看起来将要传给`onBeforeCompile`. (In fact the shader that is provided is actually a special three.js only syntax of shader that lists a bunch of shader *chunks* that three.js will substitute with the actual GLSL code for each chunk. Here is what the unmodified vertex shader code looks like as passed to `onBeforeCompile`.)


```glsl
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <skinbase_vertex>
	#ifdef USE_ENVMAP
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}
```

我们需要替换一下的部分 [`morphtarget_pars_vertex` chunk](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/morphtarget_pars_vertex.glsl.js), [`morphnormal_vertex` chunk](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/morphnormal_vertex.glsl.js), [`morphtarget_vertex` chunk](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/morphtarget_vertex.glsl.js), [`color_pars_vertex` chunk](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/color_pars_vertex.glsl.js), [`color_vertex` chunk](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/color_vertex.glsl.js)

我们需要把待替换写成一个简单的数组, 在`Material.onBeforeCompile`中应用它们.

```js
const material = new THREE.MeshBasicMaterial({
  vertexColors: true,
  morphTargets: true,
});
+const vertexShaderReplacements = [
+  {
+    from: '#include <morphtarget_pars_vertex>',
+    to: `
+      uniform float morphTargetInfluences[8];
+    `,
+  },
+  {
+    from: '#include <morphnormal_vertex>',
+    to: `
+    `,
+  },
+  {
+    from: '#include <morphtarget_vertex>',
+    to: `
+      transformed += (morphTarget0 - position) * morphTargetInfluences[0];
+      transformed += (morphTarget1 - position) * morphTargetInfluences[1];
+      transformed += (morphTarget2 - position) * morphTargetInfluences[2];
+      transformed += (morphTarget3 - position) * morphTargetInfluences[3];
+    `,
+  },
+  {
+    from: '#include <color_pars_vertex>',
+    to: `
+      varying vec3 vColor;
+      attribute vec3 morphColor0;
+      attribute vec3 morphColor1;
+      attribute vec3 morphColor2;
+      attribute vec3 morphColor3;
+    `,
+  },
+  {
+    from: '#include <color_vertex>',
+    to: `
+      vColor.xyz = morphColor0 * morphTargetInfluences[0] +
+                   morphColor1 * morphTargetInfluences[1] +
+                   morphColor2 * morphTargetInfluences[2] +
+                   morphColor3 * morphTargetInfluences[3];
+    `,
+  },
+];
+material.onBeforeCompile = (shader) => {
+  vertexShaderReplacements.forEach((rep) => {
+    shader.vertexShader = shader.vertexShader.replace(rep.from, rep.to);
+  });
+};
```

Three.js会给这些变形对象排序, 然后之后采用最高的influence. 这使得它可以采用更多的变形目标而只有几个可以被在同一时刻使用.不幸的是three.js不提供任何方法来知道将使用多少变形目标, 也不知道变形目标将分配给哪些属性. 所以, 我们必须研究代码并重现它在这里的作用. 如果three.js修改了它的算法, 接下来的代码也得重构. 

首先我们需要移除所有的颜色属性. 如果我们之前没有赋予这个属性那么移除它就一点事没有. 然后我们将会计算那些目标three.js将会用到, 最终把这些目标赋给three.js可能会用到的属性. 

```js

const mesh = new THREE.Mesh(baseGeometry, material);
scene.add(mesh);

+function updateMorphTargets() {
+  // 移除所有的颜色属性
+  for (const {name} of colorAttributes) {
+    baseGeometry.deleteAttribute(name);
+  }
+
+  // 没有提供可以查询这个的方法, 我们只能寄希望于它不会改变
+  const maxInfluences = 8;
+
+  // three.js没有提供查询哪个morphtarget会被使用的方法
+  // 也没有那个属性说明被使用, 所以只能靠猜
+  // 如果算法改了, 那这些都得重构
+  mesh.morphTargetInfluences
+    .map((influence, i) => [i, influence])            // 将索引映射到influence
+    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))  // 降幂排序
+    .slice(0, maxInfluences)                          // 只要最大的influence
+    .sort((a, b) => a[0] - b[0])                      // 按索引排序
+    .filter(a => !!a[1])                              // 移除没有influence的
+    .forEach(([ndx], i) => {                          // 赋予属性
+      const name = `morphColor${i}`;
+      baseGeometry.setAttribute(name, colorAttributes[ndx].attribute);
+    });
+}
```

我们将会在`loadAll`函数中返回这个函数. 这将不会让我们泄露任何的变量

```js
async function loadAll() {
  ...

+  return updateMorphTargets;
}

+// 使用无操作的update直到所有数据准备完成
+let updateMorphTargets = () => {};
-loadAll();
+loadAll().then(fn => {
+  updateMorphTargets = fn;
+});
```

最终我们需要调用`updateMorphTargets`, 直到我们最终让所有的数值都在渲染前被tween manager更新

```js
function render() {

  ...

  if (tweenManager.update()) {
    requestRenderIfNotRequested();
  }

+  updateMorphTargets();

  controls.update();
  renderer.render(scene, camera);
}
```

然后我们的颜色就可以像尺寸一样动起来了. 

{{{example url="../threejs-lots-of-objects-morphtargets-w-colors.html" }}}

我希望上面讲的这些能有用. 通过threejs提供的方法或者自己写着色器来使用变形对象是一种常见的移动大量对象的手段. 作为一个例子, 我们可以给每一个立方体一个随机目标, 然后从这个位置变换到另一个位置. 这可能是一种超酷的介绍地球的方法. 

接下来你可能感兴趣的是给地球上的一个位置添加标签, 这将在[3D中排布HTML元素](threejs-align-html-elements-to-3d.html)中涉及. 

Note: We could try to just graph percent of men or percent of women or the raw
difference but based on how we are displaying the info, cubes that grow from the
surface of the earth, we'd prefer most cubes to be low. If we used one of these
other comparisons most cubes would be about 1/2 their maximum height which would
not make a good visualization. Feel free to change the `amountGreaterThan` from
`Math.max(a - b, 0)` to something like `(a - b)` "raw difference" or `a / (a +
b)` "percent" and you'll see what I mean.

注: 我们可以试着用图表表示男性的百分比或女性的百分比或原始差异. 但根据我们显示信息的方式, 也就是从地球表面生长出来的立方体的显示方式, 我们希望大多数立方体都是矮的. 如果我们使用其中一个做基准, 大多数立方体的高度大约是它们最大高度的1/2. 效果会很差. 自己动手改一下`amountGreaterThan`中的`Math.max(a - b, 0)` 到`(a - b)` "原始差异"或者 `a / (a + b)`"百分比", 你就会明白我什么意思了. 