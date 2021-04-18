Title: Three.js Необходимые условия
Description: Что вы должны знать, чтобы использовать этот сайт.
TOC: Необходимые условия

Эти статьи предназначены для того, чтобы помочь вам научиться использовать three.js. Они предполагают, что вы знаете, как программировать на JavaScript. 
Они предполагают, что вы знаете, что такое DOM, как писать HTML, а также создавать элементы DOM в JavaScript. 
Они предполагают, что вы знаете, как использовать
[es6 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) 
через импорт и тэги `<script type="module">`.
 Они предполагают, что вы знаете немного CSS и что вы знаете, что такое 
[CSS-селекторы](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Selectors). 
Они также предполагают, что вы знаете ES5, ES6 и, возможно, немного ES7. Они предполагают,
что вы знаете, что браузер запускает JavaScript только через события и обратные вызовы.
Они предполагают, что вы знаете, что такое закрытие. 

Вот несколько кратких обновлений и заметок

## es6 modules

Модули es6 можно загружать с помощью ключевого слова `import` в сценарии или встроенного тега `<script type="module">`. Вот пример обоих 

```html
<script type="module">
import * as THREE from './resources/threejs/r127/build/three.module.js';

...

</script>
```

Пути должны быть абсолютными или относительными. 
Относительные пути всегда начинаются с `./` или `../`, что отличается от других тегов, таких как `<img>` и `<a>` и ссылок css. 

Более подробная информация упоминается в нижней части [этой статьи](threejs-fundamentals.html).

## `document.querySelector` и `document.querySelectorAll`

Вы можете использовать `document.querySelector`, чтобы выбрать первый элемент, который соответствует селектору CSS. 
`document.querySelectorAll` возвращает все элементы, которые соответствуют селектору CSS. 

## Вам не нужен `onbody`

Многие используют страницы HTML как

    <body onload="somefunction()">

Этот стиль не рекомендуется. Разместите ваши сценарии внизу страницы. 

```html
<html>
  <head>
    ...
  </head>
  <body>
     ...
  </body>
  <script>
    // inline javascript
  </script>
</html>
```

или [используйте свойство `defer`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script).

## Знать, как работают замыкания

```js
function a(v) {
  const foo = v;
  return function() {
     return foo;
  };
}

const f = a(123);
const g = a(456);
console.log(f());  // prints 123
console.log(g());  // prints 456
```

В приведенном выше коде функция `a` создает новую функцию каждый раз, когда она вызывается. 
Эта функция закрывает переменную `foo`.Вот [больше информации](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures).

## Понимать как работает `this`

`this` не магия По сути, это переменная, которая автоматически передается функциям также, как аргумент передается функции.
Простое объяснение - когда вы вызываете функцию, например 

    somefunction(a, b, c);

`this` будет `null` (в строгом режиме или в модуле) как при вызове функции через оператор как при вызове функции через оператор  `.` как это

    someobject.somefunction(a, b, c);

`this` будет установлено для `someobject`.

Части, где люди путаются, это обратные вызовы. 

     const callback = someobject.somefunction;
     loader.load(callback);

не работает, как может ожидать кто-то неопытный, потому что когда `loader.load` вызывает обратный вызов, он не вызывает его с
`.` оператор, так что по умолчанию `this` будет null (если загрузчик явно не устанавливает его в что-то).
Если вы хотите, чтобы во время обратного вызова `this` был `someobject`, вам нужно сообщить об этом JavaScript, привязав его к функции. 

     const callback = someobject.somefunction.bind(someobject);
     loader.load(callback);

[*эта* статья может помочь объяснить `this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this).

## ES5/ES6/ES7 материал

### `var` устарела. Используйте `const` и/или `let`

Нет никакой причины использовать `var` **КОГДА-НИБУДЬ** и сейчас считается плохой практикой, чтобы использовать его вообще. 
Используйте `const`, если переменная никогда не будет переназначена, что происходит большую часть времени. Используйте `let` в тех случаях, когда значение изменяется. 
Это поможет избежать множества ошибок. 

### Используйте `for(elem of collection)` никогда `for(elem in collection)`

`for of` новое, `for in` устаревшее. `for in` имело проблемы, которые решаются `for of`

В качестве одного примера вы можете перебрать все пары ключ / значение объекта с 

```js
for (const [key, value] of Object.entries(someObject)) {
  console.log(key, value);
}
```

### Используйте `forEach`, `map`, и `filter`  где это полезно

Массивы добавили функции [`forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach), 
[`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), and 
[`filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) и довольно широко используются в современном JavaScript. 

### Используйте деструктуризацию 

Предположим, что объект `const dims = {width: 300, height: 150}`

старый код

     const width = dims.width;
     const height = dims.height;

новый код 

     const {width, height} = dims;

### Используйте сокращения объявления объекта

старый код

```js
 const width = 300;
 const height = 150;
 const obj = {
   width: width,
   height: height,
   area: function() {
     return this.width * this.height
   },
 };
```

новый код 

```js
 const width = 300;
 const height = 150;
 const obj = {
   width,
   height,
   area() {
     return this.width * this.height;
   },
 };
```

### Используйте оператор распространения `...`

У оператора распространения есть масса применений. пример

```js
 function log(className, ...args) {
   const elem = document.createElement('div');
   elem.className = className;
   elem.textContent = [...args].join(' ');
   document.body.appendChild(elem);
 }
```

Другой пример

```js
const position = [1, 2, 3];
somemesh.position.set(...position);
```

### Используйте `class`

Синтаксис создания классов, подобных объектам до ES5, был незнаком большинству программистов. Начиная с ES5, теперь вы можете [использовать ключевое слово `class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
которое ближе к стилю C ++ / C # / Java.

### Понимать Getters и Setters 

[Getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) и
[setters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set)
распространены в большинстве современных языков. Синтаксис класса ES5 делает их намного проще, чем до ES5. 

### При необходимости используйте стрелочные функции

Это особенно полезно с обратными вызовами и обещаниями.

```js
loader.load((texture) => {
  // use texture
});
```

Стрелочные функции связывают `this`. 

```js
const foo = (args) => {/* code */};
```

это короткий путь для

```js
const foo = (function(args) {/* code */}).bind(this));
```

### Обещания, а также async / await 

Обещания помогут с асинхронным кодом. Async/await поможет использовать обещания.

Это слишком большая тема для обсуждения, но вы можете [прочитать об обещаниях здесь ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
и [async / await здесь](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await).

### Использовать литералы шаблонов 

Шаблонные литералы - это строки, в которых используются кавычки вместо кавычек. 

    const foo = `this is a template literal`;

Шаблонные литералы имеют в основном 2 функции. Во-первых, они могут быть многолинейными 

```js
const foo = `this
is
a
template
literal`;
const bar = "this\nis\na\ntemplate\nliteral";
```

`foo` и `bar` выше одинаковы.

Другое - вы можете выйти из строкового режима и вставить фрагменты JavaScript, используя `${javascript-expression}`. Это часть шаблона. Пример: 


```js
const r = 192;
const g = 255;
const b = 64;
const rgbCSSColor = `rgb(${r},${g},${b})`;
```

или

```js
const color = [192, 255, 64];
const rgbCSSColor = `rgb(${color.join(',')})`;
```

или

```js
const aWidth = 10;
const bWidth = 20;
someElement.style.width = `${aWidth + bWidth}px`;
```

# Изучите правила кодирования JavaScript. 

Хотя вы можете форматировать код любым способом, который вы выбрали, существует по крайней мере одно соглашение, о котором вам следует знать. 
Переменные, имена функций, имена методов в JavaScript - это lowerCasedCamelCase. Конструкторы, имена классов которых CapitalizedCamelCase. 
Если вы будете следовать этому правилу, ваш код будет соответствовать большинству других JavaScript. Многие [linters](https://eslint.org), 
программы, которые проверяют очевидные ошибки в вашем коде, будут указывать на ошибки, 
если вы используете неправильный регистр, поскольку, следуя приведенному выше соглашению, они знают, что они неправильные. 

```js
const v = new vector(); // clearly an error if all classes start with a capital letter
const v = Vector();     // clearly an error if all functions start with a lowercase latter. 
```

# Рассмотрите возможность использования Visual Studio Code

Конечно, используйте любой редактор, который вам нужен, но если вы еще не пробовали его, 
рассмотрите возможность использования [Visual Studio Code](https://code.visualstudio.com/) для JavaScript и после его установки
[настройте eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).
Установка может занять несколько минут, но это поможет вам найти ошибки в вашем JavaScript. 

Несколько примеров 

Если вы включите [правило no-undef](https://eslint.org/docs/rules/no-undef) то VSCode через ESLint предупредит вас о многих неопределенных переменных. 

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-not-defined.png"></div>

Вы можете видеть, что я неправильно написал `doTheThing` как `doThing`.
Под `doThing` есть красная "закорючка", и подсказка над ним говорит мне, что оно не определено. Одной ошибки удалось избежать. 

Вы получите предупреждения, используя THREE, поэтому добавьте `/* global THREE */` вверху ваших файлов JavaScript, чтобы сообщить eslint, что THREE существует. 

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-not-a-constructor.png"></div>

Вы можете видеть, что eslint знает правило, что `UpperCaseNames` являются конструкторами, и поэтому вы должны использовать `new`. 
Еще одну ошибку поймали и избежали. Это [правило
`new-cap`](https://eslint.org/docs/rules/new-cap).

Есть [100 правил, которые вы можете включить или выключить или настроить](https://eslint.org/docs/rules/). 
Например, выше я упомянул, что вы должны использовать `const` и пропустить `var`.

Здесь я использовал `var`, и он предупредил меня, что я должен использовать `let` или `const`
<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-var.png"></div>

Здесь я использовал `let`, но он увидел, что я никогда не меняю значение, поэтому предложил использовать `const`. 

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-let.png"></div>

Конечно, если вы предпочитаете продолжать использовать `var`, вы можете просто отключить это правило. 
Как я уже говорил выше, я предпочитаю использовать `const` и `let` вместо `var`, так как они работают лучше и предотвращают ошибки. 

В тех случаях, когда вам действительно необходимо переопределить правило [вы можете добавить комментарии, чтобы отключить их](https://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments)
для отдельной строки или раздела кода.

# Если вам действительно нужно поддерживать устаревшие браузеры, используйте transpiler 

Большинство современных браузеров обновляются автоматически, поэтому использование всех этих функций поможет вам повысить производительность и избежать ошибок.
Тем не менее, если вы находитесь в проекте, который обязательно должен поддерживать старые браузеры, есть 
[инструменты, которые возьмут ваш код ES5 / ES6 / ES7 и перенесут код обратно в предварительно ES5 Javascript.](https://babeljs.io).
