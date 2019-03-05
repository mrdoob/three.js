Title: Three.js - Камера
Description: Как использовать камеру в Three.js

Эта статья является частью серии статей о three.js. 
Первая была [об основах](threejs-fundamentals.html).
Если вы её еще не читали, советую вам сделать это.

Давайте поговорим о камерах в three.js. Мы рассмотрели некоторые из них в [первой статье](threejs-fundamentals.html) 
, но мы расскажем здесь об этом более подробно.

Самая распространенная камера в Three.js и та, которую мы использовали до этого момента, - `PerspectiveCamera`. 
Она дает трехмерный вид, где вещи на расстоянии кажутся меньше, чем вещи рядом.

`PerspectiveCamera` определяет *frustum*. [*Frustum* - усеченная пирамида, твердое тело](https://ru.wikipedia.org/wiki/Усечённая_пирамида). 
Под твердым телом я подразумеваю, например, куб, конус, сферу, 
цилиндр и усеченный конус - все названия различных видов твердых тел.

<div class="spread">
  <div><div data-diagram="shapeCube"></div><div>cube</div></div>
  <div><div data-diagram="shapeCone"></div><div>cone</div></div>
  <div><div data-diagram="shapeSphere"></div><div>sphere</div></div>
  <div><div data-diagram="shapeCylinder"></div><div>cylinder</div></div>
  <div><div data-diagram="shapeFrustum"></div><div>frustum</div></div>
</div>

Я только указываю на это, потому что я не знал это в течение многих лет. 
Если в какой-нибудь книге или на веб странице будет упоминание *frustum* я закатывал глаза. 
Понимание того, что это название сплошной формы, сделало эти описания внезапно более понятными &#128517;

A `PerspectiveCamera`определяет свой frustum на основе 4 свойств. `near` определяет, 
где начинается фронт усечения. `far` определяет, где он заканчивается. `fov`поле обзора 
определяет высоту передней и задней частей усеченного конуса, вычисляя правильную высоту, 
чтобы получить указанное поле обзора в `near` единицах измерения от камеры. `aspect` определяет, 
насколько широким передние и задняя часть усеченного есть. Ширина усеченного конуса - 
это просто высота, умноженная на aspect.

<img src="resources/frustum-3d.svg" width="500" class="threejs_center"/>

Давайте используем сцену из [предыдущей статьи](threejs-lights.html) которая имеет плоскость 
земли, сферу и куб, и сделаем так, чтобы мы могли регулировать настройки камеры

Для этого мы сделаем `MinMaxGUIHelper` для параметров `near` и `far`, так чтобы `far` 
всегда был больше, чем `near`. У него будут свойства `min` и `max`, которые dat.GUI будет 
настраивать. После настройки они установят 2 свойства, которые мы указываем.

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
    this.min = this.min;  // это вызовет setter min 
  }
}
```

Теперь мы можем настроить наш графический интерфейс следующим образом

```js
function updateCamera() {
  camera.updateProjectionMatrix();
}

const gui = new dat.GUI();
gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
```

Каждый раз, когда меняются настройки камеры, нам нужно вызывать функцию камеры 
[`updateProjectionMatrix`](PerspectiveCamera.updateProjectionMatrix) поэтому мы сделали 
функцию `updateCamera` передав ее в dat.GUI, чтобы вызывать ее, когда что-то меняется.

{{{example url="../threejs-cameras-perspective.html" }}}

Вы можете просто значения и посмотреть, как они работают. Обратите внимание, что мы не делали 
`aspect` сеттер, так как aspect взят из размера окна, поэтому, если вы хотите настроить aspect, 
откройте пример в новом окне, а затем измените размер окна.

Тем не менее, я думаю, что это немного трудно увидеть, поэтому давайте изменим пример, чтобы он имел 2 камеры. 
Один покажет нашу сцену, как мы видим ее выше, другой покажет другую камеру, смотрящую на сцену, 
которую рисует первая камера, и показывает frustum камеры.

Для этого мы можем использовать функцию ножниц (scissor) Three.js. Давайте изменим это, чтобы 
нарисовать 2 сцены с 2 камерами рядом, используя функцию scissor

Для начала давайте используем HTML и CSS, чтобы определить 2 элемента рядом друг с другом. 
Это также поможет нам с событиями, так что обе камеры могут иметь свои собственные `OrbitControls`.

```html
<body>
  <canvas id="c"></canvas>
+  <div class="split">
+     <div id="view1" tabindex="1"></div>
+     <div id="view2" tabindex="2"></div>
+  </div>
</body>
```

Для начала давайте используем HTML и CSS, чтобы расположить 2 элемента рядом друг с другом. 
Это также поможет нам с событиями, так что обе камеры могут иметь свои собственные

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

Затем в нашем коде мы добавим `CameraHelper`. `CameraHelper` рисует frustum для `Camera`

```js
const cameraHelper = new THREE.CameraHelper(camera);

...

scene.add(cameraHelper);
```

Теперь давайте посмотрим на 2 элемента view.

```js
const view1Elem = document.querySelector('#view1'); 
const view2Elem = document.querySelector('#view2');
```

И мы установим нашу существующую `OrbitControls` так, чтобы она отвечала 
только за первый элемент представления.

```js
-const controls = new THREE.OrbitControls(camera, canvas);
+const controls = new THREE.OrbitControls(camera, view1Elem);
```

Создадим вторую `PerspectiveCamera` и вторую `OrbitControls`.
Вторая `OrbitControls` привязана ко второй камере и получает 
ввод от второго элемента view.

```js
const camera2 = new THREE.PerspectiveCamera(
  60,  // fov
  2,   // aspect
  0.1, // near
  500, // far
);
camera2.position.set(40, 10, 30);
camera2.lookAt(0, 5, 0);

const controls2 = new THREE.OrbitControls(camera2, view2Elem);
controls2.target.set(0, 5, 0);
controls2.update();
```

Наконец, нам нужно визуализировать сцену с точки зрения каждой камеры, используя 
функцию ножниц (scissor), чтобы визуализировать только часть холста.

Вот функция, которая для данного элемента будет вычислять прямоугольник этого 
элемента, который перекрывает холст. Затем он установит плоскость отсечения (scissor) и область 
просмотра (fov) в этот прямоугольник и вернет aspect для этого размера.

```js
function setScissorForElement(elem) {
  const canvasRect = canvas.getBoundingClientRect();
  const elemRect = elem.getBoundingClientRect();

  // вычисляем относительный прямоугольник холста
  const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
  const left = Math.max(0, elemRect.left - canvasRect.left);
  const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
  const top = Math.max(0, elemRect.top - canvasRect.top);

  const width = Math.min(canvasRect.width, right - left);
  const height = Math.min(canvasRect.height, bottom - top);

  //  установка области отсечения для рендеринга только на эту часть холста
  renderer.setScissor(left, top, width, height);
  renderer.setViewport(left, top, width, height);

  // return aspect
  return width / height;
}
```

И теперь мы можем использовать эту функцию, чтобы нарисовать сцену дважды в нашей функции `render`

```js
  function render() {

-    if (resizeRendererToDisplaySize(renderer)) {
-      const canvas = renderer.domElement;
-      camera.aspect = canvas.clientWidth / canvas.clientHeight;
-      camera.updateProjectionMatrix();
-    }

+    resizeRendererToDisplaySize(renderer);
+
+    // включить область отсечения
+    renderer.setScissorTest(true);
+
+    // render the original view
+    {
+      const aspect = setScissorForElement(view1Elem);
+
+      // настроить камеру для этого соотношения сторон
+      camera.aspect = aspect;
+      camera.updateProjectionMatrix();
+      cameraHelper.update();
+
+      // не рисуем Helper камеры в исходном представлении
+      cameraHelper.visible = false;
+
+      scene.background.set(0x000000);
+
+      // отрисовка
+      renderer.render(scene, camera);
+    }
+
+    // отрисовка со 2-й камеры
+    {
+      const aspect = setScissorForElement(view2Elem);
+
+      // настроить камеру для этого соотношения сторон
+      camera2.aspect = aspect;
+      camera2.updateProjectionMatrix();
+
+      // рисуем Helper камеры во втором представлении
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

Приведенный выше код устанавливает цвет фона сцены при рендеринге 
второго представления темно-синим, чтобы было проще различать два представления.

Мы также можем удалить наш `updateCamera` код, так как мы обновляем все в функции `render`.

```js
-function updateCamera() {
-  camera.updateProjectionMatrix();
-}

const gui = new dat.GUI();
-gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
+gui.add(camera, 'fov', 1, 180);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
-gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
-gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
+gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near');
+gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far');
```

И теперь вы можете использовать один вид, чтобы увидеть frustum другого.

{{{example url="../threejs-cameras-perspective-2-scenes.html" }}}

Слева вы можете увидеть исходный вид, а справа вы можете увидеть вид, 
показывающий frustum камеры слева. Можно настроить 
`near`, `far`, `fov` и перемещать камеру с помощью мыши. Вы можете увидеть, 
как то, что внутри frustum, показаное справа, появляется на сцене слева.

Отрегулируйте `near` примерно до 20, и вы легко увидите, как передние 
объекты исчезают, поскольку их больше нет в усеченном конусе. 
Отрегулируйте `far` ниже примерно 35, и вы начнете видеть, 
что наземная плоскость исчезает, поскольку она больше не находится 
в не усеченной области.

Возникает вопрос, почему бы просто не установить `near` значение 0,0000000001 и `far`
10000000000000 или что-то в этом роде, чтобы вы могли видеть все? Причина в том, что 
ваш GPU имеет столько точности, чтобы решить, находится ли что-то впереди или 
позади чего-то другого. Эта точность распределена между
`near` и `far`. Хуже того, по умолчанию точность закрытия камеры детализирована (резкое отсечение), 
а точность далеко от камеры - конечна. `near` медленно расширяется по мере приближения `far`.

Начиная с верхнего примера, давайте изменим код, вставив 20 сфер в ряд.

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

и давайте установим `near` = 0.00001

```js
const fov = 45;
const aspect = 2;  // the canvas default
-const near = 0.1;
+const near = 0.00001;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
```

Нам также нужно немного подправить код графического интерфейса, 
чтобы позволить 0.00001, если значение редактируется

```js
-gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
+gui.add(minMaxGUIHelper, 'min', 0.00001, 50, 0.00001).name('near').onChange(updateCamera);
```

Как ты думаешь, что произойдет?

{{{example url="../threejs-cameras-z-fighting.html" }}}

Это пример *z fighting* ([сшивание](https://en.wikipedia.org/wiki/Z-fighting)), когда графический процессор на вашем компьютере не обладает 
достаточной точностью, чтобы определить, какие пиксели находятся спереди, а какие - сзади.

На тот случай, если проблема не отображается на вашей машине, вот что я вижу на своей машине

<div class="threejs_center"><img src="resources/images/z-fighting.png" style="width: 570px;"></div>

Одно из решений состоит в том, чтобы указать использование three.js другому методу для вычисления того, 
какие пиксели находятся спереди, а какие - сзади. Мы можем сделать это, включив,
`logarithmicDepthBuffer` когда мы создаем `WebGLRenderer`

```js
-const renderer = new THREE.WebGLRenderer({canvas: canvas});
+const renderer = new THREE.WebGLRenderer({
+  canvas: canvas,
+  logarithmicDepthBuffer: true,
+});
```

и с этим это может работать

{{{example url="../threejs-cameras-logarithmic-depth-buffer.html" }}}

Если это не помогло решить проблему, вы столкнулись с одной из причин, по которой 
вы не всегда можете использовать это решение. Причина в том, что это поддерживают 
только определенные графические процессоры. По состоянию на сентябрь 2018 года 
практически ни одно мобильное устройство не поддерживает это решение, как это 
делают большинство настольных компьютеров.

Другая причина не выбирать это решение - оно может быть значительно медленнее, 
чем стандартное решение.

Даже при таком решении разрешение все еще ограничено. Сделайте `near` еще меньше или 
`far` больше, и вы в конечном итоге столкнетесь с теми же проблемами.

Это означает, что вы всегда должны прилагать усилия к тому, чтобы выбрать параметр `near`
и `far`, которые соответствуют вашему варианту использования. 
Установите `near` как можно дальше от камеры, чтобы все не исчезло. 
Установите `far` как можно ближе к камере, чтобы все не исчезло. Если вы пытаетесь 
нарисовать гигантскую сцену и показать крупным планом чье-то лицо, чтобы вы 
могли видеть их ресницы, в то время как на заднем плане вы можете видеть весь 
путь в горы на расстоянии 50 километров, тогда вам нужно будет найти другое 
креативные решения, которые, возможно, мы рассмотрим позже. На данный момент, 
просто знайте, что вы должны позаботиться о том, чтобы выбрать подходящие 
`near` и `far` для ваших нужд.

2-ая ​​самая распространенная камера - `OrthographicCamera`. Вместо того, 
чтобы указать frustum он указывает прямоугольный паралелепипед (box) 
с параметрами `left`, `right`, `top`, `bottom`, `near`, и `far`. 
Поскольку он проецирует box, перспективы нет.

Давайте изменим приведенный выше пример 2 для использования `OrthographicCamera` 
в первом представлении.

Сначала давайте настроим `OrthographicCamera`.

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

Мы устанавливаем `left` и `bottom` = -1 и `right` и `top` = 1. Это сделало бы 
прямоугольник шириной 2 единицы и высотой 2 единицы, но мы собираемся отрегулировать `left` и `top` 
в соответствии со отношением сторон прямоугольника, к которому мы рисуем. 
Мы будем использовать свойство `zoom`, чтобы упростить настройку количества единиц, отображаемых камерой.

Давайте добавим настройки GUI для `zoom`

```js
const gui = new dat.GUI();
+gui.add(camera, 'zoom', 0.01, 1, 0.01).listen();
```

Вызовем `listen` говорящий dat.GUI следить за изменениями. 
Потому что `OrbitControls` также может управлять масштабированием. 
Например, колесо прокрутки на мыши будет масштабироваться с помощью `OrbitControls`.

Наконец, нам просто нужно изменить часть, которая отображает левую сторону, 
чтобы обновить `OrthographicCamera`.

```js
{
  const aspect = setScissorForElement(view1Elem);

  // обновить камеру для этого соотношения сторон
-  camera.aspect = aspect;
+  camera.left   = -aspect;
+  camera.right  =  aspect;
  camera.updateProjectionMatrix();
  cameraHelper.update();

  // не рисуем Helper камеры в исходном view
  cameraHelper.visible = false;

  scene.background.set(0x000000);
  renderer.render(scene, camera);
}
```

и теперь вы можете увидеть `OrthographicCamera` в работе.

{{{example url="../threejs-cameras-orthographic-2-scenes.html" }}}

`OrthographicCamera` чаще всего используется для рисования 2D-объектов. 
Вы решаете, сколько единиц вы хотите, чтобы камера показывала. Например, 
если вы хотите, чтобы один пиксель холста соответствовал одному элементу 
камеры, вы можете сделать что-то вроде:

Поместить начало координат в центр и иметь 1 пиксель = 1 единицу three.js что-то вроде:

```js
camera.left = -canvas.width / 2;
camera.right = canvas.width / 2;
camera.top = canvas.heigth / 2;
camera.bottom = -canvas.height / 2;
camera.near = -1;
camera.far = 1;
camera.zoom = 1;
```

Или, если бы мы хотели, чтобы источник находился в верхнем левом углу, 
как 2D-холст, мы могли бы использовать это

```js
camera.left = 0;
camera.right = canvas.width;
camera.top = 0;
camera.bottom = canvas.height;
camera.near = -1;
camera.far = 1;
camera.zoom = 1;
```

В этом случае верхний левый угол будет 0,0, как 2D холст

Давай попробуем! Сначала давайте настроим камеру

```js
const left = 0;
const right = 300;  // default canvas size
const top = 0;
const bottom = 150;  // default canvas size
const near = -1;
const far = 1;
const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
camera.zoom = 1;
```

Затем давайте загрузим 6 текстур и сделаем 6 плоскостей, по одной на каждую текстуру. 
Мы будем привязывать каждую плоскость к `THREE.Object3D` чтобы было легче сместить плоскость, 
чтобы ее центр находился в ее верхнем левом углу.

```js
const loader = new THREE.TextureLoader();
const textures = [
  loader.load('../resources/images/flower-1.jpg'),
  loader.load('../resources/images/flower-2.jpg'),
  loader.load('../resources/images/flower-3.jpg'),
  loader.load('../resources/images/flower-4.jpg'),
  loader.load('../resources/images/flower-5.jpg'),
  loader.load('../resources/images/flower-6.jpg'),
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
  // move plane so top left corner is origin
  mesh.position.set(planeSize / 2, planeSize / 2, 0);
  return planePivot;
});
```

и нам нужно обновить камеру, если размер холста изменится.

```js
function render() {

  if (resizeRendererToDisplaySize(renderer)) {
    camera.right = canvas.width;
    camera.bottom = canvas.height;
    camera.updateProjectionMatrix();
  }

  ...
```

`planes` - массив `THREE.Mesh`, по одному для каждой плоскости. 
Давайте переместим их в зависимости от времени.

```js
function render(time) {
  time *= 0.001;  // конвертировать в секунды; 

  ...

  const xRange = Math.max(20, canvas.width - planeSize) * 2;
  const yRange = Math.max(20, canvas.height - planeSize) * 2;

  planes.forEach((plane, ndx) => {
    const speed = 180;
    const t = time * speed + ndx * 300;
    const xt = t % xRange;
    const yt = t % yRange;

    const x = xt < xRange / 2 ? xt : xRange - xt;
    const y = yt < yRange / 2 ? yt : yRange - yt;

    plane.position.set(x, y, 0);
  });

  renderer.render(scene, camera);
```

И вы можете видеть, как изображения отскакивают от пикселей идеально по краям холста, 
используя пиксельную математику, как 2D холст

{{{example url="../threejs-cameras-orthographic-canvas-top-left-origin.html" }}}

Другое распространенное использование `OrthographicCamera` для рисования - это отображение вверх, 
вниз, влево, вправо, спереди, сзади программ трехмерного моделирования или редактора игрового движка.

<div class="threejs_center"><img src="resources/images/quad-viewport.png" style="width: 574px;"></div>

На скриншоте выше вы можете видеть 1 вид в перспективе и 3 вида в ортогональном виде.

Это основы камер. Мы рассмотрим несколько распространенных способов перемещения камер в других статьях. 
А пока давайте перейдем к [теням](threejs-shadows.html).

<canvas id="c"></canvas>
<script src="../../resources/threejs/r102/three.min.js"></script>
<script src="../../resources/threejs/r102/js/controls/TrackballControls.js"></script>
<script src="../resources/threejs-lesson-utils.js"></script>
<script src="../resources/threejs-cameras.js"></script>
