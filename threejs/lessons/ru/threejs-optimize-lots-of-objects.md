Title: Three.js Оптимизация большого количества объектов
Description: Оптимизация путем объединения объектов
TOC: Оптимизация большого количества объектов

Эта статья является частью серии статей о three.js. Первая статья - [основы Three.js](threejs-fundamentals.html). 
Если вы еще не читали это, и вы новичок в three.js, вы можете начать там. 

Есть много способов оптимизировать вещи для three.js. Один из способов часто называют геометрией слияния.
Каждая созданная вами сетка и three.js представляют 1 или более запросов системы на что-то нарисовать.
Рисование 2 вещей имеет больше затрат, чем рисование 1, 
даже если результаты одинаковы, поэтому одним из способов оптимизации является объединение сеток. 

Давайте посмотрим пример, когда это хорошее решение для проблемы. Давайте заново создадим [WebGL Globe](https://globe.chromeexperiments.com/).

Первое, что нам нужно сделать, это получить данные. WebGL Globe сказал, что данные, которые они используют, взяты из [SEDAC](http://sedac.ciesin.columbia.edu/gpw/). 
Проверяя сайт, я увидел  [демографические данные в виде сетки](https://beta.sedac.ciesin.columbia.edu/data/set/gpw-v4-basic-demographic-characteristics-rev10).
Я загрузил данные с 60-минутным разрешением. Затем я посмотрел на данные 

Это выглядит так 


```txt
 ncols         360
 nrows         145
 xllcorner     -180
 yllcorner     -60
 cellsize      0.99999999999994
 NODATA_value  -9999
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 9.241768 8.790958 2.095345 -9999 0.05114867 -9999 -9999 -9999 -9999 -999...
 1.287993 0.4395509 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
```

Есть несколько строк, похожих на пары ключ / значение, за которыми следуют строки со значением для каждой точки сетки, по одной строке для каждой строки точек данных. 

Чтобы убедиться, что мы понимаем данные, давайте попробуем построить их в 2D. 

Сначала немного кода для загрузки текстового файла 

```js
async function loadFile(url) {
  const req = await fetch(url);
  return req.text();
}
```

Приведенный выше код возвращает `Promise` с содержимым файла по адресу `url`; 

Тогда нам нужен код для разбора файла 

```js
function parseData(text) {
  const data = [];
  const settings = {data};
  let max;
  let min;
  // split into lines
  text.split('\n').forEach((line) => {
    // split the line by whitespace
    const parts = line.trim().split(/\s+/);
    if (parts.length === 2) {
      // only 2 parts, must be a key/value pair
      settings[parts[0]] = parseFloat(parts[1]);
    } else if (parts.length > 2) {
      // more than 2 parts, must be data
      const values = parts.map((v) => {
        const value = parseFloat(v);
        if (value === settings.NODATA_value) {
          return undefined;
        }
        max = Math.max(max === undefined ? value : max, value);
        min = Math.min(min === undefined ? value : min, value);
        return value;
      });
      data.push(values);
    }
  });
  return Object.assign(settings, {min, max});
}
```

Приведенный выше код возвращает объект со всеми парами ключ / значение из файла,
а также свойство `data` со всеми данными в одном большом массиве и значениями `min` и `max`, найденными в данных. 

Тогда нам нужен код для рисования этих данных 

```js
function drawData(file) {
  const {min, max, data} = file;
  const range = max - min;
  const ctx = document.querySelector('canvas').getContext('2d');
  // make the canvas the same size as the data
  ctx.canvas.width = ncols;
  ctx.canvas.height = nrows;
  // but display it double size so it's not too small
  ctx.canvas.style.width = px(ncols * 2);
  ctx.canvas.style.height = px(nrows * 2);
  // fill the canvas to dark gray
  ctx.fillStyle = '#444';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // draw each data point
  data.forEach((row, latNdx) => {
    row.forEach((value, lonNdx) => {
      if (value === undefined) {
        return;
      }
      const amount = (value - min) / range;
      const hue = 1;
      const saturation = 1;
      const lightness = amount;
      ctx.fillStyle = hsl(hue, saturation, lightness);
      ctx.fillRect(lonNdx, latNdx, 1, 1);
    });
  });
}

function px(v) {
  return `${v | 0}px`;
}

function hsl(h, s, l) {
  return `hsl(${h * 360 | 0},${s * 100 | 0}%,${l * 100 | 0}%)`;
}
```

И, наконец, склеив все это 

```js
loadFile('resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc')
  .then(parseData)
  .then(drawData);
```

Дает нам этот результат 

{{{example url="../gpw-data-viewer.html" }}}

Так что, кажется, это работает. 

Давайте попробуем это в 3D. Начиная с кода от [рендеринга по требованию](threejs-rendering-on-demand.html) мы сделаем один блок на данные в файле. 

Сначала давайте сделаем простую сферу с текстурой мира. Вот текстура 

<div class="threejs_center"><img src="../resources/images/world.jpg" style="width: 600px"></div>

И код для его настройки. 

```js
{
  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/images/world.jpg', render);
  const geometry = new THREE.SphereBufferGeometry(1, 64, 32);
  const material = new THREE.MeshBasicMaterial({map: texture});
  scene.add(new THREE.Mesh(geometry, material));
}
```

Обратите внимание на вызов для рендеринга после завершения загрузки текстуры. Нам это нужно, потому что мы выполняем  [рендеринг по требованию](threejs-rendering-on-demand.html) 
а не постоянно, поэтому нам нужно рендерить один раз при загрузке текстуры. 

Затем нам нужно изменить код, который рисует точку на точку данных выше, чтобы вместо этого создать прямоугольник для точки данных. 

```js
function addBoxes(file) {
  const {min, max, data} = file;
  const range = max - min;

  // make one box geometry
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxBufferGeometry(boxWidth, boxHeight, boxDepth);
  // make it so it scales away from the positive Z axis
  geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0.5));

  // these helpers will make it easy to position the boxes
  // We can rotate the lon helper on its Y axis to the longitude
  const lonHelper = new THREE.Object3D();
  scene.add(lonHelper);
  // We rotate the latHelper on its X axis to the latitude
  const latHelper = new THREE.Object3D();
  lonHelper.add(latHelper);
  // The position helper moves the object to the edge of the sphere
  const positionHelper = new THREE.Object3D();
  positionHelper.position.z = 1;
  latHelper.add(positionHelper);

  const lonFudge = Math.PI * .5;
  const latFudge = Math.PI * -0.135;
  data.forEach((row, latNdx) => {
    row.forEach((value, lonNdx) => {
      if (value === undefined) {
        return;
      }
      const amount = (value - min) / range;
      const material = new THREE.MeshBasicMaterial();
      const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
      const saturation = 1;
      const lightness = THREE.MathUtils.lerp(0.1, 1.0, amount);
      material.color.setHSL(hue, saturation, lightness);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // adjust the helpers to point to the latitude and longitude
      lonHelper.rotation.y = THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge;
      latHelper.rotation.x = THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge;

      // use the world matrix of the position helper to
      // position this mesh.
      positionHelper.updateWorldMatrix(true, false);
      mesh.applyMatrix4(positionHelper.matrixWorld);

      mesh.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount));
    });
  });
}
```

Код в основном прямо из нашего тестового кода рисования. 

Мы делаем одну коробку и корректируем ее центр так, чтобы она масштабировалась от положительного Z. 
Если бы мы этого не делали, она бы масштабировалась от центра, но мы хотим, чтобы они росли от начала координат. 


<div class="spread">
  <div>
    <div data-diagram="scaleCenter" style="height: 250px"></div>
    <div class="code">default</div>
  </div>
  <div>
    <div data-diagram="scalePositiveZ" style="height: 250px"></div>
    <div class="code">adjusted</div>
  </div>
</div>

Конечно, мы могли бы также решить эту проблему, добавив в родительский блок больше объектов 
THREE.Object3D, как мы покрывали в [графах сцены](threejs-scenegraph.html) 
но чем больше узлов мы добавляем в граф сцены, тем медленнее он становится. 


Мы также настраиваем эту небольшую иерархию узлов `lonHelper`, `latHelper` и `positionHelper`.
Мы используем эти объекты, чтобы вычислить положение вокруг сферы, чтобы разместить коробку. 

<div class="spread">
  <div data-diagram="lonLatPos" style="width: 600px; height: 400px;"></div>
</div>

Над <span style="color: green;">зелёной полосой</span> изображен  `lonHelper` и используется для поворота в направлении долготы на экваторе.
<span style="color: blue;">Синяя полоса</span> обозначает `latHelper` который используется для поворота на широту выше или ниже экватора. 
<span style="color: red;">Красная сфера</span> представляет смещение, которое обеспечивает этот `positionHelper`.

Мы могли бы сделать всю математику вручную, чтобы выяснить позиции на земном шаре, но, делая это таким образом,
мы оставляем большую часть математики самой библиотеке, поэтому нам не нужно иметь с ней дело. 

Для каждой точки данных мы создаем `MeshBasicMaterial` и `Mesh`, а затем запрашиваем мировую матрицу
`positionHelper` и применяем ее к новой `Mesh`. Наконец мы масштабируем сетку в новой позиции. 

Как и выше, мы могли бы также создать `latHelper`, `lonHelper` и `positionHelper` для каждого нового окна, но это было бы еще медленнее. 

Мы собираемся создать до 360х145 коробок. Это до 52000 коробок. 
Поскольку некоторые точки данных помечены как «NO_DATA», фактическое
количество блоков, которые мы собираемся создать, составляет около 19000. 
Если бы мы добавили 3 дополнительных вспомогательных объекта в блок,
это было бы почти 80000 узлов графа сцены, которые THREE.js должен был бы 
вычислить. позиции для. Вместо этого, используя один набор помощников, 
чтобы просто расположить сетки, мы экономим около 60000 операций. 


Примечание о `lonFudge` и `latFudge`. `lonFudge` равен π / 2, что составляет четверть оборота. 
В этом есть смысл. Это просто означает, что текстура или координаты текстуры начинаются 
с другого смещения по всему земному шару. `latFudge` с другой стороны, я понятия не имею, 
почему он должен быть π * -0,135, это просто количество, которое выровняло боксы с текстурой. 


Последнее, что нам нужно сделать, это вызвать нашего загрузчика 

```
loadFile('resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc')
  .then(parseData)
-  .then(drawData)
+  .then(addBoxes)
+  .then(render);
```

После того, как данные закончили загрузку и анализ, нам нужно выполнить рендеринг хотя бы один раз, поскольку мы выполняем 
 [рендеринг по требованию](threejs-rendering-on-demand.html).

{{{example url="../threejs-lots-of-objects-slow.html" }}}

Если вы попытаетесь повернуть приведенный выше пример, перетащив образец, вы, вероятно, заметите, что он медленный. 

Мы можем проверить частоту кадров, [открыв devtools](threejs-debugging-javascript.html) и включив индикатор частоты кадров браузера.

<div class="threejs_center"><img src="resources/images/bring-up-fps-meter.gif"></div>

На моей машине я вижу частоту кадров ниже 20 кадров в секунду. 

<div class="threejs_center"><img src="resources/images/fps-meter.gif"></div>

Это не очень хорошо для меня, и я подозреваю, что многие люди имеют более медленные машины, которые сделали бы это еще хуже. Нам лучше взглянуть на оптимизацию. 


Для этой конкретной задачи мы можем объединить все блоки в одну геометрию. 
В настоящее время мы рисуем около 19000 коробок. Объединяя их в одну геометрию, мы удалили 18999 операций. 

Вот новый код для объединения блоков в одну геометрию. 

```js
function addBoxes(file) {
  const {min, max, data} = file;
  const range = max - min;

-  // make one box geometry
-  const boxWidth = 1;
-  const boxHeight = 1;
-  const boxDepth = 1;
-  const geometry = new THREE.BoxBufferGeometry(boxWidth, boxHeight, boxDepth);
-  // make it so it scales away from the positive Z axis
-  geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0.5));

  // these helpers will make it easy to position the boxes
  // We can rotate the lon helper on its Y axis to the longitude
  const lonHelper = new THREE.Object3D();
  scene.add(lonHelper);
  // We rotate the latHelper on its X axis to the latitude
  const latHelper = new THREE.Object3D();
  lonHelper.add(latHelper);
  // The position helper moves the object to the edge of the sphere
  const positionHelper = new THREE.Object3D();
  positionHelper.position.z = 1;
  latHelper.add(positionHelper);
+  // Used to move the center of the box so it scales from the position Z axis
+  const originHelper = new THREE.Object3D();
+  originHelper.position.z = 0.5;
+  positionHelper.add(originHelper);

  const lonFudge = Math.PI * .5;
  const latFudge = Math.PI * -0.135;
+  const geometries = [];
  data.forEach((row, latNdx) => {
    row.forEach((value, lonNdx) => {
      if (value === undefined) {
        return;
      }
      const amount = (value - min) / range;

-      const material = new THREE.MeshBasicMaterial();
-      const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
-      const saturation = 1;
-      const lightness = THREE.MathUtils.lerp(0.1, 1.0, amount);
-      material.color.setHSL(hue, saturation, lightness);
-      const mesh = new THREE.Mesh(geometry, material);
-      scene.add(mesh);

+      const boxWidth = 1;
+      const boxHeight = 1;
+      const boxDepth = 1;
+      const geometry = new THREE.BoxBufferGeometry(boxWidth, boxHeight, boxDepth);

      // adjust the helpers to point to the latitude and longitude
      lonHelper.rotation.y = THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge;
      latHelper.rotation.x = THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge;

-      // use the world matrix of the position helper to
-      // position this mesh.
-      positionHelper.updateWorldMatrix(true, false);
-      mesh.applyMatrix4(positionHelper.matrixWorld);
-
-      mesh.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount));

+      // use the world matrix of the origin helper to
+      // position this geometry
+      positionHelper.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount));
+      originHelper.updateWorldMatrix(true, false);
+      geometry.applyMatrix4(originHelper.matrixWorld);
+
+      geometries.push(geometry);
    });
  });

+  const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
+      geometries, false);
+  const material = new THREE.MeshBasicMaterial({color:'red'});
+  const mesh = new THREE.Mesh(mergedGeometry, material);
+  scene.add(mesh);

}
```

Выше мы удалили код, который изменял центральную точку геометрии бокса,
и вместо этого делаем это, добавляя `originHelper`. Раньше мы использовали 
одну и ту же геометрию 19000 раз. На этот раз мы создаем новую геометрию
для каждого отдельного блока, и, поскольку мы будем использовать `applyMatrix` 
для перемещения вершин каждой геометрии блока, мы могли бы сделать это один раз, а не два. 


В конце мы передаем массив всех геометрий в `BufferGeometryUtils.mergeBufferGeometries`, который объединит их все в одну сетку. 


Нам также нужно включить `BufferGeometryUtils` 

```js
import {BufferGeometryUtils} from './resources/threejs/r122/examples/jsm/utils/BufferGeometryUtils.js';
```

И теперь, по крайней мере на моей машине, я получаю 60 кадров в секунду 

{{{example url="../threejs-lots-of-objects-merged.html" }}}

Так что это сработало, но поскольку это одна сетка, мы получаем только один материал, 
что означает, что мы получаем только один цвет, тогда как раньше у нас был другой цвет 
на каждой коробке. Мы можем исправить это, используя цвета вершин. 


Цвета вершин добавляют цвет для каждой вершины. Установив все цвета каждой 
вершины каждого блока на определенные цвета, каждый блок будет иметь другой цвет. 


```js
+const color = new THREE.Color();

const lonFudge = Math.PI * .5;
const latFudge = Math.PI * -0.135;
const geometries = [];
data.forEach((row, latNdx) => {
  row.forEach((value, lonNdx) => {
    if (value === undefined) {
      return;
    }
    const amount = (value - min) / range;

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxBufferGeometry(boxWidth, boxHeight, boxDepth);

    // adjust the helpers to point to the latitude and longitude
    lonHelper.rotation.y = THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge;
    latHelper.rotation.x = THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge;

    // use the world matrix of the origin helper to
    // position this geometry
    positionHelper.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount));
    originHelper.updateWorldMatrix(true, false);
    geometry.applyMatrix4(originHelper.matrixWorld);

+    // compute a color
+    const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
+    const saturation = 1;
+    const lightness = THREE.MathUtils.lerp(0.4, 1.0, amount);
+    color.setHSL(hue, saturation, lightness);
+    // get the colors as an array of values from 0 to 255
+    const rgb = color.toArray().map(v => v * 255);
+
+    // make an array to store colors for each vertex
+    const numVerts = geometry.getAttribute('position').count;
+    const itemSize = 3;  // r, g, b
+    const colors = new Uint8Array(itemSize * numVerts);
+
+    // copy the color into the colors array for each vertex
+    colors.forEach((v, ndx) => {
+      colors[ndx] = rgb[ndx % 3];
+    });
+
+    const normalized = true;
+    const colorAttrib = new THREE.BufferAttribute(colors, itemSize, normalized);
+    geometry.setAttribute('color', colorAttrib);

    geometries.push(geometry);
  });
});
```

Приведенный выше код ищет количество или вершины, 
необходимые для получения атрибута `position` из геометрии. 
Затем мы создаем `Uint8Array` для размещения цветов.
Затем он добавляет это как атрибут, вызывая `geometry.setAttribute`. 


Наконец, нам нужно указать three.js использовать цвета вершин. 

```js
const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
    geometries, false);
-const material = new THREE.MeshBasicMaterial({color:'red'});
+const material = new THREE.MeshBasicMaterial({
+  vertexColors: THREE.VertexColors,
+});
const mesh = new THREE.Mesh(mergedGeometry, material);
scene.add(mesh);
```

И с этим мы получаем наши цвета обратно 

{{{example url="../threejs-lots-of-objects-merged-vertexcolors.html" }}}

Объединение геометрии является распространенным методом оптимизации.
Например, вместо 100 деревьев вы можете объединить деревья в одну геометрию, 
кучу отдельных камней в одну геометрию камней, частокол из отдельных пикетов в одну сетку. 
Другой пример в Minecraft - он не рисует каждый куб по отдельности, а создает 
группы объединенных кубов, а также выборочно удаляет грани, которые никогда не видны. 


Проблема создания всего одного меша состоит в том, что больше не легко перемещать какие-либо части, которые были ранее разделены.
В зависимости от нашего варианта использования, хотя есть творческие решения. Мы рассмотрим одну в 
[другой статье](threejs-optimize-lots-of-objects-animated.html).

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-lots-of-objects.js"></script>
