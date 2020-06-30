Title: Three.js Shadows
Description: Shadows in Three.js
TOC: Shadows

Эта статья является частью серии статей о three.js. Первая статья - [основы Three.js](threejs-fundamentals.html). 
Если вы еще не читали их, и вы новичок в three.js, возможно, вы захотите начать с них.
[Предыдущая статья была о камерах](threejs-cameras.html) ,которые важно прочитать, прежде чем читать эту статью, а также
[статью, посвященную свету](threejs-lights.html).

Тени на компьютерах могут быть сложной темой. Существуют различные решения, и у всех есть свои компромиссы, включая решения, доступные в three.js.


Three.js по умолчанию использует *shadow maps*. Shadow map работает так: *для каждого источника света, отбрасывающего тени, все объекты, 
помеченные для отбрасывания теней, визуализируются с точки зрения источника света*. **ПРОЧИТАЙТЕ ЭТО СНОВА!** и это запомнится. 

Другими словами, если у вас есть 20 объектов и 5 источников света, и все 20 объектов отбрасывают тени, 
а все 5 источников отбрасывают тени, то вся ваша сцена будет нарисована 6 раз.
Все 20 объектов будут нарисованы для источника света № 1, затем все 20 объектов будут нарисованы для источника света № 2, 
затем № 3 и т. д., И, наконец, фактическая сцена будет нарисована с использованием данных из первых 5 визуализаций. 

Становится хуже, если у вас есть точечный источник света, отбрасывающий тени, сцена должна быть нарисована 6 раз только для этого света!

 По этим причинам часто приходится искать другие решения, кроме множества источников света, генерирующих тени. Одно общее решение состоит в том, 
 чтобы иметь несколько источников света, но только один направленный источник света, генерирующий тени. 

Еще одно решение заключается в использовании карт освещения и / или карт окклюзии(преграждений) окружающей среды 
для предварительного расчета эффектов освещения в автономном режиме. 
Это приводит к статическому освещению или подсказкам статического освещения, но, по крайней мере, это быстро. Мы рассмотрим оба из них в другой статье. 

Другое решение заключается в использовании поддельных теней. Создайте плоскость, поместите текстуру в градациях серого в плоскость, 
которая приближается к тени, нарисуйте ее над землей под вашим объектом.

Например, давайте использовать эту текстуру в качестве поддельной тени

<div class="threejs_center"><img src="../resources/images/roundshadow.png"></div>

Мы будем использовать часть кода из [предыдущей статьи](threejs-cameras.html).

Давайте установим цвет фона на белый. 

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color('white');
```

Затем мы установим ту же самую шахматную доску, но на этот раз она использует `MeshBasicMaterial`, так как нам не нужно освещение для земли.

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

  const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
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

Обратите внимание, что мы устанавливаем цвет на `1,5, 1,5, 1,5`. Это умножит цвета текстуры шахматной доски на 1,5, 1,5, 1,5. 
Так как цвета текстуры 0x808080 и 0xC0C0C0, которые являются средне-серыми и светло-серыми, 
умножение их на 1,5 даст нам белую и светло-серую шахматную доску.

 Давайте загрузим текстуру тени

```js
const shadowTexture = loader.load('resources/images/roundshadow.png');
```

и сделаем массив для запоминания каждой сферы и связанных объектов.
```js
const sphereShadowBases = [];
```

Тогда мы сделаем геометрию сферы

```js
const sphereRadius = 1;
const sphereWidthDivisions = 32;
const sphereHeightDivisions = 16;
const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
```

И геометрия плоскости для поддельной тени

```js
const planeSize = 1;
const shadowGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
```

Теперь мы сделаем кучу сфер. Для каждой сферы мы создадим `base` `THREE.Object3D` и сделаем сетку теневой плоскости и дочернюю сетку базовой сферы.
Таким образом, если мы переместим основание, то и сфера, и тень будут двигаться. Нам нужно поместить тень немного выше земли, чтобы предотвратить z-fighting.
Мы также устанавливаем значение `deepWrite` в `false`, чтобы тени не мешали друг другу. Мы рассмотрим оба эти вопроса в [другой статье](threejs-transparency.html).
Тень - это `MeshBasicMaterial`, потому что ей не нужно освещение. 

Мы делаем каждую сферу разным оттенком, а затем сохраняем ее вне основы, сетки сфер, сетки теней и начальной y-позиции каждой сферы.

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
    transparent: true,    // so we can see the ground
    depthWrite: false,    // so we don't have to sort
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.001;  // so we're above the ground slightly
  shadowMesh.rotation.x = Math.PI * -.5;
  const shadowSize = sphereRadius * 4;
  shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
  base.add(shadowMesh);

  // add the sphere to the base
  const u = i / numSpheres;   // goes from 0 to 1 as we iterate the spheres.
  const sphereMat = new THREE.MeshPhongMaterial();
  sphereMat.color.setHSL(u, 1, .75);
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  sphereMesh.position.set(0, sphereRadius + 2, 0);
  base.add(sphereMesh);

  // remember all 3 plus the y position
  sphereShadowBases.push({base, sphereMesh, shadowMesh, y: sphereMesh.position.y});
}
```

Мы установили 2 источника света. Одним из них является `HemisphereLight` с интенсивностью, установленной на 2, чтобы действительно осветлить вещи.

```js
{
  const skyColor = 0xB1E1FF;  // light blue
  const groundColor = 0xB97A20;  // brownish orange
  const intensity = 2;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);
}
```

Другой - `DirectionalLight`, поэтому сферы получают некоторое определение.

```js
{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 5);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);
}
```

Он будет отображаться как есть, но давайте оживим сферы. 
Для каждой сферы, тени, базового набора мы перемещаем базу в плоскости xz, мы перемещаем сферу вверх и вниз,
используя `Math.abs (Math.sin (time))`, который дает нам оживленную анимацию. 
И мы также устанавливаем непрозрачность теневого материала таким образом, чтобы, когда каждая сфера поднималась выше, ее тень исчезала.

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

И вот 15 видов прыгающих шаров.

{{{example url="../threejs-shadows-fake.html" }}}

В некоторых приложениях обычно используют круглую или овальную тень для всего, но, конечно, 
вы также можете использовать теневые текстуры различной формы. Вы также можете придать тени более жесткий край.
Хорошим примером использования этого типа тени является [Animal Crossing Pocket Camp](https://www.google.com/search?tbm=isch&q=animal+crossing+pocket+camp+screenshots)
де вы можете видеть, что у каждого персонажа есть простая круглая тень. Это эффективно и дешево. 
[Monument Valley](https://www.google.com/search?q=monument+valley+screenshots&tbm=isch)
 кажется, также использует этот вид тени для главного героя. 

Итак, переходя к теневым картам, есть 3 источника света, которые могут отбрасывать тени. `DirectionalLight`, `PointLight` и `SpotLight`.


Давайте начнем с `DirectionalLight` c вспомогательного примера из [статьи о светах](threejs-lights.html).

Первое, что нам нужно сделать, это включить тени в рендерере.

```js
const renderer = new THREE.WebGLRenderer({canvas});
+renderer.shadowMap.enabled = true;
```

Тогда мы также должны сказать свету отбрасывать тень

```js
const light = new THREE.DirectionalLight(color, intensity);
+light.castShadow = true;
```

Нам также нужно перейти к каждой сетке в сцене и решить, должна ли она отбрасывать тени и / или получать тени.

Давайте сделаем так, чтобы плоскость (земля) получала только тени, так как нам все равно, что происходит под ней.

```js
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.receiveShadow = true;
```

Для куба и сферы давайте получим и отбросим тени

```js
const mesh = new THREE.Mesh(cubeGeo, cubeMat);
mesh.castShadow = true;
mesh.receiveShadow = true;

...

const mesh = new THREE.Mesh(sphereGeo, sphereMat);
mesh.castShadow = true;
mesh.receiveShadow = true;
```

И тогда мы запустим это.

{{{example url="../threejs-shadows-directional-light.html" }}}

Что произошло? Почему части теней отсутствуют? 

Причина в том, что карты теней создаются путем рендеринга сцены с точки зрения света. 
В этом случае в `DirectionalLight` есть камера, которая смотрит на свою цель.  Точно так же, как [камера, которую мы ранее покрывали](threejs-cameras.html),
камера тени определяет область, внутри которой рендерится тени. В приведенном выше примере эта область слишком мала.

Чтобы визуализировать эту область, мы можем получить теневую камеру и добавить `CameraHelper` к сцене.

```js
const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(cameraHelper);
```

И теперь вы можете видеть область, для которой отбрасываются и принимаются тени.

{{{example url="../threejs-shadows-directional-light-with-camera-helper.html" }}}

Отрегулируйте целевое значение x назад и вперед, и должно быть довольно ясно, что только то, что находится внутри блока камеры тени, находится там, где рисуются тени. 

Мы можем отрегулировать размер этой коробки, отрегулировав камеру освещения.

Давайте добавим некоторые настройки графического интерфейса, чтобы отрегулировать тень камеры освещения. 
Поскольку `DirectionalLight` представляет свет, движущийся в параллельном направлении,
`DirectionalLight` использует `OrthographicCamera` для своей теневой камеры. Мы рассмотрели, как работает 
`OrthographicCamera` в [предыдущей статье о камерах](threejs-cameras.html).

Напомним, `OrthographicCamera` определяет свою рамку или вид усечения по своим свойствам `left`, `right`, `top`, `bottom`, `near`, `far` и `zoom`. 

Снова давайте создадим вспомогательный класс для dat.GUI. Мы сделаем `DimensionGUIHelper`, 
который мы передадим объект и 2 свойства. Он представит одно свойство, которое dat.GUI 
может настроить, и в ответ установит два значения: положительное и отрицательное.
Мы можем использовать это, чтобы установить влево и вправо как ширину, а вверх и вниз как высоту.

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
    this.obj[this.maxProp] = v /  2;
    this.obj[this.minProp] = v / -2;
  }
}
```

Мы также будем использовать `MinMaxGUIHelper`, который мы создали в статье о камере, для настройки ближнего и дальнего.

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

Мы говорим GUI, чтобы мы вызывали нашу функцию `updateCamera` каждый раз, когда что-то меняется. 
Давайте напишем эту функцию для обновления источника света, помощника источника света, 
камеры тени источника света и помощника, отображающего камеру тени источника света.

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

И теперь, когда мы дали теневой камере световой интерфейс, мы можем играть со значениями.

{{{example url="../threejs-shadows-directional-light-with-camera-gui.html" }}}

Установите `ширину` и `высоту` около 30, и вы увидите, что тени правильные и области, которые должны находиться в тени для этой сцены, полностью покрыты. 

Но это поднимает вопрос, почему бы просто не установить `ширину` и `высоту` для некоторых гигантских чисел, 
чтобы просто покрыть все? Установите `ширину` и `высоту` 100, и вы можете увидеть что-то вроде этого

<div class="threejs_center"><img src="resources/images/low-res-shadow-map.png" style="width: 369px"></div>

Что происходит с этими тенями в низком разрешении ?!

Эта проблема - еще один параметр, связанный с тенями, о котором нужно знать. Карты теней - это текстуры, в которые затягиваются тени.
Эти текстуры имеют размер. Область теневой камеры, которую мы установили выше, 
растянута на этот размер. Это означает, что чем больше область, которую вы устанавливаете, тем более блочными будут ваши тени.

 Вы можете установить разрешение текстуры карты теней, установив `light.shadow.mapSize.width` и `light.shadow.mapSize.height`.
 Они по умолчанию 512x512. Чем больше вы делаете их, тем больше памяти они отнимают 
 и тем медленнее они вычисляются, поэтому вы захотите установить их как можно меньше и при этом заставить вашу сцену работать. 
 То же самое относится и к области камеры теневого света. Меньшие тени означают - лучше выглядящие, 
 поэтому сделайте область как можно меньше и при этом охватывайте всю сцену. Имейте в виду, что на компьютере каждого пользователя установлен максимально допустимый
 размер текстуры, который доступен в рендере как [`renderer.capabilities.maxTextureSize`](WebGLRenderer.capabilities).

<!--
Ok but what about `near` and `far` I hear you thinking. Can we set `near` to 0.00001 and far to `100000000`
-->

При переключении на `SpotLight` теневая камера источника света становится `PerspectiveCamera`. 
В отличие от теневой камеры `DirectionalLight`, где мы могли вручную установить большинство ее настроек, 
теневая камера SpotLight управляется самим `SpotLight`. Поле зрения для теневой камеры напрямую связано с настройкой угла `SpotLight`. 
`aspect` устанавливается автоматически в зависимости от размера карты теней.

```js
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.SpotLight(color, intensity);
```

и мы добавили обратно в настройку `полутени` и `угол` из нашей [статьи о светах](threejs-lights.html).

{{{example url="../threejs-shadows-spot-light-with-camera-gui.html" }}}

<!--
You can notice, just like the last example if we set the angle high
then the shadow map, the texture is spread over a very large area and
the resolution of our shadows gets really low.

div class="threejs_center"><img src="resources/images/low-res-shadow-map-spotlight.png" style="width: 344px"></div>

You can increase the size of the shadow map as mentioned above. You can
also blur the result

{{{example url="../threejs-shadows-spot-light-with-shadow-radius" }}}
-->


И, наконец, есть тени с `PointLight`. Так как `PointLight` светит во всех направлениях, единственные релевантные настройки - ближние и дальние.
В противном случае тень `PointLight` фактически представляет собой 6 теней `SpotLight`, каждая из которых указывает на грань куба вокруг источника света. 
Это означает, что тени `PointLight` намного медленнее, поскольку вся сцена должна быть нарисована 6 раз, по одному для каждого направления. 


Давайте поместим рамку вокруг нашей сцены, чтобы мы могли видеть тени на стенах и потолке.
Мы установим свойство стороны материала в `THREE.BackSide`, чтобы отображать внутреннюю часть поля вместо внешней. Как и пол, мы установим его только для получения теней. 
Также мы установим положение ящика так, чтобы его дно было немного ниже пола, чтобы пол и дно ящика не мешали друг другу.

```js
{
  const cubeSize = 30;
  const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({
    color: '#CCC',
    side: THREE.BackSide,
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.receiveShadow = true;
  mesh.position.set(0, cubeSize / 2 - 0.1, 0);
  scene.add(mesh);
}
```

И, конечно же, нам нужно переключить свет на `PointLight`.

```js
-const light = new THREE.SpotLight(color, intensity);
+const light = new THREE.PointLight(color, intensity);

....

// so we can easily see where the point light is
+const helper = new THREE.PointLightHelper(light);
+scene.add(helper);
```

{{{example url="../threejs-shadows-point-light.html" }}}

Используйте настройки GUI для перемещения света, и вы увидите, как тени падают на все стены. 
Вы также можете настроить ближние и дальние настройки и видеть, как и другие тени, 
когда объекты ближе -  они больше не получают тень, когда объекты дальше - они всегда находятся в тени.

<!--
self shadow, shadow acne
-->

