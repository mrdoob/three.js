Title: Three.js Пользовательская Geometry
Description: Как сделать свою собственную геометрию.
TOC: Пользовательская Geometry

В [предыдущей статье](threejs-primitives.html) рассказывалось о различных встроенных примитивах, включенных в THREE.js. В этой статье мы рассмотрим создание нашей собственной геометрии. 

Просто для ясности, если вы серьезно относитесь к созданию 3D-контента, наиболее распространенный способ - использовать пакет 3D-моделирования, такой как [Blender](https://blender.org),
[Maya](https://www.autodesk.com/products/maya/overview),
[3D Studio Max](https://www.autodesk.com/products/3ds-max/overview),
[Cinema4D](https://www.maxon.net/en-us/) и т. д. 
Вы создадите модель, а затем экспортируете в [gLTF](threejs-load-gltf.html) или [.obj](threejs-load-obj.html) и загрузите их. 
Какой бы вариант вы ни выбрали, рассчитывайте потратить 2 или 3 недели на изучение соответствующих учебных пособий, поскольку все они имеют полезную кривую обучения. 

Тем не менее, бывают случаи, когда мы можем захотеть сгенерировать нашу собственную трехмерную геометрию в коде вместо использования пакета моделирования. 

Сначала давайте просто сделаем куб. Хотя Three.js уже предоставляет нам `BoxGeometry` и `BoxGeometry`, куб легко понять, поэтому давайте начнем с него. 

Есть два способа сделать пользовательскую геометрию в THREE.js. Один с классом `Geometry`, другой - `BufferGeometry`. У каждого есть свои преимущества. `Geometry`, возможно, проще в использовании, но медленнее и использует больше памяти. Для нескольких тысяч треугольников это отличный выбор, но для десятков тысяч треугольников может быть лучше использовать `BufferGeometry`. 

`BufferGeometry`, возможно, сложнее в использовании, но использует меньше памяти и работает быстрее. Если вы хотите сгенерировать более 10000 треугольников, подумайте об использовании `BufferGeometry`. 

Заметьте, когда я говорю, что `Geometry` медленнее, я имею в виду, что она медленнее запускается и медленнее изменяется, но отрисовывается она не медленнее, поэтому, если вы не планируете изменять свою геометрию, тогда, пока она не слишком велика, будет только немного больше. задержка для вашей программы, чтобы начать использовать `Geometry` против `BufferGeometry`. Мы изучим оба способа. Пока что давайте использовать геометрию, так как легче понять IMO. 

Сначала давайте сделаем куб с `Geometry`. Начнем с примера из [статьи об отзывчивости](threejs-responsive.html). 

Давайте удалим код, который использует `BoxGeometry`, и заменим ее на `Geometry`. 

```js
-const boxWidth = 1;
-const boxHeight = 1;
-const boxDepth = 1;
-const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
+const geometry = new THREE.Geometry();
```

Теперь давайте добавим 8 углов куба. Вот 8 углов. 

<div class="threejs_center"><img src="resources/cube-vertex-positions.svg" style="width: 500px"></div>

Сосредоточив вокруг начала координат, мы можем добавить позиции вершин, как это

```js
const geometry = new THREE.Geometry();
+geometry.vertices.push(
+  new THREE.Vector3(-1, -1,  1),  // 0
+  new THREE.Vector3( 1, -1,  1),  // 1
+  new THREE.Vector3(-1,  1,  1),  // 2
+  new THREE.Vector3( 1,  1,  1),  // 3
+  new THREE.Vector3(-1, -1, -1),  // 4
+  new THREE.Vector3( 1, -1, -1),  // 5
+  new THREE.Vector3(-1,  1, -1),  // 6
+  new THREE.Vector3( 1,  1, -1),  // 7
+);
```

Затем нам нужно сделать треугольники, по 2 на каждую грань куба
<div class="threejs_center"><img src="resources/cube-triangles.svg" style="width: 500px"></div>

Мы делаем это, создавая объекты `Face3` и определяя индексы 3 вершин, которые составляют эту грань.

Порядок, в котором мы указываем вершины, важен. Чтобы указывать на внешнюю сторону куба, они должны быть указаны в направлении против часовой стрелки, когда этот треугольник направлен на камеру. 

<div class="threejs_center"><img src="resources/cube-vertex-winding-order.svg" style="width: 500px"></div>

Следуя этой схеме, мы можем указать 12 треугольников, которые делают куб таким

```js
geometry.faces.push(
  // front
  new THREE.Face3(0, 3, 2),
  new THREE.Face3(0, 1, 3),
  // right
  new THREE.Face3(1, 7, 3),
  new THREE.Face3(1, 5, 7),
  // back
  new THREE.Face3(5, 6, 7),
  new THREE.Face3(5, 4, 6),
  // left
  new THREE.Face3(4, 2, 6),
  new THREE.Face3(4, 0, 2),
  // top
  new THREE.Face3(2, 7, 6),
  new THREE.Face3(2, 3, 7),
  // bottom
  new THREE.Face3(4, 1, 0),
  new THREE.Face3(4, 5, 1),
);
```

Несколько других мелких изменений в оригинальном коде, и он должен работать. 

Эти кубики в два раза больше, чем `BoxGeometry`, которую мы использовали раньше, поэтому давайте немного переместим камеру назад 

```js
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
-const far = 5;
+const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 2;
+camera.position.z = 5;
```

и давайте отделим их немного больше, и я изменил их цвета только потому, что
```js
const cubes = [
-  makeInstance(geometry, 0x44aa88,  0),
-  makeInstance(geometry, 0x8844aa, -2),
-  makeInstance(geometry, 0xaa8844,  2),
+  makeInstance(geometry, 0x44FF44,  0),
+  makeInstance(geometry, 0x4444FF, -4),
+  makeInstance(geometry, 0xFF4444,  4),
];
```

И последнее, что мы еще не добавили это нормалей, поэтому мы не можем включить освещение. Давайте изменим материал на то, что не нуждается в освещении. 

```js
function makeInstance(geometry, color, x) {
-  const material = new THREE.MeshPhongMaterial({color});
+  const material = new THREE.MeshBasicMaterial({color});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  ...
```

и мы получаем кубики, которые мы сделали сами.
{{{example url="../threejs-custom-geometry-cube.html" }}}

Мы можем указать цвет для каждой грани, установив свойство `color` каждой стороны.

```js
geometry.faces[ 0].color = geometry.faces[ 1].color = new THREE.Color('red');
geometry.faces[ 2].color = geometry.faces[ 3].color = new THREE.Color('yellow');
geometry.faces[ 4].color = geometry.faces[ 5].color = new THREE.Color('green');
geometry.faces[ 6].color = geometry.faces[ 7].color = new THREE.Color('cyan');
geometry.faces[ 8].color = geometry.faces[ 9].color = new THREE.Color('blue');
geometry.faces[10].color = geometry.faces[11].color = new THREE.Color('magenta');
```

обратите внимание, что мы должны указать материал, который мы хотим использовать `vertexColors`

```js
-const material = new THREE.MeshBasicMaterial({color});
+const material = new THREE.MeshBasicMaterial({vertexColors: true});
```

{{{example url="../threejs-custom-geometry-cube-face-colors.html" }}}

Вместо этого мы можем установить цвет каждой отдельной вершины, установив для свойства `vertexColors` массив из 3 цветов для 3 вершин. 

```js
geometry.faces.forEach((face, ndx) => {
  face.vertexColors = [
    (new THREE.Color()).setHSL(ndx / 12      , 1, 0.5),
    (new THREE.Color()).setHSL(ndx / 12 + 0.1, 1, 0.5),
    (new THREE.Color()).setHSL(ndx / 12 + 0.2, 1, 0.5),
  ];
});
```

{{{example url="../threejs-custom-geometry-cube-vertex-colors.html" }}}

Чтобы использовать освещение, нам нужны нормали. Нормали - это векторы, которые определяют направление. Так же, как цвета, мы можем указать нормаль для грани, установив свойство `normal` для каждой стороны с помощью



```js
face.normal = new THREE.Vector3(...)
```

или мы можем указать нормаль для каждой вершины, установив для свойства `vertexNormals` что-то вроде 

```js
face.vertexNormals = [
  new THREE.Vector3(...),
  new THREE.Vector3(...),
  new THREE.Vector3(...),
]
```

но часто гораздо проще просто попросить THREE.js вычислить для нас нормали на основе указанных позиций. 

Для нормалей грани мы бы назвали `Geometry.computeFaceNormals` как в

```js
geometry.computeFaceNormals();
```

Удаление цвета вершин и изменение материала обратно на `MeshPhongMaterial`
```js
-const material = new THREE.MeshBasicMaterial({vertexColors: true});
+const material = new THREE.MeshPhongMaterial({color});
```

и теперь наши кубики будут освещены.
{{{example url="../threejs-custom-geometry-cube-face-normals.html" }}}

Использование нормалей сторон всегда даст нам граненый взгляд. Мы можем использовать нормали вершин для более гладкого вида, вызывая `Geometry.computeVertexNormals` 

```js
-geometry.computeFaceNormals();
+geometry.computeVertexNormals();
```

К сожалению, куб не является хорошим выбором для нормалей вершин, поскольку это означает, что каждая вершина получает свою нормаль от нормалей всех граней, которые она разделяет.

{{{example url="../threejs-custom-geometry-cube-vertex-normals.html" }}}

Добавление текстурных координат, иногда называемых UV, выполняется через массив слоев параллельных массивов в массив `faces` , который устанавливается через `Geometry.faceVertexUvs`. Для нашего куба мы могли бы сделать что-то вроде

```js
geometry.faceVertexUvs[0].push(
  // front
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
  // right
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
  // back
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
  // left
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
  // top
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
  // bottom
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
);
```

Важно отметить, что `faceVertexUvs` - это массив слоев. Каждый слой представляет собой другой набор координат UV. По умолчанию есть один слой координат UV, слой 0, поэтому мы просто добавляем наши UV в этот слой. 

Давайте добавим текстуру к нашему материалу и переключимся обратно, чтобы вычислить нормали стороны 

```js
-geometry.computeVertexNormals();
+geometry.computeFaceNormals();

+const loader = new THREE.TextureLoader();
+const texture = loader.load('resources/images/star.png');

function makeInstance(geometry, color, x) {
-  const material = new THREE.MeshPhongMaterial({color});
+  const material = new THREE.MeshPhongMaterial({color, map: texture});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  ...
```

{{{example url="../threejs-custom-geometry-cube-texcoords.html" }}}

Собрав все это вместе, давайте создадим простую сетку ландшафта на основе карты высот. 

Ландшафт на основе карты высот - это то место, где у вас есть двумерный массив высот, который вы применяете к сетке. Простой способ получить двумерный массив высот - нарисовать их в программе для редактирования изображений. Вот изображение, которое я нарисовал. Это 96x64 пикселей 

<div class="threejs_center"><img src="../resources/images/heightmap-96x64.png" style="width: 512px; image-rendering: pixelated;"></div>

Мы загрузим это и затем сгенерируем из него сетку карты высот. Мы можем использовать `ImageLoader` для загрузки изображения. 

```js
const imgLoader = new THREE.ImageLoader();
imgLoader.load('resources/images/heightmap-96x64.png', createHeightmap);

function createHeightmap(image) {
  // extract the data from the image by drawing it to a canvas
  // and calling getImageData
  const ctx = document.createElement('canvas').getContext('2d');
  const {width, height} = image;
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  ctx.drawImage(image, 0, 0);
  const {data} = ctx.getImageData(0, 0, width, height);

  const geometry = new THREE.Geometry();
```

Мы извлекли данные из изображения, теперь мы сделаем сетку ячеек. Ячейки - это квадраты, образованные центральными точками каждого пикселя изображения 

<div class="threejs_center"><img src="resources/heightmap-points.svg" style="width: 500px"></div>

Для каждой ячейки мы сгенерируем 5 вершин. Один для каждого угла ячейки и один в центральной точке ячейки со средней высотой 4 угловых высот. 

```js
const cellsAcross = width - 1;
const cellsDeep = height - 1;
for (let z = 0; z < cellsDeep; ++z) {
  for (let x = 0; x < cellsAcross; ++x) {
    // compute row offsets into the height data
    // we multiply by 4 because the data is R,G,B,A but we
    // only care about R
    const base0 = (z * width + x) * 4;
    const base1 = base0 + (width * 4);

    // look up the height for the for points
    // around this cell
    const h00 = data[base0] / 32;
    const h01 = data[base0 + 4] / 32;
    const h10 = data[base1] / 32;
    const h11 = data[base1 + 4] / 32;
    // compute the average height
    const hm = (h00 + h01 + h10 + h11) / 4;

    // the corner positions
    const x0 = x;
    const x1 = x + 1;
    const z0 = z;
    const z1 = z + 1;

    // remember the first index of these 5 vertices
    const ndx = geometry.vertices.length;

    // add the 4 corners for this cell and the midpoint
    geometry.vertices.push(
      new THREE.Vector3(x0, h00, z0),
      new THREE.Vector3(x1, h01, z0),
      new THREE.Vector3(x0, h10, z1),
      new THREE.Vector3(x1, h11, z1),
      new THREE.Vector3((x0 + x1) / 2, hm, (z0 + z1) / 2),
    );
```

Затем мы сделаем 4 треугольника из этих 5 вершин

<div class="threejs_center"><img src="resources/heightmap-triangles.svg" style="width: 500px"></div>

```js
    // create 4 triangles
    geometry.faces.push(
      new THREE.Face3(ndx + 0, ndx + 4, ndx + 1),
      new THREE.Face3(ndx + 1, ndx + 4, ndx + 3),
      new THREE.Face3(ndx + 3, ndx + 4, ndx + 2),
      new THREE.Face3(ndx + 2, ndx + 4, ndx + 0),
    );

    // add the texture coordinates for each vertex of each face
    const u0 = x / cellsAcross;
    const v0 = z / cellsDeep;
    const u1 = (x + 1) / cellsAcross;
    const v1 = (z + 1) / cellsDeep;
    const um = (u0 + u1) / 2;
    const vm = (v0 + v1) / 2;
    geometry.faceVertexUvs[0].push(
      [ new THREE.Vector2(u0, v0), new THREE.Vector2(um, vm), new THREE.Vector2(u1, v0) ],
      [ new THREE.Vector2(u1, v0), new THREE.Vector2(um, vm), new THREE.Vector2(u1, v1) ],
      [ new THREE.Vector2(u1, v1), new THREE.Vector2(um, vm), new THREE.Vector2(u0, v1) ],
      [ new THREE.Vector2(u0, v1), new THREE.Vector2(um, vm), new THREE.Vector2(u0, v0) ],
    );
  }
}
```

и закончим это
```js
  geometry.computeFaceNormals();

  // center the geometry
  geometry.translate(width / -2, 0, height / -2);

  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/images/star.png');

  const material = new THREE.MeshPhongMaterial({color: 'green', map: texture});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
}
```

Несколько небольших изменений, чтобы было удобнее просматривать. 
включим `OrbitControls` 

* добавим `OrbitControls`

```js
import * as THREE from './resources/three/r125/build/three.module.js';
+import {OrbitControls} from './resources/threejs/r125/examples/jsm/controls/OrbitControls.js';
```

```js
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
-const far = 100;
+const far = 200;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 5;
+camera.position.set(20, 20, 20);

+const controls = new OrbitControls(camera, canvas);
+controls.target.set(0, 0, 0);
+controls.update();
```

добавим 2 света
```js
-{
+function addLight(...pos) {
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
-  light.position.set(-1, 2, 4\);
+  light.position.set(...pos);
  scene.add(light);
}

+addLight(-1, 2, 4);
+addLight(1, 2, -2);
```

и мы удалим код, связанный с вращением кубов.
{{{example url="../threejs-custom-geometry-heightmap.html" }}}

Я надеюсь, что это была полезная инструкция для создания вашей собственной геометрии с использованием `Geometry`. 
В другой статье мы рассмотрим `BufferGeometry`. 

В [другой статье](threejs-custom-buffergeometry.html) мы рассмотрим `BufferGeometry`. 

