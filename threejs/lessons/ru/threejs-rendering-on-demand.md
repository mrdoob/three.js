Title: Three.js Рендеринг по требованию
Description: Как использовать меньше энергии.
TOC: Рендеринг по требованию

Эта тема может быть очевидна для многих людей, но на всякий случай ... большинство примеров Three.js отображаются непрерывно. Другими словами, они устанавливают цикл
`requestAnimationFrame` или "*цикл RAF*" примерно так 

```js
function render() {
  ...
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

Для чего-то, что анимируется, это имеет смысл, но как насчет чего-то, что не анимируется? В этом случае непрерывный рендеринг 
является пустой тратой энергии устройств, а если пользователь находится на портативном устройстве, он расходует батарею пользователя. 

Самый очевидный способ решить эту проблему - рендерить один раз в начале, а затем рендерить только тогда, когда что-то меняется. 
Изменения включают в себя окончательную загрузку текстур или моделей, 
данные, поступающие из какого-либо внешнего источника, пользователь, изменяющий настройку или камеру, или другой соответствующий ввод. 

Давайте возьмем пример из [статьи об отзывчивости](threejs-responsive.html)
и изменим его для отображения по требованию. 

Сначала мы добавим в OrbitControls, чтобы можно было что-то изменить, что мы можем сделать в ответ. 

```js
import * as THREE from './resources/three/r115/build/three.module.js';
+import {OrbitControls} from './resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
```

и настроить их

```js
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

+const controls = new OrbitControls(camera, canvas);
+controls.target.set(0, 0, 0);
+controls.update();
```

Поскольку мы больше не будем анимировать кубы, нам больше не нужно отслеживать их 

```js
-const cubes = [
-  makeInstance(geometry, 0x44aa88,  0),
-  makeInstance(geometry, 0x8844aa, -2),
-  makeInstance(geometry, 0xaa8844,  2),
-];
+makeInstance(geometry, 0x44aa88,  0);
+makeInstance(geometry, 0x8844aa, -2);
+makeInstance(geometry, 0xaa8844,  2);
```

Мы можем удалить код для анимации кубов и вызовы `requestAnimationFrame`

```js
-function render(time) {
-  time *= 0.001;
+function render() {

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

-  cubes.forEach((cube, ndx) => {
-    const speed = 1 + ndx * .1;
-    const rot = time * speed;
-    cube.rotation.x = rot;
-    cube.rotation.y = rot;
-  });

  renderer.render(scene, camera);

-  requestAnimationFrame(render);
}

-requestAnimationFrame(render);
```

тогда нам нужно отрендерить один раз

```js
render();
```

Нам нужно рендерить каждый раз, когда `OrbitControls` меняет настройки камеры. К счастью, `OrbitControls` отправляет событие `change` каждый раз, когда что-то меняется. 

```js
controls.addEventListener('change', render);
```

Нам также нужно обработать случай, когда пользователь изменяет размер окна. 
Раньше это было обработано автоматически, так как мы рендерили непрерывно, 
но теперь нам это не нужно, нужно рендерить, когда окно меняет размер. 

```js
window.addEventListener('resize', render);
```

И с этим мы получаем что-то, что рендерит по требованию.

{{{example url="../threejs-render-on-demand.html" }}}

У `OrbitControls` есть опции для добавления некоторой инерции, чтобы они чувствовали себя менее интенсивными. 
Мы можем включить это, установив для свойства `enableDamping` значение true. 

```js
controls.enableDamping = true;
```

With `enableDamping` on we need to call `controls.update` in our render function
so that the `OrbitControls` can continue to give us new camera settings as they
smooth out the movement. But, that means we can't call `render` directly from
the `change` event because we'll end up in an infinite loop. The controls will
send us a `change` event and call `render`, `render` will call `controls.update`.
`controls.update` will send another `change` event.

С включенной функцией `enableDamping` нам нужно вызвать `Control.update` в нашей функции рендеринга, 
чтобы `OrbitControls` продолжал предоставлять нам новые настройки камеры, поскольку они сглаживают движение. 
Но это означает, что мы не можем вызвать `render` напрямую из события `change`, потому что мы окажемся в бесконечном цикле. 
Элементы управления отправят нам событие `change` и вызовут `render`, `render` вызовет `controls.update`.
`controls.update` отправит еще одно событие `change`. 

Мы можем исправить это, используя `requestAnimationFrame` для вызова `render`, но нам нужно убедиться, что мы запрашиваем новый кадр,
только если он еще не был запрошен, что мы можем сделать, сохраняя переменную, которая отслеживает, если мы уже запросили кадр. 

```js
+let renderRequested = false;

function render() {
+  renderRequested = false;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}
render();

+function requestRenderIfNotRequested() {
+  if (!renderRequested) {
+    renderRequested = true;
+    requestAnimationFrame(render);
+  }
+}

-controls.addEventListener('change', render);
+controls.addEventListener('change', requestRenderIfNotRequested);
```

Возможно, нам также следует использовать `requestRenderIfNotRequested` для изменения размера 

```js
-window.addEventListener('resize', render);
+window.addEventListener('resize', requestRenderIfNotRequested);
```

Может быть трудно увидеть разницу. Попробуйте нажать на приведенный ниже пример и использовать
клавиши со стрелками для перемещения или перетаскивать для вращения. 
Затем попробуйте нажать на приведенный выше пример и сделайте то же самое, и вы сможете увидеть разницу. 
В приведенный выше примере при нажатии клавиши со стрелкой или перетаскивании мышью, кубики проскальзывают. 

{{{example url="../threejs-render-on-demand-w-damping.html" }}}

Давайте также добавим простой графический интерфейс dat.GUI и внесем его изменения по запросу. 

```js
import * as THREE from './resources/three/r115/build/three.module.js';
import {OrbitControls} from './resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
+import {GUI} from '../3rdparty/dat.gui.module.js';
```

Давайте позволим установить цвет и шкалу х каждого куба. Чтобы установить цвет, мы будем использовать `ColorGUIHelper`, который мы создали в [статье о светах](threejs-lights.html).

Сначала нам нужно создать графический интерфейс

```js
const gui = new GUI();
```

а затем для каждого куба мы создадим папку и добавим 2 элемента управления, 
один для `material.color` и другой для `cube.scale.x`. 

```js
function makeInstance(geometry, color, x) {
  const material = new THREE.MeshPhongMaterial({color});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;

+  const folder = gui.addFolder(`Cube${x}`);
+  folder.addColor(new ColorGUIHelper(material, 'color'), 'value')
+      .name('color')
+      .onChange(requestRenderIfNotRequested);
+  folder.add(cube.scale, 'x', .1, 1.5)
+      .name('scale x')
+      .onChange(requestRenderIfNotRequested);
+  folder.open();

  return cube;
}
```

Вы можете видеть выше элементы управления dat.GUI имеют метод `onChange`, 
который вы можете передать обратный вызов для вызова, когда графический интерфейс изменяет значение.
В нашем случае нам просто нужно вызвать `requestRenderIfNotRequested`. При вызове `folder.open` папка запускается расширенной. 

{{{example url="../threejs-render-on-demand-w-gui.html" }}}

Я надеюсь, что это дает некоторое представление о том, как сделать three.js визуализированным 
по требованию, а не непрерывно. Приложения / страницы, которые отображают Three.js по требованию, 
не так часто встречаются, так как большинство страниц, использующих Three.js, являются либо играми, 
либо 3D-анимацией, но примеры страниц, которые могут быть лучше прорисованы по требованию, - это, 
скажем, просмотрщик карт, 3D-редактор, генератор трехмерных графиков, каталог продуктов и т. д. 
