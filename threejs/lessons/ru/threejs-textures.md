Title: Three.js Текстуры
Description: Использование текстур в three.js
TOC: Текстуры

Эта статья является частью серии статей о three.js. 
Первая статья - [основы Three.js](threejs-fundamentals.html).
[Предыдущая статья](threejs-setup.html) была о настройках окружения для этой статьи.
Если вы их еще не читали, советую вам сделать это.

Текстуры - это своего рода большая тема в Three.js, и я не уверен на 100%, на каком 
уровне их объяснить, но я постараюсь. По ним есть много тем, и многие из них взаимосвязаны, 
поэтому трудно объяснить все сразу. Вот краткое содержание этой статьи.

<ul>
<li><a href="#hello">Hello Texture</a></li>
<li><a href="#six">6 текстур, разные на каждой грани куба</a></li>
<li><a href="#loading">Загрузка текстур</a></li>
<ul>
  <li><a href="#easy">Легкий путь</a></li>
  <li><a href="#wait1">Ожидание загрузки текстуры</a></li>
  <li><a href="#waitmany">Ожидание загрузки нескольких текстур</a></li>
  <li><a href="#cors">Загрузка текстур из других доменов Cross-origin</a></li>
</ul>
<li><a href="#memory">Использование памяти</a></li>
<li><a href="#format">JPG против PNG</a></li>
<li><a href="#filtering-and-mips">Фильтрация и Mips</a></li>
<li><a href="#uvmanipulation">Повторение, сдвиг, вращение, наложение</a></li>
</ul>

## <a name="hello"></a> Hello Texture

Текстуры, *как правило* представляют собой изображения, которые чаще всего создаются в 
какой-либо сторонней программе, такой как Photoshop или GIMP. Например, 
давайте поместим это изображение на куб.

<div class="threejs_center">
  <img src="../resources/images/wall.jpg" style="width: 600px;" class="border" >
</div>

Мы изменим один из наших первых примеров. Все, что нам нужно сделать, это создать `TextureLoader`. Вызовите 
[`load`](TextureLoader.load) метод с URL-адресом изображения и установите для
изображения и установите его возвращаемое значение для `map` свойства материала, вместо установки `color`.

```js
+const loader = new THREE.TextureLoader();

const material = new THREE.MeshBasicMaterial({
-  color: 0xFF8844,
+  map: loader.load('../resources/images/wall.jpg'),
});
```

Обратите внимание, что мы используем `MeshBasicMaterial` поэтому не нужно никаких источников света.

{{{example url="../threejs-textured-cube.html" }}}

## <a name="six"></a> 6 текстур, разные для каждой грани куба

Как насчет 6 текстур, по одной на каждой грани куба?

<div class="threejs_center">
  <div>
    <img src="../resources/images/flower-1.jpg" style="width: 100px;" class="border" >
    <img src="../resources/images/flower-2.jpg" style="width: 100px;" class="border" >
    <img src="../resources/images/flower-3.jpg" style="width: 100px;" class="border" >
  </div>
  <div>
    <img src="../resources/images/flower-4.jpg" style="width: 100px;" class="border" >
    <img src="../resources/images/flower-5.jpg" style="width: 100px;" class="border" >
    <img src="../resources/images/flower-6.jpg" style="width: 100px;" class="border" >
  </div>
</div>

Мы просто создадим 6 материалов и передаем их в виде массива при создании `Mesh`

```js
const loader = new THREE.TextureLoader();

-const material = new THREE.MeshBasicMaterial({
-  map: loader.load('../resources/images/wall.jpg'),
-});
+const materials = [
+  new THREE.MeshBasicMaterial({map: loader.load('../resources/images/flower-1.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('../resources/images/flower-2.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('../resources/images/flower-3.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('../resources/images/flower-4.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('../resources/images/flower-5.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('../resources/images/flower-6.jpg')}),
+];
-const cube = new THREE.Mesh(geometry, material);
+const cube = new THREE.Mesh(geometry, materials);
```

Оно работает!

{{{example url="../threejs-textured-cube-6-textures.html" }}}

Однако следует отметить, что по умолчанию единственной геометрией, которая поддерживает 
несколько материалов, является `BoxGeometry` и `BoxBufferGeometry`. В других случаях вам 
нужно будет создать или загрузить пользовательскую геометрию и/или изменить координаты 
текстуры. Гораздо более распространенным является использование 
[Текстурного атласа](https://ru.wikipedia.org/wiki/Текстурный_атлас) 
когда вы хотите разрешить несколько изображений для одной геометрии.

Что такое координаты текстуры? Это данные, добавленные к каждой вершине 
геометрического фрагмента, которые определяют, какая часть текстуры 
соответствует этой конкретной вершине. Мы рассмотрим их, когда 
начнем создавать собственную геометрию.

## <a name="loading"></a> Загрузка текстур

### <a name="easy"></a> Легкий путь

Большая часть кода на этом сайте использует самый простой способ загрузки текстур. 
Мы создаем `TextureLoader` и затем вызываем [`load`](TextureLoader.load) метод. 
Возвращающий объект `Texture`.

```js
const texture = loader.load('../resources/images/flower-1.jpg');
```

Важно отметить, что при использовании этого метода наша текстура будет прозрачной, 
пока изображение не будет загружено асинхронно с помощью three.js, 
после чего он обновит текстуру загруженным изображением.

Это имеет большое преимущество в том, что нам не нужно ждать загрузки текстуры, 
и наша страница начнет отрисовку немедленно. Это, вероятно, хорошо для очень 
многих случаев использования, но если мы хотим, мы можем попросить three.js 
сообщить нам, когда текстура закончила загрузку.

### <a name="wait1"></a> Ожидание загрузки текстуры

Чтобы дождаться загрузки текстуры, `load` метод загрузчика текстуры принимает 
обратный вызов, который будет вызван после завершения загрузки текстуры. 
Возвращаясь к нашему верхнему примеру, мы можем дождаться загрузки текстуры, 
прежде чем создавать нашу `Mesh` и добавлять ее в сцену следующим образом.

```js
const loader = new THREE.TextureLoader();
loader.load('../resources/images/wall.jpg', (texture) => {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cubes.push(cube);  // добавляем в наш список кубиков для вращения  
});
```

Если вы не очистите кеш вашего браузера и у вас не будет медленного соединения, 
вы вряд ли увидите разницу, но будьте уверены, что она ожидает загрузки текстуры.

{{{example url="../threejs-textured-cube-wait-for-texture.html" }}}

### <a name="waitmany"></a> Ожидание загрузки нескольких текстур

Чтобы дождаться загрузки всех текстур, вы можете использовать `LoadingManager`. 
Создайте его и передайте его в `TextureLoader`, а затем установите его [`onLoad`](LoadingManager.onLoad) 
свойство для обратного вызова.

```js
+const loadManager = new THREE.LoadingManager();
*const loader = new THREE.TextureLoader(loadManager);

const materials = [
  new THREE.MeshBasicMaterial({map: loader.load('../resources/images/flower-1.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('../resources/images/flower-2.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('../resources/images/flower-3.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('../resources/images/flower-4.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('../resources/images/flower-5.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('../resources/images/flower-6.jpg')}),
];

+loadManager.onLoad = () => {
+  const cube = new THREE.Mesh(geometry, materials);
+  scene.add(cube);
+  cubes.push(cube);  // add to our list of cubes to rotate
+};
```

`LoadingManager` также имеет [`onProgress`](LoadingManager.onProgress) свойство и его 
можно установить в другой функции обратного вызова, чтобы показать индикатор прогресса.

Сначала мы добавим индикатор выполнения (progress bar) в HTML

```html
<body>
  <canvas id="c"></canvas>
+  <div id="loading">
+    <div class="progress"><div class="progressbar"></div></div>
+  </div>
</body>
```

и CSS для этого

```css
#loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
#loading .progress {
    margin: 1.5em;
    border: 1px solid white;
    width: 50vw;
}
#loading .progressbar {
    margin: 2px;
    background: white;
    height: 1em;
    transform-origin: top left;
    transform: scaleX(0);
}
```

Затем в коде мы обновим масштаб (scale) `progressbar` в `onProgress`. 
Он вызывается с URL-адресом последнего загруженного элемента, количества загруженных 
элементов и общего количества загруженных элементов.

```js
+const loadingElem = document.querySelector('#loading');
+const progressBarElem = loadingElem.querySelector('.progressbar');

loadManager.onLoad = () => {
+  loadingElem.style.display = 'none';
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);
  cubes.push(cube);  // добавляем в наш список кубиков для вращения 
};

+loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
+  const progress = itemsLoaded / itemsTotal;
+  progressBarElem.style.transform = `scaleX(${progress})`;
+};
```

Если вы не очистите свой кеш и у вас медленное соединение, вы можете не увидеть полосу загрузки.

{{{example url="../threejs-textured-cube-wait-for-all-textures.html" }}}

## <a name="cors"></a> Загрузка текстур из других источников. CROS

Чтобы использовать изображения с других серверов, эти сервера должны отправлять правильные заголовки. 
Если этого не произойдет, вы не сможете использовать изображения в three.js и получите ошибку. 
Если вы запускаете сервер, предоставляющий изображения, убедитесь, что он
[ отправляет правильные заголовки](https://developer.mozilla.org/ru/docs/Web/HTTP/CORS).
Если вы не управляете сервером, на котором размещены изображения, и он не отправляет заголовки разрешений, 
вы не сможете использовать изображения с этого сервера.

Например [imgur](https://imgur.com), [flickr](https://flickr.com) и
[github](https://github.com) - все заголовки отправки, позволяющие вам использовать изображения, 
размещенные на их серверах в three.js. Большинство других сайтов этого не делают.

## <a name="memory"></a> Использование памяти

Текстуры часто являются частью приложения three.js, которое использует больше всего памяти. 
Важно понимать, что *обычно*, текстуры занимают `width * height * 4 * 1.33` байт в памяти. 

Обратите внимание, что никто не говорит о сжатии. Я могу сделать изображение в формате 
.jpg и установить его компрессию очень высокой. Например, допустим, я делал сцену из дома. 
Внутри дома есть стол, и я решил положить эту текстуру дерева на верхнюю поверхность стола.

<div class="threejs_center"><img class="border" src="resources/images/compressed-but-large-wood-texture.jpg" align="center" style="width: 300px"></div>

Это изображение всего 157 Кб, поэтому оно будет загружаться относительно быстро, но на 
[самом деле оно имеет размер 3024 x 3761 пикселей](resources/images/compressed-but-large-wood-texture.jpg). 
Следуя приведенному выше уравнению, это

    3024 * 3761 * 4 * 1.33 = 60505764.5

Это изображение займет **60 Мб ПАМЯТИ!** в three.js. 
Несколько таких текстур, и вам не хватит памяти.

Я поднял этот вопрос, потому что важно знать, что использование текстур имеет скрытую стоимость. 
Для того чтобы three.js использовал текстуру, он должен передать ее в графический процессор, 
а графический процессор *обычно* требует, чтобы данные текстуры были несжатыми.

Мораль этой истории: делайте ваши текстуры небольшими по размеру, а не просто 
маленькими по размеру файла. Небольшой размер файла = быстрая загрузка. 
Маленький в размер = занимает меньше памяти. 
На сколько маленькими вы должны сделать их? 
На столько на сколько это возможно! И при этом выглядящими так хорошо, как вам нужно.

## <a name="format"></a> JPG против PNG

Это почти то же самое, что и обычный HTML, поскольку JPG-файлы имеют сжатие с потерями, 
PNG-файлы имеют сжатие без потерь, поэтому PNG-файлы обычно загружаются медленнее. 
Но PNG поддерживают прозрачность. PNG также, вероятно, является подходящим форматом 
для данных без реалистичных изображений, таких как карты нормалей, и других видов карт без реалистичных изображений, 
которые мы рассмотрим позже.

Важно помнить, что JPG не использует меньше памяти, чем PNG в WebGL. Смотри выше.

## <a name="filtering-and-mips"></a> Фильтрация и Mips

Давайте применим эту текстуру 16x16

<div class="threejs_center"><img src="resources/images/mip-low-res-enlarged.png" class="border" align="center"></div>

Это куб

<div class="spread"><div data-diagram="filterCube"></div></div>

Давайте нарисуем этот кубик действительно маленьким

<div class="spread"><div data-diagram="filterCubeSmall"></div></div>

Хммм, я думаю, это трудно увидеть. Давайте увеличим этот крошечный куб

<div class="spread"><div data-diagram="filterCubeSmallLowRes"></div></div>

Как GPU узнает, какие цвета нужно сделать для каждого пикселя, который он рисует для крошечного куба? 
Что если куб был настолько мал, что его размер составлял всего 1 или 2 пикселя?

Вот что такое фильтрация.

Если бы это был Photoshop, Photoshop усреднил бы почти все пиксели вместе, 
чтобы выяснить, какой цвет сделать эти 1 или 2 пикселя. 
Это было бы очень медленной операцией. 
Графические процессоры решают эту проблему с помощью mipmaps.

Mips - это копии текстуры, каждая из которых в два раза меньше ширины и в два раза меньше, чем предыдущий мип, 
где пиксели были смешаны, чтобы сделать следующий меньший мип. 
Мипы создаются до тех пор, пока мы не доберемся до 1 х 1 пикселя. 
Поскольку изображение выше всех мипов в конечном итоге будет что-то вроде этого

<div class="threejs_center"><img src="resources/images/mipmap-low-res-enlarged.png" align="center"></div>

Теперь, когда куб нарисован настолько маленьким, что его размер составляет всего 1 или 2 пикселя, 
графический процессор может использовать только наименьший или почти минимальный уровень мипа, 
чтобы решить, какой цвет создать крошечный куб.

В three вы можете выбрать, что будет происходить, когда текстура рисуется больше, 
чем ее исходный размер, и что происходит, когда она рисуется меньше, чем ее исходный размер.

Для установки фильтра, когда текстура рисуется больше исходного размера, 
вы устанавливаете [`texture.magFilter`](Texture.magFilter) свойство либо на `THREE.NearestFilter` либо на 
`THREE.LinearFilter`.  `NearestFilter` просто выбрает один пиксель из оригинальной текстуры. 
С текстурой низкого разрешения это дает вам очень пиксельный вид как Minecraft.

`LinearFilter` выбрает 4 пикселя из текстуры, которые находятся ближе всего к тому месту, 
где мы должны выбирать цвет, и смешает их в соответствующих пропорциях относительно того, 
как далеко фактическая точка находится от каждого из 4 пикселей.

<div class="spread">
  <div>
    <div data-diagram="filterCubeMagNearest" style="height: 250px;"></div>
    <div class="code">Nearest</div>
  </div>
  <div>
    <div data-diagram="filterCubeMagLinear" style="height: 250px;"></div>
    <div class="code">Linear</div>
  </div>
</div>

Для настройки фильтра, когда текстура нарисована меньше исходного размера, 
вы устанавливаете для свойства [`texture.minFilter`](Texture.minFilter) одно из 6 значений.

* `THREE.NearestFilter`

   так же, как и выше. Выберает ближайший пиксель в текстуре

* `THREE.LinearFilter`

   Как и выше, выберает 4 пикселя из текстуры и смешает их

* `THREE.NearestMipmapNearestFilter`

   выберает соответствующий mip, затем выберает один пиксель.

* `THREE.NearestMipmapLinearFilter`

   выберает 2 mips, выберает один пиксель из каждого, смешает 2 пикселя.

* `THREE.LinearMipmapNearestFilter`

   выберает подходящий mip, затем выберает 4 пикселя и смешает их.

*  `THREE.LinearMipmapLinearFilter`

   выберает 2 mips, выберает 4 пикселя от каждого и смешает все 8 в 1 пиксель.

Вот пример, показывающий все 6 настроек

<div class="spread">
  <div data-diagram="filterModes" style="
    height: 450px; 
    position: relative;
  ">
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    ">
      <div style="
        background: rgba(255,0,0,.8);
        color: white;
        padding: .5em;
        margin: 1em;
        font-size: small;
        border-radius: .5em;
        line-height: 1.2;
        user-select: none;"
      >click to<br/>change<br/>texture</div>
    </div>
    <div class="filter-caption" style="left: 0.5em; top: 0.5em;">nearest</div>
    <div class="filter-caption" style="width: 100%; text-align: center; top: 0.5em;">linear</div>
    <div class="filter-caption" style="right: 0.5em; text-align: right; top: 0.5em;">nearest<br/>mipmap<br/>nearest</div>
    <div class="filter-caption" style="left: 0.5em; text-align: left; bottom: 0.5em;">nearest<br/>mipmap<br/>linear</div>
    <div class="filter-caption" style="width: 100%; text-align: center; bottom: 0.5em;">linear<br/>mipmap<br/>nearest</div>
    <div class="filter-caption" style="right: 0.5em; text-align: right; bottom: 0.5em;">linear<br/>mipmap<br/>linear</div>
  </div>
</div>

Одна вещь, на которую нужно обратить внимание - это использование левого верхнего и верхнего среднего 
`NearestFilter` и `LinearFilter`
не использует mips. Из-за этого они мерцают на расстоянии, потому что графический процессор выбирает 
пиксели из исходной текстуры. Слева выбран только один пиксель, а в середине 4 выбраны и смешаны, 
но этого недостаточно, чтобы придумать хороший представительный цвет. Другие 4 полоски лучше с нижним правым, 
`LinearMipmapLinearFilter` лучший.

Если вы нажмете на картинку выше, она переключится между текстурой, которую мы использовали выше, 
и текстурой, где каждый уровень мипа имеет свой цвет.

<div class="threejs_center">
  <div data-texture-diagram="differentColoredMips"></div>
</div>

Это делает более понятным, что происходит. 
Вы можете видеть в верхнем левом и верхнем середине первый мип, используемый на всем пути. 
Справа вверху и внизу посередине видно, где используется другой мип.

Возвращаясь к исходной текстуре, вы можете видеть, что нижний правый угол является самым плавным 
и с высочайшим качеством. Вы можете спросить, почему не всегда использовать этот режим. 
Самая очевидная причина - иногда вы хотите, чтобы вещи были пикселированы в стиле ретро 
или по какой-то другой причине. Следующая наиболее распространенная причина заключается в том, 
что чтение 8 пикселей и их смешивание медленнее, чем чтение 1 пикселя и смешивание. 
Хотя маловероятно, что для одной и той же текстуры будет видна разница в скорости по мере нашего 
углубления в эти статьи, в конечном итоге у нас будут материалы, 
которые используют 4 или 5 текстур одновременно. 4 текстуры * 8 пикселей на текстуру - 
это поиск 32 пикселей для каждого пикселя. Это может быть особенно важно учитывать на мобильных устройствах.

## <a href="uvmanipulation"></a> Повторение, смещение, вращение, наложение текстуры

Текстуры имеют настройки для повторения, смещения и поворота текстуры.

По умолчанию текстуры в three.js не повторяются. Чтобы установить, повторяется или нет текстура, 
есть 2 свойства: [`wrapS`](Texture.wrapS) для горизонтального и 
и [`wrapT`](Texture.wrapT) вертикального повторения.

They can be set to one of:

* `THREE.ClampToEdgeWrapping`

  Последний пиксель на каждом ребре повторяется всегда

* `THREE.RepeatWrapping`

   Текстура повторяется

* `THREE.MirroredRepeatWrapping`

   Текстура зеркально повторяется.

Например, чтобы включить повтор в обоих направлениях:

```js
someTexture.wrapS = THREE.RepeatWrapping;
someTexture.wrapT = THREE.RepeatWrapping;
```

Повторение устанавливается с помощью свойства [repeat].

```js
const timesToRepeatHorizontally = 4;
const timesToRepeatVertically = 2;
someTexture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
```

Смещение текстуры может быть сделано путем установки `offset`. 
Текстуры смещены в единицах, где 1 единица = 1 размер текстуры. 
Другими словами, 0 = без смещения и 1 = смещение на одну полную величину текстуры. 

```js
const xOffset = .5;   // cмещение на половину текстуры 
const yOffset = .25;
someTexture.offset.set(xOffset, yOffset);`
```

Вращение текстуры может быть установлено через свойство `rotation` в радианах, а также свойство
`center` для выбора центра вращения. По умолчанию используется значение 0,0, которое 
вращается из нижнего левого угла. Подобно смещению, эти единицы имеют размер текстуры, 
поэтому установка их `.5, .5` будет вращаться вокруг центра текстуры.

```js
someTexture.center.set(.5, .5);
someTexture.rotation = THREE.Math.degToRad(45); 
```

Давайте изменим верхний пример выше, чтобы играть с этими значениями

Сначала мы сохраним ссылку на текстуру, чтобы мы могли манипулировать ею

```js
+const texture = loader.load('../resources/images/wall.jpg');
const material = new THREE.MeshBasicMaterial({
-  map: loader.load('../resources/images/wall.jpg');
+  map: texture,
});
```

Затем мы снова будем использовать [dat.GUI](https://github.com/dataarts/dat.gui) 
для обеспечения простого интерфейса.

```html
<script src="../3rdparty/dat.gui.min.js"></script>
```

Как мы делали в предыдущих примерах dat.GUI, мы будем использовать простой класс, 
чтобы дать dat.GUI объект, которым он может манипулировать в градусах, 
но установит свойство в радианах.

```js
class DegRadHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return THREE.Math.radToDeg(this.obj[this.prop]);
  }
  set value(v) {
    this.obj[this.prop] = THREE.Math.degToRad(v);
  }
}
```

Нам также нужен класс, который будет конвертировать из строки, например, `"123"` 
в число `123`, так как для Three.js требуются числа для настроек перечисления, 
например, `wrapS` и `wrapT`, а dat.GUI использует только строки для перечислений.

```js
class StringToNumberHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return this.obj[this.prop];
  }
  set value(v) {
    this.obj[this.prop] = parseFloat(v);
  }
}
```

Используя эти классы, мы можем настроить простой графический интерфейс для настроек выше

```js
const wrapModes = {
  'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
  'RepeatWrapping': THREE.RepeatWrapping,
  'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
};

function updateTexture() {
  texture.needsUpdate = true;
}

const gui = new dat.GUI();
gui.add(new StringToNumberHelper(texture, 'wrapS'), 'value', wrapModes)
  .name('texture.wrapS')
  .onChange(updateTexture);
gui.add(new StringToNumberHelper(texture, 'wrapT'), 'value', wrapModes)
  .name('texture.wrapT')
  .onChange(updateTexture);
gui.add(texture.repeat, 'x', 0, 5).name('texture.repeat.x');
gui.add(texture.repeat, 'y', 0, 5).name('texture.repeat.y');
gui.add(texture.offset, 'x', -2, 2).name('texture.offset.x');
gui.add(texture.offset, 'y', -2, 2).name('texture.offset.y');
gui.add(texture.center, 'x', -.5, 1.5, .01).name('texture.center.x');
gui.add(texture.center, 'y', -.5, 1.5, .01).name('texture.center.y');
gui.add(new DegRadHelper(texture, 'rotation'), 'value', -360, 360)
  .name('texture.rotation');
```

Последнее, что следует отметить в этом примере, это то, что если вы измените `wrapS` или
`wrapT` на текстуре, вы также должны установить [`texture.needsUpdate`](Texture.needsUpdate) 
так, чтобы Three.js знал, чтобы применить эти настройки. Другие настройки применяются автоматически.

{{{example url="../threejs-textured-cube-adjust.html" }}}

Это только один шаг в тему текстур. В какой-то момент мы рассмотрим текстурные координаты, 
а также 9 других типов текстур, которые можно применить к материалам.

А пока давайте перейдем к [свету](threejs-lights.html).

<!--
alpha 
ao
env
light
specular
bumpmap ?
normalmap ?
metalness
roughness
-->

<canvas id="c"></canvas>
<script src="../../resources/threejs/r108/three.min.js"></script>
<script src="../../resources/threejs/r108/js/controls/TrackballControls.js"></script>
<script src="../resources/threejs-lesson-utils.js"></script>
<script src="../resources/threejs-textures.js"></script>
<link rel="stylesheet" href="resources/threejs-textures.css">
