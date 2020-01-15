Title: Three.js - Освещение
Description: Настройка освещения
TOC: Освещение

Эта статья является частью серии статей о three.js. 
Первая была [об основах](threejs-fundamentals.html).
Если вы её еще не читали, советую вам сделать это.
[Предыдущая статья была о текстурах](threejs-textures.html).

Давайте рассмотрим, как использовать различные виды освещения в three.js.

Начинем с одного из наших предыдущих примеров, давайте обновим камеру. 
Мы установим поле зрения (fov) на 45 градусов, дальнюю плоскость (far) на 100 единиц, 
и мы переместим камеру на 10 единиц вверх и на 20 единиц назад от начала 
координат.

```js
*const fov = 45;
const aspect = 2;  // значение по умолчанию для холста
const near = 0.1;
*const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
+camera.position.set(0, 10, 20);
```

Далее давайте добавим `OrbitControls`. `OrbitControls` позволить пользователю вращать 
или *поворачивать* камеру вокруг некоторой точки. `OrbitControls` - это 
дополнительные функции three.js, поэтому сначала нам нужно 
включить их в нашу страницу.

```js
import * as THREE from './resources/three/r112/build/three.module.js';
+import {OrbitControls} from './resources/threejs/r112/examples/jsm/controls/OrbitControls.js';
```

Теперь мы можем использовать их. Мы передаем в `OrbitControls` камеру для 
управления и элемент DOM для получения входных событий

```js
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();
```

Мы также устанавливаем target на 5 орбит вокруг источника, а затем вызываем 
`controls.update` чтобы элементы управления использовали новую цель.

Далее давайте сделаем некоторые вещи, чтобы включить освещение. 
Сначала мы сделаем плоскость земли. Мы применим крошечную текстуру 
шахматной доски размером 2x2, которая выглядит следующим образом

<div class="threejs_center">
  <img src="../resources/images/checker.png" class="border" style="
    image-rendering: pixelated;
    width: 128px;
  ">
</div>

Сначала мы загружаем текстуру, устанавливаем фильтрацию nearest 
и устанавливаем число повторений. 
Поскольку текстура представляет собой шахматную доску размером 2x2 пикселя, 
при повторении и установке повторения равным половине размера 
плоскости каждая клетка на шахматной доске будет иметь размер 
ровно 1 единицу;

```js
const planeSize = 40;

const loader = new THREE.TextureLoader();
const texture = loader.load('../resources/images/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);
```

Затем мы создаем геометрию плоскости, материал для плоскости и сетку, 
чтобы вставить ее в сцену. Плоскости по умолчанию находятся в плоскости 
XY, но земля находится в плоскости XZ, поэтому мы вращаем ее.

```js
const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -.5;
scene.add(mesh);
```

Давайте добавим куб и сферу, чтобы у нас было 3 вещи для освещения, 
включая плоскость

```js
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

Теперь, когда у нас есть сцена для освещения, давайте добавим свет!

## `AmbientLight`

Сначала давайте сделаем `AmbientLight`

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);
```

Давайте также сделаем так, чтобы мы могли регулировать параметры света. 
Мы снова будем использовать [dat.GUI](https://github.com/dataarts/dat.gui). 
Чтобы иметь возможность настроить цвет с помощью dat.GUI, нам нужен небольшой 
помощник, который представляет свойство для dat.GUI, которое выглядит как 
шестнадцатеричная цветовая строка CSS (например: `#FF8844`). 
Наш helper получит цвет из именованного свойства, преобразует его в 
шестнадцатеричную строку, чтобы предложить dat.GUI. Когда dat.GUI 
попытается установить свойство helper'а, мы присвоим результат 
обратно цвету источника света.

Вот helper:

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

И вот наш код настройки dat.GUI

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
```

И вот результат

{{{example url="../threejs-lights-ambient.html" }}}

Нажмите и перетащите сценy, чтобы вращать камеру.

Обратите внимание, формы плоские. `AmbientLight` только умножил цвет материала 
на цвет света с учетом интенсивности.

    color = materialColor * light.color * light.intensity;

Вот и все. У него нет направления.
Этот стиль окружающего (ambient) освещения на самом деле не так полезен, 
как освещение, так как он на 100% даже за исключением изменения цвета 
всего на сцене, не очень похож на освещение. Что помогает, так это 
делает темные не слишком темными.

## `HemisphereLight`

Давайте переключим код на `HemisphereLight`. `HemisphereLight`
принимает цвет неба и основной цвет и просто умножает цвет материала 
между этими двумя цветами. Цвет неба, если поверхность объекта направлена 
​​вверх, и цвет земли, если поверхность объекта направлена ​​вниз.

Вот новый код

```js
-const color = 0xFFFFFF;
+const skyColor = 0xB1E1FF;  // light blue
+const groundColor = 0xB97A20;  // brownish orange
const intensity = 1;
-const light = new THREE.AmbientLight(color, intensity);
+const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);
```

Давайте также обновим код dat.GUI для редактирования обоих цветов.

```js
const gui = new GUI();
-gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
+gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
+gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
gui.add(light, 'intensity', 0, 2, 0.01);
```

Результат:

{{{example url="../threejs-lights-hemisphere.html" }}}

Еще раз обратите внимание, что объема почти нет, все выглядит плоско. 
`HemisphereLight` используется в сочетании с другим светом и может 
помочь дать хороший вид влияния цвета неба и земли. 
Таким образом, его лучше всего использовать в сочетании с другим источником 
света или заменой `AmbientLight`.

## `DirectionalLight`

Давайте переключим код на `DirectionalLight`. 
`DirectionalLight` часто используется для воспроизведения солнца.

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 10, 0);
light.target.position.set(-5, 0, 0);
scene.add(light);
scene.add(light.target);
```

Обратите внимание, что мы должны были добавить `light` и `light.target` 
к сцене. `DirectionalLight` будет светить в направлении к своей цели.

Давайте сделаем так, чтобы мы могли перемещать цель, 
добавляя ее в наш графический интерфейс.

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
gui.add(light.target.position, 'x', -10, 10);
gui.add(light.target.position, 'z', -10, 10);
gui.add(light.target.position, 'y', 0, 10);
```

{{{example url="../threejs-lights-directional.html" }}}

Трудно понять, что происходит. Three.js имеет несколько вспомогательных 
объектов, которые мы можем добавить к нашей сцене, чтобы помочь 
визуализировать невидимые части сцены. В этом случае мы будем 
использовать тот `DirectionalLightHelper`, который нарисует плоскость, 
чтобы изобразить источник света, и линию от света к цели. 
Мы просто передаем ему свет и добавляем его на сцену.

```js
const helper = new THREE.DirectionalLightHelper(light);
scene.add(helper);
```

Пока мы работаем с ним, давайте сделаем так, чтобы мы могли установить 
как положение источника света, так и цели. Для этого мы сделаем функцию, 
которая по заданному `Vector3` скорректирует его `x`, `y` и `z` свойства, 
используя `dat.GUI`.

```js
function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
  folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
  folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  folder.open();
}
```

Обратите внимание, что нам нужно вызывать `update` функцию помощника 
каждый раз, когда мы что-то меняем, чтобы помощник знал, что нужно 
обновить себя. Таким образом, мы передаем `onChangeFn` функцию 
для вызова в любое время, а dat.GUI обновляет значение.

Затем мы можем использовать это как для положения источника света, 
так и для цели, как тут

```js
+function updateLight{
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

Теперь мы можем переместить свет и его цель

{{{example url="../threejs-lights-directional-w-helper.html" }}}

Вращайтесь по орбите камеры, и это станет легче видеть. Плоскость представляет собой 
`DirectionalLight` потому что *направленный свет* вычисляет свет 
поступающий в одном направлении. Нет точки откуда исходит свет, 
это бесконечная плоскость света, излучающая параллельные лучи света.

## `PointLight`

`PointLight` - это свет, который сидит в какой-то точке и излучает свет 
во всех направлениях от этой точки. Давайте изменим код.

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

Давайте также перейдем к `PointLightHelper`

```js
-const helper = new THREE.DirectionalLightHelper(light);
+const helper = new THREE.PointLightHelper(light);
scene.add(helper);
```

и поскольку нет цели, то `onChange` функция может быть проще.

```js
function updateLight{
-  light.target.updateMatrixWorld();
  helper.update();
}
-updateLight();
```

Обратите внимание, что на каком-то уровне `PointLightHelper` не имеет точки. 
Он просто рисует маленький каркас ромба. Это может быть любая 
форма, которую вы хотите, просто добавьте mesh к самому источнику света.

`PointLight` имеет дополнительное свойство [`distance`](PointLight.distance).
Если `distance` = 0, то  `PointLight` светит до бесконечности. Если значение 
`distance` больше 0, то свет излучает свою полную интенсивность и 
исчезает, с увеличением `distance` вдали от света.

Давайте настроим графический интерфейс, чтобы мы могли регулировать расстояние.

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
+gui.add(light, 'distance', 0, 40).onChange(updateLight);

makeXYZGUI(gui, light.position, 'position', updateLight);
-makeXYZGUI(gui, light.target.position, 'target', updateLight);
```

А теперь попробуйте.

{{{example url="../threejs-lights-point.html" }}}

Обратите внимание, когда `distance` > 0, как свет гаснет.

## `SpotLight`

Прожекторы - это точечный источник света с прикрепленным к нему 
конусом, который светит только внутри конуса. Там на самом деле 
2 конуса. Внешний конус и внутренний конус. Между внутренним 
и внешним конусом свет исчезает от полной интенсивности до нуля.

Чтобы использовать `SpotLight` нам нужна цель, т.к. это направленный свет. 
Конус света открываем по направлению к цели.

Модификация нашего `DirectionalLight` с помощником сверху

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

Угол конуса прожектора задается с помощью свойства [`angle`](SpotLight.angle) 
в радианах. Мы будем использовать наш `DegRadHelper` из 
[статьи про текстуры](threejs-textures.html) для представления пользовательского интерфейса в градусах..

```js
gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
```

Внутренний конус определяется путем установки свойства [`penumbra`](SpotLight.penumbra) 
в процентах от внешнего конуса. Другими словами, когда `penumbra` = 0 , то внутренний код 
имеет такой же размер (0 = нет разницы) от внешнего конуса. Когда значение
`penumbra` равно 1, свет гаснет, начиная с центра конуса до внешнего конуса. 
Когда `penumbra` равно .5, то свет гаснет, начиная с 50% между центром внешнего конуса.

```js
gui.add(light, 'penumbra', 0, 1, 0.01);
```

{{{example url="../threejs-lights-spot-w-helper.html" }}}

Обратите внимание, что при значении по умолчанию `penumbra` = 0 и прожектор 
имеет очень резкий край. По мере того, как вы наращиваете `penumbra` к 1 
края размываются.

Может быть трудно увидеть *конус* прожектора. Причина в том, что он ниже земли. 
Сократите расстояние до 5, и вы увидите открытый конец конуса.

## `RectAreaLight`

Есть еще один тип света - `RectAreaLight`, который представляет именно то, 
на что это похоже, прямоугольную область света, такую ​​как длинный флуоресцентный 
свет или, возможно, матовый небесный свет в потолке.

`RectAreaLight` работает только с `MeshStandardMaterai` и
`MeshPhysicalMaterial` поэтому давайте изменим все наши материалы на `MeshStandardMaterial`

```js
  ...

  const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
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
  const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
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
  const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
-  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
+ const sphereMat = new THREE.MeshStandardMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

Для использования `RectAreaLight` нам нужно включить некоторые дополнительные возможности three.js

```js
import * as THREE from './resources/three/r112/build/three.module.js';
+import {RectAreaLightUniformsLib} from './resources/threejs/r112/examples/jsm/lights/RectAreaLightUniformsLib.js';
+import {RectAreaLightHelper} from './resources/threejs/r112/examples/jsm/helpers/RectAreaLightHelper.js';
```

```js
function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
+  RectAreaLightUniformsLib.init();
```

Если вы забудете RectAreaLightUniformsLib, индикатор все равно будет работать, 
но он будет выглядеть забавно, поэтому не забудьте включить дополнительный код.

Теперь мы можем создать свет

```js
const color = 0xFFFFFF;
*const intensity = 5;
+const width = 12;
+const height = 4;
*const light = new THREE.RectAreaLight(color, intensity, width, height);
light.position.set(0, 10, 0);
+light.rotation.x = THREE.Math.degToRad(30);
scene.add(light);

*const helper = new RectAreaLightHelper(light);
scene.add(helper);
```

Единственное, что следует заметить, в отличие от `DirectionalLight` и `SpotLight`,
`RectAreaLight` не использует цель. Он просто использует свой поворот.

Давайте также настроим графический интерфейс. Мы сделаем так, чтобы мы могли вращать 
свет и регулировать его `width` и `height`

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

И вот что.

{{{example url="../threejs-lights-rectarea.html" }}}

Одна вещь, которую мы не охватили, это то, что есть настройка для `WebGLRenderer`
вызываемого в `physicallyCorrectLights`. Это влияет на то, как свет падает в зависимости 
от расстояния до предмета. Это влияет только на `PointLight` и `SpotLight`. 
`RectAreaLight` делает это автоматически.

Для источников света, хотя основная идея заключается в том, что вы не устанавливаете 
расстояние для их затухания и не устанавливаете `intensity`. Вместо этого вы устанавливаете силу
[`power`](PointLight.power) света в люменах, а затем three.js будет использовать физические 
вычисления, как у настоящих источников света. Единицами three.js в этом случае являются метры, 
а лампочка мощностью 60 Вт будет иметь около 800 люмен. 
Там также есть распад [`decay`](PointLight.decay), он должен быть установлен в `2` для реализма.

Давайте проверим это.

Сначала мы включим физически правильное осещение

```js
const renderer = new THREE.WebGLRenderer({canvas});
+renderer.physicallyCorrectLights = true;
```

Затем мы установим `power` = 800 lumens,  `decay` = 2 и `distance` до `Infinity`.

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.PointLight(color, intensity);
light.power = 800;
light.decay = 2;
light.distance = Infinity;
```

и мы добавим графический интерфейс, чтобы мы могли изменить `power` и `decay`

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'decay', 0, 4, 0.01);
gui.add(light, 'power', 0, 2000);
```

{{{example url="../threejs-lights-point-physically-correct.html" }}}

Важно отметить, что каждый источник света, который вы добавляете в сцену, 
замедляет скорость рендеринга сцены в three.js, поэтому вы всегда должны 
стараться использовать как можно меньше для достижения своих целей.

Далее давайте перейдем к  [работе с камерами](threejs-cameras.html).

<canvas id="c"></canvas>
<script type="module" src="../resources/threejs-lights.js"></script>
