Title: Материалы Three.js
Description: Материалы в Three.js
TOC: Материалы

Эта статья является частью серии статей о three.js. 
Первая была [об основах](threejs-fundamentals.html).
Если вы её еще не читали, советую вам сделать это.

Three.js предоставляет несколько типов материалов. Они определяют, 
как объекты будут появляться на сцене. Какие материалы вы используете, 
зависит от того, чего вы пытаетесь достичь.

Есть 2 способа установить большинство свойств материала. 
Один во время создания, который мы видели раньше.

```js
const material = new THREE.MeshPhongMaterial({
  color: 0xFF0000,    // red (можно также использовать css цвета)
  flatShading: true,
});
```

Другой после создания

```js
const material = new THREE.MeshPhongMaterial();
material.color.setHSL(0, 1, .5);  // red
material.flatShading = true;
```

обратите внимание, что свойства типа `THREE.Color` могут быть установлены несколькими способами.

```js
material.color.set(0x00FFFF);    // так же, как в CSS #RRGGBB
material.color.set(cssString);   // любой CSS цвет, например 'purple', '#F32', 
                                 // 'rgb(255, 127, 64)',
                                 // 'hsl(180, 50%, 25%)'
material.color.set(someColor)    // или другой THREE.Color
material.color.setHSL(h, s, l)   // где h, s, и l от 0 до 1
material.color.setRGB(r, g, b)   // где r, g, и b от 0 до 1                      
```

И во время создания вы можете передать либо шестнадцатеричное число либо строку CSS

```js
const m1 = new THREE.MeshBasicMaterial({color: 0xFF0000});         // red
const m2 = new THREE.MeshBasicMaterial({color: 'red'});            // red
const m3 = new THREE.MeshBasicMaterial({color: '#F00'});           // red
const m4 = new THREE.MeshBasicMaterial({color: 'rgb(255,0,0)'});   // red
const m5 = new THREE.MeshBasicMaterial({color: 'hsl(0,100%,50%)'); // red
```

прим. переводчика:
Блик - световое пятно на ярко освещённой выпуклой или плоской глянцевой поверхности.
[Зеркальное отражение](http://compgraph.tpu.ru/mir_reflection.htm) я часто буду называть бликом, 
хотя это скорее частный случай.

Итак, давайте рассмотрим набор материалов Three.js.

`MeshBasicMaterial` не зависит от света. 
`MeshLambertMaterial` вычисляет освещение только в вершинах vs, `MeshPhongMaterial` который 
вычисляет освещение в каждом пикселе и `MeshPhongMaterial` также поддерживающий 
[блики](https://en.wikipedia.org/wiki/Specular_highlight).

<div class="spread">
  <div>
    <div data-diagram="MeshBasicMaterial" ></div>
    <div class="code">Basic</div>
  </div>
  <div>
    <div data-diagram="MeshLambertMaterial" ></div>
    <div class="code">Lambert</div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterial" ></div>
    <div class="code">Phong</div>
  </div>
</div>
<div class="spread">
  <div>
    <div data-diagram="MeshBasicMaterialLowPoly" ></div>
  </div>
  <div>
    <div data-diagram="MeshLambertMaterialLowPoly" ></div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialLowPoly" ></div>
  </div>
</div>
<div class="threejs_center code">низкополигональные модели с теми же материалами</div>

`shininess` устанавливает `MeshPhongMaterial` определяя *блеск* от бликов. Значение по умолчанию - 30.

<div class="spread">
  <div>
    <div data-diagram="MeshPhongMaterialShininess0" ></div>
    <div class="code">shininess: 0</div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialShininess30" ></div>
    <div class="code">shininess: 30</div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialShininess150" ></div>
    <div class="code">shininess: 150</div>
  </div>
</div>

Обратите внимание, что установка светимости (`emissive` свойства) для цвета
`MeshLambertMaterial` или `MeshPhongMaterial` и установка `color` в черный 
(и `shininess` в 0 для Фонга) в конечном итоге будет выглядеть как `MeshBasicMaterial`.

<div class="spread">
  <div>
    <div data-diagram="MeshBasicMaterialCompare" ></div>
    <div class="code">
      <div>Basic</div>
      <div>color: 'purple'</div>
    </div>
  </div>
  <div>
    <div data-diagram="MeshLambertMaterialCompare" ></div>
    <div class="code">
      <div>Lambert</div>
      <div>color: 'black'</div>
      <div>emissive: 'purple'</div>
    </div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialCompare" ></div>
    <div class="code">
      <div>Phong</div>
      <div>color: 'black'</div>
      <div>emissive: 'purple'</div>
      <div>shininess: 0</div>
    </div>
  </div>
</div>

Зачем нам все 3, когда `MeshPhongMaterial` может делать то же самое, что `MeshBasicMaterial`
и `MeshLambertMaterial`? Причина в том, что более сложный материал требует больше ресурсов 
графического процессора. На более медленном GPU, например, на мобильном телефоне, возможно, 
вы захотите уменьшить мощность графического процессора, необходимую для рисования вашей сцены, 
используя один из менее сложных материалов. Из этого также следует, что если вам не нужны 
дополнительные функции, используйте самый простой материал. Если вам не нужно освещение и 
блики, используйте `MeshBasicMaterial`.

`MeshToonMaterial` похож на `MeshPhongMaterial` с одной большой разницей. 
Вместо плавного затенения он использует карту градиента
(текстуру размером X на 1) для выбора оттенка. По умолчанию используется карта градиента, 
яркость которой составляет 70% для первых 70% и 100% после, но вы можете предоставить 
свою собственную карту градиента. Это в конечном итоге дает 2 тона, которые 
выглядят как мультфильм.

<div class="spread">
  <div data-diagram="MeshToonMaterial"></div>
</div>

Далее идут 2 *физически обоснованных* материала. Physically Based
Rendering часто сокращается как PBR.

Приведенные выше материалы используют простую математику для создания материалов, 
которые выглядят трехмерными, но это не то, что происходит в реальности. 
2 PBR материала используют гораздо более сложную математику, чтобы приблизиться 
к тому, что на самом деле происходит в реальном мире.

Первый - `MeshStandardMaterial`. Самая большая разница с
`MeshPhongMaterial` и `MeshStandardMaterial` - использование различных параметров.
У `MeshPhongMaterial` была `shininess` настройка. `MeshStandardMaterial` имеет 2 
настройки `roughness` и `metalness`.

По простому [шероховатость](https://en.wikipedia.org/wiki/Surface_roughness) 
[`roughness`](MeshStandardMaterial.roughness) это противоположность 
`shininess`. Что-то с высокой шероховатостью, например, баскетбольный мяч не имеет 
жестких отражений, а что-то не грубое, как бильярдный шар, очень блестящий. 
Шероховатость задается в интервале от 0 до 1.

Другая настройка - [`metalness`](MeshStandardMaterial.metalness). Она говорит о том, 
насколько металлический материал. Металлы ведут себя иначе, чем неметаллы, 
и поэтому этот параметр изменяется от 0 для не металла вообще, до единицы - 100% металла.

Вот краткий пример `MeshStandardMaterial` с `roughness` от 0 до 1 
поперёк и `metalness` от 0 до 1 вниз.

<div data-diagram="MeshStandardMaterial" style="min-height: 400px"></div>

`MeshPhysicalMaterial` же самое, что и `MeshStandardMaterial` но он добавляет `clearcoat` 
параметр, который идет от 0 до 1 для определения степени применения слоя 
глянцевого покрытия, и  `clearCoatRoughness` параметр, который указывает, 
насколько шероховатым является слой глянца.

Вот та же сетка `roughness` по `metalness` как и до этого, но с 
`clearcoat` и `clearCoatRoughness`.

<div data-diagram="MeshPhysicalMaterial" style="min-height: 400px"></div>

Различные стандартные материалы от самых быстрых к самым медленным: 
`MeshBasicMaterial` ➡ `MeshLambertMaterial` ➡ `MeshPhongMaterial` ➡ 
`MeshStandardMaterial` ➡ `MeshPhysicalMaterial`. Более медленные материалы 
могут создавать более реалистичные сцены, но вам может потребоваться писать 
дополнительный код, чтобы использовать более быстрые материалы на маломощных 
или мобильных устройствах.

Есть 3 материала, которые имеют специальное использование. `ShadowMaterial`
используется для получения данных, созданных из теней. Мы еще не изучали тени. 
Когда мы это сделаем, мы будем использовать этот материал, чтобы оценить, 
что происходит за кулисами.

`MeshDepthMaterial` отрисовывает глубину каждого пикселя, где пиксели при 
отрицательном [`near`](PerspectiveCamera.near) камеры равны 0 
и при отрицательном [`far`](PerspectiveCamera.far) равны 1. 
Некоторые специальные эффекты могут использовать эти данные , которые мы получим в в другое время.

<div class="spread">
  <div>
    <div data-diagram="MeshDepthMaterial"></div>
  </div>
</div>

The `MeshNormalMaterial` Покажет вам *нормали* геометрии. 
*Нормали* - это направление конкретного треугольника или грани пикселя.
`MeshNormalMaterial` рисует пространство просмотра нормалей (нормали относительно камеры).
<span class="color:red;">x - красный</span>,
<span class="color:green;">y - зеленый</span> и
<span class="color:blue;">z - синий</span>, поэтому грани, направленные вправо, 
будут красного цвета, «вверх» - будут зеленого цвета, а к экрану будут синие.

<div class="spread">
  <div>
    <div data-diagram="MeshNormalMaterial"></div>
  </div>
</div>

`ShaderMaterial` предназначен для изготовления нестандартных материалов 
с использованием шейдерной системы three.js. 
`RawShaderMaterial` предназначен для создания полностью пользовательских 
шейдеров без помощи three.js. Обе эти темы большие и будут рассмотрены позже.

Большинство материалов имеют множество настроек, определенных `Material`.
[Посмотрите документацию](Material) по ним, и давайте рассмотрим два 
наиболее часто используемых свойства.

[`flatShading`](Material.flatShading): 
выглядит ли объект граненным или гладким. По умолчанию = `false`.

<div class="spread">
  <div>
    <div data-diagram="smoothShading"></div>
    <div class="code">flatShading: false</div>
  </div>
  <div>
    <div data-diagram="flatShading"></div>
    <div class="code">flatShading: true</div>
  </div>
</div>

[`side`](Material.side): какие стороны треугольников показать. По умолчанию = `THREE.FrontSide`.
Другие варианты - `THREE.BackSide` и `THREE.DoubleSide` (с обеих сторон).
Большинство трехмерных объектов, нарисованных в three, вероятно, являются непрозрачными 
твердыми телами, поэтому не нужно рисовать задние стороны (стороны, 
обращенные внутрь твердого тела). Наиболее распространенная причина установки `side` 
- для плоскостей или других нетвердых объектов, где обычно видны задние стороны треугольников.

Вот 6 плоскостей с `THREE.FrontSide` и `THREE.DoubleSide`.

<div class="spread">
  <div>
    <div data-diagram="sideDefault" style="height: 250px;"></div>
    <div class="code">side: THREE.FrontSide</div>
  </div>
  <div>
    <div data-diagram="sideDouble" style="height: 250px;"></div>
    <div class="code">side: THREE.DoubleSide</div>
  </div>
</div>

С материалами действительно есть над чем поразмыслить, и нам еще многое 
предстоит сделать. Мы в основном игнорировали текстуры, 
которые открывают множество свойств. Прежде чем мы рассмотрим текстуры, 
мы должны сделать перерыв и обсудить
[настройку разрабочего окружения](threejs-setup.html)

<div class="threejs_bottombar">
<h3>material.needsUpdate</h3>
<p>
Эта тема редко затрагивает большинство приложений three.js, но для общей информированности...
Three.js применяет настройки материала, когда материал используется, где "используется" 
значит "что-то отрисовывается с использованием материала". Некоторые настройки материала применяются 
только один раз, так как их изменение требует много работы с three.js.
В этих случаях вам нужно указать <code>material.needsUpdate = true</code> чтобы
three.js применил ваши существенные изменения. Наиболее распространенные настройки, 
которые необходимо установить, <code>needsUpdate</code> если вы измените настройки 
после использования материала:
</p>
<ul>
  <li><code>flatShading</code></li>
  <li>добавление или удаление текстуры.
    <p>
    Смена текстуры - это нормально, но если вы хотите переключиться с использования 
    без текстуры на использование текстуры или с использования текстуры на 
    использование без текстуры, то вам нужно установить <code>needsUpdate = true</code>.
    </p>
    <p>В случае перехода от текстуры к "без текстуры" 
    часто просто лучше использовать белую текстуру 1x1 пикселей.</p>
  </li>
</ul>
<p>Как упоминалось выше, большинство приложений никогда не сталкиваются с этими проблемами. 
Большинство приложений не переключаются между 
<a 
    title="Цвет полигона рассчитывается по 1 точке на нем" 
    href="https://en.wikipedia.org/wiki/Shading#Flat_shading"
>
flat shaded
</a> и не flat shaded. 
 Большинство приложений либо используют текстуры либо сплошной цвет для одного и того же материала, 
 они редко переключаются с использования одного на использование другого.
</p>
</div>

<canvas id="c"></canvas>
<script type="module" src="../resources/threejs-materials.js"></script>


