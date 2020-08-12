Title: Three.js Оптимизация большого количества анимированных объектов
Description: Анимированные объединенные объекты с морфтаргетами
TOC: Оптимизация множества анимированных объектов

Эта статья является продолжением  [статьи об оптимизации множества объектов
](threejs-optimize-lots-of-objects.html). Если вы еще не прочитали это, пожалуйста, прочитайте его, прежде чем продолжить.  

В предыдущей статье мы объединили около 19000 кубов в одну геометрию. Это имело преимущество, заключающееся в том, 
что оно оптимизировало наш рисунок из 19000 кубов, но имело тот недостаток, что затрудняло перемещение любого отдельного куба. 

В зависимости от того, чего мы пытаемся достичь, существуют разные решения. В этом случае давайте наметим несколько наборов данных и анимируем между наборами. 


Первое, что нам нужно сделать, это получить несколько наборов данных. 
В идеале мы бы, вероятно, предварительно обрабатывали данные в автономном режиме, 
но в этом случае давайте загрузим 2 набора данных и сгенерируем еще 2 


Вот наш старый код загрузки 

```js
loadFile('resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc')
  .then(parseData)
  .then(addBoxes)
  .then(render);
```

Давайте изменим это на что-то вроде этого 

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

Приведенный выше код загрузит все файлы в `fileInfos`, и после этого каждый объект в `fileInfos`
будет иметь свойство `file` с загруженным файлом. `name` и `hueRange` мы будем использовать позже. 
`name` будет для поля пользовательского интерфейса. `hueRange` будет использоваться для выбора диапазона оттенков для отображения. 


Два файла выше, по-видимому, представляют собой количество мужчин на область и число женщин на область по состоянию на 2010 год. Обратите внимание,
я не знаю, верны ли эти данные, но на самом деле это не важно. Важная часть показывает разные наборы данных. 

Давайте сгенерируем еще 2 набора данных. Одним из них являются места, 
где число мужчин превышает число женщин, и наоборот, места, где число женщин превышает число мужчин. 


Первым делом давайте напишем функцию, которая с помощью двухмерного массива массивов, 
как мы делали раньше, отобразит ее, чтобы сгенерировать новый двумерный массив массивов. 


```js
function mapValues(data, fn) {
  return data.map((row, rowNdx) => {
    return row.map((value, colNdx) => {
      return fn(value, rowNdx, colNdx);
    });
  });
}
```

Как и обычная функция `Array.map`, функция `mapValues` вызывает функцию fn для каждого значения в массиве массивов. 
Он передает ему значение, а также индексы строки и столбца. 


Теперь давайте создадим некоторый код для генерации нового файла, который сравнивает 2 файла. 


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
  // make a copy of baseFile and replace min, max, and data
  // with the new data
  return {...baseFile, min, max, data};
}
```

Приведенный выше код использует `mapValues` для генерации нового набора данных, 
который представляет собой сравнение на основе переданной функции `CompareFn`. 
Он также отслеживает минимальные и максимальные результаты сравнения. Наконец, 
он создает новый файл со всеми теми же свойствами, что и `baseFile`, за исключением новых `min`, `max` и `data`. 

 
Тогда давайте использовать это, чтобы сделать 2 новых набора данных 

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

Теперь давайте сгенерируем пользовательский интерфейс для выбора между этими наборами данных. Для начала нам нужен HTML-интерфейс 


```html
<body>
  <canvas id="c"></canvas>
+  <div id="ui"></div>
</body>
```

и немного CSS, чтобы он появился в верхней левой области 

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

Затем мы можем просмотреть каждый файл и сгенерировать набор объединенных блоков
для набора данных и элемент, который при наведении курсора отобразит этот набор и скроет все остальные.

```js
// show the selected data, hide the rest
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
// show the first set of data
showFileInfo(fileInfos, fileInfos[0]);
```

Еще одно изменение, которое нам нужно из предыдущего примера, заключается в том, что мы должны заставить `addBoxes` принимать `hueRange` 


```js
-function addBoxes(file) {
+function addBoxes(file, hueRange) {

  ...

    // compute a color
-    const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
+    const hue = THREE.MathUtils.lerp(...hueRange, amount);

  ...
```

и с этим мы должны быть в состоянии показать 4 набора данных. Наведите указатель мыши на ярлыки или коснитесь их, чтобы переключать наборы 


{{{example url="../threejs-lots-of-objects-multiple-data-sets.html" }}}

Обратите внимание, что есть несколько странных точек данных, которые действительно выделяются. 
Интересно, что с ними? ??! В любом случае, как мы анимируем между этими 4 наборами данных. 


Много идей. 

*  Просто исчезните между ними, используя `Material.opacity` 

   Проблема с этим решением заключается в том, что кубы полностью перекрываются, 
   что означает, что возникнут проблемы z-борьбы. Возможно, мы могли бы исправить это, 
   изменив функцию глубины и используя смешивание. Вероятно, мы должны изучить это. 


*  Увеличьте набор, который мы хотим видеть, и уменьшите другие наборы. 

   Поскольку все коробки имеют свое происхождение в центре планеты, если мы масштабируем их ниже 1,0, они погрузятся в планету. 
   Сначала это звучит как хорошая идея, но проблема в том, что все поля низкой высоты исчезнут почти сразу и не будут заменены, 
   пока новый набор данных не масштабируется до 1,0. 
   Это делает переход не очень приятным. Мы могли бы исправить это с помощью необычного шейдера. 

*  Используйте Morphtargets 

   Morphtargets - это способ, которым мы предоставляем несколько значений 
   для каждой вершины в геометрии и морф или lerp (линейная интерполяция) 
   между ними. Morphtargets чаще всего используются для лицевой анимации 3D персонажей, но это не единственное их использование. 


Давайте попробуем morphtargets. 

Мы по-прежнему создадим геометрию для каждого набора данных, 
но затем мы извлечем атрибут позиции из каждого из них и будем использовать их как морфтинги. 


Сначала давайте изменим `addBoxes`, чтобы просто создать и вернуть объединенную геометрию. 

```js
-function addBoxes(file, hueRange) {
+function makeBoxes(file, hueRange) {
  const {min, max, data} = file;
  const range = max - min;
  
  ...

-  const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
-      geometries, false);
-  const material = new THREE.MeshBasicMaterial({
-    vertexColors: THREE.VertexColors,
-  });
-  const mesh = new THREE.Mesh(mergedGeometry, material);
-  scene.add(mesh);
-  return mesh;
+  return BufferGeometryUtils.mergeBufferGeometries(
+     geometries, false);
}
```

Здесь есть еще одна вещь, которую нам нужно сделать. Morphtargets требуются, чтобы у всех было точно одинаковое количество вершин.
Вершина # 123 в одной цели должна иметь соответствующую вершину # 123 во всех других целях. Но, поскольку сейчас 
разные наборы данных могут иметь некоторые точки данных без данных, поэтому для этой точки не будет сгенерировано ни одного блока, 
что означало бы отсутствие соответствующих вершин для другого набора. Итак, нам нужно проверить все наборы данных и либо всегда генерировать что-либо, если
в каком-либо наборе есть данные, либо ничего не генерировать, если в каком-либо наборе отсутствуют данные. Давайте сделаем последнее. 

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

Теперь мы изменим код, который вызывал `addBoxes`, для использования `makeBoxes` и установки morphtargets. 

```js
+// make geometry for each data set
+const geometries = fileInfos.map((info) => {
+  return makeBoxes(info.file, info.hueRange, fileInfos);
+});
+
+// use the first geometry as the base
+// and add all the geometries as morphtargets
+const baseGeometry = geometries[0];
+baseGeometry.morphAttributes.position = geometries.map((geometry, ndx) => {
+  const attribute = geometry.getAttribute('position');
+  const name = `target${ndx}`;
+  attribute.name = name;
+  return attribute;
+});
+const material = new THREE.MeshBasicMaterial({
+  vertexColors: THREE.VertexColors,
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
// show the first set of data
showFileInfo(fileInfos, fileInfos[0]);
```

Выше мы создаем геометрию для каждого набора данных, 
используем первый в качестве базы, затем получаем атрибут 
позиции из каждой геометрии и добавляем его в качестве морфтинга к базовой геометрии для позиции. 


Теперь нам нужно изменить способ отображения и скрытия различных наборов данных. 
Вместо того, чтобы показывать или скрывать меш, нам нужно изменить влияние морфтинга. Для набора данных, 
который мы хотим видеть, нам нужно иметь влияние 1, а для всех тех, которые мы не хотим видеть, нам нужно иметь влияние 0. 

Мы могли бы просто установить их в 0 или 1 напрямую, но если бы мы это сделали, мы бы не увидели никакой анимации,
она просто щелкала бы, что не отличалось бы от того, что у нас уже есть. Мы также могли бы написать некоторый пользовательский анимационный код, который был бы легок, 
но поскольку оригинальный глобус webgl использует
[библиотеку анимации](https://github.com/tweenjs/tween.js/) давайте используем тот же самый здесь.

Нам нужно включить библиотеку 

```js
import * as THREE from './resources/three/r119/build/three.module.js';
import {BufferGeometryUtils} from './resources/threejs/r119/examples/jsm/utils/BufferGeometryUtils.js';
import {OrbitControls} from './resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
+import {TWEEN} from './resources/threejs/r119/examples/jsm/libs/tween.min.js';
```

А затем создайте `Tween` чтобы оживить влияние.

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

Мы также предполагаем вызывать TWEEN.update каждый кадр в нашем цикле рендеринга, но это указывает на проблему. 
"tween.js" предназначен для непрерывного рендеринга, но мы делаем [рендеринг по требованию ](threejs-rendering-on-demand.html). 
Мы могли бы переключиться на непрерывный рендеринг, но иногда приятно рендерить только по требованию, так как он перестает использовать 
силу пользователя, когда ничего не происходит, поэтому давайте посмотрим, сможем ли мы сделать его анимированным по запросу. 

Мы сделаем `TweenManager`, чтобы помочь. Мы будем использовать его для создания 
`Tweens` и отслеживания их. Он будет иметь метод `update`, который будет 
возвращать true, если нам нужно будет вызвать его снова, и false, если все анимации завершены. 


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
    // create a new tween and install our own onComplete callback
    const tween = new TWEEN.Tween(targetObject).onComplete(function(...args) {
      self._handleComplete();
      userCompleteFn.call(this, ...args);
    });
    // replace the tween's onComplete function with our own
    // so we can call the user's callback if they supply one.
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

Чтобы использовать его, мы создадим один 

```js
function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
+  const tweenManager = new TweenManger();

  ...
```

Мы будем использовать его для создания наших `Tween`s.

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

Затем мы обновим наш цикл рендеринга, чтобы обновить анимацию и продолжать рендеринг, если анимация все еще выполняется. 
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

И с этим мы должны анимировать между наборами данных. 

{{{example url="../threejs-lots-of-objects-morphtargets.html" }}}

Кажется, это работает, но, к сожалению, мы потеряли цвета. 

Three.js не поддерживает цвета morphtarget, и на самом деле это проблема оригинального [шара webgl](https://github.com/dataarts/webgl-globe).
В основном это просто делает цвета для первого набора данных. Любые другие наборы данных используют те же цвета, даже если они сильно различаются. 

Давайте посмотрим, сможем ли мы добавить поддержку для изменения цвета.
Это может быть хрупким. Наименее хрупким способом, вероятно, было бы на 100% 
писать наши собственные шейдеры, но я думаю, что было бы полезно посмотреть, 
как модифицировать встроенные шейдеры. 


Первое, что нам нужно сделать, это сделать цвет выделения кода `BufferAttribute` из геометрии каждого набора данных. 


```js
// use the first geometry as the base
// and add all the geometries as morphtargets
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
+  attribute.name = `color${ndx}`;  // just for debugging
+  return {name, attribute};
+});
const material = new THREE.MeshBasicMaterial({
  vertexColors: THREE.VertexColors,
  morphTargets: true,
});
```

Затем нам нужно изменить шейдер three.js. Материалы Three.js имеют свойство `Material.onBeforeCompile`, 
которое мы можем назначить функции. Это дает нам возможность изменить шейдер материала до его передачи в WebGL. 
На самом деле предоставленный шейдер - это на самом деле специальный синтаксис с тремя шейдерами,
который содержит только три блока шейдеров, которые три.js заменит реальным кодом GLSL для каждого блока. 
Вот как выглядит код неизмененного вершинного шейдера, передаваемый в `onBeforeCompile`. 


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

Перебирая различные фрагменты, мы хотим заменить 
[`morphtarget_pars_vertex` блок](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/morphtarget_pars_vertex.glsl.js)
[`morphnormal_vertex` блок](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/morphnormal_vertex.glsl.js)
[`morphtarget_vertex` блок](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/morphtarget_vertex.glsl.js)
[`color_pars_vertex` блок](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/color_pars_vertex.glsl.js)
и [`color_vertex` блок](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/color_vertex.glsl.js)

Для этого мы сделаем простой массив замен и применим их в `Material.onBeforeCompile`. 

```js
const material = new THREE.MeshBasicMaterial({
  vertexColors: THREE.VertexColors,
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

Three.js также сортирует `morphtargets` и применяет только самые высокие влияния. 
Это позволяет разрешить гораздо больше целей морфинга, если одновременно используется только несколько.
Нам нужно выяснить, как он сортировал морф-цели, а затем установить соответствие наших цветовых атрибутов.
Мы можем сделать это, сначала удалив все наши цветовые атрибуты, а затем проверив атрибуты `morphTarget` и увидев,
какой `BufferAttribute` был назначен. Используя имя `BufferAttribute`, мы можем сказать, какой соответствующий атрибут цвета необходим. 


Сначала мы изменим имена атрибутов морфтаргет `BufferAttributes`, чтобы их было легче разобрать позже. 


```js
// use the first geometry as the base
// and add all the geometries as morphtargets
const baseGeometry = geometries[0];
baseGeometry.morphAttributes.position = geometries.map((geometry, ndx) => {
  const attribute = geometry.getAttribute('position');
-  const name = `target${ndx}`;
+  // put the number in front so we can more easily parse it later
+  const name = `${ndx}target`;
  attribute.name = name;
  return attribute;
});

```

Затем мы можем установить соответствующие атрибуты цвета в `Object3D.onBeforeRender`, 
который является свойством нашей сетки. Three.js вызовет его непосредственно перед рендерингом, 
что даст нам возможность исправить ситуацию. 


```js
const mesh = new THREE.Mesh(baseGeometry, material);
scene.add(mesh);
+mesh.onBeforeRender = function(renderer, scene, camera, geometry) {
+  // remove all the color attributes
+  for (const {name} of colorAttributes) {
+    geometry.deleteAttribute(name);
+  }
+
+  for (let i = 0; i < colorAttributes.length; ++i) {
+    const attrib = geometry.getAttribute(`morphTarget${i}`);
+    if (!attrib) {
+      break;
+    }
+    // The name will be something like "2target" as we named it above
+    // where 2 is the index of the data set
+    const ndx = parseInt(attrib.name);
+    const name = `morphColor${i}`;
+    geometry.setAttribute(name, colorAttributes[ndx].attribute);
+  }
+};
```

И с этим у нас должны быть оживляющие цвета так же как коробки. 

{{{example url="../threejs-lots-of-objects-morphtargets-w-colors.html" }}}

Я надеюсь, что пройти через это было полезно. Использование morphtargets либо через сервисы,
которые предоставляет three.js, либо путем написания пользовательских шейдеров - 
это распространенная техника для перемещения большого количества объектов. 
В качестве примера мы могли бы дать каждому кубу случайное место в другой цели и 
превратить его в свои первые позиции на земном шаре. Это может быть крутой способ представить миру. 


Далее вас может заинтересовать добавление ярлыков к глобусу, который описан в разделе. 
 [ «Выравнивание элементов HTML в 3D»](threejs-align-html-elements-to-3d.html).

Примечание: мы могли бы попытаться просто изобразить процент мужчин
или женщин или общую разницу, но основываясь на том, как мы отображаем 
информацию, кубы, которые растут с поверхности земли, мы бы предпочли, 
чтобы большинство кубов были низкими. Если бы мы использовали одно из 
этих других сравнений, то большинство кубов имели бы примерно половину
их максимальной высоты, что не давало бы хорошей визуализации. 
Не стесняйтесь изменить количество GreaterThan
с Math.max (a - b, 0) на что-то вроде (a - b) «сырой разницы» или a / (a ​​+ b) «процентов», и вы поймете, что я имею в виду. 

