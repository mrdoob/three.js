Title: Граф сцены Three.js
Description: Что такое граф сцены?

Эта статья является частью серии статей о three.js. 
Первая статья - [основы Three.js](threejs-fundamentals.html).
Если вы её еще не читали, советую вам сделать это.

Ядром Three.js, возможно, является граф сцены. Граф сцены в трехмерном 
движке - это иерархия узлов в графе, где каждый узел представляет 
локальное пространство.

<img src="../resources/images/scenegraph-generic.svg" align="center">

Это своего рода абстракция, поэтому давайте попробуем привести несколько примеров.

Одним из примеров может быть солнечная система, солнце, земля, луна.

<img src="../resources/images/scenegraph-solarsystem.svg" align="center">

Земля вращается вокруг Солнца. Луна вращается вокруг Земли. Луна движется по 
кругу вокруг Земли. С точки зрения Луны она вращается в «локальном пространстве» 
Земли. Хотя его движение относительно Солнца с точки зрения Луны представляет 
собой какой-то сумасшедший спирографический изгиб, ему просто нужно заниматься 
вращением вокруг локального пространства Земли.

{{{diagram url="resources/moon-orbit.html" }}}

Чтобы думать об этом иначе, вы, живущие на Земле, не должны думать о вращении 
Земли вокруг своей оси или о вращении вокруг Солнца. Вы просто идете или едете, 
или плаваете, или бежите, как будто Земля вообще не движется и не вращается. 
Вы идете, ездите, плаваете, бегаете и живете в «локальном пространстве» Земли, 
хотя относительно Солнца вы вращаетесь вокруг Земли со скоростью около 
1000 миль в час, а вокруг Солнца - около 67 000 миль в час. Ваше положение 
в Солнечной системе похоже на положение Луны наверху, но вам не нужно 
беспокоиться о себе. Вы просто переживаете за свое положение относительно 
земли, ее "локального пространства".

Давайте сделаем это один шаг за один раз. Представьте, что мы хотим сделать 
диаграмму солнца, земли и луны. Мы начнем с солнца, просто сделав сферу 
и поместив ее в начало координат. Примечание: мы используем солнце, 
землю, луну в качестве демонстрации того, как использовать граф сцены. 
Конечно, настоящее Солнце, Земля и Луна используют физику, но для наших 
целей мы подделаем это с помощью графа сцены.

```js
// массив объектов, направление которых обновляется
const objects = [];

// использовать только одну сферу для всего
const radius = 1;
const widthSegments = 6;
const heightSegments = 6;
const sphereGeometry = new THREE.SphereBufferGeometry(
    radius, widthSegments, heightSegments);

const sunMaterial = new THREE.MeshPhongMaterial({emissive: 0xFFFF00});
const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
sunMesh.scale.set(5, 5, 5);  // сделать солнце большим
scene.add(sunMesh);
objects.push(sunMesh);
```

Мы используем действительно низкополигональную сферу. 
Всего 6 разделений вокруг его экватора. Это так легко увидеть вращение.

Мы собираемся повторно использовать одну и ту же сферу для всего, 
поэтому мы установим масштаб для солнечной полигональной сетки (mesh) в 5x.

Мы также устанавливаем свойство материала "Затенение по Фонгу" `emissive` желтым. 
Излучающее (emissive) свойство материала Phong - это цвет, который будет рисоваться 
без попадания света на поверхность. Свет добавляется к этому цвету.

Давайте также поместим один точечный источник света в центр сцены. Мы рассмотрим 
более подробно о точечных источниках света позже, но пока простая версия 
представляет собой точечный источник света.

```js
{
  const color = 0xFFFFFF;
  const intensity = 3;
  const light = new THREE.PointLight(color, intensity);
  scene.add(light);
}
```

Чтобы было легче увидеть, мы поместим камеру прямо над источником, смотря вниз. 
Самый простой способ сделать это - использовать `lookAt`. `lookAt`
Функция будет ориентировать камеру из своего положения в "смотриНа 
точку переданную `lookAt`. Перед тем, как сделать это, мы должны сказать 
камере, в какую сторону направлена верхняя часть камеры или, скорее, 
в какой стороне "верх" для камеры. Для большинства ситуаций положительный 
Y - это достаточно хорошо, но, так как мы смотрим прямо вниз, 
мы должны сказать камере, что положительный Z - вверхy.

```js
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 50, 0);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);
```

В цикле отрисовки, переделанном из предыдущих примеров, 
мы вращаем все объекты в нашем массиве `objects` с помощью этого кода.

```js
objects.forEach((obj) => {
  obj.rotation.y = time;
});
```

Так как мы добавили `sunMesh` в массив `objects` он будет вращаться.

{{{example url="../threejs-scenegraph-sun.html" }}}

Теперь давайте добавим землю.

```js
const earthMaterial = new THREE.MeshPhongMaterial({color: 0x2233FF, emissive: 0x112244});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
earthMesh.position.x = 10;
scene.add(earthMesh);
objects.push(earthMesh);
```

Мы создаем материал синего цвета, но мы дали ему небольшое количество *излучающего* 
синего цвета, чтобы он отображался на черном фоне.

Мы используем ту же `sphereGeometry` с нашим новым синим `earthMaterial` чтобы сделать 
`earthMesh`. Мы размещаем эти 10 единиц слева от солнца и добавляем их в сцену. 
Поскольку мы добавили его в наш массив `objects`, он тоже будет вращаться.

{{{example url="../threejs-scenegraph-sun-earth.html" }}}

Вы можете видеть, что Солнце и Земля вращаются, но Земля не вращается вокруг Солнца. 
Давайте сделаем землю дитя солнца

```js
-scene.add(earthMesh);
+sunMesh.add(earthMesh);
``` 

а также...

{{{example url="../threejs-scenegraph-sun-earth-orbit.html" }}}

Что случилось? Почему Земля такого же размера, как Солнце, и почему она так далеко? 
На самом деле мне пришлось передвинуть камеру с 50 единиц сверху до 150 единиц 
сверху, чтобы увидеть Землю.

Мы сделали `earthMesh` ребенком `sunMesh`. `sunMesh` масштабирован на 5x 
из-за `sunMesh.scale.set(5, 5, 5)`. Это означает, что локальное пространство
`sunMesh` в 5 раз больше.  Все, что помещено в это пространство, будет умножено на 5. 
Это означает, что Земля теперь в 5 раз больше и расстояние от Солнца 
(`earthMesh.position.x = 10`) также в 5 раз.

Наш граф сцены в настоящее время выглядит следующим образом

<img src="../resources/images/scenegraph-sun-earth.svg" align="center">

Чтобы это исправить, давайте добавим пустой узел графа сцены. 
Мы будем связывать солнце и землю с этим узлом.

```js
+const solarSystem = new THREE.Object3D();
+scene.add(solarSystem);
+objects.push(solarSystem);

const sunMaterial = new THREE.MeshPhongMaterial({emissive: 0xFFFF00});
const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
sunMesh.scale.set(5, 5, 5);
-scene.add(sunMesh);
+solarSystem.add(sunMesh);
objects.push(sunMesh);

const earthMaterial = new THREE.MeshPhongMaterial({color: 0x2233FF, emissive: 0x112244});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
earthMesh.position.x = 10;
-sunMesh.add(earthMesh);
+solarSystem.add(earthMesh);
objects.push(earthMesh);
```

Здесь мы сделали `Object3D`. Как и `Mesh` он также является узлом в графе сцены, 
но в отличие от `Mesh` он не имеет материала или геометрии. Это просто 
представляет локальное пространство.

Наш новый граф сцены выглядит следующим образом

<img src="../resources/images/scenegraph-sun-earth-fixed.svg" align="center">

И `sunMesh` и `earthMesh` дети `solarSystem`. Все 3 вращаются, и теперь, 
поскольку они не являются потомками `earthMesh`, `sunMesh` больше не 
масштабируются в 5 раз.

{{{example url="../threejs-scenegraph-sun-earth-orbit-fixed.html" }}}

Намного лучше. Земля меньше Солнца, и она вращается вокруг Солнца и вращается сама.

Продолжая ту же самую модель, давайте добавим луну.

```js
+const earthOrbit = new THREE.Object3D();
+earthOrbit.position.x = 10;
+solarSystem.add(earthOrbit);
+objects.push(earthOrbit);

const earthMaterial = new THREE.MeshPhongMaterial({color: 0x2233FF, emissive: 0x112244});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
-solarSystem.add(earthMesh);
+earthOrbit.add(earthMesh);
objects.push(earthMesh);

+const moonOrbit = new THREE.Object3D();
+moonOrbit.position.x = 2;
+earthOrbit.add(moonOrbit);

+const moonMaterial = new THREE.MeshPhongMaterial({color: 0x888888, emissive: 0x222222});
+const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
+moonMesh.scale.set(.5, .5, .5);
+moonOrbit.add(moonMesh);
+objects.push(moonMesh);
```

Снова мы добавили еще один невидимый узел графа сцены `Object3D` под названием `earthOrbit`
и добавили `earthMesh` и `moonMesh` к нему. Новый граф сцены выглядит следующим образом.

<img src="../resources/images/scenegraph-sun-earth-moon.svg" align="center">

и вот что

{{{example url="../threejs-scenegraph-sun-earth-moon.html" }}}

Вы можете видеть, что луна следует шаблону спирографа, показанному в верхней части этой 
статьи, но нам не пришлось вычислять ее вручную. Мы просто настраиваем наш 
граф сцены, чтобы он сделал это за нас.

Часто полезно рисовать что-то для визуализации узлов в графе сцены. 
Three.js имеет несколько полезных ... ммм, помощников ... помоающих с этим.

Один называется `AxesHelper`. Он рисует 3 линии, представляющие локальные оси
<span style="color:red">X</span>,
<span style="color:green">Y</span>, и
<span style="color:blue">Z</span> Давайте добавим по одному к каждому узлу, 
который мы создали.

```js
// добавляем AxesHelper к каждому узлу
objects.forEach((node) => {
  const axes = new THREE.AxesHelper();
  axes.material.depthTest = false;
  axes.renderOrder = 1;
  node.add(axes);
});
```

В нашем случае мы хотим, чтобы оси появлялись, даже если они находятся внутри сфер. 
Чтобы сделать это, мы устанавливаем для их материала `depthTest` значение false, 
что означает, что они не будут проверять, что они рисуются за чем-то другим. 
Мы также устанавливаем их `renderOrder` в 1 (по умолчанию 0), чтобы они 
рисовались после всех сфер. В противном случае сфера может накрыть их и закрыть их.

{{{example url="../threejs-scenegraph-sun-earth-moon-axes.html" }}}

Мы можем видеть оси
<span style="color:red">x (красная)</span> и
<span style="color:blue">z (синяя)</span> Поскольку мы смотрим прямо вниз, и каждый 
из наших объектов вращается только вокруг своей оси y, мы не видим большую часть 
осей <span style="color:green">y (зеленая)</span>.

Может быть трудно увидеть некоторые из них, так как есть две пары перекрывающихся осей. 
И `sunMesh` и  `solarSystem` находятся в одинаковом положении. Точно так же `earthMesh` и
`earthOrbit`находятся в той же позиции. Давайте добавим несколько простых элементов управления, 
чтобы мы могли включать и выключать их для каждого узла. Пока мы делаем это, 
давайте также добавим еще одного помощника под названием `GridHelper`. 
Создающего двумерную сетку на плоскости X, Z. По умолчанию сетка составляет 
10х10 единиц.

Мы также собираемся использовать [dat.GUI](https://github.com/dataarts/dat.gui) 
библиотеку пользовательского интерфейса, которая очень популярна в проектах Three.js. 
dat.GUI принимает объект и имя свойства для этого объекта и в зависимости от типа 
свойства автоматически создает пользовательский интерфейс для управления этим свойством.

Мы хотим сделать `GridHelper` и `AxesHelper` для каждого узла. Нам нужна метка для каждого 
узла, поэтому мы избавимся от старого цикла и переключимся на вызов некоторой 
функции, чтобы добавить помощники для каждого узла

```js
-// добавляем AxesHelper к каждому узлу
-objects.forEach((node) => {
-  const axes = new THREE.AxesHelper();
-  axes.material.depthTest = false;
-  axes.renderOrder = 1;
-  node.add(axes);
-});

+function makeAxisGrid(node, label, units) {
+  const helper = new AxisGridHelper(node, units);
+  gui.add(helper, 'visible').name(label);
+}
+
+makeAxisGrid(solarSystem, 'solarSystem', 25);
+makeAxisGrid(sunMesh, 'sunMesh');
+makeAxisGrid(earthOrbit, 'earthOrbit');
+makeAxisGrid(earthMesh, 'earthMesh');
+makeAxisGrid(moonMesh, 'moonMesh');
```

`makeAxisGrid` делает `AxisGridHelper` класс, который мы создадим, 
чтобы сделать dat.GUI счастливым. Как сказано выше, dat.GUI автоматически 
создаст пользовательский интерфейс, который манипулирует именованным свойством 
некоторого объекта. Это создаст другой пользовательский интерфейс в зависимости 
от типа свойства. Мы хотим, чтобы он создал флажок, поэтому нам нужно указать 
`bool` свойство. Но мы хотим, чтобы и оси, и сетка появлялись / исчезали на основе 
одного свойства, поэтому мы создадим класс, который имеет метод получения и 
установки для свойства. Таким образом, мы можем позволить dat.GUI думать, 
что он манипулирует одним свойством, но внутри мы можем установить видимое 
свойство `AxesHelper` и `GridHelper` для узла.

```js
// Для включения и выключения видимых осей и сетки
// dat.GUI требуется свойство, которое возвращает bool
// это checkbox мы сделали сеттер и геттер
// чтобы получить значение для `visible` от dat.GUI
class AxisGridHelper {
  constructor(node, units = 10) {
    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 2;  // после сетки
    node.add(axes);

    const grid = new THREE.GridHelper(units, units);
    grid.material.depthTest = false;
    grid.renderOrder = 1;
    node.add(grid);

    this.grid = grid;
    this.axes = axes;
    this.visible = false;
  }
  get visible() {
    return this._visible;
  }
  set visible(v) {
    this._visible = v;
    this.grid.visible = v;
    this.axes.visible = v;
  }
}
```

Мы устанавливаем `renderOrder` в `AxesHelper`
равным 2, а для `GridHelper` равным 1 так, что оси втянуться после появления сетки. 
В противном случае сетка может перезаписать оси.

{{{example url="../threejs-scenegraph-sun-earth-moon-axes-grids.html" }}}

Включите `solarSystem` и вы увидите, что Земля находится точно в 10 единицах от центра, 
как мы установили выше. Вы можете увидеть , как земля находится в 
*локальном пространстве* `solarSystem`. Включите `earthOrbit` и вы увидите, 
как луна ровно на 2 единицы от центра *локального пространства* `earthOrbit`.

Еще несколько примеров графов сцены. Автомобиль в простом игровом мире 
может иметь такой граф сцены

<img src="../resources/images/scenegraph-car.svg" align="center">

Если вы двигаете кузов автомобиля, все колеса будут двигаться вместе с ним. 
Если вы хотите, чтобы кузов отскакивал отдельно от колес, вы можете привязать 
тело и колеса к "рамному" узлу, который представляет раму автомобиля.

Другой пример - человек в игровом мире.

<img src="../resources/images/scenegraph-human.svg" align="center">

Вы можете видеть, что график сцены становится довольно сложным для человека. 
На самом деле этот граф сцены упрощен. Например, вы можете расширить его, 
чтобы охватить каждый палец (по крайней мере, еще 28 узлов) и каждый палец 
(еще 28 узлов), плюс для челюсти, глаз и, возможно, больше.

Я надеюсь, что это дает некоторое представление о том, как работает граф сцены 
и как вы можете его использовать. Создание `Object3D` узлов и родительских 
объектов для них - важный шаг к хорошему использованию трехмерного движка, 
такого как three.js. Часто может показаться, что какая-то сложная математика 
необходима, чтобы заставить что-то двигаться и вращаться так, как вы хотите. 
Например, без графа сцены, вычисляющего движение луны или куда поставить 
колеса автомобиля относительно его тела, было бы очень сложно, но с 
помощью графа сцены это становится намного проще.

[Далее мы пройдемся по материалам](threejs-materials.html).