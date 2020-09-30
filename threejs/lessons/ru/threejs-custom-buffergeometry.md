Title: Three.js Пользовательская BufferGeometry
Description: Создание собственной геометрии BufferGeometry.
TOC: Пользовательская BufferGeometry

В [предыдущей статье](threejs-custom-geometry.html) рассказывалось, как использовать `Geometry`. Эта статья о `BufferGeometry`. `BufferGeometry` обычно быстрее запускается и использует меньше памяти, но может быть сложнее в настройке. 

В [статье о Geometry](threejs-custom-geometry.html) мы рассказали, что для использования `Geometry` вы предоставляете массив вершин `Vector3` (позиций). 
Затем вы создаете объекты `Face3`, определяя по индексу 3 вершины, которые составляют каждый треугольник фигуры, которую вы делаете.
Для каждого `Face3` вы можете указать либо нормаль грани, либо нормали для каждой отдельной вершины грани. 
Вы также можете указать цвет грани или отдельные цвета вершин. Наконец, вы можете создать параллельный массив массивов текстурных координат (UV), 
один массив для каждой грани, содержащий массив UV, один для каждой вершины грани. 

<div class="threejs_center"><img src="resources/threejs-geometry.svg" style="width: 700px"></div>

`BufferGeometry` с другой стороны использует названный `BufferAttributes`. 
Каждый атрибут `BufferAttribute` представляет собой массив данных одного типа: позиции, нормали, цвета и ультрафиолетовые лучи. 
Вместе добавленные атрибуты `BufferAttributes` представляют параллельные массивы всех данных для каждой вершины. 

<div class="threejs_center"><img src="resources/threejs-attributes.svg" style="width: 700px"></div>

Вы можете видеть, что у нас есть 4 атрибута: `position`, `normal`, `color`, `uv`. 
Они представляют параллельные массивы, что означает, что N-й набор данных в каждом атрибуте принадлежит одной и той же вершине. 
Вершина с индексом = 4 подсвечивается, чтобы показать, что параллельные данные по всем атрибутам определяют одну вершину. 

Это поднимает точку, вот схема куба с одним выделенным углом. 

<div class="threejs_center"><img src="resources/cube-faces-vertex.svg" style="width: 500px"></div>

Думая об этом, один угол нуждается в разной нормали для каждой грани куба. 
Для каждой стороны тоже нужны разные ультрафиолеты. Это указывает на самую большую разницу между `Geometry` и `BufferGeometry`. Ничего общего с `BufferGeometry`.
Одна вершина - это комбинация всех ее частей. Если вершина нуждается в какой-либо части, то она должна быть другой. 

Правда в том, что когда вы используете `Geometry` three.js преобразует его в этот формат. 
Вот откуда появляется дополнительная память и время при использовании `Geometry`. 
Дополнительная память для всех объектов `Vector3s`, `Vector2s`, `Face3s` и массива, а затем дополнительное время для преобразования всех этих данных
в параллельные массивы в форме атрибутов `BufferAttributes`, как указано выше. 
Иногда это облегчает использование Geometry. С `BufferGeometry` мы можем предоставить данные, уже преобразованные в этот формат. 

В качестве простого примера давайте сделаем куб, используя `BufferGeometry`.
Куб интересен тем, что кажется, что он разделяет вершины в углах, но на самом деле это не так. В нашем примере мы перечислим все вершины со всеми их данными,
а затем преобразуем эти данные в параллельные массивы и, наконец, используем их для создания атрибутов `Buffer` и добавления их в `BufferGeometry`. 

Начиная с примера координат текстуры из предыдущей статьи, мы удалили весь код, связанный с настройкой `Geometry`. 
Затем мы перечисляем все данные, необходимые для куба. Помните еще раз, что если вершина имеет какие-либо уникальные части, она должна быть отдельной вершиной. 
Для создания куба необходимо 36 вершин. 2 треугольника на грань, 3 вершины на треугольник, 6 граней = 36 вершин. 

```js
const vertices = [
  // front
  { pos: [-1, -1,  1], norm: [ 0,  0,  1], uv: [0, 0], },
  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], },

  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], },
  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 0,  0,  1], uv: [1, 1], },
  // right
  { pos: [ 1, -1,  1], norm: [ 1,  0,  0], uv: [0, 0], },
  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], },

  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], },
  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
  { pos: [ 1,  1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
  // back
  { pos: [ 1, -1, -1], norm: [ 0,  0, -1], uv: [0, 0], },
  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], },

  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], },
  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
  { pos: [-1,  1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
  // left
  { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 0], },
  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], },
  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], },

  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], },
  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], },
  { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 1], },
  // top
  { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 0], },
  { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], },

  { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], },
  { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], },
  { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 1], },
  // bottom
  { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 0], },
  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], },
  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], },

  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], },
  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], },
  { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 1], },
];
```

Затем мы можем перевести все это в 3 параллельных массива 
```js
const positions = [];
const normals = [];
const uvs = [];
for (const vertex of vertices) {
  positions.push(...vertex.pos);
  normals.push(...vertex.norm);
  uvs.push(...vertex.uv);
}
```

Наконец, мы можем создать `BufferGeometry`, а затем `BufferAttribute` для каждого массива и добавить его в `BufferGeometry`.

```js
  const geometry = new THREE.BufferGeometry();
  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;
  geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
  geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
  geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
```

Обратите внимание, что имена являются значительными. Вы должны назвать свои атрибуты именами, которые соответствуют ожиданиям three.js 
(если вы не создаете пользовательский шейдер). В этом случае `position`, `normal` и `uv`. Если вы хотите цвета вершин, назовите свой атрибут `color`. 

Выше мы создали 3 собственных массива JavaScript, `positions`, `normals`  и `uvs` . Затем мы конвертируем их в 
[TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
типа Float32Array. Атрибут `BufferAttribute` требует TypedArray, а не собственного массива. Атрибут `BufferAttribute` также требует, чтобы вы указали,
сколько компонентов в каждой вершине. Для позиций и нормалей у нас есть 3 компонента на вершину, x, y и z. Для UV у нас есть 2, u и v. 

{{{example url="../threejs-custom-buffergeometry-cube.html"}}}

Это много данных. Небольшая вещь, которую мы можем сделать, это использовать индексы для ссылки на вершины. 
Оглядываясь назад на данные нашего куба, каждая грань состоит из 2 треугольников с 3 вершинами в каждом, всего 6 вершин, но 2 из этих вершин абсолютно одинаковы; 
Та же самая position, та же самая normal, и та же самая uv. 
Таким образом, мы можем удалить совпадающие вершины и затем ссылаться на них по индексу. Сначала мы удаляем совпадающие вершины. 

```js
const vertices = [
  // front
  { pos: [-1, -1,  1], norm: [ 0,  0,  1], uv: [0, 0], }, // 0
  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], }, // 1
  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], }, // 2
-
-  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], },
-  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 0,  0,  1], uv: [1, 1], }, // 3
  // right
  { pos: [ 1, -1,  1], norm: [ 1,  0,  0], uv: [0, 0], }, // 4
  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], }, // 5
-
-  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], },
-  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], }, // 6
  { pos: [ 1,  1, -1], norm: [ 1,  0,  0], uv: [1, 1], }, // 7
  // back
  { pos: [ 1, -1, -1], norm: [ 0,  0, -1], uv: [0, 0], }, // 8
  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], }, // 9
-
-  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], },
-  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], }, // 10
  { pos: [-1,  1, -1], norm: [ 0,  0, -1], uv: [1, 1], }, // 11
  // left
  { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 0], }, // 12
  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], }, // 13
-
-  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], },
-  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], },
  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], }, // 14
  { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 1], }, // 15
  // top
  { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 0], }, // 16
  { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], }, // 17
-
-  { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], },
-  { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], }, // 18
  { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 1], }, // 19
  // bottom
  { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 0], }, // 20
  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], }, // 21
-
-  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], },
-  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], },
  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], }, // 22
  { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 1], }, // 23
];
```

Итак, теперь у нас есть 24 уникальные вершины. 
Затем мы указываем 36 индексов для 36 вершин, которые нам нужно нарисовать, чтобы сделать 12 треугольников, вызывая `BufferGeometry.setIndex` с массивом индексов. 

```js
geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, positionNumComponents));
geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(normals, normalNumComponents));
geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute(uvs, uvNumComponents));

+geometry.setIndex([
+   0,  1,  2,   2,  1,  3,  // front
+   4,  5,  6,   6,  5,  7,  // right
+   8,  9, 10,  10,  9, 11,  // back
+  12, 13, 14,  14, 13, 15,  // left
+  16, 17, 18,  18, 17, 19,  // top
+  20, 21, 22,  22, 21, 23,  // bottom
+]);
```

{{{example url="../threejs-custom-buffergeometry-cube-indexed.html"}}}

Как и в `Geometry`, в `BufferGeometry` есть метод [`computeVertexNormals`](BufferGeometry.computeVertexNormals) для вычисления нормалей,
если вы их не предоставляете. В отличие от версии `Geometry` той же функции, 
поскольку позиции не могут быть общими, если любая другая часть вершины отличается, результаты вызова `computeVertexNormals` будут другими. 

<div class="spread">
  <div>
    <div data-diagram="bufferGeometryCylinder"></div>
    <div class="code">BufferGeometry</div>
  </div>
  <div>
    <div data-diagram="geometryCylinder"></div>
    <div class="code">Geometry</div>
  </div>
</div>

Вот 2 цилиндра, где нормали были созданы с использованием `computeVertexNormals`. 
Если вы посмотрите внимательно, на левом цилиндре есть шов. Это связано с тем, 
что нет возможности совместно использовать вершины в начале и конце цилиндра, так как они требуют разных UV.
Просто небольшая вещь, чтобы быть в курсе. 
Решение состоит в том, чтобы предоставить свои собственные normals. 

Мы также можем использовать [TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
с самого начала вместо собственных массивов JavaScript. Недостатком TypedArrays является то, что вы должны указать их размер заранее.
Конечно, это не так уж сложно, но с помощью собственных массивов мы можем просто `push` значения в них и посмотреть, 
какого размера они заканчиваются, проверив их `length` в конце.
В TypedArrays нет функции push, поэтому нам нужно вести собственную бухгалтерию при добавлении значений к ним. 

В этом примере узнать длину заранее довольно просто, так как для начала мы используем большой блок статических данных. 

```js
-const positions = [];
-const normals = [];
-const uvs = [];
+const numVertices = vertices.length;
+const positionNumComponents = 3;
+const normalNumComponents = 3;
+const uvNumComponents = 2;
+const positions = new Float32Array(numVertices * positionNumComponents);
+const normals = new Float32Array(numVertices * normalNumComponents);
+const uvs = new Float32Array(numVertices * uvNumComponents);
+let posNdx = 0;
+let nrmNdx = 0;
+let uvNdx = 0;
for (const vertex of vertices) {
-  positions.push(...vertex.pos);
-  normals.push(...vertex.norm);
-  uvs.push(...vertex.uv);
+  positions.set(vertex.pos, posNdx);
+  normals.set(vertex.norm, nrmNdx);
+  uvs.set(vertex.uv, uvNdx);
+  posNdx += positionNumComponents;
+  nrmNdx += normalNumComponents;
+  uvNdx += uvNumComponents;
}

geometry.setAttribute(
    'position',
-    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
+    new THREE.BufferAttribute(positions, positionNumComponents));
geometry.setAttribute(
    'normal',
-    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
+    new THREE.BufferAttribute(normals, normalNumComponents));
geometry.setAttribute(
    'uv',
-    new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
+    new THREE.BufferAttribute(uvs, uvNumComponents));

geometry.setIndex([
   0,  1,  2,   2,  1,  3,  // front
   4,  5,  6,   6,  5,  7,  // right
   8,  9, 10,  10,  9, 11,  // back
  12, 13, 14,  14, 13, 15,  // left
  16, 17, 18,  18, 17, 19,  // top
  20, 21, 22,  22, 21, 23,  // bottom
]);
```

{{{example url="../threejs-custom-buffergeometry-cube-typedarrays.html"}}}

Хорошая причина использовать typedarrays - если вы хотите динамически обновлять любую часть вершин. 

Я не мог придумать действительно хороший пример динамического обновления вершин,
поэтому я решил создать сферу и переместить каждый четырехугольник внутрь и наружу от центра. Надеюсь, это полезный пример. 

Вот код для генерации позиций и индексов для сферы. Код разделяет вершины внутри четырехугольника, 
но не разделяет вершины между четырьмя, потому что мы хотим иметь возможность перемещать каждый четырёхугольник по отдельности. 

Поскольку я ленивый, я использовал небольшую иерархию из 3 объектов Object3D для вычисления точек сферы. Как это работает, объясняется в
[статье об оптимизации множества объектов. ](threejs-optimize-lots-of-objects.html).

```js
function makeSpherePositions(segmentsAround, segmentsDown) {
  const numVertices = segmentsAround * segmentsDown * 6;
  const numComponents = 3;
  const positions = new Float32Array(numVertices * numComponents);
  const indices = [];

  const longHelper = new THREE.Object3D();
  const latHelper = new THREE.Object3D();
  const pointHelper = new THREE.Object3D();
  longHelper.add(latHelper);
  latHelper.add(pointHelper);
  pointHelper.position.z = 1;
  const temp = new THREE.Vector3();

  function getPoint(lat, long) {
    latHelper.rotation.x = lat;
    longHelper.rotation.y = long;
    longHelper.updateMatrixWorld(true);
    return pointHelper.getWorldPosition(temp).toArray();
  }

  let posNdx = 0;
  let ndx = 0;
  for (let down = 0; down < segmentsDown; ++down) {
    const v0 = down / segmentsDown;
    const v1 = (down + 1) / segmentsDown;
    const lat0 = (v0 - 0.5) * Math.PI;
    const lat1 = (v1 - 0.5) * Math.PI;

    for (let across = 0; across < segmentsAround; ++across) {
      const u0 = across / segmentsAround;
      const u1 = (across + 1) / segmentsAround;
      const long0 = u0 * Math.PI * 2;
      const long1 = u1 * Math.PI * 2;

      positions.set(getPoint(lat0, long0), posNdx);  posNdx += numComponents;
      positions.set(getPoint(lat1, long0), posNdx);  posNdx += numComponents;
      positions.set(getPoint(lat0, long1), posNdx);  posNdx += numComponents;
      positions.set(getPoint(lat1, long1), posNdx);  posNdx += numComponents;

      indices.push(
        ndx, ndx + 1, ndx + 2,
        ndx + 2, ndx + 1, ndx + 3,
      );
      ndx += 4;
    }
  }
  return {positions, indices};
}
```

Затем мы можем вызвать это так

```js
const segmentsAround = 24;
const segmentsDown = 16;
const {positions, indices} = makeSpherePositions(segmentsAround, segmentsDown);
```

Поскольку возвращаемые позиции являются позициями единичных сфер, 
они являются точно такими же значениями, которые нам нужны для нормалей, поэтому мы можем просто дублировать их для нормалей. 

```js
const normals = positions.slice();
```

И тогда мы устанавливаем атрибуты, как раньше

```js
const geometry = new THREE.BufferGeometry();
const positionNumComponents = 3;
const normalNumComponents = 3;

+const positionAttribute = new THREE.BufferAttribute(positions, positionNumComponents);
+positionAttribute.setUsage(THREE.DynamicDrawUsage);
geometry.setAttribute(
    'position',
+    positionAttribute);
geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(normals, normalNumComponents));
geometry.setIndex(indices);
```

Я выделил несколько различий. Мы сохраняем ссылку на атрибут позиции.
Мы также отмечаем его как динамический. Это намек на THREE.js, что мы будем часто менять содержимое атрибута. 

В нашем цикле рендеринга мы обновляем позиции на основе их нормалей каждый кадр.

```js
const temp = new THREE.Vector3();

...

for (let i = 0; i < positions.length; i += 3) {
  const quad = (i / 12 | 0);
  const ringId = quad / segmentsAround | 0;
  const ringQuadId = quad % segmentsAround;
  const ringU = ringQuadId / segmentsAround;
  const angle = ringU * Math.PI * 2;
  temp.fromArray(normals, i);
  temp.multiplyScalar(THREE.MathUtils.lerp(1, 1.4, Math.sin(time + ringId + angle) * .5 + .5));
  temp.toArray(positions, i);
}
positionAttribute.needsUpdate = true;
```

И мы устанавливаем `positionAttribute.needsUpdate`, чтобы THREE.js указывал использовать наши изменения.

{{{example url="../threejs-custom-buffergeometry-dynamic.html"}}}

Я надеюсь, что это были полезные примеры того, как использовать
`BufferGeometry` напрямую для создания собственной геометрии и как динамически 
обновлять содержимое `BufferAttribute`. То, что вы используете, `Geometry` или `BufferGeometry`, 
действительно зависит от ваших потребностей. 

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-custom-buffergeometry.js"></script>

