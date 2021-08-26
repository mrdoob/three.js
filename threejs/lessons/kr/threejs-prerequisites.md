Title: 먼저 알아야 할 것들
Description: 튜토리얼을 배우기 전에 알아야 할 기본 지식에 대해 알아봅니다
TOC: 먼저 알아야 할 것들

이 시리즈는 Three.js에 입문하는 초심자를 위한 튜토리얼입니다. 이 시리즈는
독자가 최소한 자바스크립트 기본 프로그래밍에 익숙하며, DOM이 무엇인지 설명할
수 있고, HTML과 자바스크립트로 DOM 요소를 조작할 수 있다는 전제 하에 작성하였습니다.
또한 `<script type="module">` 태그로 [ES2015 모듈](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/import)을
불러올 수 있으며, [CSS 셀렉터가 무엇인지](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Selectors)도
알고, ES5, ES2015, 약간의 ES2016도 알며, 브라우저가 자바스크립트를 이벤트와 콜백으로만
실행한다는 것도 알고, 클로저가 무엇인지까지 안다고 가정했죠.

이번 글에서는 시리즈를 읽는 데 필요한 이런 기본 전제에 대해 간단히 환기하고
넘어가겠습니다.

## ES2015 모듈

ES2015 모듈은 스크립트 안에서 `import` 키워드나, 인라인 `<script type="module">`
태그로 불러올 수 있습니다. 두 가지 예시를 동시에 써보죠.

```html
<script type="module">
import * as THREE from './resources/threejs/r131/build/three.module.js';

...

</script>
```

모듈의 경로는 반드시 상대 경로나 절대 경로여야 합니다. `<img>`, `<a>` 태그, CSS 경로와
달리 여기서 상대 경로란 `./`이나 `../`로 시작하는 경로를 말합니다.

더 자세한 것은 [이 글](threejs-fundamentals.html)의 마지막 부분을 참고하세요.

## `document.querySelector`와 `document.querySelectorAll`

요소를 선택할 때는 `document.querySelector`나 `document.querySelectorAll`을
사용하면 됩니다. 첫 번째는 CSS 셀렉터와 일치하는 첫 번째 요소를 반환하고, 두 번째는
CSS 셀렉터와 일치하는 모든 요소를 반환하죠.

## `onbody`를 쓰지 마세요

옛날에 개발된 많은 페이지가 body 태그의 onload 속성을 사용합니다.

    <body onload="somefunction()">

이런 스타일은 더 이상 권장하지 않습니다. script 태그를 페이지의 끝에 삽입하세요.

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

또는 [`defer` 속성을 사용](https://developer.mozilla.org/ko/docs/Web/HTML/Element/script)하는
것이 좋습니다.

## 클로저(closure)란?

```js
function a(v) {
  const foo = v;
  return function() {
     return foo;
  };
}

const f = a(123);
const g = a(456);
console.log(f());  // 123 출력
console.log(g());  // 456 출력
```

위 예제에서 함수 `a`는 매번 호출할 때마다 새로운 함수를 반환합니다. 이는 상수 `foo`에
대한 *클로저*이죠. 자세한 건 [여기](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Closures)를
참고하기 바랍니다.

## `this` 이해하기

`this`는 마법이 아닙니다. `this`는 다른 인자들처럼 자동으로 함수에 넘겨지는 일종의 변수이죠.
간단히 함수를 직접 호출하는 경우를 예로 들어보겠습니다.

    somefunction(a, b, c);

여기서 `this`는 `null`입니다(엄격(strict) 모드나 모듈 안에서). 반면 `.` 연산자를 붙여 메서드로
호출하는 경우,

    someobject.somefunction(a, b, c);

`this`는 `someobject`로 지정될 겁니다.

많은 사람들이 헷갈리는 부분은 메서드를 콜백 처리할 때이죠.

     const callback = someobject.somefunction;
     loader.load(callback);

자바스크립트에 능숙하지 않은 사람이 보기에는 문제가 없을지 모르나, `loader.load`는 콜백 함수를
`.` 연산자를 써서 호출하지 않으므로-loader가 별도로 `this`를 지정하지 않는 한-`this`는 null이
됩니다. 콜백 함수를 호출할 때 `this`를 `someobject`로 지정하려면 명시적으로 `this`를 종속시켜야(binding)
합니다.

     const callback = someobject.somefunction.bind(someobject);
     loader.load(callback);

`this`를 이해하기 어렵다면, [*this*에 관한 문서](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/this)를
한 번 읽어보길 권합니다.

## ES5/ES2015/ES2016

### `var` 대신 `const`와 `let` 사용하기

`const`와 `let`을 쓸 수 있는 환경에서 `var`를 써야할 이유는 *전혀* 없고, 지금 `var`를 사용하는
것은 실력 향상에 전혀 도움이 되지 않습니다. 변수를 재할당할 일이 없을 경우 `const`를 사용하세요.
변수를 재할당하는 것은 흔치 않은 일이니, 주로 `const`를 더 많이 쓰게 될 겁니다. 변수의 값을 바꿔야
한다면 `let`을 사용하세요. 이런 습관을 들이면 버그를 훨씬 더 많이 줄일 수 있습니다.

### `for(elem in collection)` 대신 `for(elem of collection)` 사용하기

`for of`는 `for in`의 문제를 해결하기 위해 새로 추가된 문법입니다.

예를 들어 객체의 키/값 쌍을 반복문으로 돌릴 경우 다음과 같이 쓸 수 있죠.

```js
for (const [key, value] of Object.entries(someObject)) {
  console.log(key, value);
}
```

### `forEach`, `map`, `filter` 등을 적절히 활용하기

ES5에서 배열에 [`forEach`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach),
[`map`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
메서드 등이 추가되었고, ES2015에서는 [`filter`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
메서드 등 여러 유용한 메서드가 추가되었습니다.

### 구조분해할당(destructuring) 사용하기

`const dims = { width: 300, height: 150 }`. 이런 객체가 있다고 해보죠. 객체의
각 속성을 별도의 변수에 할당하고자 합니다.

기존 방법

```js
const width = dims.width;
const height = dims.height;
```

새로운 방법

```js
const { width, height } = dims;
```

구조분해할당은 배열에도 적용할 수 있습니다. `const position = [1, 2, 3, 4]`.
이런 배열이 있다고 해보죠.

기존 방법

```js
const x = position[2];
const y = position[1];
```

새로운 방법

```js
const [ , y, x ] = position;
```

또한 매개변수에도 구조분해할당을 적용할 수 있습니다.

```js
const dims = { width: 300, height: 150 };
const position = [1, 2, 3, 4];

function distFromOrig([x, y]) {
  return Math.sqrt(x * x + y * y);
}

const dist = distFromOrig(position);  // dist = 2.236...

function area({ width, height }) {
  return width * height;
}
const a = area(dims);  // a = 45000
```

### 객체 선언 시 축약 문법 사용

기존 방법

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

새로운 방법

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

### 전개 연산자 `...` 사용하기

전개 연산자는 매우 유용합니다. 예를 들어보죠.

```js
 function log(className, ...args) {
   const elem = document.createElement('div');
   elem.className = className;
   elem.textContent = args.join(' ');
   document.body.appendChild(elem);
 }
```

또 배열을 인자로 넘겨줄 때도 유용합니다.

```js
const position = [1, 2, 3];
somemesh.position.set(...position);
```

배열을 얕은 복사할 때 사용할 수도 있고

```js
const copiedPositionArray = [...position];
copiedPositionArray.push(4); // [1,2,3,4] 
console.log(position); // [1,2,3] 기존 배열은 영향을 받지 않음
```

객체를 합칠 때도 사용할 수 있죠.

```
const a = { abc: 123 };
const b = { def: 456 };
const c = { ...a, ...b };  // c = { abc: 123, def: 456 }
```

### `class` 사용하기

ES5 이하의 문법으로 클래스 스타일의 객체를 만드는 방법은 다른 개발자들에게 낯선 요소
중 하나였습니다. ES2015부터는 C++/C#/Java 등 다른 객체지향 언어처럼 [`class` 키워드를 사용](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Classes)해
클래스를 생성할 수 있습니다.

### getter와 setter

모던 프로그래밍 언어에는 대부분
[getter](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Functions/get)와
[setter](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Functions/set)가
있습니다. ES2015의 `class` 문법을 사용하면 훨씬 쉽게 getter와 setter를 설정할 수 있죠.

### 화살표 함수(arrow function) 활용하기

화살표 함수는 특히 콜백과 프로미스를 처리할 때 유용합니다.

```js
loader.load((texture) => {
  // 불러온 텍스처를 사용
});
```

화살표 함수는 `this` 값을 지정하지 않습니다.

(※ 원문에서는 "Arrow functions bind `this`.(화살표 함수는 `this`를 바인딩한다.)"라고 적었지만,
표준에 기재된 바 화살표 함수는 익명 함수로 `this`, `arguments`, `super` 또는 `new.target`을 지정하지
않습니다. 혼돈을 막기 위해 달리 번역하였으니 참고 바랍니다. 역주. 출처: [MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Functions/%EC%95%A0%EB%A1%9C%EC%9A%B0_%ED%8E%91%EC%85%98))

```js
const foo = (args) => {/* code */};
```

위 예제는 다음과 과 같죠.

```js
const foo = (function(args) {/* code */}).bind(this));
```

### 프로미스(Promise)와 async/await

프로미스는 비동기 처리를 도와줍니다. async/await는 프로미스를 좀 더 쉽게 쓰도록 도와주죠.

이 둘은 짧게 다루기 어려우므로 다른 글([프로미스](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Using_promises),
[async/await](https://developer.mozilla.org/ko/docs/Learn/JavaScript/Asynchronous/Async_await))을
참고하기 바랍니다.

### 템플릿 리터럴(Template Literals)

템플릿 리터럴은 따옴표 대신 백틱(backticks, 억음 부호)을 사용한 문자열입니다.

    const foo = `템플릿 리터럴 문자열입니다`;

템플릿 리터럴은 문자열에 2가지 기능을 더한 것인데요. 하나는 여러 줄에 걸쳐 쓸 수
있는 기능입니다.

```js
const foo = `템플릿
리터럴
문자열입니다`;
const bar = "템플릿\n리터럴\n문자열입니다";
```

예제의 `foo`와 `bar`는 같은 문자열이죠.

다른 하나는 문자열 중간에 자바스크립트 표현식을 끼워넣을 수 있는 기능으로,
`${ 자바스크립트 표현식 }`처럼 사용합니다.

```js
const r = 192;
const g = 255;
const b = 64;
const rgbCSSColor = `rgb(${r},${g},${b})`;
```

함수를 실행하거나

```js
const color = [ 192, 255, 64 ];
const rgbCSSColor = `rgb(${ color.join(',') })`;
```

계산식을 넣을 수도 있습니다.

```js
const aWidth = 10;
const bWidth = 20;
someElement.style.width = `${ aWidth + bWidth }px`;
```

# 자바스크립트 네이밍 컨벤션(coding convection, 코딩 스타일 규약) 지키기

코드를 작성하는 것은 여러분의 자유지만, 웬만하면 한 가지 규약은 지키는 것이 좋습니다.
자바스크립트의 변수, 메서드, 함수 이름은 전부 lowerCamelCase이죠. 생성자나, 클래스의
이름은 UpperCamelCase입니다. 이 규약만 따른다면 자바스크립트의 세계에서 크게 문제될
것은 없죠. 대부분의 [린터(linter)](https://eslint.org)나 린팅 프로그램이 위 네이밍
컨벤션을 지키지 않는 코드에 대해 에러나 경고를 던집니다.

(※ 문서에 따라 lower camel case는 camelCase, upper camel case는 PascalCase로 부르기도
합니다. 역주.)

```js
const v = new vector(); // 모든 클래스가 대문자로 시작할 경우 에러
const v = Vector();     // 모든 함수가 소문자로 시작할 경우 에러
```

# Visual Studio Code 사용해보기

이 세상에는 훌륭한 에디터가 많습니다. 자신이 좋아하는 에디터를 쓰는 것이 가장
좋죠. 하지만 아직 마음에 드는 자바스크립트 에디터가 없다면 [Visual Studio Code](https://code.visualstudio.com/)를
써보세요! 에디터를 설치하고 [eslint를 설정](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
하면-환경에 따라 시간이 좀 걸릴지 모르나-무수한 자바스크립트 코드의 버그를
잡는 데 도움이 될 겁니다.

예를 들어 [`no-undef` 규칙](https://eslint.org/docs/rules/no-undef)을 활성화하면
VSCode는 ESLint를 통해 변수의 값이 지정되지 않은 경우 경고를 출력할 겁니다.

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-not-defined.png"></div>

위 예시에서 작성자는 `doTheThing` 함수를 `doThing`로 잘못 적었습니다. 그러자 `doThing`
아래에 밑줄이 생겼죠. 그리고 그 위에 커서를 올리면 해당 함수를 선언하지 않았다고
알려줍니다. 미리 에러를 하나 줄인 셈이죠.

`THREE`를 쓸 때도 경고가 나타날 것이므로 코드 상단에 `/* global THREE */`를 선언해
`THREE`가 미리 선언되었음을 알려줄 수 있습니다.

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-not-a-constructor.png"></div>

위 이미지에서 ESLint는 `대문자로 시작하는 이름`은 생성자이니 `new` 키워드를 사용하라고
알려줍니다. [`new-cap` 규칙](https://eslint.org/docs/rules/new-cap) 덕에 에러를 하나
더 줄였네요.

이 외에도 [설정할 수 있는 규칙](https://eslint.org/docs/rules/)이 거의 100개 정도 더
있습니다. 아까 `var` 대신 `const`와 `let`을 쓰라고 했었죠.

아래 이미지에서 작성자는 `var`를 썼는데, `let`이나 `const`를 쓰라는 경고를 받았습니다.

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-var.png"></div>

또 `let`을 쓰고 재할당을 하지 않자 `const`를 쓰라고 제안합니다.

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-let.png"></div>

물론 `var`가 더 좋다고 생각하면 이 규칙을 꺼버리면 됩니다. 이 규칙을 쓰는 건 제가 성능과
버그 예방 면에서 `var`보다 `let`과 `const`를 쓰는 걸 더 좋아하기 때문이죠.

일부 파일이나 코드의 일부분에서 규칙을 덮어 씌워야 할 경우, [주석을 추가해 규칙을 끌 수
있습니다](https://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments).

# 구형 브라우저를 지원해야 한다면 트랜스파일러를 쓰세요

대부분의 모던 브라우저가 자동 업데이트 기능을 사용하기에 최신 문법을 사용해 생산성과
버그 예방 두 마리의 토끼를 동시에 잡을 수 있습니다. 만약 꼭 구형 브라우저를 지원해야
한다면 [ES5/ES2015 등의 최신 문법을 구형 문법으로 변환시켜주는 트랜스파일러](https://babeljs.io)를
사용하길 권장합니다.
