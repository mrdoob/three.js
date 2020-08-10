Title: Three.js OffscreenCanvas
Description: Использование three.js в воркере
TOC: Использование OffscreenCanvas в воркере

[`OffscreenCanvas`](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
 - это относительно новая функция браузера, которая в настоящее время доступна только в Chrome,
 но, очевидно, будет доступна и в других браузерах. `OffscreenCanvas` позволяет веб-воркеру выполнять
 рендеринг на холст. Это способ переложить тяжелую работу, такую ​​как рендеринг сложной 3D-сцены, на веб-воркера, чтобы не замедлить скорость отклика браузера.
 Это также означает, что данные загружаются и анализируются в воркере, поэтому возможно меньше мусора во время загрузки страницы.

Начать использовать его довольно просто. Давайте разберём пример 3 вращающихся кубов из  [статьи об отзывчивости](threejs-responsive.html).

Обычно у рабочих есть свой код, разделенный в другой файл сценария. Для большинства примеров на этом сайте скрипты встроены в HTML-файл страницы, на которой они находятся.

В нашем случае мы создадим файл с именем `offscreencanvas-cubes.js` и скопируем в него весь JavaScript из [адаптивного примера](threejs-responsive.html). Затем мы внесем изменения, необходимые для его работы в воркере.


Нам все еще нужен JavaScript в нашем HTML-файле. Первое, что нам нужно сделать там, это найти холст,
а затем передать управление этим холстом за пределы экрана, вызвав `canvas.transferControlToOffscreen`.

```js
function main() {
  const canvas = document.querySelector('#c');
  const offscreen = canvas.transferControlToOffscreen();

  ...
```

Затем мы можем запустить наш воркер с  `new Worker(pathToScript, {type: 'module'})`.
и передать ему закадровый объект.


```js
function main() {
  const canvas = document.querySelector('#c');
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-cubes.js', {type: 'module'});
  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);
}
main();
```

Важно отметить, что воркеры не могут получить доступ к `DOM`. Они не могут просматривать элементы HTML, а также получать события мыши или клавиатуры. 
Единственное, что они обычно могут делать, - это отвечать на отправленные им сообщения.

Чтобы отправить сообщение воркеру, мы вызываем [`worker.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage) and
и передаем ему 1 или 2 аргумента. Первый аргумент - это объект JavaScript, который будет [клонирован](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) 
и отправлен исполнителю. Второй аргумент - это необязательный массив объектов, 
которые являются частью первого объекта, который мы хотим передать воркеру.
Эти объекты не будут клонированы. Вместо этого они будут перенесены и перестанут существовать на главной странице.
Прекращение существования - это, вероятно, неправильное описание, скорее они кастрированы.
Вместо клонирования можно передавать только определенные типы объектов.
Они включают `OffscreenCanvas`, поэтому после переноса закадрового объекта обратно на главную страницу он бесполезен.


Воркеры получают сообщения от своего обработчика сообщений `onmessage`. Объект, 
который мы передали в `postMessage`, прибывает в объект `event.data`, переданный 
обработчику `onmessage` на воркере. В приведенном выше коде объявляется `type: 'main' в объекте, который он передает воркеру. Мы создадим обработчик, 
который на основе типа будет вызывать другую функцию в воркере. Затем мы можем добавлять функции по мере необходимости и легко вызывать их с главной страницы.

```js
const handlers = {
  main,
};

self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (!fn) {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
```

Вы можете видеть выше, что мы просто ищем обработчик в зависимости от `type`, передаем ему `data`, которые были отправлены с главной страницы.

Итак, теперь нам просто нужно начать изменять основной файл, который мы вставили в `offscreencanvas-cubes.js` 
 [из адаптивной статьи](threejs-responsive.html).

Затем вместо того, чтобы искать холст в DOM, мы получим его из данных события.


```js
-function main() {
-  const canvas = document.querySelector('#c');
+function main(data) {
+  const {canvas} = data;
  const renderer = new THREE.WebGLRenderer({canvas});

  ...

```

Помня о том, что воркеры вообще не видят DOM, первая проблема, с которой мы сталкиваемся, -
`resizeRendererToDisplaySize` не может смотреть на `canvas.clientWidth` и `canvas.clientHeight`, поскольку это значения DOM. Вот исходный код

```js
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
```

Вместо этого нам нужно будет отправлять размеры по мере их изменения воркеру. Итак, давайте добавим некоторое глобальное состояние и сохраним там ширину и высоту.

```js
const state = {
  width: 300,  // canvas default
  height: 150,  // canvas default
};
```

Затем добавим обработчик `size` для обновления этих значений.

```js
+function size(data) {
+  state.width = data.width;
+  state.height = data.height;
+}

const handlers = {
  main,
+  size,
};
```

Теперь мы можем изменить `resizeRendererToDisplaySize`, чтобы использовать `state.width` и `state.height`.

```js
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
-  const width = canvas.clientWidth;
-  const height = canvas.clientHeight;
+  const width = state.width;
+  const height = state.height;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
```

и где мы вычисляем аспект, который нам нужен, аналогичные изменения

```js
function render(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
-    camera.aspect = canvas.clientWidth / canvas.clientHeight;
+    camera.aspect = state.width / state.height;
    camera.updateProjectionMatrix();
  }

  ...
```

Вернувшись на главную страницу, мы будем отправлять событие `size` каждый раз, когда страница меняет размер.

```js
const worker = new Worker('offscreencanvas-picking.js', {type: 'module'});
worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);

+function sendSize() {
+  worker.postMessage({
+    type: 'size',
+    width: canvas.clientWidth,
+    height: canvas.clientHeight,
+  });
+}
+
+window.addEventListener('resize', sendSize);
+sendSize();
```

Мы также вызываем его один раз, чтобы отправить начальный размер.

И всего с этими несколькими изменениями, если ваш браузер полностью 
поддерживает `OffscreenCanvas`, он должен работать. Прежде чем запустить его, 
давайте проверим, действительно ли браузер поддерживает `OffscreenCanvas`,
и не отобразит ли он ошибку. Сначала добавим HTML-код для отображения ошибки.


```html
<body>
  <canvas id="c"></canvas>
+  <div id="noOffscreenCanvas" style="display:none;">
+    <div>no OffscreenCanvas support</div>
+  </div>
</body>
```

и немного CSS для этого

```css
#noOffscreenCanvas {
    display: flex;
    width: 100vw;
    height: 100vh;
    align-items: center;
    justify-content: center;
    background: red;
    color: white;
}
```

а затем мы можем проверить наличие `transferControlToOffscreen`, чтобы узнать, поддерживает ли браузер `OffscreenCanvas`


```js
function main() {
  const canvas = document.querySelector('#c');
+  if (!canvas.transferControlToOffscreen) {
+    canvas.style.display = 'none';
+    document.querySelector('#noOffscreenCanvas').style.display = '';
+    return;
+  }
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-picking.js', {type: 'module});
  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);

  ...
```

и при этом, если ваш браузер поддерживает `OffscreenCanvas`, этот пример должен работать

{{{example url="../threejs-offscreencanvas.html" }}}

Так что это здорово, но поскольку не каждый браузер поддерживает `OffscreenCanvas` на данный момент,
давайте изменим код для работы с `OffscreenCanvas`, а если нет, то вернемся к использованию холста на главной странице, как обычно.


Кстати, если вам нужен OffscreenCanvas, чтобы ваша страница была отзывчивой, тогда неясно, 
в чем смысл использования запасного варианта. Возможно, в зависимости от того, выполняете ли 
вы в конечном итоге работу на главной странице или в воркере, вы можете настроить объем выполняемой работы так, 
чтобы при работе в воркере вы могли делать больше, чем при работе на главной странице. Что вы делаете, действительно зависит от вас.

Первое, что нам, вероятно, следует сделать, - это отделить код three.js от кода, 
специфичного для воркера. Что мы можем использовать один и тот же код как на главной странице, так и на рабочем. Другими словами, теперь у нас будет 3 файла


1. наш html файл.

   `threejs-offscreencanvas-w-fallback.html`

2. JavaScript, содержащий наш код three.js.

   `shared-cubes.js`

3. наш код поддержки воркера 

   `offscreencanvas-worker-cubes.js`

`shared-cubes.js` и `offscreencanvas-worker-cubes.js` по сути являются разделением нашего 
предыдущего файла `offscreencanvas-cubes.js`. Мы переименовали main в init, поскольку у нас уже есть main в нашем HTML-файле.

```js
import * as THREE from './resources/threejs/r119/build/three.module.js';

-const state = {
+export const state = {
  width: 300,   // canvas default
  height: 150,  // canvas default
};

-function main(data) {
+export function init(data) {
  const {canvas} = data;
  const renderer = new THREE.WebGLRenderer({canvas});
```

и вырезать только части, не относящиеся к three.js

```js
-function size(data) {
-  state.width = data.width;
-  state.height = data.height;
-}
-
-const handlers = {
-  main,
-  size,
-};
-
-self.onmessage = function(e) {
-  const fn = handlers[e.data.type];
-  if (!fn) {
-    throw new Error('no handler for type: ' + e.data.type);
-  }
-  fn(e.data);
-};
```

Затем мы копируем те части, которые мы только что удалили в `offscreencanvas-worker-cubes.js`.
и импорт `shared-cubes.js`, а также вызов `init` вместо `main`.

```js
import {init, state} from './shared-cubes.js';

function size(data) {
  state.width = data.width;
  state.height = data.height;
}

const handlers = {
-  main,
+  init,
  size,
};

self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (!fn) {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
```

Точно так же нам нужно включить three.js и `shared-cubes.js` на главную страницу.

```html
<script type="module">
+import {init, state} from './shared-cubes.js';
```
We can remove the HTML and CSS we added previously

```html
<body>
  <canvas id="c"></canvas>
-  <div id="noOffscreenCanvas" style="display:none;">
-    <div>no OffscreenCanvas support</div>
-  </div>
</body>
```

and some CSS for that

```css
-#noOffscreenCanvas {
-    display: flex;
-    width: 100vw;
-    height: 100vh;
-    align-items: center;
-    justify-content: center;
-    background: red;
-    color: white;
-}
```

Затем давайте изменим код на главной странице для вызова той или иной функции запуска в зависимости от того, поддерживает ли браузер `OffscreenCanvas`.


```js
function main() {
  const canvas = document.querySelector('#c');
-  if (!canvas.transferControlToOffscreen) {
-    canvas.style.display = 'none';
-    document.querySelector('#noOffscreenCanvas').style.display = '';
-    return;
-  }
-  const offscreen = canvas.transferControlToOffscreen();
-  const worker = new Worker('offscreencanvas-picking.js', {type: 'module'});
-  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);
+  if (canvas.transferControlToOffscreen) {
+    startWorker(canvas);
+  } else {
+    startMainPage(canvas);
+  }
  ...
```

Мы переместим весь код, который у нас был для настройки воркера, внутрь `startWorker`.

```js
function startWorker(canvas) {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-worker-cubes.js', {type: 'module'});
  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);

  function sendSize() {
    worker.postMessage({
      type: 'size',
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });
  }

  window.addEventListener('resize', sendSize);
  sendSize();

  console.log('using OffscreenCanvas');
}
```

и отправить `init` вместо `main`

```js
-  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);
+  worker.postMessage({type: 'init', canvas: offscreen}, [offscreen]);
```

для начала на главной странице мы можем сделать это

```js
function startMainPage(canvas) {
  init({canvas});

  function sendSize() {
    state.width = canvas.clientWidth;
    state.height = canvas.clientHeight;
  }
  window.addEventListener('resize', sendSize);
  sendSize();

  console.log('using regular canvas');
}
```

и с этим наш пример будет запускаться либо в `OffscreenCanvas`, либо в качестве альтернативы запуску на главной странице.


{{{example url="../threejs-offscreencanvas-w-fallback.html" }}}

Так что это было относительно легко. Попробуем поковырять.
Мы возьмем код из примера RayCaster из  и  [статьи о выборе](threejs-picking.html)
заставим его работать за экраном.

Давайте скопируем `shared-cube.js` в `shared-picking.js` и добавим части выбора. Копируем в `PickHelper`


```js
class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      // save its color
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // set its emissive color to flashing red/yellow
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }
  }
}

const pickPosition = {x: 0, y: 0};
const pickHelper = new PickHelper();
```

Мы обновили `pickPosition` с помощью мыши вот так

```js
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
window.addEventListener('mousemove', setPickPosition);
```

Воркер не может напрямую считывать положение мыши, поэтому, как и код размера, давайте отправим сообщение с указанием положения мыши. 
Как и код размера, мы отправим позицию мыши и обновим `pickPosition`

```js
function size(data) {
  state.width = data.width;
  state.height = data.height;
}

+function mouse(data) {
+  pickPosition.x = data.x;
+  pickPosition.y = data.y;
+}

const handlers = {
  init,
+  mouse,
  size,
};

self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (!fn) {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
```

Вернувшись на нашу главную страницу, нам нужно добавить код, чтобы передать мышь воркеру или главной странице.

```js
+let sendMouse;

function startWorker(canvas) {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-worker-picking.js', {type: 'module'});
  worker.postMessage({type: 'init', canvas: offscreen}, [offscreen]);

+  sendMouse = (x, y) => {
+    worker.postMessage({
+      type: 'mouse',
+      x,
+      y,
+    });
+  };

  function sendSize() {
    worker.postMessage({
      type: 'size',
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });
  }

  window.addEventListener('resize', sendSize);
  sendSize();

  console.log('using OffscreenCanvas');  /* eslint-disable-line no-console */
}

function startMainPage(canvas) {
  init({canvas});

+  sendMouse = (x, y) => {
+    pickPosition.x = x;
+    pickPosition.y = y;
+  };

  function sendSize() {
    state.width = canvas.clientWidth;
    state.height = canvas.clientHeight;
  }
  window.addEventListener('resize', sendSize);
  sendSize();

  console.log('using regular canvas');  /* eslint-disable-line no-console */
}

```

Затем мы можем скопировать весь код обработки мыши на главную страницу и внести незначительные изменения, чтобы использовать `sendMouse`.


```js
function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
-  pickPosition.x = (pos.x / canvas.clientWidth ) *  2 - 1;
-  pickPosition.y = (pos.y / canvas.clientHeight) * -2 + 1;  // note we flip Y
+  sendMouse(
+      (pos.x / canvas.clientWidth ) *  2 - 1,
+      (pos.y / canvas.clientHeight) * -2 + 1);  // note we flip Y
}

function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
-  pickPosition.x = -100000;
-  pickPosition.y = -100000;
+  sendMouse(-100000, -100000);
}
window.addEventListener('mousemove', setPickPosition);
window.addEventListener('mouseout', clearPickPosition);
window.addEventListener('mouseleave', clearPickPosition);

window.addEventListener('touchstart', (event) => {
  // prevent the window from scrolling
  event.preventDefault();
  setPickPosition(event.touches[0]);
}, {passive: false});

window.addEventListener('touchmove', (event) => {
  setPickPosition(event.touches[0]);
});

window.addEventListener('touchend', clearPickPosition);
```

и с этим выбором следует работать с `OffscreenCanvas`.

{{{example url="../threejs-offscreencanvas-w-picking.html" }}}

Сделаем еще один шаг и добавим `OrbitControls`. Это будет немного больше.
`OrbitControls` довольно широко используют DOM для проверки мыши, событий касания и клавиатуры.


В отличие от нашего кода, мы не можем использовать объект глобального `state`, не переписав весь код `OrbitControls` для работы с ним. `OrbitControls` принимают элемент, к которому они присоединяют большинство используемых ими событий DOM. Возможно, мы могли бы передать наш собственный объект, имеющий ту же поверхность API, что и элемент DOM. Нам нужно только поддерживать функции, которые необходимы `OrbitControls`.

Копаясь в  [исходном коде OrbitControls](https://github.com/gfxfundamentals/threejsfundamentals/blob/master/threejs/resources/threejs/r119/examples/js/controls/OrbitControls.js)
похоже, что нам нужно обработать следующие события.


* contextmenu
* mousedown
* mousemove
* mouseup
* touchstart
* touchmove
* touchend
* wheel
* keydown

Для событий мыши нам нужны свойства  `ctrlKey`, `metaKey`, `shiftKey`, 
`button`, `clientX`, `clientY`, `pageX`, и `pageY`.

Для событий нажатия клавиатуры нам нужны свойства  `ctrlKey`, `metaKey`, `shiftKey`, 
и `keyCode`.

Для события wheel нам нужно только свойство `deltaY`

А для событий касания нам понадобятся только `pageX` и `pageY` из свойства `touches`.


Итак, создадим пару прокси-объектов. Одна часть будет работать на главной странице, получать все эти события и передавать соответствующие значения свойств воркеру. Другая часть будет запускаться в воркере, получать эти события и передавать их, используя события, которые имеют ту же структуру, что и исходные события DOM, поэтому `OrbitControls` не сможет определить разницу.

Вот код рабочей части.

```js
import {EventDispatcher} from './resources/threejs/r119/build/three.module.js';

class ElementProxyReceiver extends EventDispatcher {
  constructor() {
    super();
  }
  handleEvent(data) {
    this.dispatchEvent(data);
  }
}
```

Все, что он делает, - это если он получает сообщение, то отправляет его. Он наследуется от `EventDispatcher`, который предоставляет такие методы, как `addEventListener` и `removeEventListener`, точно так же, как элемент DOM, поэтому, если мы передадим его в `OrbitControls`, он должен работать.

`ElementProxyReceiver` обрабатывает 1 элемент. В нашем случае нам нужен только один, но лучше думать головой, так что давайте заставим менеджера управлять более чем одним из них.

```js
class ProxyManager {
  constructor() {
    this.targets = {};
    this.handleEvent = this.handleEvent.bind(this);
  }
  makeProxy(data) {
    const {id} = data;
    const proxy = new ElementProxyReceiver();
    this.targets[id] = proxy;
  }
  getProxy(id) {
    return this.targets[id];
  }
  handleEvent(data) {
    this.targets[data.id].handleEvent(data.data);
  }
}
```

Мы можем создать экземпляр `ProxyManager` и вызвать его метод makeProxy с идентификатором, который создаст `ElementProxyReceiver`, который будет отвечать на сообщения с этим идентификатором.


Давайте подключим его к обработчику сообщений нашего воркера.

```js
const proxyManager = new ProxyManager();

function start(data) {
  const proxy = proxyManager.getProxy(data.canvasId);
  init({
    canvas: data.canvas,
    inputElement: proxy,
  });
}

function makeProxy(data) {
  proxyManager.makeProxy(data);
}

...

const handlers = {
-  init,
-  mouse,
+  start,
+  makeProxy,
+  event: proxyManager.handleEvent,
   size,
};

self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (!fn) {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
```

Нам также нужно добавить `OrbitControls` в начало скрипта.

```js
import * as THREE from './resources/threejs/r119/build/three.module.js';
+import {OrbitControls} from './resources/threejs/r119/examples/jsm/controls/OrbitControls.js';

export function init(data) {
-  const {canvas} = data;
+  const {canvas, inputElement} = data;
  const renderer = new THREE.WebGLRenderer({canvas});

+  const controls = new OrbitControls(camera, inputElement);
+  controls.target.set(0, 0, 0);
+  controls.update();
```

Обратите внимание, что мы передаем `OrbitControls` нашему прокси через `inputElement` вместо передачи холста, как в других примерах, отличных от `OffscreenCanvas`.


Затем мы можем переместить весь код события выбора из файла HTML в общий код three.js, а также изменить `canvas` на `inputElement`.


```js
function getCanvasRelativePosition(event) {
-  const rect = canvas.getBoundingClientRect();
+  const rect = inputElement.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
-  sendMouse(
-      (pos.x / canvas.clientWidth ) *  2 - 1,
-      (pos.y / canvas.clientHeight) * -2 + 1);  // note we flip Y
+  pickPosition.x = (pos.x / inputElement.clientWidth ) *  2 - 1;
+  pickPosition.y = (pos.y / inputElement.clientHeight) * -2 + 1;  // note we flip Y
}

function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
-  sendMouse(-100000, -100000);
+  pickPosition.x = -100000;
+  pickPosition.y = -100000;
}

*inputElement.addEventListener('mousemove', setPickPosition);
*inputElement.addEventListener('mouseout', clearPickPosition);
*inputElement.addEventListener('mouseleave', clearPickPosition);

*inputElement.addEventListener('touchstart', (event) => {
  // prevent the window from scrolling
  event.preventDefault();
  setPickPosition(event.touches[0]);
}, {passive: false});

*inputElement.addEventListener('touchmove', (event) => {
  setPickPosition(event.touches[0]);
});

*inputElement.addEventListener('touchend', clearPickPosition);
```

Вернувшись на главную страницу, нам нужен код для отправки сообщений для всех событий, которые мы перечислили выше.


```js
let nextProxyId = 0;
class ElementProxy {
  constructor(element, worker, eventHandlers) {
    this.id = nextProxyId++;
    this.worker = worker;
    const sendEvent = (data) => {
      this.worker.postMessage({
        type: 'event',
        id: this.id,
        data,
      });
    };

    // register an id
    worker.postMessage({
      type: 'makeProxy',
      id: this.id,
    });
    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      element.addEventListener(eventName, function(event) {
        handler(event, sendEvent);
      });
    }
  }
}
```

`ElementProxy` берет элемент, события которого мы хотим проксировать. Затем он регистрирует идентификатор у воркера, выбирая его и отправляя через сообщение `makeProxy`, которое мы настроили ранее. Рабочий создаст `ElementProxyReceiver` и зарегистрирует его для этого идентификатора.

Затем у нас есть объект обработчиков событий для регистрации. Таким образом, мы можем передавать обработчики только тех событий, которые мы хотим переслать воркеру.

Когда мы запускаем воркер, мы сначала создаем прокси и передаем наши обработчики событий.

```js
function startWorker(canvas) {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-worker-orbitcontrols.js', {type: 'module'});

+  const eventHandlers = {
+    contextmenu: preventDefaultHandler,
+    mousedown: mouseEventHandler,
+    mousemove: mouseEventHandler,
+    mouseup: mouseEventHandler,
+    touchstart: touchEventHandler,
+    touchmove: touchEventHandler,
+    touchend: touchEventHandler,
+    wheel: wheelEventHandler,
+    keydown: filteredKeydownEventHandler,
+  };
+  const proxy = new ElementProxy(canvas, worker, eventHandlers);
  worker.postMessage({
    type: 'start',
    canvas: offscreen,
+    canvasId: proxy.id,
  }, [offscreen]);
  console.log('using OffscreenCanvas');  /* eslint-disable-line no-console */
}
```

А вот и обработчики событий. Все, что они делают, - это копируют список свойств из полученного события. Им передается функция `sendEvent`, в которую они передают созданные данные. Эта функция добавит правильный идентификатор и отправит его воркеру.

```js
const mouseEventHandler = makeSendPropertiesHandler([
  'ctrlKey',
  'metaKey',
  'shiftKey',
  'button',
  'clientX',
  'clientY',
  'pageX',
  'pageY',
]);
const wheelEventHandlerImpl = makeSendPropertiesHandler([
  'deltaX',
  'deltaY',
]);
const keydownEventHandler = makeSendPropertiesHandler([
  'ctrlKey',
  'metaKey',
  'shiftKey',
  'keyCode',
]);

function wheelEventHandler(event, sendFn) {
  event.preventDefault();
  wheelEventHandlerImpl(event, sendFn);
}

function preventDefaultHandler(event) {
  event.preventDefault();
}

function copyProperties(src, properties, dst) {
  for (const name of properties) {
      dst[name] = src[name];
  }
}

function makeSendPropertiesHandler(properties) {
  return function sendProperties(event, sendFn) {
    const data = {type: event.type};
    copyProperties(event, properties, data);
    sendFn(data);
  };
}

function touchEventHandler(event, sendFn) {
  const touches = [];
  const data = {type: event.type, touches};
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i];
    touches.push({
      pageX: touch.pageX,
      pageY: touch.pageY,
    });
  }
  sendFn(data);
}

// The four arrow keys
const orbitKeys = {
  '37': true,  // left
  '38': true,  // up
  '39': true,  // right
  '40': true,  // down
};
function filteredKeydownEventHandler(event, sendFn) {
  const {keyCode} = event;
  if (orbitKeys[keyCode]) {
    event.preventDefault();
    keydownEventHandler(event, sendFn);
  }
}
```

Это кажется близким к запуску, но если мы действительно попробуем, то увидим, что `OrbitControls` нужно еще кое-что.

Один из них - `element.focus`. Нам не нужно, чтобы это происходило в воркере, поэтому давайте просто добавим заглушку.


```js
class ElementProxyReceiver extends THREE.EventDispatcher {
  constructor() {
    super();
  }
  handleEvent(data) {
    this.dispatchEvent(data);
  }
+  focus() {
+    // no-op
+  }
}
```

Другой - они вызывают `event.preventDefault` и `event.stopPropagation`. Мы уже обрабатываем это на главной странице, так что это тоже может быть пустышкой.


```js
+function noop() {
+}

class ElementProxyReceiver extends THREE.EventDispatcher {
  constructor() {
    super();
  }
  handleEvent(data) {
+    data.preventDefault = noop;
+    data.stopPropagation = noop;
    this.dispatchEvent(data);
  }
  focus() {
    // no-op
  }
}
```

Другой - они смотрят на `clientWidth` и `clientHeight`. Раньше мы передавали размер, но мы можем обновить пару прокси, чтобы передать его.


В воркере...

```js
class ElementProxyReceiver extends THREE.EventDispatcher {
  constructor() {
    super();
  }
+  get clientWidth() {
+    return this.width;
+  }
+  get clientHeight() {
+    return this.height;
+  }
+  getBoundingClientRect() {
+    return {
+      left: this.left,
+      top: this.top,
+      width: this.width,
+      height: this.height,
+      right: this.left + this.width,
+      bottom: this.top + this.height,
+    };
+  }
  handleEvent(data) {
+    if (data.type === 'size') {
+      this.left = data.left;
+      this.top = data.top;
+      this.width = data.width;
+      this.height = data.height;
+      return;
+    }
    data.preventDefault = noop;
    data.stopPropagation = noop;
    this.dispatchEvent(data);
  }
  focus() {
    // no-op
  }
}
```

обратно на главную страницу нам нужно отправить размер, а также левую и верхнюю позиции. Обратите внимание, что мы не обрабатываем перемещение холста, только если оно меняет размер. Если вы хотите обрабатывать перемещение, вам нужно будет вызывать `sendSize` каждый раз, когда что-то перемещает холст.


```js
class ElementProxy {
  constructor(element, worker, eventHandlers) {
    this.id = nextProxyId++;
    this.worker = worker;
    const sendEvent = (data) => {
      this.worker.postMessage({
        type: 'event',
        id: this.id,
        data,
      });
    };

    // register an id
    worker.postMessage({
      type: 'makeProxy',
      id: this.id,
    });
+    sendSize();
    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      element.addEventListener(eventName, function(event) {
        handler(event, sendEvent);
      });
    }

+    function sendSize() {
+      const rect = element.getBoundingClientRect();
+      sendEvent({
+        type: 'size',
+        left: rect.left,
+        top: rect.top,
+        width: element.clientWidth,
+        height: element.clientHeight,
+      });
+    }
+
+    window.addEventListener('resize', sendSize);
  }
}
```

и в нашем общем коде three.js нам больше не нужно `state`

```js
-export const state = {
-  width: 300,   // canvas default
-  height: 150,  // canvas default
-};

...

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
-  const width = state.width;
-  const height = state.height;
+  const width = inputElement.clientWidth;
+  const height = inputElement.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function render(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
-    camera.aspect = state.width / state.height;
+    camera.aspect = inputElement.clientWidth / inputElement.clientHeight;
    camera.updateProjectionMatrix();
  }

  ...
```


Еще несколько приемов. `OrbitControls` добавляют события `mousemove` и `mouseup` в `ownerDocument` элемента для обработки захвата мыши (когда мышь выходит за пределы окна).

Далее код ссылается на глобальный `document`, но в воркере нет глобального документа.

Мы можем решить все это с помощью 2 быстрых приемов. В нашем рабочем коде мы повторно используем прокси для обеих задач

```js
function start(data) {
  const proxy = proxyManager.getProxy(data.canvasId);
+  proxy.ownerDocument = proxy; // HACK!
+  self.document = {} // HACK!
  init({
    canvas: data.canvas,
    inputElement: proxy,
  });
}
```

Это даст `OrbitControls` возможность проверить, что соответствует их ожиданиям.

Я знаю, что это было довольно сложно. Краткая версия:` ElementProxy` запускается на главной странице и пересылает события DOM в `ElementProxyReceiver`
в воркере, который маскируется под `HTMLElement`, который мы можем использовать как с `OrbitControls`, так и с нашим собственным кодом.

И последнее - это наш запасной вариант, когда мы не используем OffscreenCanvas. Все, что нам нужно сделать, это передать сам холст как наш `inputElement`.

```js
function startMainPage(canvas) {
-  init({canvas});
+  init({canvas, inputElement: canvas});
  console.log('using regular canvas');
}
```

и теперь у нас должен быть OrbitControls, работающий с OffscreenCanvas

{{{example url="../threejs-offscreencanvas-w-orbitcontrols.html" }}}

Это, наверное, самый сложный пример на этом сайте. 
Это немного сложно понять, потому что для каждого образца задействовано 3 файла. HTML-файл, рабочий файл, общий код three.js.

Я надеюсь, что это было не так уж сложно понять, и что он предоставил несколько полезных примеров работы с three.js, OffscreenCanvas и веб-воркерами.
