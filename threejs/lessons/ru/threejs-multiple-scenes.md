Title: Three.js - Несколько холстов и Несколько сцен
Description: Kак рисовать на всей web-странице с THREE.js
TOC: Несколько холстов, несколько сцен

Допустим, вы хотите создать сайт электронной коммерции или сделать 
страницу с множеством трехмерных диаграмм. На первый взгляд все 
выглядит просто. Просто сделайте холст для каждой диаграммы. 
Для каждого холста сделайте `Renderer`.

Вы быстро обнаружите, что у вас возникли проблемы.

1. Браузер ограничивает количество контекстов WebGL, которые вы можете иметь.

   Обычно этот предел составляет около 8. 
   Как только вы создадите 9-й контекст, самый старый будет потерян.

2. Ресурсы WebGL не могут быть разделены между контекстами (no shared memory)

   Это означает, что если вы хотите загрузить 10-мегабайтную модель в 2 полотна, 
   и эта модель использует 20 мегабайт текстур, ваша 10-мегабайтная модель должна 
   быть загружена дважды, а ваши текстуры также будут загружены дважды. Ничто не 
   может быть разделено между контекстами. Это также означает, что вещи должны 
   быть инициализированы дважды, шейдеры скомпилированы дважды и т.д. Всё 
   ухудшается, когда появляется больше холстов.

Так в чем же решение?

Решением является один холст, который заполняет область просмотра в фоновом режиме 
и некоторый другой элемент для представления каждого «виртуального» холста.
Мы делаем один `Renderer` и затем одну `Scene` для каждого виртуального холста. 
Затем мы проверим положение элементов виртуального холста и, если они будут на 
экране, мы скажем THREE.js нарисовать их сцену в правильном месте.

С этим решением есть только 1 холст, поэтому мы решаем обе задачи 1 и 2 выше. 
Мы не будем сталкиваться с ограничением контекста WebGL, потому что мы будем 
использовать только один контекст. Мы также не будем сталкиваться с проблемами 
обмена по тем же причинам.

Давайте начнем с простого примера с двумя сценами. Сначала мы сделаем HTML

```html
<canvas id="c">шутки про three js</canvas>
<p>
  <span id="box" class="diagram left"></span>
  Я люблю коробки (boxes). Подарки приходят в коробках.
  Когда я нахожу новую коробку, я всегда рад узнать, что внутри.
</p>
<p>
  <span id="pyramid" class="diagram right"></span>
    Когда я был ребенком, я мечтал отправиться в экспедицию внутри пирамиды (pyramid).
    и найти неоткрытую гробницу, полную мумий и сокровищ.
</p>
```

Затем мы можем настроить CSS, как-то так

```css
#c {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  display: block;
  z-index: -1;
}
.diagram {
  display: inline-block;
  width: 5em;
  height: 3em;
  border: 1px solid black;
}
.left {
  float: left;
  margin-right: .25em;
}
.right {
  float: right;
  margin-left: .25em;
}
```

Мы устанавливаем холст, чтобы заполнить экран, и мы устанавливаем `z-index` = 
-1 , чтобы он появлялся позади других элементов. Нам также нужно указать некоторую 
ширину и высоту для наших виртуальных элементов холста, поскольку внутри 
нет ничего, что могло бы придать им какой-либо размер.

Теперь мы сделаем 2 сцены с подсветкой и камерой. 
К одной сцене мы добавим куб, а к другой ромб.

```js
function makeScene(elem) {
  const scene = new THREE.Scene();

  const fov = 45;
  const aspect = 2;  // по умолчанию для холста
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;
  camera.position.set(0, 1, 2);
  camera.lookAt(0, 0, 0);

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  return {scene, camera, elem};
}

function setupScene1() {
  const sceneInfo = makeScene(document.querySelector('#box'));
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({color: 'red'});
  const mesh = new THREE.Mesh(geometry, material);
  sceneInfo.scene.add(mesh);
  sceneInfo.mesh = mesh;
  return sceneInfo;
}

function setupScene2() {
  const sceneInfo = makeScene(document.querySelector('#pyramid'));
  const radius = .8;
  const widthSegments = 4;
  const heightSegments = 2;
  const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
  const material = new THREE.MeshPhongMaterial({
    color: 'blue',
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  sceneInfo.scene.add(mesh);
  sceneInfo.mesh = mesh;
  return sceneInfo;
}

const sceneInfo1 = setupScene1();
const sceneInfo2 = setupScene2();
```

И тогда мы сделаем функцию для рендеринга каждой сцены, только если элемент 
находится на экране. Мы можем указать THREE.js визуализировать только часть 
холста, включив тест *scissor* через `Renderer.setScissorTest`, затем установим 
плоскость обрезания и область просмотра (Viewport) с помощью 
`Renderer.setViewport` и `Renderer.setScissor`.

```js
function renderSceneInfo(sceneInfo) {
  const {scene, camera, elem} = sceneInfo;

  // получаем относительную позицию окна просмотра этого элемента
  const {left, right, top, bottom, width, height} =
      elem.getBoundingClientRect();

  const isOffscreen =
      bottom < 0 ||
      top > renderer.domElement.clientHeight ||
      right < 0 ||
      left > renderer.domElement.clientWidth;

  if (isOffscreen) {
    return;
  }

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);

  renderer.render(scene, camera);
}
```

И тогда наша функция рендеринга просто сначала очистит экран, 
а затем отрисует каждую сцену.

```js
function render(time) {
  time *= 0.001;

  resizeRendererToDisplaySize(renderer);

  renderer.setScissorTest(false);
  renderer.clear(true, true);
  renderer.setScissorTest(true);

  sceneInfo1.mesh.rotation.y = time * .1;
  sceneInfo2.mesh.rotation.y = time * .1;

  renderSceneInfo(sceneInfo1);
  renderSceneInfo(sceneInfo2);

  requestAnimationFrame(render);
}
```

И вот оно

{{{example url="../threejs-multiple-scenes-v1.html" }}}

Вы можете увидеть, где на первом месте `<span>` находится красный куб, 
а на втором `span` - синий ромб.

## Синхронизация

Код выше работает, но есть одна небольшая проблема. 
Если ваши сцены сложные или по какой-либо причине требуется 
слишком много времени для рендеринга, положение сцен, 
нарисованных на холсте, будет отставать от остальной части страницы.

Если мы дадим каждой области границу

```css
.diagram {
  display: inline-block;
  width: 5em;
  height: 3em;
+  border: 1px solid black;
}
```

И устанавливаем фон каждой сцены

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color('red');
```

И если мы <a href="../threejs-multiple-scenes-v2.html" target="_blank">быстро прокрутим вверх и вниз</a> 
мы увидим проблему. Вот анимация прокрутки, замедленная в 10 раз.

<div class="threejs_center"><img class="border" src="resources/images/multi-view-skew.gif"></div>

Мы можем использовать другой метод, который имеет другой компромисс. 
Мы переключим CSS холста с `position: fixed` на `position: absolute`. 

```css
#c {
-  position: fixed;
+  position: absolute;
```

Затем мы установим преобразование (transform) холста, чтобы переместить его так, 
чтобы верх холста находился в верхней части любой части, 
на которую в данный момент прокручивается страница.

```js
function render(time) {
  ...

  const transform = `translateY(${window.scrollY}px)`;
  renderer.domElement.style.transform = transform;

```

`position: fixed` удерживает холст от прокрутки вообще, 
в то время как остальная часть страницы прокручивалась поверх него. 
`position: absolute` позволит холсту прокручиваться с остальной частью 
страницы, что означает, что все, что мы рисуем, будет прилипать 
к странице, когда она прокручивается, даже если мы слишком медленны 
для рендеринга. Когда мы наконец получаем возможность 
рендеринга, мы перемещаем холст так, чтобы он соответствовал 
месту прокрутки страницы, и затем мы повторно визуализируем. 
Это означает, что только на краях окна будут отображаться некоторые не визуализированные биты, но
<a href="../threejs-multiple-scenes-v2.html" target="_blank"> материал в середине страницы должен совпадать</a>, 
а не скользить. Вот представление результатов нового метода, замедленного в 10 раз.
<div class="threejs_center"><img class="border" src="resources/images/multi-view-fixed.gif"></div>

## Делаем это более универсальным

Теперь, когда у нас работает несколько сцен, давайте сделаем это немного более обобщенным.

Мы могли бы сделать так, чтобы основная функция рендеринга, управляющая холстом, просто имела 
список элементов и связанную с ними функцию рендеринга. Для каждого элемента он проверяет, 
находится ли элемент на экране, и, если это так, вызывает соответствующую функцию рендеринга. 
Таким образом, у нас была бы общая система, в которой отдельные сцены на самом деле не знают, 
что знают, что их визуализируют в каком-то меньшем пространстве.

Вот основная функция отрисовки

```js
const sceneElements = [];
function addScene(elem, fn) {
  sceneElements.push({elem, fn});
}

function render(time) {
  time *= 0.001;

  resizeRendererToDisplaySize(renderer);

  renderer.setScissorTest(false);
  renderer.setClearColor(clearColor, 0);
  renderer.clear(true, true);
  renderer.setScissorTest(true);

  const transform = `translateY(${window.scrollY}px)`;
  renderer.domElement.style.transform = transform;

  for (const {elem, fn} of sceneElements) {
    // получаем относительную позицию окна просмотра этого элемента
    const rect = elem.getBoundingClientRect();
    const {left, right, top, bottom, width, height} = rect;

    const isOffscreen =
        bottom < 0 ||
        top > renderer.domElement.clientHeight ||
        right < 0 ||
        left > renderer.domElement.clientWidth;

    if (!isOffscreen) {
      const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
      renderer.setScissor(left, positiveYUpBottom, width, height);
      renderer.setViewport(left, positiveYUpBottom, width, height);

      fn(time, rect);
    }
  }

  requestAnimationFrame(render);
}
```

Вы можете видеть, что он зацикливается на массиве объектов `sceneElements`, 
каждый из которых имеет свойство `elem` и `fn`.

Он проверяет, находится ли элемент на экране. Если это так, то он вызывает `fn`
и передает ему текущее время и его прямоугольник.

Теперь установочный код для каждой сцены просто добавляет себя в список сцен

```js
{
  const elem = document.querySelector('#box');
  const {scene, camera} = makeScene();
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({color: 'red'});
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  addScene(elem, (time, rect) => {
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    mesh.rotation.y = time * .1;
    renderer.render(scene, camera);
  });
}

{
  const elem = document.querySelector('#pyramid');
  const {scene, camera} = makeScene();
  const radius = .8;
  const widthSegments = 4;
  const heightSegments = 2;
  const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
  const material = new THREE.MeshPhongMaterial({
    color: 'blue',
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  addScene(elem, (time, rect) => {
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    mesh.rotation.y = time * .1;
    renderer.render(scene, camera);
  });
}
```

При этом нам больше не нужно `sceneInfo1` и `sceneInfo2`. 
Код, который вращал меши, теперь специфичен для каждой сцены.

{{{example url="../threejs-multiple-scenes-generic.html" }}}

## Использование набора данных в HTML

Еще одна, еще более общая вещь, которую мы можем сделать, это использовать 
[dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset). 
Это способ добавить свои собственные данные в элемент HTML. Вместо использования `id="..."` 
мы будем использовать `data-diagram="..."` как тут
```html
<canvas id="c"></canvas>
<p>
-  <span id="box" class="diagram left"></span>
+  <span data-diagram="box" class="left"></span>
  Я люблю коробки (boxes). Подарки приходят в коробках.
  Когда я нахожу новую коробку, я всегда рад узнать, что внутри.
</p>
<p>
-  <span id="pyramid" class="diagram left"></span>
+  <span data-diagram="pyramid" class="right"></span>
   Когда я был ребенком, я мечтал отправиться в экспедицию внутри пирамиды (pyramid).
   и найти неоткрытую гробницу, полную мумий и сокровищ.
</p>
```

Мы можем их изменить селектор CSS, чтобы выбрать для этого

```css
-.diagram
+*[data-diagram] {
  display: inline-block;
  width: 5em;
  height: 3em;
}
```

Мы изменим код установки сцены, чтобы он представлял собой карту имен для *функций инициализации сцены* 
, которые возвращают функцию *отрисовки сцены*.

```js
const sceneInitFunctionsByName = {
  'box': () => {
    const {scene, camera} = makeScene();
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({color: 'red'});
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
  },
  'pyramid': () => {
    const {scene, camera} = makeScene();
    const radius = .8;
    const widthSegments = 4;
    const heightSegments = 2;
    const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshPhongMaterial({
      color: 'blue',
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
  },
};
```

И для инициализации мы можем просто использовать `querySelectorAll`, 
чтобы найти все диаграммы и вызвать соответствующую функцию инициализации для этой диаграммы.

```js
document.querySelectorAll('[data-diagram]').forEach((elem) => {
  const sceneName = elem.dataset.diagram;
  const sceneInitFunction = sceneInitFunctionsByName[sceneName];
  const sceneRenderFunction = sceneInitFunction(elem);
  addScene(elem, sceneRenderFunction());
});
```

Никаких изменений в визуальных элементах, но код легче переиспользовать.

{{{examples url="../threejs-multiple-scenes-selector.html" }}}

## Добавление элементов управления к каждому элементу

Например, добавление `TrackballControls` в интерактивном режиме так же просто. 
Сначала мы добавляем скрипт для контролов.

```js
import {TrackballControls} from './resources/threejs/r114/examples/jsm/controls/TrackballControls.js';
```

И затем мы можем добавить `TrackballControls` к каждой сцене, передавая элемент, связанный с этой сценой.

```js
-function makeScene() {
+function makeScene(elem) {
  const scene = new THREE.Scene();

  const fov = 45;
  const aspect = 2;  // по умолчанию для canvas
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 1, 2);
  camera.lookAt(0, 0, 0);
+  scene.add(camera);

+  const controls = new TrackballControls(camera, elem);
+  controls.noZoom = true;
+  controls.noPan = true;

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
-    scene.add(light);
+    camera.add(light);
  }

-  return {scene, camera};
+ return {scene, camera, controls};
}
```

Вы заметите, что мы добавили камеру на сцену и свет на камеру. Это делает свет 
относительно камеры. Поскольку `TrackballControls` двигает камеру, 
это, вероятно, то, что мы хотим. Он сохраняет свет, 
сияющий на стороне объекта, на который мы смотрим.

Нам нужно обновить эти элементы управления в наших функциях отрисовки

```js
const sceneInitFunctionsByName = {
- 'box': () => {
-    const {scene, camera} = makeScene();
+ 'box': (elem) => {
+    const {scene, camera, controls} = makeScene(elem);
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({color: 'red'});
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
+      controls.handleResize();
+      controls.update();
      renderer.render(scene, camera);
    };
  },
-  'pyramid': () => {
-    const {scene, camera} = makeScene();
+  'pyramid': (elem) => {
+    const {scene, camera, controls} = makeScene(elem);
    const radius = .8;
    const widthSegments = 4;
    const heightSegments = 2;
    const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshPhongMaterial({
      color: 'blue',
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
+      controls.handleResize();
+      controls.update();
      renderer.render(scene, camera);
    };
  },
};
```

Теперь, если вы перетащите объекты, они будут вращаться.

{{{examples url="../threejs-multiple-scenes-controls.html" }}}

Эти методы используются на самом сайте. В частности, 
[статья о примитивах](threejs-primitives.html) и [о материалах](threejs-materials.html) 
используют эту технику для добавления различных примеров по всей статье.