Title: Three.js Отладка JavaScript
Description: Отладка JavaScript с THREE.js
TOC: Отладка JavaScript

Большая часть этой статьи посвящена не непосредственно 
THREE.js, а скорее об отладке JavaScript в целом. 
Мне показалось важным, что многие люди, начинающие с THREE.js,
также начинают с JavaScript, поэтому я надеюсь, что это поможет
им легче решать любые возникающие проблемы. 

Отладка - большая тема, и я, вероятно, не смогу охватить все, что нужно знать, но если вы новичок в JavaScript,
вот несколько советов. Я настоятельно рекомендую вам потратить некоторое время на их изучение. Они очень помогут вам в вашем обучении. 

## Изучите инструменты разработчика вашего браузера 

Все браузеры имеют инструменты разработчика. 
[Chrome](https://developers.google.com/web/tools/chrome-devtools/),
[Firefox](https://developer.mozilla.org/en-US/docs/Tools), 
[Safari](https://developer.apple.com/safari/tools/), 
[Edge](https://docs.microsoft.com/en-us/microsoft-edge/devtools-guide).

В Chrome вы можете кликнуть значок `⋮` , выбрать More Tools->Developer Tools
чтобы перейти к инструментам разработчика. Сочетание клавиш также показано там. 

<div class="threejs_center"><img class="border" src="resources/images/devtools-chrome.jpg" style="width: 789px;"></div>

В Firefox вы кликаете значок `☰` , выбираете "Web Developer", затем выбираете
"Toggle Tools"

<div class="threejs_center"><img class="border" src="resources/images/devtools-firefox.jpg" style="width: 786px;"></div>

В Safari сначала необходимо включить меню «Разработка» в разделе 
«Дополнительные настройки Safari».

<div class="threejs_center"><img class="border" src="resources/images/devtools-enable-safari.jpg" style="width: 775px;"></div>

Затем в меню «Разработка» вы можете выбрать «Показать / подключить веб-инспектора». 

<div class="threejs_center"><img class="border" src="resources/images/devtools-safari.jpg" style="width: 777px;"></div>

С Chrome вы также можете 
[использовать Chrome на своем компьютере для отладки веб-страниц, работающих на Chrome, на вашем телефоне или планшете Android](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/).
Точно так же с Safari вы можете
[использовать свой компьютер для отладки веб-страниц, работающих в Safari на iPhone и iPad](https://www.google.com/search?q=safari+remote+debugging+ios).

Я наиболее знаком с Chrome, поэтому в этом руководстве будет использоваться Chrome в качестве примера при обращении к инструментам,
но большинство браузеров имеют схожие функции, поэтому здесь должно быть легко применить что-либо для всех браузеров. 

## Выключить кеш 

Браузеры пытаются повторно использовать уже загруженные данные. Это очень удобно для пользователей, 
поэтому, если вы заходите на веб-сайт во второй раз, многие файлы, используемые для отображения сайта, больше не будут загружаться. 

С другой стороны, это может быть плохо для веб-разработки. 
Вы изменяете файл на своем компьютере, перезагружаете страницу
и не видите изменений, потому что браузер использует версию, полученную в прошлый раз. 

С другой стороны, это может быть плохо для веб-разработки.
Вы изменяете файл на своем компьютере, перезагружаете страницу 
и не видите изменений, потому что браузер использует версию, полученную в прошлый раз. 

Сначала выберите настройки из углового меню 

<div class="threejs_center"><img class="border" src="resources/images/devtools-chrome-settings.jpg" style="width: 778px"></div>

Затем выберите "Отключить кэш (пока открыт DevTools)".

<div class="threejs_center"><img class="border" src="resources/images/devtools-chrome-disable-cache.jpg" style="width: 779px"></div>

## Используйте консоль JavaScript

Внутри всех devtools есть *консоль*. Показывает предупреждения и сообщения об ошибках. 

** ЧИТАЙТЕ СООБЩЕНИЯ!! **

Обычно должно быть только 1 или 2 сообщения. 

<div class="threejs_center"><img class="border" src="resources/images/devtools-no-errors.jpg" style="width: 779px"></div>

Если вы видите какие-либо другие **ПРОЧИТАЙТЕ ИХ**. Например:

<div class="threejs_center"><img class="border" src="resources/images/devtools-errors.jpg" style="width: 779px"></div>

Я неправильно написал «three» как «threee» 

Вы также можете распечатать свою собственную информацию на консоли с помощью `console.log`, как в

```js
console.log(someObject.position.x, someObject.position.y, someObject.position.z);
```

Даже круче, если вы регистрируете объект, вы можете инспектировать его. Например, если мы регистрируем объект корневой сцены из [статьи gLTF](threejs-load-gltf.html)

```js
  {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
      const root = gltf.scene;
      scene.add(root);
+      console.log(root);
```

Затем мы можем развернуть этот объект в консоли JavaScript 

<div class="threejs_center"><img class="border" src="resources/images/devtools-console-object.gif"></div>

Вы также можете использовать `console.error`, который сообщает, что сообщение красным цветом включает в себя трассировку стека.

## Поместить данные на экран

Другой очевидный, но часто упускаемый из виду способ - добавить теги `<div>` или `<pre>` и поместить в них данные. 

Самый очевидный способ - сделать некоторые элементы HTML 

```html
<canvas id="c"></canvas>
+<div id="debug">
+  <div>x:<span id="x"></span></div>
+  <div>y:<span id="y"></span></div>
+  <div>z:<span id="z"></span></div>
+</div>
```

Разместите стиле вверху холста. (при условии, что ваш холст заполняет страницу)

```html
<style>
#debug {
  position: absolute;
  left: 1em;
  top: 1em;
  padding: 1em;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-family: monospace;
}
</style>
```

А затем найдите элементы и настройте их содержимое.

```js
// at init time
const xElem = document.querySelector('#x');
const yElem = document.querySelector('#y');
const zElem = document.querySelector('#z');

// at render or update time
xElem.textContent = someObject.position.x.toFixed(3);
yElem.textContent = someObject.position.y.toFixed(3);
zElem.textContent = someObject.position.z.toFixed(3);
```

Это более полезно для значений в реальном времени

{{{example url="../threejs-debug-js-html-elements.html" }}}

Еще один способ вывести данные на экран - это очистить регистратор.
Я только что придумал этот термин, но многие игры, над которыми я работал,
использовали это решение. Идея в том, что у вас есть буфер, который 
отображает сообщения только для одного кадра. Любая часть вашего кода, которая хочет отображать данные, 
вызывает некоторую функцию для добавления данных в этот буфер каждый кадр. 
Это гораздо меньше работы, чем создание элемента на часть данных выше. 

Например, давайте изменим HTML сверху только на это

```html
<canvas id="c"></canvas>
<div id="debug">
  <pre></pre>
</div>
```

И давайте создадим простой класс для управления этим *буфером очистки*.

```js
class ClearingLogger {
  constructor(elem) {
    this.elem = elem;
    this.lines = [];
  }
  log(...args) {
    this.lines.push([...args].join(' '));
  }
  render() {
    this.elem.textContent = this.lines.join('\n');
    this.lines = [];
  }
}
```

Тогда давайте сделаем простой пример, который каждый раз, когда мы щелкаем мышью, 
создает сетку, которая движется в произвольном направлении в течение 2 секунд.
Мы начнем с одного из примеров из статьи о  [том, как сделать вещи отзывчивыми](threejs-responsive.html)

Вот код, который добавляет новую сетку каждый раз, когда мы щелкаем мышью

```js
const geometry = new THREE.SphereBufferGeometry();
const material = new THREE.MeshBasicMaterial({color: 'red'});

const things = [];

function rand(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
}

function createThing() {
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  things.push({
    mesh,
    timer: 2,
    velocity: new THREE.Vector3(rand(-5, 5), rand(-5, 5), rand(-5, 5)),
  });
}

canvas.addEventListener('click', createThing);
```

А вот код, который перемещает созданные нами meshes, регистрирует их и удаляет их, когда у них заканчивается таймер 

```js
const logger = new ClearingLogger(document.querySelector('#debug pre'));

let then = 0;
function render(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;

  ...

  logger.log('fps:', (1 / deltaTime).toFixed(1));
  logger.log('num things:', things.length);
  for (let i = 0; i < things.length;) {
    const thing = things[i];
    const mesh = thing.mesh;
    const pos = mesh.position;
    logger.log(
        'timer:', thing.timer.toFixed(3), 
        'pos:', pos.x.toFixed(3), pos.y.toFixed(3), pos.z.toFixed(3));
    thing.timer -= deltaTime;
    if (thing.timer <= 0) {
      // remove this thing. Note we don't advance `i`
      things.splice(i, 1);
      scene.remove(mesh);
    } else {
      mesh.position.addScaledVector(thing.velocity, deltaTime);
      ++i;
    }
  }

  renderer.render(scene, camera);
  logger.render();

  requestAnimationFrame(render);
}
```

Теперь кликните мышкой в примере ниже. 

{{{example url="../threejs-debug-js-clearing-logger.html" }}}

## Параметры запроса

Следует также помнить, что на веб-страницах могут передаваться данные либо через параметры запроса, либо через привязку, иногда называемую поиском и хэшем.

    https://domain/path/?query#anchor

Вы можете использовать это, чтобы сделать функции необязательными или передать параметры.

Например, давайте возьмем предыдущий пример и сделаем так, чтобы материал отладки отображался только в том случае, если мы добавили `?debug=true` в URL.

Сначала нам нужен код для разбора строки запроса

```js
/**
  * Returns the query parameters as a key/value object. 
  * Example: If the query parameters are
  *
  *    abc=123&def=456&name=gman
  *
  * Then `getQuery()` will return an object like
  *
  *    {
  *      abc: '123',
  *      def: '456',
  *      name: 'gman',
  *    }
  */
function getQuery() {
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}
```

Тогда мы можем сделать элемент отладки скрытым по умолчанию

```html
<canvas id="c"></canvas>
+<div id="debug" style="display: none;">
  <pre></pre>
</div>
```

Затем в коде мы читаем параметры и выбираем не скрывать отладочную информацию тогда и только тогда, когда передается `?debug=true`

```js
const query = getQuery();
const debug = query.debug === 'true';
const logger = debug
   ? new ClearingLogger(document.querySelector('#debug pre'))
   : new DummyLogger();
if (debug) {
  document.querySelector('#debug').style.display = '';
}
```

Мы также создали `DummyLogger`, который ничего не делает, и решили использовать его, если `?debug=true` не был передан. 

```js
class DummyLogger {
  log() {}
  render() {}
}
```

Вы можете увидеть, если мы используем этот URL:

<a target="_blank" href="../threejs-debug-js-params.html">threejs-debug-js-params.html</a>

отладочной информации нет, но если мы используем этот URL:

<a target="_blank" href="../threejs-debug-js-params.html?debug=true">threejs-debug-js-params.html?debug=true</a>

есть отладочная информация..

Несколько параметров можно передать, разделив их символом  '&' как в `somepage.html?someparam=somevalue&someotherparam=someothervalue`. 
Используя такие параметры, мы можем передавать все виды опций. Может быть `speed=0.01` чтобы замедлить наше приложение для облегчения понимания чего-либо, или `showHelpers=true`
для того, чтобы добавлять или нет помощников, которые показывают свет, тень или усечение камеры, рассматриваемые в других уроках. 

## Научитесь пользоваться отладчиком 

В каждом браузере есть отладчик, в котором вы можете останавливать
вашу программу шаг за шагом и проверять все переменные. 

Обучение тому, как использовать отладчик - слишком большая тема для этой статьи, но вот несколько ссылок 

* [Get Started with Debugging JavaScript in Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/javascript/)
* [Debugging in Chrome](https://javascript.info/debugging-chrome)
* [Tips and Tricks for Debugging in Chrome Developer Tools](https://hackernoon.com/tips-and-tricks-for-debugging-in-chrome-developer-tools-458ade27c7ab)

## Проверьте `NaN` в отладчике или в другом месте 

`NaN` это сокращение от Not A Number. 
Это то, что JavaScript будет назначать в качестве значения, когда вы делаете что-то, что не имеет смысла математически. 

В качестве простого примера

<div class="threejs_center"><img class="border" src="resources/images/nan-banana.png" style="width: 180px;"></div>


Часто, когда я что-то делаю и на экране ничего не появляется,
я проверяю некоторые значения, и если я вижу `NaN`, имеет место быть, чтобы начать поиск. 

В качестве примера, когда я впервые начал создавать путь для
[статьи о загрузке файлов gLTF](threejs-load-gltf.html) я сделал кривую, используя класс `SplineCurve`, который создает 2D-кривую. 

Затем я использовал эту кривую, чтобы двигать автомобили

```js
curve.getPointAt(zeroToOnePointOnCurve, car.position);
```

Внутренне `curve.getPointAt` вызывает функцию `set` для объекта, переданного в качестве второго аргумента.
В этом случае вторым аргументом является `car.position`, который является `Vector3`. 
 Функция `set` в `Vector3` требует 3 аргумента, x, y и z, но `SplineCurve` является 2D-кривой и поэтому вызывает `car.position.set` только с x и y. 

В результате `car.position.set` устанавливает x в x, y в y, а z в `undefined`.

Беглый взгляд в отладчике `matrixWorld` автомобиля
показал множество значений `NaN`. 

<div class="threejs_center"><img class="border" src="resources/images/debugging-nan.gif" style="width: 476px;"></div>

Видя, что в матрице присутствуют `NaN` можно предположить что-то вроде `position`,
`rotation`, `scale` или какой-либо другой функции, которая влияет на то, что в матрице содержались неверные данные.
Работая в обратном направлении, было легко отследить проблему. 

В верхней части `NaN` есть также `Infinity`, что является аналогичным признаком того, что где-то есть математическая ошибка. 

## Смотри в коде! 

THREE.js является открытым исходным кодом. Не бойтесь заглянуть внутрь кода! Вы можете заглянуть внутрь на  [github](https://github.com/mrdoob/three.js).
Вы также можете заглянуть внутрь, войдя в функции в отладчике. 
Когда вы сделаете это, рассмотрите возможность использования `three.js` вместо более распространенного `three.min.js`. 
`three.min.js` - уменьшенная, сжатая и поэтому уменьшенная для загрузки версия. `three.js` - более крупная, но более простая в отладке версия. 
Я часто переключаю свой код на использование `three.js`, чтобы пройтись по коду и посмотреть, что происходит. 

## Поместите `requestAnimationFrame` внизу вашей функции рендеринга.

Я часто вижу эту закономерность

```js
function render() {
   requestAnimationFrame(render);

   // -- do stuff --

   renderer.render(scene, camera);
}
requestAnimationFrame(render);
```

Я бы предложил поместить вызов `requestAnimationFrame` внизу, как в

```js
function render() {
   // -- do stuff --

   renderer.render(scene, camera);

   requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

Основная причина в том, что ваш код остановится – возникновение ошибки. 
Помещение `requestAnimationFrame` вверху означает, что ваш код будет продолжать работать, 
даже если у вас есть ошибка, так как вы уже запросили другой кадр.  Лучше найти эти ошибки, чем игнорировать их.
Они могут быть причиной того, что что-то не появляется так, как вы ожидаете, но если ваш код не остановится, вы можете даже не заметить. 

## Проверьте свои единицы! 

Это в основном означает понимание, например, когда использовать градусы, а когда использовать радианы. 
К сожалению, THREE.js не использует везде одинаковые единицы измерения. Первое, что пришло в голову
поле зрения камеры - в градусах. Все остальные углы указаны в радианах. 

Другое место, на которое стоит обратить внимание - ваши единицы измерения. 
До недавнего времени 3D-приложения могли выбирать любую единицу измерения, который они хотели. 
Одно приложение может выбрать 1 единицу = 1 см. Другой может выбрать 1 единицу = 1 фут. 
На самом деле все еще верно, что вы можете выбрать любые единицы измерения для определенных приложений. 
Тем не менее, THREE.js предполагает 1 единицу = 1 метр. Это важно для таких вещей, как физический рендеринг с использованием метров для вычисления световых эффектов. 
Это также важно для AR и VR, которые должны иметь дело с реальными устройствами, такими как ваш телефон или как контроллеры VR. 

## Создание *Minimal, Complete, Verifiable, Example* для Stack Overflow

Если вы решите задать вопрос о THREE.js,
вам почти всегда необходимо предоставить MCVE, что означает «Минимальный, Полный, Проверяемый, Пример». 

**Минимальная** часть важна. Допустим, у вас возникла проблема с перемещением пути в последнем примере [загрузки статьи gLTF](threejs-load-gltf.html). 
Этот пример имеет много частей. Включите их в список 

1. A bunch of HTML
2. Some CSS
3. Lights
4. Shadows
5. DAT.gui code to manipulate shadows
6. Code to load a .GLTF file
7. Code to resize the canvas.
8. Code to move the cars along paths

Это довольно много. Если ваш вопрос касается только пути, вы можете удалить большую часть HTML, 
так как вам нужен только тег `<canvas>` и `<script>` для THREE.js. Вы можете удалить CSS и код изменения размера.
Вы можете удалить код .GLTF, потому что вам нужен только путь.
Вы можете удалить источники света и тени с помощью `MeshBasicMaterial`. 
Вы, конечно, можете удалить код `DAT.gui`. Код создает плоскость с текстурой. Было бы проще использовать `GridHelper`. 
Наконец, если наш вопрос касается перемещения объектов по пути,
мы могли бы просто использовать кубы на пути вместо загруженных моделей автомобилей. 

Вот более минимальный пример, учитывающий все вышеперечисленное. Он сократился с 271 строки до 135. 
Мы могли бы подумать об уменьшении его еще больше, упрощая наш путь. Возможно, путь с 3 или 4 точками будет работать так же хорошо, как и наш путь с 21 точкой. 

{{{example url="../threejs-debugging-mcve.html" }}}

Я сохранил `OrbitController` только потому, что полезно перемещать камеру и выяснять, что происходит, но в зависимости от вашей проблемы вы также можете удалить это.

Лучшее в создании MCVE - это то, что мы часто решаем нашу собственную проблему. Процесс удаления всего, что не нужно, и делая наименьший пример, мы решаем проблему, чем наоборот. 

Вдобавок ко всему, с уважением относимся к тому времени, за которое люди будут смотреть на ваш код в Stack Overflow. 
Делая минимальный пример, вы облегчаете им задачу. Вы также будете учиться в процессе. 

Также важно, когда вы отправляете свой вопрос в Stack Overflow, **поместите свой код [во фрагмент](https://stackoverflow.blog/2014/09/16/introducing-runnable-javascript-css-and-html-code-snippets/).**
Конечно, вы можете использовать JSFiddle, Codepen или аналогичный сайт для тестирования MCVE, но как только вы действительно отправите свой вопрос в Stack Overflow, 
вам потребуется поместить код для воспроизведения вашей проблемы **в сам вопрос**. 
Делая фрагмент, вы удовлетворяете это требование. 

Также обратите внимание, что все живые примеры на этом сайте должны работать как фрагменты. Просто скопируйте части HTML, CSS и JavaScript в соответствующие части 
[редактора фрагментов](https://stackoverflow.blog/2014/09/16/introducing-runnable-javascript-css-and-html-code-snippets/).
Просто не забудьте попытаться удалить части, не относящиеся к вашей проблеме, и постарайтесь сделать свой код минимально необходимым. 

Следуйте этим советам, и у вас будет гораздо больше шансов получить помощь по вашей проблеме.

## Используйте `MeshBasicMaterial`

Поскольку `MeshBasicMaterial` не использует источники света, это один из способов устранения причин, по которым что-то может не отображаться. 
Если ваши объекты отображаются с использованием `MeshBasicMaterial`, но не с какими-либо материалами, которые вы использовали, то вы знаете,
что проблема, скорее всего, связана с материалами или источниками света, а не с какой-либо другой частью кода. 

## Проверьте `near` и `far` настройки вашей камеры

`PerspectiveCamera` имеет ближние и дальние настройки, которые описаны в 
[статье о камерах](threejs-cameras.html). Убедитесь, что они установлены в соответствии с пространством, в котором находятся ваши объекты.
Возможно, даже просто *временно* установите для них что-то большое, например, `near` = 0,001 и `far` = 1000000.
Скорее всего, у вас возникнут проблемы с разрешением по глубине, но вы по крайней мере сможете увидеть ваши объекты, если они находятся перед камерой. 

## Проверьте вашу сцену перед камерой 

Иногда вещи не появляются, потому что они не перед камерой.Если ваша камера не управляема попробуйте добавить управление камерой,
как `OrbitControlle`r так что вы можете посмотреть вокруг и найти вашу сцену.  Или, попробовать кадрирование сцены, используя код, который транслируется в [этой статье](threejs-load-obj.html).
Этот код находит размер части сцены, а затем перемещает камеру и регулирует `near` и `far` настройки, чтобы сделать его видимым. Затем можно заглянуть в
отладчик или добавить некоторые в `console.log` сообщения для печати размера и центра сцены.

## Поставь что-нибудь перед сценой камеры

Это просто еще один способ сказать, если все остальное терпит неудачу начнем с того, что работает, а потом потихоньку будем добавлять код обратно. 
Если вы получаете пустой экран, то попробуйте поместить что-то прямо перед камерой. Сделать сферу или поле, дать ему простой материал,
как `MeshBasicMaterial` и убедитесь, что вы можете сделать это на экране. 
Затем начать добавлять код немного назад во времени и тестирования.
В конце концов вы либо найдёте вашу ошибку, или вы найдете пути её решения. 

---

Это были несколько советов для отладки JavaScript. Давайте также [some tips for debugging GLSL](threejs-debugging-glsl.html).
