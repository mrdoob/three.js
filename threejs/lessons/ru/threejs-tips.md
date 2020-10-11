Title: Three.js Советы
Description: Небольшие вопросы, которые могут появится, используя three.js
TOC: #

Эта статья представляет собой набор небольших проблем, с которыми вы можете столкнуться при использовании three.js, которые кажутся слишком маленькими, чтобы иметь собственную статью. 

---

<a id="screenshot" data-toc="Делаем скриншот холста"></a>

# Делаем скриншот холста 

В браузере фактически есть 2 функции, которые сделают скриншот. 
Старая 
[`canvas.toDataURL`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL)
и новая улучшенная
[`canvas.toBlob`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)

Таким образом, вы думаете, что было бы легко сделать снимок экрана, просто добавив такой код, как 

```html
<canvas id="c"></canvas>
+<button id="screenshot" type="button">Save...</button>
```

```js
const elem = document.querySelector('#screenshot');
elem.addEventListener('click', () => {
  canvas.toBlob((blob) => {
    saveBlob(blob, `screencapture-${canvas.width}x${canvas.height}.png`);
  });
});

const saveBlob = (function() {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  return function saveData(blob, fileName) {
     const url = window.URL.createObjectURL(blob);
     a.href = url;
     a.download = fileName;
     a.click();
  };
}());
```

Вот пример из [статьи об отзывчивости](threejs-responsive.html)
с добавленным выше кодом и некоторым CSS для размещения кнопки 

{{{example url="../threejs-tips-screenshot-bad.html"}}}

Когда я попробовал это, я получил этот скриншот 

<div class="threejs_center"><img src="resources/images/screencapture-413x313.png"></div>

Да, это просто черное изображение. 

Возможно, это сработало для вас в зависимости от вашего браузера / ОС, но в целом это вряд ли сработает. 

Проблема заключается в том, что по соображениям производительности и совместимости
браузер по умолчанию очищает буфер рисования WebGL-холста после его отрисовки. 


Решение состоит в том, чтобы вызвать ваш код рендеринга непосредственно перед захватом. 

В нашем коде нам нужно настроить несколько вещей. Сначала давайте выделим код рендеринга. 


```js
+const state = {
+  time: 0,
+};

-function render(time) {
-  time *= 0.001;
+function render() {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
-    const rot = time * speed;
+    const rot = state.time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  renderer.render(scene, camera);

-  requestAnimationFrame(render);
}

+function animate(time) {
+  state.time = time * 0.001;
+
+  render();
+
+  requestAnimationFrame(animate);
+}
+requestAnimationFrame(animate);
```

Теперь этот `render` касается только фактического рендеринга, мы можем вызвать его непосредственно перед захватом холста. 

```js
const elem = document.querySelector('#screenshot');
elem.addEventListener('click', () => {
+  render();
  canvas.toBlob((blob) => {
    saveBlob(blob, `screencapture-${canvas.width}x${canvas.height}.png`);
  });
});
```

И теперь это должно работать. 

{{{example url="../threejs-tips-screenshot-good.html" }}}

Для другого решения см. Следующий пункт. 


---

<a id="preservedrawingbuffer" data-toc="Предотвращение очистки холста "></a>

# Предотвращение очистки холста 

Допустим, вы хотели, чтобы пользователь рисовал анимированный объект. 
Вам нужно передать `preserveDrawingBuffer: true` при создании  `WebGLRenderer`. 
Это мешает браузеру очистить холст. Вы также должны сказать three.js не очищать холст. 

```js
const canvas = document.querySelector('#c');
-const renderer = new THREE.WebGLRenderer({canvas});
+const renderer = new THREE.WebGLRenderer({
+  canvas,
+  preserveDrawingBuffer: true,
+  alpha: true,
+});
+renderer.autoClearColor = false;
```

{{{example url="../threejs-tips-preservedrawingbuffer.html" }}}

Обратите внимание, что если вы серьезно относитесь к созданию программы для рисования, 
это не будет решением, так как браузер будет очищать холст каждый раз, когда мы меняем его разрешение. 
Мы меняем разрешение в зависимости от размера дисплея. Размер дисплея изменяется при изменении размера окна. 
Это включает в себя, когда пользователь загружает файл, даже в другой вкладке, и браузер добавляет строку состояния. 
Это также включает в себя, когда пользователь поворачивает свой телефон и браузер переключается с портретного на альбомный. 

Если вы действительно хотите создать программу для рисования, вы должны . 
[визуализировать текстуру, используя цель визуализации](threejs-rendertargets.html).

---

<a id="tabindex" data-toc="Ввод с клавиатуры"></a>

# Ввод с клавиатуры

В этих уроках мы часто прикрепляли слушателей событий `canvas`.
Хотя многие события работают, по умолчанию не работают события клавиатуры. 

Чтобы получить события клавиатуры, установите для холста [`tabindex`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/tabIndex)
 значение 0 или более. Например.

```html
<canvas tabindex="0"></canvas>
```

Это в конечном итоге вызывает новую проблему, хотя. Все, что имеет установленный `tabindex` будет выделено, когда оно будет в фокусе. 
Чтобы исправить это, установите фокус CSS `outline:none`.  


```css
canvas:focus {
  outline:none;
}
```

Для демонстрации здесь представлены 3 холста 

```html
<canvas id="c1"></canvas>
<canvas id="c2" tabindex="0"></canvas>
<canvas id="c3" tabindex="1"></canvas>
```

и немного CSS только для последнего холста 

```css
#c3:focus {
    outline: none;
}
```

Давайте прикрепим к ним всех слушателей событий 

```js
document.querySelectorAll('canvas').forEach((canvas) => {
  const ctx = canvas.getContext('2d');

  function draw(str) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, canvas.width / 2, canvas.height / 2);
  }
  draw(canvas.id);

  canvas.addEventListener('focus', () => {
    draw('has focus press a key');
  });

  canvas.addEventListener('blur', () => {
    draw('lost focus');
  });

  canvas.addEventListener('keydown', (e) => {
    draw(`keyCode: ${e.keyCode}`);
  });
});
```

Обратите внимание, что вы не можете получить первый холст, 
чтобы принять ввод с клавиатуры. Второе полотно вы можете, 
но оно подсвечивается. На третьем холсте применяются оба решения. 


{{{example url="../threejs-tips-tabindex.html"}}}

---

<a id="transparent-canvas" data-toc="Делаем холст прозрачным "></a>
 
# Делаем холст прозрачным 

По умолчанию THREE.js делает холст непрозрачным. Если вы хотите, чтобы холст был прозрачным,
передайте [`alpha:true`](WebGLRenderer.alpha) при создании `WebGLRenderer`

```js
const canvas = document.querySelector('#c');
-const renderer = new THREE.WebGLRenderer({canvas});
+const renderer = new THREE.WebGLRenderer({
+  canvas,
+  alpha: true,
+});
```

Вы, вероятно, также хотите сказать, что ваши результаты не используют предварительно умноженную альфа 

```js
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
+  premultipliedAlpha: false,
});
```

Three.js по умолчанию использует холст с использованием 
[`premultipliedAlpha: true`](WebGLRenderer.premultipliedAlpha) но по умолчанию используется для материалов, которые выводят 
[`premultipliedAlpha: false`](Material.premultipliedAlpha).

Если вы хотите лучше понять, когда и когда не следует использовать предварительно умноженную альфу, 
 [ вот хорошая статья об этом](https://developer.nvidia.com/content/alpha-blending-pre-or-not-pre).

В любом случае давайте настроим простой пример с прозрачным холстом. 

Мы применили настройки выше к примеру из [статьи об отзывчивости](threejs-responsive.html).
Давайте также сделаем материалы более прозрачными

```js
function makeInstance(geometry, color, x) {
-  const material = new THREE.MeshPhongMaterial({color});
+  const material = new THREE.MeshPhongMaterial({
+    color,
+    opacity: 0.5,
+  });

...

```

И давайте добавим немного HTML-контента 

```html
<body>
  <canvas id="c"></canvas>
+  <div id="content">
+    <div>
+      <h1>Cubes-R-Us!</h1>
+      <p>We make the best cubes!</p>
+    </div>
+  </div>
</body>
```

а также немного CSS, чтобы поставить холст впереди 

```css
body {
    margin: 0;
}
#c {
    width: 100%;
    height: 100%;
    display: block;
+    position: fixed;
+    left: 0;
+    top: 0;
+    z-index: 2;
+    pointer-events: none;
}
+#content {
+  font-size: 7vw;
+  font-family: sans-serif;
+  text-align: center;
+  width: 100%;
+  height: 100%;
+  display: flex;
+  justify-content: center;
+  align-items: center;
+}
```

обратите внимание, что  `pointer-events: none` делает холст невидимым для мыши и сенсорных событий, поэтому вы можете выделить текст под ним.

{{{example url="../threejs-tips-transparent-canvas.html" }}}

---

<a id="html-background" data-toc="Создание анимированного фона в three.js "></a>

# Создание анимированного фона в three.js 

Распространенный вопрос - как сделать анимацию three.js фоном веб-страницы. 

Есть 2 очевидных способа. 

* Установите у холста CSS `position` `fixed` как в 

```css
#c {
 position: fixed;
 left: 0;
 top: 0;
 ...
}
```

Вы можете в основном увидеть это точное решение на предыдущем примере. Просто установите `z-index` на -1, и кубы появятся за текстом. 


Небольшим недостатком этого решения является то, что ваш JavaScript должен интегрироваться со страницей,
и если у вас сложная страница, вам нужно убедиться, что ни один из JavaScript в вашей визуализации 
three.js не конфликтует с JavaScript, выполняющим другие действия на странице. 


* Используйте `iframe`

Это решение используется на 
[главной странице этого сайта ](/).

На вашей веб-странице просто вставьте iframe, например 

```html
<iframe id="background" src="threejs-responsive.html">
<div>
  Your content goes here.
</div>
```

Затем создайте стиль iframe, чтобы заполнить окно и оказаться в фоновом режиме, 
который в основном является тем же кодом, который мы использовали выше для холста, 
за исключением того, что нам также нужно установить значение none, поскольку
у iframes по умолчанию есть граница. 


```
#background {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: -1;
    border: none;
    pointer-events: none;
}
```

{{{example url="../threejs-tips-html-background.html"}}}
